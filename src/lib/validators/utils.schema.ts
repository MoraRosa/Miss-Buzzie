/**
 * Utility functions for schema validation
 */
import { z } from "zod";

// Helper function to validate individual data items before storage
export const validateDataItem = <T>(
  rawData: string,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } => {
  try {
    const parsed = JSON.parse(rawData);
    const result = schema.safeParse(parsed);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.error.message };
  } catch {
    return { success: false, error: "Invalid JSON format" };
  }
};

