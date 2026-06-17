import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, BREAKPOINT, SCREEN_PADDING } from '../../constants/brand';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import MaxWidthContainer from './MaxWidthContainer';

const ERLUME_LOGO = require('../../assets/images/erlume-logo-green.png');
const LOGO_ASPECT = 300 / 65;

interface SiteHeaderProps {
  onMenuPress?: () => void;
  cartCount?: number;
}

function ErlumeLogo({ height }: { height: number }) {
  return (
    <Image
      source={ERLUME_LOGO}
      style={{ height, width: height * LOGO_ASPECT }}
      resizeMode="contain"
      accessibilityLabel="erlume"
    />
  );
}

export default function SiteHeader({ onMenuPress, cartCount: cartCountProp = 0 }: SiteHeaderProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;
  const navigation = useNavigation();
  const { count: wishlistCount } = useWishlist();
  const { count: cartCount } = useCart();

  const go = (screen: string) => navigation.navigate(screen as never);

  if (isDesktop) {
    return (
      <View style={s.desktopOuter}>
        <MaxWidthContainer>
          <View style={s.desktop}>
            <View style={s.desktopSides}>
              <TouchableOpacity onPress={() => go('Home')} accessibilityRole="link">
                <ErlumeLogo height={36} />
              </TouchableOpacity>

              <View style={s.desktopRight}>
                <TouchableOpacity onPress={() => go('Wishlist')}>
                  <Text style={s.desktopLink}>
                    wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => go('Cart')}>
                  <Text style={s.desktopLink}>cart ({cartCount})</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={s.desktopNavCenter} pointerEvents="box-none">
              <View style={s.desktopNav} pointerEvents="auto">
                <TouchableOpacity onPress={() => go('Home')}>
                  <Text style={s.desktopLink}>new</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => go('AllDrops')}>
                  <Text style={s.desktopLink}>drops</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => go('Sell')}>
                  <Text style={s.desktopLink}>sell</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </MaxWidthContainer>
      </View>
    );
  }

  return (
    <View style={s.mobile}>
      <TouchableOpacity onPress={onMenuPress} hitSlop={12} style={s.hamburger}>
        <View style={s.line} />
        <View style={[s.line, { width: 18 }]} />
        <View style={s.line} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => go('Home')} style={s.mobileLogoWrap}>
        <ErlumeLogo height={28} />
      </TouchableOpacity>

      <View style={s.mobileRight}>
        <TouchableOpacity onPress={() => go('Wishlist')} hitSlop={12}>
          <View>
            <Text style={s.mobileIcon}>♡</Text>
            {wishlistCount > 0 && (
              <View style={s.badge}>
                <Text style={s.badgeText}>{wishlistCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => go('Cart')}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
        >
          <Feather name="shopping-bag" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  // Mobile
  mobile: {
    height: 76,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  hamburger: { width: 30, gap: 5, justifyContent: 'center' },
  line: { height: 2, width: 24, backgroundColor: COLORS.primary },
  mobileLogoWrap: { flex: 1, alignItems: 'center' },
  mobileRight: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  mobileIcon: { fontSize: 22, color: COLORS.primary },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { fontFamily: FONTS.dmMedium, fontSize: 9, color: COLORS.white, lineHeight: 12 },

  // Desktop — logo left, nav centered, utilities right
  desktopOuter: { backgroundColor: COLORS.white, height: 98 },
  desktop: {
    width: '100%',
    height: 98,
    position: 'relative',
    paddingHorizontal: SCREEN_PADDING.desktop,
  },
  desktopSides: {
    height: 98,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  desktopNavCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopNav: { flexDirection: 'row', alignItems: 'center', gap: 75 },
  desktopRight: { flexDirection: 'row', alignItems: 'center', gap: 75 },
  desktopLink: { fontFamily: FONTS.clashRegular, fontSize: 24, color: COLORS.olive },
});
