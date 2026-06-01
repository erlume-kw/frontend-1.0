/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './components/**/*.{js,ts,tsx}', './screens/**/*.{js,ts,tsx}'],
  darkMode: 'class',
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#18230F',
          secondary: '#C5705D',
        },
        bg: {
          light: '#DFD3C3',
          offwhite: '#F8EDE3',
        },
        text: {
          primary: '#18230F',
          secondary: '#C5705D',
          muted: '#7A7060',
        },
        border: {
          DEFAULT: '#C9BFAD',
          strong: '#18230F',
        },
        error: '#B94040',
        success: '#2E5D2E',
      },

      fontFamily: {
        // Clash Display — headings/subheadings (local .ttf files in assets/fonts/)
        'clash-light': ['ClashDisplay-Light'],
        'clash-regular': ['ClashDisplay-Regular'],
        'clash-medium': ['ClashDisplay-Medium'],
        'clash-semibold': ['ClashDisplay-SemiBold'],
        // DM Sans — body, labels, UI (@expo-google-fonts/dm-sans)
        'dm-regular': ['DMSans_400Regular'],
        'dm-medium': ['DMSans_500Medium'],
        'dm-semibold': ['DMSans_600SemiBold'],
        // Sarina — erlume wordmark only (@expo-google-fonts/sarina)
        sarina: ['Sarina_400Regular'],
      },

      // Type scale matches Figma Design Element Rules exactly.
      // Mobile values are defaults; desktop overrides applied in components via useWindowDimensions.
      fontSize: {
        // Mobile scale
        'hero-mobile': ['32px', { lineHeight: '35px', letterSpacing: '-0.5px' }],
        'heading-mobile': ['24px', { lineHeight: '28px', letterSpacing: '-0.3px' }],
        'subheading-mobile': ['20px', { lineHeight: '24px' }],
        'body-mobile': ['16px', { lineHeight: '24px' }],
        'label-mobile': ['12px', { lineHeight: '16px', letterSpacing: '0.3px' }],

        // Desktop scale
        'hero-desktop': ['56px', { lineHeight: '60px', letterSpacing: '-1px' }],
        'heading-desktop': ['32px', { lineHeight: '38px', letterSpacing: '-0.5px' }],
        'subheading-desktop': ['24px', { lineHeight: '30px' }],
        'body-desktop': ['16px', { lineHeight: '24px' }],
        'label-desktop': ['14px', { lineHeight: '18px', letterSpacing: '0.2px' }],

        // Shared / utility
        price: ['20px', { lineHeight: '24px' }],
        'price-sm': ['16px', { lineHeight: '20px' }],
        button: ['14px', { lineHeight: '1', letterSpacing: '1.4px' }],
        wordmark: ['28px', { lineHeight: '1' }],
      },

      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        '3xl': '48px',
        '4xl': '64px',
        // Button heights (from Figma design rules)
        'btn-big': '75px',
        'btn-small': '50px',
        // Header
        'header-height': '64px',
        // Screen horizontal padding
        'screen-x': '16px',
        'screen-x-desktop': '64px',
      },

      borderRadius: {
        none: '0px',
        DEFAULT: '0px',
        sm: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        full: '9999px', // keep full for avatars only
      },

      boxShadow: {
        sm: '0 1px 4px rgba(0,0,0,0.08)',
        md: '0 4px 12px rgba(0,0,0,0.10)',
        lg: '0 8px 24px rgba(0,0,0,0.12)',
      },

      maxWidth: {
        content: '1280px',
      },

      screens: {
        tablet: '768px',
        desktop: '1024px',
        wide: '1280px',
      },
    },
  },
  plugins: [],
};
