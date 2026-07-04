'use client';

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
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
      <div className="flex w-[85%] max-w-[400px] flex-col gap-4 border border-border bg-white p-6">
        <span className="font-clash font-medium text-[18px] uppercase tracking-[1px] text-primary">
          Sign Out?
        </span>
        <span className="font-dm text-[14px] leading-[22px] text-muted">
          Are you sure you want to sign out of your account?
        </span>

        <div className="mt-2 flex flex-row gap-3">
          <button
            className="flex h-12 flex-1 items-center justify-center border border-border"
            onClick={onCancel}
            disabled={isLoading}
          >
            <span className="font-clash font-medium text-[12px] uppercase tracking-[1px] text-primary">
              KEEP BROWSING
            </span>
          </button>
          <button
            className={`flex h-12 flex-1 items-center justify-center bg-secondary ${isLoading ? 'opacity-60' : ''}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            <span className="font-clash font-medium text-[12px] uppercase tracking-[1px] text-white">
              {isLoading ? 'SIGNING OUT...' : 'SIGN OUT'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
