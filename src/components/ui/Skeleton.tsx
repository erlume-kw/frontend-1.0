'use client';

import React from 'react';

// ─── Base animated box ────────────────────────────────────────────────────────
// animate-pulse approximates the previous 600ms opacity loop
export function SkeletonBox({
  width,
  height,
  className = '',
  style,
}: {
  width?: number | string;
  height: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`animate-pulse bg-placeholder ${className}`}
      style={{ width: width ?? '100%', height, ...style }}
    />
  );
}

// ─── Product card skeleton ────────────────────────────────────────────────────
// Matches ProductCard: 255×340 base, 239px image area (#F2F2F2), 101px info (py-2, gap 3)
export function SkeletonProductCard({
  width,
  height,
  isDesktop = false,
}: {
  width: number;
  height: number;
  isDesktop?: boolean;
}) {
  const scale = width / 255;
  const imgH = Math.round(239 * scale);
  const textH = isDesktop ? 14 : 11;

  return (
    <div className="bg-white" style={{ width, height }}>
      <SkeletonBox height={imgH} style={{ backgroundColor: '#F2F2F2' }} />
      <div className="flex flex-1 flex-col justify-center py-2">
        <SkeletonBox height={textH} width="55%" />
        <SkeletonBox height={textH} width="80%" style={{ marginTop: 3 }} />
        <SkeletonBox height={textH} width="40%" style={{ marginTop: 3 }} />
      </div>
    </div>
  );
}

// ─── Drop banner card skeleton ────────────────────────────────────────────────
export function SkeletonDropCard({ height }: { height: number }) {
  return <SkeletonBox height={height} />;
}

// ─── Product detail page skeleton ────────────────────────────────────────────
// Mirrors the exact layout of the product page (desktop + mobile)
export function SkeletonProductDetail({
  isDesktop,
  screenWidth,
}: {
  isDesktop: boolean;
  screenWidth: number;
}) {
  if (isDesktop) {
    // Desktop: left gallery (width 684) + right info panel
    const galleryW = 684;
    const thumbW = Math.floor((galleryW - 4 * 2) / 3); // 3 thumbs, 4px gaps
    return (
      <div>
        <div className="flex flex-row items-start">
          {/* Gallery */}
          <div style={{ width: galleryW }}>
            <div className="mb-1 flex flex-row gap-1">
              <SkeletonBox width={thumbW} height={268} />
              <SkeletonBox width={thumbW} height={268} />
              <SkeletonBox width={thumbW} height={268} />
            </div>
            <SkeletonBox height={1036} />
          </div>

          {/* Info panel */}
          <div className="flex flex-1 flex-col gap-4 py-12 pl-12">
            <div className="flex flex-col gap-2">
              <SkeletonBox height={40} width="65%" />
              <SkeletonBox height={22} width="35%" />
              <SkeletonBox height={16} width="25%" />
            </div>
            <div className="flex h-[75px] flex-row">
              <SkeletonBox width={75} height={75} />
              <div className="flex-1">
                <SkeletonBox height={75} />
              </div>
            </div>
            <SkeletonBox height={44} />
            <SkeletonBox height={44} />
          </div>
        </div>
      </div>
    );
  }

  // Mobile: stacked layout (px-4, pt-6, gap 14); carousel aspectRatio 0.66
  const contentWidth = screenWidth - 32;
  const carouselH = Math.round(contentWidth / 0.66);
  return (
    <div className="flex flex-col gap-[14px] px-4 pt-6">
      <div>
        <SkeletonBox height={40} width="65%" />
        <SkeletonBox height={20} width="35%" style={{ marginTop: 2 }} />
        <SkeletonBox height={16} width="25%" style={{ marginTop: 2 }} />
      </div>
      <SkeletonBox height={carouselH} />
      <div className="flex h-[75px] flex-row">
        <SkeletonBox width={75} height={75} />
        <div className="flex-1">
          <SkeletonBox height={75} />
        </div>
      </div>
      <SkeletonBox height={44} />
      <SkeletonBox height={44} />
    </div>
  );
}
