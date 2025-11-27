import { useState, useEffect, useCallback } from 'react';

interface UsePWAUpdateResult {
  /** Whether a new version is available */
  updateAvailable: boolean;
  /** Whether the service worker is supported */
  isSupported: boolean;
  /** Function to refresh the page and load new version */
  updateApp: () => void;
  /** Function to dismiss the update notification */
  dismissUpdate: () => void;
}

/**
 * Custom hook for managing PWA update notifications
 * Listens for service worker updates and provides UI state
 */
export function usePWAUpdate(): UsePWAUpdateResult {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    // Listen for messages from service worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SW_UPDATED') {
        console.log('[PWA] New version available');
        setUpdateAvailable(true);
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    // Check for waiting service worker on load
    navigator.serviceWorker.ready.then((registration) => {
      // If there's a waiting service worker, an update is available
      if (registration.waiting) {
        setUpdateAvailable(true);
      }

      // Listen for new service worker installing
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version installed and ready to take over
              setUpdateAvailable(true);
            }
          });
        }
      });
    });

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  const updateApp = useCallback(() => {
    // Reload the page to get the new version
    window.location.reload();
  }, []);

  const dismissUpdate = useCallback(() => {
    setUpdateAvailable(false);
  }, []);

  return {
    updateAvailable,
    isSupported,
    updateApp,
    dismissUpdate,
  };
}

export default usePWAUpdate;

