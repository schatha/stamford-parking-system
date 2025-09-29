'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { announceToScreenReader } from '@/lib/utils/accessibility';

interface AccessibleLayoutProps {
  children: ReactNode;
  skipToContentId?: string;
  pageTitle: string;
}

export function AccessibleLayout({
  children,
  skipToContentId = 'main-content',
  pageTitle
}: AccessibleLayoutProps) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);

  // Announce page changes to screen readers
  useEffect(() => {
    // Announce page change after a short delay to ensure page has loaded
    const timer = setTimeout(() => {
      announceToScreenReader(`Page loaded: ${pageTitle}`, 'polite');
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname, pageTitle]);

  // Set focus to main content on navigation
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.focus();
    }
  }, [pathname]);

  return (
    <>
      {/* Skip to content link */}
      <a
        href={`#${skipToContentId}`}
        className="skip-link"
        onFocus={(e) => {
          // Ensure the link is visible when focused
          e.currentTarget.style.left = '8px';
          e.currentTarget.style.top = '8px';
        }}
        onBlur={(e) => {
          // Hide the link when not focused
          e.currentTarget.style.left = '-9999px';
        }}
      >
        Skip to main content
      </a>

      {/* Accessibility announcement region */}
      <div
        id="accessibility-announcements"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Main content */}
      <main
        id={skipToContentId}
        ref={mainRef}
        tabIndex={-1}
        className="outline-none"
      >
        {children}
      </main>
    </>
  );
}

interface PageHeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
  className?: string;
  id?: string;
}

export function PageHeading({ level, children, className = '', id }: PageHeadingProps) {
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;

  const baseClasses = {
    1: 'text-3xl font-bold',
    2: 'text-2xl font-semibold',
    3: 'text-xl font-semibold',
    4: 'text-lg font-medium',
    5: 'text-base font-medium',
    6: 'text-sm font-medium'
  };

  return (
    <HeadingTag
      id={id}
      className={`${baseClasses[level]} ${className}`}
      tabIndex={-1}
    >
      {children}
    </HeadingTag>
  );
}

interface LandmarkProps {
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
}

export function NavigationLandmark({ children, ariaLabel, className }: LandmarkProps) {
  return (
    <nav aria-label={ariaLabel} className={className}>
      {children}
    </nav>
  );
}

export function ContentInfoLandmark({ children, ariaLabel, className }: LandmarkProps) {
  return (
    <footer aria-label={ariaLabel} className={className}>
      {children}
    </footer>
  );
}

export function BannerLandmark({ children, ariaLabel, className }: LandmarkProps) {
  return (
    <header aria-label={ariaLabel} className={className}>
      {children}
    </header>
  );
}

interface StatusMessageProps {
  children: ReactNode;
  type: 'success' | 'error' | 'warning' | 'info';
  className?: string;
  announce?: boolean;
}

export function StatusMessage({
  children,
  type,
  className = '',
  announce = true
}: StatusMessageProps) {
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (announce && statusRef.current) {
      const message = statusRef.current.textContent || '';
      const priority = type === 'error' ? 'assertive' : 'polite';
      announceToScreenReader(message, priority);
    }
  }, [children, announce, type]);

  const typeClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  return (
    <div
      ref={statusRef}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={`border rounded-lg p-4 ${typeClasses[type]} ${className}`}
    >
      <div className="flex items-start">
        <span className="mr-2 flex-shrink-0" aria-hidden="true">
          {iconMap[type]}
        </span>
        <div className="flex-1">
          <span className="sr-only">{type}: </span>
          {children}
        </div>
      </div>
    </div>
  );
}

interface ProgressIndicatorProps {
  value: number;
  max: number;
  label: string;
  className?: string;
}

export function ProgressIndicator({
  value,
  max,
  label,
  className = ''
}: ProgressIndicatorProps) {
  const percentage = Math.round((value / max) * 100);

  return (
    <div className={className}>
      <div className="flex justify-between text-sm font-medium mb-1">
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`${label}: ${percentage}% complete`}
        />
      </div>
    </div>
  );
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  label = 'Loading',
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        className={`animate-spin ${sizeClasses[size]} text-blue-600`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        role="img"
        aria-label={label}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}