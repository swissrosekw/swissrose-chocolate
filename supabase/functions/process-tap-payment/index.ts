import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, amount, customerName, customerEmail, customerPhone } = await req.json();
    
    console.log('Processing Tap payment for order:', orderId);

    // Get Tap API key from payment settings
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: settings, error: settingsError } = await supabaseClient
      .from('payment_settings')
      .select('tap_payments_api_key')
      .single();

    if (settingsError || !settings?.tap_payments_api_key) {
      console.error('Failed to get Tap API key:', settingsError);
      throw new Error('Tap Payments is not configured');
    }

    // Create Tap payment charge
    const tapResponse = await fetch('https://api.tap.company/v2/charges', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.tap_payments_api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount,
        currency: 'KWD',
        customer: {
          first_name: customerName.split(' ')[0],
          last_name: customerName.split(' ').slice(1).join(' ') || customerName.split(' ')[0],
          email: customerEmail,
          phone: {
            country_code: '965',
            number: customerPhone.replace(/\D/g, ''),
          },
        },
        source: {
          id: 'src_all',
        },
        redirect: {
          url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/tap-payment-callback`,
        },
        post: {
          url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/tap-payment-webhook`,
        },
        description: `Order ${orderId}`,
        metadata: {
          order_id: orderId,
        },
      }),
    });

    const tapData = await tapResponse.json();
    
    if (!tapResponse.ok) {
      console.error('Tap API error:', tapData);
      throw new Error(tapData.message || 'Failed to create payment');
    }

    console.log('Tap payment created:', tapData.id);

    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl: tapData.transaction?.url,
        chargeId: tapData.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in process-tap-payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});