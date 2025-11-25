import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Download, Upload, FileText, BarChart3, Users, CheckSquare, Target, Presentation } from "lucide-react";
import { useTheme } from "next-themes";
import BusinessModelCanvas from "@/components/BusinessModelCanvas";
import PitchDeck from "@/components/PitchDeck";
import Roadmap from "@/components/Roadmap";
import OrgChart from "@/components/OrgChart";
import Checklist from "@/components/Checklist";
import Forecasting from "@/components/Forecasting";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("canvas");

  const handleExport = () => {
    const data = localStorage.getItem("businessPlanData");
    if (!data) {
      toast({
        title: "No data to export",
        description: "Start planning first, then export your work",
      });
      return;
    }

    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `business-plan-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported successfully",
      description: "Your business plan has been downloaded",
    });
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = event.target?.result as string;
          localStorage.setItem("businessPlanData", data);
          window.location.reload();
          toast({
            title: "Imported successfully",
            description: "Your business plan has been loaded",
          });
        } catch (error) {
          toast({
            title: "Import failed",
            description: "Invalid file format",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Target className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Business Planning Platform</h1>
                <p className="text-sm text-muted-foreground">Build your business plan step by step</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleImport}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 mb-8">
            <TabsTrigger value="canvas" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Canvas</span>
            </TabsTrigger>
            <TabsTrigger value="pitch" className="flex items-center gap-2">
              <Presentation className="h-4 w-4" />
              <span className="hidden sm:inline">Pitch Deck</span>
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Roadmap</span>
            </TabsTrigger>
            <TabsTrigger value="orgchart" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Org Chart</span>
            </TabsTrigger>
            <TabsTrigger value="checklist" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Checklist</span>
            </TabsTrigger>
            <TabsTrigger value="forecast" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Forecast</span>
            </TabsTrigger>
          </TabsList>

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

          <TabsContent value="checklist" className="mt-0">
            <Checklist />
          </TabsContent>

          <TabsContent value="forecast" className="mt-0">
            <Forecasting />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Open Source Business Planning Platform • Made with ❤️ for entrepreneurs</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
