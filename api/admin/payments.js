const { createClient } = require('@supabase/supabase-js');

const ADMIN_EMAIL = 'supportinpixelnetwork@gmail.com';

const DEFAULT_PRICES = {
  'socialmedia': 99900,
  'webdevelopment-starter': 299900,
  'webdevelopment-pro': 599900,
  'aivideos': 99900,
  'metaads': 299900,
  'quotation': 299900
};

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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

    // Handle Pricing action
    if (req.query && req.query.action === 'pricing') {
      if (req.method === 'GET') {
        const { data, error } = await supabase.from('settings').select('value').eq('key', 'pricing').maybeSingle();
        if (error || !data || !data.value) {
          return res.status(200).json({ success: true, data: DEFAULT_PRICES });
        }
        return res.status(200).json({ success: true, data: data.value });
      }

      if (req.method === 'POST') {
        const { prices } = req.body || {};
        if (!prices || typeof prices !== 'object') {
          return res.status(400).json({ success: false, message: 'Invalid pricing payload' });
        }

        const { error } = await supabase.from('settings').upsert({
          key: 'pricing',
          value: prices,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

        if (error) {
          return res.status(500).json({
            success: false,
            message: 'Failed to save to settings table: ' + (error.message || 'Table may not exist')
          });
        }

        return res.status(200).json({ success: true, message: 'Pricing updated successfully' });
      }

      return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    // Default: GET payments list
    if (req.method !== 'GET') {
      return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Payments endpoint error:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};
