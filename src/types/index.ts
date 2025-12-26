/**
 * Centralized type exports for the Mizzie application
 * Re-exports types from validators/schemas.ts and adds utility types
 */

// Re-export all types from schemas (single source of truth)
export type {
  // Business Model Canvas
  CanvasData,
  
  // SWOT Analysis
  SWOTItem,
  SWOTData,
  
  // Porter's Five Forces
  Factor,
  ForceData,
  PortersData,
  
  // Roadmap
  Milestone,
  
  // Checklist
  ChecklistItem,
  
  // Forecasting
  ForecastData,
  
  // Org Chart
  Role,
  
  // Pitch Deck
  Slide,
  
  // Market Research
  CustomerSegment,
  Competitor,
  Risk,
  Experiment,
  MarketResearchData,
  
  // Asset Management
  BrandAsset,
  BrandColors,
} from "@/lib/validators/schemas";

// ============ Utility Types ============

/**
 * Makes all properties of T optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Extracts the element type from an array type
 */
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

/**
 * Common props for components with save functionality
 */
export interface SaveableComponentProps {
  onSave?: () => void;
  autoSave?: boolean;
  debounceMs?: number;
}

/**
 * Common props for exportable components
 */
export interface ExportableComponentProps {
  elementId: string;
  filename: string;
}

/**
 * Toast notification types
 */
export type ToastVariant = "default" | "destructive";

export interface ToastMessage {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

/**
 * Common form field props
 */
export interface FormFieldProps {
  id: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Rating levels used across components
 */
export type RatingLevel = "low" | "medium" | "high";

/**
 * Likelihood/Impact levels for risk assessment
 */
export type LikelihoodLevel = "Low" | "Medium" | "High";
export type ImpactLevel = "Low" | "Medium" | "High";

/**
 * Theme types
 */
export type Theme = "light" | "dark" | "system";

/**
 * Export format types
 */
export type ExportFormat = "pdf" | "png" | "json" | "pptx";

/**
 * Tab identifiers for main navigation
 * Order: Canvas → Plan → Org → Brand → Name → SWOT → Porter's → Roadmap → Financials → Pitch → Tasks → Export
 */
export type TabId =
  | "canvas"
  | "businessplan"
  | "orgchart"
  | "branding"
  | "namecheck"
  | "swot"
  | "porters"
  | "roadmap"
  | "financials"
  | "pitch"
  | "checklist"
  | "exports";

