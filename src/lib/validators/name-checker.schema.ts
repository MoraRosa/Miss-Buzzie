/**
 * Name Checker validation schemas
 */
import { z } from "zod";

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

