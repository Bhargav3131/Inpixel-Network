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
      const { type } = req.query;
      let table = '';
      if (type === 'website') table = 'website_submissions';
      else if (type === 'aiads') table = 'ai_ads_submissions';
      else if (type === 'metaads') table = 'meta_ads_submissions';
      else return res.status(400).json({ success: false, message: 'Invalid type param' });

      const { data, error } = await supabase.from(table).select('*').order('submitted_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ success: true, data });
    } else if (req.method === 'DELETE') {
      const { type, id } = req.body || {};
      let table = '';
      if (type === 'website') table = 'website_submissions';
      else if (type === 'aiads') table = 'ai_ads_submissions';
      else if (type === 'metaads') table = 'meta_ads_submissions';
      else return res.status(400).json({ success: false, message: 'Invalid type' });

      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ success: true, message: 'Deleted successfully' });
    } else {
      return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};
