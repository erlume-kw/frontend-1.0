'use client';

import React from 'react';
import { useIsDesktop } from '@/lib/useIsDesktop';

interface ProductCardProps {
  brand?: string;
  name?: string;
  price?: string;
  /** Optional image URI — shows a gray placeholder when omitted */
  imageUri?: string;
  onPress?: () => void;
  onWishlistPress?: () => void;
  isWishlisted?: boolean;
  /**
   * Override card width in px.
   * Defaults to 255 on desktop / 160 on mobile.
   * Card height and image area are scaled proportionally (Figma ratio 255:340).
   */
  cardWidth?: number;
}

export default function ProductCard({
  brand = 'BRAND',
  name = 'PRODUCT NAME',
  price = 'PRICE',
  imageUri,
  onPress,
  onWishlistPress,
  isWishlisted = false,
  cardWidth,
}: ProductCardProps) {
  const isDesktop = useIsDesktop();

  // Figma base: 255 × 340 card, 239px image area, 101px info area
  const baseW = cardWidth ?? (isDesktop ? 255 : 160);
  const scale = baseW / 255;
  const cardH = Math.round(340 * scale);
  const imgH = Math.round(239 * scale);
  const textSize = isDesktop ? 14 : 11;
  const heartSize = isDesktop ? 22 : 18;

  return (
    <div
      className="relative cursor-pointer overflow-hidden bg-white"
      style={{ width: baseW, height: cardH }}
      onClick={onPress}
      role="button"
    >
      {/* Image / placeholder area */}
      <div className="w-full bg-[#F2F2F2]" style={{ height: imgH }}>
        {imageUri ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUri}
            alt=""
            className="h-full w-full object-cover"
            // Dead image URLs fall back to the gray placeholder, like the previous app
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
        ) : null}
      </div>

      {/* Info area — left-aligned */}
      <div className="flex flex-1 flex-col items-start justify-center gap-[3px] py-2">
        <span className="w-full truncate font-clash font-medium text-primary" style={{ fontSize: textSize }}>
          {brand}
        </span>
        <span className="w-full truncate font-clash text-olive" style={{ fontSize: textSize }}>
          {name}
        </span>
        <span className="w-full truncate font-clash text-olive" style={{ fontSize: textSize }}>
          {price}
        </span>
      </div>

      {/* Wishlist heart — top-right of image area */}
      <button
        className="absolute flex items-center justify-center p-2 -m-2"
        style={{ top: Math.round(10 * scale), right: Math.round(10 * scale), width: heartSize, height: heartSize, boxSizing: 'content-box' }}
        onClick={e => { e.stopPropagation(); onWishlistPress?.(); }}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <span className="font-glyph leading-none text-secondary" style={{ fontSize: heartSize }}>
          {isWishlisted ? '♥' : '♡'}
        </span>
      </button>
    </div>
  );
}
