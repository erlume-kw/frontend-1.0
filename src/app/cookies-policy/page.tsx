'use client';

import React, { useState } from 'react';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import CriteriaSection from '@/components/seller/CriteriaSection';
import { useIsDesktop } from '@/lib/useIsDesktop';

const LAST_UPDATED = 'September 2026';

const COOKIE_CARDS = [
  {
    title: 'What Cookies Are',
    body: 'Small files a site stores in your browser so it can recognise you between pages and visits.',
  },
  {
    title: 'Essential Cookies',
    body: 'Required for the site to work — keeping you signed in, remembering your cart, and completing payment. These cannot be switched off.',
  },
  {
    title: 'Analytics',
    body: 'If used, analytics cookies help us understand how the site is used. They are optional and you may decline them.',
  },
  {
    title: 'Managing Cookies',
    body: 'You can clear or block cookies in your browser. Blocking essential cookies will prevent checkout from working.',
  },
  {
    title: 'Cookie Duration',
    body: 'Session cookies are cleared when you close your browser. Persistent cookies remain until they expire or you delete them.',
  },
  {
    title: 'Third-Party Cookies',
    body: 'Some cookies are set by the services we use rather than by erlume directly, such as our payment provider during checkout.',
  },
  {
    title: 'Changes to This Policy',
    body: 'We may update this policy. Changes are posted on this page with an updated effective date.',
  },
];

export default function CookiesPolicyPage() {
  const isDesktop = useIsDesktop();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      <MaxWidthContainer>
        {/* Hero/Title */}
        <div className={`flex flex-col gap-2 pb-8 pt-10 ${isDesktop ? 'px-16' : 'px-4'}`}>
          <h1 className={`font-clash font-medium leading-10 text-primary ${isDesktop ? 'text-[56px]' : 'text-[36px]'}`}>
            COOKIES POLICY
          </h1>
          <span className="font-dm text-[13px] text-muted">Last Updated: {LAST_UPDATED}</span>
          <span className={`font-dm leading-6 text-muted ${isDesktop ? 'text-[16px]' : 'text-[15px]'}`}>
            Learn about how we use cookies to enhance your experience on our platform.
          </span>
        </div>

        {/* Sections */}
        <CriteriaSection title="How We Use Cookies" items={COOKIE_CARDS} />

        {/* CTA */}
        <div className={`py-8 ${isDesktop ? 'px-16' : 'px-4'}`}>
          <div className="flex flex-col gap-3 border border-border bg-white p-6">
            <span className="font-clash font-medium text-[16px] uppercase tracking-[1px] text-primary">
              Have Questions?
            </span>
            <span className="font-dm text-[14px] leading-[22px] text-muted">
              If you have any questions about our use of cookies, please contact us at{' '}
              <span className="text-secondary underline">info@erlume.com.kw</span>
            </span>
          </div>
        </div>

        <div className="h-10" />
      </MaxWidthContainer>
    </PageLayout>
  );
}
