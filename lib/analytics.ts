// GA4 Analytics Helper
// Usage: import { trackEvent } from '@/lib/analytics'

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

export const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};

export const trackCTAClick = (
  location: 'hero' | 'pricing' | 'final' | 'nav',
  buttonText: string,
  destinationUrl: string
) => {
  trackEvent(`cta_click_${location}`, {
    page: window.location.pathname,
    button_text: buttonText,
    destination_url: destinationUrl,
  });
  trackEvent('gumroad_redirect', {
    page: window.location.pathname,
    cta_location: location,
    destination_url: destinationUrl,
  });
};
