import React from 'react';

/** Language switcher globe — outline style matching the wishlist heart. */
export default function GlobeIcon({
  size = 22,
  color = '#38452D',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.25" />
      <path d="M3 12h18" />
      <path d="M12 2.75c2.5 2.6 3.75 5.75 3.75 9.25S14.5 18.65 12 21.25c-2.5-2.6-3.75-5.75-3.75-9.25S9.5 5.35 12 2.75z" />
    </svg>
  );
}
