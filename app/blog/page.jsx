import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export const metadata = {
  title: 'Blog — Digital Growth, Social Media & Web Insights',
  description: 'Practical insights on digital marketing, websites, social media strategy and building a stronger online business from Pune digital agency Inpixel Network.',
};

// Revalidate blog listing every 60 seconds
export const revalidate = 60;

export default async function BlogIndexPage() {
  const { data: posts, error } = await supabase
    .from('blogs')
    .select('id, title, slug, excerpt, category, thumbnail_url, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  const blogPosts = posts || [];

  return (
    <main>
      <section className="fresh-index-hero blog">
        <p className="fresh-kicker">Inpixel Blog</p>
        <h1>Ideas for<br /><em>digital growth.</em></h1>
        <p>Practical insights on digital marketing, websites, content and building a stronger online business.</p>
      </section>

      <section className="fresh-journal">
        <div className="fresh-journal-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
          {blogPosts.length === 0 ? (
            <p style={{ color: '#aaa', padding: '40px 0' }}>No blog posts published yet.</p>
          ) : (
            blogPosts.map((post) => {
              const dateStr = new Date(post.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
              return (
                <article key={post.id} style={{ background: '#18181f', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(240,165,0,0.15)', display: 'flex', flexDirection: 'column' }}>
                  {post.thumbnail_url && (
                    <Link href={`/blog/${post.slug}`}>
                      <img
                        src={post.thumbnail_url}
                        alt={post.title}
                        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                      />
                    </Link>
                  )}
                  <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#f0a500', fontWeight: 600 }}>
                        {post.category || 'Article'}
                      </span>
                      <time style={{ fontSize: '12px', color: '#888' }}>{dateStr}</time>
                    </div>
                    <h2 style={{ fontSize: '20px', lineHeight: 1.3, marginBottom: '12px', fontWeight: 700 }}>
                      <Link href={`/blog/${post.slug}`} style={{ color: '#fff', textDecoration: 'none' }}>
                        {post.title}
                      </Link>
                    </h2>
                    <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px', flex: 1 }}>
                      {post.excerpt || post.title}
                    </p>
                    <Link href={`/blog/${post.slug}`} style={{ color: '#f0a500', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>
                      Read article ↗
                    </Link>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
