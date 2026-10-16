import type { Metadata } from 'next';
import SendingView from './SendingView';

// Shown in the new tab while a seller's photos upload, before it switches to WhatsApp
// (see lib/sellerPhotos.ts). A real page so it carries the site's fonts and colours.
export const metadata: Metadata = {
  title: 'erlume',
  robots: { index: false, follow: false },
};

export default function SendingPage() {
  return <SendingView />;
}
