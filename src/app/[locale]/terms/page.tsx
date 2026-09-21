'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import CriteriaSection from '@/components/seller/CriteriaSection';
import { useIsDesktop } from '@/lib/useIsDesktop';
import { isolateLtr } from '@/lib/bidi';

type Card = { title: string; body: string };

// The text lives in messages/en.json and messages/ar.json (Terms). English is the source of truth;
// the Arabic comes from the Buyer and Seller Policies page in the erlume Hub on Notion.
export default function TermsPage() {
  const isDesktop = useIsDesktop();
  const t = useTranslations('Terms');
  const tc = useTranslations('Common');
  const [menuOpen, setMenuOpen] = useState(false);

  const buyerCards = t.raw('buyerCards') as Card[];
  const useCards = t.raw('useCards') as Card[];
  const companyRows = t.raw('companyRows') as { label: string; value: string }[];

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

        <CriteriaSection title={t('buyingTitle')} items={buyerCards} />

        <CriteriaSection title={t('usingTitle')} items={useCards} />

        {/* Company identity disclosure */}
        <div className={`py-8 ${isDesktop ? 'px-16' : 'px-4'}`}>
          <h2 className={`mb-7 font-clash font-medium text-primary ${isDesktop ? 'text-[48px]' : 'text-[32px]'}`}>
            {t('companyTitle')}
          </h2>
          <div className="flex flex-col gap-2">
            {companyRows.map((row, i) => (
              <div key={row.label} className={`flex ${isDesktop ? 'flex-row gap-4' : 'flex-col gap-1'}`}>
                <span className={`font-clash font-semibold text-[14px] text-primary ${isDesktop ? 'w-[220px] shrink-0' : ''}`}>
                  {row.label}
                </span>
                {/* The registered name is Arabic on both language versions of the page */}
                <span
                  className="font-dm text-[14px] leading-[23px] text-olive text-start"
                  dir={i === 0 ? 'rtl' : undefined}
                >
                  {isolateLtr(row.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="h-10" />
      </MaxWidthContainer>
    </PageLayout>
  );
}
