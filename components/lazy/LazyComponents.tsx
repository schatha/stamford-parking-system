'use client';

import dynamic from 'next/dynamic';
import { ComponentType, Suspense } from 'react';
import { LoadingSpinner } from '@/components/layout/AccessibleLayout';

// Loading component for heavy components
const LoadingFallback = ({ name }: { name: string }) => (
  <div className="flex items-center justify-center p-8">
    <LoadingSpinner label={`Loading ${name}`} />
  </div>
);

// Lazy load heavy chart components
export const LazyRevenueChart = dynamic(
  () => import('@/components/admin/RevenueChart').then(mod => ({
    default: mod.RevenueChart
  })),
  {
    loading: () => <LoadingFallback name="Revenue Chart" />,
    ssr: false // Charts don't need SSR
  }
);

export const LazyUsageChart = dynamic(
  () => import('@/components/admin/UsageChart').then(mod => ({
    default: mod.UsageChart
  })),
  {
    loading: () => <LoadingFallback name="Usage Chart" />,
    ssr: false
  }
);

// Lazy load analytics dashboard (heavy with charts)
export const LazyAnalyticsDashboard = dynamic(
  () => import('@/app/dashboard/analytics/page'),
  {
    loading: () => <LoadingFallback name="Analytics Dashboard" />,
    ssr: false
  }
);

// Lazy load payment form (has Stripe elements)
export const LazyPaymentForm = dynamic(
  () => import('@/components/parking/PaymentForm').then(mod => ({
    default: mod.PaymentForm
  })),
  {
    loading: () => <LoadingFallback name="Payment Form" />
  }
);

// Lazy load admin dashboard
export const LazyAdminDashboard = dynamic(
  () => import('@/app/admin/page'),
  {
    loading: () => <LoadingFallback name="Admin Dashboard" />
  }
);

// Lazy load enforcement demo
export const LazyEnforcementDemo = dynamic(
  () => import('@/app/demo/enforcement/page'),
  {
    loading: () => <LoadingFallback name="Enforcement Demo" />,
    ssr: false
  }
);

// Lazy load API documentation
export const LazyAPIDocumentation = dynamic(
  () => import('@/app/docs/api/page'),
  {
    loading: () => <LoadingFallback name="API Documentation" />
  }
);

// Lazy load accessibility demo
export const LazyAccessibilityDemo = dynamic(
  () => import('@/app/accessibility/page'),
  {
    loading: () => <LoadingFallback name="Accessibility Demo" />
  }
);

// Lazy load zone restrictions component
export const LazyZoneRestrictions = dynamic(
  () => import('@/components/parking/ZoneRestrictions').then(mod => ({
    default: mod.ZoneRestrictions
  })),
  {
    loading: () => <LoadingFallback name="Zone Restrictions" />
  }
);

// Generic lazy loader with suspense wrapper
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  loadingName: string = 'Component'
) {
  const LazyComponent = dynamic(() => Promise.resolve({ default: Component }), {
    loading: () => <LoadingFallback name={loadingName} />,
  });

  return function WrappedComponent(props: P) {
    return (
      <Suspense fallback={<LoadingFallback name={loadingName} />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Progressive image loading component
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  width?: number;
  height?: number;
}

export const LazyImage = dynamic(
  () => Promise.resolve(({ src, alt, className, placeholder, width, height }: LazyImageProps) => {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
        decoding="async"
        width={width}
        height={height}
        style={{
          backgroundColor: placeholder || '#f3f4f6',
          aspectRatio: width && height ? `${width}/${height}` : undefined
        }}
      />
    );
  }),
  {
    loading: () => <div className="bg-gray-200 animate-pulse rounded" />,
    ssr: false
  }
);

// Lazy load map components when needed
export const LazyMapComponent = dynamic(
  () => import('@/components/map/ParkingMap').catch(() =>
    // Fallback component if map fails to load
    Promise.resolve({
      default: () => (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-600">Map unavailable</p>
          <p className="text-sm text-gray-500 mt-1">
            Please check your internet connection
          </p>
        </div>
      )
    })
  ),
  {
    loading: () => <LoadingFallback name="Interactive Map" />,
    ssr: false
  }
);

// Code split utility for route-level components
export const createLazyRoute = (importFunction: () => Promise<any>, routeName: string) => {
  return dynamic(importFunction, {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner label={`Loading ${routeName}`} size="lg" />
      </div>
    )
  });
};