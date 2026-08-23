'use client';

import React, { useState } from 'react';
import EyeIcon from '@/components/ui/EyeIcon';

const variantClass = {
  bordered:
    'h-[50px] w-full border border-border px-3 font-dm text-[14px] text-black outline-none placeholder:text-muted',
  filled:
    'h-[52px] w-full border-0 bg-lightGrey px-[11px] font-dm text-[14px] text-black outline-none placeholder:text-muted',
} as const;

const inputErrorClass = 'border-error bg-[rgba(185,64,64,0.08)]';

type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  error?: boolean;
  variant?: keyof typeof variantClass;
};

export default function PasswordInput({
  className = '',
  error = false,
  variant = 'bordered',
  disabled,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={`${variantClass[variant]} pr-12 ${error ? inputErrorClass : ''} ${className}`}
        disabled={disabled}
      />
      <button
        type="button"
        className="absolute right-0 top-0 flex h-full w-12 items-center justify-center text-muted transition-colors duration-150 hover:text-primary disabled:opacity-60"
        onClick={() => setVisible(v => !v)}
        disabled={disabled}
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        <EyeIcon slashed={visible} />
      </button>
    </div>
  );
}
