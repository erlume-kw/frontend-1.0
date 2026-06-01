import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  useWindowDimensions,
  ImageStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SiteHeader from '../components/layout/SiteHeader';
import PageLayout from '../components/layout/PageLayout';
import SideMenu from '../components/layout/SideMenu';
import MaxWidthContainer from '../components/layout/MaxWidthContainer';
import { useWishlist } from '../contexts/WishlistContext';
import { COLORS, FONTS, BREAKPOINT } from '../constants/brand';

const RELATED_IMG = 'https://www.figma.com/api/mcp/asset/7413ba79-30a9-4e7a-9c54-18d8647a3678';

export default function WishlistScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;
  const [menuOpen, setMenuOpen] = useState(false);
  const navigation = useNavigation();
  const { items, toggleWishlist } = useWishlist();

  const cardW = isDesktop ? 220 : 177;
  const cardH = isDesktop ? 290 : 229;

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
        <MaxWidthContainer>
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
                <TouchableOpacity
                  key={item.id}
                  style={[s.card, { width: cardW, height: cardH }]}
                  activeOpacity={0.85}
                  onPress={() => (navigation.navigate as Function)('ProductDetail', { productId: item.id })}
                >
                  <View style={s.cardImgWrap}>
                    <Image
                      source={{ uri: item.imageUri ?? RELATED_IMG }}
                      style={s.cardImg as ImageStyle}
                      resizeMode="cover"
                    />
                    {/* Remove from wishlist */}
                    <TouchableOpacity
                      style={s.heartBtn}
                      onPress={() => toggleWishlist(item)}
                      hitSlop={10}
                    >
                      <Text style={s.heartActive}>♥</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={s.cardBrand}>{item.brand}</Text>
                  <Text style={s.cardSub}>{item.sub}</Text>
                  <Text style={s.cardPrice}>{item.price}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </MaxWidthContainer>
    </PageLayout>
  );
}

const s = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 32, paddingBottom: 16, flexDirection: 'row', alignItems: 'baseline', gap: 12 },
  title: { fontFamily: FONTS.clashMedium, fontSize: 28, color: COLORS.black },
  count: { fontFamily: FONTS.dmRegular, fontSize: 14, color: COLORS.muted },

  empty: { padding: 32, alignItems: 'center', gap: 12, minHeight: 300, justifyContent: 'center' },
  emptyTitle: { fontFamily: FONTS.clashMedium, fontSize: 24, color: COLORS.primary, textAlign: 'center' },
  emptyBody: { fontFamily: FONTS.dmRegular, fontSize: 16, color: COLORS.muted, textAlign: 'center' },
  browseBtn: { marginTop: 16, height: 50, paddingHorizontal: 32, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  browseBtnText: { fontFamily: FONTS.dmMedium, fontSize: 14, color: COLORS.white, letterSpacing: 1.4, textTransform: 'uppercase' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8, justifyContent: 'center' },
  gridDesktop: { paddingHorizontal: 32, gap: 16, rowGap: 24 },

  card: { overflow: 'hidden' },
  cardImgWrap: { flex: 1, backgroundColor: COLORS.placeholder },
  cardImg: { width: '100%', height: '100%' },
  heartBtn: { position: 'absolute', top: 8, right: 8, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.85)' },
  heartActive: { fontSize: 16, color: COLORS.secondary },
  cardBrand: { fontFamily: FONTS.clashMedium, fontSize: 14, color: COLORS.black, textTransform: 'uppercase', marginTop: 6, paddingHorizontal: 4 },
  cardSub: { fontFamily: FONTS.clashRegular, fontSize: 12, color: COLORS.olive, textTransform: 'uppercase', paddingHorizontal: 4 },
  cardPrice: { fontFamily: FONTS.clashMedium, fontSize: 14, color: COLORS.secondary, paddingHorizontal: 4, marginBottom: 4 },
});
