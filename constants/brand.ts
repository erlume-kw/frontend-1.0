export const COLORS = {
  primary: '#18230F',
  secondary: '#C5705D',
  olive: '#38452D',
  bgLight: '#DFD3C3',
  offWhite: '#F8EDE3',
  white: '#FFFFFF',
  black: '#000000',
  muted: '#7A7060',
  border: '#C9BFAD',
  placeholder: '#D7DAD5',
  error: '#B94040',
  grey: '#929292',
  lightGrey: '#F5F5F5',
} as const;

export const FONTS = {
  clashLight: 'ClashDisplay-Light',
  clashRegular: 'ClashDisplay-Regular',
  clashMedium: 'ClashDisplay-Medium',
  clashSemibold: 'ClashDisplay-SemiBold',
  dmRegular: 'DMSans_400Regular',
  dmMedium: 'DMSans_500Medium',
  dmSemibold: 'DMSans_600SemiBold',
  sarina: 'Sarina_400Regular',
} as const;

export const BREAKPOINT = 768;

/** Horizontal page margins — see docs/DESIGN_SYSTEM.md */
export const SCREEN_PADDING = {
  mobile: 16,
  tablet: 32,
  desktop: 64,
} as const;

export const FOOTER_DATA = {
  contact: {
    phone: '+965 97226735',
    email: 'erlumekw@gmail.com',
  },
  columns: {
    'Our Drops': ['Drop I', 'Drop II', 'Drop III', 'Drop IV', 'Drop VI'],
    Erlume: ['Cookies', 'Terms & Conditions', 'Privacy Policy'],
    Sellers: ['Selling Policy', 'Commission Breakdown', 'Pricing Calculator'],
  },
} as const;

// Social icon URLs — replace with bundled local assets before production
export const SOCIAL_ICONS = {
  instagram: 'https://www.figma.com/api/mcp/asset/d7dc3550-f24e-4ce5-81b0-9f047b783c33',
  whatsapp: 'https://www.figma.com/api/mcp/asset/4c1f6b0b-6fed-4399-b0fd-c269a7f2631a',
  tiktok: 'https://www.figma.com/api/mcp/asset/b1b95d60-3561-49d0-82e6-9e15e4cdc575',
} as const;
