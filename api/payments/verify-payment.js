const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

module.exports = async function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
      client_email, 
      service, 
      plan_name, 
      amount 
    } = req.body || {};

    const generated = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                            .update(razorpay_order_id + '|' + razorpay_payment_id)
                            .digest('hex');

    if (generated !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from('payments').insert({
      razorpay_order_id,
      razorpay_payment_id,
      client_name,
      client_phone,
      client_email,
      service,
      plan_name,
      amount,
      status: 'paid'
    });

    let targetService = '';
    if (service === 'webdevelopment-starter' || service === 'webdevelopment-pro' || service === 'webdevelopment' || service === 'website') {
      targetService = 'website';
    } else if (service === 'aivideos') {
      targetService = 'aiads';
    } else if (service === 'metaads') {
      targetService = 'metaads';
    } else if (service === 'socialmedia') {
      targetService = 'socialmedia';
    }

    if (client_phone) {
      const { data: existingClient } = await supabase
        .from('clients')
        .select('*')
        .eq('phone', client_phone)
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
        name: client_name || (existingClient ? existingClient.name : 'Unknown'), 
        phone: client_phone, 
        services: finalServices 
      }, { onConflict: 'phone' });
    }

    return res.status(200).json({ success: true, message: 'Payment verified and account activated' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};
