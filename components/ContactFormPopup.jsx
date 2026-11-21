'use client';
import { useState, useEffect } from 'react';

function waitForEmailJS(timeout = 8000) {
  return new Promise((resolve, reject) => {
    if (window.emailjs) return resolve(window.emailjs);
    const start = Date.now();
    const iv = setInterval(() => {
      if (window.emailjs) { clearInterval(iv); resolve(window.emailjs); }
      else if (Date.now() - start > timeout) { clearInterval(iv); reject(new Error('EmailJS not loaded')); }
    }, 100);
  });
}

export default function ContactFormPopup() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Allow external callers to open via DOM id toggle
  useEffect(() => {
    const el = document.getElementById('contact-form-popup');
    if (!el) return;
    const obs = new MutationObserver(() => {
      if (el.classList.contains('open')) setOpen(true);
    });
    obs.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const closePopup = () => {
    setOpen(false);
    const el = document.getElementById('contact-form-popup');
    if (el) el.classList.remove('open');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = e.target;
    const name    = form.name.value.trim();
    const contact = form.phone.value.trim();
    const message = form.message.value.trim();
    try {
      const ejs = await waitForEmailJS();
      await ejs.send('service_p1upsrh', 'template_mibmmmu', { name, contact, message });
      setSent(true);
    } catch (err) {
      console.error('EmailJS error:', err);
      setError('Failed to send — please WhatsApp us or try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return <div id="contact-form-popup" style={{ display: 'none' }} />;

  return (
    <>
      {/* Hidden anchor for class-based open trigger */}
      <div id="contact-form-popup" style={{ display: 'none' }} />

      {/* Backdrop */}
      <div className="cfp-backdrop" onClick={closePopup} />

      {/* Modal */}
      <div className="cfp-modal" role="dialog" aria-modal="true" aria-label="Send Enquiry">
        <button className="cfp-close" onClick={closePopup} aria-label="Close">✕</button>

        {sent ? (
          <div className="cfp-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="#f0a500" strokeWidth="2.5" width="40" height="40">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <h3>Enquiry Sent!</h3>
            <p>We'll get back to you within 24 hours.</p>
            <button className="fresh-button dark" onClick={closePopup}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h3>Business Software &amp; AI Automations</h3>
            <p className="cfp-sub">Tell us what you need — we'll follow up with a custom plan.</p>

            <div className="form-row">
              <label htmlFor="cfp-name">Your Name</label>
              <input type="text" id="cfp-name" name="name" required placeholder="Raj Verma" />
            </div>
            <div className="form-row">
              <label htmlFor="cfp-phone">Phone Number</label>
              <input type="tel" id="cfp-phone" name="phone" required placeholder="+91 98765 43210" />
            </div>
            <div className="form-row">
              <label htmlFor="cfp-msg">What do you need?</label>
              <textarea id="cfp-msg" name="message" rows="4" required placeholder="e.g. I need a custom invoicing system / automate my WhatsApp follow-ups..." />
            </div>
            {error && <p style={{ color: '#ff6b6b', fontSize: '0.82rem', marginBottom: '12px' }}>{error}</p>}
            <button type="submit" className="form-submit" disabled={loading}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 16, marginRight: 8 }}>
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              {loading ? 'Sending...' : 'Send Enquiry'}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
