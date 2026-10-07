const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const ALLOWED_ORIGINS = ['https://inpixelnetwork.in', 'https://www.inpixelnetwork.in'];

function setCors(req, res) {
  const origin = req.headers.origin || '';
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Service display names & fallback prices for the receipt
const SERVICE_INFO = {
  'socialmedia': { name: 'Social Media Management', price: '₹999/mo' },
  'webdevelopment-starter': { name: 'Website Development — Starter', price: '₹2,999' },
  'webdevelopment-pro': { name: 'Website Development — Pro', price: '₹5,999' },
  'aivideos': { name: 'AI Video Ads', price: '₹999' },
  'metaads': { name: 'Meta Ads Management', price: '₹2,999/mo' },
  'quotation': { name: 'Inpixel Quotation Software — Lifetime', price: '₹2,999' }
};

async function sendReceiptEmail({ to, clientName, serviceName, servicePrice, paymentId, orderId, emailSettings }) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });

  const heading = (emailSettings && emailSettings.heading) || 'Payment Successful ✓';
  const subheading = (emailSettings && emailSettings.subheading) || 'Thank you for choosing Inpixel Network';
  const message = (emailSettings && emailSettings.message) || 'Our team will reach out to you shortly to get started.';
  const contactEmail = (emailSettings && emailSettings.contactEmail) || process.env.GMAIL_USER || 'supportinpixelnetwork@gmail.com';
  
  let subject = (emailSettings && emailSettings.subject) || 'Payment Confirmed — {service} | Inpixel Network';
  subject = subject.replace(/\{service\}/g, serviceName).replace(/\{amount\}/g, servicePrice);

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #060608; color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid rgba(240,165,0,0.2);">
      
      <div style="background: linear-gradient(135deg, #f0a500 0%, #d4920a 100%); padding: 32px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; color: #060608; font-weight: 800;">${heading}</h1>
        <p style="margin: 8px 0 0; color: rgba(6,6,8,0.7); font-size: 14px;">${subheading}</p>
      </div>

      <div style="padding: 32px;">
        <p style="color: #f0a500; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 20px;">Payment Receipt</p>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); font-size: 14px;">Name</td>
            <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.08); text-align: right; font-weight: 600; font-size: 14px;">${clientName}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); font-size: 14px;">Service</td>
            <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.08); text-align: right; font-weight: 600; font-size: 14px;">${serviceName}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); font-size: 14px;">Amount Paid</td>
            <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.08); text-align: right; font-weight: 700; color: #22c55e; font-size: 14px;">${servicePrice}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); font-size: 14px;">Payment ID</td>
            <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.08); text-align: right; font-size: 12px; font-family: monospace; color: rgba(255,255,255,0.7);">${paymentId}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: rgba(255,255,255,0.5); font-size: 14px;">Order ID</td>
            <td style="padding: 12px 0; text-align: right; font-size: 12px; font-family: monospace; color: rgba(255,255,255,0.7);">${orderId}</td>
          </tr>
        </table>

        <div style="margin-top: 28px; padding: 20px; background: rgba(240,165,0,0.08); border: 1px solid rgba(240,165,0,0.2); border-radius: 8px; text-align: center;">
          <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.6; white-space: pre-line;">
            ${message}
          </p>
          <p style="margin: 10px 0 0; color: rgba(255,255,255,0.5); font-size: 13px;">
            For any queries, contact us at <a href="mailto:${contactEmail}" style="color: #f0a500;">${contactEmail}</a>
          </p>
        </div>
      </div>

      <div style="padding: 20px 32px; background: rgba(255,255,255,0.03); text-align: center; border-top: 1px solid rgba(255,255,255,0.06);">
        <p style="margin: 0; color: rgba(255,255,255,0.3); font-size: 12px;">
          © ${new Date().getFullYear()} Inpixel Network · <a href="https://inpixelnetwork.in" style="color: #f0a500; text-decoration: none;">inpixelnetwork.in</a>
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Inpixel Network" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html
  });
}

module.exports = async function (req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      client_name,
      client_phone,
      client_email
    } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment details' });
    }

    // Verify Razorpay HMAC SHA256 signature
    const generated = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Look up the pending payment record created in create-order.js
    const { data: pendingPayment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
      .single();

    if (fetchError || !pendingPayment) {
      console.error('Pending payment not found for order:', razorpay_order_id, fetchError);
      return res.status(404).json({ success: false, message: 'Order record not found' });
    }

    // Read trusted data from our database record (tamper-proof)
    const trustedService = pendingPayment.service;
    const trustedAmount = pendingPayment.amount;
    const trustedName = pendingPayment.client_name || client_name;
    const trustedPhone = pendingPayment.client_phone || client_phone;
    const trustedEmail = pendingPayment.client_email || client_email;

    // Update payment record to "paid"
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        razorpay_payment_id,
        status: 'paid'
      })
      .eq('razorpay_order_id', razorpay_order_id);

    if (updateError) {
      console.error('Failed to update payment status:', updateError);
      return res.status(500).json({ success: false, message: 'Failed to record payment' });
    }

    // Client portal activation mapping
    // Note: socialmedia and quotation do NOT have portal dashboards
    let targetService = '';
    if (trustedService === 'webdevelopment-starter' || trustedService === 'webdevelopment-pro' || trustedService === 'webdevelopment' || trustedService === 'website') {
      targetService = 'website';
    } else if (trustedService === 'aivideos') {
      targetService = 'aiads';
    } else if (trustedService === 'metaads') {
      targetService = 'metaads';
    }

    if (trustedPhone && targetService) {
      const { data: existingClient } = await supabase
        .from('clients')
        .select('*')
        .eq('phone', trustedPhone)
        .single();

      let finalServices = existingClient ? existingClient.services || '' : '';
      
      if (!finalServices) {
        finalServices = targetService;
      } else if (!finalServices.includes(targetService)) {
        finalServices += (finalServices.length > 0 ? ',' : '') + targetService;
      }

      await supabase.from('clients').upsert({ 
        name: trustedName, 
        phone: trustedPhone, 
        services: finalServices 
      }, { onConflict: 'phone' });
    }

    // Send confirmation & receipt email with actual amount paid & custom email settings
    if (trustedEmail) {
      const info = SERVICE_INFO[trustedService] || { name: trustedService, price: '' };
      // Format actual amount paid
      const actualPaidPrice = trustedAmount ? '₹' + (trustedAmount / 100).toLocaleString('en-IN') : info.price;

      // Fetch email settings from database
      let emailSettings = null;
      try {
        const { data: eRow } = await supabase.from('settings').select('value').eq('key', 'email_settings').maybeSingle();
        if (eRow && eRow.value) emailSettings = eRow.value;
      } catch (err) {}

      try {
        await sendReceiptEmail({
          to: trustedEmail,
          clientName: trustedName,
          serviceName: info.name,
          servicePrice: actualPaidPrice,
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          emailSettings
        });
      } catch (emailError) {
        console.error('Email send failed:', emailError);
      }
    }

    return res.status(200).json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};
