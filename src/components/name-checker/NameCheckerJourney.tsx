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
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft, ChevronRight, Check, Loader2,
  RotateCcw, Save, Home, History, Star, StarOff, Trash2,
  ChevronDown, ChevronUp, Eye, LayoutGrid, Sparkles, Trophy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  STATION_CONFIGS,
  STATION_COMPONENTS,
  getStationConfig,
  getOverallProgress,
  isJourneyComplete
} from "./stationRegistry";
import ComparisonView from "./ComparisonView";
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
    defaultTlds: [".com", ".io", ".co", ".app", ".ai", ".dev", ".tech"],
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
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [currentStation, setCurrentStation] = useState(1);
  const [currentSearch, setCurrentSearch] = useState<SavedBrandName>(
    createInitialSearch(initialName)
  );
  const [data, setData] = useState<NameCheckerData>(createInitialData());
  const [completedStations, setCompletedStations] = useState<Set<number>>(new Set());
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

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

  // Start a new search - preserves saved searches
  const startNewSearch = () => {
    // Keep saved searches, just reset current search
    setCurrentSearch(createInitialSearch());
    setCompletedStations(new Set());
    setCurrentStation(1);
    setShowSavedSearches(false);
    toast({ title: "New Search", description: "Starting a fresh brand name check" });
  };

  // Full reset - clears everything (for settings/troubleshooting)
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
    // Check if already saved
    if (data.savedSearches.some(s => s.id === currentSearch.id)) {
      // Update existing
      setData(prev => ({
        ...prev,
        savedSearches: prev.savedSearches.map(s =>
          s.id === currentSearch.id ? currentSearch : s
        ),
      }));
      toast({ title: "Updated", description: `"${currentSearch.name}" has been updated.` });
    } else {
      // Add new
      setData(prev => ({
        ...prev,
        savedSearches: [...prev.savedSearches, currentSearch],
      }));
      toast({ title: "Saved", description: `"${currentSearch.name}" has been saved.` });
    }
  };

  // Load a saved search
  const loadSavedSearch = (search: SavedBrandName) => {
    setCurrentSearch(search);
    setCompletedStations(new Set());
    setCurrentStation(1);
    setShowSavedSearches(false);
    toast({ title: "Loaded", description: `Now editing "${search.name}"` });
  };

  // Delete a saved search
  const deleteSavedSearch = (id: string) => {
    setData(prev => ({
      ...prev,
      savedSearches: prev.savedSearches.filter(s => s.id !== id),
    }));
  };

  // Toggle favorite
  const toggleFavorite = (id: string) => {
    setData(prev => ({
      ...prev,
      savedSearches: prev.savedSearches.map(s =>
        s.id === id ? { ...s, isFavorite: !s.isFavorite } : s
      ),
    }));
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
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
            {data.savedSearches.length > 0 && (
              <Button
                size="sm"
                variant={showSavedSearches ? "secondary" : "ghost"}
                onClick={() => setShowSavedSearches(!showSavedSearches)}
              >
                <History className="h-4 w-4 mr-1" />
                Saved ({data.savedSearches.length})
                {showSavedSearches ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={startNewSearch}>
              <RotateCcw className="h-4 w-4 mr-1" />
              New
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

      {/* Saved Searches Panel */}
      {showSavedSearches && data.savedSearches.length > 0 && (
        <Card className="p-4 border-dashed">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium flex items-center gap-2">
              <History className="h-4 w-4" />
              Saved Brand Names
            </h3>
            <div className="flex items-center gap-2">
              {data.savedSearches.length >= 2 && (
                <Button
                  size="sm"
                  variant={showComparison ? "secondary" : "outline"}
                  onClick={() => setShowComparison(!showComparison)}
                >
                  <LayoutGrid className="h-4 w-4 mr-1" />
                  Compare
                </Button>
              )}
              <span className="text-xs text-muted-foreground">
                Click to load
              </span>
            </div>
          </div>

          {/* Comparison View */}
          {showComparison && (
            <div className="mb-4">
              <ComparisonView
                searches={data.savedSearches}
                onSelect={(search) => { loadSavedSearch(search); setShowComparison(false); }}
                onClose={() => setShowComparison(false)}
              />
            </div>
          )}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {data.savedSearches
              .sort((a, b) => {
                // Favorites first, then by date
                if (a.isFavorite && !b.isFavorite) return -1;
                if (!a.isFavorite && b.isFavorite) return 1;
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
              })
              .map(search => {
                const isCurrentlyEditing = search.id === currentSearch.id;
                const domainCount = search.domains.filter(d => d.status === "available").length;
                const socialCount = search.socialMedia.filter(s => s.status === "available").length;
                const tmClear = search.trademarks.filter(t => t.status === "clear").length;

                return (
                  <div
                    key={search.id}
                    className={`
                      relative p-3 rounded-lg border transition-all cursor-pointer
                      ${isCurrentlyEditing
                        ? "ring-2 ring-primary bg-primary/5"
                        : "hover:border-primary/50 hover:bg-muted/50"
                      }
                    `}
                    onClick={() => !isCurrentlyEditing && loadSavedSearch(search)}
                  >
                    {/* Favorite star */}
                    <button
                      className="absolute top-2 right-2 p-1 hover:bg-muted rounded"
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(search.id); }}
                    >
                      {search.isFavorite
                        ? <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        : <StarOff className="h-4 w-4 text-muted-foreground" />
                      }
                    </button>

                    {/* Brand name */}
                    <h4 className="font-semibold text-sm pr-6">{search.name}</h4>
                    {search.slogan && (
                      <p className="text-xs text-muted-foreground italic truncate">{search.slogan}</p>
                    )}

                    {/* Quick stats */}
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      {search.overallScore > 0 && (
                        <Badge variant="outline" className={getScoreColor(search.overallScore)}>
                          {search.overallScore}%
                        </Badge>
                      )}
                      {domainCount > 0 && <span className="text-green-600">{domainCount} domains</span>}
                      {socialCount > 0 && <span className="text-blue-600">{socialCount} social</span>}
                      {tmClear > 0 && <span className="text-purple-600">{tmClear} TM clear</span>}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 mt-2">
                      {isCurrentlyEditing ? (
                        <Badge variant="secondary" className="text-xs">Currently editing</Badge>
                      ) : (
                        <>
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={(e) => { e.stopPropagation(); loadSavedSearch(search); }}>
                            <Eye className="h-3 w-3 mr-1" /> Load
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-destructive" onClick={(e) => { e.stopPropagation(); deleteSavedSearch(search.id); }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      )}

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
      {journeyComplete && !showCelebration && (
        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500/20 animate-bounce">
              <Trophy className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-green-600">Journey Complete!</h4>
              <p className="text-sm text-muted-foreground">
                You've checked all aspects of "{currentSearch.name}".
                Score: {currentSearch.overallScore}%
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowCelebration(true)} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Summary
              </Button>
              <Button onClick={saveSearch} className="gap-2">
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-background/98 via-background/95 to-background/98 backdrop-blur-md" onClick={() => setShowCelebration(false)} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div className="absolute w-[600px] h-[600px] rounded-full border border-green-500/10 animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute w-[400px] h-[400px] rounded-full border border-green-500/20 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
          </div>
          <Card className="relative z-10 max-w-md w-full mx-4 p-8 shadow-2xl animate-in zoom-in-95 fade-in duration-300">
            <div className="text-center space-y-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/10 flex items-center justify-center">
                <Trophy className="w-10 h-10 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Brand Check Complete! 🎉</h2>
                <p className="text-muted-foreground mt-2">"{currentSearch.name}" has been fully evaluated.</p>
              </div>
              <div className={`text-5xl font-bold ${currentSearch.overallScore >= 80 ? "text-green-500" : currentSearch.overallScore >= 60 ? "text-yellow-500" : "text-red-500"}`}>
                {currentSearch.overallScore}%
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="p-2 rounded-lg bg-muted/50"><div className="font-semibold text-green-600">{currentSearch.domains.filter(d => d.status === "available").length}</div><div className="text-xs text-muted-foreground">Domains</div></div>
                <div className="p-2 rounded-lg bg-muted/50"><div className="font-semibold text-blue-600">{currentSearch.socialMedia.filter(s => s.status === "available").length}</div><div className="text-xs text-muted-foreground">Social</div></div>
                <div className="p-2 rounded-lg bg-muted/50"><div className="font-semibold text-purple-600">{currentSearch.trademarks.filter(t => t.status === "clear").length}</div><div className="text-xs text-muted-foreground">TM Clear</div></div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowCelebration(false)}>Continue</Button>
                <Button className="flex-1 gap-2" onClick={() => { saveSearch(); setShowCelebration(false); }}><Save className="h-4 w-4" />Save</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NameCheckerJourney;

