'use client';

import { toWesternDigits, useNumerals } from '@/lib/useNumerals';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { checkEmailVerified, confirmEmailOtp, requestEmailOtp } from '@/services/api';

interface VerifyEmailModalProps {
  visible: boolean;
  email: string;
  onClose: () => void;
  /** Called after the code is confirmed (or the email turns out to be already verified). */
  onVerified: () => void;
}

const RESEND_COOLDOWN_S = 30;
const POLL_INTERVAL_MS = 3000;

export default function VerifyEmailModal({ visible, email, onClose, onVerified }: VerifyEmailModalProps) {
  const t = useTranslations('VerifyEmail');
  const num = useNumerals();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(RESEND_COOLDOWN_S);
  const inputRef = useRef<HTMLInputElement>(null);
  const resolvedRef = useRef(false);

  // Reset state each time the modal opens; the opener already sent the first code
  useEffect(() => {
    if (visible) {
      resolvedRef.current = false;
      setCode('');
      setError('');
      setVerifying(false);
      setResendIn(RESEND_COOLDOWN_S);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible || resendIn <= 0) return;
    const t = setTimeout(() => setResendIn(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [visible, resendIn]);

  // Detect verification completed elsewhere — e.g. the user clicked the
  // "Verify email" button in the email itself, on this device or another —
  // so this modal doesn't sit there asking for a code that's already spent.
  useEffect(() => {
    if (!visible || !email) return;
    const interval = setInterval(async () => {
      if (resolvedRef.current) return;
      try {
        const verified = await checkEmailVerified(email);
        if (verified && !resolvedRef.current) {
          resolvedRef.current = true;
          onVerified();
        }
      } catch {
        // transient network error — the next poll will retry
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, email]);

  if (!visible) return null;

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError(t('enterCode'));
      return;
    }
    setVerifying(true);
    setError('');
    try {
      await confirmEmailOtp(email, code);
      resolvedRef.current = true;
      onVerified();
    } catch (err: any) {
      // The code may already have been consumed by clicking the link in the
      // email — check before surfacing a false "invalid code" error.
      try {
        const verified = await checkEmailVerified(email);
        if (verified) {
          resolvedRef.current = true;
          onVerified();
          return;
        }
      } catch {
        // fall through to the failure message below
      }
      setError(err?.message || t('failed'));
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setError('');
    try {
      const { alreadyVerified } = await requestEmailOtp(email);
      if (alreadyVerified) {
        onVerified();
        return;
      }
      setResendIn(RESEND_COOLDOWN_S);
    } catch (err: any) {
      setError(err?.message || t('resendFailed'));
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
      <div className="flex w-[85%] max-w-[400px] flex-col gap-4 border border-border bg-white p-6">
        <span className="font-clash font-medium text-[18px] uppercase tracking-[1px] text-primary">
          {t('title')}
        </span>
        <span className="font-dm text-[14px] leading-[22px] text-muted">
          {t.rich('body', {
            email,
            addr: chunks => (
              <span className="text-primary" dir="ltr">
                {chunks}
              </span>
            ),
          })}
        </span>

        <input
          ref={inputRef}
          dir="ltr"
          className={`h-14 w-full border border-border text-center font-clash text-[24px] tracking-[10px] text-primary outline-none placeholder:tracking-[4px] placeholder:text-muted ${error ? 'border-error bg-[rgba(185,64,64,0.08)]' : ''}`}
          placeholder="______"
          value={code}
          onChange={e => {
            setCode(toWesternDigits(e.target.value).replace(/\D/g, '').slice(0, 6));
            if (error) setError('');
          }}
          onKeyDown={e => { if (e.key === 'Enter') handleVerify(); }}
          inputMode="numeric"
          autoComplete="one-time-code"
          disabled={verifying}
        />

        {!!error && <span className="font-dm text-[13px] text-error">{error}</span>}

        <button
          className={`flex h-12 items-center justify-center bg-secondary ${verifying ? 'opacity-60' : ''}`}
          onClick={handleVerify}
          disabled={verifying}
        >
          <span className="font-clash font-medium text-[12px] uppercase tracking-[1px] text-white">
            {verifying ? t('verifying') : t('verify')}
          </span>
        </button>

        <div className="flex flex-row items-center justify-between">
          <button onClick={handleResend} disabled={resendIn > 0 || verifying}>
            <span className={`font-dm text-[13px] underline ${resendIn > 0 ? 'text-muted' : 'text-secondary'}`}>
              {resendIn > 0 ? t('resendIn', { seconds: num(resendIn) }) : t('resend')}
            </span>
          </button>
          <button onClick={onClose} disabled={verifying}>
            <span className="font-dm text-[13px] text-muted underline">{t('cancel')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
