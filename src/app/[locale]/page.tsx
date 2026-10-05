'use client';

import { useNumerals } from '@/lib/useNumerals';
import { useLocale, useTranslations } from 'next-intl';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useWishlist } from '@/contexts/WishlistContext';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import ProductCard from '@/components/ui/ProductCard';
import ScrollRow from '@/components/ui/ScrollRow';
import { useDropText, useBannerText } from '@/lib/useDropText';
import { useMoney } from '@/lib/useMoney';
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

/** The upcoming drop releasing soonest (release date still in the future), if any. */
function nextUpcomingDrop(drops: Drop[]): Drop | null {
  const now = Date.now();
  return (
    drops
      .filter(d => {
        const t = new Date(d.releaseDate).getTime();
        return !Number.isNaN(t) && t > now;
      })
      .sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime())[0] ?? null
  );
}

function getTimeRemaining(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
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

function CountdownHero({ isDesktop, target }: { isDesktop: boolean; target: Date }) {
  const t = useTranslations('Home');
  const num = useNumerals();
  const { days, hours, minutes, seconds } = useCountdown(target);
  const pad = (n: number) => num(String(n).padStart(2, '0'));
  const labelSize = isDesktop ? 60 : 20;
  const numSize = isDesktop ? 150 : 60;
  const lineHeight = isDesktop ? '120px' : '56px';
  const heroHeight = isDesktop ? 680 : 388;
  // Spacing between "NEXT DROP IN" label and the first countdown row
  const labelSpacing = isDesktop ? 12 : 6;

  return (
    <div
      className="flex flex-col items-center justify-center overflow-hidden bg-[rgba(56,69,45,0.2)]"
      style={{ height: heroHeight }}
    >
      <span
        className="text-center font-clash font-medium text-black"
        style={{ fontSize: labelSize, marginBottom: labelSpacing }}
      >
        {t('nextDrop')}
      </span>
      {[
        { num: pad(days), label: t('days') },
        { num: pad(hours), label: t('hours') },
        { num: pad(minutes), label: t('mins') },
        { num: pad(seconds), label: t('secs') },
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
  const { bannerDescription, bannerCtaLabel } = useBannerText();
  // "left" / "right" is where the text sits on the picture, so it is a physical side. On Arabic
  // pages the layout is mirrored, so flip it to keep the text on the same side of the image.
  const isRtl = useLocale() === 'ar';
  const alignLeft = (banner.contentAlign === 'left') !== isRtl;

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
      <div
        className={`absolute inset-0 flex flex-col justify-end bg-black/50 p-8 ${
          alignLeft ? 'items-start' : 'items-end'
        }`}
      >
        {!!bannerDescription(banner) && (
          <span
            className={`mb-2 font-clash font-light text-white ${
              alignLeft ? 'text-start' : 'text-end'
            } ${isDesktop ? 'text-[24px]' : 'text-[16px]'}`}
          >
            {bannerDescription(banner)}
          </span>
        )}
        {banner.showCta && !!bannerCtaLabel(banner) && (
          <button type="button" onClick={() => onCta(banner.ctaUrl)}>
            <span
              className={`font-clash text-white underline ${
                alignLeft ? 'text-start' : 'text-end'
              } ${isDesktop ? 'text-[24px]' : 'text-[20px]'}`}
            >
              {bannerCtaLabel(banner)}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { dropName } = useDropText();
  const t = useTranslations('Home');
  const money = useMoney();
  const width = useWindowWidth();
  const isDesktop = useIsDesktop();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [activeDrop, setActiveDrop] = useState<Drop | null>(null);
  // Drives the "Next drop in" countdown — hidden when no upcoming drop is scheduled.
  const [nextDrop, setNextDrop] = useState<Drop | null>(null);
  const nextDropDate = useMemo(() => (nextDrop ? new Date(nextDrop.releaseDate) : null), [nextDrop]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    (async () => {
      try {
        const [drops, homeBanners, upcomingDrops] = await Promise.all([
          fetchDrops('active'),
          fetchBanners().catch(e => {
            console.error('HomePage banners fetch error:', e);
            return [] as Banner[];
          }),
          fetchDrops('upcoming').catch(e => {
            console.error('HomePage upcoming drops fetch error:', e);
            return [] as Drop[];
          }),
        ]);
        setBanners(homeBanners);
        setNextDrop(nextUpcomingDrop(upcomingDrops));
        const drop = drops[0] ?? null;
        setActiveDrop(drop);
        if (drop) {
          const dropItems = await fetchDropItems(drop._id);
          // Keep sold bags in the strip (greyed on the card); hide other non-shop statuses
          setItems(
            dropItems
              .filter(i => i.itemStatus === 'available' || i.itemStatus === 'sold')
              .slice(0, 6),
          );
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

  // Restore the scroll position once, after the page's content has rendered — so
  // coming back from a product (via the app's back nav) lands where the shopper
  // left off instead of resetting to the top.
  const scrollRestored = useRef(false);
  useEffect(() => {
    if (loading || scrollRestored.current) return;
    scrollRestored.current = true;
    try {
      const y = sessionStorage.getItem('scroll:home');
      if (y) {
        sessionStorage.removeItem('scroll:home');
        // Called directly (not via requestAnimationFrame) — the items are already in
        // this same render, so layout is ready, and rAF never fires for a tab that's
        // restored while backgrounded/hidden, which would silently drop the restore.
        window.scrollTo(0, Number(y));
      }
    } catch { /* storage blocked */ }
  }, [loading]);

  // Opening a product saves where the shopper was, so Back returns them there.
  const openProduct = (id: string) => {
    try { sessionStorage.setItem('scroll:home', String(window.scrollY)); } catch { /* storage blocked */ }
    router.push(`/product/${id}`);
  };

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
      {nextDropDate && <CountdownHero isDesktop={isDesktop} target={nextDropDate} />}

      {/* Shop previous drops link */}
      <div className="flex flex-col items-center bg-white py-5">
        <MaxWidthContainer className="flex flex-col items-center">
          <button onClick={() => router.push('/drops')}>
            <span
              className={`text-center font-clash font-medium text-olive underline ${isDesktop ? 'text-[20px]' : 'text-[14px]'}`}
            >
              {t('previousDrops')}
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
            {activeDrop ? dropName(activeDrop) : t('latestDrop')}
          </span>
          <button onClick={() => router.push('/drops')}>
            <span className="font-clash font-medium text-secondary text-[16px]">
              {t('shopAll')}
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
          <ScrollRow className="flex flex-row gap-4 pb-1">
            {items.map(item => (
              <div key={item._id} className="shrink-0">
                <ProductCard
                  brand={item.brandName}
                  name={item.itemName}
                  price={money(item.listingPrice)}
                  imageUri={item.imageUrls?.[0]}
                  sold={item.itemStatus === 'sold'}
                  isWishlisted={isInWishlist(item._id)}
                  onWishlistPress={
                    item.itemStatus === 'sold'
                      ? undefined
                      : () =>
                          toggleWishlist({
                            id: item._id,
                            brand: item.brandName,
                            sub: item.itemName,
                            price: `${item.listingPrice} KWD`,
                            imageUri: item.imageUrls?.[0],
                          })
                  }
                  onPress={() => openProduct(item._id)}
                />
              </div>
            ))}
          </ScrollRow>
        ) : (
          <div className="flex flex-row flex-wrap justify-start gap-2">
            {items.map(item => (
              <ProductCard
                key={item._id}
                brand={item.brandName}
                name={item.itemName}
                price={money(item.listingPrice)}
                imageUri={item.imageUrls?.[0]}
                cardWidth={cardW}
                sold={item.itemStatus === 'sold'}
                onPress={() => openProduct(item._id)}
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
