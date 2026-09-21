import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';
import { localizeMessageDigits } from './arabicDigits';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  // English is the base; Arabic overrides it key by key, so a string that has not been
  // translated yet shows in English instead of as a raw key.
  const en = (await import('../../messages/en.json')).default;
  const messages =
    locale === 'en'
      ? en
      : deepMerge(en, localizeMessageDigits((await import(`../../messages/${locale}.json`)).default));

  return { locale, messages };
});

type Messages = Record<string, unknown>;

function deepMerge(base: Messages, override: Messages): Messages {
  const out: Messages = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const current = out[key];
    out[key] =
      value && typeof value === 'object' && !Array.isArray(value) && current && typeof current === 'object'
        ? deepMerge(current as Messages, value as Messages)
        : value;
  }
  return out;
}
