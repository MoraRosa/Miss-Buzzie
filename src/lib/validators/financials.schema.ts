/**
 * Financials validation schemas (consolidated financial data)
 */
import { z } from "zod";

// Use of Funds breakdown item
export const UseOfFundsItemSchema = z.object({
  id: z.string(),
  category: z.string(),
  amount: z.number(),
  description: z.string().default(""),
});
export type UseOfFundsItem = z.infer<typeof UseOfFundsItemSchema>;

// Funding source item (structured version)
export const FundingSourceItemSchema = z.object({
  id: z.string(),
  source: z.string(),
  amount: z.number(),
  notes: z.string().default(""),
  secured: z.boolean().default(false),
});
export type FundingSourceItem = z.infer<typeof FundingSourceItemSchema>;

// Yearly projection
export const YearlyProjectionSchema = z.object({
  year: z.number(),
  revenue: z.number().default(0),
  expenses: z.number().default(0),
  notes: z.string().default(""),
});
export type YearlyProjection = z.infer<typeof YearlyProjectionSchema>;

// Personal asset entry
export const PersonalAssetSchema = z.object({
  id: z.string(),
  category: z.string(),
  description: z.string().default(""),
  value: z.number().default(0),
});
export type PersonalAsset = z.infer<typeof PersonalAssetSchema>;

// Personal liability entry
export const PersonalLiabilitySchema = z.object({
  id: z.string(),
  category: z.string(),
  description: z.string().default(""),
  value: z.number().default(0),
  monthlyPayment: z.number().optional(),
});
export type PersonalLiability = z.infer<typeof PersonalLiabilitySchema>;

// Main Financials Data Schema
export const FinancialsDataSchema = z.object({
  fundingAsk: z.number().optional(),
  fundingStage: z.string().default(""),
  fundingPurpose: z.string().default(""),
  useOfFunds: z.array(UseOfFundsItemSchema).default([]),
  fundingSources: z.array(FundingSourceItemSchema).default([]),
  totalSecuredFunding: z.number().default(0),
  projections: z.array(YearlyProjectionSchema).default([
    { year: 1, revenue: 0, expenses: 0, notes: "" },
    { year: 2, revenue: 0, expenses: 0, notes: "" },
    { year: 3, revenue: 0, expenses: 0, notes: "" },
    { year: 5, revenue: 0, expenses: 0, notes: "" },
  ]),
  revenueModel: z.string().default(""),
  pricingStrategy: z.string().default(""),
  unitEconomics: z.string().default(""),
  yearOneSalesTarget: z.string().default(""),
  salesCalculationMethod: z.string().default(""),
  unitsOrCustomersNeeded: z.string().default(""),
  firstSaleTarget: z.string().default(""),
  startupCosts: z.number().optional(),
  monthlyBurnRate: z.number().optional(),
  runwayMonths: z.number().optional(),
  includePersonalFinances: z.boolean().default(false),
  personalAssets: z.array(PersonalAssetSchema).default([]),
  personalLiabilities: z.array(PersonalLiabilitySchema).default([]),
  assumptions: z.string().default(""),
  lastUpdated: z.string().optional(),
  currency: z.string().default("USD"),
});
export type FinancialsData = z.infer<typeof FinancialsDataSchema>;

// Default Financials Data
export const DEFAULT_FINANCIALS_DATA: FinancialsData = {
  fundingAsk: undefined,
  fundingStage: "",
  fundingPurpose: "",
  useOfFunds: [],
  fundingSources: [],
  totalSecuredFunding: 0,
  projections: [
    { year: 1, revenue: 0, expenses: 0, notes: "" },
    { year: 2, revenue: 0, expenses: 0, notes: "" },
    { year: 3, revenue: 0, expenses: 0, notes: "" },
    { year: 5, revenue: 0, expenses: 0, notes: "" },
  ],
  revenueModel: "",
  pricingStrategy: "",
  unitEconomics: "",
  yearOneSalesTarget: "",
  salesCalculationMethod: "",
  unitsOrCustomersNeeded: "",
  firstSaleTarget: "",
  startupCosts: undefined,
  monthlyBurnRate: undefined,
  runwayMonths: undefined,
  includePersonalFinances: false,
  personalAssets: [],
  personalLiabilities: [],
  assumptions: "",
  lastUpdated: undefined,
  currency: "USD",
};

// Legacy Forecasting (for migration compatibility)
// @deprecated - Use FinancialsData instead
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
  fundingAsk: z.number().optional(),
  fundingStage: z.string().default(""),
  useOfFunds: z.array(UseOfFundsItemSchema).default([]),
});
export type ForecastData = z.infer<typeof ForecastDataSchema>;

