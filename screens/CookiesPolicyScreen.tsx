import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import SiteHeader from '../components/layout/SiteHeader';
import PageLayout from '../components/layout/PageLayout';
import SideMenu from '../components/layout/SideMenu';
import MaxWidthContainer from '../components/layout/MaxWidthContainer';
import CriteriaSection from '../components/seller/CriteriaSection';
import { COLORS, FONTS, BREAKPOINT, SCREEN_PADDING } from '../constants/brand';

const LAST_UPDATED = 'June 2026';

const COOKIES_WHAT = [
  'Cookies are small text files that are stored on your device when you visit a website.',
  'They allow us to remember information about your visit and improve your browsing experience.',
  'Cookies are widely used on the internet and are essential for many website features to function properly.',
];

const COOKIES_TYPES = [
  'Essential Cookies: These cookies are necessary for the website to function properly. They enable basic functions like page navigation and access to secure areas.',
  'Performance & Analytics Cookies: We use these to understand how visitors interact with our site. This helps us improve performance and user experience.',
  'Preference Cookies: These cookies remember your preferences and settings, so you don\'t have to re-enter them every time you visit.',
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

export default function CookiesPolicyScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;
  const pad = isDesktop ? SCREEN_PADDING.desktop : 16;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      <ScrollView>
        <MaxWidthContainer>
          {/* Hero/Title */}
          <View style={{ paddingHorizontal: pad, paddingTop: 40, paddingBottom: 32, gap: 8 }}>
            <Text style={[s.heroTitle, isDesktop && { fontSize: 56 }]}>COOKIES POLICY</Text>
            <Text style={s.lastUpdated}>Last Updated: {LAST_UPDATED}</Text>
            <Text style={[s.heroSub, isDesktop && { fontSize: 17 }]}>
              Learn about how we use cookies to enhance your experience on our platform.
            </Text>
          </View>

          {/* Sections */}
          <CriteriaSection title="What Are Cookies?" items={COOKIES_WHAT} />
          <CriteriaSection title="Types of Cookies We Use" items={COOKIES_TYPES} />
          <CriteriaSection title="Your Cookie Choices" items={COOKIES_CHOICES} />
          <CriteriaSection title="Cookie Duration" items={COOKIES_DURATION} />
          <CriteriaSection title="Third-Party Cookies" items={COOKIES_THIRD_PARTY} />
          <CriteriaSection title="Changes to This Policy" items={COOKIES_CHANGES} />

          {/* CTA */}
          <View style={{ paddingHorizontal: pad, paddingVertical: 32 }}>
            <View style={s.ctaSection}>
              <Text style={s.ctaTitle}>Have Questions?</Text>
              <Text style={s.ctaText}>
                If you have any questions about our use of cookies, please contact us at{' '}
                <Text style={s.email}>erlumekw@gmail.com</Text>
              </Text>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </MaxWidthContainer>
      </ScrollView>
    </PageLayout>
  );
}

const s = StyleSheet.create({
  heroTitle: {
    fontFamily: FONTS.clashMedium,
    fontSize: 36,
    color: COLORS.primary,
    lineHeight: 40,
  },
  lastUpdated: {
    fontFamily: FONTS.dmRegular,
    fontSize: 13,
    color: COLORS.muted,
  },
  heroSub: {
    fontFamily: FONTS.dmRegular,
    fontSize: 15,
    color: COLORS.muted,
    lineHeight: 24,
  },
  ctaSection: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    gap: 12,
  },
  ctaTitle: {
    fontFamily: FONTS.clashMedium,
    fontSize: 16,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ctaText: {
    fontFamily: FONTS.dmRegular,
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 22,
  },
  email: {
    color: COLORS.secondary,
    textDecorationLine: 'underline',
  },
});
