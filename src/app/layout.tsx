import type { Metadata } from 'next';
import { clashDisplay, dmSans, sarina } from './fonts';
import Providers from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'erlume',
  description: 'Buy & Sell Luxury Secondhand',
  icons: {
    // Theme-aware favicon: coral on light-mode devices, beige on dark-mode ones.
    // Browsers pick by the media query on each <link>; the last entry (coral)
    // also serves as the fallback for browsers that ignore prefers-color-scheme.
    icon: [
      { url: '/images/erlume-icon-beige.svg', media: '(prefers-color-scheme: dark)', type: 'image/svg+xml' },
      { url: '/images/erlume-icon-coral.svg', media: '(prefers-color-scheme: light)', type: 'image/svg+xml' },
      { url: '/images/erlume-icon-coral.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${clashDisplay.variable} ${dmSans.variable} ${sarina.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
