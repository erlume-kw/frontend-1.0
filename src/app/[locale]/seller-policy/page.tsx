'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import CriteriaSection from '@/components/seller/CriteriaSection';
import PolicySections, { PolicyGroup } from '@/components/seller/PolicySections';
import { useIsDesktop } from '@/lib/useIsDesktop';

type Card = { title: string; body: string };

// The text lives in messages/en.json and messages/ar.json (SellerPolicy). The cards are in the
// same order as the Seller Terms in Notion; each group lists which cards it shows, by position.
//   0 Written Quote        1 Ownership & Warranty   2 Commission             3 Logistics & Handling
//   4 Collection           5 Authentication         6 Prohibited Items       7 Care While With Us
//   8 Photography          9 Pricing                10 Payout                11 How Long We List For
//   12 Uncollected Items   13 Your Details          14 Policy Changes
const GROUPS: { key: 'pricing' | 'collection' | 'general'; layout: PolicyGroup['layout']; cards: number[] }[] = [
  { key: 'pricing', layout: 'features', cards: [0, 2, 3, 9, 10] },
  { key: 'collection', layout: 'whyus', cards: [4, 11, 12, 7, 8] },
  { key: 'general', layout: 'faq', cards: [1, 5, 6, 13, 14] },
];

export default function SellerPolicyPage() {
  const isDesktop = useIsDesktop();
  const t = useTranslations('SellerPolicy');
  const tc = useTranslations('Common');
  const [menuOpen, setMenuOpen] = useState(false);

  const cards = t.raw('cards') as Card[];
  const groups: PolicyGroup[] = GROUPS.map(({ key, layout, cards: indexes }) => ({
    category: t(`groups.${key}`),
    layout,
    items: indexes.map(i => cards[i]),
  }));

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      <MaxWidthContainer>
        {/* Hero */}
        <div className={`flex flex-col gap-2 pb-8 pt-10 ${isDesktop ? 'px-16' : 'px-4'}`}>
          <h1 className={`font-clash font-medium leading-10 text-primary ${isDesktop ? 'text-[56px]' : 'text-[36px]'}`}>
            {t('title')}
          </h1>
          <span className="font-dm text-[13px] text-muted">{tc('lastUpdated', { date: tc('updatedDate') })}</span>
          <span className={`font-dm leading-6 text-muted ${isDesktop ? 'text-[16px]' : 'text-[15px]'}`}>
            {t('subtitle')}
          </span>
        </div>

        {/* Selling Criteria section */}
        <CriteriaSection
          title={t('criteriaTitle')}
          subtitle={t('criteriaSubtitle')}
          items={t.raw('criteria') as string[]}
        />

        {/* Rates */}
        <CriteriaSection title={t('feesTitle')} items={t.raw('fees') as Card[]} />

        {/* Policies — grouped into banner-led, staggered sections */}
        <PolicySections groups={groups} />

        <div className="h-10" />
      </MaxWidthContainer>
    </PageLayout>
  );
}
