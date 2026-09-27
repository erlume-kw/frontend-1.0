import { defineRouting } from 'next-intl/routing';

export const locales = ['en', 'ar'] as const;
export type Locale = (typeof locales)[number];

// English keeps today's URLs (no prefix), so every existing link — emails, payment
// return, unsubscribe, bookmarks — keeps working. Arabic lives under /ar.
export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  // The language comes from the URL only (a saved profile language redirects there);
  // never guess it from the browser.
  localeDetection: false,
});

export const isRTL = (locale: string) => locale === 'ar';
