const { createClient } = require('@supabase/supabase-js');

module.exports = async function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
    }

    if (req.method === 'GET') {
      const { data, error } = await supabase.from('clients').select('*').order('added_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ success: true, data });
    } else if (req.method === 'POST') {
      const { name, phone, services } = req.body || {};
      if (!phone) return res.status(400).json({ success: false, message: 'Phone is required' });
      
      const { data, error } = await supabase.from('clients').upsert({ name, phone, services }, { onConflict: 'phone' }).select();
      if (error) throw error;
      return res.status(200).json({ success: true, data: data[0] });
    } else if (req.method === 'DELETE') {
      const { phone } = req.body || {};
      if (!phone) return res.status(400).json({ success: false, message: 'Phone is required' });
      
      const { error } = await supabase.from('clients').delete().eq('phone', phone);
      if (error) throw error;
      return res.status(200).json({ success: true, message: 'Deleted successfully' });
    } else {
      return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};
