import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SiteHeader from '../components/layout/SiteHeader';
import PageLayout from '../components/layout/PageLayout';
import SideMenu from '../components/layout/SideMenu';
import { COLORS, FONTS, BREAKPOINT } from '../constants/brand';
import { fetchDrops, type Drop } from '../services/api';
import { SkeletonDropCard } from '../components/ui/Skeleton';

export default function AllDropsScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;
  const [menuOpen, setMenuOpen] = useState(false);
  const navigation = useNavigation();
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrops()
      .then(setDrops)
      .catch(e => console.error('AllDropsScreen fetch error:', e))
      .finally(() => setLoading(false));
  }, []);

  const cardH = 202;
  const titleSize = isDesktop ? 56 : 32;
  const subtitleSize = isDesktop ? 24 : 20;

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      {loading ? (
        <View style={[s.dropsStack, isDesktop && { gap: 14 }]}>
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonDropCard key={i} height={202} />
          ))}
        </View>
      ) : (
        <View style={[s.dropsStack, isDesktop && { gap: 14 }]}>
          {drops.map(drop => (
            <TouchableOpacity
              key={drop._id}
              style={[s.card, { height: cardH }]}
              activeOpacity={0.85}
              onPress={() => (navigation.navigate as Function)('DropDetail', { dropId: drop._id, dropTitle: drop.name })}
            >
              {drop.bannerImageUrl ? (
                <Image source={{ uri: drop.bannerImageUrl }} style={StyleSheet.absoluteFillObject as any} resizeMode="cover" />
              ) : (
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: COLORS.placeholder }]} />
              )}
              <View style={s.cardOverlay}>
                <Text style={[s.cardTitle, { fontSize: titleSize }]}>{drop.name.toUpperCase()}</Text>
                {drop.description ? (
                  <Text style={[s.cardSubtitle, { fontSize: subtitleSize }]}>{drop.description}</Text>
                ) : null}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
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
