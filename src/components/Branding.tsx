import { useState, useEffect, Suspense, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, RotateCcw, Award, Loader2, Sparkles, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import {
  BrandStrategy,
  getBrandStrategy,
  saveBrandStrategy,
  DEFAULT_BRAND_STRATEGY,
} from "@/lib/brandStrategy";
import {
  STATION_CONFIGS,
  STATION_COMPONENTS,
  getStationConfig,
  getProgress,
  getTotalStations,
} from "@/components/branding/stationRegistry";

// Loading fallback for lazy-loaded stations
const StationLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[300px]">
    <div className="flex flex-col items-center gap-3 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="text-sm">Loading station...</p>
    </div>
  </div>
);

const Branding = () => {
  const [strategy, setStrategy] = useState<BrandStrategy>(getBrandStrategy());
  const [currentStation, setCurrentStation] = useState(strategy.currentStation || 1);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Save on strategy changes
  useEffect(() => {
    saveBrandStrategy({ ...strategy, currentStation });
  }, [strategy, currentStation]);

  const updateStrategy = (updates: Partial<BrandStrategy>) => {
    setStrategy(prev => ({ ...prev, ...updates }));
  };

  const markStationComplete = (stationId: number) => {
    if (!strategy.completedStations.includes(stationId)) {
      updateStrategy({
        completedStations: [...strategy.completedStations, stationId],
      });
    }
  };

  const goToStation = (stationId: number) => {
    setCurrentStation(stationId);
    updateStrategy({ currentStation: stationId });
  };

  const goNext = () => {
    if (currentStation < 6) {
      markStationComplete(currentStation);
      goToStation(currentStation + 1);
    }
  };

  const goPrevious = () => {
    if (currentStation > 1) {
      goToStation(currentStation - 1);
    }
  };

  const resetJourney = () => {
    setStrategy(DEFAULT_BRAND_STRATEGY);
    setCurrentStation(1);
    setShowCelebration(false);
    toast({
      title: "Journey reset",
      description: "Your brand strategy has been cleared. Start fresh!",
    });
  };

  // Complete journey and auto-export Brand DNA
  const handleCompleteJourney = async () => {
    markStationComplete(getTotalStations());
    setShowCelebration(true);

    // Auto-export the Brand DNA card after overlay appears
    setTimeout(async () => {
      const dnaCard = document.querySelector('[data-brand-dna-card]') as HTMLElement;
      if (dnaCard) {
        setIsExporting(true);
        try {
          const canvas = await html2canvas(dnaCard, {
            backgroundColor: null,
            scale: 2,
          });

          const link = document.createElement('a');
          link.download = `${strategy.brandName || 'brand'}-dna.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        } catch {
          // Silent fail - user can manually export
        } finally {
          setIsExporting(false);
        }
      }
    }, 800);
  };

  const totalStations = getTotalStations();
  const progress = getProgress(strategy);
  const currentStationConfig = getStationConfig(currentStation);

  // Get the lazy-loaded component for the current station
  const StationComponent = STATION_COMPONENTS[currentStation];
  const stationProps = {
    strategy,
    updateStrategy,
    markStationComplete: () => markStationComplete(currentStation),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
          Brand Strategy Journey
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover who your brand really is. Not just colors and logos, but the soul that makes people remember you.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="max-w-3xl mx-auto space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Station {currentStation} of {totalStations}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Station Navigation Pills - horizontal scroll on mobile */}
      <div
        className="scrollbar-hide px-4 -mx-4 sm:mx-0 sm:px-0"
        style={{
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div
          className="flex gap-2 sm:flex-wrap sm:justify-center max-w-4xl mx-auto pb-2 sm:pb-0"
          style={{
            width: 'max-content',
            minWidth: '100%',
          }}
        >
          {STATION_CONFIGS.map((station) => {
            const Icon = station.icon;
            const isActive = station.id === currentStation;
            const isComplete = station.isComplete(strategy);

            return (
              <Button
                key={station.id}
                variant={isActive ? "default" : isComplete ? "secondary" : "outline"}
                size="sm"
                onClick={() => goToStation(station.id)}
                className={`gap-1.5 sm:gap-2 transition-all flex-shrink-0 ${isActive ? 'scale-105 shadow-lg' : ''}`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs sm:text-sm">{station.name}</span>
                {isComplete && !isActive && <span className="text-green-500">✓</span>}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Current Station Card */}
      {currentStationConfig && (
        <Card className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
          <div className="space-y-4 sm:space-y-6">
            {/* Station Header */}
            <div className="text-center border-b pb-4">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 mb-2 sm:mb-3">
                <currentStationConfig.icon className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">{currentStationConfig.name}</h2>
              <p className="text-sm sm:text-base text-muted-foreground">{currentStationConfig.description}</p>
              <p className="text-xs sm:text-sm text-muted-foreground/70 mt-1 italic hidden sm:block">{currentStationConfig.helpText}</p>
            </div>

            {/* Station Content */}
            <div className="min-h-[300px] sm:min-h-[400px]">
              <Suspense fallback={<StationLoadingFallback />}>
                {StationComponent && <StationComponent {...stationProps} />}
              </Suspense>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 sm:pt-6 border-t">
              <Button
                variant="outline"
                onClick={goPrevious}
                disabled={currentStation === 1}
                className="gap-2 w-full sm:w-auto order-2 sm:order-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sm:inline">Previous</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={resetJourney}
                className="text-muted-foreground hover:text-destructive order-3 sm:order-2"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Start Over</span>
                <span className="sm:hidden">Reset</span>
              </Button>

              {currentStation < totalStations ? (
                <Button onClick={goNext} className="gap-2 w-full sm:w-auto order-1 sm:order-3">
                  <span>Next Station</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleCompleteJourney}
                  disabled={isExporting}
                  className="gap-2 w-full sm:w-auto order-1 sm:order-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span className="hidden sm:inline">Complete Journey</span>
                      <span className="sm:hidden">Complete</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Completion Overlay - Professional & Elegant */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop with subtle gradient animation */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-background/98 via-background/95 to-background/98 backdrop-blur-md"
            onClick={() => setShowCelebration(false)}
          />

          {/* Subtle animated rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div className="absolute w-[600px] h-[600px] rounded-full border border-primary/10 animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute w-[400px] h-[400px] rounded-full border border-primary/20 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
            <div className="absolute w-[200px] h-[200px] rounded-full border border-primary/30 animate-ping" style={{ animationDuration: '2s', animationDelay: '1s' }} />
          </div>

          {/* Main Card */}
          <div className="relative bg-background border rounded-2xl p-8 sm:p-12 shadow-2xl max-w-lg mx-4 animate-in fade-in-0 zoom-in-95 duration-500">
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-primary/40 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-primary/40 rounded-br-2xl" />

            {/* Content */}
            <div className="text-center space-y-6">
              {/* Icon */}
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>

              {/* Title */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Brand Identity Complete
                </h2>
                <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                  Your brand DNA has been defined and exported successfully.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 py-4 border-y">
                <div>
                  <div className="text-2xl font-bold text-primary">6</div>
                  <div className="text-xs text-muted-foreground">Stations</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">✓</div>
                  <div className="text-xs text-muted-foreground">Exported</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">100%</div>
                  <div className="text-xs text-muted-foreground">Complete</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={() => setShowCelebration(false)}
                  className="flex-1 gap-2"
                >
                  <Download className="w-4 h-4" />
                  View Brand DNA
                </Button>
                <Button
                  onClick={() => {
                    setShowCelebration(false);
                    goToStation(1);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Review Journey
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branding;

