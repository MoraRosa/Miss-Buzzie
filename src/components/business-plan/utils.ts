/**
 * Business Plan Utilities
 *
 * Shared utility functions for the business plan module.
 * Follows single responsibility principle - each function does one thing.
 */

/**
 * Generate a unique ID for list items
 * Uses crypto.randomUUID() if available, falls back to Math.random()
 */
export const generateId = (prefix: string = "item"): string => {
  const uuid = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).substring(2, 10);
  return `${prefix}-${uuid}`;
};

/**
 * Sanitize user input to prevent XSS
 * Only allows safe characters for text fields
 */
export const sanitizeTextInput = (input: string): string => {
  if (!input) return "";
  // Remove any HTML tags and trim whitespace
  return input.replace(/<[^>]*>/g, "").trim();
};

/**
 * Format currency for display
 * Handles various input formats gracefully
 */
export const formatCurrency = (value: string, locale: string = "en-CA"): string => {
  if (!value) return "";
  // Remove non-numeric characters except decimal
  const numeric = value.replace(/[^0-9.]/g, "");
  const number = parseFloat(numeric);
  if (isNaN(number)) return value;
  
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

/**
 * Calculate net worth from assets and liabilities
 */
export const calculateNetWorth = (
  totalAssets: string,
  totalLiabilities: string
): string => {
  const assets = parseFloat(totalAssets.replace(/[^0-9.-]/g, "")) || 0;
  const liabilities = parseFloat(totalLiabilities.replace(/[^0-9.-]/g, "")) || 0;
  return (assets - liabilities).toString();
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return true; // Empty is valid (optional field)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  if (!url) return true; // Empty is valid (optional field)
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Calculate completion percentage for a phase
 * Returns a number between 0 and 100
 */
export const calculatePhaseCompletion = (
  filledFields: number,
  totalFields: number
): number => {
  if (totalFields === 0) return 0;
  return Math.round((filledFields / totalFields) * 100);
};

/**
 * Check if a string field has meaningful content
 */
export const hasContent = (value: string | undefined): boolean => {
  return Boolean(value && value.trim().length > 0);
};

/**
 * Parse a numeric string, returning 0 if invalid
 */
export const parseNumericString = (value: string): number => {
  if (!value) return 0;
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

