/**
 * Name Checker Journey - Main Component
 *
 * Orchestrates the 6-station journey for brand name validation.
 * Uses the same pattern as BrandingJourney.
 */

import { useState, useCallback, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft, ChevronRight, Check, Loader2,
  RotateCcw, Save, Home
} from "lucide-react";
import {
  STATION_CONFIGS,
  STATION_COMPONENTS,
  getStationConfig,
  getOverallProgress,
  isJourneyComplete
} from "./stationRegistry";
import type { NameCheckerData, StationProps } from "./types";
import type { SavedBrandName } from "@/lib/validators/schemas";

const STORAGE_KEY = "nameChecker";

// Default initial state
const createInitialSearch = (name: string = ""): SavedBrandName => ({
  id: crypto.randomUUID(),
  name,
  slogan: "",
  domains: [],
  socialMedia: [],
  trademarks: [],
  overallScore: 0,
  actionableSteps: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const createInitialData = (): NameCheckerData => ({
  currentBrandName: "",
  currentSlogan: "",
  selectedCountry: "US",
  settings: {
    defaultTlds: [".com", ".io", ".co", ".app", ".net"],
    defaultPlatforms: ["twitter", "instagram", "tiktok", "youtube", "linkedin", "github"],
    autoCheck: true,
  },
  savedSearches: [],
});

interface NameCheckerJourneyProps {
  initialName?: string;
  onComplete?: (search: SavedBrandName) => void;
  onSave?: (search: SavedBrandName) => void;
}

// Load saved state from localStorage
const loadSavedState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        currentSearch: parsed.currentSearch || null,
        data: parsed.data || null,
        currentStation: parsed.currentStation || 1,
        completedStations: new Set(parsed.completedStations || []),
      };
    }
  } catch (error) {
    console.error('[NameChecker] Failed to load saved state:', error);
  }
  return null;
};

const NameCheckerJourney = ({
  initialName = "",
  onComplete,
  onSave
}: NameCheckerJourneyProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentStation, setCurrentStation] = useState(1);
  const [currentSearch, setCurrentSearch] = useState<SavedBrandName>(
    createInitialSearch(initialName)
  );
  const [data, setData] = useState<NameCheckerData>(createInitialData());
  const [completedStations, setCompletedStations] = useState<Set<number>>(new Set());

  // Load from localStorage on mount
  useEffect(() => {
    const savedState = loadSavedState();
    if (savedState) {
      if (savedState.currentSearch) setCurrentSearch(savedState.currentSearch);
      if (savedState.data) setData(savedState.data);
      setCurrentStation(savedState.currentStation);
      setCompletedStations(savedState.completedStations);
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage on every change (debounced effect)
  useEffect(() => {
    if (isLoading) return; // Don't save during initial load

    const state = {
      currentSearch,
      data,
      currentStation,
      completedStations: Array.from(completedStations),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [currentSearch, data, currentStation, completedStations, isLoading]);

  const stationConfig = getStationConfig(currentStation);
  const StationComponent = STATION_COMPONENTS[currentStation];
  const progress = getOverallProgress(currentSearch);
  const journeyComplete = isJourneyComplete(currentSearch);

  // Update search state
  const updateSearch = useCallback((updates: Partial<SavedBrandName>) => {
    setCurrentSearch(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Update data state
  const updateData = useCallback((updates: Partial<NameCheckerData>) => {
    setData(prev => ({ ...prev, ...updates }));
  }, []);

  // Mark station as complete
  const markStationComplete = useCallback(() => {
    setCompletedStations(prev => new Set([...prev, currentStation]));
  }, [currentStation]);

  // Navigation
  const goToStation = (stationId: number) => {
    if (stationId >= 1 && stationId <= STATION_CONFIGS.length) {
      setCurrentStation(stationId);
    }
  };

  const goNext = () => {
    if (currentStation < STATION_CONFIGS.length) {
      setCurrentStation(currentStation + 1);
    } else if (journeyComplete && onComplete) {
      onComplete(currentSearch);
    }
  };

  const goPrev = () => {
    if (currentStation > 1) {
      setCurrentStation(currentStation - 1);
    }
  };

  // Reset journey - clears only Name Checker data
  const resetJourney = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentSearch(createInitialSearch());
    setData(createInitialData());
    setCompletedStations(new Set());
    setCurrentStation(1);
  };

  // Save current search
  const saveSearch = () => {
    if (onSave) {
      onSave(currentSearch);
    }
    setData(prev => ({
      ...prev,
      savedSearches: [...prev.savedSearches, currentSearch],
    }));
  };

  // Station props
  const stationProps: StationProps = {
    brandName: currentSearch.name,
    currentSearch,
    data,
    updateSearch,
    updateData,
    markStationComplete,
    goNext,
    goPrev,
  };

  // Show loading skeleton while loading from localStorage
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-2 w-full" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <Skeleton key={i} className="h-10 w-28 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {currentSearch.name ? `Checking: ${currentSearch.name}` : "Name Checker"}
          </h2>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={resetJourney}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            {currentSearch.name && (
              <Button size="sm" variant="outline" onClick={saveSearch}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            )}
          </div>
        </div>

        <Progress value={progress} className="h-2" />

        <p className="text-sm text-muted-foreground">
          {Math.round(progress)}% complete • Station {currentStation} of {STATION_CONFIGS.length}
        </p>
      </div>

      {/* Station Navigation Pills - Horizontal Scroll */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        {STATION_CONFIGS.map((station) => {
          const isActive = station.id === currentStation;
          const isComplete = completedStations.has(station.id) || station.isComplete(currentSearch);
          const Icon = station.icon;

          return (
            <button
              key={station.id}
              onClick={() => goToStation(station.id)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium
                transition-all duration-200 shrink-0 whitespace-nowrap
                ${isActive
                  ? `bg-gradient-to-r ${station.color} text-white shadow-lg`
                  : isComplete
                    ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/30"
                    : "bg-muted hover:bg-muted/80 text-foreground/70 hover:text-foreground"
                }
              `}
            >
              {isComplete && !isActive ? (
                <Check className="h-4 w-4 shrink-0" />
              ) : (
                <Icon className="h-4 w-4 shrink-0" />
              )}
              <span>{station.name}</span>
            </button>
          );
        })}
      </div>

      {/* Current Station Card */}
      <Card className="p-6">
        {/* Station Header */}
        {stationConfig && (
          <div className="mb-6 pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stationConfig.color} text-white`}>
                <stationConfig.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{stationConfig.name}</h3>
                <p className="text-sm text-muted-foreground">{stationConfig.description}</p>
              </div>
            </div>
            {stationConfig.helpText && (
              <p className="mt-3 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                💡 {stationConfig.helpText}
              </p>
            )}
          </div>
        )}

        {/* Station Content */}
        <Suspense fallback={
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-1/2" />
          </div>
        }>
          {StationComponent && <StationComponent {...stationProps} />}
        </Suspense>
      </Card>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={currentStation === 1}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {STATION_CONFIGS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i + 1 === currentStation
                  ? "bg-primary"
                  : i + 1 < currentStation || completedStations.has(i + 1)
                    ? "bg-green-500"
                    : "bg-muted"
              }`}
            />
          ))}
        </div>

        <Button
          onClick={goNext}
          disabled={currentStation === 1 && !currentSearch.name}
          className="gap-2"
        >
          {currentStation === STATION_CONFIGS.length ? (
            journeyComplete ? (
              <>
                Complete <Check className="h-4 w-4" />
              </>
            ) : (
              "Finish"
            )
          ) : (
            <>
              Next <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Journey Complete Banner */}
      {journeyComplete && (
        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500/20">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-green-600">Journey Complete!</h4>
              <p className="text-sm text-muted-foreground">
                You've checked all aspects of "{currentSearch.name}".
                Score: {currentSearch.overallScore}%
              </p>
            </div>
            <Button onClick={saveSearch} className="gap-2">
              <Save className="h-4 w-4" />
              Save Results
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default NameCheckerJourney;

