'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import ProductCard from '@/components/ui/ProductCard';
import HeartIcon from '@/components/ui/HeartIcon';
import { Chevron, ARROW_DARK, ARROW_LIGHT } from '@/components/ui/Chevron';
import SignInPromptModal from '@/components/SignInPromptModal';
import { SkeletonProductDetail } from '@/components/ui/Skeleton';
import { useWishlist, type WishlistItem } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useIsDesktop } from '@/lib/useIsDesktop';
import { useWindowWidth } from '@/lib/useWindowWidth';
import { fetchItemById, fetchItems, requestEmailOtp, submitNotifyRequest, getAccessToken, type Item } from '@/services/api';
import VerifyEmailModal from '@/components/VerifyEmailModal';

const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

function Toast({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center bg-olive px-5 py-3">
      <span className="font-clash font-medium text-[12px] text-white">{message}</span>
    </div>
  );
}

// Samples the left/right center bands of an image and picks the arrow tone that
// contrasts with each side (light arrow on dark image, dark arrow on light).
// Falls back to the dark tone if the image is cross-origin-tainted or fails.
function useEdgeArrowColors(src: string | undefined) {
  const [colors, setColors] = useState<{ left: string; right: string }>({
    left: ARROW_DARK,
    right: ARROW_DARK,
  });

  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const sw = 40;
        const sh = 60;
        const canvas = document.createElement('canvas');
        canvas.width = sw;
        canvas.height = sh;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, sw, sh);

        const bandLum = (x0: number, x1: number) => {
          const y0 = Math.floor(sh * 0.35);
          const data = ctx.getImageData(x0, y0, x1 - x0, Math.ceil(sh * 0.3)).data;
          let sum = 0;
          let n = 0;
          for (let i = 0; i < data.length; i += 4) {
            sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            n++;
          }
          return n ? sum / n : 255;
        };

        const left = bandLum(0, Math.floor(sw * 0.22)) < 140 ? ARROW_LIGHT : ARROW_DARK;
        const right = bandLum(Math.ceil(sw * 0.78), sw) < 140 ? ARROW_LIGHT : ARROW_DARK;
        if (!cancelled) setColors({ left, right });
      } catch {
        if (!cancelled) setColors({ left: ARROW_DARK, right: ARROW_DARK });
      }
    };
    img.onerror = () => {
      if (!cancelled) setColors({ left: ARROW_DARK, right: ARROW_DARK });
    };
    img.src = src;

    return () => {
      cancelled = true;
    };
  }, [src]);

  return colors;
}

// ─── Image Carousel (mobile) ──────────────────────────────────────────────────
function MobileCarousel({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0);
  const arrowColors = useEdgeArrowColors(images[idx]);
  const prev = () => setIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setIdx(i => (i + 1) % images.length);

  return (
    <div className="relative w-full overflow-hidden" style={{ aspectRatio: '0.66' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={images[idx]} alt="" className="h-full w-full object-cover" onError={e => { e.currentTarget.style.visibility = 'hidden'; }} onLoad={e => { e.currentTarget.style.visibility = 'visible'; }} />

      <button
        className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center"
        onClick={prev}
      >
        <Chevron dir="left" color={arrowColors.left} />
      </button>
      <button
        className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center"
        onClick={next}
      >
        <Chevron dir="right" color={arrowColors.right} />
      </button>

      <div className="absolute bottom-3 left-0 right-0 flex flex-row justify-center gap-[6px]">
        {images.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}>
            <span
              className={`block h-[7px] w-[7px] rounded-[4px] ${i === idx ? 'bg-white' : 'bg-white/50'}`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Image Gallery (desktop) ─────────────────────────────────────────────────
function DesktopGallery({ images }: { images: string[] }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const arrowColors = useEdgeArrowColors(images[selectedIdx]);
  const containerW = 684;
  const previews = images.slice(0, 3);
  const thumbW =
    previews.length > 0 ? Math.floor((containerW - 4 * (previews.length - 1)) / previews.length) : containerW;

  return (
    <div style={{ width: containerW }}>
      <div className="mb-1 flex flex-row gap-1">
        {previews.map((uri, i) => (
          <button key={i} onClick={() => setSelectedIdx(i)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={uri}
              alt=""
              className={`object-cover ${selectedIdx === i ? 'outline outline-2 outline-primary' : ''}`}
              style={{ width: thumbW, height: 268 }}
            />
          </button>
        ))}
      </div>
      <div className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[selectedIdx]} alt="" className="object-cover" style={{ width: containerW, height: 1036 }} onError={e => { e.currentTarget.style.visibility = 'hidden'; }} onLoad={e => { e.currentTarget.style.visibility = 'visible'; }} />
        <button
          className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center"
          onClick={() => setSelectedIdx(i => (i - 1 + images.length) % images.length)}
        >
          <Chevron dir="left" color={arrowColors.left} />
        </button>
        <button
          className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center"
          onClick={() => setSelectedIdx(i => (i + 1) % images.length)}
        >
          <Chevron dir="right" color={arrowColors.right} />
        </button>
      </div>
    </div>
  );
}

// ─── About Dropdown ───────────────────────────────────────────────────────────
function AboutDropdown({
  productName,
  specs,
  bodySize,
  contentSize,
  contentLine,
}: {
  productName: string;
  specs: string[];
  bodySize: number;
  contentSize: number;
  contentLine: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button className="flex w-full flex-row items-center justify-between py-3" onClick={() => setOpen(o => !o)}>
        <span className="font-clash font-medium text-black" style={{ fontSize: bodySize }}>
          About your {productName}
        </span>
        <Chevron dir={open ? 'up' : 'down'} />
      </button>
      {open && (
        <div className="flex flex-col gap-1 pb-2">
          {specs.map(spec => (
            <span key={spec} className="font-dm text-black" style={{ fontSize: contentSize, lineHeight: `${contentLine}px` }}>
              • {spec}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Related Products Grid ────────────────────────────────────────────────────
function RelatedGrid({ isDesktop, excludeId }: { isDesktop: boolean; excludeId: string }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const router = useRouter();
  const width = useWindowWidth();
  const [related, setRelated] = useState<Item[]>([]);
  const [showSignInModal, setShowSignInModal] = useState(false);

  const handleWishlistPress = async (item: Item) => {
    const token = await getAccessToken();
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
  const contentWidth = isDesktop ? Math.min(width, 1280) - 64 * 2 : width - 16 * 2;
  const cardW = Math.floor((contentWidth - gapSize * (numCols - 1)) / numCols);

  if (related.length === 0) return null;

  return (
    <div className={isDesktop ? 'px-0 py-10' : 'px-4 py-6'}>
      <div className="mb-4 flex flex-row items-center justify-between">
        <span className={`font-clash font-medium text-olive ${isDesktop ? 'text-[24px]' : 'text-[20px]'}`}>
          Check this out
        </span>
        <button onClick={() => router.push('/drops')}>
          <span className="font-clash font-medium text-[16px] text-secondary">Shop all</span>
        </button>
      </div>
      <div className={`flex flex-row flex-wrap justify-start ${isDesktop ? 'gap-x-4 gap-y-6' : 'gap-2'}`}>
        {related.map(item => (
          <ProductCard
            key={item._id}
            brand={item.brandName}
            name={item.itemName}
            price={`${item.listingPrice} KWD`}
            imageUri={item.imageUrls?.[0]}
            cardWidth={cardW}
            onPress={() => router.push(`/product/${item._id}`)}
            onWishlistPress={() => handleWishlistPress(item)}
            isWishlisted={isInWishlist(item._id)}
          />
        ))}
      </div>
      <SignInPromptModal
        visible={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onSignIn={() => {
          setShowSignInModal(false);
          router.push('/sign-in');
        }}
      />
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const width = useWindowWidth();
  const isDesktop = useIsDesktop();
  const router = useRouter();
  const params = useParams<{ productId: string }>();
  const productId = params.productId;
  const [menuOpen, setMenuOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifyEmailError, setNotifyEmailError] = useState('');
  const [notifyEmailVerifying, setNotifyEmailVerifying] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addItem } = useCart();

  const handleWishlistPress = async (prod: WishlistItem) => {
    const token = await getAccessToken();
    if (!token) {
      setShowSignInModal(true);
      return;
    }
    toggleWishlist(prod);
  };

  useEffect(() => {
    if (!productId) { setLoading(false); return; }
    fetchItemById(productId)
      .then(setItem)
      .catch(e => console.error('ProductDetailPage fetch error:', e))
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

  const completeNotifySignup = async () => {
    setShowOtpModal(false);
    try {
      await submitNotifyRequest(notifyEmail.trim(), { _id: item!._id, itemName: item!.itemName, brandName: item!.brandName });
      setNotifySuccess(true);
      setNotifyEmail('');
    } catch (error: any) {
      setNotifyEmailError(error?.message || 'Something went wrong. Please try again.');
    } finally {
      setNotifyEmailVerifying(false);
    }
  };

  const handleNotifySubmit = async () => {
    if (!isValidEmail(notifyEmail)) {
      setNotifyEmailError('Please enter a valid email address.');
      return;
    }

    setNotifyEmailVerifying(true);
    setNotifyEmailError('');

    try {
      // Emails that verified once (any flow) skip the OTP entirely
      const { alreadyVerified } = await requestEmailOtp(notifyEmail.trim());
      if (alreadyVerified) {
        await completeNotifySignup();
        return;
      }
      setShowOtpModal(true);
    } catch (error: any) {
      setNotifyEmailError(error?.message || 'Something went wrong. Please try again.');
      setNotifyEmailVerifying(false);
    }
  };

  const bodySize = isDesktop ? 24 : 16;
  const contentSize = 16;
  const contentLine = isDesktop ? 24 : 22;

  if (loading) {
    return (
      <PageLayout header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}>
        {isDesktop ? (
          <MaxWidthContainer className="px-16">
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
        <span className="block p-8 font-clash font-medium text-primary">Item not found.</span>
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
  const productItem: WishlistItem = { id: item._id, brand: item.brandName, sub: item.itemName, price: `${item.listingPrice} KWD`, imageUri: item.imageUrls?.[0] };
  const inWishlist = isInWishlist(item._id);

  const infoBlock = (
    <div>
      <h1 className="font-clash font-medium text-[32px] leading-10 text-black">{item.itemName.toUpperCase()}</h1>
      <div className="font-clash font-semibold text-[20px] text-secondary">{item.listingPrice} KWD</div>
      <div className="font-clash font-medium text-[16px] text-black">{item.brandName}</div>
      {item.year ? <div className="font-clash text-[16px] text-black">{item.year}</div> : null}
    </div>
  );

  const ctaRow = (
    <div className="flex h-[75px] flex-row">
      {!isSold && (
        <button
          className="flex w-[75px] items-center justify-center bg-lightGrey"
          onClick={() => handleWishlistPress(productItem)}
        >
          <HeartIcon size={28} color={inWishlist ? '#C5705D' : '#7A7060'} filled={inWishlist} />
        </button>
      )}
      {isSold ? (
        <div className="flex flex-1 items-center justify-center bg-[rgba(197,112,93,0.5)]">
          <span className="font-clash font-semibold text-[16px] text-white">SOLD</span>
        </div>
      ) : (
        <button className="flex flex-1 items-center justify-center bg-secondary" onClick={handleAddToCart}>
          <span className="font-clash font-semibold text-[20px] tracking-[1px] text-white">ADD TO CART</span>
        </button>
      )}
    </div>
  );

  const notifyBlock = isSold ? (
    <div className="mb-7 mt-7 flex flex-col gap-[14px]">
      <span className="text-justify font-dm font-medium text-black" style={{ fontSize: contentSize, lineHeight: `${contentLine}px` }}>
        Get notified when a similar piece is launched! Sign up and be the first to hear about our next drop:
      </span>
      {notifySuccess ? (
        <span className="font-dm font-medium text-secondary" style={{ fontSize: contentSize }}>
          You&apos;re on the list!
        </span>
      ) : (
        <div>
          <div className={`flex h-[50px] flex-row overflow-hidden ${notifyEmailError ? 'bg-[rgba(185,64,64,0.1)]' : 'bg-lightGrey'}`}>
            <input
              className="min-w-0 flex-1 bg-transparent px-3 font-clash font-medium text-[16px] text-black outline-none placeholder:text-muted"
              placeholder="your@email.com"
              value={notifyEmail}
              onChange={e => { setNotifyEmail(e.target.value); if (notifyEmailError) setNotifyEmailError(''); }}
              type="email"
            />
            <button
              className={`flex w-[104px] items-center justify-center bg-secondary ${notifyEmailVerifying ? 'opacity-60' : ''}`}
              onClick={handleNotifySubmit}
              disabled={notifyEmailVerifying}
            >
              <span className="font-clash font-medium text-[16px] text-white">
                {notifyEmailVerifying ? 'VERIFYING...' : 'SIGN UP'}
              </span>
            </button>
          </div>
          {!!notifyEmailError && <span className="mt-[6px] block font-dm text-[13px] text-error">{notifyEmailError}</span>}
        </div>
      )}
      <VerifyEmailModal
        visible={showOtpModal}
        email={notifyEmail.trim()}
        onClose={() => { setShowOtpModal(false); setNotifyEmailVerifying(false); }}
        onVerified={completeNotifySignup}
      />
    </div>
  ) : null;

  const deliveryBlock = (
    <>
      <span className="mb-1 mt-2 block font-clash font-medium text-black" style={{ fontSize: bodySize }}>
        Delivery &amp; Returns
      </span>
      <span className="block text-justify font-dm text-black" style={{ fontSize: contentSize, lineHeight: `${contentLine}px` }}>
        Delivered across Kuwait, or collect in person. If it&apos;s not quite right, you have 14 days from delivery to
        request a return &mdash; see our{' '}
        <a href="/returns" target="_blank" rel="noreferrer" className="underline">
          Returns Policy
        </a>
        .
      </span>
    </>
  );

  if (isDesktop) {
    return (
      <PageLayout
        menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
        overlay={toastVisible ? <Toast message="Added to cart!" /> : undefined}
        header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
      >
        <MaxWidthContainer className="px-16">
          <div className="flex flex-row items-start">
            <DesktopGallery images={item.imageUrls} />
            <div className="flex flex-1 flex-col gap-4 py-12 pl-12">
              {infoBlock}
              {ctaRow}
              <AboutDropdown productName={productName} specs={specs} bodySize={bodySize} contentSize={contentSize} contentLine={contentLine} />
              {notifyBlock}
              <span className="mb-1 mt-2 block font-clash font-medium text-[24px] text-black">Delivery &amp; Returns</span>
              <span className="block text-justify font-dm text-black" style={{ fontSize: contentSize, lineHeight: `${contentLine}px` }}>
                Delivered across Kuwait, or collect in person. If it&apos;s not quite right, you have 14 days from
                delivery to request a return &mdash; see our{' '}
                <a href="/returns" target="_blank" rel="noreferrer" className="underline">
                  Returns Policy
                </a>
                .
              </span>
            </div>
          </div>
          <RelatedGrid isDesktop={isDesktop} excludeId={item._id} />
        </MaxWidthContainer>
        <SignInPromptModal
          visible={showSignInModal}
          onClose={() => setShowSignInModal(false)}
          onSignIn={() => {
            setShowSignInModal(false);
            router.push('/sign-in');
          }}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      overlay={toastVisible ? <Toast message="Added to cart!" /> : undefined}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      <div className="flex flex-col gap-[14px] px-4 pt-6">
        {infoBlock}
        <MobileCarousel images={item.imageUrls} />
        {ctaRow}
        <AboutDropdown productName={productName} specs={specs} bodySize={bodySize} contentSize={contentSize} contentLine={contentLine} />
        {notifyBlock}
        {deliveryBlock}
      </div>
      <RelatedGrid isDesktop={false} excludeId={item._id} />
      <SignInPromptModal
        visible={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onSignIn={() => {
          setShowSignInModal(false);
          router.push('/sign-in');
        }}
      />
    </PageLayout>
  );
}
