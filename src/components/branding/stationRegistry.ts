/**
 * Station Registry
 * 
 * Central registry for all branding journey stations.
 * To add a new station:
 * 1. Create the component in src/components/branding/
 * 2. Add a config entry to STATION_CONFIGS
 * 3. Import and add to STATION_COMPONENTS map
 * 
 * The registry pattern allows for:
 * - Easy addition of new stations
 * - Consistent validation across all stations
 * - Dynamic rendering based on configuration
 * - Future features like station reordering, A/B testing, etc.
 */

import { lazy } from "react";
import { 
  Target, Sparkles, BookOpen, Mic2, Heart, Award 
} from "lucide-react";
import { StationConfig, StationComponent } from "./types";
import { BrandStrategy } from "@/lib/brandStrategy";

/**
 * Station configurations
 * Order matters - this defines the journey sequence
 */
export const STATION_CONFIGS: StationConfig[] = [
  {
    id: 1,
    slug: "destination",
    name: "The Destination",
    icon: Target,
    description: "Define your brand associations",
    helpText: "What words should people think when they hear your brand name?",
    isComplete: (s: BrandStrategy) => 
      s.brandName.trim().length > 0 && s.associations.length >= 1,
  },
  {
    id: 2,
    slug: "archetype",
    name: "The Archetype",
    icon: Sparkles,
    description: "Discover your brand personality",
    helpText: "Every iconic brand embodies an archetype. Which one is yours?",
    isComplete: (s: BrandStrategy) => s.primaryArchetype !== '',
  },
  {
    id: 3,
    slug: "story",
    name: "The Origin Story",
    icon: BookOpen,
    description: "Craft your narrative",
    helpText: "Your story is what makes you memorable. Let's write it together.",
    isComplete: (s: BrandStrategy) => 
      s.story.catalyst.trim().length > 0 || s.story.coreTruth.trim().length > 0,
  },
  {
    id: 4,
    slug: "voice",
    name: "The Voice",
    icon: Mic2,
    description: "Find how you speak",
    helpText: "Your voice is how you communicate. Make it unmistakably yours.",
    isComplete: (s: BrandStrategy) => s.voice.primaryStyle !== '',
  },
  {
    id: 5,
    slug: "emotion",
    name: "The Emotion",
    icon: Heart,
    description: "Choose what they feel",
    helpText: "Brands that evoke emotion create loyalty. What should they feel?",
    isComplete: (s: BrandStrategy) => s.emotions.length >= 1,
  },
  {
    id: 6,
    slug: "dna",
    name: "Brand DNA",
    icon: Award,
    description: "Your complete brand identity",
    helpText: "Everything comes together here. This is who you are.",
    isComplete: (s: BrandStrategy) => 
      s.completedStations.length >= 5, // All previous stations complete
  },
];

/**
 * Lazy-loaded station components
 * Using lazy loading for better initial bundle size
 */
export const STATION_COMPONENTS: Record<number, React.LazyExoticComponent<StationComponent>> = {
  1: lazy(() => import("./DestinationStation")),
  2: lazy(() => import("./ArchetypeStation")),
  3: lazy(() => import("./StoryStation")),
  4: lazy(() => import("./VoiceStation")),
  5: lazy(() => import("./EmotionStation")),
  6: lazy(() => import("./BrandDNAStation")),
};

/**
 * Helper functions for working with stations
 */
export const getStationConfig = (id: number): StationConfig | undefined => 
  STATION_CONFIGS.find(s => s.id === id);

export const getStationBySlug = (slug: string): StationConfig | undefined =>
  STATION_CONFIGS.find(s => s.slug === slug);

export const getTotalStations = (): number => STATION_CONFIGS.length;

export const getCompletedCount = (strategy: BrandStrategy): number =>
  STATION_CONFIGS.filter(s => s.isComplete(strategy)).length;

export const getProgress = (strategy: BrandStrategy): number =>
  (getCompletedCount(strategy) / getTotalStations()) * 100;

export const isJourneyComplete = (strategy: BrandStrategy): boolean =>
  STATION_CONFIGS.every(s => s.isComplete(strategy));

