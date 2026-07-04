'use client';

import React, { useState } from 'react';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import CriteriaSection from '@/components/seller/CriteriaSection';
import LegalCards from '@/components/seller/LegalCards';
import { useIsDesktop } from '@/lib/useIsDesktop';

const LAST_UPDATED = 'June 2026';

const SELLING_CRITERIA = [
  'Clean, free of odors, stains, or visible dirt',
  'Not torn, broken, or damaged beyond repair',
  'No fake or imitation items accepted',
  'Must fit within one of our accepted categories (bags, accessories, luxury)',
  'No missing parts — straps, buckles, or zippers must be intact',
  'Bags and wallets must open and close properly',
  'Material type must be disclosed (leather, fabric, metal)',
  'No broken clasps, missing stones, or structural damage',
  'Sizing information must be included where applicable',
  'Original box or pouch preferred but not required',
];

const LEGAL_CARDS = [
  {
    title: 'Ownership',
    body: 'You guarantee you are the legal owner of every item you list and have the right to sell it on this platform.',
  },
  {
    title: 'Authenticity',
    body: 'All items must be authentic. Counterfeit items will result in immediate account suspension and forfeiture of earnings.',
  },
  {
    title: 'Prohibited Items',
    body: 'No illegal, hazardous, recalled, or legally restricted items. We reserve the right to remove listings without notice.',
  },
  {
    title: 'Commission & Fees',
    body: 'You agree to our commission structure. Fees are non-refundable once a sale is completed.',
  },
  {
    title: 'Your Anonymity',
    body: 'Your identity is kept completely anonymous. Your information is never shared with buyers or any third parties.',
  },
  {
    title: 'Marketing Rights',
    body: 'We may feature your items in curated edits, collections, or on our social media. This is solely to help your pieces sell faster.',
  },
  {
    title: 'Policy Changes',
    body: 'We reserve the right to update our terms at any time. You will be notified of any material changes.',
  },
  {
    title: 'Image Rights & Reuse',
    body: 'By listing items, you grant us a perpetual license to use product photography for marketing, promotional, and archival purposes.',
  },
];

export default function SellerPolicyPage() {
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
            SELLING POLICY
          </h1>
          <span className="font-dm text-[13px] text-muted">Last Updated: {LAST_UPDATED}</span>
          <span className={`font-dm leading-6 text-muted ${isDesktop ? 'text-[17px]' : 'text-[15px]'}`}>
            Everything you need to know before listing with erlume.
          </span>
        </div>

        {/* Selling Criteria section */}
        <CriteriaSection
          title="Selling Criteria"
          subtitle="Items that fail our review are not returned. Please review carefully before submitting."
          items={SELLING_CRITERIA}
        />

        {/* Legal section */}
        <LegalCards title="Legal" cards={LEGAL_CARDS} />

        <div className="h-10" />
      </MaxWidthContainer>
    </PageLayout>
  );
}
