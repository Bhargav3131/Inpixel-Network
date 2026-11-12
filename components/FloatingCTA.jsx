'use client';
import { useState } from 'react';

function waitForEmailJS(timeout = 8000) {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.emailjs) return resolve(window.emailjs);
    const start = Date.now();
    const iv = setInterval(() => {
      if (window.emailjs) { clearInterval(iv); resolve(window.emailjs); }
      else if (Date.now() - start > timeout) { clearInterval(iv); reject(new Error('EmailJS not loaded')); }
    }, 100);
  });
}

const GOLD = '#f0a500';
const DARK = '#060608';
const CARD = '#1a1a1a';
const BORDER = 'rgba(240,165,0,0.2)';
const MUTED = 'rgba(255,255,255,0.45)';
const TEXT  = '#ffffff';

function EnquiryForm({ onClose }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      setError('Could not send — please WhatsApp us directly.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    padding: '13px 16px',
    color: TEXT,
    fontFamily: 'var(--font-manrope, Manrope, sans-serif)',
    fontSize: '0.92rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };
  const labelStyle = {
    display: 'block',
    fontSize: '0.68rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: MUTED,
    marginBottom: '7px',
    fontFamily: 'var(--font-manrope, Manrope, sans-serif)',
    fontWeight: 600,
  };

  if (sent) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          border: `2px solid ${GOLD}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: `0 0 30px rgba(240,165,0,0.25)`,
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.5" style={{ width: 26, height: 26 }}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <h3 style={{ color: TEXT, fontFamily: 'var(--font-manrope, Manrope, sans-serif)', fontWeight: 800, fontSize: '1.3rem', marginBottom: 10 }}>
          Message Sent!
        </h3>
        <p style={{ color: MUTED, fontSize: '0.9rem' }}>We'll get back to you within 24 hours.</p>
        <button onClick={onClose} style={{
          marginTop: 24, background: GOLD, color: DARK,
          border: 'none', borderRadius: 100, padding: '11px 28px',
          fontFamily: 'var(--font-manrope, Manrope, sans-serif)',
          fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
        }}>Close</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ margin: 0 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{
          fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase',
          color: GOLD, fontFamily: 'var(--font-manrope, Manrope, sans-serif)',
          fontWeight: 600, marginBottom: 8,
        }}>Quick Enquiry</p>
        <h3 style={{
          color: TEXT, fontFamily: 'var(--font-manrope, Manrope, sans-serif)',
          fontWeight: 800, fontSize: '1.4rem', lineHeight: 1.2, margin: 0,
        }}>Tell us what you need.</h3>
      </div>

      {/* Name */}
      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle}>Your Name</label>
        <input
          type="text" name="name" required placeholder="Raj Verma"
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = GOLD}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
        />
      </div>

      {/* Phone */}
      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle}>Phone Number</label>
        <input
          type="tel" name="phone" required placeholder="+91 98765 43210"
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = GOLD}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
        />
      </div>

      {/* Message */}
      <div style={{ marginBottom: 22 }}>
        <label style={labelStyle}>Message</label>
        <textarea
          name="message" rows="3" required placeholder="Tell us about your project..."
          style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }}
          onFocus={e => e.target.style.borderColor = GOLD}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
        />
      </div>

      {/* Error */}
      {error && (
        <p style={{ color: '#ff6b6b', fontSize: '0.8rem', marginBottom: 14, marginTop: -8 }}>{error}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          background: loading ? 'rgba(240,165,0,0.5)' : GOLD,
          color: DARK,
          border: 'none',
          borderRadius: '10px',
          padding: '14px',
          fontFamily: 'var(--font-manrope, Manrope, sans-serif)',
          fontWeight: 800,
          fontSize: '0.92rem',
          letterSpacing: '0.02em',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.2s',
          boxShadow: loading ? 'none' : `0 4px 20px rgba(240,165,0,0.3)`,
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = `0 6px 28px rgba(240,165,0,0.5)`; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 4px 20px rgba(240,165,0,0.3)`; }}
      >
        {!loading && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 15, height: 15 }}>
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        )}
        {loading ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}

export default function FloatingCTA() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating buttons */}
      <div style={{
        position: 'fixed',
        bottom: '28px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 9999,
        alignItems: 'flex-end',
      }}>
        {/* Chat with us — WhatsApp */}
        <a
          href="https://api.whatsapp.com/send/?phone=919697993131&text=Hello,+I+want+to+get+started+with+Inpixel+network"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: '#25D366', color: '#fff',
            fontFamily: 'var(--font-manrope, Manrope, sans-serif)',
            fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.01em',
            padding: '11px 20px 11px 16px', borderRadius: '100px',
            textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(37,211,102,0.35)',
            transition: 'transform 0.18s ease, box-shadow 0.18s ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(37,211,102,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,211,102,0.35)'; }}
        >
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
            <path d="M16 2C8.268 2 2 8.268 2 16c0 2.47.665 4.785 1.826 6.773L2 30l7.47-1.796A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2Z" fill="#fff" fillOpacity=".15"/>
            <path d="M22.502 19.57c-.332-.166-1.964-.968-2.268-1.079-.303-.11-.524-.166-.744.167-.221.332-.856 1.079-1.05 1.3-.193.221-.386.248-.718.083-.332-.166-1.4-.516-2.666-1.644-.985-.878-1.65-1.962-1.843-2.294-.193-.332-.02-.511.145-.677.149-.148.332-.386.498-.58.166-.193.221-.332.332-.553.11-.22.055-.414-.028-.58-.083-.166-.744-1.796-1.019-2.46-.268-.647-.54-.56-.744-.57l-.635-.011c-.22 0-.58.083-.883.414-.303.332-1.16 1.133-1.16 2.763s1.188 3.206 1.354 3.427c.166.221 2.337 3.569 5.661 5.001.791.342 1.408.546 1.889.698.794.252 1.517.217 2.088.132.637-.095 1.964-.803 2.24-1.579.276-.776.276-1.44.193-1.579-.082-.138-.303-.22-.635-.386Z" fill="#fff"/>
          </svg>
          Chat with us
        </a>

        {/* Ask a question */}
        <button
          onClick={() => setOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: GOLD, color: DARK,
            fontFamily: 'var(--font-manrope, Manrope, sans-serif)',
            fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.01em',
            padding: '11px 20px 11px 16px', borderRadius: '100px',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(240,165,0,0.35)',
            transition: 'transform 0.18s ease, box-shadow 0.18s ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(240,165,0,0.55)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(240,165,0,0.35)'; }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Ask a question
        </button>
      </div>

      {/* Modal overlay */}
      {open && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(6,6,8,0.80)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div style={{
            background: CARD,
            border: `1px solid ${BORDER}`,
            borderRadius: '20px',
            padding: '36px 32px 32px',
            width: '100%', maxWidth: '440px',
            position: 'relative',
            boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
          }}>
            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'rgba(255,255,255,0.08)', border: 'none',
                borderRadius: '50%', width: '32px', height: '32px',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'rgba(255,255,255,0.6)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <EnquiryForm onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
