import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { COLORS, FONTS, BREAKPOINT, SCREEN_PADDING } from '../../constants/brand';

interface SellerBannerProps {
  items: { label: string; desc: string }[];
}

export default function SellerBanner({ items }: SellerBannerProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;

  return (
    <View style={[s.wrap, isDesktop && s.wrapDesktop]}>
      <View style={[s.grid, isDesktop && s.gridDesktop]}>
        {items.map((item, i) => (
          <View key={i} style={[s.item, isDesktop && s.itemDesktop]}>
            <Text style={[s.num, isDesktop && { fontSize: 28 }]}>{String(i + 1).padStart(2, '0')}</Text>
            <Text style={[s.label, isDesktop && { fontSize: 18 }]}>{item.label}</Text>
            <Text style={[s.desc, isDesktop && { fontSize: 15 }]}>{item.desc}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { backgroundColor: COLORS.offWhite, paddingHorizontal: 16, paddingVertical: 32 },
  wrapDesktop: { paddingHorizontal: SCREEN_PADDING.desktop, paddingVertical: 48 },
  grid: { gap: 20 },
  gridDesktop: { flexDirection: 'row', gap: 32 },
  item: { gap: 8 },
  itemDesktop: { flex: 1 },
  num: { fontFamily: FONTS.clashSemibold, fontSize: 24, color: COLORS.secondary },
  label: { fontFamily: FONTS.clashMedium, fontSize: 16, color: COLORS.primary },
  desc: { fontFamily: FONTS.dmRegular, fontSize: 13, color: COLORS.muted, lineHeight: 20 },
});
