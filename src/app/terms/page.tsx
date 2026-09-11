'use client';

import React, { useState } from 'react';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import LegalCards from '@/components/seller/LegalCards';
import { useIsDesktop } from '@/lib/useIsDesktop';

const LAST_UPDATED = 'September 2026';

const BUYER_CARDS = [
  {
    title: 'Authenticity',
    body: 'Every item is authenticated before listing. If an item is later shown not to be authentic, we refund you in full, including delivery.',
  },
  {
    title: 'Returns',
    body: 'Returns are accepted within 3 days of delivery. See our Returns & Refunds policy for the full details.',
  },
  {
    title: 'Condition Grading',
    body: 'Every item is graded New, Like New, Gently Used, Fair or Worn, and photographed as received. The grade and the photographs form part of the description you are buying against.',
  },
  {
    title: 'Pre-Loved Items',
    body: 'Items are second-hand unless stated otherwise. Minor signs of wear consistent with the stated grade are expected and are not grounds for return.',
  },
  {
    title: 'Ordering & Payment',
    body: 'All orders are placed and paid in full on the website. We accept KNET and cards. Your order is confirmed once payment clears, and you receive a confirmation email with your invoice attached.',
  },
  {
    title: 'Delivery & Pickup',
    body: 'Choose delivery or pickup at checkout. Delivery fees are shown before payment and are charged in addition to the item price. We currently deliver within Kuwait only.',
  },
  {
    title: 'Item Reservation',
    body: 'Starting checkout holds the item for 5 minutes. If payment is not completed in that time, the item returns to sale and may be purchased by someone else. Every piece is one of a kind, so a completed payment is the only reservation.',
  },
  {
    title: 'Drops',
    body: 'Items in an upcoming drop are not purchasable until that drop opens, and drop timing may change.',
  },
  {
    title: 'Discount Codes',
    body: 'Codes apply to the item price only, not to delivery, and cannot be combined unless stated otherwise.',
  },
  {
    title: 'Pricing Errors',
    body: 'If an item is listed at an obviously incorrect price, we may cancel the order and refund you in full rather than fulfil it.',
  },
];

const USE_CARDS = [
  {
    title: 'Using the Site',
    body: 'You may browse and purchase for personal use. You may not scrape, copy or republish our listings, photographs or descriptions without permission.',
  },
  {
    title: 'Content Ownership',
    body: 'All photographs, descriptions and site content belong to erlume.',
  },
  {
    title: 'Accounts',
    body: 'You are responsible for activity on your account, so keep your details accurate and your login secure. Some actions need email verification. You can delete your account at any time, and we may suspend accounts used fraudulently, abusively, or in breach of these terms.',
  },
  {
    title: 'Reviews',
    body: 'Reviews must reflect your own honest experience. We may remove reviews that are abusive, false, or unrelated to the item.',
  },
  {
    title: 'Availability',
    body: 'We aim to keep the site available at all times but cannot guarantee uninterrupted service.',
  },
  {
    title: 'Changes to These Terms',
    body: 'We may update these terms. The version that applies to an order is the version published when that order was placed.',
  },
  {
    title: 'Governing Law',
    body: 'These terms are governed by the laws of the State of Kuwait. Any dispute that cannot be resolved directly will be subject to the courts of Kuwait.',
  },
];

const COMPANY_DETAILS: { label: string; value: string; rtl?: boolean }[] = [
  { label: 'Registered name', value: 'شركة فاشن ايرلوم لترويج المنتجات', rtl: true },
  { label: 'Legal form', value: 'One Person Company' },
  { label: 'Commercial licence no.', value: '2025/7386' },
  { label: 'Commercial register no.', value: '525618' },
  { label: 'Contact', value: 'info@erlume.com.kw · +965 97226735' },
];

export default function TermsPage() {
  const isDesktop = useIsDesktop();
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
            TERMS & CONDITIONS
          </h1>
          <span className="font-dm text-[13px] text-muted">Last Updated: {LAST_UPDATED}</span>
          <span className={`font-dm leading-6 text-muted ${isDesktop ? 'text-[17px]' : 'text-[15px]'}`}>
            What you agree to when you buy from erlume.
          </span>
        </div>

        <LegalCards title="Buying from erlume" cards={BUYER_CARDS} />

        <LegalCards title="Using the site" cards={USE_CARDS} />

        {/* Company identity disclosure */}
        <div className={`py-8 ${isDesktop ? 'px-16' : 'px-4'}`}>
          <h2 className={`mb-7 font-clash font-medium text-primary ${isDesktop ? 'text-[48px]' : 'text-[32px]'}`}>
            Company details
          </h2>
          <div className="flex flex-col gap-2">
            {COMPANY_DETAILS.map(row => (
              <div key={row.label} className={`flex ${isDesktop ? 'flex-row gap-4' : 'flex-col gap-1'}`}>
                <span className={`font-clash font-semibold text-[14px] text-primary ${isDesktop ? 'w-[220px] shrink-0' : ''}`}>
                  {row.label}
                </span>
                <span
                  className="font-dm text-[14px] leading-[23px] text-olive text-left"
                  dir={row.rtl ? 'rtl' : undefined}
                >
                  {row.value}
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
