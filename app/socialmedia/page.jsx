import Link from 'next/link';
import PaymentButton from '../../components/PaymentButton';

export const metadata = {
  title: 'Social Media Management — ₹999/month',
  description: 'You focus on your business. We handle your social media. 15 posts every month (10 static + 5 carousels) designed, captioned, and scheduled for ₹999/mo.',
  openGraph: {
    title: 'Social Media Management — ₹999/month | Inpixel Network',
    description: '15 posts every month — 10 static + 5 carousels — designed, captioned, and scheduled. All for ₹999/month.',
  }
};

export default function SocialMediaPage() {
  return (
    <main className="fresh-service-page service-socialmedia">
      <section className="fresh-detail-hero">
        <div>
          <p className="fresh-kicker">Social Media Management</p>
          <h1>
            You focus on your business.<br />
            <em>We handle your social media.</em>
          </h1>
          <p>
            15 posts every month — 10 static + 5 carousels — designed, captioned, and scheduled. All for ₹999/month.
          </p>
          <a className="fresh-button dark" href="#fresh-plans">
            See plans ↓
          </a>
        </div>
      </section>

      {/* High-impact breakdown section */}
      <section className="sma-promise">
        <div className="sma-promise-copy">
          <p className="fresh-kicker">What you get every month</p>
          <h2>15 posts.<br />Done for you.</h2>
          <p>
            No briefs to write. No back-and-forth. We learn your brand, create the content and deliver it — ready to post.
          </p>
        </div>
        <div className="sma-breakdown">
          <div className="sma-item">
            <span className="sma-num">10</span>
            <div>
              <strong>Static Posts</strong>
              <p>Eye-catching graphics designed for your feed.</p>
            </div>
          </div>
          <div className="sma-item">
            <span className="sma-num">5</span>
            <div>
              <strong>Carousel Posts</strong>
              <p>Multi-slide posts that educate, engage and get saved.</p>
            </div>
          </div>
          <div className="sma-item sma-item-sm">
            <span className="sma-tick">✓</span>
            <div>
              <strong>Captions &amp; Hashtags</strong>
              <p>On-brand copy + targeted hashtags for every post.</p>
            </div>
          </div>
          <div className="sma-item sma-item-sm">
            <span className="sma-tick">✓</span>
            <div>
              <strong>Monthly Report</strong>
              <p>Clear numbers on reach, engagement and what worked.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gold Price Banner */}
      <section className="sma-price-banner">
        <div className="sma-price-inner">
          <div className="sma-price-left">
            <p className="sma-eyebrow">One simple price</p>
            <div className="sma-price-tag">
              ₹999<span>/month</span>
            </div>
            <p className="sma-price-sub">No hidden fees. No long-term contracts. Cancel anytime.</p>
          </div>
          <div className="sma-price-right">
            <PaymentButton
              serviceId="socialmedia"
              planName="Social Media Package — ₹999/month"
              amount={99900}
              className="fresh-button dark sma-cta"
            >
              Choose Plan ↗
            </PaymentButton>
            <a className="sma-wa" href="https://api.whatsapp.com/send/?phone=919697993131" target="_blank" rel="noopener noreferrer">
              Have a question? Chat on WhatsApp →
            </a>
          </div>
        </div>
      </section>

      {/* Plan Card */}
      <section className="fresh-plans" id="fresh-plans">
        <header>
          <p className="fresh-kicker">Simple pricing</p>
          <h2>Choose your<br /><em>starting point.</em></h2>
        </header>
        <div>
          <article className="featured">
            <small>Social Media Package</small>
            <strong>₹999</strong>
            <p className="plan-includes-label">What’s included</p>
            <ul>
              <li>10 Static Posts</li>
              <li>5 Carousel Posts</li>
              <li>Captions &amp; Hashtags</li>
              <li>Monthly Report</li>
            </ul>
            <PaymentButton
              serviceId="socialmedia"
              planName="Social Media Package — ₹999/month"
              amount={99900}
              className="fresh-button light"
            >
              Choose plan ↗
            </PaymentButton>
          </article>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="fresh-service-cta">
        <p className="fresh-kicker">Have questions?</p>
        <h2>Let’s find the right<br />way forward.</h2>
        <a className="fresh-button dark" href="https://api.whatsapp.com/send/?phone=919697993131" target="_blank" rel="noopener noreferrer">
          Talk to the studio ↗
        </a>
      </section>
    </main>
  );
}
