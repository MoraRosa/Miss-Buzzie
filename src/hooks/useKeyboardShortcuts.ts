/**
 * Keyboard shortcuts hook for accessibility and power users
 */
import { useEffect, useCallback } from "react";

export interface KeyboardShortcut {
  /** Key combination (e.g., "ctrl+s", "alt+1") */
  key: string;
  /** Description for help dialog */
  description: string;
  /** Callback to execute */
  action: () => void;
  /** Whether to prevent default browser behavior */
  preventDefault?: boolean;
}

interface UseKeyboardShortcutsOptions {
  /** Whether shortcuts are enabled */
  enabled?: boolean;
  /** Shortcuts to register */
  shortcuts: KeyboardShortcut[];
}

/**
 * Parse a key combination string into its components
 */
function parseKeyCombo(combo: string): {
  key: string;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
} {
  const parts = combo.toLowerCase().split("+");
  const key = parts[parts.length - 1];
  
  return {
    key,
    ctrl: parts.includes("ctrl") || parts.includes("control"),
    alt: parts.includes("alt"),
    shift: parts.includes("shift"),
    meta: parts.includes("meta") || parts.includes("cmd"),
  };
}

/**
 * Check if the event matches the key combination
 */
function matchesKeyCombo(
  event: KeyboardEvent,
  combo: ReturnType<typeof parseKeyCombo>
): boolean {
  const eventKey = event.key.toLowerCase();

  // Handle special characters that require shift (like ?)
  // For these, we match the actual key character directly
  const isSpecialChar = combo.key === "?" || combo.key === "!" || combo.key === "@";

  if (isSpecialChar) {
    return eventKey === combo.key;
  }

  // Handle number keys and letter keys
  const keyMatches =
    eventKey === combo.key ||
    event.code.toLowerCase() === `digit${combo.key}` ||
    event.code.toLowerCase() === `key${combo.key}`;

  return (
    keyMatches &&
    event.ctrlKey === combo.ctrl &&
    event.altKey === combo.alt &&
    event.shiftKey === combo.shift &&
    event.metaKey === combo.meta
  );
}

/**
 * Hook to register keyboard shortcuts
 */
export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions) {
  const { enabled = true, shortcuts } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const combo = parseKeyCombo(shortcut.key);
        
        if (matchesKeyCombo(event, combo)) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled, handleKeyDown]);
}

/**
 * Common tab navigation shortcuts
 */
export const TAB_SHORTCUTS: { key: string; tab: string; description: string }[] = [
  { key: "alt+1", tab: "canvas", description: "Go to Canvas" },
  { key: "alt+2", tab: "businessplan", description: "Go to Business Plan" },
  { key: "alt+3", tab: "orgchart", description: "Go to Team & Org" },
  { key: "alt+4", tab: "branding", description: "Go to Branding" },
  { key: "alt+5", tab: "namecheck", description: "Go to Name Checker" },
  { key: "alt+6", tab: "swot", description: "Go to SWOT Analysis" },
  { key: "alt+7", tab: "porters", description: "Go to Porter's Five Forces" },
  { key: "alt+8", tab: "roadmap", description: "Go to Roadmap" },
  { key: "alt+9", tab: "financials", description: "Go to Financials" },
  { key: "alt+0", tab: "pitch", description: "Go to Pitch Deck" },
  { key: "alt+t", tab: "checklist", description: "Go to Tasks" },
  { key: "alt+e", tab: "exports", description: "Go to Export" },
];

export default useKeyboardShortcuts;

