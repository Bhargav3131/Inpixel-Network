const { createClient } = require('@supabase/supabase-js');

module.exports = async function (req, res) {
  // We expect ?slug=something
  const slug = req.query.slug;

  if (!slug) {
    return serve404(res, 'No blog slug provided.');
  }

  try {
    const supabaseUrl = 'https://xcsdnrkgqkacmqdmedju.supabase.co';
    // Use service role key to fetch content from backend (from Vercel env or hardcoded fallback if needed, 
    // but the instruction says "service_role key from env vars". We use process.env.SUPABASE_SERVICE_ROLE_KEY)
    // As a fallback in dev, we can use the anon key if service role is missing, but service role is preferred.
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

    // Render Full HTML
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
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
  <link rel="icon" type="image/png" href="/logo1.jpeg">
  
  <!-- JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://inpixelnetwork.in/blog/${slug}"
    },
    "headline": "${title}",
    "description": "${excerpt}",
    "image": "${thumbUrl}",  
    "author": {
      "@type": "Organization",
      "name": "${author}"
    },  
    "publisher": {
      "@type": "Organization",
      "name": "Inpixel Network",
      "logo": {
        "@type": "ImageObject",
        "url": "https://inpixelnetwork.in/logo1.jpeg"
      }
    },
    "datePublished": "${pubDate}"
  }
  </script>

  <style>
    body {
      background: var(--black);
      color: var(--text);
      font-family: 'DM Sans', sans-serif;
    }
    
    /* Blog Post Specific Styles */
    .blog-post-wrapper {
      max-width: 800px;
      margin: 120px auto 60px;
      padding: 0 24px;
    }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--gold);
      font-family: 'Space Mono', monospace;
      font-size: 0.85rem;
      text-transform: uppercase;
      text-decoration: none;
      margin-bottom: 30px;
      letter-spacing: 0.05em;
      transition: color 0.3s;
    }
    .back-link:hover { color: var(--gold-light); }
    
    .blog-post-header {
      margin-bottom: 40px;
    }
    .blog-post-cat {
      display: inline-block;
      padding: 6px 12px;
      background: rgba(240,165,0,0.1);
      color: var(--gold);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      font-family: 'Space Mono', monospace;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 20px;
    }
    .blog-post-header h1 {
      font-family: 'Syne', sans-serif;
      font-size: clamp(2rem, 4vw, 3.2rem);
      font-weight: 800;
      color: var(--white);
      line-height: 1.1;
      letter-spacing: -0.02em;
      margin-bottom: 24px;
    }
    .blog-post-meta {
      display: flex;
      align-items: center;
      gap: 16px;
      color: var(--text-muted);
      font-size: 0.95rem;
    }
    .blog-post-thumb {
      width: 100%;
      aspect-ratio: 16/9;
      border-radius: var(--radius-lg);
      overflow: hidden;
      margin-bottom: 40px;
      border: 1px solid var(--border);
    }
    .blog-post-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    /* Content Styling */
    .blog-post-content {
      font-size: 1.05rem;
      line-height: 1.8;
      color: var(--text);
    }
    .blog-post-content h2, 
    .blog-post-content h3, 
    .blog-post-content h4 {
      font-family: 'Syne', sans-serif;
      color: var(--white);
      margin: 2em 0 1em;
      font-weight: 700;
    }
    .blog-post-content h2 { font-size: 1.8rem; }
    .blog-post-content h3 { font-size: 1.4rem; }
    .blog-post-content p {
      margin-bottom: 1.5em;
    }
    .blog-post-content a {
      color: var(--gold);
      text-decoration: underline;
      text-underline-offset: 4px;
    }
    .blog-post-content a:hover { color: var(--gold-light); }
    .blog-post-content ul, 
    .blog-post-content ol {
      margin-bottom: 1.5em;
      padding-left: 1.5em;
    }
    .blog-post-content li {
      margin-bottom: 0.5em;
    }
    .blog-post-content blockquote {
      border-left: 4px solid var(--gold);
      padding: 1em 1.5em;
      margin: 2em 0;
      background: var(--surface);
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
      font-style: italic;
      color: var(--text-muted);
    }
    .blog-post-content img {
      max-width: 100%;
      height: auto;
      border-radius: var(--radius);
      margin: 2em 0;
      border: 1px solid var(--border);
    }
    .blog-post-content code {
      background: var(--surface2);
      padding: 0.2em 0.4em;
      border-radius: 4px;
      font-family: 'Space Mono', monospace;
      font-size: 0.9em;
      color: var(--gold-light);
    }
    .blog-post-content pre {
      background: var(--surface2);
      padding: 1.5em;
      border-radius: var(--radius);
      overflow-x: auto;
      margin: 2em 0;
      border: 1px solid var(--border);
    }
    .blog-post-content pre code {
      background: none;
      padding: 0;
      color: inherit;
    }
    .blog-post-content strong, .blog-post-content b {
      color: var(--white);
      font-weight: 700;
    }

    /* Standard Footer Base */
    .site-footer {
      border-top: 1px solid var(--border);
      background: var(--black);
      padding: 60px 48px 20px;
      margin-top: 80px;
    }
    .footer-inner {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.5fr;
      gap: 40px;
      margin-bottom: 40px;
      max-width: 1400px;
      margin: 0 auto 40px;
    }
    .footer-brand-desc {
      color: var(--text-muted);
      font-size: 0.9rem;
      line-height: 1.6;
      margin: 16px 0;
    }
    .footer-social {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--white);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s;
    }
    .footer-social:hover { color: var(--gold); }
    .footer-social svg { width: 20px; stroke: currentColor; }
    .footer-col-title {
      font-family: 'Syne', sans-serif;
      font-size: 1.1rem;
      color: var(--white);
      margin-bottom: 20px;
    }
    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .footer-links a {
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.3s;
      font-size: 0.9rem;
    }
    .footer-links a:hover { color: var(--gold); }
    .footer-contact li {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .footer-contact svg {
      width: 18px;
      stroke: var(--gold);
      flex-shrink: 0;
      margin-top: 2px;
    }
    .footer-bottom {
      border-top: 1px solid var(--border);
      padding-top: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }
    .footer-bottom-inner {
      display: flex;
      justify-content: space-between;
      color: var(--text-muted);
      font-size: 0.85rem;
    }
    .footer-bottom-links a {
      color: var(--text-muted);
      text-decoration: none;
    }
    .footer-bottom-links a:hover { color: var(--gold); }
    
    @media (max-width: 900px) {
      .footer-inner { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 600px) {
      .footer-inner { grid-template-columns: 1fr; }
      .site-footer { padding: 40px 20px 20px; }
      .footer-bottom-inner { flex-direction: column; text-align: center; gap: 10px; }
      .blog-post-wrapper { margin-top: 100px; }
    }
  </style>
</head>
<body>
  <div class="grid-bg"></div>

  <!-- NAV -->
  <nav id="nav">
    <a class="nav-logo" href="https://inpixelnetwork.in/">
      <img src="/logo.jpeg" alt="Inpixel Network">
      <span>Inpixel Network</span>
    </a>
    <div class="nav-links" id="navLinks">
      <a href="https://inpixelnetwork.in/webdevelopment/">Websites</a>
      <a href="https://inpixelnetwork.in/aivideos/">AI Videos</a>
      <a href="https://inpixelnetwork.in/metaads/">Meta Ads</a>
      <a href="https://inpixelnetwork.in/socialmedia/">Social Media</a>
      <a href="https://inpixelnetwork.in/quotation/">Quotation</a>
      <a href="https://inpixelnetwork.in/#contact">Contact</a>
    </div>
    <button class="nav-hamburger" id="navHamburger" aria-label="Open menu" onclick="toggleNav()"><span></span><span></span><span></span></button>
  </nav>

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
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <a href="https://inpixelnetwork.in/" class="footer-logo">
          <img src="/logo.jpeg" alt="Inpixel Network">
          <span>Inpixel Network</span>
        </a>
        <p class="footer-brand-desc">Transforming digital presence, one pixel at a time. Pune's go-to agency for growth-driven brands.</p>
        <a href="https://instagram.com/inpixel_network" target="_blank" rel="noopener noreferrer" class="footer-social" aria-label="Instagram">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8">
            <rect x="2" y="2" width="20" height="20" rx="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
          </svg>
          @inpixel_network
        </a>
      </div>
      <div class="footer-col">
        <h5 class="footer-col-title">Quick Links</h5>
        <ul class="footer-links">
          <li><a href="https://inpixelnetwork.in/">Home</a></li>
          <li><a href="https://inpixelnetwork.in/services/">Services</a></li>
          <li><a href="https://inpixelnetwork.in/#about">About Us</a></li>
          <li><a href="https://inpixelnetwork.in/#process">Our Process</a></li>
          <li><a href="https://inpixelnetwork.in/#contact">Contact</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h5 class="footer-col-title">Legal</h5>
        <ul class="footer-links">
          <li><a href="https://inpixelnetwork.in/terms/">Terms & Conditions</a></li>
          <li><a href="https://inpixelnetwork.in/privacy/">Privacy Policy</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h5 class="footer-col-title">Contact</h5>
        <ul class="footer-links footer-contact">
          <li>
            <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <a href="mailto:supportinpixelnetwork@gmail.com">supportinpixelnetwork@gmail.com</a>
          </li>
          <li>
            <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>Pune, Maharashtra, India</span>
          </li>
          <li>
            <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>Mon–Sat, 9 AM – 6 PM</span>
          </li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="footer-bottom-inner">
        <span>© 2026 Inpixel Network. All rights reserved.</span>
        <span class="footer-bottom-links">
          <a href="https://inpixelnetwork.in/terms/">Terms</a>
          <span>·</span>
          <a href="https://inpixelnetwork.in/privacy/">Privacy</a>
        </span>
      </div>
    </div>
  </footer>

  <script>
    function toggleNav() {
      const links = document.getElementById('navLinks');
      const hamburger = document.getElementById('navHamburger');
      if(links.style.display === 'flex') {
        links.style.display = 'none';
        hamburger.classList.remove('active');
      } else {
        links.style.display = 'flex';
        links.style.flexDirection = 'column';
        links.style.position = 'absolute';
        links.style.top = '100%';
        links.style.left = '0';
        links.style.right = '0';
        links.style.background = 'var(--black)';
        links.style.padding = '20px';
        hamburger.classList.add('active');
      }
    }
    
    window.addEventListener('scroll', () => {
      if(window.scrollY > 50) {
        document.getElementById('nav').classList.add('scrolled');
      } else {
        document.getElementById('nav').classList.remove('scrolled');
      }
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
    body { background: #060608; color: #E8E8F0; font-family: sans-serif; text-align: center; padding-top: 20%; }
    h1 { color: #F0A500; font-size: 3rem; margin-bottom: 1rem; }
    p { margin-bottom: 2rem; color: #6B6B80; }
    a { color: #060608; background: #F0A500; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; }
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
