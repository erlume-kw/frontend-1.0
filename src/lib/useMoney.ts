'use client';

import { useTranslations } from 'next-intl';
import { useNumerals } from './useNumerals';

// Formats an amount as "219 KWD" (English) or "219 د.ك" (Arabic). Accepts a number, a plain
// amount string ("219.00") or an already formatted English price ("219 KWD"), which is what the
// cart and wishlist store.
export function useMoney() {
  const t = useTranslations('Common');
  const numerals = useNumerals();
  return (value: number | string) => {
    const amount = typeof value === 'number' ? String(value) : value.replace(/\s*KWD\s*$/i, '').trim();
    return t('price', { amount: numerals(amount) });
  };
}
