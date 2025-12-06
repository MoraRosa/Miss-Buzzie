/**
 * Shared types and interfaces for the Branding module
 * This ensures all stations follow the same contract
 */

import { LucideIcon } from "lucide-react";
import { BrandStrategy } from "@/lib/brandStrategy";

/**
 * Props that every station component receives
 * This is the contract that all stations must follow
 */
export interface StationProps {
  /** Current brand strategy state */
  strategy: BrandStrategy;
  /** Function to update strategy - accepts partial updates */
  updateStrategy: (updates: Partial<BrandStrategy>) => void;
  /** Call this when the station's required fields are filled */
  markStationComplete: () => void;
}

/**
 * Configuration for a station in the journey
 * Used by the station registry to define all stations
 */
export interface StationConfig {
  /** Unique identifier for the station */
  id: number;
  /** URL-friendly slug for potential future routing */
  slug: string;
  /** Display name shown in UI */
  name: string;
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Brief description shown under the title */
  description: string;
  /** Longer helper text for the station */
  helpText: string;
  /** Function to check if this station is complete */
  isComplete: (strategy: BrandStrategy) => boolean;
}

/**
 * Component type for station implementations
 */
export type StationComponent = React.ComponentType<StationProps>;

/**
 * Registry entry combining config with component
 */
export interface StationRegistryEntry {
  config: StationConfig;
  component: StationComponent;
}

