'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useWishlist } from '@/contexts/WishlistContext';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import ProductCard from '@/components/ui/ProductCard';
import { SkeletonProductCard } from '@/components/ui/Skeleton';
import LoadMoreFooter from '@/components/ui/LoadMoreFooter';
import { useIsDesktop } from '@/lib/useIsDesktop';
import { useWindowWidth } from '@/lib/useWindowWidth';
import { fetchDropById, fetchDropItemsPage, type Drop, type Item } from '@/services/api';

function useCardWidth(isDesktop: boolean, viewportWidth: number) {
  const numCols = isDesktop ? 4 : 2;
  const gapSize = isDesktop ? 16 : 8;
  const contentWidth = isDesktop
    ? Math.min(viewportWidth, 1280) - 64 * 2
    : viewportWidth - 16 * 2;
  return Math.floor((contentWidth - gapSize * (numCols - 1)) / numCols);
}

const PAGE_SIZE = 20;

// Active drops show what's still for sale plus sold pieces (greyed in the UI).
// Upcoming drops preview their (not-yet-purchasable) items instead — items
// added to an upcoming drop are always "pending" on the backend, never "available".
function statusFilterFor(drop: Drop | null): string {
  return drop?.status === 'upcoming' ? 'pending' : 'available,sold';
}

export default function DropDetailPage() {
  const width = useWindowWidth();
  const isDesktop = useIsDesktop();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const params = useParams<{ dropTitle: string }>();
  const searchParams = useSearchParams();
  const dropId = searchParams.get('dropId') ?? '';
  const dropTitleFallback = decodeURIComponent(params.dropTitle ?? 'Drop');

  const [drop, setDrop] = useState<Drop | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // How many items have been requested so far — "load more" just asks for
  // this plus one more page, from the same sorted endpoint, rather than
  // appending discrete pages (simpler, and avoids duplicate/missing items if
  // a fetch ever races).
  const loadedRef = useRef(PAGE_SIZE);

  // Drop details and the first page of its items load together — the item
  // fetch needs to know the drop's status (active vs upcoming) to ask for the
  // right itemStatus, so this can't be two independent effects without a
  // flash of "no items" while the drop is still resolving.
  useEffect(() => {
    if (!dropId) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    loadedRef.current = PAGE_SIZE;

    fetchDropById(dropId)
      .then(async (d) => {
        if (cancelled) return;
        setDrop(d);
        const { items: fetched, totalCount: tc } = await fetchDropItemsPage(dropId, statusFilterFor(d), PAGE_SIZE);
        if (cancelled) return;
        setItems(fetched);
        setTotalCount(tc);
        loadedRef.current = Math.max(PAGE_SIZE, fetched.length);
      })
      .catch(e => console.error('DropDetailPage fetch error:', e))
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [dropId]);

  const loadMore = useCallback(() => {
    if (!dropId || !drop) return;
    const nextLimit = loadedRef.current + PAGE_SIZE;
    setLoadingMore(true);
    fetchDropItemsPage(dropId, statusFilterFor(drop), nextLimit)
      .then(({ items: fetched, totalCount: tc }) => {
        setItems(fetched);
        setTotalCount(tc);
        loadedRef.current = Math.max(nextLimit, fetched.length);
      })
      .catch(e => console.error('DropDetailPage loadMore error:', e))
      .finally(() => setLoadingMore(false));
  }, [dropId, drop]);

  // Re-fetch the same range already loaded whenever the user navigates back
  // to this tab, so the grid reflects the latest inventory without losing
  // however much they'd already loaded.
  const refreshItems = useCallback(() => {
    if (!dropId || !drop) return;
    fetchDropItemsPage(dropId, statusFilterFor(drop), loadedRef.current)
      .then(({ items: fetched, totalCount: tc }) => { setItems(fetched); setTotalCount(tc); })
      .catch(e => console.error('DropDetailPage refetch error:', e));
  }, [dropId, drop]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refreshItems();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [refreshItems]);

  const cardWidth = useCardWidth(isDesktop, width);
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Only active and upcoming drops are public. Hidden/ended drops (and anything that
  // failed to load, e.g. a stale/bad link) read as a plain "not found" — no name, no
  // description, nothing revealed.
  const notFound = !loading && (!drop || (drop.status !== 'active' && drop.status !== 'upcoming'));
  const isUpcoming = drop?.status === 'upcoming';
  const hasMore = items.length < totalCount;

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      <MaxWidthContainer className={isDesktop ? 'px-16' : ''}>
        {notFound ? (
          <div
            className="py-20 text-center font-clash font-medium text-primary"
            style={{ fontSize: isDesktop ? 22 : 18 }}
          >
            Drop not found.
          </div>
        ) : (
          <>
            <div className={isDesktop ? 'pb-8 pt-12' : 'px-4 py-8'}>
              <h1
                className="mb-3 font-clash font-medium text-black"
                style={isDesktop ? { fontSize: 56, lineHeight: '52px' } : { fontSize: 50, lineHeight: '52px' }}
              >
                {drop ? drop.name.toUpperCase() : dropTitleFallback.toUpperCase()}
              </h1>
              {drop?.description ? (
                <p
                  className="text-justify font-clash font-medium text-black"
                  style={{ fontSize: 16, lineHeight: '24px' }}
                >
                  {drop.description}
                </p>
              ) : null}
            </div>

            {/* Active and upcoming drops both show items — upcoming ones dimmed and inert. */}
            <>
              <div
                className={`flex flex-row flex-wrap justify-start ${
                  isDesktop ? 'gap-x-4 gap-y-8 px-0' : 'gap-2 px-4'
                }`}
              >
                {loading
                  ? Array.from({ length: isDesktop ? 4 : 8 }).map((_, i) => {
                      const skeletonH = Math.round(340 * (cardWidth / 255));
                      return <SkeletonProductCard key={i} width={cardWidth} height={skeletonH} isDesktop={isDesktop} />;
                    })
                  : items.map(item => {
                      const isSold = item.itemStatus === 'sold';
                      return (
                      <ProductCard
                        key={item._id}
                        brand={item.brandName}
                        name={item.itemName}
                        price={`${item.listingPrice} KWD`}
                        imageUri={item.imageUrls?.[0]}
                        cardWidth={cardWidth}
                        disabled={isUpcoming}
                        sold={isSold}
                        isWishlisted={isInWishlist(item._id)}
                        onWishlistPress={
                          isUpcoming || isSold
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
                        onPress={isUpcoming ? undefined : () => router.push(`/product/${item._id}`)}
                      />
                      );
                    })}
              </div>

              {!loading && (
                <LoadMoreFooter
                  shown={items.length}
                  total={totalCount}
                  hasMore={hasMore}
                  loading={loadingMore}
                  onLoadMore={loadMore}
                  isDesktop={isDesktop}
                />
              )}
            </>
          </>
        )}
      </MaxWidthContainer>
    </PageLayout>
  );
}
