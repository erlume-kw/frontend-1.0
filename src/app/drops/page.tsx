'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import { SkeletonDropCard } from '@/components/ui/Skeleton';
import { useIsDesktop } from '@/lib/useIsDesktop';
import { fetchDrops, type Drop } from '@/services/api';

/** Meteorological season from release month + calendar year. */
function seasonLabelFromReleaseDate(releaseDate: string): string | null {
  const date = new Date(releaseDate);
  if (isNaN(date.getTime())) return null;
  const month = date.getMonth(); // 0–11
  const year = date.getFullYear();
  let season: string;
  if (month >= 2 && month <= 4) season = 'spring';
  else if (month >= 5 && month <= 7) season = 'summer';
  else if (month >= 8 && month <= 10) season = 'fall';
  else season = 'winter';
  return `${season} ${year}`.toUpperCase();
}

export default function AllDropsPage() {
  const isDesktop = useIsDesktop();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrops()
      // Hidden drops never appear on the storefront, here or on their own page.
      .then(data => setDrops(data.filter(drop => drop.status !== 'hidden')))
      .catch(e => console.error('AllDropsPage fetch error:', e))
      .finally(() => setLoading(false));
  }, []);

  const titleSize = isDesktop ? 56 : 32;
  const seasonSize = isDesktop ? 20 : 14;

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      <div
        className={`flex flex-1 flex-col ${isDesktop ? 'gap-[14px]' : 'gap-0'}`}
      >
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonDropCard key={i} height={202} />)
          : drops.map(drop => {
              // Upcoming drops read as "not live yet": a heavier scrim and
              // dimmer text set them apart from active/ended drops.
              const isUpcoming = drop.status === 'upcoming';
              const overlayClass = isUpcoming ? 'bg-black/70' : 'bg-black/50';
              const textClass = isUpcoming ? 'text-white/60' : 'text-white';
              const seasonLabel = seasonLabelFromReleaseDate(drop.releaseDate);
              return (
                <button
                  key={drop._id}
                  className="relative min-h-[202px] w-full flex-1 overflow-hidden"
                  onClick={() =>
                    router.push(`/drops/${encodeURIComponent(drop.name)}?dropId=${drop._id}`)
                  }
                >
                  {drop.bannerImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={drop.bannerImageUrl}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-placeholder" />
                  )}
                  {/* Image/overlay stay full-bleed; text aligns with header/footer content width. */}
                  <div className={`absolute inset-0 ${overlayClass}`}>
                    <MaxWidthContainer
                      className={`flex h-full flex-col justify-between ${isDesktop ? 'px-16 py-5' : 'p-5'}`}
                    >
                      <div className="flex justify-end">
                        {seasonLabel && (
                          <span
                            className={`font-clash font-medium ${textClass}`}
                            style={{ fontSize: seasonSize }}
                          >
                            {seasonLabel}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-left font-clash font-medium ${textClass}`}
                        style={{ fontSize: titleSize }}
                      >
                        {drop.name.toUpperCase()}
                      </span>
                    </MaxWidthContainer>
                  </div>
                </button>
              );
            })}
      </div>
    </PageLayout>
  );
}
