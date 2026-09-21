'use client';

import { useTranslations } from 'next-intl';
import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { checkEmailVerified, confirmEmailOtp } from '@/services/api';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';

// Landing page for the "Verify email" button in the OTP email.
// The link carries ?email=…&code=… — confirming here marks the email verified
// permanently. The tab where the flow started (VerifyEmailModal) polls
// /email-verification/status and picks this up automatically within a few
// seconds, so no action is needed back in that tab.
function VerifyEmailInner() {
  const router = useRouter();
  const t = useTranslations('VerifyEmailPage');
  const searchParams = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);

  const [state, setState] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('');

  const email = searchParams.get('email');
  const code = searchParams.get('code');

  useEffect(() => {
    if (!email || !code) {
      setState('failed');
      setMessage(t('incomplete'));
      return;
    }
    let cancelled = false;
    confirmEmailOtp(email, code)
      .then(() => {
        if (!cancelled) setState('success');
      })
      .catch(async e => {
        if (cancelled) return;
        // Email link scanners (Gmail/Outlook safe-link crawlers, corporate
        // proxies) sometimes pre-visit this URL and consume the one-time code
        // before the real click happens. If that already verified the email,
        // don't show a false "invalid code" error — check and report success.
        try {
          const verified = await checkEmailVerified(email);
          if (!cancelled && verified) {
            setState('success');
            return;
          }
        } catch {
          // fall through to the failure message below
        }
        if (!cancelled) {
          setState('failed');
          setMessage(e.message ?? t('failedFallback'));
        }
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, code]);

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      <MaxWidthContainer>
        <div className="mx-auto flex min-h-[400px] w-full max-w-[641px] flex-col justify-center gap-4 p-[38px]">
          {state === 'verifying' && (
            <>
              <span className="text-center font-clash font-semibold text-[24px] text-black">
                {t('verifying')}
              </span>
              <span className="text-center font-dm text-[15px] text-muted">
                {t('dontClose')}
              </span>
            </>
          )}

          {state === 'success' && (
            <>
              <span className="text-center font-clash font-semibold text-[24px] text-black">
                {t('successTitle')}
              </span>
              <span className="text-center font-dm text-[15px] text-muted">
                {t('successText')}
              </span>
              <button className="flex h-[60px] items-center justify-center bg-secondary" onClick={() => router.push('/')}>
                <span className="font-clash font-semibold text-[15px] uppercase tracking-[1.2px] text-white">
                  {t('continueShopping')}
                </span>
              </button>
            </>
          )}

          {state === 'failed' && (
            <>
              <span className="text-center font-clash font-semibold text-[24px] text-black">
                {t('failedTitle')}
              </span>
              <span className="text-center font-dm text-[15px] text-muted">{message}</span>
              <button
                className="flex h-[60px] items-center justify-center border border-border bg-transparent"
                onClick={() => router.push('/')}
              >
                <span className="font-clash font-semibold text-[15px] uppercase tracking-[1.2px] text-black">
                  {t('backHome')}
                </span>
              </button>
            </>
          )}
        </div>
      </MaxWidthContainer>
    </PageLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailInner />
    </Suspense>
  );
}
