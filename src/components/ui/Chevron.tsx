'use client';

import React from 'react';

export const ARROW_DARK = '#18230F'; // primary dark — for light backgrounds
export const ARROW_LIGHT = '#F8EDE3'; // primary light — for dark backgrounds

// The storefront's one arrow: used on the product page gallery and dropdowns and on
// scrolling rows, so every arrow looks the same.
export function Chevron({
  dir,
  size = 22,
  color = ARROW_DARK,
}: {
  dir: 'left' | 'right' | 'up' | 'down';
  size?: number;
  color?: string;
}) {
  const rotate = { left: 90, right: -90, up: 180, down: 0 }[dir];
  // Subtle opposite-tone shadow keeps the arrow legible in all cases (and covers
  // cross-origin images whose pixels can't be sampled) without a solid backing.
  const shadow =
    color === ARROW_LIGHT
      ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.45))'
      : 'drop-shadow(0 1px 2px rgba(255,255,255,0.55))';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: `rotate(${rotate}deg)`, filter: shadow, transition: 'stroke 200ms ease-out' }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
