import { Suspense, lazy, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Settings, Download, Trash2, Loader2, RefreshCw, Bot, HardDrive } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useStorageMonitor } from "@/hooks/useStorageMonitor";
import AISettingsDialog from "@/components/AISettingsDialog";
import StorageUsageDialog from "@/components/StorageUsageDialog";

// Lazy load AssetManager
const AssetManager = lazy(() => import("@/components/AssetManager"));

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Header = () => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const storage = useStorageMonitor();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showAISettings, setShowAISettings] = useState(false);
  const [showStorageUsage, setShowStorageUsage] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  // Listen for PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      toast({
        title: "App installed!",
        description: "Mizzie has been added to your device",
      });
    }

    setDeferredPrompt(null);
    setCanInstall(false);
  };

  const handleClearAllData = () => {
    // Get all Mizzie-related localStorage keys
    const keysToRemove = [
      'businessModelCanvas',
      'businessPlan',
      'pitchDeck',
      'roadmap',
      'orgChart',
      'checklist',
      'forecasting',
      'brandAssets',
      'brandColors',
      'companyLogo',
      'swotAnalysis',
      'portersFiveForces',
      'nameChecker',
    ];

    keysToRemove.forEach(key => localStorage.removeItem(key));

    toast({
      title: "All data cleared",
      description: "Your business plan has been reset. Refreshing...",
    });

    // Reload to reset all components
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleForceUpdate = async () => {
    toast({
      title: "Clearing cache...",
      description: "Please wait while we fetch the latest version.",
    });

    try {
      // Unregister all service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
      }

      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      toast({
        title: "Cache cleared!",
        description: "Reloading with fresh content...",
      });

      // Hard reload
      setTimeout(() => {
        window.location.href = window.location.href.split('?')[0] + '?cache=' + Date.now();
      }, 500);
    } catch (error) {
      console.error('Force update failed:', error);
      // Fallback: just reload
      window.location.reload();
    }
  };

  return (
    <header
      className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="banner"
    >
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-3">
            <img
              src="/Miss-Buzzie/images/logo.png"
              alt="Mizzie Logo"
              className="h-8 w-8 md:h-10 md:w-10 rounded-lg object-contain shrink-0"
            />
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-foreground">Mizzie</h1>
              <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                Business Planning Made Simple
              </p>
            </div>
          </div>

          <nav
            className="flex items-center gap-1.5 md:gap-2"
            aria-label="Main actions"
          >
            <Suspense
              fallback={
                <div className="h-9 w-9 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              }
            >
              <AssetManager />
            </Suspense>

            {/* Settings Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-2 md:px-3"
                  aria-label="Settings"
                >
                  <Settings className="h-4 w-4 md:mr-2" aria-hidden="true" />
                  <span className="hidden md:inline">Settings</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {canInstall && (
                  <DropdownMenuItem onClick={handleInstallApp}>
                    <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                    Install App
                    <span className="ml-auto text-xs text-muted-foreground">PWA</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setShowAISettings(true)}>
                  <Bot className="h-4 w-4 mr-2" aria-hidden="true" />
                  AI Settings
                  <span className="ml-auto text-xs text-muted-foreground">Mizzie</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowStorageUsage(true)}>
                  <HardDrive className="h-4 w-4 mr-2" aria-hidden="true" />
                  Storage Usage
                  <span className={`ml-auto text-xs font-medium ${
                    storage.isCritical ? "text-red-500" :
                    storage.isWarning ? "text-yellow-500" : "text-muted-foreground"
                  }`}>
                    {storage.usagePercent.toFixed(0)}%
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleForceUpdate}>
                  <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                  Force Update
                  <span className="ml-auto text-xs text-muted-foreground">Clear cache</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowClearDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                  Clear All Data
                  <span className="ml-auto text-xs text-muted-foreground">Reset</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 shrink-0"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              <Sun
                className="h-4 w-4 md:h-5 md:w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
                aria-hidden="true"
              />
              <Moon
                className="absolute h-4 w-4 md:h-5 md:w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
                aria-hidden="true"
              />
            </Button>
          </nav>
        </div>
      </div>

      {/* Clear All Data Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your business plan data including your canvas,
              pitch deck, roadmap, org chart, and all other saved information.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAllData}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, clear everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AI Settings Dialog */}
      <AISettingsDialog open={showAISettings} onOpenChange={setShowAISettings} />

      {/* Storage Usage Dialog */}
      <StorageUsageDialog open={showStorageUsage} onOpenChange={setShowStorageUsage} />
    </header>
  );
};

export default Header;

