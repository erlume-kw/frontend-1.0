'use client';

import React, { useEffect, useRef, useState } from 'react';

// ─── Dropdown — floats above all content ──────────────────────────────────────
// Keyboard: type a letter (or the first few letters) to jump to the matching
// option, ↑/↓ to move, Enter to choose, Esc to close. There is no search box.
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
  const [activeIndex, setActiveIndex] = useState(-1);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const typedRef = useRef('');
  const typedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the highlighted option in view while moving through a long list
  useEffect(() => {
    if (open && activeIndex >= 0) optionRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  useEffect(() => () => { if (typedTimerRef.current) clearTimeout(typedTimerRef.current); }, []);

  const openList = () => {
    setActiveIndex(options.indexOf(value));
    setOpen(true);
  };

  const choose = (opt: string) => {
    onSelect(opt);
    setOpen(false);
  };

  const typeAhead = (char: string) => {
    typedRef.current += char.toLowerCase();
    if (typedTimerRef.current) clearTimeout(typedTimerRef.current);
    typedTimerRef.current = setTimeout(() => { typedRef.current = ''; }, 800);

    const typed = typedRef.current;
    const lower = options.map(o => o.toLowerCase());
    let match = lower.findIndex(o => o.startsWith(typed));

    // One letter (or the same letter pressed again) steps through the options that
    // start with it, like a native dropdown
    if (typed.split('').every(c => c === typed[0])) {
      const same = lower.map((o, i) => (o.startsWith(typed[0]) ? i : -1)).filter(i => i >= 0);
      if (same.length) {
        match = same.includes(activeIndex) ? same[(same.indexOf(activeIndex) + 1) % same.length] : same[0];
        typedRef.current = typed[0];
      }
    }
    if (match < 0) return;
    if (!open) setOpen(true);
    setActiveIndex(match);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || e.ctrlKey || e.metaKey || e.altKey) return;

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) { openList(); return; }
      const step = e.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex(i => Math.min(options.length - 1, Math.max(0, i + step)));
    } else if (e.key === 'Enter' && open && activeIndex >= 0) {
      e.preventDefault();
      choose(options[activeIndex]);
    } else if (e.key === 'Escape' && open) {
      e.preventDefault();
      setOpen(false);
    } else if (e.key.length === 1 && (e.key !== ' ' || typedRef.current)) {
      e.preventDefault();
      typeAhead(e.key);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        className={`flex h-[52px] w-full flex-row items-center justify-between px-[11px] ${disabled ? 'bg-[#E8E8E8]' : 'bg-lightGrey'}`}
        onClick={() => { if (!disabled) { if (open) setOpen(false); else openList(); } }}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
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
            tabIndex={-1}
          />
          <div className="absolute left-0 right-0 top-full z-[501] bg-white shadow-[0_4px_8px_rgba(0,0,0,0.12)]">
            <div className="max-h-[200px] overflow-y-auto" role="listbox">
              {options.map((opt, i) => (
                <button
                  type="button"
                  key={opt}
                  ref={el => { optionRefs.current[i] = el; }}
                  tabIndex={-1}
                  role="option"
                  aria-selected={value === opt}
                  className={`block w-full border-b border-lightGrey px-[11px] py-3 text-left ${
                    value === opt ? 'bg-[#EFF5FF]' : i === activeIndex ? 'bg-lightGrey' : ''
                  }`}
                  onClick={() => choose(opt)}
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
