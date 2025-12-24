/**
 * Station Registry for Name Checker Journey
 * 
 * Follows the same pattern as branding/stationRegistry.ts
 * 6 stations: Enter Name → Domains → Social → Trademarks → Score → Action Plan
 */

import { lazy } from "react";
import {
  Sparkles, Globe, Users, Scale, Trophy, ClipboardList, FileText
} from "lucide-react";
import type { StationConfig, StationComponent } from "./types";
import type { SavedBrandName } from "@/lib/validators/schemas";

/**
 * Station configurations - order defines the journey sequence
 */
export const STATION_CONFIGS: StationConfig[] = [
  {
    id: 1,
    slug: "name",
    name: "Brand Name",
    icon: Sparkles,
    description: "Enter your brand name",
    helpText: "Choose a memorable, unique name that represents your brand identity",
    color: "from-amber-500 to-orange-500",
    isComplete: (s: SavedBrandName) => s.name.trim().length > 0,
    getProgress: (s: SavedBrandName) => s.name.trim().length > 0 ? 100 : 0,
  },
  {
    id: 2,
    slug: "domains",
    name: "Domains",
    icon: Globe,
    description: "Check domain availability",
    helpText: "Secure your online presence with the right domain names",
    color: "from-blue-500 to-cyan-500",
    isComplete: (s: SavedBrandName) => 
      s.domains.length > 0 && s.domains.some(d => d.status !== "unknown"),
    getProgress: (s: SavedBrandName) => {
      if (s.domains.length === 0) return 0;
      const checked = s.domains.filter(d => d.status !== "unknown").length;
      return Math.round((checked / s.domains.length) * 100);
    },
  },
  {
    id: 3,
    slug: "social",
    name: "Social Media",
    icon: Users,
    description: "Check social handle availability",
    helpText: "Claim your brand's presence across all major platforms",
    color: "from-purple-500 to-pink-500",
    isComplete: (s: SavedBrandName) => 
      s.socialMedia.length > 0 && s.socialMedia.some(sm => sm.status !== "unknown"),
    getProgress: (s: SavedBrandName) => {
      if (s.socialMedia.length === 0) return 0;
      const checked = s.socialMedia.filter(sm => sm.status !== "unknown").length;
      return Math.round((checked / s.socialMedia.length) * 100);
    },
  },
  {
    id: 4,
    slug: "trademark",
    name: "Trademarks",
    icon: Scale,
    description: "Verify trademark availability",
    helpText: "Protect your brand legally in your target markets",
    color: "from-amber-500 to-yellow-500",
    isComplete: (s: SavedBrandName) => 
      s.trademarks.length > 0 && s.trademarks.some(t => t.status !== "unknown"),
    getProgress: (s: SavedBrandName) => {
      if (s.trademarks.length === 0) return 0;
      const checked = s.trademarks.filter(t => t.status !== "unknown").length;
      return Math.round((checked / s.trademarks.length) * 100);
    },
  },
  {
    id: 5,
    slug: "score",
    name: "Brand Score",
    icon: Trophy,
    description: "View your brand strength",
    helpText: "See how your brand name stacks up across all categories",
    color: "from-green-500 to-emerald-500",
    isComplete: (s: SavedBrandName) => s.overallScore !== undefined && s.overallScore > 0,
    getProgress: (s: SavedBrandName) => s.overallScore || 0,
  },
  {
    id: 6,
    slug: "actions",
    name: "Action Plan",
    icon: ClipboardList,
    description: "Get your next steps",
    helpText: "A personalized checklist to secure your brand",
    color: "from-rose-500 to-red-500",
    isComplete: (s: SavedBrandName) =>
      s.actionableSteps.length > 0 && s.actionableSteps.some(step => step.completed),
    getProgress: (s: SavedBrandName) => {
      if (s.actionableSteps.length === 0) return 0;
      const completed = s.actionableSteps.filter(step => step.completed).length;
      return Math.round((completed / s.actionableSteps.length) * 100);
    },
  },
  {
    id: 7,
    slug: "report",
    name: "Brand Report",
    icon: FileText,
    description: "Export your brand report",
    helpText: "Download a comprehensive report with all your brand data",
    color: "from-indigo-500 to-violet-500",
    isComplete: () => true, // Always accessible
    getProgress: () => 100,
  },
];

/**
 * Lazy-loaded station components
 */
export const STATION_COMPONENTS: Record<number, React.LazyExoticComponent<StationComponent>> = {
  1: lazy(() => import("./stations/NameStation")),
  2: lazy(() => import("./stations/DomainStation")),
  3: lazy(() => import("./stations/SocialStation")),
  4: lazy(() => import("./stations/TrademarkStation")),
  5: lazy(() => import("./stations/ScoreStation")),
  6: lazy(() => import("./stations/ActionStation")),
  7: lazy(() => import("./stations/ReportStation")),
};

/**
 * Helper functions
 */
export const getStationConfig = (id: number): StationConfig | undefined => 
  STATION_CONFIGS.find(s => s.id === id);

export const getStationBySlug = (slug: string): StationConfig | undefined =>
  STATION_CONFIGS.find(s => s.slug === slug);

export const getTotalStations = (): number => STATION_CONFIGS.length;

export const getCompletedCount = (search: SavedBrandName): number =>
  STATION_CONFIGS.filter(s => s.isComplete(search)).length;

export const getOverallProgress = (search: SavedBrandName): number =>
  (getCompletedCount(search) / getTotalStations()) * 100;

export const isJourneyComplete = (search: SavedBrandName): boolean =>
  STATION_CONFIGS.every(s => s.isComplete(search));

