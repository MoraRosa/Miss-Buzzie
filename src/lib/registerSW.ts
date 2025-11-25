// Register Service Worker for PWA functionality
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Register the service worker
      const registration = await navigator.serviceWorker.register('/Miss-Buzzie/sw.js', {
        scope: '/Miss-Buzzie/',
      });

      console.log('[PWA] Service Worker registered successfully:', registration);

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000); // Check every hour

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available, prompt user to refresh
              console.log('[PWA] New version available! Please refresh.');
              
              // You can show a toast/notification here
              if (confirm('A new version of Mizzie is available! Reload to update?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        }
      });

      // Handle controller change (new SW activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[PWA] New service worker activated');
      });

      return registration;
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
    }
  } else {
    console.log('[PWA] Service Workers not supported in this browser');
  }
};

// Unregister service worker (useful for development/debugging)
export const unregisterServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
      console.log('[PWA] Service Worker unregistered');
    }
  }
};

