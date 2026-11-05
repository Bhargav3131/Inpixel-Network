export const metadata = {
  title: 'Terms & Conditions — Inpixel Network',
  description: 'Terms of Service for Inpixel Network digital growth agency.',
};

export default function TermsPage() {
  return (
    <main>
      <section className="fresh-legal-hero">
        <p className="fresh-kicker">The fine print</p>
        <h1>Terms &amp; Conditions</h1>
        <p>Last updated: October 2026</p>
      </section>

      <section className="fresh-legal">
        <aside>
          <span>INPIXEL NETWORK</span>
          <p>Clear terms, written for humans.</p>
          <a href="mailto:supportinpixelnetwork@gmail.com">Questions? Email us ↗</a>
        </aside>

        <article className="fresh-legal-copy">
          <div className="legal-section">
            <h2>1. About Us</h2>
            <p>Inpixel Network is a digital growth agency based in Pune, Maharashtra, India. We provide services including social media management, website development, and AI-powered advertising. For any queries, contact us at <a href="mailto:supportinpixelnetwork@gmail.com">supportinpixelnetwork@gmail.com</a>.</p>
          </div>

          <div className="legal-section">
            <h2>2. Services</h2>
            <p>Inpixel Network offers the following services:</p>
            <ul>
              <li><strong>Social Media Management:</strong> Content creation, scheduling, community management, and performance reporting.</li>
              <li><strong>Website Development:</strong> Design, development, and deployment of websites, landing pages, and web applications.</li>
              <li><strong>AI Ads:</strong> AI-powered advertising campaign creation, management, and optimisation across Meta and Google platforms.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>3. Payments &amp; Fees</h2>
            <ul>
              <li>All fees are as agreed in the service proposal or invoice issued to the client.</li>
              <li>Payments are processed securely via verified gateways (Razorpay). Delayed payments may result in a pause of services.</li>
              <li>All prices are inclusive of applicable GST unless stated otherwise.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>4. Intellectual Property</h2>
            <p>Upon full payment, the client owns the final deliverables produced specifically for their project. Inpixel Network retains the right to showcase completed work in our portfolio and marketing materials.</p>
          </div>

          <div className="legal-section">
            <h2>5. Limitation of Liability</h2>
            <p>Inpixel Network's liability shall not exceed the total fees paid by the client for the relevant service in the preceding three months.</p>
          </div>
        </article>
      </section>
    </main>
  );
}
