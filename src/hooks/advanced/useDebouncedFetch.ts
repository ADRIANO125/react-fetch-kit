import { useState, useEffect, useRef, useCallback } from 'react';
import { DebouncedFetchOptions, DebouncedFetchState, FetchError } from '../../types';
import { axiosFetcher } from '../../utils/axiosFetcher';
import { buildUrl } from '../../utils/buildUrl';
import { debounce } from '../../internal/debounce';
import { useFetchKitConfig } from '../../context/FetchKitProvider';

export function useDebouncedFetch<T = unknown>(
  url: string,
  options: DebouncedFetchOptions = {}
): DebouncedFetchState<T> {
  const config = useFetchKitConfig();
  const { params = {}, delay = 400, minLength = 0, enabled = true } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<FetchError | null>(null);
  const [isDebouncing, setIsDebouncing] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  // Check minLength against query param 'q' if present
  const query = String(params?.q ?? params?.query ?? params?.search ?? '');
  const isBelowMin = minLength > 0 && query.length < minLength;
  const shouldFetch = enabled && !isBelowMin;

  const fullUrl = buildUrl(url, params);

  const doFetch = useCallback(
    async (fetchUrl: string) => {
      if (!mountedRef.current) return;
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setLoading(true);
      setError(null);
      setIsDebouncing(false);

      try {
        const result = await axiosFetcher<T>(fetchUrl, {
          method: 'GET',
          signal: abortRef.current.signal,
        });
        if (!mountedRef.current) return;
        setData(result);
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
    [url]
  );

  const debouncedRef = useRef(debounce((u: unknown) => doFetch(u as string), delay));

  useEffect(() => {
    debouncedRef.current = debounce((u: unknown) => doFetch(u as string), delay);
  }, [delay, doFetch]);

  useEffect(() => {
    if (!shouldFetch) {
      setData(null);
      setLoading(false);
      setIsDebouncing(false);
      debouncedRef.current.cancel();
      abortRef.current?.abort();
      return;
    }

    setIsDebouncing(true);
    debouncedRef.current.call(fullUrl);

    return () => {
      debouncedRef.current.cancel();
    };
  }, [fullUrl, shouldFetch]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
      debouncedRef.current.cancel();
    };
  }, []);

  return { data, loading, error, isDebouncing };
}
