/**
 * Re-exports all validation schemas from domain-specific modules
 * This provides backward compatibility for existing imports from schemas.ts
 */

// Canvas
export {
  CanvasDataSchema,
  type CanvasData,
} from "./canvas.schema";

// SWOT
export {
  SWOTItemSchema,
  SWOTDataSchema,
  type SWOTItem,
  type SWOTData,
} from "./swot.schema";

// Porter's Five Forces
export {
  FactorSchema,
  ForceSchema,
  PortersDataSchema,
  type Factor,
  type PortersData,
} from "./porters.schema";

// Roadmap
export {
  MilestoneSchema,
  RoadmapDataSchema,
  type Milestone,
} from "./roadmap.schema";

// Checklist
export {
  ChecklistItemSchema,
  ChecklistDataSchema,
  type ChecklistItem,
} from "./checklist.schema";

// Financials
export {
  UseOfFundsItemSchema,
  FundingSourceItemSchema,
  YearlyProjectionSchema,
  PersonalAssetSchema,
  PersonalLiabilitySchema,
  FinancialsDataSchema,
  DEFAULT_FINANCIALS_DATA,
  ForecastDataSchema,
  type UseOfFundsItem,
  type FundingSourceItem,
  type YearlyProjection,
  type PersonalAsset,
  type PersonalLiability,
  type FinancialsData,
  type ForecastData,
} from "./financials.schema";

// Org Chart
export {
  RoleSchema,
  OrgChartDataSchema,
  type Role,
} from "./org-chart.schema";

// Pitch Deck
export {
  SlideImageSchema,
  SlideSchema,
  PitchDeckDataSchema,
  type Slide,
} from "./pitch-deck.schema";

// Market Research
export {
  CustomerSegmentSchema,
  CompetitorSchema,
  RiskSchema,
  ExperimentSchema,
  MarketResearchDataSchema,
  type CustomerSegment,
  type Competitor,
  type Risk,
  type Experiment,
  type MarketResearchData,
} from "./market-research.schema";

// Business Plan
export {
  SocialMediaEntrySchema,
  FundingSourceSchema,
  AssetEntrySchema,
  LiabilityEntrySchema,
  SupportAreaSchema,
  BusinessPlanDataSchema,
  DEFAULT_BUSINESS_PLAN_DATA,
  type SocialMediaEntry,
  type FundingSource,
  type AssetEntry,
  type LiabilityEntry,
  type SupportArea,
  type BusinessPlanData,
} from "./business-plan.schema";

// Assets
export {
  BrandAssetSchema,
  AssetsDataSchema,
  BrandColorsSchema,
  ImportDataSchema,
  type BrandAsset,
  type BrandColors,
  type ImportData,
} from "./assets.schema";

// Name Checker
export {
  DomainStatusSchema,
  DomainCheckSchema,
  SocialPlatformStatusSchema,
  SocialMediaCheckSchema,
  AppStoreCheckSchema,
  TrademarkCheckSchema,
  ActionableStepSchema,
  SavedBrandNameSchema,
  NameCheckerDataSchema,
  type DomainStatus,
  type DomainCheck,
  type SocialPlatformStatus,
  type SocialMediaCheck,
  type AppStoreCheck,
  type TrademarkCheck,
  type ActionableStep,
  type SavedBrandName,
  type NameCheckerData,
} from "./name-checker.schema";

// Utils
export { validateDataItem } from "./utils.schema";

