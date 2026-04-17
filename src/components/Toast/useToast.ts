import { useState, useCallback, useEffect } from 'react';
import { toastEmitter } from './toastEmitter';
import { ToastItem, ToastOptions } from '../../types';

type ToastFn = (message: string, options?: ToastOptions) => string;

interface UseToastReturn {
  toast: {
    success: ToastFn;
    error: ToastFn;
    info: ToastFn;
    warning: ToastFn;
    loading: ToastFn;
    dismiss: (id?: string) => void;
  };
  toasts: ToastItem[];
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsubToast = toastEmitter.onToast((payload) => {
      setToasts((prev) => [...prev, payload as ToastItem]);
    });
    const unsubDismiss = toastEmitter.onDismiss((id) => {
      if (id) {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      } else {
        setToasts([]);
      }
    });
    return () => {
      unsubToast();
      unsubDismiss();
    };
  }, []);

  const make = useCallback(
    (type: ToastItem['type']): ToastFn =>
      (message, options = {}) =>
        toastEmitter.emit({ type, message, ...options }),
    []
  );

  return {
    toast: {
      success: make('success'),
      error: make('error'),
      info: make('info'),
      warning: make('warning'),
      loading: make('loading'),
      dismiss: (id) => toastEmitter.dismiss(id),
    },
    toasts,
  };
}
