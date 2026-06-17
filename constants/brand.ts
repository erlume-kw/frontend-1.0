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
    Sellers: ['How to Sell', 'Selling Policy', 'Pricing Estimator'],
  },
} as const;

export const SOCIAL_ICONS = {
  instagram: require('../assets/logos/instagram-white-icon.png'),
  whatsapp: require('../assets/logos/whatsapp-white-icon.png'),
  tiktok: require('../assets/logos/tiktok-64.png'),
};
