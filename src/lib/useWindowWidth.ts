'use client';

import { useEffect, useState } from 'react';

// Live viewport width (CSS px) — replacement for useWindowDimensions().width.
// Components render inside <ClientOnly>, so window exists on first render.
export function useWindowWidth(): number {
  const [width, setWidth] = useState(
    () => (typeof window !== 'undefined' ? window.innerWidth : 1280),
  );

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return width;
}
