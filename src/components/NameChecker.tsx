/**
 * Name Checker - Brand Name Availability Checker
 *
 * Uses a journey-based approach with 6 stations:
 * 1. Enter Name → 2. Domains → 3. Social → 4. Trademarks → 5. Score → 6. Action Plan
 */

import { lazy, Suspense } from "react";
import { Loader2, Globe } from "lucide-react";
import BrandHeader from "./BrandHeader";
import { useToast } from "@/hooks/use-toast";
import type { SavedBrandName } from "@/lib/validators/schemas";

// Lazy load the journey component
const NameCheckerJourney = lazy(() => import("./name-checker/NameCheckerJourney"));

// Loading fallback
const JourneyLoading = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center gap-3 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin" />
      <span>Loading Name Checker...</span>
    </div>
  </div>
);

const NameChecker = () => {
  const { toast } = useToast();

  const handleComplete = (search: SavedBrandName) => {
    toast({
      title: "Journey Complete! 🎉",
      description: `Brand check for "${search.name}" is complete with a score of ${search.overallScore}%`,
    });
  };

  const handleSave = (search: SavedBrandName) => {
    toast({
      title: "Saved successfully",
      description: `"${search.name}" has been saved to your list`,
    });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <BrandHeader />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Globe className="h-7 w-7 text-primary" />
            Brand Name Checker
          </h2>
          <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
            Check if your brand name is available across domains, social media & trademarks
          </p>
        </div>
      </div>

      <Suspense fallback={<JourneyLoading />}>
        <NameCheckerJourney
          onComplete={handleComplete}
          onSave={handleSave}
        />
      </Suspense>
    </div>
  );
};

export default NameChecker;

