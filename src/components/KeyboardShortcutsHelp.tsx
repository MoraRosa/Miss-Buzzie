/**
 * Keyboard shortcuts help dialog
 * Shows available keyboard shortcuts for power users and accessibility
 */
import { useState, useEffect } from "react";
import { Keyboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TAB_SHORTCUTS } from "@/hooks/useKeyboardShortcuts";

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Format key for display (e.g., "alt+1" -> "Alt + 1")
function formatKey(key: string): string {
  return key
    .split("+")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" + ");
}

// Detect if user is on Mac
function isMac(): boolean {
  return typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
}

export default function KeyboardShortcutsHelp({ open, onOpenChange }: KeyboardShortcutsHelpProps) {
  const [showMacKeys, setShowMacKeys] = useState(false);

  useEffect(() => {
    setShowMacKeys(isMac());
  }, []);

  // Replace "Alt" with "Option" on Mac
  const formatKeyForPlatform = (key: string): string => {
    const formatted = formatKey(key);
    if (showMacKeys) {
      return formatted.replace("Alt", "⌥ Option");
    }
    return formatted;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate quickly
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* General Shortcuts */}
          <div>
            <h4 className="text-sm font-medium mb-2">General</h4>
            <div className="space-y-1">
              <ShortcutRow shortcut="?" description="Show this help" mac={showMacKeys} />
              <ShortcutRow shortcut="/" description="Focus search (if available)" mac={showMacKeys} />
            </div>
          </div>

          {/* Navigation Shortcuts */}
          <div>
            <h4 className="text-sm font-medium mb-2">Tab Navigation</h4>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {TAB_SHORTCUTS.map((shortcut) => (
                <ShortcutRow
                  key={shortcut.key}
                  shortcut={formatKeyForPlatform(shortcut.key)}
                  description={shortcut.description}
                  mac={showMacKeys}
                  formatted
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div>
            <h4 className="text-sm font-medium mb-2">Actions</h4>
            <div className="space-y-1">
              <ShortcutRow shortcut="Ctrl + S" description="Save current tab" mac={showMacKeys} />
              <ShortcutRow shortcut="Escape" description="Close dialogs" mac={showMacKeys} />
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">?</kbd> anytime to show this dialog
        </p>
      </DialogContent>
    </Dialog>
  );
}

// Helper component for shortcut rows
function ShortcutRow({
  shortcut,
  description,
  mac,
  formatted = false,
}: {
  shortcut: string;
  description: string;
  mac: boolean;
  formatted?: boolean;
}) {
  const displayShortcut = formatted
    ? shortcut
    : mac
    ? shortcut.replace("Ctrl", "⌘ Cmd")
    : shortcut;

  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-muted-foreground">{description}</span>
      <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
        {displayShortcut}
      </kbd>
    </div>
  );
}

