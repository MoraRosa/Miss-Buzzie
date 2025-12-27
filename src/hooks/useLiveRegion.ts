/**
 * Hook for accessing live region announcements
 * Used for screen reader accessibility
 */
import { createContext, useContext } from "react";

export interface LiveRegionContextType {
  announce: (message: string, priority?: "polite" | "assertive") => void;
}

export const LiveRegionContext = createContext<LiveRegionContextType | null>(null);

/**
 * Hook to access the live region announcer
 * Use this to announce dynamic content changes to screen readers
 * 
 * @example
 * const { announce } = useLiveRegion();
 * announce("Item saved successfully"); // polite announcement
 * announce("Error: Please fix the form", "assertive"); // urgent announcement
 */
export function useLiveRegion(): LiveRegionContextType {
  const context = useContext(LiveRegionContext);
  if (!context) {
    // Return a no-op if used outside provider (graceful degradation)
    return { announce: () => {} };
  }
  return context;
}

export default useLiveRegion;

