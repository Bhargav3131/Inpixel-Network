import '../styles.css';
import Script from 'next/script';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingCTA from '../components/FloatingCTA';
import { Manrope, DM_Mono } from 'next/font/google';

// Self-hosted by Next.js at build time — zero external DNS request, no GDPR font leakage
const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-manrope',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-dm-mono',
});

export const metadata = {
  metadataBase: new URL('https://inpixelnetwork.in'),
  title: {
    default: 'Inpixel Network — Social Media & Web Development Agency in Pune',
    template: '%s | Inpixel Network'
  },
  description: 'Inpixel Network is a Pune-based digital growth agency offering social media management, website development, AI Ads and video production. 150+ happy clients.',
  keywords: ['social media management pune', 'website development pune', 'AI ads india', 'digital marketing agency pune', 'inpixel network', 'web design pune', 'instagram marketing'],
  authors: [{ name: 'Inpixel Network' }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://inpixelnetwork.in/',
    siteName: 'Inpixel Network',
    title: 'Inpixel Network — Social Media & Web Development Agency',
    description: 'Transform your digital presence with precision-crafted social media strategies, stunning websites, and AI-powered ads. 150+ clients served.',
    images: [{ url: '/logo1.jpeg', width: 1200, height: 630, alt: 'Inpixel Network' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inpixel Network — Social Media & Web Development Agency',
    description: 'Transform your digital presence with precision-crafted social media strategies, stunning websites, and AI-powered ads.',
    images: ['/logo1.jpeg']
  },
  icons: {
    icon: '/logo1.jpeg'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${manrope.variable} ${dmMono.variable}`}>
      <body className="fresh-build">
        <div className="fresh-shell">
          <Navbar />
          {children}
          <Footer />
          <FloatingCTA />
        </div>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        <Script src="/assets/js/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
