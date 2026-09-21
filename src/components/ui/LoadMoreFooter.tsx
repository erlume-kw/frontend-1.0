'use client';

import { useNumerals } from '@/lib/useNumerals';
import React from 'react';
import { useTranslations } from 'next-intl';

interface LoadMoreFooterProps {
  shown: number;
  total: number;
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  isDesktop: boolean;
}

/** "Load more" button + "shown of total" count, used under any paginated
 *  product grid (new arrivals, a drop's items). */
export default function LoadMoreFooter({ shown, total, hasMore, loading, onLoadMore, isDesktop }: LoadMoreFooterProps) {
  const t = useTranslations('Pagination');
  const num = useNumerals();
  if (total === 0) return null;

  return (
    <div className={`flex flex-col items-center gap-4 ${isDesktop ? 'py-12' : 'py-8'}`}>
      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={loading}
          className={`flex h-12 items-center justify-center border border-border px-8 ${loading ? 'opacity-60' : ''}`}
        >
          <span className="font-clash font-medium text-[13px] uppercase tracking-[1.2px] text-primary">
            {loading ? t('loading') : t('loadMore')}
          </span>
        </button>
      )}
      <span className="font-dm text-[13px] text-muted">
        {t('shownOf', { shown: num(shown), total: num(total) })}
      </span>
    </div>
  );
}
