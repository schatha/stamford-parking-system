// Resource preloading utilities for better performance

interface PreloadOptions {
  as: 'script' | 'style' | 'image' | 'font' | 'fetch';
  crossOrigin?: 'anonymous' | 'use-credentials';
  type?: string;
  importance?: 'high' | 'low' | 'auto';
}

// Preload critical resources
export function preloadResource(href: string, options: PreloadOptions): void {
  if (typeof window === 'undefined') return;

  // Check if already preloaded
  const existing = document.querySelector(`link[rel="preload"][href="${href}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = options.as;

  if (options.crossOrigin) {
    link.crossOrigin = options.crossOrigin;
  }

  if (options.type) {
    link.type = options.type;
  }

  // Set importance if supported
  if ('importance' in link && options.importance) {
    (link as any).importance = options.importance;
  }

  document.head.appendChild(link);
}

// Preload critical app resources
export function preloadCriticalResources(): void {
  // Preload critical API endpoints
  preloadResource('/api/zones', {
    as: 'fetch',
    importance: 'high'
  });

  // Preload critical images (if any)
  preloadResource('/icon-192x192.png', {
    as: 'image',
    importance: 'high'
  });

  // Preload fonts if using custom fonts
  preloadResource('/fonts/geist-sans.woff2', {
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
    importance: 'high'
  });
}

// Prefetch resources for likely next pages
export function prefetchRoute(route: string): void {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = route;
  link.as = 'document';

  document.head.appendChild(link);
}

// Smart prefetching based on user behavior
export class SmartPrefetcher {
  private static instance: SmartPrefetcher;
  private prefetchedRoutes = new Set<string>();
  private hoverTimer: NodeJS.Timeout | null = null;

  static getInstance(): SmartPrefetcher {
    if (!SmartPrefetcher.instance) {
      SmartPrefetcher.instance = new SmartPrefetcher();
    }
    return SmartPrefetcher.instance;
  }

  // Prefetch on link hover with delay
  setupHoverPrefetch(): void {
    if (typeof window === 'undefined') return;

    document.addEventListener('mouseover', (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href^="/"]') as HTMLAnchorElement;

      if (!link || this.prefetchedRoutes.has(link.href)) return;

      this.hoverTimer = setTimeout(() => {
        this.prefetchRoute(link.href);
      }, 100); // Small delay to avoid prefetching on quick hovers
    });

    document.addEventListener('mouseout', () => {
      if (this.hoverTimer) {
        clearTimeout(this.hoverTimer);
        this.hoverTimer = null;
      }
    });
  }

  // Prefetch based on viewport intersection
  setupViewportPrefetch(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const link = entry.target as HTMLAnchorElement;
          if (link.href && !this.prefetchedRoutes.has(link.href)) {
            this.prefetchRoute(link.href);
          }
          observer.unobserve(link);
        }
      });
    }, {
      rootMargin: '100px' // Start prefetching when link is 100px away from viewport
    });

    // Observe all internal links
    document.querySelectorAll('a[href^="/"]').forEach((link) => {
      observer.observe(link);
    });
  }

  private prefetchRoute(href: string): void {
    if (this.prefetchedRoutes.has(href)) return;

    prefetchRoute(href);
    this.prefetchedRoutes.add(href);
  }

  // Prefetch likely next routes based on current route
  prefetchLikelyRoutes(currentRoute: string): void {
    const routePredictions: Record<string, string[]> = {
      '/dashboard': ['/park', '/dashboard/vehicles', '/dashboard/analytics'],
      '/auth/signin': ['/dashboard'],
      '/auth/signup': ['/dashboard/vehicles/add', '/dashboard'],
      '/park': ['/dashboard', '/dashboard/vehicles'],
      '/dashboard/vehicles': ['/park', '/dashboard/vehicles/add'],
      '/dashboard/analytics': ['/dashboard', '/park']
    };

    const nextRoutes = routePredictions[currentRoute];
    if (nextRoutes) {
      nextRoutes.forEach((route) => {
        if (!this.prefetchedRoutes.has(route)) {
          setTimeout(() => this.prefetchRoute(route), 1000); // Delay to not interfere with current page load
        }
      });
    }
  }
}

// API response caching
export class APICache {
  private static instance: APICache;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  static getInstance(): APICache {
    if (!APICache.instance) {
      APICache.instance = new APICache();
    }
    return APICache.instance;
  }

  set(key: string, data: any, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });

    // Cleanup old entries periodically
    if (this.cache.size > 100) {
      this.cleanup();
    }
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Progressive loading utilities
export function createProgressiveLoader() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          const src = element.dataset.src;

          if (src && element.tagName === 'IMG') {
            (element as HTMLImageElement).src = src;
            element.classList.remove('loading');
            observer.unobserve(element);
          }
        }
      });
    },
    {
      rootMargin: '50px'
    }
  );

  return {
    observe: (element: HTMLElement) => observer.observe(element),
    unobserve: (element: HTMLElement) => observer.unobserve(element),
    disconnect: () => observer.disconnect()
  };
}

// Critical CSS inlining utility
export function inlineCriticalCSS(css: string): void {
  if (typeof document === 'undefined') return;

  const style = document.createElement('style');
  style.textContent = css;
  style.setAttribute('data-critical', 'true');

  // Insert before any existing stylesheets
  const firstStylesheet = document.querySelector('link[rel="stylesheet"], style');
  if (firstStylesheet) {
    document.head.insertBefore(style, firstStylesheet);
  } else {
    document.head.appendChild(style);
  }
}

// Performance monitoring
export function measurePageLoad(): void {
  if (typeof window === 'undefined' || !('performance' in window)) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');

      const metrics = {
        // Core Web Vitals
        FCP: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        LCP: 0, // Would need separate measurement
        CLS: 0, // Would need separate measurement

        // Basic timing
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        loadComplete: navigation.loadEventEnd - navigation.navigationStart,
        ttfb: navigation.responseStart - navigation.navigationStart,
      };

      // Performance metrics collected

      // Send to analytics if needed
      // analytics.track('page_performance', metrics);
    }, 0);
  });
}