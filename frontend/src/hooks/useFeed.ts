import { useState, useCallback, useRef } from 'react';
import type { FeedCard } from '@refr/shared';
import { feedApi } from '../services/api';

const PAGE_SIZE = 20;

interface UseFeedReturn {
  cards: FeedCard[];
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  error: string | null;
  fetchMore: () => void;
  refresh: () => void;
}

/**
 * useFeed — manages the vertical content feed with keyset pagination.
 *
 * Strategy:
 * - Initial load fires on mount via the initial fetchMore() call at component level.
 * - fetchMore() appends the next page; guarded against concurrent calls.
 * - refresh() resets cursor and replaces the card list (pull-to-refresh).
 * - Error state is surfaced; components decide how to render it.
 */
export function useFeed(): UseFeedReturn {
  const [cards, setCards] = useState<FeedCard[]>([]);
  const [cursor, setCursor] = useState<string | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Guard: prevent concurrent fetch calls
  const fetchingRef = useRef(false);

  const fetchPage = useCallback(
    async (isRefresh: boolean) => {
      if (fetchingRef.current) return;
      // On refresh cursor is undefined (fresh start); on load-more use current cursor
      const currentCursor = isRefresh ? undefined : cursor;
      // If not a refresh and we have no more pages, bail
      if (!isRefresh && !hasMore) return;
      // If cursor is null (server said no more), bail unless it's a refresh
      if (!isRefresh && currentCursor === null) return;

      fetchingRef.current = true;
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const response = await feedApi.getFeed({
          cursor: currentCursor ?? undefined,
          limit: PAGE_SIZE,
        });

        setCards((prev) =>
          isRefresh ? response.cards : [...prev, ...response.cards]
        );
        setCursor(response.cursor);
        setHasMore(response.hasMore);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load feed';
        setError(message);
      } finally {
        fetchingRef.current = false;
        setLoading(false);
        setRefreshing(false);
      }
    },
    [cursor, hasMore]
  );

  const fetchMore = useCallback(() => {
    fetchPage(false);
  }, [fetchPage]);

  const refresh = useCallback(() => {
    setCursor(undefined);
    setHasMore(true);
    fetchPage(true);
  }, [fetchPage]);

  return {
    cards,
    loading,
    refreshing,
    hasMore,
    error,
    fetchMore,
    refresh,
  };
}
