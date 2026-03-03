'use client';

import { useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/analytics';

export default function ScrollTracker() {
  const firedRef = useRef<Set<number>>(new Set());
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const thresholds = [25, 50, 75, 100];

    const handleScroll = () => {
      const scrollHeight = document.body.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const depth = Math.round((window.scrollY / scrollHeight) * 100);

      for (const t of thresholds) {
        if (depth >= t && !firedRef.current.has(t)) {
          firedRef.current.add(t);
          trackEvent('scroll_depth', { depth: t, page: window.location.pathname });
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track time on page when leaving
  useEffect(() => {
    startTimeRef.current = Date.now();

    const handleBeforeUnload = () => {
      const seconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      trackEvent('time_on_page', {
        seconds,
        page: window.location.pathname,
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return null;
}
