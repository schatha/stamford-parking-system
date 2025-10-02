import { InputHTMLAttributes, forwardRef } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
  showPassword?: boolean;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({
    className = '',
    label,
    error,
    helperText,
    showPasswordToggle = false,
    onTogglePassword,
    showPassword = false,
    type,
    ...props
  }, ref) => {
    const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="space-y-1">
        <label htmlFor={props.id} className="block text-sm font-medium text-gray-900">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={`
              appearance-none block w-full px-3 py-3 border rounded-lg shadow-sm
              placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500
              focus:border-blue-500 transition-colors duration-200
              ${error
                ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 text-gray-900'
              }
              ${showPasswordToggle ? 'pr-12' : ''}
              ${className}
            `}
            {...props}
          />
          {showPasswordToggle && onTogglePassword && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={onTogglePassword}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-600 hover:text-gray-800" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-600 hover:text-gray-800" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600 flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-700">{helperText}</p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;