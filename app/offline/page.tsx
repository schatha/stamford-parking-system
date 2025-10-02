'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { WifiOff, RefreshCw, Home, Car } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        {/* App Logo/Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Car className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Stamford Parking
          </h1>
        </div>

        {/* Offline Message */}
        <Card>
          <CardContent className="text-center p-8">
            <WifiOff className="h-16 w-16 text-gray-600 mx-auto mb-4" />

            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              You're Offline
            </h2>

            <p className="text-gray-800 mb-6">
              It looks like you've lost your internet connection. Some features may not be available until you're back online.
            </p>

            {/* Offline Features */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2">
                Available Offline:
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• View cached parking zones</li>
                <li>• Review your vehicle information</li>
                <li>• Access recent parking history</li>
                <li>• View app settings</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[44px]"
                aria-label="Try to reconnect to the internet"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Try Again
              </button>

              <Link
                href="/dashboard"
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors min-h-[44px]"
              >
                <Home className="h-5 w-5 mr-2" />
                Go to Dashboard
              </Link>
            </div>

            {/* Help Text */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-700">
                The app will automatically sync your data when your connection is restored.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* PWA Install Reminder */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 text-sm">💡</span>
              </div>
              <div>
                <h4 className="font-medium text-green-900 mb-1">
                  Install the App
                </h4>
                <p className="text-sm text-green-700">
                  Install Stamford Parking on your home screen for faster access and better offline experience.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connection Status */}
        <div className="text-center">
          <div id="connection-status" className="inline-flex items-center px-3 py-2 rounded-full text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            <span className="text-gray-800">No Internet Connection</span>
          </div>
        </div>
      </div>

      {/* Connection Detection Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            function updateConnectionStatus() {
              const status = document.getElementById('connection-status');
              if (navigator.onLine) {
                status.innerHTML = '<div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div><span class="text-gray-800">Back Online - Refreshing...</span>';
                setTimeout(() => window.location.reload(), 1000);
              } else {
                status.innerHTML = '<div class="w-2 h-2 bg-red-500 rounded-full mr-2"></div><span class="text-gray-800">No Internet Connection</span>';
              }
            }

            window.addEventListener('online', updateConnectionStatus);
            window.addEventListener('offline', updateConnectionStatus);

            // Check every 10 seconds
            setInterval(() => {
              if (navigator.onLine) {
                fetch('/api/health-check', {
                  method: 'HEAD',
                  cache: 'no-cache'
                })
                .then(() => {
                  window.location.reload();
                })
                .catch(() => {
                  // Still offline
                });
              }
            }, 10000);
          `
        }}
      />
    </div>
  );
}