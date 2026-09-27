'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

export default function LanguageSwitcher({
  textClass = 'font-clash text-[16px] text-olive',
}: {
  textClass?: string;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('LanguageSwitcher');

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
