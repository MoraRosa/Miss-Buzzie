/**
 * Name Checker Module Exports
 */

export { default as NameCheckerJourney } from "./NameCheckerJourney";
export { 
  STATION_CONFIGS, 
  STATION_COMPONENTS,
  getStationConfig,
  getStationBySlug,
  getTotalStations,
  getCompletedCount,
  getOverallProgress,
  isJourneyComplete,
} from "./stationRegistry";
export type { 
  StationConfig, 
  StationComponent, 
  StationProps, 
  NameCheckerData,
  NameSuggestion,
} from "./types";

