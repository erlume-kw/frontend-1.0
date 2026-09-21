'use client';

import { useLocale } from 'next-intl';

const ARABIC_INDIC = '٠١٢٣٤٥٦٧٨٩';

/** "219.50" → "٢١٩٫٥٠": Arabic-Indic digits and the Arabic decimal separator. */
export function toArabicDigits(value: string | number): string {
  return String(value)
    .replace(/[0-9]/g, d => ARABIC_INDIC[Number(d)])
    .replace(/([٠-٩])\.([٠-٩])/g, '$1٫$2');
}

// Numbers as they should be written on the current page: unchanged in English, Arabic-Indic
// digits on Arabic pages. Used page by page (see the cart) so the look can be judged before it
// is rolled out everywhere.
export function useNumerals() {
  const isArabic = useLocale() === 'ar';
  return (value: string | number) => (isArabic ? toArabicDigits(value) : String(value));
}

/** Digits typed on an Arabic keyboard (٠-٩, ۰-۹) → 0-9, and "٫" → "." — the backend expects Western digits. */
export function toWesternDigits(value: string): string {
  return value
    .replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 0x06f0))
    .replace(/٫/g, '.');
}
