'use client';

import React from 'react';
import { useIsDesktop } from '@/lib/useIsDesktop';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';

interface SellerBannerProps {
  items: { label: string; desc: string }[];
}

export default function SellerBanner({ items }: SellerBannerProps) {
  const isDesktop = useIsDesktop();

  const list = (
    <div className={`flex ${isDesktop ? 'flex-row gap-8' : 'flex-col gap-5'}`}>
      {items.map((item, i) => (
        <div key={i} className={`flex flex-col gap-2 ${isDesktop ? 'flex-1' : ''}`}>
          <span className={`font-clash font-semibold text-secondary ${isDesktop ? 'text-[28px]' : 'text-[24px]'}`}>
            {String(i + 1).padStart(2, '0')}
          </span>
          <span className={`font-clash font-medium text-primary ${isDesktop ? 'text-[18px]' : 'text-[16px]'}`}>
            {item.label}
          </span>
          <span className={`font-dm leading-5 text-muted ${isDesktop ? 'text-[15px]' : 'text-[13px]'}`}>
            {item.desc}
          </span>
        </div>
      ))}
    </div>
  );

  // Peach background spans the full width; the text column is capped to line
  // up with the page content below (MaxWidthContainer on desktop, same
  // horizontal padding as the sell page's content div on mobile).
  return (
    <div className={`bg-offWhite ${isDesktop ? 'py-12' : 'py-8'}`}>
      {isDesktop ? (
        <MaxWidthContainer className="px-16">{list}</MaxWidthContainer>
      ) : (
        <div className="px-[19px]">{list}</div>
      )}
    </div>
  );
}
