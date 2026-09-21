'use client';

import React, { useState } from 'react';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import CriteriaSection from '@/components/seller/CriteriaSection';
import { useIsDesktop } from '@/lib/useIsDesktop';

const LAST_UPDATED = 'September 2026';

const PRIVACY_COLLECT = [
  'Name, email, phone and address',
  'Account details — username, password and optional profile photo',
  'Order history, wishlist and reviews',
  'For sellers, payout and bank details',
  'Technical data — IP address, device type, operating system and browser analytics',
  'Approximate location derived from IP or device settings',
];

const PRIVACY_USE = [
  'List, sell and manage items',
  'Process payments and payouts',
  'Send transactional email and support replies',
  'Personalise your experience',
];

const PRIVACY_PROTECT = [
  'Bank details and sensitive information are encrypted in transit using industry-standard TLS',
  'Access to personal data is restricted to authorised personnel',
  'Personal and financial information is stored in certified, secure data centres',
];

const PRIVACY_RETENTION = [
  'As long as necessary to provide you with services',
  'As long as necessary to comply with legal obligations',
  'For as long as needed to resolve disputes and enforce agreements',
];

const PRIVACY_COOKIES = [
  'Keep you signed in',
  'Analyse usage',
  'Remember your preferences',
  'See our Cookies policy for the detail',
];

const PRIVACY_PAYMENTS = [
  'Card details are handled by our payment provider and are never stored by erlume',
];

const PRIVACY_TRANSFERS = [
  'Some services we rely on process data outside Kuwait: payment, email delivery, image hosting and invoicing',
  'By using erlume you consent to your information being processed by these providers',
];

const PRIVACY_EMAIL = [
  'Transactional email (orders, verification, returns) is separate from marketing email',
  'Newsletter subscribers can unsubscribe from any marketing email in one click',
];

const PRIVACY_RIGHTS = [
  'You may request deletion of your account and associated data at any time',
  'We may retain order and invoice records where required for accounting',
];

const PRIVACY_SHARING = [
  'We share data only with the services needed to fulfil your order: payment, delivery and invoicing',
  'We do not sell your data to anyone',
  'Your contact details are never shared between buyers and sellers',
];

const PRIVACY_CHANGES = [
  'We may update this policy at any time',
  'Changes will be posted on this page with an updated effective date',
  'Continued use of our platform indicates your acceptance of the revised policy',
];

export default function PrivacyPolicyPage() {
  const isDesktop = useIsDesktop();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      <MaxWidthContainer>
        <div className={`flex flex-col gap-2 pb-8 pt-10 ${isDesktop ? 'px-16' : 'px-4'}`}>
          <h1 className={`font-clash font-medium leading-10 text-primary ${isDesktop ? 'text-[56px]' : 'text-[36px]'}`}>
            PRIVACY POLICY
          </h1>
          <span className="font-dm text-[13px] text-muted">Last Updated: {LAST_UPDATED}</span>
          <span className={`font-dm leading-6 text-muted ${isDesktop ? 'text-[16px]' : 'text-[15px]'}`}>
            Your information is handled with care and never sold.
          </span>
        </div>

        <CriteriaSection title="We collect" items={PRIVACY_COLLECT} />
        <CriteriaSection title="How we use it" items={PRIVACY_USE} />
        <CriteriaSection title="How we protect it" items={PRIVACY_PROTECT} />
        <CriteriaSection title="How long we keep it" items={PRIVACY_RETENTION} />
        <CriteriaSection title="Cookies and similar technologies" items={PRIVACY_COOKIES} />
        <CriteriaSection title="Payment data" items={PRIVACY_PAYMENTS} />
        <CriteriaSection title="Who we share it with" items={PRIVACY_SHARING} />
        <CriteriaSection title="Processing outside Kuwait" items={PRIVACY_TRANSFERS} />
        <CriteriaSection title="Email you receive" items={PRIVACY_EMAIL} />
        <CriteriaSection title="Deletion" items={PRIVACY_RIGHTS} />
        <CriteriaSection title="Changes to this policy" items={PRIVACY_CHANGES} />

        <div className="h-10" />
      </MaxWidthContainer>
    </PageLayout>
  );
}
