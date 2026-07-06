'use client';

import React, { useState } from 'react';

// ─── Dropdown — floats above all content ──────────────────────────────────────
export default function SelectField({
  value,
  placeholder,
  options,
  onSelect,
  disabled = false,
}: {
  value: string;
  placeholder: string;
  options: string[];
  onSelect: (v: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        className={`flex h-[52px] w-full flex-row items-center justify-between px-[11px] ${disabled ? 'bg-[#E8E8E8]' : 'bg-lightGrey'}`}
        onClick={() => !disabled && setOpen(o => !o)}
      >
        <span className={`flex-1 truncate text-left font-dm text-[14px] ${value ? 'text-black' : 'text-muted'}`}>
          {value || placeholder}
        </span>
        <span className={`font-clash text-[18px] text-muted ${open ? '-rotate-90' : 'rotate-90'}`}>›</span>
      </button>

      {open && (
        <>
          {/* Tap outside to close */}
          <button
            type="button"
            className="fixed inset-0 z-[500] cursor-default"
            onClick={() => setOpen(false)}
            aria-label="Close dropdown"
          />
          <div className="absolute left-0 right-0 top-full z-[501] bg-white shadow-[0_4px_8px_rgba(0,0,0,0.12)]">
            <div className="max-h-[200px] overflow-y-auto">
              {options.map(opt => (
                <button
                  type="button"
                  key={opt}
                  className={`block w-full border-b border-lightGrey px-[11px] py-3 text-left ${value === opt ? 'bg-[#EFF5FF]' : ''}`}
                  onClick={() => { onSelect(opt); setOpen(false); }}
                >
                  <span className={`font-dm text-[14px] ${value === opt ? 'font-medium text-primary' : 'text-black'}`}>
                    {opt}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
