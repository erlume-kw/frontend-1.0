'use client';

import React from 'react';

interface LeaveCheckoutModalProps {
  visible: boolean;
  onStay: () => void;
  onLeave: () => void;
}

export default function LeaveCheckoutModal({ visible, onStay, onLeave }: LeaveCheckoutModalProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
      <div className="flex w-[85%] max-w-[400px] flex-col gap-4 border border-border bg-white p-6">
        <span className="font-clash font-medium text-[18px] uppercase tracking-[1px] text-primary">
          Leave Checkout?
        </span>
        <span className="font-dm text-[14px] leading-[22px] text-muted">
          Leaving now will cancel your checkout session and release the item so
          others can purchase it.
        </span>

        <div className="mt-2 flex flex-row gap-3">
          <button
            className="flex h-12 flex-1 items-center justify-center border border-border"
            onClick={onStay}
          >
            <span className="font-clash font-medium text-[12px] uppercase tracking-[1px] text-primary">
              STAY
            </span>
          </button>
          <button
            className="flex h-12 flex-1 items-center justify-center bg-secondary"
            onClick={onLeave}
          >
            <span className="font-clash font-medium text-[12px] uppercase tracking-[1px] text-white">
              LEAVE
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
