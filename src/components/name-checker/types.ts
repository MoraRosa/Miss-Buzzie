/**
 * Shared types and interfaces for the Name Checker module
 * Follows the same pattern as branding/types.ts
 */

import { LucideIcon } from "lucide-react";
import type { SavedBrandName, NameCheckerData } from "@/lib/validators/schemas";

/**
 * Props that every station component receives
 */
export interface StationProps {
  /** Current brand name being checked */
  brandName: string;
  /** Current search data */
  currentSearch: SavedBrandName;
  /** Full name checker data for settings access */
  data: NameCheckerData;
  /** Function to update current search */
  updateSearch: (updates: Partial<SavedBrandName>) => void;
  /** Function to update global data (settings, country, etc.) */
  updateData: (updates: Partial<NameCheckerData>) => void;
  /** Mark this station as complete */
  markStationComplete: () => void;
}

/**
 * Configuration for a station in the journey
 */
export interface StationConfig {
  /** Unique identifier for the station */
  id: number;
  /** URL-friendly slug */
  slug: string;
  /** Display name shown in UI */
  name: string;
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Brief description shown under the title */
  description: string;
  /** Longer helper text for the station */
  helpText: string;
  /** Color theme for this station */
  color: string;
  /** Function to check if this station is complete */
  isComplete: (search: SavedBrandName) => boolean;
  /** Get completion progress for this station (0-100) */
  getProgress?: (search: SavedBrandName) => number;
}

/**
 * Component type for station implementations
 */
export type StationComponent = React.ComponentType<StationProps>;

/**
 * Domain availability result from API
 */
export interface DomainAvailabilityResult {
  domain: string;
  available: boolean;
  premium?: boolean;
  price?: string;
  error?: string;
}

/**
 * Social media availability result
 */
export interface SocialAvailabilityResult {
  platform: string;
  handle: string;
  available: boolean;
  profileUrl?: string;
  error?: string;
}

/**
 * Name suggestion
 */
export interface NameSuggestion {
  name: string;
  type: "prefix" | "suffix" | "synonym" | "acronym" | "combination";
  reason: string;
}

