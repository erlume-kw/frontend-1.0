// Non-style brand data. Colors and fonts live in tailwind.config.ts —
// use the theme tokens (bg-primary, text-muted, font-clash …) in components.

export const FOOTER_DATA = {
  contact: {
    phone: '+965 97226735',
    email: 'info@erlume.com.kw',
  },
  columns: {
    'Our Drops': ['Drop I', 'Drop II', 'Drop III', 'Drop IV', 'Drop VI'],
    Erlume: ['Terms & Conditions', 'Returns & Refunds', 'Privacy Policy', 'Cookies Policy'],
    Sellers: ['How to Sell', 'Selling Policy', 'Pricing Estimator'],
  },
} as const;

export const SOCIAL_ICONS = {
  instagram: '/logos/instagram-white-icon.png',
  whatsapp: '/logos/whatsapp-white-icon.png',
  tiktok: '/logos/tiktok-64.png',
} as const;
