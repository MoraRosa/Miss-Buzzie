import { useState, lazy, Suspense, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, BarChart3, Users, CheckSquare, Target, Presentation, Search, Grid2X2, Layers, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportAllTabsToPDF, exportAllTabsToImage, exportAllData, importAllData } from "@/lib/exportUtils";
import { Header, Footer } from "@/components/layout";

// Lazy load all tab components for better initial load performance
const BusinessModelCanvas = lazy(() => import("@/components/BusinessModelCanvas"));
const PitchDeck = lazy(() => import("@/components/PitchDeck"));
const Roadmap = lazy(() => import("@/components/Roadmap"));
const OrgChart = lazy(() => import("@/components/OrgChart"));
const Checklist = lazy(() => import("@/components/Checklist"));
const Forecasting = lazy(() => import("@/components/Forecasting"));
const MarketResearch = lazy(() => import("@/components/MarketResearch"));
const SWOTAnalysis = lazy(() => import("@/components/SWOTAnalysis"));
const PortersFiveForces = lazy(() => import("@/components/PortersFiveForces"));

// Loading fallback component
const TabLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center gap-3 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="text-sm">Loading...</p>
    </div>
  </div>
);

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("canvas");
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  // Force scroll to start on mount
  useEffect(() => {
    if (mobileScrollRef.current) {
      mobileScrollRef.current.scrollLeft = 0;
    }
  }, []);

  const handleExportPDF = async () => {
    try {
      toast({
        title: "Generating PDF...",
        description: "Exporting all tabs - this may take a moment",
      });

      await exportAllTabsToPDF(`business-plan-${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: "PDF exported successfully",
        description: "All sections have been saved as PDF",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error generating the PDF",
        variant: "destructive",
      });
    }
  };

  const handleExportImage = async () => {
    try {
      toast({
        title: "Generating image...",
        description: "Exporting all tabs - this may take a moment",
      });

      await exportAllTabsToImage(`business-plan-${new Date().toISOString().split('T')[0]}.png`);

      toast({
        title: "Image exported successfully",
        description: "All sections have been saved as an image",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error generating the image",
        variant: "destructive",
      });
    }
  };

  const handleExportJSON = () => {
    try {
      exportAllData();
      toast({
        title: "Backup exported",
        description: "Your data backup has been downloaded",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your data",
        variant: "destructive",
      });
    }
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const result = await importAllData(file);

        if (result.success) {
          const description = result.skipped.length > 0
            ? `Imported: ${result.imported.join(", ")}. Skipped: ${result.skipped.join(", ")} (invalid data)`
            : `Restored: ${result.imported.join(", ")}`;

          toast({
            title: "Import successful",
            description,
          });

          // Reload to apply imported data
          window.location.reload();
        } else {
          toast({
            title: "Import failed",
            description: "No valid data found in the backup file",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Import failed",
          description: error instanceof Error ? error.message : "Invalid file format",
          variant: "destructive",
        });
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Skip to main content link for keyboard/screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>

      <Header
        onImport={handleImport}
        onExportPDF={handleExportPDF}
        onExportImage={handleExportImage}
        onExportJSON={handleExportJSON}
      />

      <main id="main-content" className="py-4 md:py-8" role="main">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tabs Navigation - scrollable on mobile, grid on desktop */}
          <div
            ref={mobileScrollRef}
            className="mb-4 md:mb-8 scrollbar-hide px-4"
            role="navigation"
            aria-label="Business plan sections"
            style={{
              overflowX: 'auto',
              overflowY: 'hidden',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <TabsList
              className="md:grid md:grid-cols-9 md:max-w-6xl md:mx-auto gap-1 p-1"
              style={{
                display: 'flex',
                flexWrap: 'nowrap',
                justifyContent: 'flex-start',
                alignItems: 'center',
                width: 'max-content',
              }}
            >
              <TabsTrigger
                value="canvas"
                className="flex items-center gap-2 py-2 px-3 text-sm whitespace-nowrap flex-shrink-0"
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                <span>Canvas</span>
              </TabsTrigger>
              <TabsTrigger
                value="pitch"
                className="flex items-center gap-2 py-2 px-3 text-sm whitespace-nowrap flex-shrink-0"
              >
                <Presentation className="h-4 w-4" aria-hidden="true" />
                <span>Pitch</span>
              </TabsTrigger>
              <TabsTrigger
                value="roadmap"
                className="flex items-center gap-2 py-2 px-3 text-sm whitespace-nowrap flex-shrink-0"
              >
                <Target className="h-4 w-4" aria-hidden="true" />
                <span>Roadmap</span>
              </TabsTrigger>
              <TabsTrigger
                value="orgchart"
                className="flex items-center gap-2 py-2 px-3 text-sm whitespace-nowrap flex-shrink-0"
              >
                <Users className="h-4 w-4" aria-hidden="true" />
                <span>Org</span>
              </TabsTrigger>
              <TabsTrigger
                value="market"
                className="flex items-center gap-2 py-2 px-3 text-sm whitespace-nowrap flex-shrink-0"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                <span>Market</span>
              </TabsTrigger>
              <TabsTrigger
                value="swot"
                className="flex items-center gap-2 py-2 px-3 text-sm whitespace-nowrap flex-shrink-0"
              >
                <Grid2X2 className="h-4 w-4" aria-hidden="true" />
                <span>SWOT</span>
              </TabsTrigger>
              <TabsTrigger
                value="porters"
                className="flex items-center gap-2 py-2 px-3 text-sm whitespace-nowrap flex-shrink-0"
              >
                <Layers className="h-4 w-4" aria-hidden="true" />
                <span>Porter's</span>
              </TabsTrigger>
              <TabsTrigger
                value="checklist"
                className="flex items-center gap-2 py-2 px-3 text-sm whitespace-nowrap flex-shrink-0"
              >
                <CheckSquare className="h-4 w-4" aria-hidden="true" />
                <span>Tasks</span>
              </TabsTrigger>
              <TabsTrigger
                value="forecast"
                className="flex items-center gap-2 py-2 px-3 text-sm whitespace-nowrap flex-shrink-0"
              >
                <BarChart3 className="h-4 w-4" aria-hidden="true" />
                <span>Forecast</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab content with container */}
          <div className="container mx-auto px-4">
            <Suspense fallback={<TabLoadingFallback />}>
              <TabsContent value="canvas" className="mt-0">
                <BusinessModelCanvas />
              </TabsContent>

              <TabsContent value="pitch" className="mt-0">
                <PitchDeck />
              </TabsContent>

              <TabsContent value="roadmap" className="mt-0">
                <Roadmap />
              </TabsContent>

              <TabsContent value="orgchart" className="mt-0">
                <OrgChart />
              </TabsContent>

              <TabsContent value="market" className="mt-0">
                <MarketResearch />
              </TabsContent>

              <TabsContent value="swot" className="mt-0">
                <SWOTAnalysis />
              </TabsContent>

              <TabsContent value="porters" className="mt-0">
                <PortersFiveForces />
              </TabsContent>

              <TabsContent value="checklist" className="mt-0">
                <Checklist />
              </TabsContent>

              <TabsContent value="forecast" className="mt-0">
                <Forecasting />
              </TabsContent>
            </Suspense>
          </div>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
