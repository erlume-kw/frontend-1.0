'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import { SkeletonDropCard } from '@/components/ui/Skeleton';
import { useIsDesktop } from '@/lib/useIsDesktop';
import { fetchDrops, type Drop } from '@/services/api';

export default function AllDropsPage() {
  const isDesktop = useIsDesktop();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrops()
      .then(setDrops)
      .catch(e => console.error('AllDropsPage fetch error:', e))
      .finally(() => setLoading(false));
  }, []);

  const cardH = 202;
  const titleSize = isDesktop ? 56 : 32;
  const subtitleSize = isDesktop ? 24 : 20;

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      <div className={`flex flex-col ${isDesktop ? 'gap-[14px]' : 'gap-0'}`}>
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonDropCard key={i} height={202} />)
          : drops.map(drop => (
              <button
                key={drop._id}
                className="relative w-full overflow-hidden"
                style={{ height: cardH }}
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
                <div className="absolute inset-0 flex flex-col items-start justify-end bg-black/50 p-5">
                  <span className="font-clash font-medium text-white" style={{ fontSize: titleSize }}>
                    {drop.name.toUpperCase()}
                  </span>
                  {drop.description ? (
                    <span className="mt-1 font-clash font-medium text-white" style={{ fontSize: subtitleSize }}>
                      {drop.description}
                    </span>
                  ) : null}
                </div>
              </button>
            ))}
      </div>
    </PageLayout>
  );
}
