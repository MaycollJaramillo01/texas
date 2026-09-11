import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'Get Your Project Estimate | Texas High Refinished',
  description:
    'Get an estimated investment range for your painting, cabinet refinishing, drywall, or tile project. Texas High Refinished — Marble Falls, TX.',
  robots: 'noindex',
};

// Same Google tag (GA4) as texashighrefinished.com (index.html there) — keep both
// in sync. The linker carries the session, and the Google Ads click, across the
// two domains; our own domains never count as referral traffic.
const GA_ID = 'G-WQJZLPX7QZ';
const GTAG_INIT = String.raw`
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('set', 'linker', { domains: ['texashighrefinished.com', 'thr-estimator.vercel.app'] });
gtag('config', '${GA_ID}', {
  ignore_referrer: /(^|\.)texashighrefinished\.com$|^thr-estimator\.vercel\.app$/.test(document.referrer && new URL(document.referrer).hostname),
});
document.addEventListener('click', function (e) {
  if (e.target.closest && e.target.closest('a[href^="tel:"]')) gtag('event', 'click_to_call');
}, true);
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        {children}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {GTAG_INIT}
        </Script>
      </body>
    </html>
  );
}
