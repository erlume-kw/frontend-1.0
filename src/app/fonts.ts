import { DM_Sans, Sarina } from 'next/font/google';
import localFont from 'next/font/local';

// Weight mapping preserves the previous per-family names:
//   ClashDisplay-Light → font-clash font-light   (300)
//   ClashDisplay-Regular → font-clash            (400)
//   ClashDisplay-Medium → font-clash font-medium (500)
//   ClashDisplay-SemiBold → font-clash font-semibold (600)
export const clashDisplay = localFont({
  src: [
    { path: '../assets/fonts/ClashDisplay-Light.ttf', weight: '300', style: 'normal' },
    { path: '../assets/fonts/ClashDisplay-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../assets/fonts/ClashDisplay-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../assets/fonts/ClashDisplay-SemiBold.ttf', weight: '600', style: 'normal' },
  ],
  variable: '--font-clash',
  display: 'swap',
});

// DMSans_400Regular / 500Medium / 600SemiBold → font-dm (+ font-medium / font-semibold)
export const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-dm',
  display: 'swap',
});

export const sarina = Sarina({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-sarina',
  display: 'swap',
});
