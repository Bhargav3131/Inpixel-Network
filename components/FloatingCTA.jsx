'use client';
import { useState } from 'react';
import ContactForm from './ContactForm';

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
          href="https://api.whatsapp.com/send/?phone=919697993131"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: '#25D366',
            color: '#fff',
            fontFamily: 'var(--font-manrope, Manrope, sans-serif)',
            fontWeight: 700,
            fontSize: '0.88rem',
            letterSpacing: '0.01em',
            padding: '11px 20px 11px 16px',
            borderRadius: '100px',
            textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(37,211,102,0.35)',
            transition: 'transform 0.18s ease, box-shadow 0.18s ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(37,211,102,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,211,102,0.35)'; }}
        >
          {/* WhatsApp icon */}
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 2C8.268 2 2 8.268 2 16c0 2.47.665 4.785 1.826 6.773L2 30l7.47-1.796A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2Z" fill="#fff" fillOpacity=".15"/>
            <path d="M22.502 19.57c-.332-.166-1.964-.968-2.268-1.079-.303-.11-.524-.166-.744.167-.221.332-.856 1.079-1.05 1.3-.193.221-.386.248-.718.083-.332-.166-1.4-.516-2.666-1.644-.985-.878-1.65-1.962-1.843-2.294-.193-.332-.02-.511.145-.677.149-.148.332-.386.498-.58.166-.193.221-.332.332-.553.11-.22.055-.414-.028-.58-.083-.166-.744-1.796-1.019-2.46-.268-.647-.54-.56-.744-.57l-.635-.011c-.22 0-.58.083-.883.414-.303.332-1.16 1.133-1.16 2.763s1.188 3.206 1.354 3.427c.166.221 2.337 3.569 5.661 5.001.791.342 1.408.546 1.889.698.794.252 1.517.217 2.088.132.637-.095 1.964-.803 2.24-1.579.276-.776.276-1.44.193-1.579-.082-.138-.303-.22-.635-.386Z" fill="#fff"/>
          </svg>
          Chat with us
        </a>

        {/* Ask a question — Enquiry */}
        <button
          onClick={() => setOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: '#f0a500',
            color: '#060608',
            fontFamily: 'var(--font-manrope, Manrope, sans-serif)',
            fontWeight: 700,
            fontSize: '0.88rem',
            letterSpacing: '0.01em',
            padding: '11px 20px 11px 16px',
            borderRadius: '100px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(240,165,0,0.35)',
            transition: 'transform 0.18s ease, box-shadow 0.18s ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(240,165,0,0.55)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(240,165,0,0.35)'; }}
        >
          {/* Sparkle / question icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" xmlns="http://www.w3.org/2000/svg">
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
            position: 'fixed',
            inset: 0,
            background: 'rgba(6,6,8,0.75)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div style={{
            background: '#151515',
            border: '1px solid rgba(240,165,0,0.18)',
            borderRadius: '20px',
            padding: '36px 32px 32px',
            width: '100%',
            maxWidth: '460px',
            position: 'relative',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          }}>
            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255,255,255,0.06)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.6)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <ContactForm />
          </div>
        </div>
      )}
    </>
  );
}
