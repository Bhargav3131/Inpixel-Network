const { createClient } = require('@supabase/supabase-js');

module.exports = async function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  
  const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ success: false, message: 'DB Error' });
  
  res.status(200).json({ success: true, data });
};
