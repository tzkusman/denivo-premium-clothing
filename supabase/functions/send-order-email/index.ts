// Send Order Email Edge Function for DENIVO
// Sends order status emails via Resend

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { order, status, items } = await req.json()

    if (!order || !status) {
      return new Response(JSON.stringify({ error: 'Missing order or status' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const statusMessages: Record<string, string> = {
      pending: 'Your order has been received and is pending confirmation.',
      confirmed: 'Your order has been confirmed and is being prepared!',
      shipped: 'Great news! Your order has been shipped and is on its way!',
      delivered: 'Your order has been delivered. Thank you for shopping with DENIVO!',
      cancelled: 'Your order has been cancelled. If you have questions, please contact us.'
    }

    // Format order items if provided
    let itemsHtml = ''
    if (items && items.length > 0) {
      itemsHtml = `
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background: #f5f5f5;">
            <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Item</th>
            <th style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">Qty</th>
            <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Price</th>
          </tr>
          ${items.map((item: any) => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product_name}${item.size ? ` (${item.size})` : ''}</td>
              <td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee;">${item.quantity}</td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">Rs. ${Number(item.total_price).toLocaleString()}</td>
            </tr>
          `).join('')}
        </table>
      `
    }

    const statusColor = status === 'cancelled' ? '#dc2626' : '#16a34a'
    const statusBg = status === 'cancelled' ? '#fee2e2' : '#dcfce7'

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #18181b 0%, #27272a 100%); color: white; padding: 40px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; letter-spacing: 4px;">DENIVO</h1>
          <p style="margin: 10px 0 0; opacity: 0.8; font-size: 12px; letter-spacing: 2px;">PREMIUM CLOTHING</p>
        </div>
        
        <div style="padding: 40px 30px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <span style="display: inline-block; background: ${statusBg}; color: ${statusColor}; padding: 8px 20px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
              Order ${status}
            </span>
          </div>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Dear <strong>${order.customer_name}</strong>,
          </p>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            ${statusMessages[status] || `Your order status has been updated to: ${status}`}
          </p>
          
          <div style="background: #f9fafb; border-radius: 12px; padding: 25px; margin: 25px 0;">
            <h3 style="margin: 0 0 15px; color: #18181b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Order Details</h3>
            <table style="width: 100%;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Order Number:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #18181b;">${order.order_number}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Payment Method:</td>
                <td style="padding: 8px 0; text-align: right; color: #18181b;">${order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Total Amount:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; font-size: 18px; color: #18181b;">Rs. ${Number(order.total).toLocaleString()}</td>
              </tr>
            </table>
          </div>

          ${itemsHtml}
          
          <div style="background: #f9fafb; border-radius: 12px; padding: 25px; margin: 25px 0;">
            <h3 style="margin: 0 0 15px; color: #18181b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Shipping Address</h3>
            <p style="margin: 0; color: #374151; line-height: 1.6;">
              ${order.shipping_address}<br>
              ${order.shipping_city}, ${order.shipping_state || ''} ${order.shipping_zip}<br>
              ${order.shipping_country || 'Pakistan'}
            </p>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 30px;">
            Thank you for shopping with DENIVO!
          </p>
        </div>
        
        <div style="background: #f9fafb; padding: 25px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
            © 2026 DENIVO Premium Clothing. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Denivo <onboarding@resend.dev>',
        to: [order.customer_email],
        subject: `Order ${status.charAt(0).toUpperCase() + status.slice(1)} - ${order.order_number}`,
        html: html,
      }),
    })

    const data = await res.json()
    
    if (!res.ok) {
      console.error('Resend API error:', data)
      return new Response(JSON.stringify({ error: data }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
    
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-order-email' \
    --header 'Authorization: Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6ImI4MTI2OWYxLTIxZDgtNGYyZS1iNzE5LWMyMjQwYTg0MGQ5MCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjIwODM5NDUxNDh9.tpjmqibm1w1L15oC3sB5CRmH-xipigVazzmPFmv7g9tW1xPtvrJGR6zF2X71viQnOkOFvqP47wVEeYHpRZ2tQQ' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
