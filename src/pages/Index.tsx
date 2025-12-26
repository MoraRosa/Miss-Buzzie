import { useState, lazy, Suspense, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, DollarSign, Users, CheckSquare, Target, Presentation, Grid2X2, Layers, Loader2, Sparkles, Globe, ClipboardList, Download } from "lucide-react";
import { Header, Footer } from "@/components/layout";

// Lazy load all tab components for better initial load performance
const BusinessModelCanvas = lazy(() => import("@/components/BusinessModelCanvas"));
const BusinessPlan = lazy(() => import("@/components/BusinessPlan"));
const PitchDeck = lazy(() => import("@/components/PitchDeck"));
const Roadmap = lazy(() => import("@/components/Roadmap"));
const OrgChart = lazy(() => import("@/components/OrgChart"));
const Checklist = lazy(() => import("@/components/Checklist"));
const Financials = lazy(() => import("@/components/financials/Financials"));
const SWOTAnalysis = lazy(() => import("@/components/SWOTAnalysis"));
const PortersFiveForces = lazy(() => import("@/components/PortersFiveForces"));
const Branding = lazy(() => import("@/components/Branding"));
const NameChecker = lazy(() => import("@/components/NameChecker"));
const Exports = lazy(() => import("@/components/Exports"));

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
  const [activeTab, setActiveTab] = useState("canvas");
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  // Force scroll to start on mount
  useEffect(() => {
    if (mobileScrollRef.current) {
      mobileScrollRef.current.scrollLeft = 0;
    }
  }, []);

  // Listen for tab switch events from child components (e.g., "Edit in Plan" buttons)
  useEffect(() => {
    const handleSwitchTab = (event: CustomEvent<string>) => {
      const tabName = event.detail;
      setActiveTab(tabName);
      // Scroll to top when switching tabs
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('switch-tab', handleSwitchTab as EventListener);
    return () => {
      window.removeEventListener('switch-tab', handleSwitchTab as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Skip to main content link for keyboard/screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>

      <Header />

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
              className="md:grid md:grid-cols-12 md:max-w-7xl md:mx-auto gap-1 p-1"
              style={{
                display: 'flex',
                flexWrap: 'nowrap',
                justifyContent: 'flex-start',
                alignItems: 'center',
                width: 'max-content',
              }}
            >
              {/* 1. Canvas - Quick business model sketch */}
              <TabsTrigger
                value="canvas"
                className="flex items-center gap-2 py-2 px-3 text-sm whitespace-nowrap flex-shrink-0"
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                <span>Canvas</span>
              </TabsTrigger>
              {/* 2. Plan - Deep dive business planning */}
              <TabsTrigger
                value="businessplan"
                className="flex items-center gap-2 py-2 px-3 text-sm whitespace-nowrap flex-shrink-0"
              >
                <ClipboardList className="h-4 w-4" aria-hidden="true" />
                <span>Plan</span>
              </TabsTrigger>
              {/* 3. Org - Team structure & bios */}
              <TabsTrigger
                value="orgchart"
                className="flex items-center gap-2 py-2 px-3 text-sm whitespace-nowrap flex-shrink-0"
              >
                <Users className="h-4 w-4" aria-hidden="true" />
                <span>Org</span>
              </TabsTrigger>
              {/* 4. Brand - Identity & positioning */}
              <TabsTrigger
                value="branding"
                className="flex items-center gap-2 py-2 px-3 text-sm whitespace-nowrap flex-shrink-0"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span>Brand</span>
              </TabsTrigger>
              {/* 5. Name - Check availability */}
              <TabsTrigger
                value="namecheck"
                className="flex items-center gap-2 py-2 px-3 text-sm whitespace-nowrap flex-shrink-0"
              >
                <Globe className="h-4 w-4" aria-hidden="true" />
                <span>Name</span>
              </TabsTrigger>
              {/* 6. SWOT - Strategic analysis */}
              <TabsTrigger
                value="swot"
                className="flex items-center gap-2 py-2 px-3 text-sm whitespace-nowrap flex-shrink-0"
              >
                <Grid2X2 className="h-4 w-4" aria-hidden="true" />
                <span>SWOT</span>
              </TabsTrigger>
              {/* 7. Porter's - Competitive forces */}
              <TabsTrigger
                value="porters"
                className="flex items-center gap-2 py-2 px-3 text-sm whitespace-nowrap flex-shrink-0"
              >
                <Layers className="h-4 w-4" aria-hidden="true" />
                <span>Porter's</span>
              </TabsTrigger>
              {/* 8. Roadmap - Milestones & timeline */}
              <TabsTrigger
                value="roadmap"
                className="flex items-center gap-2 py-2 px-3 text-sm whitespace-nowrap flex-shrink-0"
              >
                <Target className="h-4 w-4" aria-hidden="true" />
                <span>Roadmap</span>
              </TabsTrigger>
              {/* 9. Financials - Financial projections & funding */}
              <TabsTrigger
                value="financials"
                className="flex items-center gap-2 py-2 px-3 text-sm whitespace-nowrap flex-shrink-0"
              >
                <DollarSign className="h-4 w-4" aria-hidden="true" />
                <span>Financials</span>
              </TabsTrigger>
              {/* 10. Pitch - Investor deck (after you know your numbers) */}
              <TabsTrigger
                value="pitch"
                className="flex items-center gap-2 py-2 px-3 text-sm whitespace-nowrap flex-shrink-0"
              >
                <Presentation className="h-4 w-4" aria-hidden="true" />
                <span>Pitch</span>
              </TabsTrigger>
              {/* 11. Tasks - Action items (pulls from everything) */}
              <TabsTrigger
                value="checklist"
                className="flex items-center gap-2 py-2 px-3 text-sm whitespace-nowrap flex-shrink-0"
              >
                <CheckSquare className="h-4 w-4" aria-hidden="true" />
                <span>Tasks</span>
              </TabsTrigger>
              {/* 12. Export - Executive Summary & consolidated exports */}
              <TabsTrigger
                value="exports"
                className="flex items-center gap-2 py-2 px-3 text-sm whitespace-nowrap flex-shrink-0"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>Export</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab content with container - order matches tab triggers */}
          <div className="container mx-auto px-4">
            <Suspense fallback={<TabLoadingFallback />}>
              {/* 1. Canvas */}
              <TabsContent value="canvas" className="mt-0">
                <BusinessModelCanvas />
              </TabsContent>

              {/* 2. Plan */}
              <TabsContent value="businessplan" className="mt-0">
                <BusinessPlan />
              </TabsContent>

              {/* 3. Org */}
              <TabsContent value="orgchart" className="mt-0">
                <OrgChart />
              </TabsContent>

              {/* 4. Brand */}
              <TabsContent value="branding" className="mt-0">
                <Branding />
              </TabsContent>

              {/* 5. Name */}
              <TabsContent value="namecheck" className="mt-0">
                <NameChecker />
              </TabsContent>

              {/* 6. SWOT */}
              <TabsContent value="swot" className="mt-0">
                <SWOTAnalysis />
              </TabsContent>

              {/* 7. Porter's */}
              <TabsContent value="porters" className="mt-0">
                <PortersFiveForces />
              </TabsContent>

              {/* 8. Roadmap */}
              <TabsContent value="roadmap" className="mt-0">
                <Roadmap />
              </TabsContent>

              {/* 9. Financials */}
              <TabsContent value="financials" className="mt-0">
                <Financials />
              </TabsContent>

              {/* 10. Pitch */}
              <TabsContent value="pitch" className="mt-0">
                <PitchDeck />
              </TabsContent>

              {/* 11. Tasks */}
              <TabsContent value="checklist" className="mt-0">
                <Checklist />
              </TabsContent>

              {/* 12. Export */}
              <TabsContent value="exports" className="mt-0">
                <Exports />
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
