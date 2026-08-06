const Razorpay = require('razorpay');
const { createClient } = require('@supabase/supabase-js');

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
    const { plan, service, amount, client_name, client_phone, client_email } = req.body || {};

    const expectedAmounts = {
      'socialmedia': 99900,
      'webdevelopment-starter': 299900,
      'webdevelopment-pro': 599900,
      'aivideos': 99900,
      'metaads': 299900
    };

    let validAmount = false;
    for (const key in expectedAmounts) {
      if (expectedAmounts[key] === amount) validAmount = true;
    }

    if (!validAmount) {
      return res.status(400).json({ success: false, message: 'Invalid amount for selected plan' });
    }

    const instance = new Razorpay({ 
      key_id: process.env.RAZORPAY_KEY_ID, 
      key_secret: process.env.RAZORPAY_KEY_SECRET 
    });

    const order = await instance.orders.create({ 
      amount, 
      currency: 'INR', 
      receipt: 'receipt_' + Date.now(), 
      notes: { service, plan, client_name, client_phone } 
    });

    // Save a "pending" payment record immediately so admin can track all attempts
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    await supabase.from('payments').insert({
      razorpay_order_id: order.id,
      razorpay_payment_id: null,
      client_name: client_name || '',
      client_phone: client_phone || '',
      client_email: client_email || '',
      service: service || plan || '',
      plan_name: plan || service || '',
      amount,
      status: 'pending'
    });

    return res.status(200).json({ 
      success: true, 
      order_id: order.id, 
      amount: order.amount, 
      currency: order.currency, 
      key_id: process.env.RAZORPAY_KEY_ID 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};
