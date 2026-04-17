import React from 'react';
import { SkeletonProps } from '../../types';
import { injectStyle } from '../../utils/injectStyle';

const SKELETON_CSS = `
.rfk-skeleton {
  background: var(--rfk-sk-color, #e0e0e0);
  background-image: linear-gradient(
    90deg,
    var(--rfk-sk-color, #e0e0e0) 0%,
    var(--rfk-sk-highlight, #f0f0f0) 50%,
    var(--rfk-sk-color, #e0e0e0) 100%
  );
  background-size: 200% 100%;
  animation: rfk-shimmer 1.5s ease-in-out infinite;
  border-radius: 6px;
  display: block;
}
.rfk-skeleton.circle { border-radius: 50%; }

.rfk-skeleton-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.06);
}
.rfk-skeleton-card .rfk-skeleton { width: 100%; }

@keyframes rfk-shimmer {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}
`;

export function Skeleton({
  width = '100%',
  height = '16px',
  variant = 'rect',
  color = '#e0e0e0',
  highlightColor = '#f5f5f5',
  borderRadius,
  count = 1,
  className = '',
}: SkeletonProps) {
  injectStyle('rfk-skeleton', SKELETON_CSS);

  const style = {
    '--rfk-sk-color': color,
    '--rfk-sk-highlight': highlightColor,
  } as React.CSSProperties;

  if (variant === 'card') {
    return (
      <div className="rfk-skeleton-card" style={style}>
        <div className="rfk-skeleton" style={{ height: '120px', borderRadius: '8px' }} />
        <div className="rfk-skeleton" style={{ height: '16px', width: '60%' }} />
        <div className="rfk-skeleton" style={{ height: '12px', width: '80%' }} />
        <div className="rfk-skeleton" style={{ height: '12px', width: '40%' }} />
      </div>
    );
  }

  const itemStyle: React.CSSProperties = {
    width: variant === 'circle' ? height : width,
    height,
    borderRadius: borderRadius ?? (variant === 'circle' ? '50%' : '6px'),
  };

  const items = Array.from({ length: count }, (_, i) => (
    <span
      key={i}
      className={`rfk-skeleton${variant === 'circle' ? ' circle' : ''} ${className}`.trim()}
      style={itemStyle}
    />
  ));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', ...style }}>
      {items}
    </div>
  );
}
