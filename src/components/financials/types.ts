/**
 * Financials Module Types
 * 
 * Shared types and constants for the Financials tab components.
 */

import { FinancialsData } from "@/lib/validators/schemas";

// Props for all section components
export interface FinancialsSectionProps {
  data: FinancialsData;
  updateData: (updates: Partial<FinancialsData>) => void;
  isPreview?: boolean;
}

// Funding stages
export const FUNDING_STAGES = [
  "Pre-seed",
  "Seed",
  "Series A",
  "Series B",
  "Series C+",
  "Bridge",
  "Bootstrapped (no external funding)",
] as const;

// Use of funds categories
export const USE_OF_FUNDS_CATEGORIES = [
  "Product Development",
  "Engineering/Tech",
  "Marketing & Sales",
  "Hiring/Team",
  "Operations",
  "Legal & Compliance",
  "Office/Equipment",
  "Working Capital",
  "R&D",
  "Inventory",
  "Other",
] as const;

// Funding source types
export const FUNDING_SOURCE_TYPES = [
  "Personal Investment",
  "Friends & Family",
  "Angel Investors",
  "Venture Capital",
  "Bank Loan",
  "Line of Credit",
  "Government Grant",
  "Crowdfunding",
  "Revenue/Bootstrapping",
  "Other",
] as const;

// Personal asset categories
export const PERSONAL_ASSET_CATEGORIES = [
  "Cash & Savings",
  "RRSP/TFSA/401k",
  "Investments/Stocks",
  "Vehicle",
  "Real Estate",
  "Business Equity",
  "Other",
] as const;

// Personal liability categories
export const PERSONAL_LIABILITY_CATEGORIES = [
  "Mortgage",
  "Vehicle Loan",
  "Student Loans",
  "Credit Cards",
  "Line of Credit",
  "Personal Loans",
  "Other",
] as const;

// Helper to generate unique IDs
export const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Format currency
export const formatCurrency = (amount: number, currency = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format large numbers compactly (supports K, M, B, T)
export const formatCompact = (amount: number): string => {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  if (absAmount >= 1_000_000_000_000) {
    return `${sign}$${(absAmount / 1_000_000_000_000).toFixed(1)}T`;
  }
  if (absAmount >= 1_000_000_000) {
    return `${sign}$${(absAmount / 1_000_000_000).toFixed(1)}B`;
  }
  if (absAmount >= 1_000_000) {
    return `${sign}$${(absAmount / 1_000_000).toFixed(1)}M`;
  }
  if (absAmount >= 1_000) {
    return `${sign}$${(absAmount / 1_000).toFixed(0)}K`;
  }
  return `${sign}$${absAmount}`;
};

// Calculate profit from projections
export const calculateProfit = (revenue: number, expenses: number): number => {
  return revenue - expenses;
};

// Calculate profit margin
export const calculateProfitMargin = (revenue: number, expenses: number): number => {
  if (revenue === 0) return 0;
  return ((revenue - expenses) / revenue) * 100;
};

