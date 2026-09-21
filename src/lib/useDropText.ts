'use client';

import { useLocale } from 'next-intl';
import type { Banner, Drop } from '@/services/api';

// A drop's name and description as they should appear in the current language. On Arabic pages
// the Arabic fields are used when the team has filled them in; otherwise the English text stays.
export function useDropText() {
  const isArabic = useLocale() === 'ar';
  return {
    dropName: (drop: Pick<Drop, 'name' | 'nameAr'>) => (isArabic && drop.nameAr?.trim() ? drop.nameAr : drop.name),
    dropDescription: (drop: Pick<Drop, 'description' | 'descriptionAr'>) =>
      isArabic && drop.descriptionAr?.trim() ? drop.descriptionAr : drop.description,
  };
}

// Same idea for the homepage banners: Arabic text when it exists, English otherwise.
export function useBannerText() {
  const isArabic = useLocale() === 'ar';
  return {
    bannerDescription: (banner: Pick<Banner, 'description' | 'descriptionAr'>) =>
      isArabic && banner.descriptionAr?.trim() ? banner.descriptionAr : banner.description,
    bannerCtaLabel: (banner: Pick<Banner, 'ctaLabel' | 'ctaLabelAr'>) =>
      isArabic && banner.ctaLabelAr?.trim() ? banner.ctaLabelAr : banner.ctaLabel,
  };
}
