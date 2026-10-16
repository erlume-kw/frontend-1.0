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

/** Fills the blank tab with a small branded "sending your photos" screen while the upload runs. */
function showLoading(tab: Window): void {
  const ar = document.documentElement.lang === 'ar';
  const text = ar ? 'جارٍ إرسال صورك… سنفتح واتساب خلال لحظات' : 'Sending your photos… opening WhatsApp in a moment';
  try {
    tab.document.write(`<!doctype html><html lang="${ar ? 'ar' : 'en'}" dir="${ar ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>erlume</title><style>
html,body{height:100%;margin:0}
body{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;background:#fff;color:#2f3a2b;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;text-align:center;padding:0 24px}
.logo{font-family:Georgia,"Times New Roman",serif;font-size:44px;letter-spacing:1px;color:#2f3a2b}
.dots{display:flex;gap:8px}
.dots span{width:8px;height:8px;border-radius:50%;background:#c4705a;animation:b 1.2s infinite ease-in-out}
.dots span:nth-child(2){animation-delay:.15s}.dots span:nth-child(3){animation-delay:.3s}
@keyframes b{0%,80%,100%{opacity:.25;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}
p{margin:0;font-size:15px;color:#6b6b6b}
</style></head><body><div class="logo">erlume</div><div class="dots"><span></span><span></span><span></span></div><p>${text}</p></body></html>`);
    tab.document.close();
  } catch {
    // Some browsers don't allow writing to the new tab — it just stays blank until WhatsApp loads.
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
  if (tab) {
    showLoading(tab);
    tab.opener = null;
  }

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
