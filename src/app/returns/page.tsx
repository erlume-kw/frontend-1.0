'use client';

import React, { useState } from 'react';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import CriteriaSection from '@/components/seller/CriteriaSection';
import { useIsDesktop } from '@/lib/useIsDesktop';

const LAST_UPDATED = 'September 2026';

const RETURN_CARDS = [
  {
    title: '28 Days to Return',
    body: 'Tell us within 28 days of receiving your item if you would like to return it. Items must come back in the condition they were sent, with all packaging and inclusions.',
  },
  {
    title: 'Not as Described',
    body: 'If an item differs materially from its listed condition, its photographs, or its authenticity, we cover the return delivery and refund you in full.',
  },
  {
    title: 'Change of Mind',
    body: 'Where a return is accepted for any other reason, return delivery is at your cost and the original delivery fee is not refunded.',
  },
  {
    title: 'Refund Timing',
    body: 'Refunds are issued to your original payment method, normally within 3 to 14 business days of us receiving and inspecting the item.',
  },
  {
    title: 'Authenticity',
    body: 'Every item is authenticated before listing. If an item is later shown not to be authentic, we refund you in full including delivery.',
  },
  {
    title: 'Pre-Loved Items',
    body: 'Items are second-hand unless stated otherwise. Minor signs of wear consistent with the stated grade are expected and are not grounds for return.',
  },
  {
    title: 'Cancelled Checkouts',
    body: 'An unpaid checkout is released automatically. If a payment arrives after an order has been cancelled, it is refunded automatically, so there is no need to contact us.',
  },
  {
    title: 'Starting a Return',
    body: 'Email info@erlume.com.kw or message +965 97226735 with your order number, and we will arrange collection.',
  },
];

export default function ReturnsPage() {
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
            RETURNS & REFUNDS
          </h1>
          <span className="font-dm text-[13px] text-muted">Last Updated: {LAST_UPDATED}</span>
          <span className={`font-dm leading-6 text-muted ${isDesktop ? 'text-[16px]' : 'text-[15px]'}`}>
            You have 28 days from delivery to change your mind.
          </span>
        </div>

        <CriteriaSection title="How returns work" items={RETURN_CARDS} />

        <div className="h-10" />
      </MaxWidthContainer>
    </PageLayout>
  );
}
