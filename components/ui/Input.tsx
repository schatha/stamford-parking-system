import { InputHTMLAttributes, forwardRef, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isRequired?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, isRequired, required, ...props }, ref) => {
    const inputId = useId();
    const errorId = useId();
    const helperTextId = useId();

    const finalId = props.id || inputId;
    const isRequiredField = isRequired || required;

    const inputClasses = `android-input-fix block w-full px-4 py-3 border rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed text-base min-h-[44px] ${
      error
        ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300 text-gray-900 placeholder-gray-600'
    } ${className || ''}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={finalId}
            className="block text-sm font-medium text-gray-900 mb-1"
          >
            {label}
            {isRequiredField && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}
        <input
          ref={ref}
          id={finalId}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? errorId : helperText ? helperTextId : undefined
          }
          aria-required={isRequiredField}
          {...props}
        />
        {error && (
          <div
            id={errorId}
            className="mt-1 text-sm text-red-600"
            role="alert"
            aria-live="polite"
          >
            <span className="sr-only">Error: </span>
            {error}
          </div>
        )}
        {helperText && !error && (
          <p id={helperTextId} className="mt-1 text-sm text-gray-700">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;