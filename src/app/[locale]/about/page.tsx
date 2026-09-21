'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import CriteriaSection from '@/components/seller/CriteriaSection';
import { useIsDesktop } from '@/lib/useIsDesktop';
import { FOOTER_DATA } from '@/lib/brand';

// The text lives in messages/en.json and messages/ar.json (About). The story copy is also kept in
// Notion: erlume Hub → Business Overview → "About Us (website copy)".
export default function AboutPage() {
  const isDesktop = useIsDesktop();
  const router = useRouter();
  const t = useTranslations('About');
  const [menuOpen, setMenuOpen] = useState(false);

  const story = t.raw('story') as string[];
  const how = t.raw('how') as { title: string; body: string }[];

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
          <span className={`font-dm leading-6 text-muted ${isDesktop ? 'text-[16px]' : 'text-[15px]'}`}>
            {t('subtitle')}
          </span>
        </div>

        {/* Story */}
        <div className={`py-8 ${isDesktop ? 'px-16' : 'px-4'}`}>
          <h2 className={`mb-7 font-clash font-medium text-primary ${isDesktop ? 'text-[48px]' : 'text-[32px]'}`}>
            {t('storyTitle')}
          </h2>
          <div className={`flex flex-col gap-4 ${isDesktop ? 'max-w-[760px]' : ''}`}>
            {story.map(paragraph => (
              <p
                key={paragraph}
                className={`font-dm leading-6 text-olive ${isDesktop ? 'text-[16px]' : 'text-[15px]'}`}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <CriteriaSection title={t('howTitle')} items={how} />

        {/* Contact + sell CTA */}
        <div className={`py-8 ${isDesktop ? 'px-16' : 'px-4'}`}>
          <div className="flex flex-col gap-3 border border-border bg-white p-6">
            <span className="font-clash font-medium text-[16px] uppercase tracking-[1px] text-primary">
              {t('contactTitle')}
            </span>
            <span className="font-dm text-[14px] leading-[22px] text-muted">
              {t.rich('contactBody', {
                email: FOOTER_DATA.contact.email,
                phone: FOOTER_DATA.contact.phone,
                mail: chunks => (
                  <bdi dir="ltr" className="text-secondary underline">
                    {chunks}
                  </bdi>
                ),
                tel: chunks => <bdi dir="ltr">{chunks}</bdi>,
              })}
            </span>
            <button
              className="mt-2 flex h-12 items-center justify-center self-start bg-secondary px-7"
              onClick={() => router.push('/sell')}
            >
              <span className="font-clash font-medium text-[12px] uppercase tracking-[1px] text-white">
                {t('sellCta')}
              </span>
            </button>
          </div>
        </div>

        <div className="h-10" />
      </MaxWidthContainer>
    </PageLayout>
  );
}
