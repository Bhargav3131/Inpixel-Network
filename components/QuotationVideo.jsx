'use client';

import { useEffect, useRef } from 'react';

export default function QuotationVideo() {
  const videoRef = useRef(null);

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
            cleanup();
          })
          .catch(() => {
            // Browser blocked audio autoplay on this event; keep listener active for next interaction
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

  return (
    <div style={{ position: 'relative' }}>
      <video
        ref={videoRef}
        src="/assets/demo-quotation.mp4"
        controls
        muted
        autoPlay
        loop
        playsInline
        preload="auto"
        aria-label="Inpixel quotation software demo"
        style={{ display: 'block', width: '100%', borderRadius: '13px' }}
      />
    </div>
  );
}
