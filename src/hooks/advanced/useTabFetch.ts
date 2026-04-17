import { useState, useEffect, useCallback, useRef } from 'react';
import { TabFetchOptions, TabFetchState, FetchError } from '../../types';
import { axiosFetcher } from '../../utils/axiosFetcher';
import { buildUrl } from '../../utils/buildUrl';
import { cache } from '../../internal/cache';
import { useFetchKitConfig } from '../../context/FetchKitProvider';

export function useTabFetch<T = unknown>(
  options: TabFetchOptions<T>
): TabFetchState<T> {
  const config = useFetchKitConfig();
  const { tabs, defaultTab, cacheEachTab = true } = options;

  const firstTab = defaultTab ?? tabs[0]?.key ?? '';
  const [activeTab, setActiveTab] = useState(firstTab);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FetchError | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const fetchTab = useCallback(
    async (tabKey: string) => {
      const tab = tabs.find((t) => t.key === tabKey);
      if (!tab) return;

      const fullUrl = buildUrl(tab.url, tab.params);

      if (cacheEachTab) {
        const cached = cache.get<T>(fullUrl);
        if (cached !== null) {
          setData(cached);
          setLoading(false);
          setError(null);
          return;
        }
      }

      setLoading(true);
      setError(null);

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        const result = await axiosFetcher<T>(fullUrl, {
          method: 'GET',
          signal: abortRef.current.signal,
        });

        if (!mountedRef.current) return;

        if (cacheEachTab) {
          cache.set(fullUrl, result, 5 * 60 * 1000);
        }

        setData(result);
        setError(null);
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
    [JSON.stringify(tabs), cacheEachTab]
  );

  const setTab = useCallback(
    (key: string) => {
      if (key === activeTab) {
        fetchTab(key);
        return;
      }
      setActiveTab(key);
    },
    [activeTab, fetchTab]
  );

  useEffect(() => {
    fetchTab(activeTab);
    return () => {
      abortRef.current?.abort();
    };
  }, [activeTab, fetchTab]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    activeTab,
    setTab,
    refetch: () => fetchTab(activeTab),
  };
}
