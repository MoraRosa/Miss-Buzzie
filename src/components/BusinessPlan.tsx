/**
 * Business Plan Component
 * 
 * Main component for the comprehensive business plan journey.
 * Uses a phase-based approach similar to the Branding module.
 * Follows modular, scalable architecture with lazy loading.
 */

import { useState, Suspense, useEffect, useRef, lazy } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Loader2,
  Save,
  Edit,
  Eye,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import BrandHeader from "./BrandHeader";
import {
  PHASE_CONFIGS,
  PHASE_COMPONENTS,
  getPhaseConfig,
  getProgress,
  getTotalPhases,
} from "@/components/business-plan/phaseRegistry";
import {
  BusinessPlanData,
  BusinessPlanDataSchema,
  DEFAULT_BUSINESS_PLAN_DATA,
} from "@/lib/validators/schemas";

// Lazy load the preview component
const BusinessPlanPreview = lazy(() => import("@/components/business-plan/BusinessPlanPreview"));

// Loading fallback for lazy-loaded phases
const PhaseLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[300px]">
    <div className="flex flex-col items-center gap-3 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="text-sm">Loading...</p>
    </div>
  </div>
);

const BusinessPlan = () => {
  const { toast } = useToast();
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  // Use validated localStorage hook with auto-save
  const [data, setData, { save }] = useLocalStorage<BusinessPlanData>(
    "businessPlan",
    DEFAULT_BUSINESS_PLAN_DATA,
    { schema: BusinessPlanDataSchema, debounceMs: 300 }
  );

  const [currentPhase, setCurrentPhase] = useState(data.currentPhase || 1);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");

  // Force scroll to start on mount
  useEffect(() => {
    if (mobileScrollRef.current) {
      mobileScrollRef.current.scrollLeft = 0;
    }
  }, []);

  // Sync currentPhase with data
  // We intentionally only sync when currentPhase changes, not when data changes
  // to avoid infinite loops since setData updates data
  useEffect(() => {
    if (data.currentPhase !== currentPhase) {
      setData(prevData => ({ ...prevData, currentPhase }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPhase]);

  const updateData = (updates: Partial<BusinessPlanData>) => {
    setData({ ...data, ...updates, lastUpdated: new Date().toISOString() });
  };

  const markPhaseComplete = (phaseId: number) => {
    if (!data.completedPhases.includes(phaseId)) {
      updateData({
        completedPhases: [...data.completedPhases, phaseId],
      });
    }
  };

  const goToPhase = (phaseId: number) => {
    setCurrentPhase(phaseId);
  };

  const goNext = () => {
    if (currentPhase < getTotalPhases()) {
      markPhaseComplete(currentPhase);
      goToPhase(currentPhase + 1);
    }
  };

  const goPrevious = () => {
    if (currentPhase > 1) {
      goToPhase(currentPhase - 1);
    }
  };

  const handleSave = () => {
    save();
    toast({
      title: "Saved successfully",
      description: "Your business plan has been saved",
    });
  };

  const resetPlan = () => {
    setData(DEFAULT_BUSINESS_PLAN_DATA);
    setCurrentPhase(1);
    toast({
      title: "Plan reset",
      description: "Your business plan has been cleared. Start fresh!",
    });
  };

  const toggleBusinessType = (isExisting: boolean) => {
    updateData({ isExistingBusiness: isExisting });
  };

  const totalPhases = getTotalPhases();
  const progress = getProgress(data);
  const currentPhaseConfig = getPhaseConfig(currentPhase);
  const PhaseComponent = PHASE_COMPONENTS[currentPhase];

  const phaseProps = {
    data,
    updateData,
    markPhaseComplete: () => markPhaseComplete(currentPhase),
    isExistingBusiness: data.isExistingBusiness,
  };

  return (
    <div className="space-y-6">
      <BrandHeader />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Business Plan Builder
          </h1>
          <p className="text-muted-foreground mt-1">
            Build a comprehensive business plan step by step
          </p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {/* Edit/Preview Toggle */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "edit" | "preview")}>
            <TabsList className="h-9">
              <TabsTrigger value="edit" className="gap-1.5 px-3">
                <Edit className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-1.5 px-3">
                <Eye className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Preview</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {viewMode === "edit" && (
            <div className="flex items-center gap-2">
              <Label htmlFor="business-type" className="text-sm">
                Existing Business
              </Label>
              <Switch
                id="business-type"
                checked={data.isExistingBusiness}
                onCheckedChange={toggleBusinessType}
              />
            </div>
          )}
          <Button onClick={handleSave} variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-3xl mx-auto space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{viewMode === "edit" ? `Phase ${currentPhase} of ${totalPhases}` : "Full Plan Preview"}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* EDIT MODE */}
      {viewMode === "edit" && (
        <>
          {/* Phase Navigation Pills */}
          <div
            ref={mobileScrollRef}
            className="scrollbar-hide px-4 -mx-4 sm:mx-0 sm:px-0"
            style={{
              overflowX: "auto",
              overflowY: "hidden",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div
              className="flex gap-2 pb-2"
              style={{ width: "max-content", minWidth: "100%" }}
            >
              {PHASE_CONFIGS.map((phase) => {
                const Icon = phase.icon;
                const isActive = phase.id === currentPhase;
                const isComplete = phase.isComplete(data);

                return (
                  <Button
                    key={phase.id}
                    variant={isActive ? "default" : isComplete ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => goToPhase(phase.id)}
                    className={`gap-1.5 transition-all flex-shrink-0 ${
                      isActive ? "scale-105 shadow-lg" : ""
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs sm:text-sm hidden md:inline">{phase.name}</span>
                    <span className="text-xs sm:text-sm md:hidden">{phase.id}</span>
                    {isComplete && !isActive && (
                      <span className="text-green-500">✓</span>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Current Phase Card */}
          {currentPhaseConfig && (
            <Card className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
              <div className="space-y-4 sm:space-y-6">
                {/* Phase Header */}
                <div className="text-center border-b pb-4">
                  <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 mb-2 sm:mb-3">
                    <currentPhaseConfig.icon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold">
                    {currentPhaseConfig.name}
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {currentPhaseConfig.description}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground/70 mt-1 italic hidden sm:block">
                    {currentPhaseConfig.helpText}
                  </p>
                </div>

                {/* Phase Content */}
                <div className="min-h-[300px] sm:min-h-[400px]">
                  <Suspense fallback={<PhaseLoadingFallback />}>
                    {PhaseComponent && <PhaseComponent {...phaseProps} />}
                  </Suspense>
                </div>

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 sm:pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={goPrevious}
                    disabled={currentPhase === 1}
                    className="gap-2 w-full sm:w-auto order-2 sm:order-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetPlan}
                    className="text-muted-foreground hover:text-destructive order-3 sm:order-2"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Start Over</span>
                    <span className="sm:hidden">Reset</span>
                  </Button>

                  {currentPhase < totalPhases ? (
                    <Button
                      onClick={goNext}
                      className="gap-2 w-full sm:w-auto order-1 sm:order-3"
                    >
                      <span>Next Phase</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setViewMode("preview")}
                      className="gap-2 w-full sm:w-auto order-1 sm:order-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Full Plan</span>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {/* PREVIEW MODE */}
      {viewMode === "preview" && (
        <div className="max-w-5xl mx-auto">
          <Card className="p-2 overflow-hidden">
            <div className="overflow-auto max-h-[70vh]" style={{ scrollbarWidth: "thin" }}>
              <Suspense fallback={<PhaseLoadingFallback />}>
                <BusinessPlanPreview data={data} />
              </Suspense>
            </div>
          </Card>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Go to <strong>Phase 12: Summary</strong> in Edit mode for export options (PNG/PDF)
          </p>
        </div>
      )}
    </div>
  );
};

export default BusinessPlan;

