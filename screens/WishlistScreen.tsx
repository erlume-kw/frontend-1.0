import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SiteHeader from '../components/layout/SiteHeader';
import PageLayout from '../components/layout/PageLayout';
import SideMenu from '../components/layout/SideMenu';
import MaxWidthContainer from '../components/layout/MaxWidthContainer';
import ProductCard from '../components/ui/ProductCard';
import { useWishlist } from '../contexts/WishlistContext';
import { COLORS, FONTS, BREAKPOINT, SCREEN_PADDING } from '../constants/brand';

const RELATED_IMG = 'https://www.figma.com/api/mcp/asset/7413ba79-30a9-4e7a-9c54-18d8647a3678';

export default function WishlistScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;
  const [menuOpen, setMenuOpen] = useState(false);
  const navigation = useNavigation();
  const { items, toggleWishlist } = useWishlist();

  // Row-filling card widths (same formula as DropDetailScreen)
  const numCols = isDesktop ? 4 : 2;
  const gapSize = isDesktop ? 16 : 8;
  const contentWidth = isDesktop
    ? Math.min(width, 1280) - SCREEN_PADDING.desktop * 2
    : width - 12 * 2; // grid paddingHorizontal: 12 on mobile
  const cardW = Math.floor((contentWidth - gapSize * (numCols - 1)) / numCols);

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
        <MaxWidthContainer style={isDesktop ? s.desktopPad : undefined}>
          <View style={s.header}>
            <Text style={[s.title, isDesktop && { fontSize: 40 }]}>WISHLIST</Text>
            {items.length > 0 && (
              <Text style={s.count}>{items.length} {items.length === 1 ? 'item' : 'items'}</Text>
            )}
          </View>

          {items.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyTitle}>Your wishlist is empty</Text>
              <Text style={s.emptyBody}>Save items you love and come back to them later.</Text>
              <TouchableOpacity
                style={s.browseBtn}
                onPress={() => navigation.navigate('AllDrops' as never)}
              >
                <Text style={s.browseBtnText}>BROWSE DROPS</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[s.grid, isDesktop && s.gridDesktop]}>
              {items.map(item => (
                <ProductCard
                  key={item.id}
                  brand={item.brand}
                  name={item.sub}
                  price={item.price}
                  imageUri={item.imageUri ?? RELATED_IMG}
                  cardWidth={cardW}
                  isWishlisted
                  onPress={() => (navigation.navigate as Function)('ProductDetail', { productId: item.id })}
                  onWishlistPress={() => toggleWishlist(item)}
                />
              ))}
            </View>
          )}
        </MaxWidthContainer>
    </PageLayout>
  );
}

const s = StyleSheet.create({
  desktopPad: { paddingHorizontal: SCREEN_PADDING.desktop },
  header: { paddingHorizontal: 16, paddingTop: 32, paddingBottom: 16, flexDirection: 'row', alignItems: 'baseline', gap: 12 },
  title: { fontFamily: FONTS.clashMedium, fontSize: 28, color: COLORS.black },
  count: { fontFamily: FONTS.dmRegular, fontSize: 14, color: COLORS.muted },

  empty: { padding: 32, alignItems: 'center', gap: 12, minHeight: 300, justifyContent: 'center' },
  emptyTitle: { fontFamily: FONTS.clashMedium, fontSize: 24, color: COLORS.primary, textAlign: 'center' },
  emptyBody: { fontFamily: FONTS.dmRegular, fontSize: 16, color: COLORS.muted, textAlign: 'center' },
  browseBtn: { marginTop: 16, height: 50, paddingHorizontal: 32, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  browseBtnText: { fontFamily: FONTS.dmMedium, fontSize: 14, color: COLORS.white, letterSpacing: 1.4, textTransform: 'uppercase' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, paddingVertical: 12, gap: 8, justifyContent: 'flex-start' },
  gridDesktop: { paddingHorizontal: 0, gap: 16, rowGap: 24, justifyContent: 'flex-start' },
});
