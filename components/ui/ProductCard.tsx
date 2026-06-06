import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, useWindowDimensions, ImageStyle } from 'react-native';
import { COLORS, FONTS, BREAKPOINT } from '../../constants/brand';

interface ProductCardProps {
  brand?: string;
  name?: string;
  price?: string;
  /** Optional image URI — shows a gray placeholder when omitted */
  imageUri?: string;
  onPress?: () => void;
  onWishlistPress?: () => void;
  isWishlisted?: boolean;
  /**
   * Override card width in px.
   * Defaults to 255 on desktop / 160 on mobile.
   * Card height and image area are scaled proportionally (Figma ratio 255:340).
   */
  cardWidth?: number;
}

export default function ProductCard({
  brand = 'BRAND',
  name = 'PRODUCT NAME',
  price = 'PRICE',
  imageUri,
  onPress,
  onWishlistPress,
  isWishlisted = false,
  cardWidth,
}: ProductCardProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;

  // Figma base: 255 × 340 card, 239px image area, 101px info area
  const baseW = cardWidth ?? (isDesktop ? 255 : 160);
  const scale = baseW / 255;
  const cardH = Math.round(340 * scale);
  const imgH = Math.round(239 * scale);
  const textSize = isDesktop ? 14 : 11;
  const heartSize = isDesktop ? 22 : 18;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[s.card, { width: baseW, height: cardH }]}
      onPress={onPress}
    >
      {/* Image / placeholder area */}
      <View style={[s.imageArea, { height: imgH }]}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={s.image as ImageStyle}
            resizeMode="cover"
          />
        ) : null}
      </View>

      {/* Info area — left-aligned */}
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

      {/* Wishlist heart — top-right of image area */}
      <TouchableOpacity
        style={[
          s.heart,
          {
            top: Math.round(10 * scale),
            right: Math.round(10 * scale),
            width: heartSize,
            height: heartSize,
          },
        ]}
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
  image: {
    width: '100%',
    height: '100%',
  },
  infoArea: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 3,
  },
  brand: {
    fontFamily: FONTS.clashMedium,
    color: COLORS.primary,
    textAlign: 'left',
  },
  itemName: {
    fontFamily: FONTS.clashRegular,
    color: COLORS.olive,
    textAlign: 'left',
  },
  price: {
    fontFamily: FONTS.clashRegular,
    color: COLORS.olive,
    textAlign: 'left',
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
