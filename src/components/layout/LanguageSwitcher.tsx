'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import GlobeIcon from '@/components/ui/GlobeIcon';

// Compact two-letter codes for the header globe; the mobile menu still uses the
// full language name via the "text" variant below.
const CODE: Record<string, string> = { en: 'EN', ar: 'AR' };

export default function LanguageSwitcher({
  textClass = 'font-clash text-[16px] text-olive',
  // "globe" shows a globe + the target language's own name and toggles on tap
  // (desktop header); "text" shows just the name (mobile side menu).
  variant = 'text',
}: {
  textClass?: string;
  variant?: 'text' | 'globe';
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('LanguageSwitcher');

  const next = locale === 'ar' ? 'en' : 'ar';
  const switchLanguage = () => {
    // Remember the choice so a return visit lands in the same language
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; samesite=lax`;
    // Keep the query string (e.g. ?dropId=…) when changing language
    router.replace(`${pathname}${window.location.search}`, { locale: next });
  };

  if (variant === 'globe') {
    return (
      <button
        type="button"
        onClick={switchLanguage}
        aria-label={t('switchToLabel')}
        lang={next}
        className="flex items-center gap-[7px]"
      >
        <GlobeIcon size={16} color="#38452D" />
        {/* Latin code ("EN"/"AR"). Turn off the Arabic page's font-size-adjust
            (tuned for Arabic glyphs) so the Latin renders at its true 16px. */}
        <span className="font-clash text-[16px] text-olive" style={{ fontSizeAdjust: 'none' }}>
          {/* Lowercase to match the header's lowercase tabs (new, drops, sell…). */}
          {CODE[next].toLowerCase()}
        </span>
      </button>
    );
  }

  return (
    <button type="button" onClick={switchLanguage} aria-label={t('switchToLabel')} lang={next}>
      <span className={textClass}>{t('switchTo')}</span>
    </button>
  );
}
