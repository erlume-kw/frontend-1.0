'use client';

import { useTranslations } from 'next-intl';
import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { confirmPayment } from '@/services/api';
import { useCart } from '@/contexts/CartContext';
import { clearCheckoutDraft } from '@/lib/checkoutDraft';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';

// Landing page for hosted payment methods (KNET etc.).
// MyFatoorah redirects here with ?paymentId=… — we hand that to the backend,
// which verifies the real status with MyFatoorah. This page only ever displays
// what the backend concluded; it never decides success/failure itself.
function PaymentCallbackInner() {
  const router = useRouter();
  const t = useTranslations('PaymentCallback');
  const searchParams = useSearchParams();
  const { clear: clearCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const [state, setState] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('');
  const [orderRef, setOrderRef] = useState<string | null>(null);

  const paymentId = searchParams.get('paymentId');

  useEffect(() => {
    if (!paymentId) {
      setState('failed');
      setMessage(t('missingRef'));
      return;
    }
    let cancelled = false;
    confirmPayment({ paymentId })
      .then(result => {
        if (cancelled) return;
        if (result.success) {
          clearCart();
          clearCheckoutDraft();
          setOrderRef(result.orderId);
          setState('success');
        } else {
          setState('failed');
          setMessage(result.message || t('notCompleted'));
        }
      })
      .catch(e => {
        if (cancelled) return;
        setState('failed');
        setMessage(e.message ?? t('couldNotVerify'));
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId]);

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
                {t('thanks')}
              </span>
              <span className="text-center font-dm text-[15px] text-muted">
                {t('received')}
              </span>
              {orderRef && (
                <span className="mb-3 text-center font-dm font-medium text-[13px] text-black">
                  {t('orderRef', { ref: orderRef })}
                </span>
              )}
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
              <span className="text-center font-dm text-[15px] text-muted">
                {t('saved')}
              </span>
              <button className="flex h-[60px] items-center justify-center bg-secondary" onClick={() => router.push('/checkout')}>
                <span className="font-clash font-semibold text-[15px] uppercase tracking-[1.2px] text-white">{t('tryAgain')}</span>
              </button>
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

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={null}>
      <PaymentCallbackInner />
    </Suspense>
  );
}
