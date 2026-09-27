'use client';

import { useNumerals } from '@/lib/useNumerals';
import { useTranslations } from 'next-intl';
import React from 'react';

interface CheckoutSessionModalProps {
  visible: boolean;
  secondsLeft: number;
  extending?: boolean;
  onExtend: () => void;
  onLeave: () => void;
}

export default function CheckoutSessionModal({
  visible,
  secondsLeft,
  extending = false,
  onExtend,
  onLeave,
}: CheckoutSessionModalProps) {
  const t = useTranslations('CheckoutSession');
  const num = useNumerals();
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
      <div className="flex w-[85%] max-w-[400px] flex-col gap-4 border border-border bg-white p-6">
        <span className="font-clash font-medium text-[18px] uppercase tracking-[1px] text-primary">
          {t('title')}
        </span>
        <span className="font-dm text-[14px] leading-[22px] text-muted">
          {t.rich('body', {
            seconds: num(secondsLeft),
            n: chunks => <span className="font-medium text-primary">{chunks}</span>,
          })}
        </span>

        <div className="mt-2 flex flex-row gap-3">
          <button
            className="flex h-12 flex-1 items-center justify-center border border-border"
            onClick={onLeave}
            disabled={extending}
          >
            <span className="font-clash font-medium text-[12px] uppercase tracking-[1px] text-primary">
              {t('leave')}
            </span>
          </button>
          <button
            className={`flex h-12 flex-1 items-center justify-center bg-secondary ${extending ? 'opacity-60' : ''}`}
            onClick={onExtend}
            disabled={extending}
          >
            <span className="font-clash font-medium text-[12px] uppercase tracking-[1px] text-white">
              {extending ? t('extending') : t('stillHere')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
