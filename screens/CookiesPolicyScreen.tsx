import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import SiteHeader from '../components/layout/SiteHeader';
import PageLayout from '../components/layout/PageLayout';
import SideMenu from '../components/layout/SideMenu';
import MaxWidthContainer from '../components/layout/MaxWidthContainer';
import { COLORS, FONTS, BREAKPOINT, SCREEN_PADDING } from '../constants/brand';

const SECTIONS = [
  {
    title: 'What Are Cookies?',
    content: `Cookies are small text files that are stored on your device when you visit a website. They allow us to remember information about your visit and improve your browsing experience. Cookies are widely used on the internet and are essential for many website features to function properly.`,
  },
  {
    title: 'Types of Cookies We Use',
    content: `We use the following types of cookies on our website:

• Essential Cookies: These cookies are necessary for the website to function properly. They enable basic functions like page navigation and access to secure areas.

• Performance & Analytics Cookies: We use these to understand how visitors interact with our site. This helps us improve performance and user experience.

• Preference Cookies: These cookies remember your preferences and settings, so you don't have to re-enter them every time you visit.

• Marketing & Social Media Cookies: We may use these to show you relevant content and to track the effectiveness of our marketing campaigns.`,
  },
  {
    title: 'Your Cookie Choices',
    content: `You have full control over cookies. You can:

• Accept all cookies by clicking "Accept" in our cookie banner
• Decline non-essential cookies by clicking "Decline"
• Manage your cookie preferences in your browser settings
• Delete cookies from your device at any time

Please note that declining cookies may affect the functionality of certain features on our website.`,
  },
  {
    title: 'Cookie Duration',
    content: `Different cookies have different lifespans:

• Session Cookies: These cookies expire when you close your browser.
• Persistent Cookies: These cookies remain on your device for a set period (typically 1 year) or until you manually delete them.

You can view and manage the expiration dates of cookies in your browser settings.`,
  },
  {
    title: 'Third-Party Cookies',
    content: `Some content on our website may be provided by third parties, and they may set their own cookies. We do not control these third-party cookies. Please review their privacy policies to understand how they use cookies.`,
  },
  {
    title: 'Changes to This Policy',
    content: `We may update this Cookies Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by updating the "Last Updated" date below.`,
  },
];

export default function CookiesPolicyScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      <ScrollView>
        <MaxWidthContainer>
          {/* Page Title */}
          <View style={[s.titleSection, { paddingHorizontal: isDesktop ? SCREEN_PADDING.desktop : SCREEN_PADDING.mobile }]}>
            <Text style={[s.pageTitle, isDesktop && { fontSize: 56 }]}>COOKIES POLICY</Text>
            <Text style={s.lastUpdated}>Last Updated: June 2026</Text>
          </View>

          {/* Content */}
          <View style={[s.contentSection, { paddingHorizontal: isDesktop ? SCREEN_PADDING.desktop : SCREEN_PADDING.mobile }]}>
            {SECTIONS.map((section, index) => (
              <View key={index} style={s.section}>
                <Text style={s.sectionTitle}>{section.title}</Text>
                <Text style={s.sectionContent}>{section.content}</Text>
              </View>
            ))}

            {/* CTA */}
            <View style={s.ctaSection}>
              <Text style={s.ctaTitle}>Have Questions?</Text>
              <Text style={s.ctaText}>
                If you have any questions about our use of cookies, please contact us at{' '}
                <Text style={s.email}>erlumekw@gmail.com</Text>
              </Text>
            </View>
          </View>

          <View style={{ height: 48 }} />
        </MaxWidthContainer>
      </ScrollView>
    </PageLayout>
  );
}

const s = StyleSheet.create({
  titleSection: {
    paddingTop: 40,
    paddingBottom: 32,
    gap: 8,
  },
  pageTitle: {
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
  contentSection: {
    gap: 32,
    paddingBottom: 32,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontFamily: FONTS.clashMedium,
    fontSize: 18,
    color: COLORS.primary,
    lineHeight: 24,
  },
  sectionContent: {
    fontFamily: FONTS.dmRegular,
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 24,
  },
  ctaSection: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    gap: 12,
    marginTop: 16,
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
