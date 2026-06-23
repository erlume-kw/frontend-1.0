import React, { useState, useEffect } from 'react';
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
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, BREAKPOINT, SCREEN_PADDING } from '../../constants/brand';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import MaxWidthContainer from './MaxWidthContainer';
import LogoutConfirmModal from '../LogoutConfirmModal';
import { logout as apiLogout, getAccessToken } from '../../services/api';

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
  const isFocused = useIsFocused();
  const { count: wishlistCount } = useWishlist();
  const { count: cartCount } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  React.useEffect(() => {
    // Only check auth when screen is focused, don't use polling
    console.log('[SiteHeader] useEffect - isFocused:', isFocused);
    if (isFocused) {
      console.log('[SiteHeader] Screen focused, checking auth...');
      checkAuthStatus();
    }
  }, [isFocused]);

  const checkAuthStatus = async () => {
    try {
      const token = await getAccessToken();
      const hasToken = !!token && token.length > 0;
      console.log('[SiteHeader] Auth check - Token exists:', hasToken, 'Setting isLoggedIn to:', hasToken);
      setIsLoggedIn(hasToken);
    } catch (error) {
      console.log('[SiteHeader] Auth check error:', error);
      setIsLoggedIn(false);
    }
  };

  const handleShowLogoutConfirm = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    try {
      await apiLogout();
      setIsLoggedIn(false);
      setShowLogoutConfirm(false);
      setLoggingOut(false);
      navigation.navigate('Home' as never);
    } catch (error) {
      console.error('Logout error:', error);
      setLoggingOut(false);
      setIsLoggedIn(false);
    }
  };

  const go = (screen: string) => navigation.navigate(screen as never);

  if (isDesktop) {
    return (
      <View style={s.desktopOuter}>
        <MaxWidthContainer>
          <View style={s.desktop}>
            {/* Left: Logo */}
            <TouchableOpacity onPress={() => go('Home')} accessibilityRole="link" style={s.logoArea}>
              <ErlumeLogo height={32} />
            </TouchableOpacity>

            {/* Center: Navigation */}
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

            {/* Right: Wishlist, Cart, Login/Logout */}
            <View style={s.desktopRight}>
              <TouchableOpacity onPress={() => go('Wishlist')}>
                <Text style={s.desktopLink}>
                  wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => go('Cart')}>
                <Text style={s.desktopLink}>cart ({cartCount})</Text>
              </TouchableOpacity>
              {isLoggedIn ? (
                <TouchableOpacity onPress={handleShowLogoutConfirm}>
                  <Text style={s.desktopLink}>logout</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => go('SignInRegister')}>
                  <Text style={s.desktopLink}>sign in</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </MaxWidthContainer>
        <LogoutConfirmModal
          visible={showLogoutConfirm}
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={handleConfirmLogout}
          isLoading={loggingOut}
        />
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
      <LogoutConfirmModal
        visible={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
        isLoading={loggingOut}
      />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_PADDING.desktop,
    gap: 40,
  },
  logoArea: {
    width: 180,
    alignItems: 'flex-start',
  },
  desktopNavCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopNav: { flexDirection: 'row', alignItems: 'center', gap: 48 },
  desktopRight: { flexDirection: 'row', alignItems: 'center', gap: 32, width: 280, justifyContent: 'flex-end' },
  desktopLink: { fontFamily: FONTS.clashRegular, fontSize: 16, color: COLORS.olive },
});
