export const metadata = {
  title: 'Privacy Policy — Inpixel Network',
  description: 'Privacy Policy for Inpixel Network.',
};

export default function PrivacyPage() {
  return (
    <main>
      <section className="fresh-legal-hero">
        <p className="fresh-kicker">Data &amp; Privacy</p>
        <h1>Privacy Policy</h1>
        <p>Last updated: October 2026</p>
      </section>

      <section className="fresh-legal">
        <aside>
          <span>INPIXEL NETWORK</span>
          <p>We respect your privacy and protect your data.</p>
          <a href="mailto:supportinpixelnetwork@gmail.com">Questions? Email us ↗</a>
        </aside>

        <article className="fresh-legal-copy">
          <div className="legal-section">
            <h2>1. Information We Collect</h2>
            <p>We collect information you provide directly to us when contacting us, requesting a quote, or ordering a service (such as your name, business name, phone number, and email address).</p>
          </div>

          <div className="legal-section">
            <h2>2. How We Use Information</h2>
            <p>We use collected data solely to deliver your requested services, process payments, communicate project updates, and improve our customer experience.</p>
          </div>

          <div className="legal-section">
            <h2>3. Data Protection &amp; Security</h2>
            <p>We do not sell, rent, or trade your personal data. All payments are handled by PCI-DSS compliant payment gateways (Razorpay). Your contact details are stored securely.</p>
          </div>

          <div className="legal-section">
            <h2>4. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please email us at <a href="mailto:supportinpixelnetwork@gmail.com">supportinpixelnetwork@gmail.com</a>.</p>
          </div>
        </article>
      </section>
    </main>
  );
}
