import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/brand';

// ─── Base animated box ────────────────────────────────────────────────────────
export function SkeletonBox({ width, height, style }: { width?: ViewStyle['width']; height: number; style?: ViewStyle }) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.4, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1,   duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[{ width: width ?? '100%', height, backgroundColor: COLORS.placeholder }, { opacity }, style]}
    />
  );
}

// ─── Product card skeleton ────────────────────────────────────────────────────
// Matches ProductCard: 255×340 base, 239px image area (#F2F2F2), 101px info (paddingVertical 8, gap 3)
export function SkeletonProductCard({ width, height, isDesktop = false }: { width: number; height: number; isDesktop?: boolean }) {
  const scale = width / 255;
  const imgH = Math.round(239 * scale);
  const textH = isDesktop ? 14 : 11;

  return (
    <View style={{ width, height, backgroundColor: COLORS.white }}>
      <SkeletonBox height={imgH} style={{ backgroundColor: '#F2F2F2' }} />
      <View style={s.cardInfo}>
        <SkeletonBox height={textH} width="55%" />
        <SkeletonBox height={textH} width="80%" style={{ marginTop: 3 }} />
        <SkeletonBox height={textH} width="40%" style={{ marginTop: 3 }} />
      </View>
    </View>
  );
}

// ─── Drop banner card skeleton ────────────────────────────────────────────────
export function SkeletonDropCard({ height }: { height: number }) {
  return <SkeletonBox height={height} />;
}

// ─── Product detail page skeleton ────────────────────────────────────────────
// Mirrors the exact layout of ProductDetailScreen (desktop + mobile)
export function SkeletonProductDetail({ isDesktop, screenWidth }: { isDesktop: boolean; screenWidth: number }) {
  if (isDesktop) {
    // Desktop: left gallery (width 684) + right info panel
    // Padding is handled by the MaxWidthContainer wrapper at the call site
    const galleryW = 684;
    const thumbW = Math.floor((galleryW - 4 * 2) / 3); // 3 thumbs, 4px gaps
    return (
      <View>
        <View style={s.desktopBody}>
          {/* Gallery */}
          <View style={{ width: galleryW }}>
            <View style={{ flexDirection: 'row', gap: 4, marginBottom: 4 }}>
              <SkeletonBox width={thumbW} height={268} />
              <SkeletonBox width={thumbW} height={268} />
              <SkeletonBox width={thumbW} height={268} />
            </View>
            <SkeletonBox height={1036} />
          </View>

          {/* Info panel */}
          <View style={s.desktopRight}>
            {/* Name / price / brand */}
            <View style={{ gap: 8 }}>
              <SkeletonBox height={40} width="65%" />
              <SkeletonBox height={22} width="35%" />
              <SkeletonBox height={16} width="25%" />
            </View>
            {/* CTA row: heart (75px) + button */}
            <View style={{ flexDirection: 'row', height: 75, gap: 0 }}>
              <SkeletonBox width={75} height={75} />
              <View style={{ flex: 1 }}>
                <SkeletonBox height={75} />
              </View>
            </View>
            {/* About row */}
            <SkeletonBox height={44} />
            {/* Delivery row */}
            <SkeletonBox height={44} />
          </View>
        </View>
      </View>
    );
  }

  // Mobile: stacked layout inside mobileContent (paddingHorizontal 16, paddingTop 24, gap 14)
  // Carousel: aspectRatio 0.66 means width/height = 0.66, height = contentWidth / 0.66
  const contentWidth = screenWidth - 32; // mobileContent paddingHorizontal: 16 each side
  const carouselH = Math.round(contentWidth / 0.66);
  return (
    <View style={s.mobileContent}>
      {/* Name / price / brand — matches: productName (32/lh40), productPrice (20), productBrand (16) */}
      <View>
        <SkeletonBox height={40} width="65%" />
        <SkeletonBox height={20} width="35%" style={{ marginTop: 2 }} />
        <SkeletonBox height={16} width="25%" style={{ marginTop: 2 }} />
      </View>
      {/* Carousel: full content width, aspectRatio 0.66 */}
      <SkeletonBox height={carouselH} />
      {/* CTA row: heart (75px) + button (flex 1), total height 75 */}
      <View style={{ flexDirection: 'row', height: 75 }}>
        <SkeletonBox width={75} height={75} />
        <View style={{ flex: 1 }}>
          <SkeletonBox height={75} />
        </View>
      </View>
      {/* About dropdown row */}
      <SkeletonBox height={44} />
      {/* Delivery & Returns row */}
      <SkeletonBox height={44} />
    </View>
  );
}

const s = StyleSheet.create({
  cardInfo: {
    flex: 1,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  desktopBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  desktopRight: {
    flex: 1,
    paddingLeft: 48,
    paddingVertical: 48,
    gap: 16,
  },
  mobileContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 14,
  },
});
