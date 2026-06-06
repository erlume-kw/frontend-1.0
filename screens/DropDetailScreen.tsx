import React, { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import SiteHeader from '../components/layout/SiteHeader';
import PageLayout from '../components/layout/PageLayout';
import SideMenu from '../components/layout/SideMenu';
import ProductCard from '../components/ui/ProductCard';
import { COLORS, FONTS, BREAKPOINT } from '../constants/brand';

const DROP_DESCRIPTION =
  'ac scelerisque ante pulvinar. Donec ut rhoncus ex. Suspendisse ac rhoncus nisl, eu tempor urna. Curabitur vel bibendum lorem. Morbi convallis convallis diam sit amet lacinia. Aliquam in elementum tellus.';

const PLACEHOLDER_PRODUCTS = Array.from({ length: 6 }, (_, i) => ({
  id: String(i + 1),
  brand: 'JWPEI',
  name: 'TOP-HANDLE BAG',
  price: '15 KWD',
}));

export default function DropDetailScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;
  const [menuOpen, setMenuOpen] = useState(false);
  const navigation = useNavigation();
  const route = useRoute<any>();
  const dropTitle: string = route.params?.dropTitle ?? 'DROP III';

  // Desktop: 4-col grid with 255px cards. Mobile: 2-col grid with 160px cards.
  const cardWidth = isDesktop ? 255 : 160;

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
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
          <ProductCard
            key={p.id}
            brand={p.brand}
            name={p.name}
            price={p.price}
            cardWidth={cardWidth}
            onPress={() =>
              (navigation.navigate as Function)('ProductDetail', { productId: p.id })
            }
          />
        ))}
      </View>
    </PageLayout>
  );
}

const s = StyleSheet.create({
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
});
