import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  StyleSheet,
  useWindowDimensions,
  ImageStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SiteHeader from '../components/layout/SiteHeader';
import SiteFooter from '../components/layout/SiteFooter';
import SideMenu from '../components/layout/SideMenu';
import { COLORS, FONTS, BREAKPOINT } from '../constants/brand';

// Figma asset URLs — replace with local assets in production
const HERO_IMG   = 'https://www.figma.com/api/mcp/asset/86444fc0-8ab3-49c3-8011-cf1514d5f8ea';
const IMG_LEFT   = 'https://www.figma.com/api/mcp/asset/f65a6432-17f7-41b9-9c8f-55e79e3ee309';
const IMG_RIGHT  = 'https://www.figma.com/api/mcp/asset/a8995563-f9f9-409e-87a5-e44d1572b900';
const RELATED_IMG = 'https://www.figma.com/api/mcp/asset/7413ba79-30a9-4e7a-9c54-18d8647a3678';
const DESKTOP_THUMB1 = 'https://www.figma.com/api/mcp/asset/ddfeb439-c357-437f-83bf-e41df352f2e0';
const DESKTOP_THUMB2 = 'https://www.figma.com/api/mcp/asset/9c7f63eb-ad63-45c0-b45b-3a8022ada78c';
const DESKTOP_THUMB3 = 'https://www.figma.com/api/mcp/asset/e8984ebc-ec32-4b81-9114-235329f25595';

const DESCRIPTION =
  "Chemena Kamali revives Chloé's iconic 'Paddington' tote with updated details, marking 20 years since its debut on the Spring '05 runway. This version is made from black leather in an East-West barrel shape with adjustable gussets and gold-tone hardware, including a padlock and key. Add the label's plush charms and stow your phone, wallet and a few cosmetics inside.";

const SPECS = [
  'Black leather (Buffalo)',
  'Top handles',
  'Year purchased: 2023',
  'Country purchased: Italy',
];

const RELATED = Array.from({ length: 4 }, (_, i) => ({ id: String(i), name: 'CHLOE', sub: 'TOP HANDLE BAG', price: '234 KD' }));

function Toast({ message }: { message: string }) {
  return (
    <View style={s.toast}>
      <Text style={s.toastText}>{message}</Text>
    </View>
  );
}

export default function ProductDetailScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;
  const [menuOpen, setMenuOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');

  const handleAddToCart = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  const bodyFontSize = isDesktop ? 24 : 16;
  const bodyLineHeight = isDesktop ? 30 : 22;

  if (isDesktop) {
    return (
      <SafeAreaView style={s.root} edges={['top']}>
        <SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
        {toastVisible && <Toast message="Erlume successfully added to cart!" />}
        <ScrollView showsVerticalScrollIndicator={false}>
          <SiteHeader onMenuPress={() => setMenuOpen(true)} />

          {/* Desktop two-column layout */}
          <View style={s.desktopBody}>
            {/* Left: image gallery */}
            <View style={s.desktopLeft}>
              <View style={s.thumbRow}>
                <Image source={{ uri: DESKTOP_THUMB1 }} style={s.thumb1 as ImageStyle} resizeMode="cover" />
                <Image source={{ uri: DESKTOP_THUMB2 }} style={s.thumb2 as ImageStyle} resizeMode="cover" />
                <Image source={{ uri: DESKTOP_THUMB3 }} style={s.thumb3 as ImageStyle} resizeMode="cover" />
              </View>
              <Image source={{ uri: HERO_IMG }} style={s.desktopHero as ImageStyle} resizeMode="cover" />
            </View>

            {/* Right: product info */}
            <View style={s.desktopRight}>
              <View style={s.productTitleBlock}>
                <Text style={s.productName}>PADDINGTON</Text>
                <Text style={s.productBrand}>CHLOE</Text>
                <Text style={s.productYear}>2023</Text>
              </View>

              <Text style={[s.desc, { fontSize: bodyFontSize, lineHeight: bodyLineHeight }]}>
                {DESCRIPTION}
              </Text>

              <TouchableOpacity style={s.addToCartBtn} onPress={handleAddToCart}>
                <Text style={s.addToCartText}>ADD TO CART</Text>
              </TouchableOpacity>

              <Text style={[s.sectionHeading, { fontSize: 24 }]}>Product Details</Text>
              {SPECS.map(spec => (
                <Text key={spec} style={[s.spec, { fontSize: bodyFontSize, lineHeight: bodyLineHeight }]}>
                  • {spec}
                </Text>
              ))}

              <Text style={[s.sectionHeading, { fontSize: 24 }]}>Delivery &amp; Returns</Text>
              <Text style={[s.desc, { fontSize: bodyFontSize, lineHeight: bodyLineHeight }]}>
                Find out more about our{' '}
                <Text style={s.link}>delivery options</Text>
                {'. Try items in the comfort of your own home. If they\'re not quite right, you\'ve got 28 days to request an exchange or return.'}
              </Text>
            </View>
          </View>

          <SiteFooter />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Mobile layout
  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
      {toastVisible && <Toast message="Erlume successfully added to cart!" />}
      <ScrollView showsVerticalScrollIndicator={false}>
        <SiteHeader onMenuPress={() => setMenuOpen(true)} />

        <View style={s.mobileContent}>
          {/* Product title */}
          <View style={s.mobileTitleBlock}>
            <Text style={s.productName}>PADDINGTON</Text>
            <Text style={s.productBrand}>CHLOE</Text>
            <Text style={s.productYear}>2023</Text>
          </View>

          {/* Description */}
          <Text style={[s.desc, { fontSize: bodyFontSize, lineHeight: bodyLineHeight }]}>
            {DESCRIPTION}
          </Text>

          {/* Hero image */}
          <View style={s.mobileHeroWrap}>
            <Image source={{ uri: HERO_IMG }} style={s.mobileHero as ImageStyle} resizeMode="cover" />
          </View>

          {/* Two secondary images */}
          <View style={s.secondaryRow}>
            <Image source={{ uri: IMG_LEFT }} style={s.secondaryLeft as ImageStyle} resizeMode="cover" />
            <Image source={{ uri: IMG_RIGHT }} style={s.secondaryRight as ImageStyle} resizeMode="cover" />
          </View>

          {/* SOLD banner */}
          <View style={s.soldBanner}>
            <Text style={s.soldText}>SOLD</Text>
          </View>

          {/* Specs */}
          {SPECS.map(spec => (
            <Text key={spec} style={[s.spec, { fontSize: bodyFontSize, lineHeight: bodyLineHeight }]}>
              • {spec}
            </Text>
          ))}

          {/* Notify strip */}
          <Text style={[s.notifyText, { fontSize: bodyFontSize, lineHeight: bodyLineHeight }]}>
            Get notified when a similar piece is launched! Sign up and be the first to hear about our next drop:
          </Text>

          {/* Email sign-up */}
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
            <TouchableOpacity style={s.signupBtn}>
              <Text style={s.signupBtnText}>SIGN UP</Text>
            </TouchableOpacity>
          </View>

          {/* Check this out / Shop all */}
          <View style={s.checkRow}>
            <Text style={s.checkLabel}>Check this out</Text>
            <TouchableOpacity>
              <Text style={s.shopAllLink}>Shop all</Text>
            </TouchableOpacity>
          </View>

          {/* Related products 2x2 */}
          <View style={s.relatedGrid}>
            {RELATED.map(p => (
              <TouchableOpacity key={p.id} style={s.relatedCard}>
                <View style={s.relatedImgWrap}>
                  <Image source={{ uri: RELATED_IMG }} style={s.relatedImg as ImageStyle} resizeMode="cover" />
                </View>
                <Text style={s.relatedName}>{p.name}</Text>
                <Text style={s.relatedSub}>{p.sub}</Text>
                <Text style={s.relatedPrice}>{p.price}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <SiteFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.white },
  toast: {
    backgroundColor: COLORS.olive,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  toastText: { fontFamily: FONTS.clashMedium, fontSize: 12, color: COLORS.white },

  // Desktop
  desktopBody: { flexDirection: 'row', minHeight: 1304 },
  desktopLeft: { width: 684, overflow: 'hidden' },
  thumbRow: { flexDirection: 'row', justifyContent: 'space-between' },
  thumb1: { width: 177, height: 268 },
  thumb2: { width: 175, height: 218 },
  thumb3: { width: 178, height: 184 },
  desktopHero: { width: 684, height: 1036 },
  desktopRight: {
    flex: 1,
    paddingHorizontal: 60,
    paddingVertical: 48,
    gap: 16,
  },

  // Title block (shared)
  productTitleBlock: { marginBottom: 8 },
  mobileTitleBlock: { marginBottom: 8 },
  productName: { fontFamily: FONTS.clashMedium, fontSize: 32, color: COLORS.black, lineHeight: 40 },
  productBrand: { fontFamily: FONTS.clashMedium, fontSize: 16, color: COLORS.black },
  productYear: { fontFamily: FONTS.clashRegular, fontSize: 16, color: COLORS.black },

  // ADD TO CART (desktop)
  addToCartBtn: { backgroundColor: COLORS.secondary, height: 87, alignItems: 'center', justifyContent: 'center' },
  addToCartText: { fontFamily: FONTS.clashSemibold, fontSize: 24, color: COLORS.white },

  sectionHeading: { fontFamily: FONTS.clashMedium, color: COLORS.black, marginTop: 16, marginBottom: 8 },
  desc: { fontFamily: FONTS.dmRegular, color: COLORS.black, textAlign: 'justify' },
  spec: { fontFamily: FONTS.dmRegular, color: COLORS.black },
  link: { textDecorationLine: 'underline', color: COLORS.black },

  // Mobile
  mobileContent: { paddingHorizontal: 16, gap: 16 },
  mobileHeroWrap: { overflow: 'hidden' },
  mobileHero: { width: '100%', aspectRatio: 684 / 1036 },
  secondaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  secondaryLeft: { width: 175, height: 218 },
  secondaryRight: { width: 178, height: 184 },
  soldBanner: {
    backgroundColor: 'rgba(197,112,93,0.5)',
    height: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldText: { fontFamily: FONTS.clashSemibold, fontSize: 16, color: COLORS.white },
  notifyText: { fontFamily: FONTS.dmMedium, color: COLORS.black, textAlign: 'justify' },
  emailStrip: {
    flexDirection: 'row',
    height: 50,
    backgroundColor: COLORS.lightGrey,
    alignItems: 'stretch',
    overflow: 'hidden',
  },
  emailInput: { flex: 1, paddingHorizontal: 12, fontFamily: FONTS.clashMedium, fontSize: 16, color: COLORS.black },
  signupBtn: {
    width: 104,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupBtnText: { fontFamily: FONTS.clashMedium, fontSize: 16, color: COLORS.white },
  checkRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  checkLabel: { fontFamily: FONTS.clashMedium, fontSize: 16, color: COLORS.olive },
  shopAllLink: { fontFamily: FONTS.clashMedium, fontSize: 16, color: COLORS.secondary },
  relatedGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 16 },
  relatedCard: { width: 180, overflow: 'hidden' },
  relatedImgWrap: { height: 170, backgroundColor: 'rgba(197,112,93,0.2)', paddingHorizontal: 5 },
  relatedImg: { width: 128, height: 171, alignSelf: 'center' },
  relatedName: { fontFamily: FONTS.clashMedium, fontSize: 12, color: COLORS.black, textTransform: 'uppercase', marginTop: 4 },
  relatedSub: { fontFamily: FONTS.clashMedium, fontSize: 12, color: COLORS.black, textTransform: 'uppercase' },
  relatedPrice: { fontFamily: FONTS.clashMedium, fontSize: 12, color: COLORS.black },
});
