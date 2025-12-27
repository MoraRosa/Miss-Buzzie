/**
 * Hook to monitor localStorage usage and provide warnings
 */
import { useState, useEffect, useCallback } from "react";

// localStorage limit is typically 5MB for most browsers
const STORAGE_LIMIT_BYTES = 5 * 1024 * 1024; // 5MB
const WARNING_THRESHOLD = 0.8; // 80%
const CRITICAL_THRESHOLD = 0.95; // 95%

export interface StorageInfo {
  /** Total bytes used */
  usedBytes: number;
  /** Storage limit in bytes */
  limitBytes: number;
  /** Usage as percentage (0-100) */
  usagePercent: number;
  /** Human-readable used size */
  usedFormatted: string;
  /** Human-readable limit */
  limitFormatted: string;
  /** Whether usage is in warning zone (>80%) */
  isWarning: boolean;
  /** Whether usage is critical (>95%) */
  isCritical: boolean;
  /** Breakdown by key */
  breakdown: StorageBreakdown[];
}

export interface StorageBreakdown {
  key: string;
  bytes: number;
  formatted: string;
  percent: number;
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get the size of a localStorage item in bytes
 */
function getItemSize(key: string): number {
  const item = localStorage.getItem(key);
  if (!item) return 0;
  // Each character in localStorage uses 2 bytes (UTF-16)
  return (key.length + item.length) * 2;
}

/**
 * Get total localStorage usage
 */
function calculateStorageUsage(): { total: number; breakdown: StorageBreakdown[] } {
  let total = 0;
  const breakdown: StorageBreakdown[] = [];

  // Only track Mizzie-related keys
  const mizzieKeys = [
    "businessModelCanvas",
    "businessPlan",
    "pitchDeck",
    "roadmap",
    "orgChart",
    "checklist",
    "forecasting",
    "financials",
    "brandAssets",
    "brandColors",
    "companyLogo",
    "swotAnalysis",
    "portersFiveForces",
    "nameChecker",
    "marketResearch",
    "aiSettings",
  ];

  for (const key of mizzieKeys) {
    try {
      const bytes = getItemSize(key);
      if (bytes > 0) {
        total += bytes;
        breakdown.push({
          key,
          bytes,
          formatted: formatBytes(bytes),
          percent: 0, // Will be calculated after total is known
        });
      }
    } catch {
      // Skip if item can't be accessed
    }
  }

  // Calculate percentages
  breakdown.forEach((item) => {
    item.percent = total > 0 ? (item.bytes / total) * 100 : 0;
  });

  // Sort by size descending
  breakdown.sort((a, b) => b.bytes - a.bytes);

  return { total, breakdown };
}

/**
 * Hook to monitor localStorage usage
 */
export function useStorageMonitor() {
  const [storageInfo, setStorageInfo] = useState<StorageInfo>(() => {
    const { total, breakdown } = calculateStorageUsage();
    const usagePercent = (total / STORAGE_LIMIT_BYTES) * 100;
    return {
      usedBytes: total,
      limitBytes: STORAGE_LIMIT_BYTES,
      usagePercent,
      usedFormatted: formatBytes(total),
      limitFormatted: formatBytes(STORAGE_LIMIT_BYTES),
      isWarning: usagePercent >= WARNING_THRESHOLD * 100,
      isCritical: usagePercent >= CRITICAL_THRESHOLD * 100,
      breakdown,
    };
  });

  const refresh = useCallback(() => {
    const { total, breakdown } = calculateStorageUsage();
    const usagePercent = (total / STORAGE_LIMIT_BYTES) * 100;
    setStorageInfo({
      usedBytes: total,
      limitBytes: STORAGE_LIMIT_BYTES,
      usagePercent,
      usedFormatted: formatBytes(total),
      limitFormatted: formatBytes(STORAGE_LIMIT_BYTES),
      isWarning: usagePercent >= WARNING_THRESHOLD * 100,
      isCritical: usagePercent >= CRITICAL_THRESHOLD * 100,
      breakdown,
    });
  }, []);

  // Refresh on mount and when storage changes
  useEffect(() => {
    refresh();

    // Listen for storage events (from other tabs)
    const handleStorage = () => refresh();
    window.addEventListener("storage", handleStorage);

    // Refresh periodically (every 30 seconds)
    const interval = setInterval(refresh, 30000);

    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, [refresh]);

  return { ...storageInfo, refresh };
}

export { formatBytes };

