import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing, isRTL } from '@/i18n/routing';
import { clashDisplay, dmSans, sarina, readexPro, plexArabic } from '../fonts';
import Providers from '../providers';
import '../globals.css';

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

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      dir={isRTL(locale) ? 'rtl' : 'ltr'}
      className={`${clashDisplay.variable} ${dmSans.variable} ${sarina.variable} ${readexPro.variable} ${plexArabic.variable}`}
    >
      <body>
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
