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
  'No missing parts: straps, buckles, or zippers must be intact',
  'Bags and wallets must open and close properly',
  'Material type must be disclosed (leather, fabric, metal)',
  'No broken clasps, missing stones, or structural damage',
  'Sizing information must be included where applicable',
  'Original box or pouch preferred but not required',
];

const LEGAL_CARDS = [
  {
    title: 'Commission & Fees',
    body: 'We take 25% of the item’s assessed value, with a minimum of 10 KWD, deducted from the sale proceeds. Your quote states the exact amount in KWD. Fees are non-refundable once a sale is completed.',
  },
  {
    title: 'Your Quote',
    body: 'You receive a written quote before handing anything over, showing the estimated listing price, our commission, and your payout. Nothing proceeds without your acceptance.',
  },
  {
    title: 'Payout',
    body: 'Your share is transferred once the buyer’s payment has cleared and the return window has passed.',
  },
  {
    title: 'How We Price',
    body: 'Prices are set by our valuation method (brand tier, age, condition and comparable sold prices) rather than negotiated per item.',
  },
  {
    title: 'Logistics & Handling',
    body: 'A 2.5% uplift is added to the buyer-facing price to cover payment and handling. This is not deducted from your payout.',
  },
  {
    title: 'Price Reductions',
    body: 'While an item stays unsold, its price reduces in stages after the first month, from 15% at two months up to 75% by five. We tell you before each step, and you can stop it or take the item back at any time.',
  },
  {
    title: 'How Long We List For',
    body: 'Your item stays listed for its drop and continues afterwards while we work to sell it, which can be longer than a month. You can ask for it back at any time, and if it has not sold by the end of the reduction schedule we return it to you.',
  },
  {
    title: 'Care While With Us',
    body: 'We take reasonable care of your item while it is with us for cleaning, photography and storage. If it is lost or damaged in our possession, we compensate you at the payout value on your accepted quote.',
  },
  {
    title: 'Minimum Value',
    body: 'We accept items with an estimated listing price of 100 KWD or above.',
  },
  {
    title: 'Collection',
    body: 'Dropping your item off to us is always free. We can also arrange collection for a small fee, which depends on how it is collected and is confirmed in your quote before you commit.',
  },
  {
    title: 'Ownership',
    body: 'You guarantee that every item you list is yours to sell, free of any claim by anyone else, and genuine. You remain the owner until it sells; we hold your item, we never buy it.',
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
    title: 'Uncollected Items',
    body: 'If we cannot reach you to return an item, we will contact you at your registered details. Items uncollected six months after they become due may be donated.',
  },
  {
    title: 'Your Anonymity',
    body: 'Your identity is kept completely anonymous. Your information is never shared with buyers or any third parties.',
  },
  {
    title: 'Image Rights & Reuse',
    body: 'By listing items, you grant us a perpetual license to use product photography for marketing, promotional, and archival purposes.',
  },
  {
    title: 'Marketing Rights',
    body: 'We may feature your items in curated edits, collections, or on our social media. This is solely to help your pieces sell faster.',
  },
  {
    title: 'Policy Changes',
    body: 'We reserve the right to update our terms at any time. You will be notified of any material changes.',
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
          subtitle="Items that don't meet these criteria won't be listed, and we'll arrange to return them to you. Please review before submitting."
          items={SELLING_CRITERIA}
        />

        {/* Legal section */}
        <LegalCards title="Legal" cards={LEGAL_CARDS} />

        <div className="h-10" />
      </MaxWidthContainer>
    </PageLayout>
  );
}
