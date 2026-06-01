import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import SiteHeader from '../components/layout/SiteHeader';
import SiteFooter from '../components/layout/SiteFooter';
import SideMenu from '../components/layout/SideMenu';
import { COLORS, FONTS, BREAKPOINT } from '../constants/brand';

const DROP_DESCRIPTION =
  'ac scelerisque ante pulvinar. Donec ut rhoncus ex. Suspendisse ac rhoncus nisl, eu tempor urna. Curabitur vel bibendum lorem. Morbi convallis convallis diam sit amet lacinia. Aliquam in elementum tellus.';

const PLACEHOLDER_PRODUCTS = Array.from({ length: 6 }, (_, i) => ({
  id: String(i + 1),
  name: 'PRODUCT NAME',
  price: 'PRICE',
}));

export default function DropDetailScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;
  const [menuOpen, setMenuOpen] = useState(false);
  const navigation = useNavigation();
  const route = useRoute<any>();
  const dropTitle: string = route.params?.dropTitle ?? 'DROP III';

  const cardW = isDesktop ? 343 : 177;
  const cardH = isDesktop ? 411 : 229;
  const numCols = isDesktop ? 4 : 2;

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <SiteHeader onMenuPress={() => setMenuOpen(true)} />

        {/* Drop header */}
        <View style={s.dropHeader}>
          <Text style={[s.dropTitle, isDesktop && { fontSize: 56 }]}>{dropTitle}</Text>
          <Text style={[s.dropDesc, isDesktop && { fontSize: 24, lineHeight: 32 }]}>
            {DROP_DESCRIPTION}
          </Text>
        </View>

        {/* Product grid */}
        <View style={[s.grid, isDesktop && s.gridDesktop]}>
          {PLACEHOLDER_PRODUCTS.map(p => (
            <TouchableOpacity
              key={p.id}
              style={[s.card, { width: cardW, height: cardH }]}
              activeOpacity={0.85}
              onPress={() => (navigation.navigate as Function)('ProductDetail', { productId: p.id })}
            >
              <View style={s.cardImg} />
              <Text style={[s.cardName, isDesktop && { fontSize: 16 }]}>{p.name}</Text>
              <Text style={[s.cardPrice, isDesktop && { fontSize: 14 }]}>{p.price}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <SiteFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.white },
  dropHeader: { paddingHorizontal: 16, paddingVertical: 32 },
  dropTitle: {
    fontFamily: FONTS.clashMedium,
    fontSize: 50,
    color: COLORS.black,
    lineHeight: 52,
    marginBottom: 12,
  },
  dropDesc: {
    fontFamily: FONTS.clashMedium,
    fontSize: 16,
    color: COLORS.black,
    lineHeight: 22,
    textAlign: 'justify',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
    justifyContent: 'center',
    marginBottom: 16,
  },
  gridDesktop: {
    paddingHorizontal: 32,
    gap: 16,
    rowGap: 32,
  },
  card: { overflow: 'hidden', backgroundColor: COLORS.white },
  cardImg: { flex: 1, backgroundColor: COLORS.placeholder },
  cardName: {
    fontFamily: FONTS.clashRegular,
    fontSize: 16,
    color: COLORS.black,
    textAlign: 'center',
    height: 33,
    textAlignVertical: 'center',
  },
  cardPrice: {
    fontFamily: FONTS.clashRegular,
    fontSize: 12,
    color: COLORS.black,
    textAlign: 'center',
    height: 29,
    textAlignVertical: 'center',
  },
});
