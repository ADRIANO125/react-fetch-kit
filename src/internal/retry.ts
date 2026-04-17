export async function withRetry<T>(
  fn: (signal?: AbortSignal) => Promise<T>,
  maxRetries: number,
  delay: number,
  signal?: AbortSignal
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    try {
      return await fn(signal);
    } catch (err) {
      const e = err as Error;
      if (e.name === 'AbortError' || e.name === 'CanceledError') throw err;
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise<void>((res, rej) => {
          const t = setTimeout(res, delay * Math.pow(2, attempt));
          signal?.addEventListener('abort', () => {
            clearTimeout(t);
            rej(new DOMException('Aborted', 'AbortError'));
          });
        });
      }
    }
  }

  throw lastError;
}
