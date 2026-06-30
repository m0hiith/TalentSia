/**
 * Minimal logger — emits only in development so the production console stays
 * silent during normal use. Use instead of bare `console.*`. (P17)
 */
export const logger = {
  error: (...args: unknown[]): void => {
    if (import.meta.env.DEV) console.error(...args);
  },
  warn: (...args: unknown[]): void => {
    if (import.meta.env.DEV) console.warn(...args);
  },
};
