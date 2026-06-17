import { Alert, Linking } from 'react-native';
import { FOOTER_DATA } from '../constants/brand';

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

const SELLER_LINKS = new Set(['Commission Breakdown', 'Pricing Estimator']);

const LEGAL_SUBJECTS: Record<string, string> = {
  Cookies: 'Cookies inquiry',
  'Terms & Conditions': 'Terms inquiry',
  'Privacy Policy': 'Privacy inquiry',
};

export function openExternalUrl(url: string) {
  Linking.openURL(url).catch(() => {});
}

export function openPhone(phone: string) {
  openExternalUrl(`tel:${phone.replace(/\s/g, '')}`);
}

export function openEmail(email: string, subject?: string) {
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : '';
  openExternalUrl(`mailto:${email}${query}`);
}

export function openWhatsApp(prefill?: string) {
  const base = SOCIAL_URLS.whatsapp;
  const url = prefill ? `${base}?text=${encodeURIComponent(prefill)}` : base;
  openExternalUrl(url);
}

type Nav = { navigate: (screen: string, params?: object) => void };

export function handleFooterLink(label: string, navigation: Nav) {
  const drop = DROP_NAV[label];
  if (drop) { navigation.navigate('DropDetail', drop); return; }
  if (label === 'How to Sell') { navigation.navigate('Sell'); return; }
  if (label === 'Selling Policy') { navigation.navigate('SellerPolicy'); return; }
  if (label === 'Pricing Estimator') { navigation.navigate('PricingEstimator'); return; }
  if (label === 'Commission Breakdown') { navigation.navigate('Sell'); return; }
  const legalSubject = LEGAL_SUBJECTS[label];
  if (legalSubject) { openEmail(FOOTER_DATA.contact.email, legalSubject); return; }
  navigation.navigate('AllDrops');
}

export function showPromoApplied() {
  Alert.alert('Promo code', 'Your code has been applied to this order.');
}

export function showNotifySignup() {
  Alert.alert("You're on the list", "We'll email you when similar pieces launch.");
}

export function showOrderPlaced(navigation: Nav) {
  Alert.alert('Order placed', 'Thank you for your purchase!', [
    { text: 'OK', onPress: () => navigation.navigate('Home') },
  ]);
}
