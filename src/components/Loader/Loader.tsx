import React from 'react';
import { LoaderProps } from '../../types';
import { injectStyle } from '../../utils/injectStyle';

const LOADER_CSS = `
.rfk-loader { display: inline-flex; align-items: center; justify-content: center; }

/* Sizes */
.rfk-loader.xs { --rfk-sz: 16px; --rfk-bw: 2px; }
.rfk-loader.sm { --rfk-sz: 24px; --rfk-bw: 2.5px; }
.rfk-loader.md { --rfk-sz: 36px; --rfk-bw: 3px; }
.rfk-loader.lg { --rfk-sz: 52px; --rfk-bw: 4px; }
.rfk-loader.xl { --rfk-sz: 72px; --rfk-bw: 5px; }

/* ── Spinner ── */
.rfk-spinner {
  width: var(--rfk-sz);
  height: var(--rfk-sz);
  border: var(--rfk-bw) solid rgba(0,0,0,0.1);
  border-top-color: var(--rfk-color);
  border-radius: 50%;
  animation: rfk-spin 0.7s linear infinite;
}

/* ── Ring (gradient) ── */
.rfk-ring {
  width: var(--rfk-sz);
  height: var(--rfk-sz);
  border-radius: 50%;
  border: var(--rfk-bw) solid transparent;
  border-top-color: var(--rfk-color);
  border-right-color: var(--rfk-color);
  animation: rfk-spin 0.8s linear infinite;
  box-shadow: 0 0 0 var(--rfk-bw) color-mix(in srgb, var(--rfk-color) 20%, transparent);
}

/* ── Dots ── */
.rfk-dots {
  display: flex;
  gap: calc(var(--rfk-sz) * 0.2);
  align-items: center;
}
.rfk-dots span {
  width: calc(var(--rfk-sz) * 0.28);
  height: calc(var(--rfk-sz) * 0.28);
  border-radius: 50%;
  background: var(--rfk-color);
  animation: rfk-bounce 1.1s ease-in-out infinite;
}
.rfk-dots span:nth-child(1) { animation-delay: 0s; }
.rfk-dots span:nth-child(2) { animation-delay: 0.18s; }
.rfk-dots span:nth-child(3) { animation-delay: 0.36s; }

/* ── Pulse ── */
.rfk-pulse {
  width: var(--rfk-sz);
  height: var(--rfk-sz);
  border-radius: 50%;
  background: var(--rfk-color);
  animation: rfk-pulse 1.2s ease-in-out infinite;
}

@keyframes rfk-spin    { to { transform: rotate(360deg); } }
@keyframes rfk-bounce  { 0%,100% { transform: translateY(0); opacity: 0.4; } 50% { transform: translateY(-40%); opacity: 1; } }
@keyframes rfk-pulse   { 0%,100% { transform: scale(0.6); opacity: 0.5; } 50% { transform: scale(1); opacity: 1; } }
`;

const SIZE_MAP: Record<NonNullable<LoaderProps['size']>, string> = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
};

export function Loader({
  color = '#4F8EF7',
  size = 'md',
  variant = 'spinner',
  className = '',
}: LoaderProps) {
  injectStyle('rfk-loader', LOADER_CSS);

  const cls = `rfk-loader ${SIZE_MAP[size]} ${className}`.trim();
  const style = { '--rfk-color': color } as React.CSSProperties;

  const inner = (() => {
    switch (variant) {
      case 'ring':
        return <div className="rfk-ring" />;
      case 'dots':
        return (
          <div className="rfk-dots">
            <span /><span /><span />
          </div>
        );
      case 'pulse':
        return <div className="rfk-pulse" />;
      default:
        return <div className="rfk-spinner" />;
    }
  })();

  return (
    <div className={cls} style={style} role="status" aria-label="Loading">
      {inner}
    </div>
  );
}
