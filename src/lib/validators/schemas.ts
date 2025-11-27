/**
 * Zod validation schemas for all localStorage data structures
 * Provides type-safe validation for data loading and prevents corrupted data issues
 */
import { z } from "zod";

// ============ Business Model Canvas ============
export const CanvasDataSchema = z.object({
  keyPartners: z.string().default(""),
  keyActivities: z.string().default(""),
  keyResources: z.string().default(""),
  valuePropositions: z.string().default(""),
  customerRelationships: z.string().default(""),
  channels: z.string().default(""),
  customerSegments: z.string().default(""),
  costStructure: z.string().default(""),
  revenueStreams: z.string().default(""),
});
export type CanvasData = z.infer<typeof CanvasDataSchema>;

// ============ SWOT Analysis ============
export const SWOTItemSchema = z.object({
  id: z.string(),
  text: z.string(),
});
export type SWOTItem = z.infer<typeof SWOTItemSchema>;

export const SWOTDataSchema = z.object({
  strengths: z.array(SWOTItemSchema).default([]),
  weaknesses: z.array(SWOTItemSchema).default([]),
  opportunities: z.array(SWOTItemSchema).default([]),
  threats: z.array(SWOTItemSchema).default([]),
});
export type SWOTData = z.infer<typeof SWOTDataSchema>;

// ============ Porter's Five Forces ============
export const FactorSchema = z.object({
  id: z.string(),
  text: z.string(),
});
export type Factor = z.infer<typeof FactorSchema>;

export const ForceSchema = z.object({
  rating: z.enum(["low", "medium", "high", ""]).default(""),
  factors: z.array(FactorSchema).default([]),
  notes: z.string().default(""),
});

export const PortersDataSchema = z.object({
  competitiveRivalry: ForceSchema.default({ rating: "", factors: [], notes: "" }),
  supplierPower: ForceSchema.default({ rating: "", factors: [], notes: "" }),
  buyerPower: ForceSchema.default({ rating: "", factors: [], notes: "" }),
  threatOfSubstitutes: ForceSchema.default({ rating: "", factors: [], notes: "" }),
  threatOfNewEntrants: ForceSchema.default({ rating: "", factors: [], notes: "" }),
});
export type PortersData = z.infer<typeof PortersDataSchema>;

// ============ Roadmap ============
export const MilestoneSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  timeframe: z.string(),
  category: z.enum(["1-year", "5-year", "10-year"]),
});
export type Milestone = z.infer<typeof MilestoneSchema>;

export const RoadmapDataSchema = z.array(MilestoneSchema).default([]);

// ============ Checklist ============
export const ChecklistItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  completed: z.boolean(),
  category: z.string(),
});
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;

export const ChecklistDataSchema = z.array(ChecklistItemSchema).default([]);

// ============ Forecasting ============
export const ForecastDataSchema = z.object({
  year1Revenue: z.string().default(""),
  year1Expenses: z.string().default(""),
  year2Revenue: z.string().default(""),
  year2Expenses: z.string().default(""),
  year3Revenue: z.string().default(""),
  year3Expenses: z.string().default(""),
  assumptions: z.string().default(""),
});
export type ForecastData = z.infer<typeof ForecastDataSchema>;

// ============ Org Chart ============
export const RoleSchema = z.object({
  id: z.string(),
  title: z.string(),
  name: z.string().default(""),
  department: z.string(),
  responsibilities: z.string(),
  reportsTo: z.string(),
  photoAssetId: z.string().optional(),
});
export type Role = z.infer<typeof RoleSchema>;

export const OrgChartDataSchema = z.array(RoleSchema).default([]);

// ============ Pitch Deck ============
export const SlideImageSchema = z.object({
  url: z.string(),
  size: z.enum(["small", "medium", "large", "full"]),
  alignment: z.enum(["left", "center", "right"]),
});

export const SlideSchema = z.object({
  title: z.string(),
  content: z.string(),
  images: z.array(SlideImageSchema).optional(),
});
export type Slide = z.infer<typeof SlideSchema>;

export const PitchDeckDataSchema = z.array(SlideSchema);

// ============ Market Research ============
export const CustomerSegmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  jtbd: z.string(),
  buyingTriggers: z.string(),
  procurementCycle: z.string(),
  budget: z.string(),
  quotes: z.string(),
});
export type CustomerSegment = z.infer<typeof CustomerSegmentSchema>;

export const CompetitorSchema = z.object({
  id: z.string(),
  name: z.string(),
  foundingYear: z.string(),
  hq: z.string(),
  fundingRevenue: z.string(),
  coreOffer: z.string(),
  pricingModel: z.string(),
  differentiators: z.string(),
  gtmMotion: z.string(),
  notableCustomers: z.string(),
});
export type Competitor = z.infer<typeof CompetitorSchema>;

export const RiskSchema = z.object({
  id: z.string(),
  description: z.string(),
  likelihood: z.enum(["Low", "Medium", "High"]),
  impact: z.enum(["Low", "Medium", "High"]),
});
export type Risk = z.infer<typeof RiskSchema>;

export const ExperimentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  costRange: z.string(),
});
export type Experiment = z.infer<typeof ExperimentSchema>;

export const MarketResearchDataSchema = z.object({
  marketDefinition: z.string().default(""),
  tamCurrent: z.string().default(""),
  samCurrent: z.string().default(""),
  somCurrent: z.string().default(""),
  tamProjection: z.string().default(""),
  samProjection: z.string().default(""),
  somProjection: z.string().default(""),
  tamAssumptions: z.string().default(""),
  customerSegments: z.array(CustomerSegmentSchema).default([]),
  competitors: z.array(CompetitorSchema).default([]),
  pricingInfo: z.string().default(""),
  distributionChannels: z.string().default(""),
  regulatoryInfo: z.string().default(""),
  trendsInfo: z.string().default(""),
  procurementInfo: z.string().default(""),
  risks: z.array(RiskSchema).default([]),
  entryPlan: z.string().default(""),
  experiments: z.array(ExperimentSchema).default([]),
});
export type MarketResearchData = z.infer<typeof MarketResearchDataSchema>;

// ============ Asset Manager ============
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

// ============ Import Data Schema ============
// Schema for validating imported backup files
export const ImportDataSchema = z.object({
  canvas: z.string().optional(),
  pitchDeck: z.string().optional(),
  roadmap: z.string().optional(),
  orgChart: z.string().optional(),
  checklist: z.string().optional(),
  forecasting: z.string().optional(),
  brandAssets: z.string().optional(),
  marketResearch: z.string().optional(),
  swot: z.string().optional(),
  porters: z.string().optional(),
  exportDate: z.string().optional(),
});
export type ImportData = z.infer<typeof ImportDataSchema>;

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
  } catch (e) {
    return { success: false, error: "Invalid JSON format" };
  }
};

