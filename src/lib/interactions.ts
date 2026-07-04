import { FOOTER_DATA } from './brand';

export const SOCIAL_URLS = {
  instagram: 'https://instagram.com',
  whatsapp: `https://wa.me/${FOOTER_DATA.contact.phone.replace(/\D/g, '')}`,
  tiktok: 'https://tiktok.com',
} as const;

const DROP_NAV: Record<string, { dropId: string; dropTitle: string }> = {
  'Drop I': { dropId: 'drop-1', dropTitle: 'DROP I' },
  'Drop II': { dropId: 'drop-2', dropTitle: 'DROP II' },
  'Drop III': { dropId: 'drop-3', dropTitle: 'DROP III' },
  'Drop IV': { dropId: 'drop-4', dropTitle: 'DROP IV' },
  'Drop VI': { dropId: 'drop-4', dropTitle: 'DROP IV' },
};

const LEGAL_SUBJECTS: Record<string, string> = {
  Cookies: 'Cookies inquiry',
  'Terms & Conditions': 'Terms inquiry',
  'Privacy Policy': 'Privacy inquiry',
};

export function openExternalUrl(url: string) {
  if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener');
}

export function openPhone(phone: string) {
  if (typeof window !== 'undefined') window.location.href = `tel:${phone.replace(/\s/g, '')}`;
}

export function openEmail(email: string, subject?: string) {
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : '';
  if (typeof window !== 'undefined') window.location.href = `mailto:${email}${query}`;
}

export function openWhatsApp(prefill?: string) {
  const base = SOCIAL_URLS.whatsapp;
  const url = prefill ? `${base}?text=${encodeURIComponent(prefill)}` : base;
  openExternalUrl(url);
}

/** Footer link → app route. `push` is Next's router.push. */
export function handleFooterLink(label: string, push: (href: string) => void) {
  const drop = DROP_NAV[label];
  if (drop) { push(`/drops/${encodeURIComponent(drop.dropTitle)}?dropId=${drop.dropId}`); return; }
  if (label === 'How to Sell') { push('/sell'); return; }
  if (label === 'Selling Policy') { push('/seller-policy'); return; }
  if (label === 'Pricing Estimator') { push('/pricing-estimator'); return; }
  if (label === 'Cookies' || label === 'Cookies Policy') { push('/cookies-policy'); return; }
  if (label === 'Commission Breakdown') { push('/sell'); return; }
  if (label === 'Privacy Policy') { push('/privacy-policy'); return; }
  const legalSubject = LEGAL_SUBJECTS[label];
  if (legalSubject) { openEmail(FOOTER_DATA.contact.email, legalSubject); return; }
  push('/drops');
}

export function showPromoApplied() {
  if (typeof window !== 'undefined') window.alert('Promo code\n\nYour code has been applied to this order.');
}

export function showNotifySignup() {
  if (typeof window !== 'undefined') window.alert("You're on the list\n\nWe'll email you when similar pieces launch.");
}
