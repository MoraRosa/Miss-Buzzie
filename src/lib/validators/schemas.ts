/**
 * Zod validation schemas for all localStorage data structures
 *
 * This file re-exports all schemas from domain-specific modules for backward compatibility.
 * For new code, prefer importing directly from the domain-specific modules:
 *
 * @example
 * // Instead of:
 * import { CanvasDataSchema } from "@/lib/validators/schemas";
 *
 * // Prefer:
 * import { CanvasDataSchema } from "@/lib/validators/canvas.schema";
 * // Or use the barrel export:
 * import { CanvasDataSchema } from "@/lib/validators";
 */

// Re-export everything from the index for backward compatibility
export * from "./index";
