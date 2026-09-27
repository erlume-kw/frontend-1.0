import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, isRTL } from '@/i18n/routing';
import { SITE_URL } from '@/lib/config';
import { clashDisplay, dmSans, sarina, readexPro, plexArabic } from '../fonts';
import Providers from '../providers';
import '../globals.css';

const ICONS = {
  // Theme-aware favicon: coral on light-mode devices, beige on dark-mode ones.
  // Browsers pick by the media query on each <link>; the last entry (coral)
  // also serves as the fallback for browsers that ignore prefers-color-scheme.
  icon: [
    { url: '/images/erlume-icon-beige.svg', media: '(prefers-color-scheme: dark)', type: 'image/svg+xml' },
    { url: '/images/erlume-icon-coral.svg', media: '(prefers-color-scheme: light)', type: 'image/svg+xml' },
    { url: '/images/erlume-icon-coral.svg', type: 'image/svg+xml' },
  ],
};

// Site-wide fallback title/description (English "erlume" / "Buy & Sell Luxury Secondhand" and
// their Arabic equivalents), plus hreflang alternates pointing search engines at the English
// and Arabic versions of the site. Individual pages may still override `title`/`description`
// (Next.js merges into this via the metadata API) — this covers every page that doesn't.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t('title'), template: `%s — ${t('title')}` },
    description: t('description'),
    icons: ICONS,
    alternates: {
      languages: {
        en: `${SITE_URL}/`,
        ar: `${SITE_URL}/ar`,
        'x-default': `${SITE_URL}/`,
      },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      siteName: 'erlume',
      locale: locale === 'ar' ? 'ar_KW' : 'en_KW',
      type: 'website',
    },
  };
}

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
