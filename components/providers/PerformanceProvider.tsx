'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  SmartPrefetcher,
  preloadCriticalResources,
  measurePageLoad
} from '@/lib/utils/resourcePreloader';

interface PerformanceProviderProps {
  children: React.ReactNode;
}

export function PerformanceProvider({ children }: PerformanceProviderProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize performance monitoring
    measurePageLoad();

    // Preload critical resources
    preloadCriticalResources();

    // Setup smart prefetching
    const prefetcher = SmartPrefetcher.getInstance();
    prefetcher.setupHoverPrefetch();
    prefetcher.setupViewportPrefetch();

    // Report web vitals if available
    if ('web-vital' in window) {
      // Web Vitals reporting would go here
    }
  }, []);

  useEffect(() => {
    // Prefetch likely next routes based on current route
    const prefetcher = SmartPrefetcher.getInstance();
    prefetcher.prefetchLikelyRoutes(pathname);
  }, [pathname]);

  return <>{children}</>;
}

// Bundle analyzer helper (development only)
export function analyzeBundleSize() {
  if (process.env.NODE_ENV !== 'development') return;

  // This would integrate with webpack-bundle-analyzer
  console.log('Bundle analysis would run in development mode');
}