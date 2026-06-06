import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { COLORS, FONTS, BREAKPOINT } from '../../constants/brand';

interface ProductCardProps {
  brand?: string;
  name?: string;
  price?: string;
  onPress?: () => void;
  onWishlistPress?: () => void;
  isWishlisted?: boolean;
  /** Override card width (defaults to 255 on desktop, 160 on mobile) */
  cardWidth?: number;
}

export default function ProductCard({
  brand = 'BRAND',
  name = 'PRODUCT NAME',
  price = 'PRICE',
  onPress,
  onWishlistPress,
  isWishlisted = false,
  cardWidth,
}: ProductCardProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;

  // Figma card: 255 × 340, image area 239px, info area 101px
  const baseW = cardWidth ?? (isDesktop ? 255 : 160);
  const scale = baseW / 255;
  const cardH = Math.round(340 * scale);
  const imgH = Math.round(239 * scale);
  const textSize = isDesktop ? 14 : 11;
  const heartSize = isDesktop ? 24 : 18;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[s.card, { width: baseW, height: cardH }]}
      onPress={onPress}
    >
      {/* Image area */}
      <View style={[s.imageArea, { height: imgH }]} />

      {/* Info area */}
      <View style={s.infoArea}>
        <Text style={[s.brand, { fontSize: textSize }]} numberOfLines={1}>
          {brand}
        </Text>
        <Text style={[s.itemName, { fontSize: textSize }]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[s.price, { fontSize: textSize }]} numberOfLines={1}>
          {price}
        </Text>
      </View>

      {/* Heart / wishlist */}
      <TouchableOpacity
        style={[s.heart, { top: Math.round(12 * scale), right: Math.round(12 * scale), width: heartSize, height: heartSize }]}
        onPress={onWishlistPress}
        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
      >
        <Text style={[s.heartIcon, { fontSize: heartSize }]}>
          {isWishlisted ? '♥' : '♡'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },
  imageArea: {
    width: '100%',
    backgroundColor: '#F2F2F2',
  },
  infoArea: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  brand: {
    fontFamily: FONTS.clashMedium,
    color: COLORS.primary,
    textAlign: 'center',
  },
  itemName: {
    fontFamily: FONTS.clashRegular,
    color: COLORS.olive,
    textAlign: 'center',
  },
  price: {
    fontFamily: FONTS.clashRegular,
    color: COLORS.olive,
    textAlign: 'center',
  },
  heart: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIcon: {
    color: COLORS.secondary,
  },
});
