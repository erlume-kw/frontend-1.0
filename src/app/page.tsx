'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWishlist } from '@/contexts/WishlistContext';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import ProductCard from '@/components/ui/ProductCard';
import { SkeletonProductCard } from '@/components/ui/Skeleton';
import { useIsDesktop } from '@/lib/useIsDesktop';
import { useWindowWidth } from '@/lib/useWindowWidth';
import {
  fetchDrops,
  fetchDropItems,
  fetchItems,
  fetchBanners,
  type Drop,
  type Item,
  type Banner,
} from '@/services/api';

// Update to real drop date/time (UTC)
const DROP_DATE = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000 + 1 * 60 * 1000);

function getTimeRemaining(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
  };
}

function useCountdown(target: Date) {
  const [remaining, setRemaining] = useState(() => getTimeRemaining(target));
  useEffect(() => {
    const id = setInterval(() => setRemaining(getTimeRemaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);
  return remaining;
}

function CountdownHero({ isDesktop }: { isDesktop: boolean }) {
  const { days, hours, minutes } = useCountdown(DROP_DATE);
  const pad = (n: number) => String(n).padStart(2, '0');
  const labelSize = isDesktop ? 60 : 20;
  const numSize = isDesktop ? 150 : 60;
  const lineHeight = isDesktop ? '120px' : '56px';
  const heroHeight = isDesktop ? 895 : 348;
  // Spacing between "NEXT DROP IN" label and the first countdown row
  const labelSpacing = isDesktop ? 40 : 16;

  return (
    <div
      className="flex flex-col items-center justify-center overflow-hidden bg-[rgba(56,69,45,0.2)]"
      style={{ height: heroHeight }}
    >
      <span
        className="text-center font-clash font-medium text-black"
        style={{ fontSize: labelSize, marginBottom: labelSpacing }}
      >
        NEXT DROP IN
      </span>
      {[
        { num: pad(days), label: ' DAYS' },
        { num: pad(hours), label: ' HOURS' },
        { num: pad(minutes), label: ' MINS' },
      ].map(({ num, label }) => (
        <div key={label} className="flex flex-row items-baseline">
          <span className="font-clash font-semibold text-black" style={{ fontSize: numSize, lineHeight }}>
            {num}
          </span>
          <span className="whitespace-pre font-clash font-medium text-black" style={{ fontSize: numSize, lineHeight }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

function HomeBanner({
  banner,
  isDesktop,
  onCta,
}: {
  banner: Banner;
  isDesktop: boolean;
  onCta: (url: string) => void;
}) {
  return (
    <div
      className="relative w-full overflow-hidden bg-[#FBF1DF]"
      style={{ height: isDesktop ? 634 : 437 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={banner.imageUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        onError={e => { e.currentTarget.style.display = 'none'; }}
      />
      <div className="absolute inset-0 flex flex-col items-end justify-end bg-black/50 p-8">
        {!!banner.description && (
          <span
            className={`mb-2 text-right font-clash font-light text-white ${isDesktop ? 'text-[24px]' : 'text-[16px]'}`}
          >
            {banner.description}
          </span>
        )}
        {banner.showCta && !!banner.ctaLabel && (
          <button type="button" onClick={() => onCta(banner.ctaUrl)}>
            <span
              className={`text-right font-clash text-white underline ${isDesktop ? 'text-[24px]' : 'text-[20px]'}`}
            >
              {banner.ctaLabel}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const width = useWindowWidth();
  const isDesktop = useIsDesktop();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [activeDrop, setActiveDrop] = useState<Drop | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    (async () => {
      try {
        const [drops, homeBanners] = await Promise.all([
          fetchDrops('active'),
          fetchBanners().catch(e => {
            console.error('HomePage banners fetch error:', e);
            return [] as Banner[];
          }),
        ]);
        setBanners(homeBanners);
        const drop = drops[0] ?? null;
        setActiveDrop(drop);
        if (drop) {
          const dropItems = await fetchDropItems(drop._id);
          // Sold/reserved items never appear on the shop surfaces
          setItems(dropItems.filter(i => i.itemStatus === 'available').slice(0, 6));
        } else {
          const fallback = await fetchItems({ itemStatus: 'available', limit: '6' });
          setItems(fallback);
        }
      } catch (e) {
        console.error('HomePage fetch error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleBannerCta = (url: string) => {
    if (!url) return;
    if (/^https?:\/\//i.test(url)) {
      window.location.href = url;
      return;
    }
    router.push(url.startsWith('/') ? url : `/${url}`);
  };

  const numCols = isDesktop ? 4 : 2;
  const gapSize = isDesktop ? 16 : 8;
  const contentWidth = isDesktop ? Math.min(width, 1280) - 64 * 2 : width - 16 * 2;
  const cardW = Math.floor((contentWidth - gapSize * (numCols - 1)) / numCols);

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      {/* Countdown banner */}
      <CountdownHero isDesktop={isDesktop} />

      {/* Shop previous drops link */}
      <div className="flex flex-col items-center bg-white py-5">
        <MaxWidthContainer className="flex flex-col items-center">
          <button onClick={() => router.push('/drops')}>
            <span
              className={`text-center font-clash font-medium text-olive underline ${isDesktop ? 'text-[20px]' : 'text-[14px]'}`}
            >
              SHOP PREVIOUS DROPS HERE
            </span>
          </button>
        </MaxWidthContainer>
      </div>

      {/* Our Latest Drop — shown on both mobile and desktop */}
      <MaxWidthContainer
        className={`bg-white ${isDesktop ? 'px-16 pb-8 pt-6' : 'px-4 pb-6 pt-5'}`}
      >
        <div className="mb-4 flex flex-row items-center justify-between">
          <span className={`font-clash font-medium text-olive ${isDesktop ? 'text-[32px]' : 'text-[24px]'}`}>
            {activeDrop ? activeDrop.name : 'Our Latest Drop'}
          </span>
          <button onClick={() => router.push('/drops')}>
            <span className="font-clash font-medium text-secondary text-[16px]">
              Shop all
            </span>
          </button>
        </div>

        {loading ? (
          isDesktop ? (
            <div className="flex flex-row gap-4 overflow-x-auto pb-1 [scrollbar-width:none]">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="shrink-0">
                  <SkeletonProductCard width={255} height={340} isDesktop />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-row flex-wrap justify-start gap-2">
              {Array.from({ length: 6 }).map((_, i) => {
                const h = Math.round(340 * (cardW / 255));
                return <SkeletonProductCard key={i} width={cardW} height={h} />;
              })}
            </div>
          )
        ) : isDesktop ? (
          <div className="flex flex-row gap-4 overflow-x-auto pb-1 [scrollbar-width:none]">
            {items.map(item => (
              <div key={item._id} className="shrink-0">
                <ProductCard
                  brand={item.brandName}
                  name={item.itemName}
                  price={`${item.listingPrice} KWD`}
                  imageUri={item.imageUrls?.[0]}
                  isWishlisted={isInWishlist(item._id)}
                  onWishlistPress={() => toggleWishlist({ id: item._id, brand: item.brandName, sub: item.itemName, price: `${item.listingPrice} KWD`, imageUri: item.imageUrls?.[0] })}
                  onPress={() => router.push(`/product/${item._id}`)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-row flex-wrap justify-start gap-2">
            {items.map(item => (
              <ProductCard
                key={item._id}
                brand={item.brandName}
                name={item.itemName}
                price={`${item.listingPrice} KWD`}
                imageUri={item.imageUrls?.[0]}
                cardWidth={cardW}
                onPress={() => router.push(`/product/${item._id}`)}
              />
            ))}
          </div>
        )}
      </MaxWidthContainer>

      {/* CMS homepage banners (ordered) */}
      {banners.map(banner => (
        <HomeBanner
          key={banner._id}
          banner={banner}
          isDesktop={isDesktop}
          onCta={handleBannerCta}
        />
      ))}
    </PageLayout>
  );
}
