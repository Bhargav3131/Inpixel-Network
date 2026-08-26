const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const ALLOWED_ORIGIN = 'https://inpixelnetwork.in';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

module.exports = async function (req, res) {
  setCors(res);
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

    // Verify HMAC-SHA256 signature
    const generated = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                            .update(razorpay_order_id + '|' + razorpay_payment_id)
                            .digest('hex');

    if (generated !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Read the service from the DB record (set at order creation), NOT from client
    const { data: paymentRecord, error: fetchError } = await supabase
      .from('payments')
      .select('service, plan_name, client_name, client_phone')
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('status', 'pending')
      .single();

    if (fetchError || !paymentRecord) {
      return res.status(400).json({ success: false, message: 'Payment record not found or already processed' });
    }

    // Use DB-stored values (trusted), not client-sent values
    const trustedService = paymentRecord.service;
    const trustedPhone = paymentRecord.client_phone || (client_phone ? client_phone.replace(/[\s\-\(\)]/g, '') : '');
    const trustedName = paymentRecord.client_name || client_name || 'Unknown';

    // Update the pending record to "paid"
    await supabase.from('payments')
      .update({
        razorpay_payment_id,
        status: 'paid'
      })
      .eq('razorpay_order_id', razorpay_order_id);

    // Map service to client activation service
    let targetService = '';
    if (trustedService === 'webdevelopment-starter' || trustedService === 'webdevelopment-pro' || trustedService === 'webdevelopment' || trustedService === 'website') {
      targetService = 'website';
    } else if (trustedService === 'aivideos') {
      targetService = 'aiads';
    } else if (trustedService === 'metaads') {
      targetService = 'metaads';
    } else if (trustedService === 'socialmedia') {
      targetService = 'socialmedia';
    }
    // quotation doesn't need client service activation

    if (trustedPhone) {
      const { data: existingClient } = await supabase
        .from('clients')
        .select('*')
        .eq('phone', trustedPhone)
        .single();

      let finalServices = existingClient ? existingClient.services || '' : '';
      
      if (targetService) {
        if (!finalServices) {
          finalServices = targetService;
        } else if (!finalServices.includes(targetService)) {
          finalServices += (finalServices.length > 0 ? ',' : '') + targetService;
        }
      }

      await supabase.from('clients').upsert({ 
        name: trustedName, 
        phone: trustedPhone, 
        services: finalServices 
      }, { onConflict: 'phone' });
    }

    return res.status(200).json({ success: true, message: 'Payment verified and account activated' });
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};
