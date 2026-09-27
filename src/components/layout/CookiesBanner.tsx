'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useIsDesktop } from '@/lib/useIsDesktop';
import { handleFooterLink } from '@/lib/interactions';

const COOKIES_CONSENT_KEY = 'erlume_cookies_consent';

export default function CookiesBanner() {
  const isDesktop = useIsDesktop();
  const router = useRouter();
  const t = useTranslations('Cookies');
  const [showBanner, setShowBanner] = useState(false);
  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    try {
      const consent = window.localStorage.getItem(COOKIES_CONSENT_KEY);
      if (!consent) {
        setShowBanner(true);
        // Animate in on next frame (matches the previous 300ms slide-up)
        requestAnimationFrame(() => setEntered(true));
      }
    } catch (error) {
      console.error('Error checking cookies consent:', error);
    }
  }, []);

  const handleConsent = (accepted: boolean) => {
    try {
      window.localStorage.setItem(
        COOKIES_CONSENT_KEY,
        JSON.stringify({ accepted, timestamp: new Date().toISOString() }),
      );
      setLeaving(true);
      setTimeout(() => setShowBanner(false), 300);
    } catch (error) {
      console.error('Error saving cookies consent:', error);
    }
  };

  if (!showBanner) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[9999] border-t border-border bg-white pb-8 pt-6 transition-transform duration-300 ${
        entered && !leaving ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="mx-auto w-full max-w-[1280px]">
        <div className={`flex flex-col gap-5 ${isDesktop ? 'px-16' : 'px-4'}`}>
          {/* Text section */}
          <div className={`${isDesktop ? 'flex flex-row items-center gap-5' : 'flex flex-col gap-2'}`}>
            <span className="font-clash font-medium text-[14px] uppercase tracking-[1px] text-primary">
              {t('title')}
            </span>
            <span className="font-dm text-[13px] leading-5 text-muted">
              {t('body')}{' '}
              <button className="align-baseline" onClick={() => handleFooterLink('Cookies Policy', router.push)}>
                <span className="text-secondary underline">{t('learnMore')}</span>
              </button>
            </span>
          </div>

          {/* Buttons section */}
          <div className={`flex ${isDesktop ? 'flex-row justify-end gap-4' : 'flex-col gap-3'}`}>
            <button
              className="flex items-center justify-center border border-border px-5 py-3"
              onClick={() => handleConsent(false)}
            >
              <span className="font-clash font-medium text-[12px] uppercase tracking-[0.8px] text-primary">{t('decline')}</span>
            </button>
            <button
              className="flex items-center justify-center bg-secondary px-5 py-3"
              onClick={() => handleConsent(true)}
            >
              <span className="font-clash font-medium text-[12px] uppercase tracking-[0.8px] text-white">{t('accept')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
