import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { COLORS, FONTS, BREAKPOINT, SCREEN_PADDING } from '../../constants/brand';

interface Card {
  title: string;
  body: string;
}

interface LegalCardsProps {
  title: string;
  cards: Card[];
}

export default function LegalCards({ title, cards }: LegalCardsProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;
  const pad = isDesktop ? SCREEN_PADDING.desktop : 16;

  return (
    <View style={{ paddingHorizontal: pad, paddingVertical: 32 }}>
      <Text style={[s.title, isDesktop && { fontSize: 48 }]}>{title}</Text>
      <View style={[s.grid, isDesktop && s.gridDesktop]}>
        {cards.map((card, i) => (
          <View key={i} style={[s.card, isDesktop && s.cardDesktop]}>
            <Text style={s.cardTitle}>{card.title}</Text>
            <Text style={s.cardBody}>{card.body}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  title: { fontFamily: FONTS.clashMedium, fontSize: 32, color: COLORS.primary, marginBottom: 28 },
  grid: { gap: 12 },
  gridDesktop: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  card: { backgroundColor: COLORS.offWhite, padding: 24, gap: 10 },
  cardDesktop: { width: '47%' },
  cardTitle: { fontFamily: FONTS.clashSemibold, fontSize: 16, color: COLORS.primary },
  cardBody: { fontFamily: FONTS.dmRegular, fontSize: 14, color: COLORS.olive, lineHeight: 23 },
});
