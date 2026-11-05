import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { data: blog } = await supabase
    .from('blogs')
    .select('title, excerpt, thumbnail_url, meta_title, meta_description, keywords')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single();

  if (!blog) {
    return { title: 'Post Not Found' };
  }

  const title = blog.meta_title || blog.title;
  const description = blog.meta_description || blog.excerpt || blog.title;
  const image = blog.thumbnail_url || '/logo1.jpeg';

  return {
    title,
    description,
    keywords: blog.keywords ? blog.keywords.split(',').map((k) => k.trim()) : [],
    openGraph: {
      title,
      description,
      type: 'article',
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { data: blog } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single();

  if (!blog) {
    notFound();
  }

  const dateStr = new Date(blog.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main style={{ maxWidth: '840px', margin: '0 auto', padding: '60px 24px 120px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Link href="/blog" style={{ color: '#f0a500', fontSize: '14px', textDecoration: 'none' }}>
          ← Back to all articles
        </Link>
      </div>

      <header style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f0a500', fontWeight: 600 }}>
            {blog.category || 'Article'}
          </span>
          <span style={{ color: '#666' }}>•</span>
          <time style={{ fontSize: '13px', color: '#888' }}>{dateStr}</time>
          <span style={{ color: '#666' }}>•</span>
          <span style={{ fontSize: '13px', color: '#888' }}>By {blog.author_name || 'Inpixel Network'}</span>
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', lineHeight: 1.15, fontWeight: 800, color: '#fff', marginBottom: '20px' }}>
          {blog.title}
        </h1>
        {blog.excerpt && (
          <p style={{ fontSize: '18px', color: '#aaa', lineHeight: 1.6 }}>
            {blog.excerpt}
          </p>
        )}
      </header>

      {blog.thumbnail_url && (
        <div style={{ marginBottom: '48px', borderRadius: '16px', overflow: 'hidden' }}>
          <img
            src={blog.thumbnail_url}
            alt={blog.title}
            style={{ width: '100%', maxHeight: '480px', objectFit: 'cover' }}
          />
        </div>
      )}

      <article
        className="blog-content-body"
        style={{
          color: '#d4d4dc',
          fontSize: '17px',
          lineHeight: 1.8,
        }}
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      <div style={{ marginTop: '70px', padding: '40px', background: '#18181f', borderRadius: '18px', border: '1px solid rgba(240,165,0,0.2)', textAlign: 'center' }}>
        <p className="fresh-kicker" style={{ color: '#f0a500', marginBottom: '10px' }}>Grow your business</p>
        <h2 style={{ fontSize: '28px', color: '#fff', marginBottom: '16px' }}>Ready to elevate your digital presence?</h2>
        <p style={{ color: '#aaa', marginBottom: '28px', maxWidth: '480px', margin: '0 auto 28px' }}>
          From social media management to custom high-converting websites, we help brands build lasting momentum.
        </p>
        <Link href="/services" className="fresh-button dark" style={{ display: 'inline-block' }}>
          Explore our services ↗
        </Link>
      </div>
    </main>
  );
}
