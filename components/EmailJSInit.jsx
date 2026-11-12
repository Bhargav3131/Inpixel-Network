'use client';
import Script from 'next/script';

export default function EmailJSInit() {
  return (
    <Script
      src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"
      strategy="lazyOnload"
      onLoad={() => {
        if (window.emailjs) {
          window.emailjs.init({ publicKey: 'TWpQ-zENXGGMzDMFd' });
        }
      }}
    />
  );
}
