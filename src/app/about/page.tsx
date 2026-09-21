'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import CriteriaSection from '@/components/seller/CriteriaSection';
import { useIsDesktop } from '@/lib/useIsDesktop';
import { FOOTER_DATA } from '@/lib/brand';

// Story copy lives in Notion: erlume Hub → Business Overview → "About Us (website copy)".
const STORY = [
  "Erlume is Kuwait's curated destination for pre-loved treasures where every piece carries a story. We're a trusted community dedicated to buying and selling quality, pre-loved bags in a kind and respectful way.",
  "Our mission is to offer a sustainable and stylish alternative to fast fashion, while creating a supportive space for both buyers and sellers. Whether you're searching for a unique find or a new home for a cherished piece, Erlume helps you make a meaningful impact — one beautiful bag at a time.",
];

const HOW_IT_WORKS = [
  {
    title: 'Sellers hand their bags to us',
    body: 'We authenticate, clean and photograph every bag, then list it on the website.',
  },
  {
    title: 'Every bag is graded',
    body: 'Each item is graded New, Like New, Gently Used, Fair or Worn, and photographed as received, so you know exactly what you are buying.',
  },
  {
    title: 'New pieces arrive in drops',
    body: 'Browse what is live now, or see what is coming next.',
  },
  {
    title: 'Delivered to you',
    body: 'Order and pay on the website, and we deliver across Kuwait.',
  },
];

export default function AboutPage() {
  const isDesktop = useIsDesktop();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      <MaxWidthContainer>
        {/* Hero */}
        <div className={`flex flex-col gap-2 pb-8 pt-10 ${isDesktop ? 'px-16' : 'px-4'}`}>
          <h1 className={`font-clash font-medium leading-10 text-primary ${isDesktop ? 'text-[56px]' : 'text-[36px]'}`}>
            ABOUT ERLUME
          </h1>
          <span className={`font-dm leading-6 text-muted ${isDesktop ? 'text-[16px]' : 'text-[15px]'}`}>
            Every piece carries a story.
          </span>
        </div>

        {/* Story */}
        <div className={`py-8 ${isDesktop ? 'px-16' : 'px-4'}`}>
          <h2 className={`mb-7 font-clash font-medium text-primary ${isDesktop ? 'text-[48px]' : 'text-[32px]'}`}>
            Our story
          </h2>
          <div className={`flex flex-col gap-4 ${isDesktop ? 'max-w-[760px]' : ''}`}>
            {STORY.map(paragraph => (
              <p
                key={paragraph}
                className={`font-dm leading-6 text-olive ${isDesktop ? 'text-[16px]' : 'text-[15px]'}`}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <CriteriaSection title="How it works" items={HOW_IT_WORKS} />

        {/* Contact + sell CTA */}
        <div className={`py-8 ${isDesktop ? 'px-16' : 'px-4'}`}>
          <div className="flex flex-col gap-3 border border-border bg-white p-6">
            <span className="font-clash font-medium text-[16px] uppercase tracking-[1px] text-primary">
              Get in touch
            </span>
            <span className="font-dm text-[14px] leading-[22px] text-muted">
              Questions? Email{' '}
              <span className="text-secondary underline">{FOOTER_DATA.contact.email}</span> or message{' '}
              {FOOTER_DATA.contact.phone}.
            </span>
            <button
              className="mt-2 flex h-12 items-center justify-center self-start bg-secondary px-7"
              onClick={() => router.push('/sell')}
            >
              <span className="font-clash font-medium text-[12px] uppercase tracking-[1px] text-white">
                Have a bag to sell?
              </span>
            </button>
          </div>
        </div>

        <div className="h-10" />
      </MaxWidthContainer>
    </PageLayout>
  );
}
