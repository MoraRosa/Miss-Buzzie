import { useCallback, useEffect, useRef, useState } from 'react';

interface BackupData {
  canvas?: string;
  pitchDeck?: string;
  roadmap?: string;
  orgChart?: string;
  checklist?: string;
  forecasting?: string;
  brandAssets?: string;
  marketResearch?: string;
  swot?: string;
  porters?: string;
  timestamp: string;
}

interface UseBackgroundSyncResult {
  /** Whether background sync is supported */
  isSupported: boolean;
  /** Whether the device is currently online */
  isOnline: boolean;
  /** Last sync timestamp */
  lastSyncTime: string | null;
  /** Trigger a backup sync */
  triggerBackup: () => Promise<void>;
}

/**
 * Custom hook for PWA background sync
 * Enables automatic data backup when the app goes online
 */
export function useBackgroundSync(): UseBackgroundSyncResult {
  const [isSupported, setIsSupported] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Use ref to track isSupported for use in callbacks without causing re-renders
  const isSupportedRef = useRef(isSupported);
  isSupportedRef.current = isSupported;

  const triggerBackupInternal = useCallback(async () => {
    if (!navigator.serviceWorker.controller) return;

    // Collect all data from localStorage
    const backupData: BackupData = {
      canvas: localStorage.getItem('mizzie-canvas') || undefined,
      pitchDeck: localStorage.getItem('mizzie-pitch-deck') || undefined,
      roadmap: localStorage.getItem('mizzie-roadmap') || undefined,
      orgChart: localStorage.getItem('mizzie-org-chart') || undefined,
      checklist: localStorage.getItem('mizzie-checklist') || undefined,
      forecasting: localStorage.getItem('mizzie-forecasting') || undefined,
      brandAssets: localStorage.getItem('mizzie-brand-assets') || undefined,
      marketResearch: localStorage.getItem('mizzie-market-research') || undefined,
      swot: localStorage.getItem('mizzie-swot') || undefined,
      porters: localStorage.getItem('mizzie-porters') || undefined,
      timestamp: new Date().toISOString(),
    };

    // Send to service worker for storage
    navigator.serviceWorker.controller.postMessage({
      type: 'BACKUP_DATA',
      payload: backupData,
    });

    // Update last sync time
    const now = new Date().toISOString();
    localStorage.setItem('mizzie-last-sync', now);
    setLastSyncTime(now);

    // Register for background sync if supported
    if (isSupportedRef.current) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync?.register('sync-backup');
        console.log('[BackgroundSync] Registered for sync');
      } catch (err) {
        console.error('[BackgroundSync] Failed to register:', err);
      }
    }
  }, []);

  useEffect(() => {
    // Check for Background Sync API support
    const checkSupport = async () => {
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          if (registration.sync) {
            setIsSupported(true);
          }
        } catch {
          setIsSupported(false);
        }
      }
    };

    checkSupport();

    // Online/offline listeners
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-trigger backup when coming online
      triggerBackupInternal();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load last sync time from localStorage
    const savedSyncTime = localStorage.getItem('mizzie-last-sync');
    if (savedSyncTime) {
      setLastSyncTime(savedSyncTime);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [triggerBackupInternal]);

  const triggerBackup = useCallback(async () => {
    await triggerBackupInternal();
  }, [triggerBackupInternal]);

  return {
    isSupported,
    isOnline,
    lastSyncTime,
    triggerBackup,
  };
}

export default useBackgroundSync;

