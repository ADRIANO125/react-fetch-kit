import { useState, useEffect, useRef, useCallback } from 'react';
import { RealtimeOptions, RealtimeState, FetchError } from '../../types';
import { axiosFetcher } from '../../utils/axiosFetcher';
import { useFetchKitConfig } from '../../context/FetchKitProvider';

export function useRealtime<T = unknown>(
  url: string,
  options: RealtimeOptions = {}
): RealtimeState<T> {
  const config = useFetchKitConfig();
  const { every = 5000, paused: initialPaused = false } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!initialPaused);
  const [error, setError] = useState<FetchError | null>(null);
  const [isPolling, setIsPolling] = useState(!initialPaused);

  const pausedRef = useRef(initialPaused);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const fetchOnce = useCallback(async () => {
    if (pausedRef.current || !mountedRef.current) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const result = await axiosFetcher<T>(url, {
        method: 'GET',
        signal: abortRef.current.signal,
      });
      if (!mountedRef.current) return;
      setData(result);
      setError(null);
      setLoading(false);
    } catch (err) {
      const e = err as Error;
      if (e.name === 'AbortError' || e.name === 'CanceledError') return;
      if (!mountedRef.current) return;
      const fetchError = err as FetchError;
      setError(fetchError);
      setLoading(false);
      config.onError?.(fetchError);
    }
  }, [url]);

  const schedule = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      await fetchOnce();
      if (!pausedRef.current && mountedRef.current) schedule();
    }, every);
  }, [every, fetchOnce]);

  const start = useCallback(() => {
    pausedRef.current = false;
    setIsPolling(true);
    fetchOnce().then(() => schedule());
  }, [fetchOnce, schedule]);

  const stop = useCallback(() => {
    pausedRef.current = true;
    setIsPolling(false);
    abortRef.current?.abort();
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const resume = useCallback(() => {
    start();
  }, [start]);

  // Pause when tab is hidden
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        if (timerRef.current) clearTimeout(timerRef.current);
        abortRef.current?.abort();
      } else if (!pausedRef.current) {
        fetchOnce().then(() => schedule());
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [fetchOnce, schedule]);

  useEffect(() => {
    mountedRef.current = true;
    if (!initialPaused) start();
    return () => {
      mountedRef.current = false;
      stop();
    };
  }, [url]);

  return { data, loading, error, isPolling, stop, resume };
}
