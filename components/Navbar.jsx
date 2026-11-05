'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fresh-nav">
      <Link href="/" className="fresh-brand">
        <img src="/logo1.jpeg" alt="Inpixel Network" width="40" height="40" />
        <span>Inpixel Network</span>
      </Link>
      <button 
        className="fresh-menu" 
        aria-label="Toggle menu" 
        onClick={() => setOpen(!open)}
      >
        <span></span>
        <span></span>
      </button>
      <nav className={open ? 'open' : ''}>
        <Link href="/webdevelopment" onClick={() => setOpen(false)}>Websites</Link>
        <Link href="/aivideos" onClick={() => setOpen(false)}>AI Videos</Link>
        <Link href="/metaads" onClick={() => setOpen(false)}>Meta Ads</Link>
        <Link href="/socialmedia" onClick={() => setOpen(false)}>Social Media</Link>
        <Link href="/quotation" onClick={() => setOpen(false)}>Quotation</Link>
        <Link href="/userlogin" className="fresh-nav-cta" onClick={() => setOpen(false)}>Client Login ↗</Link>
      </nav>
    </header>
  );
}
