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
  'Full name, email address, phone number, and physical address',
  'Bank account details and payment provider information',
  'Username, password, and optional profile photo',
  'Sales data, item descriptions, and transaction history',
  'IP address, device type, operating system, and browser analytics',
  'Approximate location based on IP address or device settings',
];

const PRIVACY_USE = [
  'Enable you to list, sell, and manage your products on our platform',
  'Process payments to your bank account or preferred payment provider',
  'Enhance functionality and personalise your experience',
  'Send transactional emails and support responses',
  'Verify your identity for anti-fraud and anti-money laundering compliance',
  'Monitor and prevent fraudulent activity on the platform',
];

const PRIVACY_PROTECT = [
  'Bank details and sensitive information encrypted using industry-standard TLS protocols',
  'Restricted access to personal data for authorised personnel only',
  'Personal and financial information stored in certified, secure data centres',
];

const PRIVACY_RETENTION = [
  'As long as necessary to provide you with services',
  'As long as necessary to comply with legal obligations',
  'For as long as needed to resolve disputes and enforce agreements',
];

const PRIVACY_COOKIES = [
  'Authenticate your login and maintain your session',
  'Analyse usage trends to improve the platform',
  'Customise your experience and remember your preferences',
];

const PRIVACY_PAYMENTS = [
  'Card details are handled by our payment provider and are never stored by erlume',
  'We receive only the result of a payment, not your card number',
];

const PRIVACY_TRANSFERS = [
  'Some services we rely on process data outside Kuwait: payment, email delivery, image hosting and invoicing',
  'By using erlume you consent to your information being processed by these providers',
];

const PRIVACY_EMAIL = [
  'Transactional email (orders, verification, returns) is separate from marketing email',
  'Newsletter subscribers can unsubscribe from any marketing email in one click',
  'We will always send you transactional email about an order you placed',
];

const PRIVACY_RIGHTS = [
  'You may request deletion of your account and associated data at any time',
  'We may retain order and invoice records where required for accounting',
  'You can ask us what information we hold about you',
];

const PRIVACY_SHARING = [
  'We share data only with the services needed to fulfil your order: payment, delivery and invoicing',
  'We do not sell your data to anyone',
  'Your contact details are never shared between buyers and sellers',
];

const PRIVACY_CHANGES = [
  'We reserve the right to update this Privacy Policy at any time',
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
          <span className={`font-dm leading-6 text-muted ${isDesktop ? 'text-[17px]' : 'text-[15px]'}`}>
            Your information is handled with care and never sold or shared with third parties.
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
        <CriteriaSection title="Your rights" items={PRIVACY_RIGHTS} />
        <CriteriaSection title="Changes to this policy" items={PRIVACY_CHANGES} />

        <div className="h-10" />
      </MaxWidthContainer>
    </PageLayout>
  );
}
