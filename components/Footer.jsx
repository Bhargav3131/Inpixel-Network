import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="fresh-footer">
      <div>
        <Link href="/" className="fresh-brand">
          <img src="/logo1.jpeg" alt="Inpixel Network" width="40" height="40" />
          <span>Inpixel Network</span>
        </Link>
        <p>We turn ambitious businesses into memorable digital brands.</p>
      </div>
      <div>
        <small>Explore</small>
        <Link href="/services">Services</Link>
        <Link href="/quotation">Quotation Software</Link>
        <Link href="/blog">Blog</Link>
      </div>
      <div>
        <small>Company</small>
        <Link href="/terms">Terms & Conditions</Link>
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/userlogin">Client Portal</Link>
      </div>
      <div>
        <small>Connect</small>
        <a href="mailto:supportinpixelnetwork@gmail.com">Email</a>
        <a href="https://instagram.com/inpixel_network" target="_blank" rel="noopener noreferrer">Instagram</a>
        <a href="https://wa.me/919697993131" target="_blank" rel="noopener noreferrer">WhatsApp</a>
      </div>
      <p className="fresh-copy">
        © 2026 Inpixel Network · Pune, India · <Link href="/terms">Terms</Link> · <Link href="/privacy">Privacy</Link>
      </p>
    </footer>
  );
}
