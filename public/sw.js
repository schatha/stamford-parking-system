// Stamford Parking System Service Worker
const CACHE_NAME = 'stamford-parking-v1';
const OFFLINE_URL = '/offline';

// Assets to cache on install
const ESSENTIAL_ASSETS = [
  '/',
  '/dashboard',
  '/offline',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  // Add critical CSS and JS files
  '/_next/static/css/app/layout.css',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/main.js'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  '/api/zones',
  '/api/vehicles',
  '/api/sessions'
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Install');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching essential assets');
        return cache.addAll(ESSENTIAL_ASSETS);
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Error caching essential assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Claim all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Handle different types of requests
  if (request.method === 'GET') {
    if (isNavigationRequest(request)) {
      event.respondWith(handleNavigationRequest(request));
    } else if (isAPIRequest(url.pathname)) {
      event.respondWith(handleAPIRequest(request));
    } else if (isStaticAsset(url.pathname)) {
      event.respondWith(handleStaticAsset(request));
    }
  }
});

// Handle navigation requests (HTML pages)
async function handleNavigationRequest(request) {
  try {
    // Try network first for navigation
    const response = await fetch(request);

    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW] Network failed for navigation, trying cache');

    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page
    console.log('[SW] No cached response, returning offline page');
    return caches.match(OFFLINE_URL);
  }
}

// Handle API requests with network-first strategy
async function handleAPIRequest(request) {
  try {
    // Try network first
    const response = await fetch(request);

    if (response.ok) {
      // Cache successful API responses
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW] API network failed, trying cache');

    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return error response for API calls
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This feature is not available offline'
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  try {
    // Try cache first for static assets
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fetch from network and cache
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW] Failed to load static asset:', request.url);
    return new Response('Asset not available offline', { status: 404 });
  }
}

// Helper functions
function isNavigationRequest(request) {
  return request.mode === 'navigate' ||
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

function isAPIRequest(pathname) {
  return pathname.startsWith('/api/');
}

function isStaticAsset(pathname) {
  return pathname.startsWith('/_next/') ||
         pathname.includes('.') ||
         pathname.startsWith('/static/');
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'parking-session-sync') {
    event.waitUntil(syncParkingSessions());
  }
});

// Sync parking sessions when back online
async function syncParkingSessions() {
  try {
    // Get pending sessions from IndexedDB
    const pendingSessions = await getPendingSessions();

    for (const session of pendingSessions) {
      try {
        const response = await fetch('/api/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(session.data),
        });

        if (response.ok) {
          // Remove from pending queue
          await removePendingSession(session.id);

          // Notify client
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'SESSION_SYNCED',
                sessionId: session.id
              });
            });
          });
        }
      } catch (error) {
        console.error('[SW] Failed to sync session:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');

  const options = {
    body: 'Your parking session is about to expire',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'parking-expiry',
    data: {
      url: '/dashboard'
    },
    actions: [
      {
        action: 'extend',
        title: 'Extend Time',
        icon: '/action-extend.png'
      },
      {
        action: 'view',
        title: 'View Details',
        icon: '/action-view.png'
      }
    ],
    requireInteraction: true,
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification('Stamford Parking', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event.action);

  event.notification.close();

  if (event.action === 'extend') {
    // Handle extend action
    event.waitUntil(
      clients.openWindow('/dashboard/active-session/' + event.notification.data.sessionId)
    );
  } else if (event.action === 'view' || !event.action) {
    // Handle view or default click
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/dashboard')
    );
  }
});

// Message handling from clients
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      type: 'VERSION',
      version: CACHE_NAME
    });
  }
});

// Utility functions for IndexedDB operations
async function getPendingSessions() {
  // This would implement IndexedDB operations
  return [];
}

async function removePendingSession(sessionId) {
  // This would implement IndexedDB operations
  return true;
}