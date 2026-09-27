'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

// Arabic is being rolled out page by page, so the switcher is hidden on production builds
// unless NEXT_PUBLIC_ENABLE_ARABIC=true. (/ar/... URLs work either way; on an Arabic page
// the way back to English is always shown.)
const ARABIC_ENABLED =
  process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_ENABLE_ARABIC === 'true';

export default function LanguageSwitcher({
  textClass = 'font-clash text-[16px] text-olive',
}: {
  textClass?: string;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('LanguageSwitcher');

  if (!ARABIC_ENABLED && locale === 'en') return null;

  const next = locale === 'ar' ? 'en' : 'ar';
  const switchLanguage = () => {
    // Keep the query string (e.g. ?dropId=…) when changing language
    router.replace(`${pathname}${window.location.search}`, { locale: next });
  };

  return (
    <button type="button" onClick={switchLanguage} aria-label={t('switchToLabel')} lang={next}>
      <span className={textClass}>{t('switchTo')}</span>
    </button>
  );
}
