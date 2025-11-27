import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Download, Upload, FileText, BarChart3, Users, CheckSquare, Target, Presentation, FileImage, Search, Grid2X2, Layers } from "lucide-react";
import { useTheme } from "next-themes";
import BusinessModelCanvas from "@/components/BusinessModelCanvas";
import PitchDeck from "@/components/PitchDeck";
import Roadmap from "@/components/Roadmap";
import OrgChart from "@/components/OrgChart";
import Checklist from "@/components/Checklist";
import Forecasting from "@/components/Forecasting";
import MarketResearch from "@/components/MarketResearch";
import SWOTAnalysis from "@/components/SWOTAnalysis";
import PortersFiveForces from "@/components/PortersFiveForces";
import AssetManager from "@/components/AssetManager";
import { useToast } from "@/hooks/use-toast";
import { exportAllTabsToPDF, exportAllTabsToImage, exportAllData, importAllData } from "@/lib/exportUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("canvas");

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
        await importAllData(file);
        window.location.reload();
        toast({
          title: "Import successful",
          description: "Your business plan has been restored",
        });
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Invalid file format",
          variant: "destructive",
        });
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 md:gap-3">
              <img
                src="/Miss-Buzzie/images/logo.png"
                alt="Mizzie Logo"
                className="h-8 w-8 md:h-10 md:w-10 rounded-lg object-contain shrink-0"
              />
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-foreground">Mizzie</h1>
                <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">Business Planning Made Simple</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 md:gap-2 w-full sm:w-auto">
              <AssetManager />
              
              <Button variant="outline" size="sm" onClick={handleImport} className="h-9 px-2 md:px-3">
                <Upload className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Import</span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="sm" className="h-9 px-2 md:px-3">
                    <Download className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Export</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={handleExportPDF}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export as PDF
                    <span className="ml-auto text-xs text-muted-foreground">Recommended</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportImage}>
                    <FileImage className="h-4 w-4 mr-2" />
                    Export as Image
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExportJSON}>
                    <Download className="h-4 w-4 mr-2" />
                    Backup Data (JSON)
                    <span className="ml-auto text-xs text-muted-foreground">For restore</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-9 w-9 shrink-0"
              >
                <Sun className="h-4 w-4 md:h-5 md:w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 md:h-5 md:w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="container mx-auto px-4 py-4 md:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Mobile: Horizontal scroll with fade indicators */}
          <div className="relative mb-4 md:mb-8">
            {/* Left fade indicator */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none md:hidden" />

            {/* Right fade indicator */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none md:hidden" />

            <TabsList className="w-full h-auto inline-flex md:grid md:grid-cols-9 overflow-x-auto md:overflow-x-visible scrollbar-hide snap-x snap-mandatory scroll-smooth">
              <TabsTrigger
                value="canvas"
                className="flex flex-row items-center gap-2 py-3 px-4 text-sm whitespace-nowrap shrink-0 snap-start min-w-[120px] md:min-w-0"
              >
                <FileText className="h-4 w-4 shrink-0" />
                <span>Canvas</span>
              </TabsTrigger>
              <TabsTrigger
                value="pitch"
                className="flex flex-row items-center gap-2 py-3 px-4 text-sm whitespace-nowrap shrink-0 snap-start min-w-[120px] md:min-w-0"
              >
                <Presentation className="h-4 w-4 shrink-0" />
                <span>Pitch</span>
              </TabsTrigger>
              <TabsTrigger
                value="roadmap"
                className="flex flex-row items-center gap-2 py-3 px-4 text-sm whitespace-nowrap shrink-0 snap-start min-w-[120px] md:min-w-0"
              >
                <Target className="h-4 w-4 shrink-0" />
                <span>Roadmap</span>
              </TabsTrigger>
              <TabsTrigger
                value="orgchart"
                className="flex flex-row items-center gap-2 py-3 px-4 text-sm whitespace-nowrap shrink-0 snap-start min-w-[120px] md:min-w-0"
              >
                <Users className="h-4 w-4 shrink-0" />
                <span>Org</span>
              </TabsTrigger>
              <TabsTrigger
                value="market"
                className="flex flex-row items-center gap-2 py-3 px-4 text-sm whitespace-nowrap shrink-0 snap-start min-w-[120px] md:min-w-0"
              >
                <Search className="h-4 w-4 shrink-0" />
                <span>Market</span>
              </TabsTrigger>
              <TabsTrigger
                value="swot"
                className="flex flex-row items-center gap-2 py-3 px-4 text-sm whitespace-nowrap shrink-0 snap-start min-w-[120px] md:min-w-0"
              >
                <Grid2X2 className="h-4 w-4 shrink-0" />
                <span>SWOT</span>
              </TabsTrigger>
              <TabsTrigger
                value="porters"
                className="flex flex-row items-center gap-2 py-3 px-4 text-sm whitespace-nowrap shrink-0 snap-start min-w-[120px] md:min-w-0"
              >
                <Layers className="h-4 w-4 shrink-0" />
                <span>Porter's</span>
              </TabsTrigger>
              <TabsTrigger
                value="checklist"
                className="flex flex-row items-center gap-2 py-3 px-4 text-sm whitespace-nowrap shrink-0 snap-start min-w-[120px] md:min-w-0"
              >
                <CheckSquare className="h-4 w-4 shrink-0" />
                <span>Tasks</span>
              </TabsTrigger>
              <TabsTrigger
                value="forecast"
                className="flex flex-row items-center gap-2 py-3 px-4 text-sm whitespace-nowrap shrink-0 snap-start min-w-[120px] md:min-w-0"
              >
                <BarChart3 className="h-4 w-4 shrink-0" />
                <span>Forecast</span>
              </TabsTrigger>
            </TabsList>
          </div>

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
        </Tabs>
      </main>

      <footer className="border-t mt-8 md:mt-16">
        <div className="container mx-auto px-4 py-4 md:py-6 text-center text-xs md:text-sm text-muted-foreground">
          <p>Mizzie 🐝 • Business Planning Made Simple • Made with ❤️ for entrepreneurs</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
