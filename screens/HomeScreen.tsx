import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  useWindowDimensions,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SiteHeader from '../components/layout/SiteHeader';
import PageLayout from '../components/layout/PageLayout';
import SideMenu from '../components/layout/SideMenu';
import MaxWidthContainer from '../components/layout/MaxWidthContainer';
import { COLORS, FONTS, BREAKPOINT } from '../constants/brand';

// Update DROP_DATE to the actual next drop date/time (UTC)
const DROP_DATE = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000 + 1 * 60 * 1000);

const SPOTLIGHT_IMG = 'https://www.figma.com/api/mcp/asset/d6f1e861-670e-4cf8-8261-c4a81f9a9892';

const PLACEHOLDER_PRODUCTS = [
  { id: '1', name: 'PRODUCT NAME', price: 'PRICE' },
  { id: '2', name: 'PRODUCT NAME', price: 'PRICE' },
  { id: '3', name: 'PRODUCT NAME', price: 'PRICE' },
  { id: '4', name: 'PRODUCT NAME', price: 'PRICE' },
  { id: '5', name: 'PRODUCT NAME', price: 'PRICE' },
  { id: '6', name: 'PRODUCT NAME', price: 'PRICE' },
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

  return (
    <View style={[s.hero, { height: heroHeight }]}>
      <Text style={[s.nextDropLabel, { fontSize: labelSize }]}>NEXT DROP IN</Text>
      {[{ num: pad(days), label: ' DAYS' }, { num: pad(hours), label: ' HOURS' }, { num: pad(minutes), label: ' MINS' }].map(
        ({ num, label }) => (
          <View key={label} style={s.countdownRow}>
            <Text style={[s.countdownNum, { fontSize: numSize, lineHeight }]}>{num}</Text>
            <Text style={[s.countdownLbl, { fontSize: numSize, lineHeight }]}>{label}</Text>
          </View>
        )
      )}
    </View>
  );
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;
  const [menuOpen, setMenuOpen] = useState(false);
  const navigation = useNavigation();

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
        <CountdownHero isDesktop={isDesktop} />

        <View style={s.shopPrevWrap}>
          <TouchableOpacity onPress={() => navigation.navigate('AllDrops' as never)}>
            <Text style={[s.shopPrevLink, isDesktop && { fontSize: 32 }]}>
              SHOP PREVIOUS DROPS HERE
            </Text>
          </TouchableOpacity>
        </View>

        {!isDesktop && (
          <>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Our Latest Drop</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AllDrops' as never)}>
                <Text style={s.shopAllLink}>Shop all</Text>
              </TouchableOpacity>
            </View>
            <View style={s.productGrid}>
              {PLACEHOLDER_PRODUCTS.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={s.productCard}
                  activeOpacity={0.85}
                  onPress={() => (navigation.navigate as Function)('ProductDetail', { productId: p.id })}
                >
                  <View style={s.productImg} />
                  <Text style={s.productName}>{p.name}</Text>
                  <Text style={s.productPrice}>{p.price}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={s.spotlight}>
              <Image source={{ uri: SPOTLIGHT_IMG }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
              <View style={s.spotlightOverlay}>
                <Text style={s.spotlightTitle}>Spotlight: The Burgundy Birkin</Text>
                <Text style={s.spotlightSub}>
                  Introduced in 1984 for Jane Birkin; now a symbol of luxury and craftsmanship.
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    (navigation.navigate as Function)('ProductDetail', { productId: '1' })
                  }
                >
                  <Text style={s.spotlightCta}>Shop Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
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
  nextDropLabel: { fontFamily: FONTS.clashMedium, color: COLORS.black, textAlign: 'center', marginBottom: -8 },
  countdownRow: { flexDirection: 'row', alignItems: 'baseline' },
  countdownNum: { fontFamily: FONTS.clashSemibold, color: COLORS.black, textAlign: 'center' },
  countdownLbl: { fontFamily: FONTS.clashMedium, color: COLORS.black },
  shopPrevWrap: { paddingVertical: 20, alignItems: 'center', backgroundColor: COLORS.white },
  shopPrevLink: { fontFamily: FONTS.clashMedium, fontSize: 16, color: COLORS.olive, textDecorationLine: 'underline', textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 28, paddingBottom: 12 },
  sectionTitle: { fontFamily: FONTS.clashMedium, fontSize: 24, color: COLORS.olive },
  shopAllLink: { fontFamily: FONTS.clashMedium, fontSize: 16, color: COLORS.secondary },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8, justifyContent: 'center' },
  productCard: { width: 177, height: 229, backgroundColor: COLORS.white, overflow: 'hidden' },
  productImg: { flex: 1, backgroundColor: COLORS.placeholder },
  productName: { fontFamily: FONTS.clashRegular, fontSize: 16, color: COLORS.black, textAlign: 'center', height: 33, textAlignVertical: 'center' },
  productPrice: { fontFamily: FONTS.clashRegular, fontSize: 12, color: COLORS.black, textAlign: 'center', height: 29, textAlignVertical: 'center' },
  spotlight: { width: '100%', height: 437, backgroundColor: '#FBF1DF', marginTop: 16, overflow: 'hidden' },
  spotlightOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', padding: 32, justifyContent: 'flex-end', alignItems: 'flex-end' },
  spotlightTitle: { fontFamily: FONTS.clashMedium, fontSize: 20, color: COLORS.white, textAlign: 'right', marginBottom: 8 },
  spotlightSub: { fontFamily: FONTS.clashLight, fontSize: 16, color: COLORS.white, textAlign: 'right', marginBottom: 8 },
  spotlightCta: { fontFamily: FONTS.clashRegular, fontSize: 20, color: COLORS.white, textDecorationLine: 'underline', textAlign: 'right' },
});
