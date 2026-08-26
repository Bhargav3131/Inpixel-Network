const Razorpay = require('razorpay');
const { createClient } = require('@supabase/supabase-js');

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
    const { plan, service, amount, client_name, client_phone, client_email } = req.body || {};

    // Validate service↔amount pair (not just amount)
    const expectedAmounts = {
      'socialmedia': 99900,
      'webdevelopment-starter': 299900,
      'webdevelopment-pro': 599900,
      'aivideos': 99900,
      'metaads': 299900,
      'quotation': 299900
    };

    const serviceKey = service || plan;
    if (!serviceKey || expectedAmounts[serviceKey] !== amount) {
      return res.status(400).json({ success: false, message: 'Invalid amount for selected plan' });
    }

    // Input length validation
    if (client_name && client_name.length > 200) return res.status(400).json({ success: false, message: 'Invalid input' });
    if (client_phone && client_phone.length > 20) return res.status(400).json({ success: false, message: 'Invalid input' });
    if (client_email && client_email.length > 200) return res.status(400).json({ success: false, message: 'Invalid input' });

    // Normalize phone number
    const normalizedPhone = client_phone ? client_phone.replace(/[\s\-\(\)]/g, '') : '';

    const instance = new Razorpay({ 
      key_id: process.env.RAZORPAY_KEY_ID, 
      key_secret: process.env.RAZORPAY_KEY_SECRET 
    });

    const order = await instance.orders.create({ 
      amount, 
      currency: 'INR', 
      receipt: 'receipt_' + Date.now(), 
      notes: { service: serviceKey, plan: plan || serviceKey, client_name, client_phone: normalizedPhone } 
    });

    // Save a "pending" payment record
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    await supabase.from('payments').insert({
      razorpay_order_id: order.id,
      razorpay_payment_id: null,
      client_name: client_name || '',
      client_phone: normalizedPhone,
      client_email: client_email || '',
      service: serviceKey,
      plan_name: plan || serviceKey,
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
    console.error('Create order error:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};
