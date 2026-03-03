'use client';

import { useEffect, useRef } from 'react';
import { trackEvent, trackCTAClick } from '@/lib/analytics';

const GUMROAD_URL = 'https://bizmate.gumroad.com/l/ai-ceo-quick-start';

export default function AICEOTracker() {
  const hasFiredPricing = useRef(false);

  // Track ai_ceo_view on mount
  useEffect(() => {
    trackEvent('ai_ceo_view', { page: '/ai-ceo' });
  }, []);

  // Track scroll_to_pricing at 75% depth
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.body.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const depth = (window.scrollY / scrollHeight) * 100;

      if (depth >= 75 && !hasFiredPricing.current) {
        hasFiredPricing.current = true;
        trackEvent('scroll_to_pricing', { depth: 75, page: '/ai-ceo' });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Attach click handlers to all CTA links
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('a[data-cta]') as HTMLAnchorElement | null;
      if (!link) return;

      const href = link.href;
      if (!href.includes('gumroad')) return;

      // Determine CTA location based on position in page
      const rect = link.getBoundingClientRect();
      const scrollY = window.scrollY + rect.top;
      const pageHeight = document.body.scrollHeight;
      const ratio = scrollY / pageHeight;

      let location: 'hero' | 'pricing' | 'final' | 'nav' = 'hero';
      if (ratio < 0.05) location = 'nav';
      else if (ratio < 0.3) location = 'hero';
      else if (ratio > 0.85) location = 'final';
      else location = 'pricing';

      trackCTAClick(location, link.textContent?.trim() || '', GUMROAD_URL);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
}
