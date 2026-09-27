'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Chevron, ARROW_LIGHT } from './Chevron';

// A horizontally scrolling row (scrollbar hidden) with small arrow buttons on the edges
// so it is obvious there is more to see when the last card is cut off.
export default function ScrollRow({
  children,
  className = '',
  arrowTop = 76,
}: {
  children: React.ReactNode;
  className?: string;
  /** Distance of the arrows from the top of the row — aim it at the middle of the images. */
  arrowTop?: number;
}) {
  const tc = useTranslations('Common');
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const update = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    // In a right-to-left row the scroll starts at the right edge and scrollLeft goes negative,
    // so measure the distance from the start edge and map it to the physical left/right arrows.
    const rtl = getComputedStyle(el).direction === 'rtl';
    const fromStart = rtl ? -el.scrollLeft : el.scrollLeft;
    const moreAtStart = fromStart > 2;
    const moreAtEnd = fromStart + el.clientWidth < el.scrollWidth - 2;
    setCanScrollLeft(rtl ? moreAtEnd : moreAtStart);
    setCanScrollRight(rtl ? moreAtStart : moreAtEnd);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    update();
    el.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    Array.from(el.children).forEach(child => observer.observe(child));
    return () => {
      el.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [update, children]);

  const scrollByPage = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  // Same bare arrow as the product page gallery: a plain 40px tap target with the shared chevron.
  const arrowClass = 'absolute z-10 flex h-10 w-10 items-center justify-center';

  return (
    <div className="relative">
      <div ref={scrollerRef} className={`overflow-x-auto [scrollbar-width:none] ${className}`}>
        {children}
      </div>
      {canScrollLeft && (
        <button
          type="button"
          aria-label={tc('scrollLeft')}
          className={`${arrowClass} left-1`}
          style={{ top: arrowTop }}
          onClick={() => scrollByPage(-1)}
        >
          <Chevron dir="left" color={ARROW_LIGHT} />
        </button>
      )}
      {canScrollRight && (
        <button
          type="button"
          aria-label={tc('scrollRight')}
          className={`${arrowClass} right-1`}
          style={{ top: arrowTop }}
          onClick={() => scrollByPage(1)}
        >
          <Chevron dir="right" color={ARROW_LIGHT} />
        </button>
      )}
    </div>
  );
}
