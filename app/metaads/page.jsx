import PaymentButton from '../../components/PaymentButton';

export const metadata = {
  title: 'Meta Ads Management — ₹2,999/month',
  description: 'Backed by over 2 years of hands-on experience and ₹50L+ in managed ad spend. Structured Meta campaigns that convert.',
};

export default function MetaAdsPage() {
  const bars = [28, 42, 37, 61, 55, 78, 93];

  return (
    <main className="fresh-service-page service-metaads">
      <section className="fresh-detail-hero">
        <div>
          <p className="fresh-kicker">Paid growth</p>
          <h1>Every rupee<br /><em>has a job.</em></h1>
          <p>Backed by over 2 years of hands-on experience and ₹50 lakh+ in managed ad spend, we build structured Meta campaigns that turn budget into measurable business.</p>
          <a className="fresh-button dark" href="#fresh-plans">See plans ↓</a>
        </div>
      </section>

      <section className="ads-console">
        <div className="ads-console-head">
          <p className="fresh-kicker">Proven performance experience</p>
          <h2>₹50 lakh+<br />managed.</h2>
          <p>Over 2 years of hands-on Meta Ads campaign experience delivering measurable ROI.</p>
        </div>
        <div className="ads-chart">
          <div className="ads-bars">
            {bars.map((v, i) => (
              <i key={i} style={{ height: `${v}%` }}></i>
            ))}
          </div>
          <div className="ads-metrics">
            <span>
              <small>Ad spend managed</small>
              <strong>₹50L+</strong>
            </span>
            <span>
              <small>Experience</small>
              <strong>2+ yrs</strong>
            </span>
            <span>
              <small>Reporting</small>
              <strong>Weekly</strong>
            </span>
          </div>
        </div>
      </section>

      <section className="ads-flow">
        <article>
          <span>01</span>
          <h3>Full setup</h3>
          <p>Campaign architecture, Pixel and CAPI.</p>
        </article>
        <article>
          <span>02</span>
          <h3>Smart audiences</h3>
          <p>Interest, demographic and intent targeting.</p>
        </article>
        <article>
          <span>03</span>
          <h3>Active optimisation</h3>
          <p>Continuous budget and bid refinement.</p>
        </article>
        <article>
          <span>04</span>
          <h3>Weekly clarity</h3>
          <p>CPA and ROAS reporting without jargon.</p>
        </article>
      </section>

      <section className="fresh-plans" id="fresh-plans">
        <header>
          <p className="fresh-kicker">Simple pricing</p>
          <h2>Choose your<br /><em>starting point.</em></h2>
        </header>
        <div>
          <article className="featured">
            <small>Monthly management</small>
            <strong>₹2,999</strong>
            <p className="plan-includes-label">What’s included</p>
            <ul>
              <li>Campaign setup &amp; Pixel verification</li>
              <li>A/B audience &amp; creative testing</li>
              <li>Active weekly optimisation</li>
              <li>Weekly ROAS &amp; CPA reporting</li>
            </ul>
            <PaymentButton
              serviceId="metaads"
              planName="Meta Ads Management — ₹2,999/month"
              amount={299900}
              className="fresh-button light"
            >
              Choose plan ↗
            </PaymentButton>
          </article>
        </div>
      </section>

      <section className="fresh-service-cta">
        <p className="fresh-kicker">Have questions?</p>
        <h2>Let’s find the right<br />way forward.</h2>
        <a className="fresh-button dark" href="https://api.whatsapp.com/send/?phone=919697993131&text=Hello,+I+want+to+get+started+with+Inpixel+network" target="_blank" rel="noopener noreferrer">
          Talk to the studio ↗
        </a>
      </section>
    </main>
  );
}
