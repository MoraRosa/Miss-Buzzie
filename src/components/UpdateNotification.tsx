import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAUpdate } from '@/hooks/usePWAUpdate';

/**
 * PWA Update Notification Banner
 * Shows when a new version of the app is available
 */
export function UpdateNotification() {
  const { updateAvailable, updateApp, dismissUpdate } = usePWAUpdate();

  if (!updateAvailable) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300"
    >
      <RefreshCw className="h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">New version available!</p>
        <p className="text-xs opacity-90">Refresh to get the latest features and fixes.</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="secondary"
          size="sm"
          onClick={updateApp}
          className="h-8 px-3 text-xs font-medium"
          aria-label="Refresh to update the application"
        >
          Update
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={dismissUpdate}
          className="h-8 w-8 text-primary-foreground hover:text-primary-foreground/80 hover:bg-primary-foreground/10"
          aria-label="Dismiss update notification"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

export default UpdateNotification;

