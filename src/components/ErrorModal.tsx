'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

interface ErrorModalProps {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

export default function ErrorModal({ visible, title, message, onClose }: ErrorModalProps) {
  const t = useTranslations('ErrorModal');
  const tc = useTranslations('Common');
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
      <div className="flex w-[85%] max-w-[400px] flex-col gap-4 border border-border bg-white p-6">
        <span className="font-clash font-medium text-[18px] uppercase tracking-[1px] text-primary">
          {title ?? t('paymentError')}
        </span>
        <span className="font-dm text-[14px] leading-[22px] text-muted">
          {message}
        </span>

        <button
          className="mt-2 flex h-12 items-center justify-center bg-secondary"
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
