'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { fetchGovernorateCities } from '@/services/api';
import { KUWAIT_AREAS as STATIC_AREAS } from '@/lib/kuwait';
import { PLACE_AR } from '@/lib/kuwaitArabic';

// Shared source of truth for Kuwait governorates + their cities.
// Fetched once from the backend enum endpoint and cached at module scope so the
// signup, checkout, and profile address forms all share one dynamic list.
// Falls back to the bundled static list (src/lib/kuwait.ts) if the request fails.

type Areas = Record<string, string[]>;

let cache: Areas | null = null;
let inflight: Promise<Areas> | null = null;

async function load(): Promise<Areas> {
  if (cache) return cache;
  if (!inflight) {
    inflight = fetchGovernorateCities()
      .then(map => {
        cache = map && Object.keys(map).length > 0 ? map : STATIC_AREAS;
        return cache;
      })
      .catch(() => {
        cache = STATIC_AREAS; // offline / backend down — degrade gracefully
        return cache;
      })
      .finally(() => { inflight = null; });
  }
  return inflight;
}

// Arabic alphabetical order ignores the leading "ال" (so الجهراء sorts under ج, not ا)
const arabicSortKey = (value: string) => (PLACE_AR[value] ?? value).replace(/^ال(?=\S)/, '');
const byArabicName = (a: string, b: string) => arabicSortKey(a).localeCompare(arabicSortKey(b), 'ar');

export function useKuwaitAreas() {
  const [areas, setAreas] = useState<Areas>(cache ?? STATIC_AREAS);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    let cancelled = false;
    if (cache) { setAreas(cache); setLoading(false); return; }
    load().then(map => {
      if (!cancelled) { setAreas(map); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, []);

  // Values stay in English (that is what is saved); only the label changes on Arabic pages,
  // where the lists are also sorted alphabetically in Arabic.
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const placeLabel = (value: string) => (isArabic ? PLACE_AR[value] ?? value : value);

  const shown = useMemo(() => {
    if (!isArabic) return areas;
    return Object.fromEntries(Object.entries(areas).map(([gov, list]) => [gov, [...list].sort(byArabicName)]));
  }, [areas, isArabic]);
  const governorates = useMemo(() => {
    const keys = Object.keys(areas);
    return isArabic ? keys.sort(byArabicName) : keys;
  }, [areas, isArabic]);

  return { areas: shown, governorates, loading, placeLabel };
}
