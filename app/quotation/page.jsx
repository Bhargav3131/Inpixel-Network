import PaymentButton from '../../components/PaymentButton';
import QuotationVideo from '../../components/QuotationVideo';

export const metadata = {
  title: 'Inpixel Quotation Software — ₹2,999 Lifetime',
  description: 'Professional quotations made in minutes. Branded PDF, GST calculation, unlimited quotes with one-time payment.',
};

export default function QuotationPage() {
  return (
    <main className="fresh-service-page service-quotation">
      {/* Preload the demo video — starts fetching immediately for instant playback */}
      <link rel="preload" as="video" href="/assets/demo-quotation.mp4" />

      <section className="fresh-detail-hero">
        <div>
          <p className="fresh-kicker">Business utility</p>
          <h1>Professional quotes.<br /><em>Made in minutes.</em></h1>
          <p>A focused quotation tool that helps your business look credible, move quickly and close work without subscription fatigue.</p>
          <a className="fresh-button dark" href="#fresh-plans">See plans ↓</a>
        </div>
      </section>

      <section className="quote-product">
        <QuotationVideo />
        <aside>
          <p className="fresh-kicker">From blank to sent</p>
          <h2>Look established.<br />Move faster.</h2>
          <article>
            <h3>Branded output</h3>
            <p>Your logo, business identity and details.</p>
          </article>
          <article>
            <h3>Instant PDF</h3>
            <p>Download polished quotations in one click.</p>
          </article>
          <article>
            <h3>Tax ready</h3>
            <p>GST, discounts and totals calculated cleanly.</p>
          </article>
          <article>
            <h3>Always yours</h3>
            <p>Future updates with no recurring fee.</p>
          </article>
        </aside>
      </section>

      <section className="fresh-plans" id="fresh-plans">
        <header>
          <p className="fresh-kicker">Simple pricing</p>
          <h2>Choose your<br /><em>starting point.</em></h2>
        </header>
        <div>
          <article className="featured">
            <small>Lifetime access</small>
            <strong>₹2,999</strong>
            <p className="plan-includes-label">What&apos;s included</p>
            <ul>
              <li>One payment · No subscription</li>
              <li>Unlimited quotations &amp; client records</li>
              <li>Instant GST PDF generation</li>
              <li>All future software updates</li>
            </ul>
            <PaymentButton
              serviceId="quotation"
              planName="Inpixel Quotation Software — ₹2,999 Lifetime"
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
        <h2>Let&apos;s find the right<br />way forward.</h2>
        <a className="fresh-button dark" href="https://api.whatsapp.com/send/?phone=919697993131&text=Hello,+I+want+to+get+started+with+Inpixel+network" target="_blank" rel="noopener noreferrer">
          Talk to the studio ↗
        </a>
      </section>
    </main>
  );
}
