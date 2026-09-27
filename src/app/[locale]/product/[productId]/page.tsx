import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { API_URL, SITE_URL } from '@/lib/config';
import ProductPageClient from './ProductPageClient';

// Server-side only — the client page below fetches the same item again for the interactive
// UI (wishlist state, gallery, etc.), but metadata has to be resolved before any of that
// client code runs, so this is a small, separate fetch.
async function fetchItemForMetadata(id: string) {
  try {
    const res = await fetch(`${API_URL}/api/items/${id}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data as {
      itemName: string;
      itemModel?: string;
      brandName: string;
      listingPrice: string;
      imageUrls?: string[];
    } | null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; productId: string }>;
}): Promise<Metadata> {
  const { locale, productId } = await params;
  const item = await fetchItemForMetadata(productId);
  if (!item) return {};

  const t = await getTranslations({ locale, namespace: 'Product' });
  const name = `${item.brandName} ${item.itemModel ?? item.itemName}`;
  const price = locale === 'ar' ? `${item.listingPrice} د.ك` : `KWD ${item.listingPrice}`;
  const description = t('metaDescription', { name, price });
  const image = item.imageUrls?.[0];
  const path = `/product/${productId}`;

  return {
    title: name,
    description,
    alternates: {
      languages: { en: `${SITE_URL}${path}`, ar: `${SITE_URL}/ar${path}` },
    },
    openGraph: {
      title: name,
      description,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default function ProductPage() {
  return <ProductPageClient />;
}
