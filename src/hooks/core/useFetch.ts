import { useState, useEffect, useCallback, useRef } from 'react';
import { FetchOptions, FetchState, FetchError } from '../../types';
import { axiosFetcher } from '../../utils/axiosFetcher';
import { buildUrl } from '../../utils/buildUrl';
import { cache } from '../../internal/cache';
import { withRetry } from '../../internal/retry';
import { useFetchKitConfig } from '../../context/FetchKitProvider';

export function useFetch<T = unknown>(
  url: string,
  options: FetchOptions<T> = {}
): FetchState<T> & { refetch: () => void } {
  const config = useFetchKitConfig();

  const {
    method = 'GET',
    headers = {},
    params,
    body,
    enabled = true,
    onSuccess,
    onError,
    transform,
    retry = 0,
    retryDelay = 1000,
    cache: useCache = false,
    cacheTime,
  } = options;

  const resolvedCacheTime = cacheTime ?? config.defaultCacheTime ?? 5 * 60 * 1000;
  const fullUrl = buildUrl(url, params);

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: enabled,
    error: null,
    status: enabled ? 'loading' : 'idle',
  });

  const abortRef = useRef<AbortController | null>(null);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setState((prev) => ({ ...prev, loading: false, status: 'idle' }));
      return;
    }

    if (useCache) {
      const cached = cache.get<T>(fullUrl);
      if (cached !== null) {
        setState({ data: cached, loading: false, error: null, status: 'success' });
        onSuccessRef.current?.(cached);
        return;
      }
    }

    setState((prev) => ({ ...prev, loading: true, status: 'loading', error: null }));

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    try {
      const rawData = await withRetry(
        () =>
          axiosFetcher<unknown>(fullUrl, {
            method,
            headers,
            data: body,
            signal,
          }),
        retry,
        retryDelay,
        signal
      );

      const data = transform ? transform(rawData) : (rawData as T);

      if (useCache) {
        cache.set(fullUrl, data, resolvedCacheTime);
      }

      setState({ data, loading: false, error: null, status: 'success' });
      onSuccessRef.current?.(data);
    } catch (err) {
      const e = err as Error;
      if (e.name === 'AbortError' || e.name === 'CanceledError') return;

      const fetchError = err as FetchError;
      setState({ data: null, loading: false, error: fetchError, status: 'error' });
      onErrorRef.current?.(fetchError);
      config.onError?.(fetchError);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullUrl, enabled, method]);

  useEffect(() => {
    fetchData();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}
