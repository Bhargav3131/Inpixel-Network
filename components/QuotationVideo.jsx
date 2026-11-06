'use client';

import { useEffect, useRef, useState } from 'react';

export default function QuotationVideo() {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hasUnmuted = false;

    const tryUnmute = () => {
      if (hasUnmuted || !video) return;
      video.muted = false;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            hasUnmuted = true;
            setIsMuted(false);
            cleanup();
          })
          .catch(() => {
            // Browser blocked audio autoplay on this event; keep listener for direct click/interaction
          });
      }
    };

    const cleanup = () => {
      window.removeEventListener('click', tryUnmute, true);
      window.removeEventListener('touchstart', tryUnmute, true);
      window.removeEventListener('pointerdown', tryUnmute, true);
      window.removeEventListener('keydown', tryUnmute, true);
      window.removeEventListener('scroll', tryUnmute, { passive: true });
      window.removeEventListener('mousemove', tryUnmute, { passive: true });
    };

    // User interaction events: click, touch, keydown, scroll, and mouse movement
    window.addEventListener('click', tryUnmute, true);
    window.addEventListener('touchstart', tryUnmute, true);
    window.addEventListener('pointerdown', tryUnmute, true);
    window.addEventListener('keydown', tryUnmute, true);
    window.addEventListener('scroll', tryUnmute, { passive: true });
    window.addEventListener('mousemove', tryUnmute, { passive: true });

    return cleanup;
  }, []);

  const toggleSound = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted) {
      video.play().catch(() => {});
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <video
        ref={videoRef}
        src="/assets/demo-quotation.mp4"
        muted
        autoPlay
        loop
        playsInline
        preload="auto"
        aria-label="Inpixel quotation software demo"
        style={{ display: 'block', width: '100%', borderRadius: '13px' }}
      />
      <button
        type="button"
        onClick={toggleSound}
        aria-label={isMuted ? 'Unmute video' : 'Mute video'}
        style={{
          position: 'absolute',
          bottom: '18px',
          right: '18px',
          background: 'rgba(21, 21, 21, 0.85)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '99px',
          padding: '8px 14px',
          fontSize: '12px',
          fontFamily: "'Manrope', sans-serif",
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          transition: 'transform 0.2s, background 0.2s',
          zIndex: 5,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.background = '#f0a500';
          e.currentTarget.style.color = '#151515';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.background = 'rgba(21, 21, 21, 0.85)';
          e.currentTarget.style.color = '#ffffff';
        }}
      >
        <span>{isMuted ? '🔇 Click to unmute' : '🔊 Sound on'}</span>
      </button>
    </div>
  );
}
