import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS } from '../../constants/brand';
import LogoutConfirmModal from '../LogoutConfirmModal';
import { getAccessToken } from '../../services/api';

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  cartCount?: number;
}

const NAV_LINKS = [
  { label: 'new', screen: 'Home' },
  { label: 'drops', screen: 'AllDrops' },
  { label: 'sell', screen: 'Sell' },
  { label: 'wishlist', screen: 'Wishlist' },
];

export default function SideMenu({ visible, onClose, cartCount = 0 }: SideMenuProps) {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (visible) {
      checkAuthStatus();
    }
  }, [visible, isFocused]);

  const checkAuthStatus = async () => {
    try {
      const token = await getAccessToken();
      setIsLoggedIn(!!token && token.length > 0);
    } catch {
      setIsLoggedIn(false);
    }
  };

  const handleNav = (screen: string) => {
    onClose();
    navigation.navigate(screen as never);
  };

  const handleShowLogoutConfirm = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    try {
      await AsyncStorage.removeItem('erlume_access_token');
      await AsyncStorage.removeItem('erlume_refresh_token');
      setIsLoggedIn(false);
      setShowLogoutConfirm(false);
      onClose();
      navigation.navigate('Home' as never);
    } catch (error) {
      console.error('Logout error:', error);
      setLoggingOut(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={s.root}>
        <Pressable style={s.backdrop} onPress={onClose} accessibilityLabel="Close menu" />

        <View style={s.panel}>
          <TouchableOpacity
            style={s.closeBtn}
            onPress={onClose}
            hitSlop={16}
            activeOpacity={0.6}
            delayPressIn={0}
            accessibilityRole="button"
            accessibilityLabel="Close menu"
          >
            <Ionicons name="close" size={28} color={COLORS.white} />
          </TouchableOpacity>

          <View style={s.links}>
            {NAV_LINKS.map(({ label, screen }) => (
              <TouchableOpacity
                key={label}
                onPress={() => handleNav(screen)}
                activeOpacity={0.7}
                delayPressIn={0}
              >
                <Text style={s.link}>{label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => handleNav('Cart')}
              activeOpacity={0.7}
              delayPressIn={0}
            >
              <Text style={s.link}>cart ({cartCount})</Text>
            </TouchableOpacity>
          </View>

          {isLoggedIn ? (
            <TouchableOpacity
              style={s.logoutBtn}
              onPress={handleShowLogoutConfirm}
              activeOpacity={0.7}
              delayPressIn={0}
            >
              <Text style={s.logoutText}>log out</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={s.signInBtn}
              onPress={() => handleNav('SignInRegister')}
              activeOpacity={0.7}
              delayPressIn={0}
            >
              <Text style={s.signInText}>sign in</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <LogoutConfirmModal
        visible={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
        isLoading={loggingOut}
      />
    </Modal>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  panel: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingTop: 26,
    paddingBottom: 40,
    zIndex: 1,
  },
  closeBtn: {
    alignSelf: 'flex-start',
    marginLeft: 15,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  links: {
    alignItems: 'center',
    gap: 34,
    paddingTop: 40,
  },
  link: {
    fontFamily: FONTS.clashMedium,
    fontSize: 20,
    color: COLORS.white,
    lineHeight: 25,
  },
  logoutBtn: {
    marginTop: 48,
    alignSelf: 'center',
  },
  logoutText: {
    fontFamily: FONTS.clashMedium,
    fontSize: 16,
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  signInBtn: {
    marginTop: 48,
    alignSelf: 'center',
  },
  signInText: {
    fontFamily: FONTS.clashMedium,
    fontSize: 16,
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
