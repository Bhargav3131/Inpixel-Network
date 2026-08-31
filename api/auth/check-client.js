const { createClient } = require('@supabase/supabase-js');

const ALLOWED_ORIGIN = 'https://inpixelnetwork.in';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async function (req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { phone } = req.body || {};

    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    // Input length validation
    if (phone.length > 20) {
      return res.status(400).json({ success: false, message: 'Invalid input' });
    }

    // Normalize phone number
    const normalized = phone.replace(/[\s\-\(\)]/g, '');

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { data, error } = await supabase
      .from('clients')
      .select('name, services')
      .eq('phone', normalized)
      .maybeSingle();

    if (error || !data) {
      return res.status(200).json({ success: true, approved: false });
    }

    return res.status(200).json({
      success: true,
      approved: true,
      name: data.name || '',
      services: data.services || 'website'
    });
  } catch (error) {
    console.error('Check client error:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};
