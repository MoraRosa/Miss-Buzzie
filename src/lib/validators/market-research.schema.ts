/**
 * Market Research validation schemas
 */
import { z } from "zod";

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

