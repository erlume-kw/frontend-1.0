import React, { useState, useEffect } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SiteHeader from '../components/layout/SiteHeader';
import PageLayout from '../components/layout/PageLayout';
import SideMenu from '../components/layout/SideMenu';
import MaxWidthContainer from '../components/layout/MaxWidthContainer';
import ProductCard from '../components/ui/ProductCard';
import SignInPromptModal from '../components/SignInPromptModal';
import { useWishlist } from '../contexts/WishlistContext';
import { COLORS, FONTS, BREAKPOINT, SCREEN_PADDING } from '../constants/brand';
import { fetchItemById, fetchItems, submitNotifyRequest, type Item } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { SkeletonProductDetail } from '../components/ui/Skeleton';
import { verifyEmail } from '../services/emailVerification';

const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

function Toast({ message }: { message: string }) {
  return (
    <View style={s.toast}>
      <Text style={s.toastText}>{message}</Text>
    </View>
  );
}

// ─── Image Carousel (mobile) ──────────────────────────────────────────────────
function MobileCarousel({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setIdx(i => (i + 1) % images.length);

  return (
    <View style={s.carouselWrap}>
      <Image source={{ uri: images[idx] }} style={s.carouselImg as ImageStyle} resizeMode="cover" />

      <TouchableOpacity style={[s.arrowBtn, s.arrowLeft]} onPress={prev} hitSlop={12}>
        <Feather name="chevron-left" size={22} color={COLORS.primary} />
      </TouchableOpacity>
      <TouchableOpacity style={[s.arrowBtn, s.arrowRight]} onPress={next} hitSlop={12}>
        <Feather name="chevron-right" size={22} color={COLORS.primary} />
      </TouchableOpacity>

      <View style={s.dots}>
        {images.map((_, i) => (
          <TouchableOpacity key={i} onPress={() => setIdx(i)}>
            <View style={[s.dot, i === idx && s.dotActive]} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Image Gallery (desktop) ─────────────────────────────────────────────────
function DesktopGallery({ images }: { images: string[] }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [containerW, setContainerW] = useState(684);
  const previews = images.slice(0, 3);
  const thumbW = previews.length > 0 ? Math.floor((containerW - 4 * (previews.length - 1)) / previews.length) : containerW;

  return (
    <View style={s.desktopLeft} onLayout={e => setContainerW(e.nativeEvent.layout.width)}>
      <View style={s.thumbRow}>
        {previews.map((uri, i) => (
          <TouchableOpacity key={i} onPress={() => setSelectedIdx(i)}>
            <Image
              source={{ uri }}
              style={[{ width: thumbW, height: 268 }, selectedIdx === i && s.thumbActive] as ImageStyle[]}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </View>
      <View style={s.desktopMainImgWrap}>
        <Image source={{ uri: images[selectedIdx] }} style={{ width: containerW, height: 1036 } as ImageStyle} resizeMode="cover" />
        <TouchableOpacity
          style={[s.arrowBtn, s.arrowLeft, s.arrowDesktop]}
          onPress={() => setSelectedIdx(i => (i - 1 + images.length) % images.length)}
          hitSlop={12}
        >
          <Feather name="chevron-left" size={22} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.arrowBtn, s.arrowRight, s.arrowDesktop]}
          onPress={() => setSelectedIdx(i => (i + 1) % images.length)}
          hitSlop={12}
        >
          <Feather name="chevron-right" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── About Dropdown ───────────────────────────────────────────────────────────
function AboutDropdown({ productName, specs, bodySize, bodyLine, contentSize, contentLine }: { productName: string; specs: string[]; bodySize: number; bodyLine: number; contentSize: number; contentLine: number }) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <TouchableOpacity style={s.aboutRow} onPress={() => setOpen(o => !o)} activeOpacity={0.7}>
        <Text style={[s.aboutHeading, { fontSize: bodySize }]}>About your {productName}</Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={22} color={COLORS.primary} />
      </TouchableOpacity>
      {open && (
        <View style={s.aboutBody}>
          {specs.map(spec => (
            <Text key={spec} style={[s.spec, { fontSize: contentSize, lineHeight: contentLine }]}>• {spec}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Related Products Grid ────────────────────────────────────────────────────
function RelatedGrid({ isDesktop, excludeId }: { isDesktop: boolean; excludeId: string }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const [related, setRelated] = useState<Item[]>([]);
  const [showSignInModal, setShowSignInModal] = useState(false);

  const handleWishlistPress = async (item: Item) => {
    const token = await AsyncStorage.getItem('erlume_access_token');
    if (!token) {
      setShowSignInModal(true);
      return;
    }
    toggleWishlist({ id: item._id, brand: item.brandName, sub: item.itemName, price: `${item.listingPrice} KWD`, imageUri: item.imageUrls?.[0] });
  };

  useEffect(() => {
    fetchItems({ itemStatus: 'available', limit: '4' })
      .then(items => setRelated(items.filter(i => i._id !== excludeId).slice(0, 4)))
      .catch(() => {});
  }, [excludeId]);

  const numCols = isDesktop ? 4 : 2;
  const gapSize = isDesktop ? 16 : 8;
  const contentWidth = isDesktop
    ? Math.min(width, 1280) - SCREEN_PADDING.desktop * 2
    : width - 16 * 2;
  const cardW = Math.floor((contentWidth - gapSize * (numCols - 1)) / numCols);

  if (related.length === 0) return null;

  return (
    <View style={[s.relatedSection, isDesktop && s.relatedSectionDesktop]}>
      <View style={s.relatedHeader}>
        <Text style={[s.relatedTitle, isDesktop && { fontSize: 24 }]}>Check this out</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AllDrops' as never)}>
          <Text style={s.shopAllLink}>Shop all</Text>
        </TouchableOpacity>
      </View>
      <View style={[s.relatedGrid, isDesktop && s.relatedGridDesktop]}>
        {related.map(item => (
          <ProductCard
            key={item._id}
            brand={item.brandName}
            name={item.itemName}
            price={`${item.listingPrice} KWD`}
            imageUri={item.imageUrls?.[0]}
            cardWidth={cardW}
            onPress={() => (navigation.navigate as Function)('ProductDetail', { productId: item._id })}
            onWishlistPress={() => handleWishlistPress(item)}
            isWishlisted={isInWishlist(item._id)}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function ProductDetailScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;
  const navigation = useNavigation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifyEmailError, setNotifyEmailError] = useState('');
  const [notifyEmailVerifying, setNotifyEmailVerifying] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addItem } = useCart();
  const route = useRoute<any>();
  const productId: string = route.params?.productId;

  const handleWishlistPress = async (prod: Item) => {
    const token = await AsyncStorage.getItem('erlume_access_token');
    if (!token) {
      setShowSignInModal(true);
      return;
    }
    toggleWishlist({ id: prod._id, brand: prod.brandName, sub: prod.itemName, price: `${prod.listingPrice} KWD`, imageUri: prod.imageUrls?.[0] });
  };

  useEffect(() => {
    if (!productId) { setLoading(false); return; }
    fetchItemById(productId)
      .then(setItem)
      .catch(e => console.error('ProductDetailScreen fetch error:', e))
      .finally(() => setLoading(false));
  }, [productId]);

  const handleAddToCart = () => {
    if (item) {
      addItem({
        id: item._id,
        brand: item.brandName,
        name: item.itemName,
        price: `${item.listingPrice} KWD`,
        imageUri: item.imageUrls?.[0],
        isSold: false,
      });
    }
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  const handleNotifySubmit = async () => {
    if (!isValidEmail(notifyEmail)) {
      setNotifyEmailError('Please enter a valid email address.');
      return;
    }

    setNotifyEmailVerifying(true);
    setNotifyEmailError('');

    try {
      const verification = await verifyEmail(notifyEmail);

      if (!verification.isValid) {
        setNotifyEmailError(verification.error || 'Email address is not valid.');
        setNotifyEmailVerifying(false);
        return;
      }

      await submitNotifyRequest(notifyEmail, { _id: item!._id, itemName: item!.itemName, brandName: item!.brandName });
      setNotifySuccess(true);
      setNotifyEmail('');
    } catch (error: any) {
      const errorMessage = error?.message || 'Something went wrong. Please try again.';
      setNotifyEmailError(errorMessage);
    } finally {
      setNotifyEmailVerifying(false);
    }
  };

  const bodySize = isDesktop ? 24 : 16;
  const bodyLine = isDesktop ? 30 : 22;
  const contentSize = isDesktop ? 16 : 16;
  const contentLine = isDesktop ? 24 : 22;

  if (loading) {
    return (
      <PageLayout header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}>
        {isDesktop ? (
          <MaxWidthContainer style={s.desktopContainer}>
            <SkeletonProductDetail isDesktop screenWidth={width} />
          </MaxWidthContainer>
        ) : (
          <SkeletonProductDetail isDesktop={false} screenWidth={width} />
        )}
      </PageLayout>
    );
  }

  if (!item) {
    return (
      <PageLayout header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}>
        <Text style={{ padding: 32, fontFamily: FONTS.clashMedium, color: COLORS.primary }}>Item not found.</Text>
      </PageLayout>
    );
  }

  const isSold = item.itemStatus === 'sold';
  const productName = item.itemModel ?? item.itemName;
  const specs = [
    item.color !== 'Unknown' ? `Color: ${item.color}` : null,
    item.size !== 'Unknown' ? `Size: ${item.size}` : null,
    item.condition ? `Condition: ${item.condition.replace(/_/g, ' ')}` : null,
    item.year ? `Year: ${item.year}` : null,
  ].filter(Boolean) as string[];
  const productItem = { id: item._id, brand: item.brandName, sub: item.itemName, price: `${item.listingPrice} KWD`, imageUri: item.imageUrls?.[0] };
  const inWishlist = isInWishlist(item._id);

  const notifyBlock = isSold ? (
    <View style={s.notifySection}>
      <Text style={[s.notifyText, { fontSize: contentSize, lineHeight: contentLine }]}>
        Get notified when a similar piece is launched! Sign up and be the first to hear about our next drop:
      </Text>
      {notifySuccess ? (
        <Text style={[s.notifyText, { color: COLORS.secondary, fontSize: contentSize }]}>You're on the list!</Text>
      ) : (
        <View>
          <View style={[s.emailStrip, !!notifyEmailError && s.emailStripError]}>
            <TextInput
              style={s.emailInput}
              placeholder="your@email.com"
              placeholderTextColor={COLORS.muted}
              value={notifyEmail}
              onChangeText={v => { setNotifyEmail(v); if (notifyEmailError) setNotifyEmailError(''); }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={[s.signupBtn, notifyEmailVerifying && { opacity: 0.6 }]}
              onPress={handleNotifySubmit}
              disabled={notifyEmailVerifying}
            >
              <Text style={s.signupBtnText}>{notifyEmailVerifying ? 'VERIFYING...' : 'SIGN UP'}</Text>
            </TouchableOpacity>
          </View>
          {!!notifyEmailError && <Text style={s.emailError}>{notifyEmailError}</Text>}
        </View>
      )}
    </View>
  ) : null;

  if (isDesktop) {
    return (
      <PageLayout
        menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
        overlay={toastVisible ? <Toast message="Added to cart!" /> : undefined}
        header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
      >
        <MaxWidthContainer style={s.desktopContainer}>
          <View style={s.desktopBody}>
            <DesktopGallery images={item.imageUrls} />
            <View style={s.desktopRight}>
              <View>
                <Text style={s.productName}>{item.itemName.toUpperCase()}</Text>
                <Text style={s.productPrice}>{item.listingPrice} KWD</Text>
                <Text style={s.productBrand}>{item.brandName}</Text>
                {item.year ? <Text style={s.productYear}>{item.year}</Text> : null}
              </View>
              <View style={s.ctaRow}>
                {!isSold && (
                  <TouchableOpacity style={s.heartBtn} onPress={() => handleWishlistPress(productItem)} hitSlop={12}>
                    <Text style={[s.wishlistIcon, inWishlist && s.wishlistIconActive]}>{inWishlist ? '♥' : '♡'}</Text>
                  </TouchableOpacity>
                )}
                {isSold ? (
                  <View style={[s.soldBanner, s.ctaBtn]}><Text style={s.soldText}>SOLD</Text></View>
                ) : (
                  <TouchableOpacity style={[s.addToCartBtn, s.ctaBtn]} onPress={handleAddToCart}>
                    <Text style={s.addToCartText}>ADD TO CART</Text>
                  </TouchableOpacity>
                )}
              </View>
              <AboutDropdown productName={productName} specs={specs} bodySize={bodySize} bodyLine={bodyLine} contentSize={contentSize} contentLine={contentLine} />
              {notifyBlock}
              <Text style={[s.sectionHeading, { fontSize: 24 }]}>Delivery &amp; Returns</Text>
              <Text style={[s.desc, { fontSize: contentSize, lineHeight: contentLine }]}>
                {'Try items in the comfort of your own home. If they\'re not quite right, you\'ve got 28 days to request an exchange or return.'}
              </Text>
            </View>
          </View>
          <RelatedGrid isDesktop={isDesktop} excludeId={item._id} />
        </MaxWidthContainer>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      overlay={toastVisible ? <Toast message="Added to cart!" /> : undefined}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      <View style={s.mobileContent}>
        <View>
          <Text style={s.productName}>{item.itemName.toUpperCase()}</Text>
          <Text style={s.productPrice}>{item.listingPrice} KWD</Text>
          <Text style={s.productBrand}>{item.brandName}</Text>
          {item.year ? <Text style={s.productYear}>{item.year}</Text> : null}
        </View>
        <MobileCarousel images={item.imageUrls} />
        <View style={s.ctaRow}>
          {!isSold && (
            <TouchableOpacity style={s.heartBtn} onPress={() => toggleWishlist(productItem)} hitSlop={12}>
              <Text style={[s.wishlistIcon, inWishlist && s.wishlistIconActive]}>{inWishlist ? '♥' : '♡'}</Text>
            </TouchableOpacity>
          )}
          {isSold ? (
            <View style={[s.soldBanner, s.ctaBtn]}><Text style={s.soldText}>SOLD</Text></View>
          ) : (
            <TouchableOpacity style={[s.addToCartBtn, s.ctaBtn]} onPress={handleAddToCart}>
              <Text style={s.addToCartText}>ADD TO CART</Text>
            </TouchableOpacity>
          )}
        </View>
        <AboutDropdown productName={productName} specs={specs} bodySize={bodySize} bodyLine={bodyLine} contentSize={contentSize} contentLine={contentLine} />
        {notifyBlock}
        <Text style={[s.sectionHeading, { fontSize: bodySize }]}>Delivery &amp; Returns</Text>
        <Text style={[s.desc, { fontSize: contentSize, lineHeight: contentLine }]}>
          {'Try items in the comfort of your own home. If they\'re not quite right, you\'ve got 28 days to request an exchange or return.'}
        </Text>
      </View>
      <RelatedGrid isDesktop={false} excludeId={item._id} />
      <SignInPromptModal
        visible={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onSignIn={() => {
          setShowSignInModal(false);
          navigation.navigate('SignInRegister' as never);
        }}
      />
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
  dots: { position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: COLORS.white },

  // Desktop gallery
  desktopLeft: { width: 684 },
  thumbRow: { flexDirection: 'row', gap: 4, marginBottom: 4 },
  thumbActive: { opacity: 1, outlineWidth: 2, outlineColor: COLORS.primary } as any,
  desktopMainImgWrap: { position: 'relative', overflow: 'hidden' },

  // Desktop layout
  desktopContainer: { paddingHorizontal: SCREEN_PADDING.desktop },
  desktopBody: { flexDirection: 'row', alignItems: 'flex-start' },
  desktopRight: { flex: 1, paddingLeft: 48, paddingVertical: 48, gap: 16 },

  productName: { fontFamily: FONTS.clashMedium, fontSize: 32, color: COLORS.black, lineHeight: 40 },
  productPrice: { fontFamily: FONTS.clashSemibold, fontSize: 20, color: COLORS.secondary },
  productBrand: { fontFamily: FONTS.clashMedium, fontSize: 16, color: COLORS.black },
  productYear: { fontFamily: FONTS.clashRegular, fontSize: 16, color: COLORS.black },

  ctaRow: { flexDirection: 'row', height: 75 },
  ctaBtn: { flex: 1 },
  addToCartBtn: { backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center' },
  addToCartText: { fontFamily: FONTS.clashSemibold, fontSize: 20, color: COLORS.white, letterSpacing: 1 },
  heartBtn: { width: 75, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.lightGrey },
  wishlistIcon: { fontSize: 28, color: COLORS.muted },
  wishlistIconActive: { color: COLORS.secondary },

  sectionHeading: { fontFamily: FONTS.clashMedium, color: COLORS.black, marginTop: 8, marginBottom: 4 },
  desc: { fontFamily: FONTS.dmRegular, color: COLORS.black, textAlign: 'justify' },
  spec: { fontFamily: FONTS.dmRegular, color: COLORS.black },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  aboutHeading: { fontFamily: FONTS.clashMedium, fontSize: 16, color: COLORS.black },
  aboutBody: { gap: 4, paddingBottom: 8 },

  // Mobile
  mobileContent: { paddingHorizontal: 16, paddingTop: 24, gap: 14 },
  soldBanner: { backgroundColor: 'rgba(197,112,93,0.5)', alignItems: 'center', justifyContent: 'center' },
  soldText: { fontFamily: FONTS.clashSemibold, fontSize: 16, color: COLORS.white },
  notifySection: { gap: 14, marginTop: 28, marginBottom: 28 },
  notifyText: { fontFamily: FONTS.dmMedium, color: COLORS.black, textAlign: 'justify' },
  emailStrip: { flexDirection: 'row', height: 50, backgroundColor: COLORS.lightGrey, overflow: 'hidden' },
  emailStripError: { backgroundColor: 'rgba(185,64,64,0.1)' },
  emailInput: { flex: 1, paddingHorizontal: 12, fontFamily: FONTS.clashMedium, fontSize: 16, color: COLORS.black },
  signupBtn: { width: 104, backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center' },
  signupBtnText: { fontFamily: FONTS.clashMedium, fontSize: 16, color: COLORS.white },
  emailError: { fontFamily: FONTS.dmRegular, fontSize: 13, color: COLORS.error, marginTop: 6 },

  // Related section
  relatedSection: { paddingHorizontal: 16, paddingVertical: 24 },
  relatedSectionDesktop: { paddingHorizontal: 0, paddingVertical: 40 },
  relatedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  relatedTitle: { fontFamily: FONTS.clashMedium, fontSize: 20, color: COLORS.olive },
  shopAllLink: { fontFamily: FONTS.clashMedium, fontSize: 16, color: COLORS.secondary },
  relatedGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-start' },
  relatedGridDesktop: { gap: 16, rowGap: 24, justifyContent: 'flex-start' },
});
