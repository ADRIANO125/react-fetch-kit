import { useState, useEffect, useCallback, useRef } from 'react';
import { PaginatedFetchOptions, PaginatedState, FetchError } from '../../types';
import { axiosFetcher } from '../../utils/axiosFetcher';
import { buildUrl } from '../../utils/buildUrl';
import { useFetchKitConfig } from '../../context/FetchKitProvider';

interface RawPaginatedResponse {
  data?: unknown[];
  items?: unknown[];
  results?: unknown[];
  meta?: { total?: number; totalPages?: number };
  total?: number;
  totalPages?: number;
}

export function usePaginatedFetch<T = unknown>(
  url: string,
  options: PaginatedFetchOptions = {}
): PaginatedState<T> {
  const config = useFetchKitConfig();
  const {
    pageSize = 10,
    params = {},
    pageParam = 'page',
    limitParam = 'limit',
    useOffset = false,
  } = options;

  const [page, setPage] = useState(1);
  const [data, setData] = useState<T[] | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FetchError | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const fetchPage = useCallback(
    async (p: number) => {
      setLoading(true);
      setError(null);

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const finalPageVal = useOffset ? (p - 1) * pageSize : p;

      const fullUrl = buildUrl(url, {
        ...params,
        [pageParam]: finalPageVal,
        [limitParam]: pageSize,
      });

      try {
        const raw = await axiosFetcher<unknown>(fullUrl, {
          method: 'GET',
          signal: abortRef.current.signal,
        });

        if (!mountedRef.current) return;

        // Handle common response shapes
        let items: T[];
        let resolvedTotal = 0;
        let resolvedTotalPages = 0;

        if (Array.isArray(raw)) {
          items = raw as T[];
          resolvedTotal = raw.length;
          resolvedTotalPages = 1;
        } else {
          const res = raw as RawPaginatedResponse;
          
          // Smart detection: try known keys first, then look for any array property
          items = (res.data ?? res.items ?? res.results) as T[];
          
          if (!items) {
            const firstArrayKey = Object.keys(res).find(key => Array.isArray((res as any)[key]));
            items = (firstArrayKey ? (res as any)[firstArrayKey] : []) as T[];
          }

          resolvedTotal = res.meta?.total ?? (res as any).total ?? items.length;
          resolvedTotalPages =
            res.meta?.totalPages ?? (res as any).totalPages ?? (res as any).total_pages ?? Math.ceil(resolvedTotal / pageSize);
        }

        setData(items);
        setTotal(resolvedTotal);
        setTotalPages(resolvedTotalPages);
      } catch (err) {
        const e = err as Error;
        if (e.name === 'AbortError' || e.name === 'CanceledError') return;
        if (!mountedRef.current) return;
        const fetchError = err as FetchError;
        setError(fetchError);
        config.onError?.(fetchError);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [url, pageSize, JSON.stringify(params), pageParam, limitParam]
  );

  useEffect(() => {
    fetchPage(page);
  }, [page, fetchPage]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  return {
    data,
    loading,
    error,
    page,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: () => setPage((p) => Math.min(p + 1, totalPages)),
    prevPage: () => setPage((p) => Math.max(p - 1, 1)),
    goToPage: (p: number) => setPage(Math.max(1, Math.min(p, totalPages))),
    refetch: () => fetchPage(page),
  };
}
