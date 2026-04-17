import React from 'react';
import { EmptyStateProps } from '../../types';
import { injectStyle } from '../../utils/injectStyle';

const EMPTY_CSS = `
.rfk-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  gap: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.rfk-empty-icon {
  width: 52px;
  height: 52px;
  margin-bottom: 4px;
  opacity: 0.55;
  animation: rfk-float 3s ease-in-out infinite;
}
.rfk-empty-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: inherit;
  opacity: 0.85;
}
.rfk-empty-desc {
  margin: 0;
  font-size: 14px;
  opacity: 0.5;
  max-width: 280px;
  line-height: 1.6;
}
.rfk-empty-action { margin-top: 8px; }

@keyframes rfk-float {
  0%,100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
}
`;

const DefaultIcon = () => (
  <svg className="rfk-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);

export function EmptyState({
  icon,
  title = 'No data found',
  description,
  action,
  className = '',
}: EmptyStateProps) {
  injectStyle('rfk-empty', EMPTY_CSS);

  const renderedIcon = icon !== undefined ? icon : <DefaultIcon />;

  return (
    <div className={`rfk-empty ${className}`.trim()} role="status">
      {renderedIcon && <div className="rfk-empty-icon-wrap">{renderedIcon}</div>}
      {title && <h3 className="rfk-empty-title">{title}</h3>}
      {description && <p className="rfk-empty-desc">{description}</p>}
      {action && <div className="rfk-empty-action">{action}</div>}
    </div>
  );
}
