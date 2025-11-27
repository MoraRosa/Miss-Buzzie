import { useState, useEffect, useCallback, useRef } from "react";
import { z } from "zod";

interface UseLocalStorageOptions<T> {
  /** Zod schema for validation - accepts any schema that outputs T */
  schema?: z.ZodType<T, z.ZodTypeDef, unknown>;
  /** Debounce delay in ms for auto-save (0 = immediate) */
  debounceMs?: number;
  /** Migration function to transform old data format */
  migrate?: (data: T) => T;
  /** Callback on save success */
  onSaveSuccess?: () => void;
  /** Callback on load/parse error */
  onError?: (error: Error) => void;
}

/**
 * Custom hook for localStorage with:
 * - Safe JSON parsing with try-catch
 * - Optional Zod schema validation
 * - Optional data migration for old formats
 * - Debounced auto-save
 * - Type safety
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, React.Dispatch<React.SetStateAction<T>>, { save: () => void; isLoading: boolean }] {
  const { schema, debounceMs = 0, migrate, onSaveSuccess, onError } = options;
  const [data, setData] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        let parsed = JSON.parse(saved);

        // Apply migration function if provided
        if (migrate) {
          parsed = migrate(parsed);
        }

        // Validate with Zod schema if provided
        if (schema) {
          const result = schema.safeParse(parsed);
          if (result.success) {
            setData(result.data);
          } else {
            console.warn(`[useLocalStorage] Validation failed for "${key}":`, result.error.errors);
            onError?.(new Error(`Validation failed: ${result.error.message}`));
            // Keep default value
          }
        } else {
          setData(parsed);
        }
      }
    } catch (error) {
      console.error(`[useLocalStorage] Failed to load "${key}":`, error);
      onError?.(error instanceof Error ? error : new Error(String(error)));
      // Keep default value on error
    } finally {
      setIsLoading(false);
    }
  }, [key, schema, migrate, onError]);

  // Save function
  const saveToStorage = useCallback(() => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      onSaveSuccess?.();
    } catch (error) {
      console.error(`[useLocalStorage] Failed to save "${key}":`, error);
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }, [key, data, onSaveSuccess, onError]);

  // Auto-save with debounce
  useEffect(() => {
    // Skip the initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounced save
    if (debounceMs > 0) {
      debounceTimerRef.current = setTimeout(() => {
        saveToStorage();
      }, debounceMs);
    } else {
      // Immediate save
      saveToStorage();
    }

    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [data, debounceMs, saveToStorage]);

  // Manual save function (bypasses debounce)
  const save = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    saveToStorage();
  }, [saveToStorage]);

  return [data, setData, { save, isLoading }];
}

export default useLocalStorage;

