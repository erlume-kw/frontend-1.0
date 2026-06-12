import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SiteHeader from '../components/layout/SiteHeader';
import PageLayout from '../components/layout/PageLayout';
import SideMenu from '../components/layout/SideMenu';
import MaxWidthContainer from '../components/layout/MaxWidthContainer';
import ProductCard from '../components/ui/ProductCard';
import { COLORS, FONTS, BREAKPOINT, SCREEN_PADDING } from '../constants/brand';

// Update to real drop date/time (UTC)
const DROP_DATE = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000 + 1 * 60 * 1000);

const SPOTLIGHT_IMG = 'https://www.figma.com/api/mcp/asset/d6f1e861-670e-4cf8-8261-c4a81f9a9892';

const PLACEHOLDER_PRODUCTS = [
  { id: '1', brand: 'JWPEI', name: 'TOP-HANDLE BAG', price: '15 KWD' },
  { id: '2', brand: 'JWPEI', name: 'TOP-HANDLE BAG', price: '15 KWD' },
  { id: '3', brand: 'JWPEI', name: 'TOP-HANDLE BAG', price: '15 KWD' },
  { id: '4', brand: 'JWPEI', name: 'TOP-HANDLE BAG', price: '15 KWD' },
  { id: '5', brand: 'JWPEI', name: 'TOP-HANDLE BAG', price: '15 KWD' },
  { id: '6', brand: 'JWPEI', name: 'TOP-HANDLE BAG', price: '15 KWD' },
];

function getTimeRemaining(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
  };
}

function useCountdown(target: Date) {
  const [remaining, setRemaining] = useState(() => getTimeRemaining(target));
  useEffect(() => {
    const id = setInterval(() => setRemaining(getTimeRemaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);
  return remaining;
}

function CountdownHero({ isDesktop }: { isDesktop: boolean }) {
  const { days, hours, minutes } = useCountdown(DROP_DATE);
  const pad = (n: number) => String(n).padStart(2, '0');
  const labelSize = isDesktop ? 60 : 20;
  const numSize = isDesktop ? 150 : 60;
  const lineHeight = isDesktop ? 120 : 56;
  const heroHeight = isDesktop ? 895 : 348;
  // Spacing between "NEXT DROP IN" label and the first countdown row
  const labelSpacing = isDesktop ? 40 : 16;

  return (
    <View style={[s.hero, { height: heroHeight }]}>
      <Text style={[s.nextDropLabel, { fontSize: labelSize, marginBottom: labelSpacing }]}>
        NEXT DROP IN
      </Text>
      {[
        { num: pad(days), label: ' DAYS' },
        { num: pad(hours), label: ' HOURS' },
        { num: pad(minutes), label: ' MINS' },
      ].map(({ num, label }) => (
        <View key={label} style={s.countdownRow}>
          <Text style={[s.countdownNum, { fontSize: numSize, lineHeight }]}>{num}</Text>
          <Text style={[s.countdownLbl, { fontSize: numSize, lineHeight }]}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;
  const [menuOpen, setMenuOpen] = useState(false);
  const navigation = useNavigation();

  const numCols = isDesktop ? 4 : 2;
  const gapSize = isDesktop ? 16 : 8;
  const contentWidth = isDesktop
    ? Math.min(width, 1280) - SCREEN_PADDING.desktop * 2
    : width - SCREEN_PADDING.mobile * 2;
  const cardW = Math.floor((contentWidth - gapSize * (numCols - 1)) / numCols);

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      {/* Countdown banner */}
      <CountdownHero isDesktop={isDesktop} />

      {/* Shop previous drops link */}
      <View style={s.shopPrevWrap}>
        <MaxWidthContainer>
          <TouchableOpacity onPress={() => navigation.navigate('AllDrops' as never)}>
            <Text style={[s.shopPrevLink, isDesktop && { fontSize: 32 }]}>
              SHOP PREVIOUS DROPS HERE
            </Text>
          </TouchableOpacity>
        </MaxWidthContainer>
      </View>

      {/* Our Latest Drop — shown on both mobile and desktop */}
      <MaxWidthContainer style={isDesktop ? [s.latestSection, s.latestSectionDesktop] : s.latestSection}>
        {/* Section header — same horizontal padding as the card row */}
        <View style={s.sectionHeader}>
          <Text style={[s.sectionTitle, isDesktop && { fontSize: 32 }]}>Our Latest Drop</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AllDrops' as never)}>
            <Text style={[s.shopAllLink, isDesktop && { fontSize: 24 }]}>Shop all</Text>
          </TouchableOpacity>
        </View>

        {isDesktop ? (
          // Desktop: horizontal scrolling row of fixed-width cards
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.desktopRow}
          >
            {PLACEHOLDER_PRODUCTS.map(p => (
              <ProductCard
                key={p.id}
                brand={p.brand}
                name={p.name}
                price={p.price}
                onPress={() =>
                  (navigation.navigate as Function)('ProductDetail', { productId: p.id })
                }
              />
            ))}
          </ScrollView>
        ) : (
          // Mobile: 2-column wrapping grid
          <View style={s.mobileGrid}>
            {PLACEHOLDER_PRODUCTS.map(p => (
              <ProductCard
                key={p.id}
                brand={p.brand}
                name={p.name}
                price={p.price}
                cardWidth={cardW}
                onPress={() =>
                  (navigation.navigate as Function)('ProductDetail', { productId: p.id })
                }
              />
            ))}
          </View>
        )}
      </MaxWidthContainer>

      {/* Spotlight feature */}
      <View style={[s.spotlight, isDesktop && { height: 634 }]}>
        <Image
          source={{ uri: SPOTLIGHT_IMG }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
        <View style={s.spotlightOverlay}>
          <Text style={[s.spotlightTitle, isDesktop && { fontSize: 32 }]}>
            Spotlight: The Burgundy Birkin
          </Text>
          <Text style={[s.spotlightSub, isDesktop && { fontSize: 24 }]}>
            Introduced in 1984 for Jane Birkin; now a symbol of luxury and craftsmanship.
          </Text>
          <TouchableOpacity
            onPress={() =>
              (navigation.navigate as Function)('ProductDetail', { productId: '1' })
            }
          >
            <Text style={[s.spotlightCta, isDesktop && { fontSize: 24 }]}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </PageLayout>
  );
}

const s = StyleSheet.create({
  hero: {
    backgroundColor: 'rgba(56,69,45,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  nextDropLabel: {
    fontFamily: FONTS.clashMedium,
    color: COLORS.black,
    textAlign: 'center',
  },
  countdownRow: { flexDirection: 'row', alignItems: 'baseline' },
  countdownNum: { fontFamily: FONTS.clashSemibold, color: COLORS.black },
  countdownLbl: { fontFamily: FONTS.clashMedium, color: COLORS.black },

  shopPrevWrap: {
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  shopPrevLink: {
    fontFamily: FONTS.clashMedium,
    fontSize: 16,
    color: COLORS.olive,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },

  latestSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: COLORS.white,
  },
  latestSectionDesktop: {
    paddingHorizontal: SCREEN_PADDING.desktop,
    paddingTop: 24,
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: FONTS.clashMedium,
    fontSize: 24,
    color: COLORS.olive,
  },
  shopAllLink: {
    fontFamily: FONTS.clashMedium,
    fontSize: 16,
    color: COLORS.secondary,
  },
  desktopRow: {
    gap: 16,
    paddingBottom: 4,
  },
  mobileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
  },

  spotlight: {
    width: '100%',
    height: 437,
    backgroundColor: '#FBF1DF',
    overflow: 'hidden',
  },
  spotlightOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 32,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  spotlightTitle: {
    fontFamily: FONTS.clashMedium,
    fontSize: 20,
    color: COLORS.white,
    textAlign: 'right',
    marginBottom: 8,
  },
  spotlightSub: {
    fontFamily: FONTS.clashLight,
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'right',
    marginBottom: 8,
  },
  spotlightCta: {
    fontFamily: FONTS.clashRegular,
    fontSize: 20,
    color: COLORS.white,
    textDecorationLine: 'underline',
    textAlign: 'right',
  },
});
