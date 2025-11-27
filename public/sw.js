// Mizzie Service Worker
const CACHE_NAME = "mizzie-v1";
const BASE_PATH = "/Miss-Buzzie";

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
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Caching static assets");
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.error("[SW] Failed to cache some assets:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches and notify clients
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Notify all clients that a new version is available
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: "SW_UPDATED" });
          });
        });
      })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
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
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
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
          console.error("[SW] Fetch failed:", err);
          // Return offline page if available
          return caches.match(`${BASE_PATH}/index.html`);
        });
    })
  );
});

// Handle messages from the client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  // Handle backup sync requests
  if (event.data && event.data.type === "BACKUP_DATA") {
    console.log("[SW] Received backup data for sync");
    // Store backup in IndexedDB for potential future cloud sync
    storeBackupData(event.data.payload);
  }
});

// IndexedDB for storing backup data
const DB_NAME = "mizzie-backup-db";
const DB_VERSION = 1;
const STORE_NAME = "backups";

function openBackupDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };
  });
}

async function storeBackupData(data) {
  try {
    const db = await openBackupDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    // Store with timestamp
    store.add({
      data,
      timestamp: new Date().toISOString(),
      synced: false,
    });

    console.log("[SW] Backup data stored in IndexedDB");
  } catch (err) {
    console.error("[SW] Failed to store backup:", err);
  }
}

// Background sync event (when online)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-backup") {
    console.log("[SW] Background sync triggered");
    event.waitUntil(syncBackupData());
  }
});

async function syncBackupData() {
  // This is where you would sync to a cloud service
  // For now, we just mark data as synced
  console.log("[SW] Syncing backup data...");

  try {
    const db = await openBackupDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const backups = request.result;
      // Mark all as synced (in future, would send to cloud)
      backups.forEach((backup) => {
        if (!backup.synced) {
          backup.synced = true;
          store.put(backup);
        }
      });
      console.log("[SW] Backup sync complete");
    };
  } catch (err) {
    console.error("[SW] Backup sync failed:", err);
  }
}
