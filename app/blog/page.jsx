import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export const metadata = {
  title: 'Blog — Digital Growth, Social Media & Web Insights',
  description: 'Practical insights on digital marketing, websites, social media strategy and building a stronger online business from Pune digital agency Inpixel Network.',
};

export const revalidate = 60;

export default async function BlogIndexPage() {
  const { data: posts } = await supabase
    .from('blogs')
    .select('id, title, slug, excerpt, category, thumbnail_url, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  const blogPosts = posts || [];

  return (
    <main>
      <section className="fresh-index-hero blog">
        <p className="fresh-kicker">Inpixel Blog</p>
        <h1>
          Ideas for<br />
          <em>digital growth.</em>
        </h1>
        <p>
          Practical insights on digital marketing, websites, content and building a stronger online business.
        </p>
      </section>

      <section className="inpixel-blog-section">
        {blogPosts.length === 0 ? (
          <p style={{ color: '#67635c', padding: '40px 0', textAlign: 'center' }}>
            No blog posts published yet.
          </p>
        ) : (
          <div className="inpixel-blog-grid">
            {blogPosts.map((post) => {
              const dateStr = new Date(post.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <Link key={post.id} href={`/blog/${post.slug}`} className="inpixel-blog-card">
                  <div className="inpixel-blog-card-img">
                    <img
                      src={post.thumbnail_url || '/logo1.jpeg'}
                      alt={post.title}
                      loading="lazy"
                    />
                  </div>
                  <div className="inpixel-blog-card-body">
                    <div className="inpixel-blog-card-meta">
                      <span className="inpixel-blog-pill">{post.category || 'Article'}</span>
                      <time className="inpixel-blog-date">{dateStr}</time>
                    </div>
                    <h2 className="inpixel-blog-card-title">{post.title}</h2>
                    <p className="inpixel-blog-card-excerpt">
                      {post.excerpt || post.title}
                    </p>
                    <span className="inpixel-blog-read-more">
                      Read article ↗
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
