/**
 * Phase Registry
 * 
 * Central registry for all business plan journey phases.
 * To add a new phase:
 * 1. Create the component in src/components/business-plan/phases/
 * 2. Add a config entry to PHASE_CONFIGS
 * 3. Import and add to PHASE_COMPONENTS map
 * 
 * The registry pattern allows for:
 * - Easy addition of new phases
 * - Consistent validation across all phases
 * - Dynamic rendering based on configuration
 * - Conditional phases based on business type (new vs existing)
 */

import { lazy } from "react";
import {
  User, Building2, Package, TrendingUp, Users,
  Target, DollarSign, Wallet, Settings, AlertTriangle, PiggyBank, FileText
} from "lucide-react";
import { PhaseConfig, PhaseComponent } from "./types";
import { BusinessPlanData } from "@/lib/validators/schemas";

/**
 * Phase configurations
 * Order matters - this defines the journey sequence
 */
export const PHASE_CONFIGS: PhaseConfig[] = [
  {
    id: 1,
    slug: "about-you",
    name: "About You",
    icon: User,
    description: "Your background and experience",
    helpText: "Tell us about yourself - your skills, experience, and what support you need.",
    isComplete: (d: BusinessPlanData) => 
      d.languageProficiency.trim().length > 0 && d.relevantSkills.trim().length > 0,
  },
  {
    id: 2,
    slug: "business-profile",
    name: "Business Profile",
    icon: Building2,
    description: "Your business identity",
    helpText: "Define your business name, the problem you solve, and your solution.",
    isComplete: (d: BusinessPlanData) =>
      d.businessName.trim().length > 0 &&
      d.problemStatement.trim().length > 0 &&
      d.businessIdea.trim().length > 0,
  },
  {
    id: 3,
    slug: "products-services",
    name: "Products & Services",
    icon: Package,
    description: "What you offer",
    helpText: "Describe what you sell and how you deliver it to customers.",
    isComplete: (d: BusinessPlanData) => 
      d.productsServices.trim().length > 0 && d.howYouSell.trim().length > 0,
  },
  {
    id: 4,
    slug: "market-analysis",
    name: "Market Analysis",
    icon: TrendingUp,
    description: "Your market opportunity",
    helpText: "Analyze your market size, trends, and evidence of viability.",
    isComplete: (d: BusinessPlanData) => 
      d.marketDefinition.trim().length > 0 || d.tamCurrent.trim().length > 0,
  },
  {
    id: 5,
    slug: "customers",
    name: "Customers",
    icon: Users,
    description: "Who you serve",
    helpText: "Define your target customers and their needs.",
    isComplete: (d: BusinessPlanData) => 
      d.customerDescription.trim().length > 0 || d.customerSegments.length > 0,
  },
  {
    id: 6,
    slug: "competition",
    name: "Competition & Advantage",
    icon: Target,
    description: "Your competitive edge",
    helpText: "Analyze competitors and define what makes you different.",
    isComplete: (d: BusinessPlanData) => 
      d.competitors.length > 0 || d.howYouAreDifferent.trim().length > 0,
  },
  {
    id: 7,
    slug: "sales-revenue",
    name: "Sales & Revenue",
    icon: DollarSign,
    description: "Your revenue model",
    helpText: "Project your sales and explain how you'll achieve them.",
    isComplete: (d: BusinessPlanData) => 
      d.yearOneSalesTarget.trim().length > 0 || d.howYouCalculatedSales.trim().length > 0,
  },
  {
    id: 8,
    slug: "financing",
    name: "Financing",
    icon: Wallet,
    description: "Your funding needs",
    helpText: "Detail how much you need and where the money will come from.",
    isComplete: (d: BusinessPlanData) => 
      d.cashRequired.trim().length > 0 || d.useOfFunds.trim().length > 0,
  },
  {
    id: 9,
    slug: "operations",
    name: "Operations",
    icon: Settings,
    description: "How you operate",
    helpText: "Describe your distribution, regulations, and procurement.",
    isComplete: (d: BusinessPlanData) => 
      d.distributionChannels.trim().length > 0,
  },
  {
    id: 10,
    slug: "risks-plan",
    name: "Risks & Plan",
    icon: AlertTriangle,
    description: "Risk management",
    helpText: "Identify risks and your plan to address them.",
    isComplete: (d: BusinessPlanData) => 
      d.risks.length > 0 || d.entryPlan.trim().length > 0,
  },
  {
    id: 11,
    slug: "personal-finances",
    name: "Personal Finances",
    icon: PiggyBank,
    description: "Your financial position",
    helpText: "Document your personal assets and liabilities.",
    isComplete: (d: BusinessPlanData) =>
      d.assets.length > 0 || d.liabilities.length > 0,
  },
  {
    id: 12,
    slug: "summary",
    name: "Summary",
    icon: FileText,
    description: "Review & Export",
    helpText: "Preview your complete business plan and export it.",
    isComplete: (d: BusinessPlanData) =>
      d.completedPhases.length >= 11, // Complete when all other phases are done
  },
];

/**
 * Lazy-loaded phase components
 * Using lazy loading for better initial bundle size
 */
export const PHASE_COMPONENTS: Record<number, React.LazyExoticComponent<PhaseComponent>> = {
  1: lazy(() => import("./phases/AboutYouPhase")),
  2: lazy(() => import("./phases/BusinessProfilePhase")),
  3: lazy(() => import("./phases/ProductsServicesPhase")),
  4: lazy(() => import("./phases/MarketAnalysisPhase")),
  5: lazy(() => import("./phases/CustomersPhase")),
  6: lazy(() => import("./phases/CompetitionPhase")),
  7: lazy(() => import("./phases/SalesRevenuePhase")),
  8: lazy(() => import("./phases/FinancingPhase")),
  9: lazy(() => import("./phases/OperationsPhase")),
  10: lazy(() => import("./phases/RisksPlanPhase")),
  11: lazy(() => import("./phases/PersonalFinancesPhase")),
  12: lazy(() => import("./phases/SummaryPhase")),
};

/**
 * Helper functions for working with phases
 */
export const getPhaseConfig = (id: number): PhaseConfig | undefined => 
  PHASE_CONFIGS.find(p => p.id === id);

export const getPhaseBySlug = (slug: string): PhaseConfig | undefined =>
  PHASE_CONFIGS.find(p => p.slug === slug);

export const getTotalPhases = (): number => PHASE_CONFIGS.length;

export const getCompletedCount = (data: BusinessPlanData): number =>
  PHASE_CONFIGS.filter(p => p.isComplete(data)).length;

export const getProgress = (data: BusinessPlanData): number =>
  (getCompletedCount(data) / getTotalPhases()) * 100;

export const isJourneyComplete = (data: BusinessPlanData): boolean =>
  PHASE_CONFIGS.every(p => p.isComplete(data));

