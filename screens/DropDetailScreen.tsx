import React, { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import SiteHeader from '../components/layout/SiteHeader';
import PageLayout from '../components/layout/PageLayout';
import SideMenu from '../components/layout/SideMenu';
import MaxWidthContainer from '../components/layout/MaxWidthContainer';
import ProductCard from '../components/ui/ProductCard';
import { COLORS, FONTS, BREAKPOINT, SCREEN_PADDING } from '../constants/brand';

const DROP_DESCRIPTION =
  'ac scelerisque ante pulvinar. Donec ut rhoncus ex. Suspendisse ac rhoncus nisl, eu tempor urna. Curabitur vel bibendum lorem. Morbi convallis convallis diam sit amet lacinia. Aliquam in elementum tellus.';

const PLACEHOLDER_PRODUCTS = Array.from({ length: 6 }, (_, i) => ({
  id: String(i + 1),
  brand: 'JWPEI',
  name: 'TOP-HANDLE BAG',
  price: '15 KWD',
}));

/** Returns a card width so N cards + gaps fill the available row exactly. */
function useCardWidth(isDesktop: boolean, viewportWidth: number) {
  const numCols = isDesktop ? 4 : 2;
  const gapSize = isDesktop ? 16 : 8;
  // Desktop: inside MaxWidthContainer (max 1280) with SCREEN_PADDING.desktop on each side
  // Mobile:  grid itself has 12px horizontal padding on each side
  const contentWidth = isDesktop
    ? Math.min(viewportWidth, 1280) - SCREEN_PADDING.desktop * 2
    : viewportWidth - SCREEN_PADDING.mobile * 2;
  return Math.floor((contentWidth - gapSize * (numCols - 1)) / numCols);
}

export default function DropDetailScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;
  const [menuOpen, setMenuOpen] = useState(false);
  const navigation = useNavigation();
  const route = useRoute<any>();
  const dropTitle: string = route.params?.dropTitle ?? 'DROP III';

  const cardWidth = useCardWidth(isDesktop, width);

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      <MaxWidthContainer style={isDesktop ? s.desktopContainer : undefined}>
        {/* Drop header */}
        <View style={[s.dropHeader, isDesktop && s.dropHeaderDesktop]}>
          <Text style={[s.dropTitle, isDesktop && { fontSize: 56 }]}>{dropTitle}</Text>
          <Text style={[s.dropDesc, isDesktop && { fontSize: 24, lineHeight: 32 }]}>
            {DROP_DESCRIPTION}
          </Text>
        </View>

        {/* Product grid — row-filling, left-aligned */}
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
      </MaxWidthContainer>
    </PageLayout>
  );
}

const s = StyleSheet.create({
  desktopContainer: {
    paddingHorizontal: SCREEN_PADDING.desktop,
  },

  dropHeader: { paddingHorizontal: 16, paddingVertical: 32 },
  dropHeaderDesktop: { paddingHorizontal: 0, paddingTop: 48, paddingBottom: 32 },
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

  // Mobile: 2-col left-aligned grid with 12px horizontal padding and 8px gap
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
    justifyContent: 'flex-start',
  },
  // Desktop: 4-col left-aligned grid, no padding (MaxWidthContainer handles it)
  gridDesktop: {
    paddingHorizontal: 0,
    gap: 16,
    rowGap: 32,
    justifyContent: 'flex-start',
  },
});
