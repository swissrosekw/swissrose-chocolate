import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderEmailRequest {
  orderId: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  address: string;
  city: string;
  governorate: string;
  notes?: string;
  paymentMethod: string;
  orderStatus: string;
  trackingCode?: string;
  trackingUrl?: string;
}

interface ResendEmailPayload {
  from: string;
  to: string[];
  subject: string;
  html: string;
}

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

async function sendResendEmail(payload: ResendEmailPayload) {
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Resend API error:", response.status, errorBody);
    throw new Error(`Failed to send email via Resend: ${response.status}`);
  }

  const data = await response.json();
  console.log("Resend API response:", data);
  return data;
}

// Generate tracking link email HTML
const generateTrackingLinkEmail = (orderData: OrderEmailRequest) => `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .tracking-box { background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .track-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 15px; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚚 Your Order is On The Way!</h1>
          <p>Hi ${orderData.customerName}!</p>
        </div>
        <div class="content">
          <div class="tracking-box">
            <h2>📍 Track Your Delivery</h2>
            <p>Your order is now out for delivery! Click the button below to track your driver in real-time.</p>
            <p><strong>Tracking Code:</strong> ${orderData.trackingCode}</p>
            <a href="${orderData.trackingUrl}" class="track-button">🗺️ Track My Order</a>
          </div>

          <h3>📦 Order Summary</h3>
          <p><strong>Order ID:</strong> ${orderData.orderId}</p>
          <p><strong>Delivery Address:</strong> ${orderData.address}, ${orderData.city}, ${orderData.governorate}</p>
          <p><strong>Total:</strong> ${orderData.total.toFixed(3)} KWD</p>

          <p style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
            💡 <strong>Tip:</strong> Keep this page open on your phone to see the driver's location update in real-time!
          </p>

          <div class="footer">
            <p>Swiss Rose Kuwait | Premium Gifts & Flowers</p>
            <p>Thank you for choosing us! 🌹</p>
          </div>
        </div>
      </div>
    </body>
  </html>
`;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const orderData: OrderEmailRequest = await req.json();
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "orders@swissrosekw.com";

    // Helper to validate email format
    const isValidEmail = (email: string) => {
      return email && email.includes('@') && email.includes('.');
    };

    // Handle tracking_link email type separately
    if (orderData.orderStatus === "tracking_link") {
      console.log("Sending tracking link email to:", orderData.customerEmail);
      
      if (!isValidEmail(orderData.customerEmail)) {
        throw new Error("Invalid customer email for tracking link");
      }

      if (!orderData.trackingUrl || !orderData.trackingCode) {
        throw new Error("Missing tracking URL or code");
      }

      const trackingEmailResponse = await sendResendEmail({
        from: `Swiss Rose <${adminEmail}>`,
        to: [orderData.customerEmail],
        subject: `🚚 Track Your Delivery - ${orderData.trackingCode}`,
        html: generateTrackingLinkEmail(orderData),
      });

      console.log("Tracking link email sent:", trackingEmailResponse);

      return new Response(
        JSON.stringify({ 
          success: true, 
          trackingEmail: trackingEmailResponse 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Customer confirmation email
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .order-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #e5e7eb; }
            .item { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .item:last-child { border-bottom: none; }
            .total { font-size: 20px; font-weight: bold; color: #667eea; margin-top: 20px; }
            .tracking-box { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Order Confirmed!</h1>
              <p>Thank you for your order, ${orderData.customerName}!</p>
            </div>
            <div class="content">
              <div class="tracking-box">
                <strong>📦 Order ID:</strong> ${orderData.orderId}<br>
                <strong>🚀 Status:</strong> ${orderData.orderStatus}<br>
                <p style="margin-top: 10px; font-size: 14px;">
                  Track your order: Keep this order ID for reference. We'll update you via email as your order progresses!
                </p>
              </div>

              <h2>📋 Order Details</h2>
              <div class="order-box">
                ${orderData.items.map(item => `
                  <div class="item">
                    <strong>${item.name}</strong><br>
                    Quantity: ${item.quantity} × ${item.price.toFixed(3)} KWD
                    <div style="text-align: right; margin-top: 5px;">
                      <strong>${(item.quantity * item.price).toFixed(3)} KWD</strong>
                    </div>
                  </div>
                `).join('')}
              </div>

              <div style="text-align: right; padding: 10px 0;">
                <p>Subtotal: ${orderData.subtotal.toFixed(3)} KWD</p>
                <p>Delivery Fee: ${orderData.deliveryFee.toFixed(3)} KWD</p>
                <p class="total">Total: ${orderData.total.toFixed(3)} KWD</p>
              </div>

              <h2>📍 Delivery Information</h2>
              <div class="order-box">
                <strong>Name:</strong> ${orderData.customerName}<br>
                <strong>Phone:</strong> ${orderData.customerPhone}<br>
                <strong>Email:</strong> ${orderData.customerEmail}<br>
                <strong>Address:</strong> ${orderData.address}, ${orderData.city}, ${orderData.governorate}<br>
                ${orderData.notes ? `<strong>Notes:</strong> ${orderData.notes}<br>` : ''}
                <strong>Payment Method:</strong> ${orderData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
              </div>

              <h2>⏱️ What's Next?</h2>
              <div class="order-box">
                <p><strong>1. Order Accepted</strong> - We'll review and confirm your order</p>
                <p><strong>2. Preparing</strong> - We'll carefully prepare your items</p>
                <p><strong>3. On Delivery</strong> - Your order is on its way!</p>
                <p><strong>4. Delivered</strong> - Enjoy your purchase!</p>
              </div>

              <p style="margin-top: 30px;">
                Need help? Contact us at <strong>${adminEmail}</strong> or call <strong>${orderData.customerPhone}</strong>
              </p>

              <div class="footer">
                <p>Swiss Rose Kuwait | Premium Gifts & Flowers</p>
                <p>Thank you for choosing us! 🌹</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Admin notification email
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .alert { background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .order-box { background: #f9fafb; padding: 15px; margin: 10px 0; border-radius: 8px; }
            .item { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .total { font-size: 18px; font-weight: bold; color: #dc2626; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="alert">
              <h1>🔔 New Order Received!</h1>
              <p><strong>Order ID:</strong> ${orderData.orderId}</p>
              <p><strong>Status:</strong> ${orderData.orderStatus}</p>
            </div>

            <h2>Customer Information</h2>
            <div class="order-box">
              <strong>Name:</strong> ${orderData.customerName}<br>
              <strong>Phone:</strong> ${orderData.customerPhone}<br>
              <strong>Email:</strong> ${orderData.customerEmail}<br>
              <strong>Address:</strong> ${orderData.address}, ${orderData.city}, ${orderData.governorate}<br>
              ${orderData.notes ? `<strong>Notes:</strong> ${orderData.notes}<br>` : ''}
              <strong>Payment:</strong> ${orderData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
            </div>

            <h2>Order Items</h2>
            ${orderData.items.map(item => `
              <div class="item">
                <strong>${item.name}</strong> - Qty: ${item.quantity} × ${item.price.toFixed(3)} KWD = 
                <strong>${(item.quantity * item.price).toFixed(3)} KWD</strong>
              </div>
            `).join('')}

            <div style="text-align: right;">
              <p>Subtotal: ${orderData.subtotal.toFixed(3)} KWD</p>
              <p>Delivery: ${orderData.deliveryFee.toFixed(3)} KWD</p>
              <p class="total">Total: ${orderData.total.toFixed(3)} KWD</p>
            </div>

            <p style="margin-top: 30px; text-align: center; background: #dbeafe; padding: 15px; border-radius: 8px;">
              <strong>⚡ Action Required:</strong> Please review and process this order in the admin panel.
            </p>
          </div>
        </body>
      </html>
    `;

    let customerEmailResponse = null;
    
    // Send customer email only if valid email is provided
    if (isValidEmail(orderData.customerEmail)) {
      customerEmailResponse = await sendResendEmail({
        from: `Swiss Rose <${adminEmail}>`,
        to: [orderData.customerEmail],
        subject: `Order Confirmation - ${orderData.orderId}`,
        html: customerEmailHtml,
      });
      console.log("Customer email sent:", customerEmailResponse);
    } else {
      console.log("Skipping customer email - no valid email provided:", orderData.customerEmail);
    }

    // Send admin email (always)
    const adminEmailResponse = await sendResendEmail({
      from: `Swiss Rose Orders <${adminEmail}>`,
      to: [adminEmail],
      subject: `🔔 New Order - ${orderData.orderId}`,
      html: adminEmailHtml,
    });

    console.log("Admin email sent:", adminEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        customerEmail: customerEmailResponse,
        adminEmail: adminEmailResponse 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-order-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
