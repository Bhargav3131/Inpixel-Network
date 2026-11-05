import Link from 'next/link';

export const metadata = {
  title: 'Our Services — Inpixel Network',
  description: 'Built to make brands move. Web development, Social Media, AI Videos, and Meta Ads for growing businesses.',
};

export default function ServicesPage() {
  const services = [
    {
      slug: 'webdevelopment',
      num: '01',
      eyebrow: 'Digital flagship',
      title: 'Websites that turn visits into value',
      intro: 'Strategy, UX, design and development in one focused sprint. Built fast, responsive everywhere, and ready to sell.'
    },
    {
      slug: 'socialmedia',
      num: '02',
      eyebrow: 'Social Media Management',
      title: 'You focus on your business. We handle your social media.',
      intro: '15 posts every month — 10 static + 5 carousels — designed, captioned, and scheduled. All for ₹999/month.'
    },
    {
      slug: 'aivideos',
      num: '03',
      eyebrow: 'AI production studio',
      title: 'More motion. Less production drag.',
      intro: 'High-retention vertical video made for Reels, Shorts and TikTok—without the timelines or cost of a traditional shoot.'
    },
    {
      slug: 'metaads',
      num: '04',
      eyebrow: 'Paid growth',
      title: 'Every rupee has a job.',
      intro: 'Backed by over 2 years of hands-on experience and ₹50 lakh+ in managed ad spend, we build structured Meta campaigns that turn budget into measurable business.'
    }
  ];

  return (
    <main>
      <section className="fresh-index-hero">
        <p className="fresh-kicker">Capabilities</p>
        <h1>Built to make<br /><em>brands move.</em></h1>
        <p>Pick one focused service or connect them into a complete growth system.</p>
      </section>

      <section className="fresh-service-index">
        {services.map((s) => (
          <Link key={s.slug} href={`/${s.slug}`}>
            <span>{s.num}</span>
            <div>
              <small>{s.eyebrow}</small>
              <h2>{s.title}</h2>
              <p>{s.intro}</p>
            </div>
            <b>Explore ↗</b>
          </Link>
        ))}
      </section>
    </main>
  );
}
