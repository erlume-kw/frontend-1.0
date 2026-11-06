'use client';

// First-visit newsletter popup. Shows once per browser a few seconds after
// landing, then never again (a localStorage flag records "subscribed" or
// "dismissed"). Reuses the same OTP-verified subscribe flow as the footer
// (requestEmailOtp → VerifyEmailModal → subscribeNewsletter) so a popup signup
// is a real, verified subscriber — never an unverified address.

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { requestEmailOtp, subscribeNewsletter } from '@/services/api';
import ErrorModal from '@/components/ErrorModal';
import VerifyEmailModal from '@/components/VerifyEmailModal';

const STORAGE_KEY = 'erlume_newsletter_popup';
const SHOW_DELAY_MS = 3500;

const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

// Don't interrupt these flows with a newsletter ask.
const SUPPRESSED = ['/unsubscribe', '/checkout', '/sell-with-us'];

function seen(): boolean {
  try {
    return !!localStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
}
function remember(value: 'subscribed' | 'dismissed') {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* private mode / blocked storage — the popup just may show again next visit */
  }
}

export default function NewsletterPopup() {
  const t = useTranslations('NewsletterPopup');
  const tf = useTranslations('Footer');
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [errorOpen, setErrorOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);

  // Decide whether to show, once, after a short delay on first landing.
  useEffect(() => {
    if (seen()) return;
    if (SUPPRESSED.some(p => pathname?.includes(p))) return;
    const timer = setTimeout(() => {
      if (!seen()) setOpen(true);
    }, SHOW_DELAY_MS);
    return () => clearTimeout(timer);
    // Intentionally run once on mount — not re-evaluated on navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close on Escape while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const dismiss = () => {
    remember('dismissed');
    setOpen(false);
  };

  const showError = (message: string) => {
    setEmailError(message);
    setErrorOpen(true);
  };

  const completeSubscribe = async () => {
    setOtpModalVisible(false);
    try {
      await subscribeNewsletter(email);
      remember('subscribed');
      setSuccess(true);
      setEmail('');
      // Let the "you're subscribed" state breathe, then close.
      setTimeout(() => setOpen(false), 2500);
    } catch (error: any) {
      showError(error?.message || tf('genericError'));
    } finally {
      setVerifying(false);
    }
  };

  const handleSubscribe = async () => {
    if (!isValidEmail(email)) {
      showError(tf('invalidEmail'));
      return;
    }
    setVerifying(true);
    setEmailError('');
    try {
      // Emails that verified once (any flow) skip the OTP entirely.
      const { alreadyVerified } = await requestEmailOtp(email.trim());
      if (alreadyVerified) {
        await completeSubscribe();
        return;
      }
      setOtpModalVisible(true);
    } catch (error: any) {
      showError(error?.message || tf('genericError'));
      setVerifying(false);
    }
  };

  if (!open) return null;

  // Keep a single overlay on screen at a time: hide the newsletter card while
  // the OTP step or an error alert is showing, so the modals never stack on top
  // of each other.
  const overlayHidden = otpModalVisible || (errorOpen && !!emailError);

  return (
    <>
      {!overlayHidden && (
      <div
        className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4"
        onClick={dismiss}
        role="dialog"
        aria-modal="true"
        aria-label={t('title')}
      >
      <div
        className="relative flex w-full max-w-[420px] flex-col gap-5 border border-border bg-white p-8"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label={t('closeAria')}
          className="absolute end-3 top-3 flex h-8 w-8 items-center justify-center text-muted hover:text-primary"
        >
          <span className="font-glyph text-[20px] leading-none">×</span>
        </button>

        <div className="flex flex-col gap-2 pe-6">
          <span className="font-clash font-medium text-[22px] uppercase leading-[1.2] tracking-[1px] text-primary">
            {t('title')}
          </span>
          <span className="font-dm text-[14px] leading-[22px] text-muted">
            {t('text')}
          </span>
        </div>

        {success ? (
          <span className="font-dm font-medium text-[15px] text-secondary">{tf('subscribed')}</span>
        ) : (
          <>
            <input
              className={`h-[52px] w-full border border-border px-4 font-dm text-[15px] text-black outline-none placeholder:text-muted ${
                emailError ? 'border-error' : ''
              }`}
              placeholder={tf('emailPlaceholder')}
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              type="email"
              autoCapitalize="none"
              autoFocus
            />
            <button
              className={`flex h-[52px] items-center justify-center bg-secondary ${verifying ? 'opacity-60' : ''}`}
              onClick={handleSubscribe}
              disabled={verifying}
            >
              <span className="font-clash font-medium text-[14px] uppercase tracking-[1.2px] text-white">
                {verifying ? tf('verifying') : tf('subscribe')}
              </span>
            </button>
            <button type="button" onClick={dismiss} className="self-center">
              <span className="font-dm text-[13px] text-muted underline underline-offset-2">
                {t('dismiss')}
              </span>
            </button>
          </>
        )}
      </div>
      </div>
      )}

      <ErrorModal
        visible={errorOpen && !!emailError}
        title={tf('newsletterModalTitle')}
        message={emailError}
        onClose={() => setErrorOpen(false)}
      />
      <VerifyEmailModal
        visible={otpModalVisible}
        email={email.trim()}
        onClose={() => {
          setOtpModalVisible(false);
          setVerifying(false);
        }}
        onVerified={completeSubscribe}
      />
    </>
  );
}
