'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

interface ErrorModalProps {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  compact?: boolean;
}

export default function ErrorModal({ visible, title, message, onClose, compact = false }: ErrorModalProps) {
  const t = useTranslations('ErrorModal');
  const tc = useTranslations('Common');
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
      <div
        className={`flex flex-col border border-border bg-white ${
          compact ? 'w-[75%] max-w-[300px] gap-2 p-5' : 'w-[85%] max-w-[400px] gap-4 p-6'
        }`}
      >
        <span
          className={`font-clash font-medium uppercase tracking-[1px] text-primary ${
            compact ? 'text-[14px]' : 'text-[18px]'
          }`}
        >
          {title ?? t('paymentError')}
        </span>
        <span className={`font-dm text-muted ${compact ? 'text-[13px] leading-[20px]' : 'text-[14px] leading-[22px]'}`}>
          {message}
        </span>

        <button
          className={`mt-2 flex items-center justify-center bg-secondary ${compact ? 'h-10' : 'h-12'}`}
          onClick={onClose}
        >
          <span className="font-clash font-medium text-[12px] uppercase tracking-[1px] text-white">
            {tc('ok')}
          </span>
        </button>
      </div>
    </div>
  );
}
