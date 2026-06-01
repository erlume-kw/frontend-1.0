import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SiteHeader from '../components/layout/SiteHeader';
import PageLayout from '../components/layout/PageLayout';
import SideMenu from '../components/layout/SideMenu';
import { COLORS, FONTS, BREAKPOINT } from '../constants/brand';

const DROPS = [
  { id: 'drop-1', title: 'DROP I',   subtitle: 'Vintage mid-range bags from London' },
  { id: 'drop-2', title: 'DROP II',  subtitle: 'Vintage mid-range bags from London' },
  { id: 'drop-3', title: 'DROP III', subtitle: 'Vintage mid-range bags from London' },
  { id: 'drop-4', title: 'DROP IV',  subtitle: 'Vintage mid-range bags from London' },
];

export default function AllDropsScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;
  const [menuOpen, setMenuOpen] = useState(false);
  const navigation = useNavigation();

  const cardH = 202;
  const titleSize = isDesktop ? 56 : 32;
  const subtitleSize = isDesktop ? 24 : 20;

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
        <View style={[s.dropsStack, isDesktop && { gap: 14 }]}>
          {DROPS.map(drop => (
            <TouchableOpacity
              key={drop.id}
              style={[s.card, { height: cardH }]}
              activeOpacity={0.85}
              onPress={() => (navigation.navigate as Function)('DropDetail', { dropId: drop.id, dropTitle: drop.title })}
            >
              {/* Background image placeholder — replace with drop.imageUri in production */}
              <View style={[StyleSheet.absoluteFillObject, { backgroundColor: COLORS.placeholder }]} />
              <View style={s.cardOverlay}>
                <Text style={[s.cardTitle, { fontSize: titleSize }]}>{drop.title}</Text>
                <Text style={[s.cardSubtitle, { fontSize: subtitleSize }]}>{drop.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
    </PageLayout>
  );
}

const s = StyleSheet.create({
  dropsStack: { gap: 0 },
  card: {
    width: '100%',
    overflow: 'hidden',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontFamily: FONTS.clashMedium,
    color: COLORS.white,
    lineHeight: undefined,
  },
  cardSubtitle: {
    fontFamily: FONTS.clashMedium,
    color: COLORS.white,
    marginTop: 4,
  },
});
