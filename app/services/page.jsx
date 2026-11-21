import Link from 'next/link';
import ContactFormPopup from '../../components/ContactFormPopup';
import BusinessSoftwareRow from '../../components/BusinessSoftwareRow';

export const metadata = {
  title: 'Our Services — Inpixel Network',
  description: 'Built to make brands move. Web development, Social Media, AI Videos, and Meta Ads for growing businesses.',
};

export default function ServicesPage() {
  const services = [
    {
      slug: 'socialmedia',
      num: '01',
      eyebrow: 'Content + Strategy',
      title: 'Social Media Management',
      intro: '15 posts every month — 10 static + 5 carousels — designed, captioned, and scheduled. All for ₹999/month.'
    },
    {
      slug: 'metaads',
      num: '02',
      eyebrow: 'Facebook + Instagram Ads',
      title: 'Meta Ads Management',
      intro: 'Backed by over 2 years of hands-on experience and ₹50 lakh+ in managed ad spend, we build structured Meta campaigns that turn budget into measurable business.'
    },
    {
      slug: 'quotation',
      num: '03',
      eyebrow: 'Smart Business Tools',
      title: 'Quotation Software',
      intro: 'Generate professional quotes in seconds and close deals faster. Try it free.'
    },
    {
      slug: 'webdevelopment',
      num: '04',
      eyebrow: 'Design + Development',
      title: 'Websites That Convert',
      intro: 'Strategy, UX, design and development in one focused sprint. Built fast, responsive everywhere, and ready to sell.'
    },
    {
      slug: 'aivideos',
      num: '05',
      eyebrow: 'AI Production Studio',
      title: 'AI Video Studio',
      intro: 'High-retention vertical video made for Reels, Shorts and TikTok—without the timelines or cost of a traditional shoot.'
    }
  ];


  return (
    <main>
      <section className="fresh-index-hero">
        <p className="fresh-kicker">Capabilities</p>
        <h1>Services that<br /><em>grow your business.</em></h1>
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
        <BusinessSoftwareRow num="06" isServicePage={true} />
      </section>
      <ContactFormPopup />
    </main>
  );
}
