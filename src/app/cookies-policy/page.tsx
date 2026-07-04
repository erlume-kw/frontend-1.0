'use client';

import React, { useState } from 'react';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import CriteriaSection from '@/components/seller/CriteriaSection';
import { useIsDesktop } from '@/lib/useIsDesktop';

const LAST_UPDATED = 'June 2026';

const COOKIES_WHAT = [
  'Cookies are small text files that are stored on your device when you visit a website.',
  'They allow us to remember information about your visit and improve your browsing experience.',
  'Cookies are widely used on the internet and are essential for many website features to function properly.',
];

const COOKIES_TYPES = [
  'Essential Cookies: These cookies are necessary for the website to function properly. They enable basic functions like page navigation and access to secure areas.',
  'Performance & Analytics Cookies: We use these to understand how visitors interact with our site. This helps us improve performance and user experience.',
  "Preference Cookies: These cookies remember your preferences and settings, so you don't have to re-enter them every time you visit.",
  'Marketing & Social Media Cookies: We may use these to show you relevant content and to track the effectiveness of our marketing campaigns.',
];

const COOKIES_CHOICES = [
  'Accept all cookies by clicking "Accept" in our cookie banner',
  'Decline non-essential cookies by clicking "Decline"',
  'Manage your cookie preferences in your browser settings',
  'Delete cookies from your device at any time',
];

const COOKIES_DURATION = [
  'Session Cookies: These cookies expire when you close your browser.',
  'Persistent Cookies: These cookies remain on your device for a set period (typically 1 year) or until you manually delete them.',
];

const COOKIES_THIRD_PARTY = [
  'Some content on our website may be provided by third parties, and they may set their own cookies.',
  'We do not control these third-party cookies.',
  'Please review their privacy policies to understand how they use cookies.',
];

const COOKIES_CHANGES = [
  'We reserve the right to update this Cookies Policy from time to time.',
  'Changes will reflect updates in our practices or for operational, legal, or regulatory reasons.',
  'Material changes will be notified by updating the "Last Updated" date.',
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
          <span className={`font-dm leading-6 text-muted ${isDesktop ? 'text-[17px]' : 'text-[15px]'}`}>
            Learn about how we use cookies to enhance your experience on our platform.
          </span>
        </div>

        {/* Sections */}
        <CriteriaSection title="What Are Cookies?" items={COOKIES_WHAT} />
        <CriteriaSection title="Types of Cookies We Use" items={COOKIES_TYPES} />
        <CriteriaSection title="Your Cookie Choices" items={COOKIES_CHOICES} />
        <CriteriaSection title="Cookie Duration" items={COOKIES_DURATION} />
        <CriteriaSection title="Third-Party Cookies" items={COOKIES_THIRD_PARTY} />
        <CriteriaSection title="Changes to This Policy" items={COOKIES_CHANGES} />

        {/* CTA */}
        <div className={`py-8 ${isDesktop ? 'px-16' : 'px-4'}`}>
          <div className="flex flex-col gap-3 border border-border bg-white p-6">
            <span className="font-clash font-medium text-[16px] uppercase tracking-[1px] text-primary">
              Have Questions?
            </span>
            <span className="font-dm text-[14px] leading-[22px] text-muted">
              If you have any questions about our use of cookies, please contact us at{' '}
              <span className="text-secondary underline">erlumekw@gmail.com</span>
            </span>
          </div>
        </div>

        <div className="h-10" />
      </MaxWidthContainer>
    </PageLayout>
  );
}
