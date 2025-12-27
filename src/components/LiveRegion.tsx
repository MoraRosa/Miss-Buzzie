/**
 * Live Region component for screen reader announcements
 * Uses ARIA live regions to announce dynamic content changes
 */
import { useState, useEffect, useCallback, ReactNode } from "react";
import { LiveRegionContext } from "@/hooks/useLiveRegion";

interface LiveRegionProviderProps {
  children: ReactNode;
}

/**
 * Provider component that manages live region announcements
 * Wrap your app with this to enable screen reader announcements
 */
export function LiveRegionProvider({ children }: LiveRegionProviderProps) {
  const [politeMessage, setPoliteMessage] = useState("");
  const [assertiveMessage, setAssertiveMessage] = useState("");

  const announce = useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    if (priority === "assertive") {
      // Clear first to ensure re-announcement of same message
      setAssertiveMessage("");
      setTimeout(() => setAssertiveMessage(message), 50);
    } else {
      setPoliteMessage("");
      setTimeout(() => setPoliteMessage(message), 50);
    }
  }, []);

  // Clear messages after they've been announced
  useEffect(() => {
    if (politeMessage) {
      const timer = setTimeout(() => setPoliteMessage(""), 1000);
      return () => clearTimeout(timer);
    }
  }, [politeMessage]);

  useEffect(() => {
    if (assertiveMessage) {
      const timer = setTimeout(() => setAssertiveMessage(""), 1000);
      return () => clearTimeout(timer);
    }
  }, [assertiveMessage]);

  return (
    <LiveRegionContext.Provider value={{ announce }}>
      {children}
      
      {/* Polite live region - waits for user to finish current task */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>

      {/* Assertive live region - interrupts immediately */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </LiveRegionContext.Provider>
  );
}

export default LiveRegionProvider;

