/**
 * Asset Manager validation schemas
 */
import { z } from "zod";

export const BrandAssetSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["image", "other"]),
  dataUrl: z.string(),
  uploadedAt: z.string(),
});
export type BrandAsset = z.infer<typeof BrandAssetSchema>;

export const AssetsDataSchema = z.array(BrandAssetSchema).default([]);

export const BrandColorsSchema = z.object({
  primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
});
export type BrandColors = z.infer<typeof BrandColorsSchema>;

// Import Data Schema for validating imported backup files
export const ImportDataSchema = z.object({
  canvas: z.string().optional(),
  pitchDeck: z.string().optional(),
  roadmap: z.string().optional(),
  orgChart: z.string().optional(),
  checklist: z.string().optional(),
  forecasting: z.string().optional(), // Legacy - for backward compatibility
  financials: z.string().optional(), // New consolidated financials
  brandAssets: z.string().optional(),
  marketResearch: z.string().optional(),
  businessPlan: z.string().optional(),
  swot: z.string().optional(),
  porters: z.string().optional(),
  nameChecker: z.string().optional(),
  exportDate: z.string().optional(),
});
export type ImportData = z.infer<typeof ImportDataSchema>;

