// Toast event emitter — no React dependency, works across the tree
type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading';

interface ToastPayload {
  type: ToastType;
  message: string;
  duration?: number;
  color?: string;
}

type Listener = (payload: ToastPayload & { id: string }) => void;
type DismissListener = (id?: string) => void;

let listeners: Listener[] = [];
let dismissListeners: DismissListener[] = [];
let idCounter = 0;

export const toastEmitter = {
  emit(payload: ToastPayload): string {
    const id = `rfk-toast-${++idCounter}`;
    listeners.forEach((fn) => fn({ ...payload, id }));
    return id;
  },
  dismiss(id?: string) {
    dismissListeners.forEach((fn) => fn(id));
  },
  onToast(fn: Listener) {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter((l) => l !== fn);
    };
  },
  onDismiss(fn: DismissListener) {
    dismissListeners.push(fn);
    return () => {
      dismissListeners = dismissListeners.filter((l) => l !== fn);
    };
  },
};
