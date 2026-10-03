const { createClient } = require('@supabase/supabase-js');

const ALLOWED_ORIGIN = 'https://inpixelnetwork.in';
const ADMIN_EMAIL = 'supportinpixelnetwork@gmail.com';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

module.exports = async function (req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user || user.email !== ADMIN_EMAIL) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  try {
    if (req.method === 'GET') {
      const { status } = req.query;
      let query = supabase.from('blogs').select('*').order('created_at', { ascending: false });
      
      if (status && ['draft', 'published'].includes(status)) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return res.status(200).json({ success: true, blogs: data });
    }
    
    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ success: false, message: 'ID required' });
      
      // Get blog to find thumbnail
      const { data: blog } = await supabase.from('blogs').select('thumbnail_url').eq('id', id).single();
      
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw error;
      
      // Attempt to delete thumbnail if exists
      if (blog && blog.thumbnail_url) {
        const fileName = blog.thumbnail_url.split('/').pop();
        if (fileName) {
          await supabase.storage.from('blog-thumbnails').remove([fileName]);
        }
      }
      
      return res.status(200).json({ success: true, message: 'Blog deleted' });
    }
    
    if (req.method === 'PATCH') {
      const { id, status } = req.body || {};
      if (!id || !['draft', 'published'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Valid ID and status required' });
      }
      
      const { error } = await supabase.from('blogs').update({ status }).eq('id', id);
      if (error) throw error;
      
      return res.status(200).json({ success: true, message: 'Blog updated' });
    }

    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  } catch (error) {
    console.error('Manage blog error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
