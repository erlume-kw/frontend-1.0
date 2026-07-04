import type { Config } from 'tailwindcss';

// Brand theme — mirrors docs/DESIGN_SYSTEM.md. These tokens are the single
// source of truth for colors and typography; do not hardcode hex values in
// components.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#18230F',
        secondary: '#C5705D',
        olive: '#38452D',
        bgLight: '#DFD3C3',
        offWhite: '#F8EDE3',
        muted: '#7A7060',
        border: '#C9BFAD',
        placeholder: '#D7DAD5',
        error: '#B94040',
        grey: '#929292',
        lightGrey: '#F5F5F5',
      },
      fontFamily: {
        // CSS variables are provided by next/font in src/app/fonts.ts
        clash: ['var(--font-clash)'],
        dm: ['var(--font-dm)'],
        sarina: ['var(--font-sarina)'],
      },
    },
    // md = 768px (Tailwind default) matches the app's single desktop breakpoint
  },
  plugins: [],
};

export default config;
