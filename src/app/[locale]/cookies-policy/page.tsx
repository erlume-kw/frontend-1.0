'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import CriteriaSection from '@/components/seller/CriteriaSection';
import { useIsDesktop } from '@/lib/useIsDesktop';
import { FOOTER_DATA } from '@/lib/brand';

// The text lives in messages/en.json and messages/ar.json (CookiesPolicy).
export default function CookiesPolicyPage() {
  const isDesktop = useIsDesktop();
  const t = useTranslations('CookiesPolicy');
  const tc = useTranslations('Common');
  const [menuOpen, setMenuOpen] = useState(false);

  const cards = t.raw('cards') as { title: string; body: string }[];

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      <MaxWidthContainer>
        {/* Hero/Title */}
        <div className={`flex flex-col gap-2 pb-8 pt-10 ${isDesktop ? 'px-16' : 'px-4'}`}>
          <h1 className={`font-clash font-medium leading-10 text-primary ${isDesktop ? 'text-[56px]' : 'text-[36px]'}`}>
            {t('title')}
          </h1>
          <span className="font-dm text-[13px] text-muted">{tc('lastUpdated', { date: tc('updatedDate') })}</span>
          <span className={`font-dm leading-6 text-muted ${isDesktop ? 'text-[16px]' : 'text-[15px]'}`}>
            {t('subtitle')}
          </span>
        </div>

        {/* Sections */}
        <CriteriaSection title={t('sectionTitle')} items={cards} />

        {/* CTA */}
        <div className={`py-8 ${isDesktop ? 'px-16' : 'px-4'}`}>
          <div className="flex flex-col gap-3 border border-border bg-white p-6">
            <span className="font-clash font-medium text-[16px] uppercase tracking-[1px] text-primary">
              {t('ctaTitle')}
            </span>
            <span className="font-dm text-[14px] leading-[22px] text-muted">
              {t.rich('ctaBody', {
                email: FOOTER_DATA.contact.email,
                mail: chunks => (
                  <bdi dir="ltr" className="text-secondary underline">
                    {chunks}
                  </bdi>
                ),
              })}
            </span>
          </div>
        </div>

        <div className="h-10" />
      </MaxWidthContainer>
    </PageLayout>
  );
}
