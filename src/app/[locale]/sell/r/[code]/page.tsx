import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { API_URL } from '@/lib/config';
import { capPreviewImage } from '@/lib/ogImage';
import SellerPhotosView from './SellerPhotosView';

// The page behind the link in a seller's WhatsApp message (see lib/sellerPhotos.ts).
// Its job is mostly the link preview: og:image is the seller's first photo, so the photo
// shows up right in the chat. Never indexed — but deliberately NOT blocked in robots.txt,
// because WhatsApp's preview crawler needs to be able to fetch it.

async function fetchSubmission(code: string): Promise<string[] | null> {
  if (!/^[A-Za-z0-9]{8}$/.test(code)) return null;
  try {
    const res = await fetch(`${API_URL}/api/seller-submissions/${code}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data.photos) && data.photos.length ? (data.photos as string[]) : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}): Promise<Metadata> {
  const { locale, code } = await params;
  const t = await getTranslations({ locale, namespace: 'SellerPhotos' });
  const photos = await fetchSubmission(code);

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: { index: false, follow: false },
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      images: photos ? [{ url: capPreviewImage(photos[0]), alt: t('metaTitle') }] : undefined,
    },
  };
}

export default async function SellerPhotosPage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { code } = await params;
  const photos = await fetchSubmission(code);
  return <SellerPhotosView photos={photos} />;
}
