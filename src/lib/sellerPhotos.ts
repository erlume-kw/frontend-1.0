import { createSellerSubmission } from '@/services/api';
import { SOCIAL_URLS } from './interactions';

// Photos are shrunk before upload: phone photos are often 3–6 MB, and the backend
// (a Vercel function) rejects request bodies over 4.5 MB.
const MAX_SIDE = 1600;
const JPEG_QUALITY = 0.85;

/** Resizes a photo to at most 1600px as a JPEG. Falls back to the original file if the browser can't decode it. */
export async function shrinkPhoto(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
    return blob ?? file;
  } catch {
    return file;
  }
}

/**
 * Opens the erlume WhatsApp chat with a pre-filled message. When the seller picked photos,
 * they are uploaded first and the message carries a link to them (WhatsApp shows the photo
 * as the link preview). If the upload fails, WhatsApp still opens with the plain message.
 */
export async function openWhatsAppWithPhotos({
  photos,
  message,
  source,
  brand,
  year,
}: {
  photos: File[];
  /** Builds the message; `link` is present only when the upload succeeded. */
  message: (link?: string) => string;
  source: 'sell' | 'estimator';
  brand?: string;
  year?: string;
}): Promise<void> {
  const whatsappUrl = (text: string) => `${SOCIAL_URLS.whatsapp}?text=${encodeURIComponent(text)}`;

  if (!photos.length) {
    window.open(whatsappUrl(message()), '_blank', 'noopener');
    return;
  }

  // Open the tab now, while we still have the user's tap — browsers block window.open after an await
  const tab = window.open('', '_blank');
  if (tab) tab.opener = null;

  let text = message();
  try {
    const shrunk = await Promise.all(photos.map(shrinkPhoto));
    const code = await createSellerSubmission(shrunk, { source, brand, year });
    const localePrefix = document.documentElement.lang === 'ar' ? '/ar' : '';
    text = message(`${window.location.origin}${localePrefix}/sell/r/${code}`);
  } catch (err) {
    console.error('Could not upload seller photos; opening WhatsApp without them', err);
  }

  if (tab) tab.location.href = whatsappUrl(text);
  else window.location.href = whatsappUrl(text);
}
