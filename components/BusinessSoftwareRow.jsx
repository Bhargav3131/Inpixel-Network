'use client';

export default function BusinessSoftwareRow({ num = '06', isServicePage = false }) {
  const openPopup = () => {
    const el = document.getElementById('contact-form-popup');
    if (el) el.classList.add('open');
  };

  return (
    <div className="fresh-service-inquiry-row" onClick={openPopup}>
      <span>{num}</span>
      <div>
        <small>AI + Automation</small>
        {isServicePage ? (
          <h2>Business Software &amp; AI Automations</h2>
        ) : (
          <h3>Business Software &amp; AI Automations</h3>
        )}
        <p>Custom software, workflow automation and AI tools built around your business operations.</p>
      </div>
      <b>Get a quote <span className="fresh-view-cta">Enquire →</span></b>
    </div>
  );
}
