import Link from 'next/link';
import PaymentButton from '../../components/PaymentButton';

export const metadata = {
  title: 'Websites That Turn Visits Into Value — From ₹2,999',
  description: 'Fast, mobile-first websites engineered to convert attention into action. Strategy, UX, design and development in one sprint.',
};

export default function WebDevPage() {
  return (
    <main className="fresh-service-page service-webdevelopment">
      <section className="fresh-detail-hero">
        <div>
          <p className="fresh-kicker">Digital flagship</p>
          <h1>Websites that turn<br /><em>visits into value.</em></h1>
          <p>Strategy, UX, design and development in one focused sprint. Built fast, responsive everywhere, and ready to sell.</p>
          <a className="fresh-button dark" href="#fresh-plans">See plans ↓</a>
        </div>
        <figure>
          <img src="/assets/images/website-mockup.png" alt="Website mockup" />
          <figcaption>
            <strong>7 days</strong>
            <span>starter delivery</span>
          </figcaption>
        </figure>
      </section>

      <section className="web-browser-stage">
        <div className="browser-chrome">
          <i></i><i></i><i></i>
          <span>yourbrand.in</span>
        </div>
        <img src="/assets/images/website-mockup.png" alt="Website design showcase" />
      </section>

      <section className="web-system">
        <header>
          <p className="fresh-kicker">Built from the customer backwards</p>
          <h2>Strategy first.<br />Then every pixel.</h2>
        </header>
        <div className="web-system-grid">
          <article>
            <span>01</span>
            <h3>Mobile-first</h3>
            <p>Designed around the screen your customers use most.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Conversion-led</h3>
            <p>Every page gives visitors a clear next action.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Search-ready</h3>
            <p>Technical foundations built for discoverability.</p>
          </article>
          <article>
            <span>04</span>
            <h3>Easy to scale</h3>
            <p>A clean system that grows with your business.</p>
          </article>
        </div>
      </section>

      <section className="fresh-plans" id="fresh-plans">
        <header>
          <p className="fresh-kicker">Simple pricing</p>
          <h2>Choose your<br /><em>starting point.</em></h2>
        </header>
        <div>
          <article>
            <small>Starter</small>
            <strong>₹2,999</strong>
            <p className="plan-includes-label">What’s included</p>
            <ul>
              <li>Single landing page</li>
              <li>Mobile-first design</li>
              <li>Contact form</li>
            </ul>
            <PaymentButton
              serviceId="webdevelopment-starter"
              planName="Starter Plan — ₹2,999"
              amount={299900}
              className="fresh-button dark"
            >
              Choose plan ↗
            </PaymentButton>
          </article>
          <article className="featured">
            <small>Professional</small>
            <strong>₹5,999</strong>
            <p className="plan-includes-label">What’s included</p>
            <ul>
              <li>Up to 5 pages</li>
              <li>Custom UI design</li>
              <li>Analytics + Meta Pixel</li>
            </ul>
            <PaymentButton
              serviceId="webdevelopment-pro"
              planName="Professional Plan — ₹5,999"
              amount={599900}
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
        <a className="fresh-button dark" href="https://api.whatsapp.com/send/?phone=919697993131" target="_blank" rel="noopener noreferrer">
          Talk to the studio ↗
        </a>
      </section>
    </main>
  );
}
