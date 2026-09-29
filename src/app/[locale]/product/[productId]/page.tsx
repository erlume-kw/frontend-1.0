import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { API_URL, SITE_URL } from '@/lib/config';
import { capPreviewImage } from '@/lib/ogImage';
import ProductPageClient from './ProductPageClient';

type ItemMeta = {
  itemName: string;
  itemModel?: string;
  brandName: string;
  listingPrice: string;
  imageUrls?: string[];
};

// Server-side only — the client page below fetches the same item again for the interactive
// UI (wishlist state, gallery, etc.), but metadata has to be resolved before any of that
// client code runs, so this is a small, separate fetch.
//
// The backend can be asleep (Render cold start) exactly when a link crawler hits this.
// So: try the cached path first (fast, and cached on success), then, if that fails,
// retry once fresh — a waking backend still yields the real product image, and a
// transient failure is never cached as "no image".
async function fetchItemForMetadata(id: string): Promise<ItemMeta | null> {
  const url = `${API_URL}/api/items/${id}`;
  const attempts: RequestInit[] = [{ next: { revalidate: 3600 } } as RequestInit, { cache: 'no-store' }];
  for (const opts of attempts) {
    try {
      const res = await fetch(url, { ...opts, signal: AbortSignal.timeout(9000) });
      if (res.ok) {
        const data = await res.json();
        if (data?.data) return data.data as ItemMeta;
      }
    } catch {
      // try the next attempt
    }
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; productId: string }>;
}): Promise<Metadata> {
  const { locale, productId } = await params;
  const item = await fetchItemForMetadata(productId);
  const t = await getTranslations({ locale, namespace: 'Product' });
  const path = `/product/${productId}`;

  // Backend unreachable: fall back to the site-wide branded preview image
  // (opengraph-image.tsx) rather than a bare/broken link — just leave openGraph.images
  // unset so it inherits that default instead of duplicating it here.
  if (!item) {
    return { openGraph: { title: 'erlume' } };
  }

  const name = `${item.brandName} ${item.itemModel ?? item.itemName}`;
  const description = t('metaDescription', { name });
  // The item's own photo when there is one, otherwise inherit the branded default
  // (opengraph-image.tsx) — never the raw wordmark PNG, which is the wrong shape
  // for a link preview (300x65, far from the ~1.91:1 platforms expect). Capped to a
  // reasonable size — a raw phone-camera upload can be 2-3MB at 4160x6240, which
  // WhatsApp can't turn into a proper preview card and falls back to a blurry small
  // thumbnail (confirmed: the same failure happens even on a never-shared link, so
  // it isn't WhatsApp's own link-preview cache — it's genuinely the file weight).
  const itemImage = item.imageUrls?.[0] ? capPreviewImage(item.imageUrls[0]) : undefined;

  return {
    title: name,
    description,
    alternates: {
      languages: { en: `${SITE_URL}${path}`, ar: `${SITE_URL}/ar${path}` },
    },
    openGraph: {
      title: name,
      description,
      images: itemImage ? [{ url: itemImage, alt: name }] : undefined,
    },
  };
}

export default function ProductPage() {
  return <ProductPageClient />;
}
