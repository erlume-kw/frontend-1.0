'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useIsDesktop } from '@/lib/useIsDesktop';
import HeartIcon from './HeartIcon';

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
  /** Preview-only (e.g. an upcoming drop's items): dimmed, not clickable, no wishlist action. */
  disabled?: boolean;
  /** Sold items stay in the grid, greyed with a SOLD label in place of the price. */
  sold?: boolean;
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
  disabled = false,
  sold = false,
}: ProductCardProps) {
  const isDesktop = useIsDesktop();
  const t = useTranslations('Common');

  // Figma base: 255 × 340 card, 239px image area, 101px info area
  const baseW = cardWidth ?? (isDesktop ? 255 : 160);
  const scale = baseW / 255;
  const cardH = Math.round(340 * scale);
  const imgH = Math.round(239 * scale);
  const textSize = isDesktop ? 14 : 11;
  const heartSize = isDesktop ? 22 : 18;
  const inert = disabled;
  // Match drop-page banner scrim, nudged ~20% darker than the active /50.
  // Upcoming preview cards keep the heavier upcoming-banner treatment (/70).
  const showScrim = disabled || sold;
  const scrimClass = disabled ? 'bg-black/70' : 'bg-black/60';

  return (
    <div
      className={`relative overflow-hidden bg-white ${inert ? 'cursor-default' : 'cursor-pointer'}`}
      style={{ width: baseW, height: cardH }}
      onClick={inert ? undefined : onPress}
      role={inert ? undefined : 'button'}
      aria-disabled={inert || undefined}
    >
      {/* Image / placeholder area */}
      <div className="relative w-full bg-[#F2F2F2]" style={{ height: imgH }}>
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
        {showScrim ? <div className={`absolute inset-0 ${scrimClass}`} /> : null}
      </div>

      {/* Info area — left-aligned */}
      <div className={`flex flex-1 flex-col items-start justify-center gap-[3px] py-2 ${disabled ? 'opacity-60' : ''}`}>
        <span className="w-full truncate font-clash font-medium text-primary" style={{ fontSize: textSize }}>
          {brand}
        </span>
        <span className="w-full truncate font-clash text-olive" style={{ fontSize: textSize }}>
          {name}
        </span>
        <span className="w-full truncate font-clash text-olive" style={{ fontSize: textSize }}>
          {sold ? t('sold') : price}
        </span>
      </div>

      {/* Wishlist heart — top corner (end side) of image area. Hidden for preview-only / sold cards. */}
      {disabled || sold ? null : (
        <button
          className="absolute flex items-center justify-center p-2 -m-2"
          style={{ top: Math.round(10 * scale), insetInlineEnd: Math.round(10 * scale), width: heartSize, height: heartSize, boxSizing: 'content-box' }}
          onClick={e => { e.stopPropagation(); onWishlistPress?.(); }}
          aria-label={isWishlisted ? t('removeFromWishlist') : t('addToWishlist')}
        >
          <HeartIcon size={heartSize} color="#C5705D" filled={isWishlisted} />
        </button>
      )}
    </div>
  );
}
