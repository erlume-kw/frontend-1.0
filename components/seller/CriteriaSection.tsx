import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { COLORS, FONTS, BREAKPOINT, SCREEN_PADDING } from '../../constants/brand';

interface CriteriaSectionProps {
  title: string;
  subtitle?: string;
  items: string[];
}

export default function CriteriaSection({ title, subtitle, items }: CriteriaSectionProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;
  const pad = isDesktop ? SCREEN_PADDING.desktop : 16;

  return (
    <View style={{ paddingHorizontal: pad, paddingVertical: 32 }}>
      <Text style={[s.title, isDesktop && { fontSize: 48 }]}>{title}</Text>
      {subtitle && <Text style={[s.subtitle, isDesktop && { fontSize: 17 }]}>{subtitle}</Text>}
      <View style={s.list}>
        {items.map((item, i) => (
          <View key={i} style={s.item}>
            <View style={s.bullet} />
            <Text style={[s.text, isDesktop && { fontSize: 16 }]}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  title: { fontFamily: FONTS.clashMedium, fontSize: 32, color: COLORS.primary, marginBottom: 12 },
  subtitle: { fontFamily: FONTS.dmRegular, fontSize: 15, color: COLORS.muted, lineHeight: 24, marginBottom: 28 },
  list: { gap: 16 },
  item: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  bullet: { width: 8, height: 8, backgroundColor: COLORS.secondary, marginTop: 6 },
  text: { flex: 1, fontFamily: FONTS.dmRegular, fontSize: 15, color: COLORS.olive, lineHeight: 24 },
});
