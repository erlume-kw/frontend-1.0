'use client';

import { useEffect, useState } from 'react';

// Generic min-width media query. Used where a component needs its own breakpoint
// rather than the app-wide 768px desktop cutoff (e.g. the header, which needs
// more room before it can show the full nav comfortably).
export function useMinWidth(px: number): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= px,
  );

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${px}px)`);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [px]);

  return matches;
}
