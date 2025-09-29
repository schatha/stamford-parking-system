'use client';

import { useState, useEffect } from 'react';
import { X, Download, Smartphone, Monitor } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS and Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /ipad|iphone|ipod/.test(userAgent);
    const isSafariDevice = /safari/.test(userAgent) && !/chrome/.test(userAgent);

    setIsIOS(isIOSDevice);
    setIsSafari(isSafariDevice);

    // Handle beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show install prompt after user has used the app for a bit
      setTimeout(() => {
        if (!isInstalled && !localStorage.getItem('pwa-install-dismissed')) {
          setShowPrompt(true);
        }
      }, 30000); // Wait 30 seconds before showing
    };

    // Handle app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);

      // Track installation
      if ('gtag' in window) {
        (window as any).gtag('event', 'pwa_install', {
          method: 'prompt'
        });
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // For iOS Safari, show manual install instructions after some usage
    if (isIOSDevice && isSafariDevice) {
      setTimeout(() => {
        if (!isInstalled && !localStorage.getItem('ios-install-dismissed')) {
          setShowPrompt(true);
        }
      }, 60000); // Wait 1 minute for iOS users
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        console.log(`User ${outcome} the install prompt`);

        if (outcome === 'accepted') {
          setIsInstalled(true);
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
      } catch (error) {
        console.error('Error during install prompt:', error);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');

    // Show again after 7 days
    setTimeout(() => {
      localStorage.removeItem('pwa-install-dismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  };

  const handleIOSDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('ios-install-dismissed', 'true');

    // Show again after 7 days
    setTimeout(() => {
      localStorage.removeItem('ios-install-dismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  // iOS Safari install instructions
  if (isIOS && isSafari) {
    return (
      <div className="fixed inset-x-4 bottom-4 z-50 md:max-w-sm md:left-auto md:right-4">
        <Card className="border-blue-200 bg-blue-50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Smartphone className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Install App</h3>
                  <p className="text-xs text-blue-700">Add to your home screen</p>
                </div>
              </div>
              <button
                onClick={handleIOSDismiss}
                className="text-blue-600 hover:text-blue-800 tap-target"
                aria-label="Dismiss install prompt"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-sm text-blue-800 space-y-2 mb-4">
              <p>Install Stamford Parking for:</p>
              <ul className="space-y-1 text-xs">
                <li>• Faster access from home screen</li>
                <li>• Better offline experience</li>
                <li>• Push notifications for expiring sessions</li>
              </ul>
            </div>

            <div className="bg-white border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
              <p className="font-medium mb-2">Installation steps:</p>
              <ol className="space-y-1">
                <li>1. Tap the Share button <span className="inline-block w-4 h-4 bg-blue-100 rounded text-center">↗</span></li>
                <li>2. Select "Add to Home Screen"</li>
                <li>3. Tap "Add" to confirm</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Standard PWA install prompt
  return (
    <div className="fixed inset-x-4 bottom-4 z-50 md:max-w-sm md:left-auto md:right-4">
      <Card className="border-blue-200 bg-blue-50 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Download className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Install Stamford Parking</h3>
                <p className="text-xs text-blue-700">Get the full app experience</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-blue-600 hover:text-blue-800 tap-target"
              aria-label="Dismiss install prompt"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="text-sm text-blue-800 mb-4">
            <p className="mb-2">Install the app for:</p>
            <ul className="space-y-1 text-xs">
              <li>• 🚀 Faster loading and smoother experience</li>
              <li>• 📱 Quick access from your home screen</li>
              <li>• 🔔 Push notifications for session reminders</li>
              <li>• 💾 Better offline functionality</li>
              <li>• 🎯 Reduced data usage</li>
            </ul>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={handleInstallClick}
              className="flex-1 h-10"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Install
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              size="sm"
              className="h-10"
            >
              Not Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Service Worker registration component
export function PWARegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', {
          scope: '/',
          updateViaCache: 'none'
        })
        .then((registration) => {
          console.log('SW registered: ', registration);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  console.log('New version available');

                  // Optionally show update available notification
                  if (confirm('A new version of the app is available. Refresh to update?')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });

      // Handle service worker updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('New service worker activated');
        window.location.reload();
      });
    }
  }, []);

  return null;
}

// PWA status detector hook
export function usePWAStatus() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const checkPWAStatus = () => {
      // Check if running as installed PWA
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                              (window.navigator as any).standalone ||
                              document.referrer.includes('android-app://');

      setIsStandalone(isStandaloneMode);
      setIsInstalled(isStandaloneMode);
    };

    checkPWAStatus();

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkPWAStatus);

    return () => {
      mediaQuery.removeEventListener('change', checkPWAStatus);
    };
  }, []);

  return { isInstalled, isStandalone };
}