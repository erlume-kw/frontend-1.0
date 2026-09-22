import type { MetadataRoute } from 'next';
import { API_URL, SITE_URL } from '@/lib/config';

// The static, public content pages, listed once and mirrored across both languages (English
// has no /ar prefix, matching the site's actual URLs). Account/checkout pages are excluded —
// see robots.ts. Product and drop detail pages are added dynamically below, from the same
// public API the pages themselves use.
const PATHS = [
  '', // home
  '/about',
  '/drops',
  '/new',
  '/sell',
  '/seller-policy',
  '/pricing-estimator',
  '/returns',
  '/terms',
  '/privacy-policy',
  '/cookies-policy',
];

// Capped rather than the full catalog — a sitemap this size doesn't need every item that's
// ever existed, just a generous, current slice. Sold items are left in (their pages still
// resolve, just show as sold) since a stale/removed listing would 404 instead.
const MAX_ITEMS = 200;

async function fetchItemEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(`${API_URL}/api/items?limit=${MAX_ITEMS}&page=1`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    const items = (data.data ?? []) as { _id: string; updatedAt?: string; createdAt?: string }[];
    return items.flatMap((item) => {
      const path = `/product/${item._id}`;
      const lastModified = new Date(item.updatedAt ?? item.createdAt ?? Date.now());
      const alternates = { languages: { en: `${SITE_URL}${path}`, ar: `${SITE_URL}/ar${path}` } };
      return [
        { url: `${SITE_URL}${path}`, lastModified, alternates },
        { url: `${SITE_URL}/ar${path}`, lastModified, alternates },
      ];
    });
  } catch {
    return [];
  }
}

async function fetchDropEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(`${API_URL}/api/drops`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    const drops = (data.data ?? []) as { _id: string; name: string; status: string }[];
    // Only active and upcoming drops are public — same rule the drop page itself enforces.
    return drops
      .filter((d) => d.status === 'active' || d.status === 'upcoming')
      .flatMap((drop) => {
        const path = `/drops/${encodeURIComponent(drop.name)}?dropId=${drop._id}`;
        const alternates = { languages: { en: `${SITE_URL}${path}`, ar: `${SITE_URL}/ar${path}` } };
        return [
          { url: `${SITE_URL}${path}`, alternates },
          { url: `${SITE_URL}/ar${path}`, alternates },
        ];
      });
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = PATHS.flatMap((path) => [
    {
      url: `${SITE_URL}${path}`,
      lastModified: now,
      alternates: { languages: { en: `${SITE_URL}${path}`, ar: `${SITE_URL}/ar${path}` } },
    },
    {
      url: `${SITE_URL}/ar${path}`,
      lastModified: now,
      alternates: { languages: { en: `${SITE_URL}${path}`, ar: `${SITE_URL}/ar${path}` } },
    },
  ]);

  const [items, drops] = await Promise.all([fetchItemEntries(), fetchDropEntries()]);
  return [...staticEntries, ...items, ...drops];
}
