import React from 'react';

/**
 * Wishlist heart. One outline shape everywhere — the wishlisted state fills
 * the SAME silhouette instead of swapping to a different glyph, so the icon
 * looks identical whether signed in or out (and across operating systems).
 */
export default function HeartIcon({
  size = 22,
  color = '#C5705D',
  filled = false,
}: {
  size?: number;
  color?: string;
  filled?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
