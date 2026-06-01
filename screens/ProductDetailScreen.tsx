import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  useWindowDimensions,
  ImageStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { showNotifySignup } from '../utils/interactions';
import SiteHeader from '../components/layout/SiteHeader';
import PageLayout from '../components/layout/PageLayout';
import SideMenu from '../components/layout/SideMenu';
import MaxWidthContainer from '../components/layout/MaxWidthContainer';
import { useWishlist } from '../contexts/WishlistContext';
import { COLORS, FONTS, BREAKPOINT } from '../constants/brand';

const IMAGES = [
  'https://www.figma.com/api/mcp/asset/86444fc0-8ab3-49c3-8011-cf1514d5f8ea',
  'https://www.figma.com/api/mcp/asset/f65a6432-17f7-41b9-9c8f-55e79e3ee309',
  'https://www.figma.com/api/mcp/asset/a8995563-f9f9-409e-87a5-e44d1572b900',
];
const RELATED_IMG = 'https://www.figma.com/api/mcp/asset/7413ba79-30a9-4e7a-9c54-18d8647a3678';

const DESCRIPTION =
  "Chemena Kamali revives Chloé's iconic 'Paddington' tote with updated details, marking 20 years since its debut on the Spring '05 runway. This version is made from black leather in an East-West barrel shape with adjustable gussets and gold-tone hardware, including a padlock and key.";

const SPECS = ['Black leather (Buffalo)', 'Top handles', 'Year purchased: 2023', 'Country purchased: Italy'];

const RELATED = [
  { id: 'r1', brand: 'CHLOE', sub: 'TOP HANDLE BAG', price: '234 KWD' },
  { id: 'r2', brand: 'CHLOE', sub: 'MINI TOTE', price: '185 KWD' },
  { id: 'r3', brand: 'CHLOE', sub: 'SHOULDER BAG', price: '210 KWD' },
  { id: 'r4', brand: 'CHLOE', sub: 'CLUTCH', price: '120 KWD' },
];

const PRODUCT_ID = 'paddington-chloe-2023';
const PRODUCT_ITEM = { id: PRODUCT_ID, brand: 'CHLOE', sub: 'PADDINGTON TOTE', price: '234 KWD', imageUri: IMAGES[0] };

function Toast({ message }: { message: string }) {
  return (
    <View style={s.toast}>
      <Text style={s.toastText}>{message}</Text>
    </View>
  );
}

// ─── Image Carousel (mobile) ──────────────────────────────────────────────────
function MobileCarousel() {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx(i => (i - 1 + IMAGES.length) % IMAGES.length);
  const next = () => setIdx(i => (i + 1) % IMAGES.length);

  return (
    <View style={s.carouselWrap}>
      <Image source={{ uri: IMAGES[idx] }} style={s.carouselImg as ImageStyle} resizeMode="cover" />

      {/* Prev arrow */}
      <TouchableOpacity style={[s.arrowBtn, s.arrowLeft]} onPress={prev} hitSlop={12}>
        <Text style={s.arrowText}>‹</Text>
      </TouchableOpacity>

      {/* Next arrow */}
      <TouchableOpacity style={[s.arrowBtn, s.arrowRight]} onPress={next} hitSlop={12}>
        <Text style={s.arrowText}>›</Text>
      </TouchableOpacity>

      {/* Dots */}
      <View style={s.dots}>
        {IMAGES.map((_, i) => (
          <TouchableOpacity key={i} onPress={() => setIdx(i)}>
            <View style={[s.dot, i === idx && s.dotActive]} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Image Gallery (desktop) ─────────────────────────────────────────────────
function DesktopGallery() {
  const [selectedIdx, setSelectedIdx] = useState(0);

  return (
    <View style={s.desktopLeft}>
      {/* Thumbnail strip */}
      <View style={s.thumbRow}>
        {IMAGES.map((uri, i) => (
          <TouchableOpacity key={i} onPress={() => setSelectedIdx(i)}>
            <Image
              source={{ uri }}
              style={[s.thumb, selectedIdx === i && s.thumbActive] as ImageStyle[]}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </View>
      {/* Main image with arrows */}
      <View style={s.desktopMainImgWrap}>
        <Image source={{ uri: IMAGES[selectedIdx] }} style={s.desktopHero as ImageStyle} resizeMode="cover" />
        <TouchableOpacity
          style={[s.arrowBtn, s.arrowLeft, s.arrowDesktop]}
          onPress={() => setSelectedIdx(i => (i - 1 + IMAGES.length) % IMAGES.length)}
          hitSlop={12}
        >
          <Text style={s.arrowText}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.arrowBtn, s.arrowRight, s.arrowDesktop]}
          onPress={() => setSelectedIdx(i => (i + 1) % IMAGES.length)}
          hitSlop={12}
        >
          <Text style={s.arrowText}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Related Products Grid ────────────────────────────────────────────────────
function RelatedGrid({ isDesktop }: { isDesktop: boolean }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigation = useNavigation();
  const cardW = isDesktop ? 220 : 180;
  const cardH = isDesktop ? 290 : 216;

  return (
    <View style={[s.relatedSection, isDesktop && s.relatedSectionDesktop]}>
      <View style={s.relatedHeader}>
        <Text style={[s.relatedTitle, isDesktop && { fontSize: 24 }]}>Check this out</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AllDrops' as never)}>
          <Text style={s.shopAllLink}>Shop all</Text>
        </TouchableOpacity>
      </View>
      <View style={[s.relatedGrid, isDesktop && s.relatedGridDesktop]}>
        {RELATED.map(p => (
          <TouchableOpacity
            key={p.id}
            style={[s.relatedCard, { width: cardW, height: cardH }]}
            activeOpacity={0.85}
            onPress={() => (navigation.navigate as Function)('ProductDetail', { productId: p.id })}
          >
            <View style={s.relatedImgWrap}>
              <Image source={{ uri: RELATED_IMG }} style={s.relatedImg as ImageStyle} resizeMode="cover" />
              <TouchableOpacity
                style={s.heartBtn}
                onPress={() => toggleWishlist({ ...p, imageUri: RELATED_IMG })}
                hitSlop={8}
              >
                <Text style={isInWishlist(p.id) ? s.heartActive : s.heartInactive}>
                  {isInWishlist(p.id) ? '♥' : '♡'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={s.relatedBrand}>{p.brand}</Text>
            <Text style={s.relatedSub}>{p.sub}</Text>
            <Text style={s.relatedPrice}>{p.price}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function ProductDetailScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;
  const [menuOpen, setMenuOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const { toggleWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  const bodySize = isDesktop ? 24 : 16;
  const bodyLine = isDesktop ? 30 : 22;
  const inWishlist = isInWishlist(PRODUCT_ID);

  if (isDesktop) {
    return (
      <PageLayout
        menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
        overlay={toastVisible ? <Toast message="Added to cart!" /> : undefined}
        header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
      >
          <MaxWidthContainer>
            <View style={s.desktopBody}>
              <DesktopGallery />

              <View style={s.desktopRight}>
                {/* Title + wishlist */}
                <View style={s.titleRow}>
                  <View>
                    <Text style={s.productName}>PADDINGTON</Text>
                    <Text style={s.productBrand}>CHLOE</Text>
                    <Text style={s.productYear}>2023</Text>
                  </View>
                  <TouchableOpacity
                    style={s.wishlistBtn}
                    onPress={() => toggleWishlist(PRODUCT_ITEM)}
                    hitSlop={12}
                  >
                    <Text style={[s.wishlistIcon, inWishlist && s.wishlistIconActive]}>
                      {inWishlist ? '♥' : '♡'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={[s.desc, { fontSize: bodySize, lineHeight: bodyLine }]}>{DESCRIPTION}</Text>

                <TouchableOpacity style={s.addToCartBtn} onPress={handleAddToCart}>
                  <Text style={s.addToCartText}>ADD TO CART</Text>
                </TouchableOpacity>

                <Text style={[s.sectionHeading, { fontSize: 24 }]}>Product Details</Text>
                {SPECS.map(spec => (
                  <Text key={spec} style={[s.spec, { fontSize: bodySize, lineHeight: bodyLine }]}>• {spec}</Text>
                ))}

                <Text style={[s.sectionHeading, { fontSize: 24 }]}>Delivery &amp; Returns</Text>
                <Text style={[s.desc, { fontSize: bodySize, lineHeight: bodyLine }]}>
                  {'Try items in the comfort of your own home. If they\'re not quite right, you\'ve got 28 days to request an exchange or return.'}
                </Text>
              </View>
            </View>

            {/* Recommended items — desktop */}
            <RelatedGrid isDesktop={isDesktop} />
          </MaxWidthContainer>
      </PageLayout>
    );
  }

  // Mobile layout
  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      overlay={toastVisible ? <Toast message="Added to cart!" /> : undefined}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
        <View style={s.mobileContent}>
          {/* Title + wishlist */}
          <View style={s.titleRow}>
            <View>
              <Text style={s.productName}>PADDINGTON</Text>
              <Text style={s.productBrand}>CHLOE</Text>
              <Text style={s.productYear}>2023</Text>
            </View>
            <TouchableOpacity onPress={() => toggleWishlist(PRODUCT_ITEM)} hitSlop={12}>
              <Text style={[s.wishlistIcon, inWishlist && s.wishlistIconActive]}>
                {inWishlist ? '♥' : '♡'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[s.desc, { fontSize: bodySize, lineHeight: bodyLine }]}>{DESCRIPTION}</Text>

          <MobileCarousel />

          <View style={s.soldBanner}>
            <Text style={s.soldText}>SOLD</Text>
          </View>

          {SPECS.map(spec => (
            <Text key={spec} style={[s.spec, { fontSize: bodySize, lineHeight: bodyLine }]}>• {spec}</Text>
          ))}

          <Text style={[s.notifyText, { fontSize: bodySize, lineHeight: bodyLine }]}>
            Get notified when a similar piece is launched! Sign up and be the first to hear about our next drop:
          </Text>

          <View style={s.emailStrip}>
            <TextInput
              style={s.emailInput}
              placeholder="your@email.com"
              placeholderTextColor={COLORS.muted}
              value={notifyEmail}
              onChangeText={setNotifyEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity style={s.signupBtn} onPress={showNotifySignup}>
              <Text style={s.signupBtnText}>SIGN UP</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recommended items — mobile */}
        <RelatedGrid isDesktop={false} />
    </PageLayout>
  );
}

const s = StyleSheet.create({
  toast: { backgroundColor: COLORS.olive, paddingHorizontal: 20, paddingVertical: 12, alignItems: 'center' },
  toastText: { fontFamily: FONTS.clashMedium, fontSize: 12, color: COLORS.white },

  // Carousel — mobile
  carouselWrap: { position: 'relative', aspectRatio: 0.66, width: '100%', overflow: 'hidden' },
  carouselImg: { width: '100%', height: '100%' },
  arrowBtn: {
    position: 'absolute',
    top: '50%',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.75)',
    transform: [{ translateY: -20 }],
  },
  arrowLeft: { left: 8 },
  arrowRight: { right: 8 },
  arrowDesktop: { backgroundColor: 'rgba(255,255,255,0.85)', width: 48, height: 48 },
  arrowText: { fontFamily: FONTS.clashSemibold, fontSize: 28, color: COLORS.primary, lineHeight: 32 },
  dots: { position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: COLORS.white },

  // Desktop gallery
  desktopLeft: { width: 684 },
  thumbRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  thumb: { width: 177, height: 268, opacity: 0.55 },
  thumbActive: { opacity: 1, outlineWidth: 2, outlineColor: COLORS.primary } as any,
  desktopMainImgWrap: { position: 'relative', overflow: 'hidden' },
  desktopHero: { width: 684, height: 1036 },

  // Desktop layout
  desktopBody: { flexDirection: 'row', alignItems: 'flex-start' },
  desktopRight: { flex: 1, paddingHorizontal: 48, paddingVertical: 48, gap: 16 },

  // Title / wishlist
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  wishlistBtn: { padding: 8 },
  wishlistIcon: { fontSize: 28, color: COLORS.muted },
  wishlistIconActive: { color: COLORS.secondary },

  productName: { fontFamily: FONTS.clashMedium, fontSize: 32, color: COLORS.black, lineHeight: 40 },
  productBrand: { fontFamily: FONTS.clashMedium, fontSize: 16, color: COLORS.black },
  productYear: { fontFamily: FONTS.clashRegular, fontSize: 16, color: COLORS.black },

  addToCartBtn: { backgroundColor: COLORS.secondary, height: 75, alignItems: 'center', justifyContent: 'center' },
  addToCartText: { fontFamily: FONTS.clashSemibold, fontSize: 20, color: COLORS.white, letterSpacing: 1 },

  sectionHeading: { fontFamily: FONTS.clashMedium, color: COLORS.black, marginTop: 8, marginBottom: 4 },
  desc: { fontFamily: FONTS.dmRegular, color: COLORS.black, textAlign: 'justify' },
  spec: { fontFamily: FONTS.dmRegular, color: COLORS.black },

  // Mobile
  mobileContent: { paddingHorizontal: 16, gap: 14 },
  soldBanner: { backgroundColor: 'rgba(197,112,93,0.5)', height: 75, alignItems: 'center', justifyContent: 'center' },
  soldText: { fontFamily: FONTS.clashSemibold, fontSize: 16, color: COLORS.white },
  notifyText: { fontFamily: FONTS.dmMedium, color: COLORS.black, textAlign: 'justify' },
  emailStrip: { flexDirection: 'row', height: 50, backgroundColor: COLORS.lightGrey, overflow: 'hidden' },
  emailInput: { flex: 1, paddingHorizontal: 12, fontFamily: FONTS.clashMedium, fontSize: 16, color: COLORS.black },
  signupBtn: { width: 104, backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center' },
  signupBtnText: { fontFamily: FONTS.clashMedium, fontSize: 16, color: COLORS.white },

  // Related section
  relatedSection: { paddingHorizontal: 16, paddingVertical: 24 },
  relatedSectionDesktop: { paddingHorizontal: 0, paddingVertical: 40 },
  relatedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  relatedTitle: { fontFamily: FONTS.clashMedium, fontSize: 20, color: COLORS.olive },
  shopAllLink: { fontFamily: FONTS.clashMedium, fontSize: 16, color: COLORS.secondary },
  relatedGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  relatedGridDesktop: { gap: 16, rowGap: 24, justifyContent: 'flex-start' },
  relatedCard: { overflow: 'hidden' },
  relatedImgWrap: { flex: 1, backgroundColor: 'rgba(197,112,93,0.2)', position: 'relative' },
  relatedImg: { width: '100%', height: '100%' },
  heartBtn: { position: 'absolute', top: 6, right: 6, width: 28, height: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.8)' },
  heartActive: { fontSize: 14, color: COLORS.secondary },
  heartInactive: { fontSize: 14, color: COLORS.muted },
  relatedBrand: { fontFamily: FONTS.clashMedium, fontSize: 12, color: COLORS.black, textTransform: 'uppercase', marginTop: 6, paddingHorizontal: 4 },
  relatedSub: { fontFamily: FONTS.clashRegular, fontSize: 10, color: COLORS.olive, textTransform: 'uppercase', paddingHorizontal: 4 },
  relatedPrice: { fontFamily: FONTS.clashMedium, fontSize: 12, color: COLORS.secondary, paddingHorizontal: 4, marginBottom: 4 },
});
