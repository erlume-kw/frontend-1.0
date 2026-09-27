'use client';

import { useTranslations } from 'next-intl';
import React from 'react';

interface LogoutConfirmModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function LogoutConfirmModal({
  visible,
  onCancel,
  onConfirm,
  isLoading = false,
}: LogoutConfirmModalProps) {
  const t = useTranslations('LogoutConfirm');
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
      <div className="flex w-[85%] max-w-[400px] flex-col gap-4 border border-border bg-white p-6">
        <span className="font-clash font-medium text-[18px] uppercase tracking-[1px] text-primary">
          {t('title')}
        </span>
        <span className="font-dm text-[14px] leading-[22px] text-muted">
          {t('body')}
        </span>

        <div className="mt-2 flex flex-row gap-3">
          <button
            className="flex h-12 flex-1 items-center justify-center border border-border"
            onClick={onCancel}
            disabled={isLoading}
          >
            <span className="font-clash font-medium text-[12px] uppercase tracking-[1px] text-primary">
              {t('keep')}
            </span>
          </button>
          <button
            className={`flex h-12 flex-1 items-center justify-center bg-secondary ${isLoading ? 'opacity-60' : ''}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            <span className="font-clash font-medium text-[12px] uppercase tracking-[1px] text-white">
              {isLoading ? t('signingOut') : t('signOut')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
