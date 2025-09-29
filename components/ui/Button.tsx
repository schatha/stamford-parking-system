import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  srOnlyText?: string; // Screen reader only text for additional context
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    isLoading,
    loadingText = 'Loading...',
    srOnlyText,
    children,
    disabled,
    'aria-label': ariaLabel,
    ...props
  }, ref) => {
    const baseClasses = 'tap-target touch-target inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 active:bg-gray-800',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800',
      outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500 active:bg-gray-100',
    };

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm min-h-[44px]', // Touch-friendly minimum
      md: 'px-4 py-3 text-sm min-h-[44px]', // Touch-friendly minimum
      lg: 'px-6 py-4 text-base min-h-[48px]', // Larger for important actions
    };

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className || ''}`;

    // Enhanced aria-label for loading state
    const enhancedAriaLabel = isLoading
      ? `${ariaLabel || children?.toString() || 'Button'} ${loadingText}`
      : ariaLabel;

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        aria-label={enhancedAriaLabel}
        aria-busy={isLoading}
        aria-describedby={srOnlyText ? `${props.id}-description` : undefined}
        {...props}
      >
        {isLoading && (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
            <span className="sr-only">{loadingText}</span>
          </>
        )}
        {children}
        {srOnlyText && (
          <span id={`${props.id}-description`} className="sr-only">
            {srOnlyText}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;