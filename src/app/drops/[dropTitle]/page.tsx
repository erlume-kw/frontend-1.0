'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useWishlist } from '@/contexts/WishlistContext';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import ProductCard from '@/components/ui/ProductCard';
import { SkeletonProductCard } from '@/components/ui/Skeleton';
import { useIsDesktop } from '@/lib/useIsDesktop';
import { useWindowWidth } from '@/lib/useWindowWidth';
import { fetchDropById, fetchDropItems, type Drop, type Item } from '@/services/api';

function useCardWidth(isDesktop: boolean, viewportWidth: number) {
  const numCols = isDesktop ? 4 : 2;
  const gapSize = isDesktop ? 16 : 8;
  const contentWidth = isDesktop
    ? Math.min(viewportWidth, 1280) - 64 * 2
    : viewportWidth - 16 * 2;
  return Math.floor((contentWidth - gapSize * (numCols - 1)) / numCols);
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
  const [loading, setLoading] = useState(true);

  const refreshItems = useCallback(() => {
    if (!dropId) return;
    fetchDropItems(dropId)
      .then(i => setItems(i.filter(item => item.itemStatus === 'available')))
      .catch(e => console.error('DropDetailPage refetch error:', e));
  }, [dropId]);

  useEffect(() => {
    if (!dropId) { setLoading(false); return; }
    Promise.all([fetchDropById(dropId), fetchDropItems(dropId)])
      // Only items still on sale appear in the shop — sold/reserved ones drop out
      .then(([d, i]) => { setDrop(d); setItems(i.filter(item => item.itemStatus === 'available')); })
      .catch(e => console.error('DropDetailPage fetch error:', e))
      .finally(() => setLoading(false));
  }, [dropId]);

  // Re-fetch available items whenever the user navigates back to this tab so
  // the grid reflects the latest inventory (e.g. after removing from cart or
  // after another buyer purchases an item).
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refreshItems();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [refreshItems]);

  const cardWidth = useCardWidth(isDesktop, width);
  const { toggleWishlist, isInWishlist } = useWishlist();

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      <MaxWidthContainer className={isDesktop ? 'px-16' : ''}>
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
              style={isDesktop ? { fontSize: 24, lineHeight: '32px' } : { fontSize: 16, lineHeight: '22px' }}
            >
              {drop.description}
            </p>
          ) : null}
        </div>

        {/* A drop's items are only visible while it is live. Upcoming and ended
            drops show a status message instead of the grid. */}
        {!loading && drop && drop.status !== 'active' ? (
          <div
            className="py-20 text-center font-clash font-medium text-primary"
            style={{ fontSize: isDesktop ? 22 : 18 }}
          >
            {drop.status === 'upcoming'
              ? 'This drop isn’t live yet — check back soon.'
              : 'This drop has ended.'}
          </div>
        ) : (
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
              : items.map(item => (
                  <ProductCard
                    key={item._id}
                    brand={item.brandName}
                    name={item.itemName}
                    price={`${item.listingPrice} KWD`}
                    imageUri={item.imageUrls?.[0]}
                    cardWidth={cardWidth}
                    isWishlisted={isInWishlist(item._id)}
                    onWishlistPress={() => toggleWishlist({ id: item._id, brand: item.brandName, sub: item.itemName, price: `${item.listingPrice} KWD`, imageUri: item.imageUrls?.[0] })}
                    onPress={() => router.push(`/product/${item._id}`)}
                  />
                ))}
          </div>
        )}
      </MaxWidthContainer>
    </PageLayout>
  );
}
