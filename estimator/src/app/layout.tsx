import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Get Your Project Estimate | Texas High Refinished',
  description:
    'Get an estimated investment range for your painting, cabinet refinishing, drywall, or tile project. Texas High Refinished — Marble Falls, TX.',
  robots: 'noindex',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">{children}</body>
    </html>
  );
}
