const { createClient } = require('@supabase/supabase-js');


const ALLOWED_ORIGIN = 'https://inpixelnetwork.in';
const ADMIN_EMAIL = 'supportinpixelnetwork@gmail.com';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

const TOPICS = [
  "digital marketing tips", "meta ads strategies", "social media growth",
  "web development trends", "AI in marketing", "SEO tips",
  "business growth", "branding", "content marketing", "e-commerce tips"
];

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

function generateThumbnailSVG(title, category) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#060608"/>
    <rect x="40" y="40" width="1120" height="550" rx="16" fill="#101018" stroke="rgba(240,165,0,0.2)" stroke-width="2"/>
    <text x="600" y="250" text-anchor="middle" fill="#f0a500" font-family="Arial,sans-serif" font-size="42" font-weight="700">${escapeXml(title.substring(0, 50))}</text>
    ${title.length > 50 ? `<text x="600" y="310" text-anchor="middle" fill="#f0a500" font-family="Arial,sans-serif" font-size="42" font-weight="700">${escapeXml(title.substring(50, 100))}</text>` : ''}
    <text x="600" y="420" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-family="Arial,sans-serif" font-size="22" text-transform="uppercase" letter-spacing="3">${escapeXml(category.toUpperCase())}</text>
    <text x="600" y="540" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-family="Arial,sans-serif" font-size="18">inpixelnetwork.in</text>
  </svg>`;
}

module.exports = async function (req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method Not Allowed' });

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  let isCron = false;
  if (token === process.env.CRON_SECRET) {
    isCron = true;
  } else {
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user || user.email !== ADMIN_EMAIL) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
  }

  try {
    let { topic, category } = req.body || {};

    if (!topic) {
      topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    }
    if (!category) {
      category = topic;
    }

    const prompt = `
      You are an expert content marketer for "Inpixel Network", a digital agency. 
      Write a highly engaging, SEO-optimized blog post about: "${topic}". 
      Category: "${category}".

      Requirements:
      1. Length: 1000-1500 words.
      2. Format: Return ONLY a valid JSON object (do not wrap in markdown tags like \`\`\`json) with the following keys:
         - "title": A catchy, SEO-friendly title.
         - "slug": A URL-friendly slug (lowercase, hyphenated).
         - "content": Full blog content in HTML format (using <h2>, <p>, <ul>, <li>, <strong>). Natural flow.
         - "excerpt": A 2-3 sentence summary.
         - "meta_description": SEO meta description under 160 chars.
         - "category": The category name.
      3. Brand Mention: Naturally mention Inpixel Network's services (web development, AI videos, meta ads, social media management, quotation software) where relevant, without sounding too salesy.
    `;

    const g_url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const response = await fetch(g_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          temperature: 0.8, 
          maxOutputTokens: 4096,
          responseMimeType: "application/json"
        }
      })
    });

    const data = await response.json();
    
    if (data.error) {
       console.error("Gemini API Error:", data.error);
       const errMsg = data.error.message || JSON.stringify(data.error);
       return res.status(500).json({ success: false, message: `Gemini API Error: ${errMsg}`, error: data.error });
    }

    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    let blogData;
    try {
      blogData = JSON.parse(text);
    } catch(parseErr) {
      console.error("Failed to parse AI output:", text);
      return res.status(500).json({ success: false, message: 'AI returned invalid JSON format. Please try again.' });
    }

    // Generate Thumbnail
    const svgContent = generateThumbnailSVG(blogData.title, blogData.category);
    let fileName = `${blogData.slug}-${Date.now()}.svg`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('blog-thumbnails')
      .upload(fileName, Buffer.from(svgContent), { contentType: 'image/svg+xml', upsert: true });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return res.status(500).json({ success: false, message: 'Storage upload error' });
    }

    const thumbnailUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/blog-thumbnails/${fileName}`;

    // Check duplicate slug
    let finalSlug = blogData.slug;
    const { data: existingSlug } = await supabase.from('blogs').select('slug').eq('slug', finalSlug).maybeSingle();
    if (existingSlug) {
      finalSlug = `${finalSlug}-${Date.now()}`;
    }

    // Insert to DB
    const { data: insertData, error: insertError } = await supabase.from('blogs').insert({
      title: blogData.title,
      slug: finalSlug,
      content: blogData.content,
      excerpt: blogData.excerpt,
      meta_description: blogData.meta_description,
      category: blogData.category,
      thumbnail_url: thumbnailUrl,
      status: 'published'
    }).select('slug, title').single();

    if (insertError) {
      console.error("DB Insert error:", insertError);
      return res.status(500).json({ success: false, message: 'DB Insert error', error: insertError });
    }

    return res.status(200).json({ success: true, slug: insertData.slug, title: insertData.title });

  } catch (error) {
    console.error('Blog generation error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
