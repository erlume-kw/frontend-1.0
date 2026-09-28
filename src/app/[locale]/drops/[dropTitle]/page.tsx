import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { API_URL, SITE_URL } from '@/lib/config';
import DropPageClient from './DropPageClient';

// Server-side only — mirrors the client page's own fetch for the interactive UI. The drop's
// real identity is the ?dropId= query param (the path segment is just the drop's name, kept
// for a readable URL — see SiteFooter.dropHref / drops/page.tsx), so metadata needs it too.
type DropMeta = {
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  status: 'upcoming' | 'active' | 'ended' | 'hidden';
  bannerImageUrl?: string;
};

// Resilient like the product metadata fetch: the backend may be waking (Render
// cold start) when a crawler hits this, so retry once fresh before giving up.
// No branded fallback here — a failed load must read as blank, same as a hidden
// drop, so the preview never leaks a drop the site deliberately hides.
async function fetchDropForMetadata(dropId: string): Promise<DropMeta | null> {
  const url = `${API_URL}/api/drops/${dropId}`;
  const attempts: RequestInit[] = [{ next: { revalidate: 3600 } } as RequestInit, { cache: 'no-store' }];
  for (const opts of attempts) {
    try {
      const res = await fetch(url, { ...opts, signal: AbortSignal.timeout(9000) });
      if (res.ok) {
        const data = await res.json();
        if (data?.data) return data.data as DropMeta;
      }
    } catch {
      // try the next attempt
    }
  }
  return null;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; dropTitle: string }>;
  searchParams: Promise<{ dropId?: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { dropId } = await searchParams;
  if (!dropId) return {};

  const drop = await fetchDropForMetadata(dropId);
  // Hidden/ended drops (and anything that failed to load) read as plain "not found" on the
  // page itself — metadata must stay just as blank, or a search engine/link preview would
  // reveal the name of a drop the site deliberately hides.
  if (!drop || (drop.status !== 'active' && drop.status !== 'upcoming')) return {};

  const isArabic = locale === 'ar';
  const name = (isArabic && drop.nameAr?.trim()) ? drop.nameAr : drop.name;
  const t = await getTranslations({ locale, namespace: 'Drops' });
  const description = t('metaDescription', { name });
  const path = `/drops/${encodeURIComponent(drop.name)}?dropId=${dropId}`;

  return {
    title: name,
    description,
    alternates: {
      languages: { en: `${SITE_URL}${path}`, ar: `${SITE_URL}/ar${path}` },
    },
    openGraph: {
      title: name,
      description,
      images: drop.bannerImageUrl ? [{ url: drop.bannerImageUrl }] : undefined,
    },
  };
}

export default function DropPage() {
  return <DropPageClient />;
}
