'use client';

import { useEffect, useState } from 'react';
import { fetchGovernorateCities } from '@/services/api';
import { KUWAIT_AREAS as STATIC_AREAS } from '@/lib/kuwait';

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

  return { areas, governorates: Object.keys(areas), loading };
}
