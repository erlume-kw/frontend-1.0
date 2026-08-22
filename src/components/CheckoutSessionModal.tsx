'use client';

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
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
      <div className="flex w-[85%] max-w-[400px] flex-col gap-4 border border-border bg-white p-6">
        <span className="font-clash font-medium text-[18px] uppercase tracking-[1px] text-primary">
          Still There?
        </span>
        <span className="font-dm text-[14px] leading-[22px] text-muted">
          Your checkout session expires in{' '}
          <span className="font-medium text-primary">{secondsLeft}s</span>. Confirm to
          keep your reservation, or leave to release the item.
        </span>

        <div className="mt-2 flex flex-row gap-3">
          <button
            className="flex h-12 flex-1 items-center justify-center border border-border"
            onClick={onLeave}
            disabled={extending}
          >
            <span className="font-clash font-medium text-[12px] uppercase tracking-[1px] text-primary">
              LEAVE CHECKOUT
            </span>
          </button>
          <button
            className={`flex h-12 flex-1 items-center justify-center bg-secondary ${extending ? 'opacity-60' : ''}`}
            onClick={onExtend}
            disabled={extending}
          >
            <span className="font-clash font-medium text-[12px] uppercase tracking-[1px] text-white">
              {extending ? 'EXTENDING…' : "I'M STILL HERE"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
