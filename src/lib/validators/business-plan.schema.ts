/**
 * Business Plan validation schemas
 */
import { z } from "zod";
import { CustomerSegmentSchema, CompetitorSchema, RiskSchema, ExperimentSchema } from "./market-research.schema";

// Social Media URL entry
export const SocialMediaEntrySchema = z.object({
  id: z.string(),
  platform: z.string(),
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
  category: z.string(),
  description: z.string().default(""),
  value: z.string().default(""),
});
export type AssetEntry = z.infer<typeof AssetEntrySchema>;

// Liability entry for personal financial statement
export const LiabilityEntrySchema = z.object({
  id: z.string(),
  category: z.string(),
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
  problemStatement: z.string().default(""),
  businessIdea: z.string().default(""),

  // Phase 3: Products & Services
  productsServices: z.string().default(""),
  howYouSell: z.string().default(""),
  hasImportExport: z.boolean().default(false),
  importExportDetails: z.string().default(""),

  // Phase 4: Market Analysis
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
  whyCustomersBuyFromYou: z.string().default(""),
  pricingInfo: z.string().default(""),

  // Phase 7: Sales & Revenue
  yearOneSalesTarget: z.string().default(""),
  firstYearSales: z.string().default(""),
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
  businessAchievements: z.string().default(""),

  // Phase 9: Operations
  distributionChannels: z.string().default(""),
  regulatoryInfo: z.string().default(""),
  procurementInfo: z.string().default(""),

  // Phase 10: Risks & Plan
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
  productsServices: "",
  howYouSell: "",
  hasImportExport: false,
  importExportDetails: "",
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
  customerDescription: "",
  customerSegments: [],
  competitors: [],
  whyCustomersPreferYou: "",
  howYouAreDifferent: "",
  whyCustomersBuyFromYou: "",
  pricingInfo: "",
  yearOneSalesTarget: "",
  firstYearSales: "",
  howYouCalculatedSales: "",
  unitsOrCustomersNeeded: "",
  firstSaleTarget: "",
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
  distributionChannels: "",
  regulatoryInfo: "",
  procurementInfo: "",
  risks: [],
  entryPlan: "",
  experiments: [],
  assets: [],
  liabilities: [],
  totalAssets: "",
  totalLiabilities: "",
  netWorth: "",
};

