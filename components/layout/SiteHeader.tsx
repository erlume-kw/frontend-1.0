import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, BREAKPOINT } from '../../constants/brand';

interface SiteHeaderProps {
  onMenuPress?: () => void;
  cartCount?: number;
}

export default function SiteHeader({ onMenuPress, cartCount = 0 }: SiteHeaderProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;
  const navigation = useNavigation();

  const go = (screen: string) => navigation.navigate(screen as never);

  if (isDesktop) {
    return (
      <View style={s.desktop}>
        <TouchableOpacity onPress={() => go('Home')}>
          <Text style={s.wordmark}>erlume</Text>
        </TouchableOpacity>

        <View style={s.desktopCenter}>
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

        <View style={s.desktopRight}>
          <TouchableOpacity>
            <Text style={s.desktopLink}>wishlist</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => go('Cart')}>
            <Text style={s.desktopLink}>cart ({cartCount})</Text>
          </TouchableOpacity>
        </View>
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

      <TouchableOpacity onPress={() => go('Home')}>
        <Text style={s.wordmark}>erlume</Text>
      </TouchableOpacity>

      <View style={s.mobileRight}>
        <TouchableOpacity hitSlop={12}>
          <Text style={s.mobileIcon}>♡</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => go('Cart')} hitSlop={12}>
          <Text style={s.mobileIcon}>⊕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  mobile: {
    height: 76,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  hamburger: {
    width: 30,
    gap: 5,
    justifyContent: 'center',
  },
  line: {
    height: 2,
    width: 24,
    backgroundColor: COLORS.primary,
  },
  mobileRight: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  mobileIcon: {
    fontSize: 22,
    color: COLORS.primary,
  },
  desktop: {
    height: 98,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
  },
  desktopCenter: {
    flexDirection: 'row',
    gap: 75,
    alignItems: 'center',
  },
  desktopRight: {
    flexDirection: 'row',
    gap: 75,
    alignItems: 'center',
  },
  desktopLink: {
    fontFamily: FONTS.clashRegular,
    fontSize: 24,
    color: COLORS.olive,
  },
  wordmark: {
    fontFamily: FONTS.sarina,
    fontSize: 28,
    color: COLORS.primary,
  },
});
