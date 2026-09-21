'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import CriteriaSection from '@/components/seller/CriteriaSection';
import { useIsDesktop } from '@/lib/useIsDesktop';

// The text lives in messages/en.json and messages/ar.json (Returns).
export default function ReturnsPage() {
  const isDesktop = useIsDesktop();
  const t = useTranslations('Returns');
  const tc = useTranslations('Common');
  const [menuOpen, setMenuOpen] = useState(false);

  const cards = t.raw('cards') as { title: string; body: string }[];

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

        <CriteriaSection title={t('sectionTitle')} items={cards} />

        <div className="h-10" />
      </MaxWidthContainer>
    </PageLayout>
  );
}
