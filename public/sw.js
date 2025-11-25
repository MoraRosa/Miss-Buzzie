// Mizzie Service Worker
const CACHE_NAME = 'mizzie-v1';
const BASE_PATH = '/Miss-Buzzie';

// Assets to cache on install
const STATIC_ASSETS = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/favicon.ico`,
  `${BASE_PATH}/favicon-16x16.png`,
  `${BASE_PATH}/favicon-32x32.png`,
  `${BASE_PATH}/android-chrome-192x192.png`,
  `${BASE_PATH}/android-chrome-512x512.png`,
  `${BASE_PATH}/apple-touch-icon.png`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/images/logo.png`,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.error('[SW] Failed to cache some assets:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version
        return cachedResponse;
      }

      // Not in cache, fetch from network
      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the fetched resource
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch((err) => {
          console.error('[SW] Fetch failed:', err);
          // Return offline page if available
          return caches.match(`${BASE_PATH}/index.html`);
        });
    })
  );
});

// Handle messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

