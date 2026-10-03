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

function wrapText(text, maxCharsPerLine = 32) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.slice(0, 3); // Max 3 lines
}

function generateThumbnailSVG(title, category) {
  const lines = wrapText(title, 28);
  const startY = lines.length === 1 ? 300 : lines.length === 2 ? 270 : 235;
  const lineSvg = lines.map((line, idx) => 
    `<text x="100" y="${startY + (idx * 64)}" fill="#ffffff" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" font-size="48" font-weight="800" letter-spacing="-0.02em">${escapeXml(line)}</text>`
  ).join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0b0b10"/>
        <stop offset="50%" stop-color="#060608"/>
        <stop offset="100%" stop-color="#121118"/>
      </linearGradient>
      <radialGradient id="glow" cx="85%" cy="20%" r="60%">
        <stop offset="0%" stop-color="#f0a500" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#060608" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="glow2" cx="15%" cy="80%" r="50%">
        <stop offset="0%" stop-color="#f0a500" stop-opacity="0.12"/>
        <stop offset="100%" stop-color="#060608" stop-opacity="0"/>
      </radialGradient>
    </defs>

    <!-- Background -->
    <rect width="1200" height="630" fill="url(#bg)"/>
    <rect width="1200" height="630" fill="url(#glow)"/>
    <rect width="1200" height="630" fill="url(#glow2)"/>

    <!-- Outer Card Frame -->
    <rect x="50" y="50" width="1100" height="530" rx="20" fill="none" stroke="rgba(240,165,0,0.18)" stroke-width="1.5"/>

    <!-- Category Pill Badge -->
    <g transform="translate(100, 110)">
      <rect width="220" height="38" rx="19" fill="rgba(240,165,0,0.12)" stroke="rgba(240,165,0,0.4)" stroke-width="1"/>
      <circle cx="20" cy="19" r="4" fill="#f0a500"/>
      <text x="34" y="24" fill="#f0a500" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" font-size="13" font-weight="700" letter-spacing="0.08em" text-transform="uppercase">${escapeXml(category.toUpperCase().substring(0, 22))}</text>
    </g>

    <!-- Title Lines (Wrapped Cleanly) -->
    ${lineSvg}

    <!-- Bottom Meta & Branding -->
    <line x1="100" y1="500" x2="1100" y2="500" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    <text x="100" y="534" fill="#f0a500" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" font-size="16" font-weight="700" letter-spacing="0.05em">INPIXEL NETWORK</text>
    <text x="1100" y="534" text-anchor="end" fill="rgba(255,255,255,0.4)" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" font-size="14">inpixelnetwork.in/blog</text>
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
         - "image_prompt": A natural, catchy, realistic photographic prompt (30-50 words) depicting this topic (e.g. creative team in a sleek studio, hands typing on modern laptop with glowing dashboards, modern tech office, camera equipment, elegant commercial photography, warm cinematic natural lighting, shallow depth of field, 4k). Strict rule: absolutely NO text, NO letters, NO words in the image.
      3. Brand Mention: Naturally mention Inpixel Network's services (web development, AI videos, meta ads, social media management, quotation software) where relevant, without sounding too salesy.
    `;

    let text = '';
    let lastError = null;

    // Use models directly confirmed available in your Google account
    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-flash-latest',
      'gemini-3.8-flash',
      'gemini-2.5-flash-lite'
    ];

    for (const modelName of modelsToTry) {
      try {
        const g_url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`;
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

        const resJson = await response.json();
        if (resJson.candidates && resJson.candidates[0]?.content?.parts?.[0]?.text) {
          text = resJson.candidates[0].content.parts[0].text;
          break; // Success!
        } else {
          lastError = resJson.error || new Error(`Model ${modelName} returned no candidate`);
          console.warn(`Model ${modelName} attempt:`, lastError);
        }
      } catch (gErr) {
        lastError = gErr;
        console.warn(`Fetch error on ${modelName}:`, gErr);
      }
    }

    // 2. Second step: If Gemini fails, immediately generate with OpenAI ChatGPT (gpt-4o-mini)
    if (!text && process.env.OPENAI_API_KEY) {
      try {
        const OpenAI = require('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const comp = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: "You are an expert marketing blogger. Output only valid JSON." },
            { role: "user", content: prompt }
          ]
        });
        text = comp.choices[0]?.message?.content || '';
      } catch (oaiErr) {
        console.error("OpenAI ChatGPT fallback error:", oaiErr);
        lastError = oaiErr;
      }
    }

    if (!text) {
      const errMsg = lastError?.message || JSON.stringify(lastError) || 'AI generation service temporarily busy';
      return res.status(500).json({ success: false, message: `AI Service Error: ${errMsg}`, error: lastError });
    }
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    let blogData;
    try {
      blogData = JSON.parse(text);
    } catch(parseErr) {
      console.error("Failed to parse AI output:", text);
      return res.status(500).json({ success: false, message: 'AI returned invalid JSON format. Please try again.' });
    }

    // 1. Ask Gemini to write an image generation prompt in the JSON response
    const imagePrompt = blogData.image_prompt || `High-end editorial photograph illustrating ${blogData.category}, natural ambient lighting, candid executive workspace, modern tech environment, cinematic depth of field, 35mm lens, award-winning photography, no text`;

    let thumbnailUrl = '';
    let imageBuffer = null;
    let imageContentType = 'image/png';
    let fileExt = 'png';

    // High-Resolution Natural Photography Engine (100% Free & Unlimited)
    // Curated high-res editorial photography matching the blog category/topic
    try {
      const queryKeyword = encodeURIComponent(blogData.category || topic || 'digital marketing agency');
      const photoUrl = `https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&h=675&q=80`; // reliable base
      
      // Dynamic thematic photography search
      const thematicPhotos = {
        'social media': 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1200&h=675&q=80',
        'meta ads': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&h=675&q=80',
        'web development': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&h=675&q=80',
        'ai': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&h=675&q=80',
        'marketing': 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=1200&h=675&q=80',
        'branding': 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&h=675&q=80',
        'seo': 'https://images.unsplash.com/photo-1571721795195-a2ca2d3370a9?auto=format&fit=crop&w=1200&h=675&q=80',
        'business': 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&h=675&q=80'
      };

      let selectedPhoto = photoUrl;
      const lowerCat = (blogData.category + ' ' + blogData.title).toLowerCase();
      for (const [key, url] of Object.entries(thematicPhotos)) {
        if (lowerCat.includes(key)) {
          selectedPhoto = url;
          break;
        }
      }

      // Download the photo buffer to store inside your Supabase bucket
      const photoFetch = await fetch(selectedPhoto);
      if (photoFetch.ok) {
        const arrayBuf = await photoFetch.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuf);
        imageContentType = 'image/jpeg';
        fileExt = 'jpg';
      }
    } catch (photoErr) {
      console.warn("Unsplash fetch warning:", photoErr);
    }

    // High-end luxury SVG poster fallback if internet fetch fails
    if (!imageBuffer) {
      const svgContent = generateThumbnailSVG(blogData.title, blogData.category);
      imageBuffer = Buffer.from(svgContent);
      imageContentType = 'image/svg+xml';
      fileExt = 'svg';
    }

    let fileName = `${blogData.slug}-${Date.now()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('blog-thumbnails')
      .upload(fileName, imageBuffer, { contentType: imageContentType, upsert: true });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return res.status(500).json({ success: false, message: 'Storage upload error: ' + uploadError.message });
    }

    thumbnailUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/blog-thumbnails/${fileName}`;

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
