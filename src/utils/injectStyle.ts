const injectedStyles = new Set<string>();

export function injectStyle(id: string, css: string): void {
  if (typeof document === 'undefined') return;
  if (injectedStyles.has(id)) return;

  const style = document.createElement('style');
  style.setAttribute('data-rfk', id);
  style.textContent = css;
  document.head.appendChild(style);
  injectedStyles.add(id);
}
