const { createClient } = require('@supabase/supabase-js');

module.exports = async function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { razorpay_order_id, status } = req.body || {};

    if (!razorpay_order_id || !status) {
      return res.status(400).json({ success: false, message: 'Missing order_id or status' });
    }

    // Only allow updating to 'failed' from client-side (security)
    if (status !== 'failed') {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    await supabase.from('payments')
      .update({ status: 'failed' })
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('status', 'pending'); // Only update if still pending (don't overwrite 'paid')

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
