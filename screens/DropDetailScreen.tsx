import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import SiteHeader from '../components/layout/SiteHeader';
import PageLayout from '../components/layout/PageLayout';
import SideMenu from '../components/layout/SideMenu';
import MaxWidthContainer from '../components/layout/MaxWidthContainer';
import ProductCard from '../components/ui/ProductCard';
import { COLORS, FONTS, BREAKPOINT, SCREEN_PADDING } from '../constants/brand';
import { fetchDropById, fetchDropItems, type Drop, type Item } from '../services/api';

function useCardWidth(isDesktop: boolean, viewportWidth: number) {
  const numCols = isDesktop ? 4 : 2;
  const gapSize = isDesktop ? 16 : 8;
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
  const dropId: string = route.params?.dropId;
  const dropTitleFallback: string = route.params?.dropTitle ?? 'Drop';

  const [drop, setDrop] = useState<Drop | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dropId) { setLoading(false); return; }
    Promise.all([fetchDropById(dropId), fetchDropItems(dropId)])
      .then(([d, i]) => { setDrop(d); setItems(i); })
      .catch(e => console.error('DropDetailScreen fetch error:', e))
      .finally(() => setLoading(false));
  }, [dropId]);

  const cardWidth = useCardWidth(isDesktop, width);

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      <MaxWidthContainer style={isDesktop ? s.desktopContainer : undefined}>
        <View style={[s.dropHeader, isDesktop && s.dropHeaderDesktop]}>
          <Text style={[s.dropTitle, isDesktop && { fontSize: 56 }]}>
            {drop ? drop.name.toUpperCase() : dropTitleFallback.toUpperCase()}
          </Text>
          {drop?.description ? (
            <Text style={[s.dropDesc, isDesktop && { fontSize: 24, lineHeight: 32 }]}>
              {drop.description}
            </Text>
          ) : null}
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 48 }} />
        ) : (
          <View style={[s.grid, isDesktop && s.gridDesktop]}>
            {items.map(item => (
              <ProductCard
                key={item._id}
                brand={item.brandName}
                name={item.itemName}
                price={`${item.listingPrice} KWD`}
                imageUri={item.imageUrls?.[0]}
                cardWidth={cardWidth}
                onPress={() =>
                  (navigation.navigate as Function)('ProductDetail', { productId: item._id })
                }
              />
            ))}
          </View>
        )}
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
