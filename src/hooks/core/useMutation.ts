import { useState, useCallback, useRef } from 'react';
import { MutationOptions, MutationState, FetchError } from '../../types';
import { axiosFetcher } from '../../utils/axiosFetcher';
import { cache } from '../../internal/cache';
import { useFetchKitConfig } from '../../context/FetchKitProvider';
import { toastEmitter } from '../../components/Toast/toastEmitter';

export function useMutation<TData = unknown, TVariables = unknown>(
  url: string,
  options: MutationOptions<TData, TVariables> = {}
): MutationState<TData> & {
  mutate: (variables?: TVariables) => Promise<TData | null>;
  reset: () => void;
} {
  const config = useFetchKitConfig();
  const {
    method = 'POST',
    headers = {},
    onSuccess,
    onError,
    toast,
    invalidates = [],
  } = options;

  const [state, setState] = useState<MutationState<TData>>({
    data: null,
    loading: false,
    error: null,
    status: 'idle',
  });

  const abortRef = useRef<AbortController | null>(null);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;

  const mutate = useCallback(
    async (variables?: TVariables): Promise<TData | null> => {
      setState({ data: null, loading: true, error: null, status: 'loading' });

      let toastId: string | undefined;
      if (toast?.loading) {
        toastId = toastEmitter.emit({ type: 'loading', message: toast.loading });
      }

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        const data = await axiosFetcher<TData>(url, {
          method,
          headers,
          data: variables,
          signal: abortRef.current.signal,
        });

        if (invalidates.length > 0) {
          cache.invalidateMany(invalidates);
        }

        setState({ data, loading: false, error: null, status: 'success' });
        onSuccessRef.current?.(data, variables as TVariables);

        if (toastId) toastEmitter.dismiss(toastId);
        if (toast?.success) {
          toastEmitter.emit({ type: 'success', message: toast.success });
        }

        return data;
      } catch (err) {
        const e = err as Error;
        if (e.name === 'AbortError' || e.name === 'CanceledError') return null;

        const fetchError = err as FetchError;
        setState({ data: null, loading: false, error: fetchError, status: 'error' });
        onErrorRef.current?.(fetchError);
        config.onError?.(fetchError);

        if (toastId) toastEmitter.dismiss(toastId);
        if (toast?.error) {
          toastEmitter.emit({ type: 'error', message: toast.error });
        }

        return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [url, method]
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState({ data: null, loading: false, error: null, status: 'idle' });
  }, []);

  return { ...state, mutate, reset };
}
