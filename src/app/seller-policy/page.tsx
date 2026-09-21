'use client';

import React, { useState } from 'react';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import CriteriaSection from '@/components/seller/CriteriaSection';
import PolicySections, { PolicyGroup } from '@/components/seller/PolicySections';
import { useIsDesktop } from '@/lib/useIsDesktop';

const LAST_UPDATED = 'September 2026';

const SELLING_CRITERIA = [
  'Clean, free of odours, stains or visible dirt',
  'Not torn, broken, or damaged beyond repair',
  'A bag — we only accept bags',
  'Complete — straps, buckles and zippers intact, no missing parts',
  'Functional — the bag must open and close properly',
  'Free of broken clasps, missing stones or structural damage',
  'Material type disclosed (leather, fabric, metal), with sizing included where applicable',
  'Original box or pouch is preferred but not required',
];

const FEES = [
  { title: 'Commission', body: '25% of the item’s assessed value' },
  { title: 'Minimum commission', body: '10 KWD' },
  { title: 'Logistics & handling', body: '2.5% added to the buyer price — not deducted from you' },
  { title: 'Minimum accepted value', body: '100 KWD estimated listing price' },
  { title: 'Drop-off by you', body: 'Free' },
  { title: 'Collection', body: '3–5 KWD, by erlume driver or third-party courier' },
];

const LEGAL_CARDS = [
  {
    title: 'Written Quote',
    body: 'You receive a written quote before handing anything over, showing the estimated listing price, our commission, and your payout. Nothing proceeds without your acceptance.',
  },
  {
    title: 'Ownership & Warranty',
    body: 'You confirm that the item is yours to sell, is free of any claim by another party, and is genuine. You remain the owner of the item until it is sold.',
  },
  {
    title: 'Commission',
    body: '25% of the item’s assessed value, deducted from the sale proceeds. Your quote states the exact amount in KWD.',
  },
  {
    title: 'Logistics & Handling',
    body: 'A 2.5% logistics & handling charge is added to the buyer-facing price. This is not deducted from your payout.',
  },
  {
    title: 'Collection',
    body: 'We collect your items before the drop opens. Collection costs between 3 and 5 KWD.',
  },
  {
    title: 'Authentication & Verification',
    body: 'All items are authenticated. We reserve the right to decline any item we cannot verify. Counterfeit items result in account suspension and forfeiture of earnings.',
  },
  {
    title: 'Prohibited Items',
    body: 'No illegal, hazardous, recalled or legally restricted items. We may remove a listing without notice.',
  },
  {
    title: 'Care While With Us',
    body: 'We take reasonable care of your item while it is in our possession for cleaning, photography and storage. If an item is lost or damaged while with us, we compensate you at the payout value stated on your accepted quote.',
  },
  {
    title: 'Photography & Listing',
    body: 'Items are cleaned, photographed and listed by erlume, and we determine how they are presented. Photographs taken by erlume remain our property and we may continue to use them after the item is sold or returned.',
  },
  {
    title: 'Pricing',
    body: 'Prices are set by our valuation method — brand tier, age, condition and comparable sold prices — rather than negotiated per item.',
  },
  {
    title: 'Payout',
    body: 'Your share is transferred once the buyer’s payment has cleared and the return window has passed (14 days).',
  },
  {
    title: 'How Long We List For',
    body: 'Your item stays listed for its drop and continues afterwards while we work to sell it — a drop can run longer than a month.',
  },
  {
    title: 'Uncollected Items',
    body: 'If we cannot reach you to return an item, we will contact you at your registered details. Items uncollected six months after they become due may be donated.',
  },
  {
    title: 'Your Details',
    body: 'We do not share your contact details with buyers. All communication goes through erlume.',
  },
  {
    title: 'Policy Changes',
    body: 'We may update these terms at any time. You will be notified of any material change.',
  },
];

// Grouping is purely organizational — each group references the LEGAL_CARDS
// entries above by their exact title, so no policy wording is changed, added,
// or removed. Every card lands in exactly one group.
const GROUP_TITLES: { category: string; layout: PolicyGroup['layout']; titles: string[] }[] = [
  {
    category: 'Pricing',
    layout: 'features',
    titles: ['Written Quote', 'Commission', 'Logistics & Handling', 'Pricing', 'Payout'],
  },
  {
    category: 'Collection and Handling',
    layout: 'whyus',
    titles: [
      'Collection',
      'How Long We List For',
      'Uncollected Items',
      'Care While With Us',
      'Photography & Listing',
    ],
  },
  {
    category: 'General',
    layout: 'faq',
    titles: [
      'Ownership & Warranty',
      'Authentication & Verification',
      'Prohibited Items',
      'Your Details',
      'Policy Changes',
    ],
  },
];

const POLICY_GROUPS: PolicyGroup[] = GROUP_TITLES.map(({ category, layout, titles }) => ({
  category,
  layout,
  items: titles
    .map((t) => LEGAL_CARDS.find((c) => c.title === t))
    .filter((c): c is (typeof LEGAL_CARDS)[number] => Boolean(c)),
}));

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
          <span className={`font-dm leading-6 text-muted ${isDesktop ? 'text-[16px]' : 'text-[15px]'}`}>
            Everything you need to know before listing with erlume.
          </span>
        </div>

        {/* Selling Criteria section */}
        <CriteriaSection
          title="Selling Criteria"
          subtitle="Items that don't meet these criteria won't be listed, and we'll arrange to return them to you. Please review before submitting."
          items={SELLING_CRITERIA}
        />

        {/* Rates */}
        <CriteriaSection title="Commission & Fees" items={FEES} />

        {/* Policies — grouped into banner-led, staggered sections */}
        <PolicySections groups={POLICY_GROUPS} />

        <div className="h-10" />
      </MaxWidthContainer>
    </PageLayout>
  );
}
