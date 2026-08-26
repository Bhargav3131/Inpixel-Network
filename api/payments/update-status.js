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
    const { razorpay_order_id, status, failure_reason } = req.body || {};

    if (!razorpay_order_id || !status) {
      return res.status(400).json({ success: false, message: 'Missing order_id or status' });
    }

    // Only allow updating to 'failed' from client-side
    if (status !== 'failed') {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Input length validation
    if (razorpay_order_id.length > 100) return res.status(400).json({ success: false, message: 'Invalid input' });
    if (failure_reason && failure_reason.length > 500) return res.status(400).json({ success: false, message: 'Invalid input' });

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    await supabase.from('payments')
      .update({ 
        status: 'failed',
        failure_reason: failure_reason || 'Cancelled by user / Payment failed'
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('status', 'pending'); // Only update if still pending

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Update status error:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};
