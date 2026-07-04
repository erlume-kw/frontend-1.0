import type { Metadata } from 'next';
import { clashDisplay, dmSans, sarina } from './fonts';
import Providers from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'erlume',
  description: 'Buy & Sell Luxury Secondhand',
  icons: { icon: '/images/erlume-logo-green.png' },
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
