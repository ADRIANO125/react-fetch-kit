import React, { useState, useEffect, useCallback, type ReactNode } from 'react';
import { ToastItem, ToastContainerProps } from '../../types';
import { toastEmitter } from './toastEmitter';
import { injectStyle } from '../../utils/injectStyle';

const TOAST_CSS = `
.rfk-toast-container {
  position: fixed;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 380px;
  width: calc(100% - 32px);
  pointer-events: none;
}
.rfk-toast-container.top-right  { top: 20px; right: 20px; align-items: flex-end; }
.rfk-toast-container.top-left   { top: 20px; left: 20px;  align-items: flex-start; }
.rfk-toast-container.top-center { top: 20px; left: 50%; transform: translateX(-50%); align-items: center; }
.rfk-toast-container.bottom-right { bottom: 20px; right: 20px; align-items: flex-end; flex-direction: column-reverse; }
.rfk-toast-container.bottom-left  { bottom: 20px; left: 20px;  align-items: flex-start; flex-direction: column-reverse; }

.rfk-toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  border-radius: 12px;
  background: #1e1e2e;
  color: #cdd6f4;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 10px 30px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06);
  pointer-events: all;
  cursor: pointer;
  width: 100%;
  max-width: 380px;
  animation: rfk-slide-in 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.2);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.08);
  position: relative;
  overflow: hidden;
}
.rfk-toast.rfk-exit {
  animation: rfk-slide-out 0.25s ease-in forwards;
}
.rfk-toast-icon {
  font-size: 18px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.rfk-toast-bar {
  position: absolute;
  bottom: 0; left: 0;
  height: 3px;
  border-radius: 0 0 12px 12px;
  animation: rfk-bar linear forwards;
}

@keyframes rfk-slide-in {
  0% { opacity: 0; transform: translateY(-16px) scale(0.92); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes rfk-slide-out {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.95) translateY(-8px); }
}
@keyframes rfk-bar {
  from { width: 100%; }
  to   { width: 0%; }
}
@keyframes rfk-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

const ICONS: Record<ToastItem['type'], ReactNode> = {
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 11.5 14.5 15.5 9.5" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="8.5" strokeWidth="3" strokeLinecap="round" />
      <line x1="12" y1="12" x2="12" y2="16" />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  loading: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'rfk-spin 1s linear infinite' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ),
};

const COLORS: Record<ToastItem['type'], string> = {
  success: '#4ade80',
  error: '#f87171',
  info: '#60a5fa',
  warning: '#fbbf24',
  loading: '#a78bfa',
};

function Toast({
  toast,
  onRemove,
}: {
  toast: ToastItem;
  onRemove: (id: string) => void;
}) {
  const [exiting, setExiting] = useState(false);
  const duration = toast.type === 'loading' ? undefined : (toast.duration ?? 3500);
  const barColor = toast.color ?? COLORS[toast.type];

  const remove = useCallback(() => {
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 220);
  }, [toast.id, onRemove]);

  useEffect(() => {
    if (!duration) return;
    const t = setTimeout(remove, duration);
    return () => clearTimeout(t);
  }, [duration, remove]);

  useEffect(() => {
    const unsub = toastEmitter.onDismiss((id) => {
      if (!id || id === toast.id) remove();
    });
    return unsub;
  }, [toast.id, remove]);

  return (
    <div
      className={`rfk-toast${exiting ? ' rfk-exit' : ''}`}
      onClick={remove}
      role="alert"
      aria-live="polite"
    >
      <span className="rfk-toast-icon">{ICONS[toast.type]}</span>
      <span>{toast.message}</span>
      {duration && (
        <div
          className="rfk-toast-bar"
          style={{
            background: barColor,
            animationDuration: `${duration}ms`,
          }}
        />
      )}
    </div>
  );
}

export function ToastContainer({
  position = 'top-right',
  maxToasts = 5,
}: ToastContainerProps) {
  injectStyle('rfk-toast', TOAST_CSS);

  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsub = toastEmitter.onToast((payload) => {
      setToasts((prev) => {
        const next = [...prev, payload as ToastItem];
        return next.slice(-maxToasts);
      });
    });
    return unsub;
  }, [maxToasts]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div className={`rfk-toast-container ${position}`} aria-label="Notifications">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onRemove={remove} />
      ))}
    </div>
  );
}
