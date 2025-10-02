'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  Car,
  MapPin,
  BarChart3,
  Menu,
  X,
  Settings,
  LogOut,
  User
} from 'lucide-react';
import { signOut } from 'next-auth/react';

interface MobileLayoutProps {
  children: ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMobileMenu]);

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      active: pathname === '/dashboard'
    },
    {
      name: 'Park Now',
      href: '/park',
      icon: MapPin,
      active: pathname.startsWith('/park')
    },
    {
      name: 'My Vehicles',
      href: '/dashboard/vehicles',
      icon: Car,
      active: pathname.startsWith('/dashboard/vehicles')
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
      active: pathname.startsWith('/dashboard/analytics')
    }
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="mobile-header bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Car className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Stamford Parking
              </h1>
              {session?.user?.name && (
                <p className="text-xs text-gray-700 truncate max-w-[120px]">
                  {session.user.name}
                </p>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="tap-target flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowMobileMenu(false)}
          />
          <div className="mobile-modal z-50">
            <div className="mobile-modal-header">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="tap-target flex items-center justify-center w-10 h-10 rounded-lg"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-2">
              {/* Navigation Items */}
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors tap-target ${
                    item.active
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}

              {/* Divider */}
              <div className="border-t border-gray-200 my-4" />

              {/* Account Actions */}
              <Link
                href="/profile"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors tap-target"
              >
                <User className="h-5 w-5" />
                <span className="font-medium">Profile Settings</span>
              </Link>

              <Link
                href="/settings"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors tap-target"
              >
                <Settings className="h-5 w-5" />
                <span className="font-medium">App Settings</span>
              </Link>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors tap-target"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="mobile-spacing">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="mobile-nav" role="navigation" aria-label="Main navigation">
        {navigationItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`mobile-nav-item tap-target ${
              item.active ? 'active' : ''
            }`}
            aria-current={item.active ? 'page' : undefined}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

interface MobileCardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export function MobileCard({
  children,
  className = '',
  padding = 'md'
}: MobileCardProps) {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <div className={`mobile-card bg-white ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}

interface MobileButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export function MobileButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
  type = 'button'
}: MobileButtonProps) {
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800',
    outline: 'border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[40px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[48px]'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        tap-target touch-target
        inline-flex items-center justify-center
        font-medium rounded-lg
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

interface MobileInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
}

export function MobileInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  helperText,
  required = false,
  className = ''
}: MobileInputProps) {
  return (
    <div className={`mobile-form-row ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`
          android-input-fix
          block w-full px-4 py-3
          border border-gray-300 rounded-lg
          bg-white text-gray-900 placeholder-gray-500
          min-h-[44px]
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 disabled:cursor-not-allowed
          ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
        `}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error || helperText ? `input-help` : undefined}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-700">
          {helperText}
        </p>
      )}
    </div>
  );
}