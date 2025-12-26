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
  year5Revenue: z.string().default(""),
  year5Expenses: z.string().default(""),
  year10Revenue: z.string().default(""),
  year10Expenses: z.string().default(""),
  year15Revenue: z.string().default(""),
  year15Expenses: z.string().default(""),
  year25Revenue: z.string().default(""),
  year25Expenses: z.string().default(""),
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
  bio: z.string().default(""), // Professional bio for investor decks
  linkedinUrl: z.string().default(""), // LinkedIn profile URL
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

// ============ Business Plan (Comprehensive) ============

// Social Media URL entry
export const SocialMediaEntrySchema = z.object({
  id: z.string(),
  platform: z.string(), // e.g., "Facebook", "Twitter", "Instagram", "LinkedIn", "TikTok", etc.
  url: z.string().default(""),
});
export type SocialMediaEntry = z.infer<typeof SocialMediaEntrySchema>;

// Funding Source breakdown
export const FundingSourceSchema = z.object({
  personalInvestment: z.string().default(""),
  bankLoans: z.string().default(""),
  lineOfCredit: z.string().default(""),
  familySupport: z.string().default(""),
  grants: z.string().default(""),
  investors: z.string().default(""),
  other: z.string().default(""),
});
export type FundingSource = z.infer<typeof FundingSourceSchema>;

// Asset entry for personal financial statement
export const AssetEntrySchema = z.object({
  id: z.string(),
  category: z.string(), // e.g., "Cash", "RRSP", "Stocks", "Vehicle", "Property", "Other"
  description: z.string().default(""),
  value: z.string().default(""),
});
export type AssetEntry = z.infer<typeof AssetEntrySchema>;

// Liability entry for personal financial statement
export const LiabilityEntrySchema = z.object({
  id: z.string(),
  category: z.string(), // e.g., "Personal Loans", "Mortgage", "Credit Cards", "Student Loans", "Line of Credit", "Other"
  description: z.string().default(""),
  value: z.string().default(""),
});
export type LiabilityEntry = z.infer<typeof LiabilityEntrySchema>;

// Support area needed
export const SupportAreaSchema = z.object({
  id: z.string(),
  area: z.string(),
  selected: z.boolean().default(false),
});
export type SupportArea = z.infer<typeof SupportAreaSchema>;

// Complete Business Plan Data Schema
export const BusinessPlanDataSchema = z.object({
  // Meta
  currentPhase: z.number().default(1),
  currentStep: z.number().default(1),
  completedPhases: z.array(z.number()).default([]),
  isExistingBusiness: z.boolean().default(false),
  lastUpdated: z.string().optional(),

  // Phase 1: About You (Founder Profile)
  languageProficiency: z.string().default(""),
  hasBeenSelfEmployed: z.boolean().default(false),
  selfEmploymentDetails: z.string().default(""),
  hasEntrepreneurshipPrograms: z.boolean().default(false),
  entrepreneurshipProgramDetails: z.string().default(""),
  relevantSkills: z.string().default(""),
  needsLicense: z.boolean().default(false),
  licenseDetails: z.string().default(""),
  supportAreasNeeded: z.array(SupportAreaSchema).default([]),
  supportAreasOther: z.string().default(""),
  personalConstraints: z.string().default(""),

  // Phase 2: Business Profile
  businessName: z.string().default(""),
  businessAddress: z.string().default(""),
  businessEmail: z.string().default(""),
  businessWebsite: z.string().default(""),
  socialMediaUrls: z.array(SocialMediaEntrySchema).default([]),
  businessType: z.string().default(""),
  businessClassification: z.string().default(""),
  hasCurrentBusinessPlan: z.boolean().default(false),
  problemStatement: z.string().default(""), // What problem are you solving?
  businessIdea: z.string().default(""), // Your solution / unique value

  // Phase 3: Products & Services
  productsServices: z.string().default(""),
  howYouSell: z.string().default(""),
  hasImportExport: z.boolean().default(false),
  importExportDetails: z.string().default(""),

  // Phase 4: Market Analysis (includes existing market research fields)
  marketDefinition: z.string().default(""),
  tamCurrent: z.string().default(""),
  samCurrent: z.string().default(""),
  somCurrent: z.string().default(""),
  tamProjection: z.string().default(""),
  samProjection: z.string().default(""),
  somProjection: z.string().default(""),
  tamAssumptions: z.string().default(""),
  evidenceOfViability: z.string().default(""),
  customerSurveyResults: z.string().default(""),
  marketTrends: z.string().default(""),

  // Phase 5: Customers
  customerDescription: z.string().default(""),
  customerSegments: z.array(CustomerSegmentSchema).default([]),

  // Phase 6: Competition & Advantage
  competitors: z.array(CompetitorSchema).default([]),
  whyCustomersPreferYou: z.string().default(""),
  howYouAreDifferent: z.string().default(""),
  whyCustomersBuyFromYou: z.string().default(""), // For existing businesses
  pricingInfo: z.string().default(""),

  // Phase 7: Sales & Revenue
  yearOneSalesTarget: z.string().default(""),
  firstYearSales: z.string().default(""), // For existing businesses
  howYouCalculatedSales: z.string().default(""),
  unitsOrCustomersNeeded: z.string().default(""),
  firstSaleTarget: z.string().default(""),

  // Phase 8: Financing
  cashRequired: z.string().default(""),
  useOfFunds: z.string().default(""),
  fundingSources: FundingSourceSchema.default({
    personalInvestment: "",
    bankLoans: "",
    lineOfCredit: "",
    familySupport: "",
    grants: "",
    investors: "",
    other: "",
  }),
  whyStartBusiness: z.string().default(""),
  businessAchievements: z.string().default(""), // For existing businesses

  // Phase 9: Operations (existing fields)
  distributionChannels: z.string().default(""),
  regulatoryInfo: z.string().default(""),
  procurementInfo: z.string().default(""),

  // Phase 10: Risks & Plan (existing fields)
  risks: z.array(RiskSchema).default([]),
  entryPlan: z.string().default(""),
  experiments: z.array(ExperimentSchema).default([]),

  // Phase 11: Personal Financial Position
  assets: z.array(AssetEntrySchema).default([]),
  liabilities: z.array(LiabilityEntrySchema).default([]),
  totalAssets: z.string().default(""),
  totalLiabilities: z.string().default(""),
  netWorth: z.string().default(""),
});
export type BusinessPlanData = z.infer<typeof BusinessPlanDataSchema>;

// Default Business Plan Data
export const DEFAULT_BUSINESS_PLAN_DATA: BusinessPlanData = {
  currentPhase: 1,
  currentStep: 1,
  completedPhases: [],
  isExistingBusiness: false,
  lastUpdated: undefined,

  // Phase 1
  languageProficiency: "",
  hasBeenSelfEmployed: false,
  selfEmploymentDetails: "",
  hasEntrepreneurshipPrograms: false,
  entrepreneurshipProgramDetails: "",
  relevantSkills: "",
  needsLicense: false,
  licenseDetails: "",
  supportAreasNeeded: [],
  supportAreasOther: "",
  personalConstraints: "",

  // Phase 2
  businessName: "",
  businessAddress: "",
  businessEmail: "",
  businessWebsite: "",
  socialMediaUrls: [],
  businessType: "",
  businessClassification: "",
  hasCurrentBusinessPlan: false,
  problemStatement: "",
  businessIdea: "",

  // Phase 3
  productsServices: "",
  howYouSell: "",
  hasImportExport: false,
  importExportDetails: "",

  // Phase 4
  marketDefinition: "",
  tamCurrent: "",
  samCurrent: "",
  somCurrent: "",
  tamProjection: "",
  samProjection: "",
  somProjection: "",
  tamAssumptions: "",
  evidenceOfViability: "",
  customerSurveyResults: "",
  marketTrends: "",

  // Phase 5
  customerDescription: "",
  customerSegments: [],

  // Phase 6
  competitors: [],
  whyCustomersPreferYou: "",
  howYouAreDifferent: "",
  whyCustomersBuyFromYou: "",
  pricingInfo: "",

  // Phase 7
  yearOneSalesTarget: "",
  firstYearSales: "",
  howYouCalculatedSales: "",
  unitsOrCustomersNeeded: "",
  firstSaleTarget: "",

  // Phase 8
  cashRequired: "",
  useOfFunds: "",
  fundingSources: {
    personalInvestment: "",
    bankLoans: "",
    lineOfCredit: "",
    familySupport: "",
    grants: "",
    investors: "",
    other: "",
  },
  whyStartBusiness: "",
  businessAchievements: "",

  // Phase 9
  distributionChannels: "",
  regulatoryInfo: "",
  procurementInfo: "",

  // Phase 10
  risks: [],
  entryPlan: "",
  experiments: [],

  // Phase 11
  assets: [],
  liabilities: [],
  totalAssets: "",
  totalLiabilities: "",
  netWorth: "",
};

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
  businessPlan: z.string().optional(),
  swot: z.string().optional(),
  porters: z.string().optional(),
  nameChecker: z.string().optional(),
  exportDate: z.string().optional(),
});
export type ImportData = z.infer<typeof ImportDataSchema>;

// ============ Name Checker ============
export const DomainStatusSchema = z.enum(["available", "taken", "unknown", "checking"]);
export type DomainStatus = z.infer<typeof DomainStatusSchema>;

export const DomainCheckSchema = z.object({
  domain: z.string(),
  tld: z.string(),
  status: DomainStatusSchema.default("unknown"),
  checkedAt: z.string().optional(),
  registrarLink: z.string().optional(),
});
export type DomainCheck = z.infer<typeof DomainCheckSchema>;

export const SocialPlatformStatusSchema = z.enum(["available", "taken", "unknown", "checking"]);
export type SocialPlatformStatus = z.infer<typeof SocialPlatformStatusSchema>;

export const SocialMediaCheckSchema = z.object({
  platform: z.string(),
  handle: z.string(),
  status: SocialPlatformStatusSchema.default("unknown"),
  checkedAt: z.string().optional(),
  profileUrl: z.string().optional(),
  searchUrl: z.string(),
});
export type SocialMediaCheck = z.infer<typeof SocialMediaCheckSchema>;

export const AppStoreCheckSchema = z.object({
  store: z.enum(["apple", "google"]),
  name: z.string(),
  status: z.enum(["available", "taken", "unknown", "checking"]).default("unknown"),
  checkedAt: z.string().optional(),
  searchUrl: z.string(),
});
export type AppStoreCheck = z.infer<typeof AppStoreCheckSchema>;

export const TrademarkCheckSchema = z.object({
  country: z.string(),
  countryCode: z.string(),
  office: z.string(),
  searchUrl: z.string(),
  status: z.enum(["clear", "conflict", "unknown", "checking"]).default("unknown"),
  checkedAt: z.string().optional(),
  notes: z.string().default(""),
});
export type TrademarkCheck = z.infer<typeof TrademarkCheckSchema>;

export const ActionableStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  priority: z.enum(["high", "medium", "low"]),
  category: z.enum(["domain", "social", "trademark", "appstore", "other"]),
  completed: z.boolean().default(false),
  link: z.string().optional(),
});
export type ActionableStep = z.infer<typeof ActionableStepSchema>;

export const SavedBrandNameSchema = z.object({
  id: z.string(),
  name: z.string(),
  slogan: z.string().default(""),
  createdAt: z.string(),
  lastCheckedAt: z.string().optional(),
  overallScore: z.number().min(0).max(100).optional(),
  domains: z.array(DomainCheckSchema).default([]),
  socialMedia: z.array(SocialMediaCheckSchema).default([]),
  appStores: z.array(AppStoreCheckSchema).default([]),
  trademarks: z.array(TrademarkCheckSchema).default([]),
  actionableSteps: z.array(ActionableStepSchema).default([]),
  notes: z.string().default(""),
  isFavorite: z.boolean().default(false),
});
export type SavedBrandName = z.infer<typeof SavedBrandNameSchema>;

export const NameCheckerDataSchema = z.object({
  currentBrandName: z.string().default(""),
  currentSlogan: z.string().default(""),
  selectedCountry: z.string().default("US"),
  savedNames: z.array(SavedBrandNameSchema).default([]),
  checkHistory: z.array(z.object({
    name: z.string(),
    checkedAt: z.string(),
  })).default([]),
  settings: z.object({
    defaultTlds: z.array(z.string()).default([".com", ".ca", ".io", ".co", ".net", ".org", ".app"]),
    defaultPlatforms: z.array(z.string()).default(["twitter", "instagram", "tiktok", "youtube", "facebook", "linkedin"]),
  }).default({
    defaultTlds: [".com", ".ca", ".io", ".co", ".net", ".org", ".app"],
    defaultPlatforms: ["twitter", "instagram", "tiktok", "youtube", "facebook", "linkedin"],
  }),
});
export type NameCheckerData = z.infer<typeof NameCheckerDataSchema>;

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

