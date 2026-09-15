'use client';

import React, { useState } from 'react';
import { useIsDesktop } from '@/lib/useIsDesktop';

interface Policy {
  title: string;
  body: string;
}

export type PolicyLayout = 'features' | 'whyus' | 'faq';

export interface PolicyGroup {
  /** Category label shown in the section header (structural, not policy content). */
  category: string;
  layout: PolicyLayout;
  items: Policy[];
}

interface PolicySectionsProps {
  groups: PolicyGroup[];
}

/* ── Shared section header (centered, matching the reference) ─────────────── */
function SectionHeader({ title, isDesktop }: { title: string; isDesktop: boolean }) {
  return (
    <div className="mb-8 flex flex-col items-center text-center">
      <h2 className={`font-clash font-medium text-primary ${isDesktop ? 'text-[48px]' : 'text-[32px]'}`}>
        {title}
      </h2>
    </div>
  );
}

/* ── Pricing → Features layout: bento card grid, alternating widths ───────── */
function FeaturesGrid({ items, isDesktop }: { items: Policy[]; isDesktop: boolean }) {
  // Which card is hovered (by title). On hover the card expands horizontally and
  // its row partner shrinks by the same amount — heights are untouched. The card
  // markup is inlined (not a nested component) so the DOM nodes persist across
  // hover renders and the flex-grow transition can animate instead of snapping.
  const [hovered, setHovered] = useState<string | null>(null);

  const cardBg = (i: number) =>
    i % 2 === 0 ? 'rgba(197, 112, 93, 0.15)' : 'rgba(24, 35, 15, 0.12)';

  const cardInner = (item: Policy) => (
    <>
      <span className={`font-clash font-semibold text-primary ${isDesktop ? 'text-[18px]' : 'text-[16px]'}`}>
        {item.title}
      </span>
      <span className="font-dm text-[14px] leading-[23px] text-olive">{item.body}</span>
    </>
  );

  // Mobile: simple stacked cards, no paired animation.
  if (!isDesktop) {
    return (
      <div className="flex flex-col gap-4">
        {items.map((item, i) => (
          <div key={item.title} className="flex flex-col gap-[10px] p-5" style={{ backgroundColor: cardBg(i) }}>
            {cardInner(item)}
          </div>
        ))}
      </div>
    );
  }

  // Desktop: bento rows of two. Rows alternate 58/42 and 42/58; hovering a card
  // shifts its row to 64/36 in its favour. A lone final card spans full width.
  const rows: Policy[][] = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));

  return (
    <div className="flex flex-col gap-4">
      {rows.map((row, r) => {
        const base = r % 2 === 0 ? [58, 42] : [42, 58];
        return (
          <div key={r} className="flex gap-4" onMouseLeave={() => setHovered(null)}>
            {row.map((item, c) => {
              const partner = row.length === 2 ? row[1 - c] : undefined;
              const grow =
                row.length === 1
                  ? 1
                  : hovered === item.title
                    ? 64
                    : partner && hovered === partner.title
                      ? 36
                      : base[c];
              return (
                <div
                  key={item.title}
                  onMouseEnter={() => setHovered(item.title)}
                  className="flex flex-col gap-[10px] p-6"
                  style={{
                    flexGrow: grow,
                    flexBasis: 0,
                    transition: 'flex-grow 300ms ease-out',
                    willChange: 'flex-grow',
                    backgroundColor: cardBg(r * 2 + c),
                  }}
                >
                  {cardInner(item)}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/* ── Collection / Logistics → Why-Us layout: up-to-4-col grid that stretches ─ */
function WhyUsGrid({ items, isDesktop }: { items: Policy[]; isDesktop: boolean }) {
  return (
    <div className={`flex flex-wrap ${isDesktop ? 'gap-4' : 'gap-3'}`}>
      {items.map((item) => (
        <div
          key={item.title}
          className="flex flex-col gap-3 border border-border p-5 transition-transform duration-300 ease-out hover:-translate-y-1"
          style={{
            // Up to 4 per row (basis ≈ 25% minus the gap); flexGrow makes any
            // row with fewer than 4 cards stretch to fill the full width.
            flexBasis: isDesktop ? 'calc(25% - 12px)' : '100%',
            flexGrow: 1,
            minWidth: isDesktop ? '200px' : undefined,
          }}
        >
          <h3 className={`font-clash font-semibold text-primary ${isDesktop ? 'text-[18px]' : 'text-[16px]'}`}>
            {item.title}
          </h3>
          <p className="font-dm text-[14px] leading-[23px] text-olive">{item.body}</p>
        </div>
      ))}
    </div>
  );
}

/* ── General → FAQ layout: title on the left, accordion on the right ──────── */
function FaqList({ category, items, isDesktop }: { category: string; items: Policy[]; isDesktop: boolean }) {
  const [open, setOpen] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  return (
    <div className={`flex ${isDesktop ? 'flex-row gap-12' : 'flex-col gap-6'}`}>
      <div className={isDesktop ? 'w-1/3 shrink-0' : ''}>
        <h2 className={`font-clash font-medium text-primary ${isDesktop ? 'text-[48px]' : 'text-[32px]'}`}>
          {category}
        </h2>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {items.map((item, i) => {
          const isOpen = open.has(i);
          return (
            <div key={item.title} className="bg-lightGrey">
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-200 ease-out hover:bg-[#ECEAE6]"
              >
                <span className="font-clash font-semibold text-[16px] text-primary">{item.title}</span>
                {/* + / − icon: the vertical bar collapses when open */}
                <span className="relative block h-4 w-4 shrink-0" aria-hidden>
                  <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-secondary" />
                  <span
                    className={`absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-secondary transition-transform duration-300 ease-out ${
                      isOpen ? 'scale-y-0' : 'scale-y-100'
                    }`}
                  />
                </span>
              </button>
              {/* Animated expand/collapse via grid-rows 0fr → 1fr */}
              <div
                className="grid transition-[grid-template-rows] duration-300 ease-out"
                style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <p
                    className={`px-5 pb-5 font-dm text-[14px] leading-[23px] text-olive transition-opacity duration-300 ease-out ${
                      isOpen ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {item.body}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PolicySections({ groups }: PolicySectionsProps) {
  const isDesktop = useIsDesktop();

  return (
    <div className="flex flex-col">
      {groups.map((group) => (
        <section key={group.category} className={isDesktop ? 'px-16 py-12' : 'px-4 py-10'}>
          {group.layout === 'faq' ? (
            <FaqList category={group.category} items={group.items} isDesktop={isDesktop} />
          ) : (
            <>
              <SectionHeader title={group.category} isDesktop={isDesktop} />
              {group.layout === 'features' ? (
                <FeaturesGrid items={group.items} isDesktop={isDesktop} />
              ) : (
                <WhyUsGrid items={group.items} isDesktop={isDesktop} />
              )}
            </>
          )}
        </section>
      ))}
    </div>
  );
}
