/**
 * Shared types and interfaces for the Business Plan module
 * This ensures all phases follow the same contract
 */

import { LucideIcon } from "lucide-react";
import { BusinessPlanData } from "@/lib/validators/schemas";

/**
 * Props that every phase component receives
 * This is the contract that all phases must follow
 */
export interface PhaseProps {
  /** Current business plan data state */
  data: BusinessPlanData;
  /** Function to update data - accepts partial updates */
  updateData: (updates: Partial<BusinessPlanData>) => void;
  /** Call this when the phase's required fields are filled */
  markPhaseComplete: () => void;
  /** Whether this is an existing business (affects which questions are shown) */
  isExistingBusiness: boolean;
}

/**
 * Configuration for a phase in the business plan journey
 * Used by the phase registry to define all phases
 */
export interface PhaseConfig {
  /** Unique identifier for the phase */
  id: number;
  /** URL-friendly slug for potential future routing */
  slug: string;
  /** Display name shown in UI */
  name: string;
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Brief description shown under the title */
  description: string;
  /** Longer helper text for the phase */
  helpText: string;
  /** Function to check if this phase is complete */
  isComplete: (data: BusinessPlanData) => boolean;
  /** Whether this phase applies to new businesses only */
  newBusinessOnly?: boolean;
  /** Whether this phase applies to existing businesses only */
  existingBusinessOnly?: boolean;
}

/**
 * Component type for phase implementations
 */
export type PhaseComponent = React.ComponentType<PhaseProps>;

/**
 * Registry entry combining config with component
 */
export interface PhaseRegistryEntry {
  config: PhaseConfig;
  component: PhaseComponent;
}

