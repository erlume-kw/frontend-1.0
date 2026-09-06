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
import LoadMoreFooter from '@/components/ui/LoadMoreFooter';
import { useIsDesktop } from '@/lib/useIsDesktop';
import { useWindowWidth } from '@/lib/useWindowWidth';
import { usePaginatedItems } from '@/lib/usePaginatedItems';
import { fetchItemsPage } from '@/services/api';

// Same card-width math as the drop detail page, so the grid matches exactly.
function useCardWidth(isDesktop: boolean, viewportWidth: number) {
  const numCols = isDesktop ? 4 : 2;
  const gapSize = isDesktop ? 16 : 8;
  const contentWidth = isDesktop
    ? Math.min(viewportWidth, 1280) - 64 * 2
    : viewportWidth - 16 * 2;
  return Math.floor((contentWidth - gapSize * (numCols - 1)) / numCols);
}

const PAGE_SIZE = 20;

export default function NewArrivalsPage() {
  const width = useWindowWidth();
  const isDesktop = useIsDesktop();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  // Newest-in-stock first — /api/items already sorts by createdAt descending.
  const { items, totalCount, loading, loadingMore, hasMore, loadMore, refresh } = usePaginatedItems(
    (limit) => fetchItemsPage({ itemStatus: 'available' }, limit),
    PAGE_SIZE,
    [],
  );

  // Re-fetch whenever the user navigates back to this tab, same as the drop
  // detail page, so the grid reflects the latest inventory.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [refresh]);

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
            LOOK WHAT WE JUST FOUND
          </h1>
        </div>

        {!loading && items.length === 0 ? (
          <div
            className="py-20 text-center font-clash font-medium text-primary"
            style={{ fontSize: isDesktop ? 22 : 18 }}
          >
            Nothing new just yet — check back soon.
          </div>
        ) : (
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
        )}
      </MaxWidthContainer>
    </PageLayout>
  );
}
