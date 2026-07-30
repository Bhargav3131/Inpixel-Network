const { createClient } = require('@supabase/supabase-js');

const ALLOWED_ORIGIN = 'https://inpixelnetwork.in';
const ADMIN_EMAIL = 'supportinpixelnetwork@gmail.com';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

async function verifyAdmin(req, supabase) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user || user.email !== ADMIN_EMAIL) return null;
  return user;
}

module.exports = async function (req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const user = await verifyAdmin(req, supabase);
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    if (req.method === 'GET') {
      const { type } = req.query;
      const tableMap = { website: 'website_submissions', aiads: 'ai_ads_submissions', metaads: 'meta_ads_submissions' };
      const table = tableMap[type];
      if (!table) return res.status(400).json({ success: false, message: 'Invalid type' });

      const { data, error } = await supabase.from(table).select('*').order('submitted_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ success: true, data });

    } else if (req.method === 'DELETE') {
      const { type, id } = req.body || {};
      const tableMap = { website: 'website_submissions', aiads: 'ai_ads_submissions', metaads: 'meta_ads_submissions' };
      const table = tableMap[type];
      if (!table) return res.status(400).json({ success: false, message: 'Invalid type' });
      if (!id) return res.status(400).json({ success: false, message: 'Missing ID' });

      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ success: true, message: 'Deleted' });

    } else {
      return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Submissions error:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};
