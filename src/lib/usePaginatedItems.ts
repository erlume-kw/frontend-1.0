'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Item, ItemsPage } from '@/services/api';

/**
 * "Load more" pagination for a product grid. Rather than fetching discrete
 * pages and appending them (which needs care to avoid duplicate/missing items
 * if a fetch races), each load just re-requests everything seen so far plus
 * one more page's worth, from the same already-sorted endpoint — simpler to
 * reason about, and cheap at this catalog's size.
 *
 * `fetchPage(limit)` should return the first `limit` items (by whatever
 * sort the endpoint applies) and the true total count.
 */
export function usePaginatedItems(
  fetchPage: (limit: number) => Promise<ItemsPage>,
  pageSize: number,
  deps: unknown[],
  // When set, how many items were loaded is remembered for this tab session, so
  // returning to the list (e.g. after opening a product) restores the shopper's
  // progress instead of collapsing back to the first page.
  persistKey?: string,
) {
  const countKey = persistKey ? `paginated:${persistKey}:count` : null;

  const [items, setItems] = useState<Item[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPageRef = useRef(fetchPage);
  fetchPageRef.current = fetchPage;
  const loadedRef = useRef(pageSize);

  const load = useCallback((limit: number, phase: 'initial' | 'more' | 'refresh') => {
    if (phase === 'initial') setLoading(true);
    if (phase === 'more') setLoadingMore(true);
    return fetchPageRef.current(limit)
      .then(({ items: fetched, totalCount: tc }) => {
        setItems(fetched);
        setTotalCount(tc);
        loadedRef.current = Math.max(limit, fetched.length);
        if (countKey) {
          try { sessionStorage.setItem(countKey, String(loadedRef.current)); } catch { /* storage blocked */ }
        }
      })
      .catch(e => console.error('usePaginatedItems fetch error:', e))
      .finally(() => {
        if (phase === 'initial') setLoading(false);
        if (phase === 'more') setLoadingMore(false);
      });
  }, [countKey]);

  useEffect(() => {
    // Resume the previously loaded count for this list, if any (same tab session).
    let limit = pageSize;
    if (countKey) {
      try {
        const saved = Number(sessionStorage.getItem(countKey));
        if (Number.isFinite(saved) && saved >= pageSize) limit = saved;
      } catch { /* storage blocked */ }
    }
    loadedRef.current = limit;
    void load(limit, 'initial');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const loadMore = useCallback(() => {
    void load(loadedRef.current + pageSize, 'more');
  }, [load, pageSize]);

  // Refreshes the same range already loaded (not just the first page), so
  // coming back to the tab doesn't collapse progress the shopper already made.
  const refresh = useCallback(() => {
    void load(loadedRef.current, 'refresh');
  }, [load]);

  return {
    items,
    totalCount,
    loading,
    loadingMore,
    hasMore: items.length < totalCount,
    loadMore,
    refresh,
  };
}
