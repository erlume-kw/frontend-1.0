'use client';

import { useTranslations } from 'next-intl';
import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { unsubscribeNewsletter } from '@/services/api';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';

// Landing page for the "Unsubscribe" link in newsletter emails.
function UnsubscribeInner() {
  const router = useRouter();
  const t = useTranslations('Unsubscribe');
  const searchParams = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);

  const [state, setState] = useState<'working' | 'done' | 'failed'>('working');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!email) {
      setState('failed');
      return;
    }
    let cancelled = false;
    unsubscribeNewsletter(email)
      .then(() => { if (!cancelled) setState('done'); })
      .catch(() => { if (!cancelled) setState('failed'); });
    return () => { cancelled = true; };
  }, [email]);

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      <MaxWidthContainer>
        <div className="mx-auto flex min-h-[400px] w-full max-w-[641px] flex-col justify-center gap-4 p-[38px]">
          {state === 'working' && (
            <span className="text-center font-clash font-semibold text-[24px] text-black">
              {t('working')}
            </span>
          )}

          {state === 'done' && (
            <>
              <span className="text-center font-clash font-semibold text-[24px] text-black">
                {t('doneTitle')}
              </span>
              <span className="text-center font-dm text-[15px] text-muted">
                {t.rich('doneText', { email: email ?? '', addr: chunks => <bdi dir="ltr">{chunks}</bdi> })}
              </span>
              <button className="flex h-[60px] items-center justify-center bg-secondary" onClick={() => router.push('/')}>
                <span className="font-clash font-semibold text-[15px] uppercase tracking-[1.2px] text-white">
                  {t('backHome')}
                </span>
              </button>
            </>
          )}

          {state === 'failed' && (
            <>
              <span className="text-center font-clash font-semibold text-[24px] text-black">
                {t('failedTitle')}
              </span>
              <span className="text-center font-dm text-[15px] text-muted">
                {t('failedText')}
              </span>
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

export default function UnsubscribePage() {
  return (
    <Suspense fallback={null}>
      <UnsubscribeInner />
    </Suspense>
  );
}
