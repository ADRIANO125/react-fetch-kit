import { useState, useEffect, useCallback, useRef } from 'react';
import { InfiniteFetchOptions, InfiniteState, FetchError } from '../../types';
import { axiosFetcher } from '../../utils/axiosFetcher';
import { buildUrl } from '../../utils/buildUrl';
import { useFetchKitConfig } from '../../context/FetchKitProvider';

export function useInfiniteFetch<T = unknown>(
  url: string,
  options: InfiniteFetchOptions<T> = {}
): InfiniteState<T> {
  const config = useFetchKitConfig();
  const {
    pageSize = 20,
    getNextPageParam,
    dataKey = 'data',
    params = {},
  } = options;

  const [allData, setAllData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<FetchError | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<unknown>(undefined);
  const [page, setPage] = useState(1);

  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const fetchItems = useCallback(
    async (isLoadMore: boolean, currentPage: number, currentCursor: unknown) => {
      if (isLoadMore) setIsFetchingMore(true);
      else setLoading(true);

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const cursorParams = getNextPageParam
        ? { ...params, cursor: currentCursor, limit: pageSize }
        : { ...params, page: currentPage, limit: pageSize };

      const fullUrl = buildUrl(url, cursorParams as Record<string, unknown>);

      try {
        const raw = await axiosFetcher<unknown>(fullUrl, {
          method: 'GET',
          signal: abortRef.current.signal,
        });

        if (!mountedRef.current) return;

        let items: T[];
        let nextParam: unknown;

        if (Array.isArray(raw)) {
          items = raw as T[];
          nextParam = raw.length === pageSize ? currentPage + 1 : null;
        } else {
          const res = raw as Record<string, unknown>;
          items = (res[dataKey] as T[]) ?? [];
          nextParam = getNextPageParam ? getNextPageParam(raw) : null;
        }

        setAllData((prev) => (isLoadMore ? [...prev, ...items] : items));
        setCursor(nextParam);
        setHasMore(items.length >= pageSize && nextParam !== null && nextParam !== undefined);
      } catch (err) {
        const e = err as Error;
        if (e.name === 'AbortError' || e.name === 'CanceledError') return;
        if (!mountedRef.current) return;
        const fetchError = err as FetchError;
        setError(fetchError);
        config.onError?.(fetchError);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setIsFetchingMore(false);
        }
      }
    },
    [url, pageSize, dataKey, JSON.stringify(params)]
  );

  const loadMore = useCallback(() => {
    if (isFetchingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchItems(true, nextPage, cursor);
  }, [fetchItems, isFetchingMore, hasMore, page, cursor]);

  const refetch = useCallback(() => {
    setPage(1);
    setAllData([]);
    setCursor(undefined);
    setHasMore(true);
    fetchItems(false, 1, undefined);
  }, [fetchItems]);

  useEffect(() => {
    fetchItems(false, 1, undefined);
  }, [fetchItems]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  return {
    data: allData,
    loading,
    error,
    loadMore,
    hasMore,
    isFetchingMore,
    refetch,
  };
}
