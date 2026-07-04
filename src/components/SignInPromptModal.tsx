'use client';

import React from 'react';

interface SignInPromptModalProps {
  visible: boolean;
  onClose: () => void;
  onSignIn: () => void;
}

export default function SignInPromptModal({ visible, onClose, onSignIn }: SignInPromptModalProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
      <div className="flex w-[85%] max-w-[400px] flex-col gap-4 border border-border bg-white p-6">
        <span className="font-clash font-medium text-[18px] uppercase tracking-[1px] text-primary">
          Sign In Required
        </span>
        <span className="font-dm text-[14px] leading-[22px] text-muted">
          You need to be signed in to add items to your wishlist.
        </span>

        <div className="mt-2 flex flex-row gap-3">
          <button
            className="flex h-12 flex-1 items-center justify-center border border-border"
            onClick={onClose}
          >
            <span className="font-clash font-medium text-[12px] uppercase tracking-[1px] text-primary">
              MAYBE LATER
            </span>
          </button>
          <button
            className="flex h-12 flex-1 items-center justify-center bg-secondary"
            onClick={onSignIn}
          >
            <span className="font-clash font-medium text-[12px] uppercase tracking-[1px] text-white">
              SIGN IN
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
