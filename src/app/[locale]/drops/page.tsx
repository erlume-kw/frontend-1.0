'use client';

import { useNumerals } from '@/lib/useNumerals';
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import { SkeletonDropCard } from '@/components/ui/Skeleton';
import { useIsDesktop } from '@/lib/useIsDesktop';
import { fetchDrops, type Drop } from '@/services/api';
import { useDropText } from '@/lib/useDropText';

type Season = 'spring' | 'summer' | 'fall' | 'winter';

/** Meteorological season from release month + calendar year. */
function seasonFromReleaseDate(releaseDate: string): { season: Season; year: number } | null {
  const date = new Date(releaseDate);
  if (isNaN(date.getTime())) return null;
  const month = date.getMonth(); // 0–11
  const year = date.getFullYear();
  let season: Season;
  if (month >= 2 && month <= 4) season = 'spring';
  else if (month >= 5 && month <= 7) season = 'summer';
  else if (month >= 8 && month <= 10) season = 'fall';
  else season = 'winter';
  return { season, year };
}

export default function AllDropsPage() {
  const isDesktop = useIsDesktop();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations('Drops');
  const { dropName } = useDropText();
  const num = useNumerals();
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrops()
      // Only active and upcoming drops are public; hidden and ended ones never appear.
      .then(data => setDrops(data.filter(drop => drop.status === 'active' || drop.status === 'upcoming')))
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
              // "FALL 2025" in English, "خريف 2025" in Arabic; the drop's own name is left as entered
              const parts = seasonFromReleaseDate(drop.releaseDate);
              const seasonLabel = parts
                ? t('seasonLabel', { season: t(`seasons.${parts.season}`), year: num(parts.year) }).toUpperCase()
                : null;
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
                        className={`text-start font-clash font-medium ${textClass}`}
                        style={{ fontSize: titleSize }}
                      >
                        {dropName(drop).toUpperCase()}
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
