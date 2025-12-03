import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyEmailOTPRequest {
  email: string;
  otp: string;
  fullName?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otp, fullName }: VerifyEmailOTPRequest = await req.json();

    if (!email || !otp) {
      return new Response(
        JSON.stringify({ error: "Email and OTP are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const normalizedEmail = email.toLowerCase();

    // Verify OTP
    const { data: otpRecord, error: otpError } = await supabase
      .from("otp_verifications")
      .select("*")
      .eq("email", normalizedEmail)
      .eq("otp", otp)
      .eq("verified", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (otpError || !otpRecord) {
      console.error("OTP verification failed:", otpError);
      return new Response(
        JSON.stringify({ error: "Invalid or expired OTP" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark OTP as verified
    await supabase
      .from("otp_verifications")
      .update({ verified: true })
      .eq("id", otpRecord.id);

    // Check if user exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === normalizedEmail
    );

    let session = null;
    let user = null;

    if (existingUser) {
      // User exists - generate magic link token for sign in
      const { data: signInData, error: signInError } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: normalizedEmail,
      });

      if (signInError) {
        console.error("Error generating magic link:", signInError);
        return new Response(
          JSON.stringify({ error: "Failed to sign in" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify the token to create a session
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: signInData.properties.hashed_token,
        type: "magiclink",
      });

      if (verifyError) {
        console.error("Error verifying token:", verifyError);
        return new Response(
          JSON.stringify({ error: "Failed to create session" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      session = verifyData.session;
      user = verifyData.user;

      // Update profile email if needed
      await supabase
        .from("profiles")
        .update({ email: normalizedEmail })
        .eq("id", existingUser.id);

    } else {
      // New user - create account
      const tempPassword = crypto.randomUUID();
      
      const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
        email: normalizedEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: fullName || "",
        },
      });

      if (signUpError) {
        console.error("Error creating user:", signUpError);
        return new Response(
          JSON.stringify({ error: "Failed to create account" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      user = signUpData.user;

      // Create profile
      await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: fullName || "",
          email: normalizedEmail,
        });

      // Create user role
      await supabase
        .from("user_roles")
        .insert({
          user_id: user.id,
          role: "customer",
        });

      // Generate session for new user
      const { data: signInData, error: signInError } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: normalizedEmail,
      });

      if (!signInError && signInData) {
        const { data: verifyData } = await supabase.auth.verifyOtp({
          token_hash: signInData.properties.hashed_token,
          type: "magiclink",
        });
        session = verifyData?.session;
      }
    }

    console.log("Email OTP verified successfully:", { email: normalizedEmail, userId: user?.id });

    return new Response(
      JSON.stringify({
        success: true,
        session,
        user,
        isNewUser: !existingUser,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in verify-email-otp:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
