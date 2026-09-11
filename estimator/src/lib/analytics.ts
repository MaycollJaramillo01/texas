declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Sends a GA4 event (the Google tag is loaded in app/layout.tsx). Lead events
 * are imported into Google Ads as conversions. No-op if the tag is blocked.
 */
export function track(event: string, params?: Record<string, unknown>): void {
  window.gtag?.('event', event, params);
}
