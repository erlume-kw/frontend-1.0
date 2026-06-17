import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import SiteHeader from '../components/layout/SiteHeader';
import PageLayout from '../components/layout/PageLayout';
import SideMenu from '../components/layout/SideMenu';
import MaxWidthContainer from '../components/layout/MaxWidthContainer';
import CriteriaSection from '../components/seller/CriteriaSection';
import LegalCards from '../components/seller/LegalCards';
import { COLORS, FONTS, BREAKPOINT, SCREEN_PADDING } from '../constants/brand';

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
];

export default function SellerPolicyScreen() {
  const { width } = useWindowDimensions();
  const [menuOpen, setMenuOpen] = useState(false);
  const pad = width >= BREAKPOINT ? SCREEN_PADDING.desktop : 16;

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      <ScrollView>
        <MaxWidthContainer>
          {/* Hero */}
          <View style={{ paddingHorizontal: pad, paddingTop: 40, paddingBottom: 32, gap: 12 }}>
            <Text style={[s.heroTitle, width >= BREAKPOINT && { fontSize: 56 }]}>SELLING POLICY</Text>
            <Text style={[s.heroSub, width >= BREAKPOINT && { fontSize: 17 }]}>
              Everything you need to know before listing with erlume.
            </Text>
          </View>

          {/* Selling Criteria section */}
          <CriteriaSection
            title="Selling Criteria"
            subtitle="Items that fail our review are not returned. Please review carefully before submitting."
            items={SELLING_CRITERIA}
          />

          {/* Legal section */}
          <View style={{ paddingVertical: 32 }}>
            <LegalCards title="Legal" cards={LEGAL_CARDS} />
          </View>

          <View style={{ height: 40 }} />
        </MaxWidthContainer>
      </ScrollView>
    </PageLayout>
  );
}

const s = StyleSheet.create({
  heroTitle: { fontFamily: FONTS.clashMedium, fontSize: 36, color: COLORS.primary, lineHeight: 40 },
  heroSub: { fontFamily: FONTS.dmRegular, fontSize: 15, color: COLORS.muted, lineHeight: 24 },
});
