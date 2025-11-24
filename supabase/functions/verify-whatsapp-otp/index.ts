import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, otp, fullName } = await req.json();

    if (!phone || !otp) {
      throw new Error('Phone number and OTP are required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify OTP
    const { data: otpRecord, error: otpError } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('phone', phone)
      .eq('otp', otp)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError || !otpRecord) {
      console.error('OTP verification error:', otpError);
      throw new Error('Invalid or expired OTP');
    }

    // Mark OTP as verified
    await supabase
      .from('otp_verifications')
      .update({ verified: true })
      .eq('id', otpRecord.id);

    // Create or get user with phone authentication
    // Use phone as email: phone@swissrose.local
    const email = `${phone}@swissrose.local`;
    const password = `${phone}_${otp}_swissrose`; // Temporary password

    // Check if user exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', phone)
      .maybeSingle();

    let userId: string;

    if (existingProfile) {
      // User exists, sign them in
      userId = existingProfile.id;
      
      // Generate session token
      const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: email,
      });

      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Failed to generate session');
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          user: { id: userId, phone },
          session: sessionData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // New user, create account
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName || '',
          phone: phone,
        },
      });

      if (authError || !authData.user) {
        console.error('Auth error:', authError);
        throw new Error('Failed to create user account');
      }

      userId = authData.user.id;

      // Update profile with phone
      await supabase
        .from('profiles')
        .update({ phone: phone, full_name: fullName || '' })
        .eq('id', userId);

      // Generate session for new user
      const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: email,
      });

      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Failed to generate session');
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          isNewUser: true,
          user: { id: userId, phone },
          session: sessionData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in verify-whatsapp-otp:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
