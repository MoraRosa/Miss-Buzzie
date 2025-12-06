/**
 * Branding Module Exports
 * 
 * This file provides a clean public API for the branding module.
 * Import from here rather than individual files for better encapsulation.
 */

// Types
export type { StationProps, StationConfig, StationComponent, StationRegistryEntry } from './types';

// Station Registry
export { 
  STATION_CONFIGS, 
  STATION_COMPONENTS,
  getStationConfig,
  getStationBySlug,
  getTotalStations,
  getCompletedCount,
  getProgress,
  isJourneyComplete,
} from './stationRegistry';

// Station Components (for direct import if needed)
export { default as DestinationStation } from './DestinationStation';
export { default as ArchetypeStation } from './ArchetypeStation';
export { default as StoryStation } from './StoryStation';
export { default as VoiceStation } from './VoiceStation';
export { default as EmotionStation } from './EmotionStation';
export { default as BrandDNAStation } from './BrandDNAStation';

