'use client';

import React from 'react';
import { useIsDesktop } from '@/lib/useIsDesktop';

interface Card {
  title: string;
  body: string;
}

interface LegalCardsProps {
  title: string;
  cards: Card[];
}

export default function LegalCards({ title, cards }: LegalCardsProps) {
  const isDesktop = useIsDesktop();

  const getCardBgColor = (index: number) => {
    // Less opaque/lighter versions: semi-transparent with light bg
    return index % 2 === 0 ? 'rgba(197, 112, 93, 0.15)' : 'rgba(24, 35, 15, 0.12)';
  };

  return (
    <div className={`py-8 ${isDesktop ? 'px-16' : 'px-4'}`}>
      <h2 className={`mb-7 font-clash font-medium text-primary ${isDesktop ? 'text-[48px]' : 'text-[32px]'}`}>
        {title}
      </h2>
      <div className={`grid ${isDesktop ? 'grid-cols-4 gap-4' : 'grid-cols-1 gap-3'}`}>
        {cards.map((card, i) => (
          <div
            key={i}
            className="flex flex-col gap-[10px] p-5"
            style={{ backgroundColor: getCardBgColor(i) }}
          >
            <span className="font-clash font-semibold text-[16px] text-primary">{card.title}</span>
            <span className="font-dm text-[14px] leading-[23px] text-olive">{card.body}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
