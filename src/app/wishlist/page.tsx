'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import ProductCard from '@/components/ui/ProductCard';
import { useWishlist } from '@/contexts/WishlistContext';
import { useIsDesktop } from '@/lib/useIsDesktop';
import { useWindowWidth } from '@/lib/useWindowWidth';

const RELATED_IMG = 'https://www.figma.com/api/mcp/asset/7413ba79-30a9-4e7a-9c54-18d8647a3678';

export default function WishlistPage() {
  const width = useWindowWidth();
  const isDesktop = useIsDesktop();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const { items, toggleWishlist } = useWishlist();

  // Row-filling card widths (same formula as the drop page)
  const numCols = isDesktop ? 4 : 2;
  const gapSize = isDesktop ? 16 : 8;
  const contentWidth = isDesktop ? Math.min(width, 1280) - 64 * 2 : width - 16 * 2;
  const cardW = Math.floor((contentWidth - gapSize * (numCols - 1)) / numCols);

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      <MaxWidthContainer className={isDesktop ? 'px-16' : ''}>
        <div className="flex flex-row items-baseline gap-3 px-4 pb-4 pt-8">
          <span className={`font-clash font-medium text-black ${isDesktop ? 'text-[40px]' : 'text-[28px]'}`}>
            WISHLIST
          </span>
          {items.length > 0 && (
            <span className="font-dm text-[14px] text-muted">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 p-8">
            <span className="text-center font-clash font-medium text-[24px] text-primary">
              Your wishlist is empty
            </span>
            <span className="text-center font-dm text-[16px] text-muted">
              Save items you love and come back to them later.
            </span>
            <button
              className="mt-4 flex h-[50px] items-center justify-center bg-primary px-8"
              onClick={() => router.push('/drops')}
            >
              <span className="font-dm font-medium text-[14px] uppercase tracking-[1.4px] text-white">
                BROWSE DROPS
              </span>
            </button>
          </div>
        ) : (
          <div
            className={`flex flex-row flex-wrap justify-start ${
              isDesktop ? 'gap-x-4 gap-y-6 px-0' : 'gap-2 px-4 py-3'
            }`}
          >
            {items.map(item => (
              <ProductCard
                key={item.id}
                brand={item.brand}
                name={item.sub}
                price={item.price}
                imageUri={item.imageUri ?? RELATED_IMG}
                cardWidth={cardW}
                isWishlisted
                onPress={() => router.push(`/product/${item.id}`)}
                onWishlistPress={() => toggleWishlist(item)}
              />
            ))}
          </div>
        )}
      </MaxWidthContainer>
    </PageLayout>
  );
}
