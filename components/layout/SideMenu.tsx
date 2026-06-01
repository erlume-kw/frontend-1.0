import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS } from '../../constants/brand';

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  cartCount?: number;
}

const NAV_LINKS = [
  { label: 'new', screen: 'Home' },
  { label: 'shop', screen: 'AllDrops' },
  { label: 'sell', screen: 'Sell' },
  { label: 'wishlist', screen: null },
];

export default function SideMenu({ visible, onClose, cartCount = 0 }: SideMenuProps) {
  const navigation = useNavigation();

  const handleNav = (screen: string | null) => {
    onClose();
    if (screen) navigation.navigate(screen as never);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={s.panel} onPress={e => e.stopPropagation()}>
          {/* Close button */}
          <TouchableOpacity style={s.closeBtn} onPress={onClose} hitSlop={12}>
            <Text style={s.closeText}>✕</Text>
          </TouchableOpacity>

          {/* Nav links */}
          <View style={s.links}>
            {NAV_LINKS.map(({ label, screen }) => (
              <TouchableOpacity key={label} onPress={() => handleNav(screen)}>
                <Text style={s.link}>{label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => handleNav('Cart')}>
              <Text style={s.link}>cart ({cartCount})</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  panel: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingTop: 26,
    paddingBottom: 40,
    overflow: 'hidden',
  },
  closeBtn: {
    position: 'absolute',
    top: 26,
    left: 23,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontFamily: FONTS.clashRegular,
    fontSize: 20,
    color: COLORS.white,
  },
  links: {
    alignItems: 'center',
    gap: 34,
    paddingTop: 75,
  },
  link: {
    fontFamily: FONTS.clashMedium,
    fontSize: 20,
    color: COLORS.white,
    lineHeight: 25,
  },
});
