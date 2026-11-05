import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const { data: posts } = await supabase
      .from('blogs')
      .select('slug')
      .eq('status', 'published');

    return (posts || []).map((post) => ({
      slug: post.slug,
    }));
  } catch (e) {
    return [];
  }
}

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
    <main className="blog-post-container">
      <Link href="/blog" className="blog-back-btn">
        ← Back to all articles
      </Link>

      <header className="blog-header">
        <div className="blog-header-tags">
          <span className="inpixel-blog-pill">{blog.category || 'Article'}</span>
          <span className="blog-author-line">
            {dateStr} • By {blog.author_name || 'Inpixel Network'}
          </span>
        </div>
        <h1 className="blog-title">{blog.title}</h1>
        {blog.excerpt && <p className="blog-excerpt-lead">{blog.excerpt}</p>}
      </header>

      {blog.thumbnail_url && (
        <div className="blog-hero-image-wrap">
          <img src={blog.thumbnail_url} alt={blog.title} />
        </div>
      )}

      <article
        className="blog-body-prose"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      <div className="blog-post-cta">
        <p className="fresh-kicker" style={{ color: '#f0a500', marginBottom: '8px' }}>
          Grow with Inpixel
        </p>
        <h3>Ready to elevate your digital presence?</h3>
        <p>
          From social media management to custom websites and AI video campaigns, we build systems that generate measurable momentum.
        </p>
        <Link href="/services" className="blog-post-cta-btn">
          Explore our services ↗
        </Link>
      </div>
    </main>
  );
}
