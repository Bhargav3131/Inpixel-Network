const { createClient } = require('@supabase/supabase-js');

module.exports = async function (req, res) {
  // We expect ?slug=something
  const slug = req.query.slug;

  if (!slug) {
    return serve404(res, 'No blog slug provided.');
  }

  try {
    const supabaseUrl = 'https://xcsdnrkgqkacmqdmedju.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhjc2RucmtncWthY21xZG1lZGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NzI2NzYsImV4cCI6MjA5NjE0ODY3Nn0.8X_Jr8JQmO3lojcxoG-hhz6FEPCOiqf3EQ4QR5vNRFI';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: blog, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !blog) {
      return serve404(res, 'Blog post not found.');
    }

    // Helpers
    function esc(str) {
      if (!str) return '';
      return String(str).replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
      );
    }

    function formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    }

    const title = esc(blog.title);
    const category = esc(blog.category || 'Uncategorized');
    const excerpt = esc(blog.excerpt || blog.title);
    const thumbUrl = esc(blog.thumbnail_url || 'https://inpixelnetwork.in/logo1.jpeg');
    const author = esc(blog.author_name || 'Inpixel Network');
    const pubDate = new Date(blog.created_at).toISOString();
    const displayDate = formatDate(blog.created_at);
    const content = blog.content || '';

    // Render Full HTML — uses fresh-build shell (new redesign nav + footer)
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Inpixel Network Blog</title>
  <meta name="description" content="${excerpt}">
  <link rel="canonical" href="https://inpixelnetwork.in/blog/${slug}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${excerpt}">
  <meta property="og:image" content="${thumbUrl}">
  <meta property="og:url" content="https://inpixelnetwork.in/blog/${slug}">
  <meta property="og:type" content="article">
  <meta property="article:published_time" content="${pubDate}">
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;700&family=Manrope:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
  <link rel="icon" type="image/png" href="/logo1.jpeg">
  
  <!-- JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": { "@type": "WebPage", "@id": "https://inpixelnetwork.in/blog/${slug}" },
    "headline": "${title}",
    "description": "${excerpt}",
    "image": "${thumbUrl}",
    "author": { "@type": "Organization", "name": "${author}" },
    "publisher": { "@type": "Organization", "name": "Inpixel Network", "logo": { "@type": "ImageObject", "url": "https://inpixelnetwork.in/logo1.jpeg" } },
    "datePublished": "${pubDate}"
  }
  <\/script>

  <style>
    .blog-post-wrapper {
      max-width: 800px;
      margin: 40px auto 60px;
      padding: 0 24px;
    }
    .back-link {
      display: inline-flex; align-items: center; gap: 8px;
      color: #f0a500; font-family: 'DM Mono', monospace; font-size: 0.85rem;
      text-transform: uppercase; text-decoration: none; margin-bottom: 30px;
      letter-spacing: 0.05em; transition: opacity 0.2s;
    }
    .back-link:hover { opacity: 0.7; }
    .blog-post-header { margin-bottom: 40px; }
    .blog-post-cat {
      display: inline-block; padding: 6px 14px;
      background: rgba(240,165,0,0.1); color: #f0a500;
      border: 1px solid rgba(240,165,0,0.3);
      font-family: 'DM Mono', monospace; font-size: 0.72rem;
      text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px;
    }
    .blog-post-header h1 {
      font-family: 'Syne', sans-serif; font-size: clamp(2rem, 4vw, 3.2rem);
      font-weight: 800; color: #151515; line-height: 1.1;
      letter-spacing: -0.04em; margin-bottom: 24px;
    }
    .blog-post-meta { display: flex; align-items: center; gap: 16px; color: #67635c; font-size: 0.95rem; }
    .blog-post-thumb { width: 100%; aspect-ratio: 16/9; overflow: hidden; margin-bottom: 40px; border: 1px solid rgba(21,21,21,0.12); border-radius: 18px; }
    .blog-post-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .blog-post-content { font-size: 1.05rem; line-height: 1.8; color: #3d3a35; }
    .blog-post-content h2, .blog-post-content h3, .blog-post-content h4 { font-family: 'Syne', sans-serif; color: #151515; margin: 2em 0 1em; font-weight: 700; letter-spacing: -0.04em; }
    .blog-post-content h2 { font-size: 1.8rem; }
    .blog-post-content h3 { font-size: 1.4rem; }
    .blog-post-content p { margin-bottom: 1.5em; }
    .blog-post-content a { color: #f0a500; text-decoration: underline; text-underline-offset: 4px; }
    .blog-post-content a:hover { opacity: 0.75; }
    .blog-post-content ul, .blog-post-content ol { margin-bottom: 1.5em; padding-left: 1.5em; }
    .blog-post-content li { margin-bottom: 0.5em; }
    .blog-post-content blockquote { border-left: 4px solid #f0a500; padding: 1em 1.5em; margin: 2em 0; background: #ebe6db; font-style: italic; color: #67635c; }
    .blog-post-content img { max-width: 100%; height: auto; margin: 2em 0; border: 1px solid rgba(21,21,21,0.1); border-radius: 8px; }
    .blog-post-content code { background: #ebe6db; padding: 0.2em 0.4em; font-family: 'DM Mono', monospace; font-size: 0.9em; color: #151515; }
    .blog-post-content pre { background: #151515; color: #ffd166; padding: 1.5em; overflow-x: auto; margin: 2em 0; border-radius: 8px; }
    .blog-post-content pre code { background: none; padding: 0; color: inherit; }
    .blog-post-content strong, .blog-post-content b { color: #151515; font-weight: 700; }
    @media (max-width: 600px) { .blog-post-wrapper { margin-top: 20px; padding: 0 16px; } }
  </style>
</head>
<body data-page="blog" class="fresh-build">
  <div class="fresh-shell">

    <!-- NAV -->
    <header class="fresh-nav">
      <a class="fresh-brand" href="/"><img src="/logo1.jpeg" alt="Inpixel Network"><span>Inpixel Network</span></a>
      <button class="fresh-menu" aria-label="Toggle menu" id="freshMenuBtn"><span></span><span></span></button>
      <nav id="freshNav">
        <a href="/webdevelopment/">Websites</a>
        <a href="/aivideos/">AI Videos</a>
        <a href="/metaads/">Meta Ads</a>
        <a href="/socialmedia/">Social Media</a>
        <a href="/quotation/">Quotation</a>
        <a class="fresh-nav-cta" href="/userlogin/">Client Login ↗</a>
      </nav>
    </header>

    <!-- CONTENT -->
    <main class="blog-post-wrapper">
      <a href="/blog/" class="back-link">← Back to Blog</a>
      
      <header class="blog-post-header">
        <div class="blog-post-cat">${category}</div>
        <h1>${title}</h1>
        <div class="blog-post-meta">
          <span>By ${author}</span>
          <span>·</span>
          <span>${displayDate}</span>
        </div>
      </header>
      
      <div class="blog-post-thumb">
        <img src="${thumbUrl}" alt="${title}">
      </div>
      
      <article class="blog-post-content">
        ${content}
      </article>
    </main>

    <!-- FOOTER -->
    <footer class="fresh-footer">
      <div>
        <a class="fresh-brand" href="/"><img src="/logo1.jpeg" alt="Inpixel Network"><span>Inpixel Network</span></a>
        <p>We turn ambitious businesses into memorable digital brands.</p>
      </div>
      <div>
        <small>Explore</small>
        <a href="/services/">Services</a>
        <a href="/quotation/">Quotation Software</a>
        <a href="/blog/">Blog</a>
      </div>
      <div>
        <small>Company</small>
        <a href="/terms/">Terms &amp; Conditions</a>
        <a href="/privacy/">Privacy Policy</a>
        <a href="/userlogin/">Client Portal</a>
      </div>
      <div>
        <small>Connect</small>
        <a href="mailto:supportinpixelnetwork@gmail.com">Email</a>
        <a href="https://instagram.com/inpixel_network" target="_blank" rel="noopener">Instagram</a>
        <a href="https://wa.me/919697993131" target="_blank" rel="noopener">WhatsApp</a>
      </div>
      <p class="fresh-copy">© 2026 Inpixel Network · Pune, India · <a href="/terms/">Terms</a> · <a href="/privacy/">Privacy</a></p>
    </footer>

  </div>

  <script>
    document.getElementById('freshMenuBtn')?.addEventListener('click', function() {
      document.getElementById('freshNav')?.classList.toggle('open');
    });
  </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);

  } catch (error) {
    console.error('API Error:', error);
    return serve404(res, 'Internal Server Error.');
  }
};

function serve404(res, message) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>404 Not Found</title>
  <style>
    body { background: #f4f0e7; color: #151515; font-family: sans-serif; text-align: center; padding-top: 20%; }
    h1 { color: #f0a500; font-size: 3rem; margin-bottom: 1rem; }
    p { margin-bottom: 2rem; color: #67635c; }
    a { color: #f4f0e7; background: #151515; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 99px; }
  </style>
</head>
<body>
  <h1>404</h1>
  <p>${message}</p>
  <a href="/blog/">Back to Blog</a>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(404).send(html);
}
