import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.83.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvoiceRequest {
  orderId: string;
  action: "download" | "email";
  recipientEmail?: string;
}

const generateInvoiceHTML = (order: any, templates: any[], profile: any) => {
  const orderDate = new Date(order.created_at).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const templatesHTML = templates.map((template, index) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 0;">${index + 1}</td>
      <td style="padding: 12px 0;">${template.template_title}</td>
      <td style="padding: 12px 0;">${template.template_resolution}</td>
      <td style="padding: 12px 0;">${template.template_duration}</td>
      <td style="padding: 12px 0; text-align: right;">₹${Number(template.template_price).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice - ${order.order_number}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f9fafb; }
        .invoice-box { max-width: 800px; margin: auto; padding: 30px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; }
        .company-info { flex: 1; }
        .company-name { font-size: 28px; font-weight: bold; color: #6366f1; margin-bottom: 5px; }
        .company-tagline { color: #6b7280; font-size: 14px; }
        .invoice-details { text-align: right; }
        .invoice-title { font-size: 32px; font-weight: bold; color: #111827; }
        .invoice-number { font-size: 14px; color: #6b7280; margin-top: 5px; }
        .info-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .info-block { flex: 1; }
        .info-title { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .info-content { font-size: 14px; color: #111827; line-height: 1.6; }
        .table-container { margin: 30px 0; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f3f4f6; padding: 12px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
        td { padding: 12px 0; font-size: 14px; color: #111827; }
        .summary { background: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 30px; }
        .summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
        .summary-total { border-top: 2px solid #e5e7eb; margin-top: 10px; padding-top: 10px; font-size: 18px; font-weight: bold; color: #111827; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
        .status-completed { background: #d1fae5; color: #065f46; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-failed { background: #fee2e2; color: #991b1b; }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <div class="header">
          <div class="company-info">
            <div class="company-name">VideoStudio</div>
            <div class="company-tagline">Professional Video Templates</div>
            <div style="margin-top: 15px; font-size: 12px; color: #6b7280;">
              123 Creative Street<br>
              Design City, DC 12345<br>
              contact@videostudio.com<br>
              +1 (555) 123-4567
            </div>
          </div>
          <div class="invoice-details">
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-number">${order.order_number}</div>
            <div style="margin-top: 15px;">
              <span class="status-badge status-${order.payment_status}">
                ${order.payment_status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div class="info-section">
          <div class="info-block">
            <div class="info-title">Bill To</div>
            <div class="info-content">
              <strong>${profile?.full_name || 'Customer'}</strong><br>
              ${profile?.email || ''}<br>
              ${profile?.phone || ''}<br>
              ${profile?.address || ''}<br>
              ${profile?.city || ''}, ${profile?.state || ''} ${profile?.pincode || ''}
            </div>
          </div>
          <div class="info-block" style="text-align: right;">
            <div class="info-title">Invoice Details</div>
            <div class="info-content">
              <strong>Date:</strong> ${orderDate}<br>
              <strong>Order Type:</strong> ${order.order_type || 'Self'}<br>
              <strong>Payment Method:</strong> ${order.payment_method.toUpperCase()}<br>
              <strong>Share Method:</strong> ${order.share_method}
            </div>
          </div>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th style="width: 50px;">#</th>
                <th>Template Name</th>
                <th>Resolution</th>
                <th>Duration</th>
                <th style="text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${templatesHTML || '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #6b7280;">No templates found</td></tr>'}
            </tbody>
          </table>
        </div>

        <div class="summary">
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>₹${Number(order.subtotal).toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span>Tax (18%):</span>
            <span>₹${Number(order.tax).toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span>Discount:</span>
            <span>-₹${Number(order.discount).toFixed(2)}</span>
          </div>
          <div class="summary-row summary-total">
            <span>Total Amount:</span>
            <span>₹${Number(order.total).toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>For any queries, please contact us at support@videostudio.com</p>
          <p style="margin-top: 15px; font-size: 11px;">This is a computer-generated invoice and does not require a signature.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { orderId, action, recipientEmail }: InvoiceRequest = await req.json();

    console.log(`Processing invoice ${action} for order: ${orderId}`);

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError) {
      console.error("Order fetch error:", orderError);
      throw new Error("Failed to fetch order");
    }

    // Fetch order templates
    const { data: templates } = await supabase
      .from("order_templates")
      .select("*")
      .eq("order_id", orderId);

    // Fetch shared users to determine order type
    const { data: sharedUsers } = await supabase
      .from("order_shared_users")
      .select("*")
      .eq("order_id", orderId);

    order.order_type = sharedUsers && sharedUsers.length > 0 ? "Shared" : "Self";

    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", order.user_id)
      .single();

    const invoiceHTML = generateInvoiceHTML(order, templates || [], profile);

    if (action === "email") {
      const targetEmail = recipientEmail || profile?.email;
      
      if (!targetEmail) {
        throw new Error("No recipient email provided");
      }

      console.log(`Sending invoice email to: ${targetEmail}`);

      const emailResponse = await resend.emails.send({
        from: "VideoStudio <onboarding@resend.dev>",
        to: [targetEmail],
        subject: `Invoice ${order.order_number} - VideoStudio`,
        html: invoiceHTML,
      });

      console.log("Email sent successfully:", emailResponse);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Invoice sent successfully",
          emailResponse 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } else {
      // Return HTML for PDF generation (client-side)
      return new Response(invoiceHTML, {
        status: 200,
        headers: { "Content-Type": "text/html", ...corsHeaders },
      });
    }
  } catch (error: any) {
    console.error("Error in generate-invoice function:", error);
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
