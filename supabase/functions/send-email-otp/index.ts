import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendEmailOTPRequest {
  email: string;
  fullName?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName }: SendEmailOTPRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store OTP in database
    const { error: insertError } = await supabase
      .from("otp_verifications")
      .insert({
        email: email.toLowerCase(),
        otp,
        expires_at: expiresAt.toISOString(),
        verified: false,
      });

    if (insertError) {
      console.error("Error storing OTP:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to generate OTP" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send email via Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "orders@swissrosekw.com";
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #b8860b; margin: 0;">Swiss Rose</h1>
          <p style="color: #666; margin-top: 5px;">Luxury Gifts & Chocolates</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #f8f4e8 0%, #fff 100%); border-radius: 10px; padding: 30px; text-align: center;">
          <h2 style="color: #333; margin-top: 0;">Your Verification Code</h2>
          <p style="color: #666;">Use the following code to verify your email address:</p>
          
          <div style="background: #b8860b; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px 40px; border-radius: 8px; display: inline-block; margin: 20px 0;">
            ${otp}
          </div>
          
          <p style="color: #999; font-size: 14px; margin-top: 20px;">
            This code will expire in 10 minutes.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
          <p>If you didn't request this code, please ignore this email.</p>
          <p>&copy; ${new Date().getFullYear()} Swiss Rose Kuwait. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Swiss Rose <${adminEmail}>`,
        to: [email],
        subject: "Your Verification Code - Swiss Rose",
        html: emailHtml,
      }),
    });

    const emailResult = await emailResponse.json();
    
    if (!emailResponse.ok) {
      console.error("Resend error:", emailResult);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Email OTP sent successfully:", { email, emailResult });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "OTP sent to your email" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in send-email-otp:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
