import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, Download, Loader2, FileImage, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import BrandHeader from "./BrandHeader";
import { Accordion } from "@/components/ui/accordion";
import MarketDefinition from "./market-research/MarketDefinition";
import TAMSAMSOMSection from "./market-research/TAMSAMSOMSection";
import CustomerSegments from "./market-research/CustomerSegments";
import CompetitiveLandscape from "./market-research/CompetitiveLandscape";
import PricingSection from "./market-research/PricingSection";
import DistributionSection from "./market-research/DistributionSection";
import RegulatorySection from "./market-research/RegulatorySection";
import TrendsSection from "./market-research/TrendsSection";
import ProcurementSection from "./market-research/ProcurementSection";
import RisksSection from "./market-research/RisksSection";
import EntryPlanSection from "./market-research/EntryPlanSection";
import { exportMarketResearchAsPNG, exportMarketResearchAsPDF } from "@/lib/marketResearchExport";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MarketResearchDataSchema } from "@/lib/validators/schemas";

// Data interfaces
export interface CustomerSegment {
  id: string;
  name: string;
  jtbd: string;
  buyingTriggers: string;
  procurementCycle: string;
  budget: string;
  quotes: string;
}

export interface Competitor {
  id: string;
  name: string;
  foundingYear: string;
  hq: string;
  fundingRevenue: string;
  coreOffer: string;
  pricingModel: string;
  differentiators: string;
  gtmMotion: string;
  notableCustomers: string;
}

export interface Risk {
  id: string;
  description: string;
  likelihood: "Low" | "Medium" | "High";
  impact: "Low" | "Medium" | "High";
}

export interface Experiment {
  id: string;
  name: string;
  description: string;
  costRange: string;
}

export interface MarketResearchData {
  // Market Definition
  marketDefinition: string;
  
  // TAM/SAM/SOM
  tamCurrent: string;
  samCurrent: string;
  somCurrent: string;
  tamProjection: string;
  samProjection: string;
  somProjection: string;
  tamAssumptions: string;
  
  // Customer Segments
  customerSegments: CustomerSegment[];
  
  // Competitive Landscape
  competitors: Competitor[];
  
  // Pricing & Unit Economics
  pricingInfo: string;
  
  // Distribution & GTM
  distributionChannels: string;
  
  // Regulatory & Compliance
  regulatoryInfo: string;
  
  // Demand Signals & Trends
  trendsInfo: string;
  
  // Procurement Reality Check
  procurementInfo: string;
  
  // Risks & Unknowns
  risks: Risk[];
  
  // Actionable Entry Plan
  entryPlan: string;
  experiments: Experiment[];
}

const defaultData: MarketResearchData = {
  marketDefinition: "",
  tamCurrent: "",
  samCurrent: "",
  somCurrent: "",
  tamProjection: "",
  samProjection: "",
  somProjection: "",
  tamAssumptions: "",
  customerSegments: [],
  competitors: [],
  pricingInfo: "",
  distributionChannels: "",
  regulatoryInfo: "",
  trendsInfo: "",
  procurementInfo: "",
  risks: [],
  entryPlan: "",
  experiments: [],
};

const MarketResearch = () => {
  const { toast } = useToast();

  // Use validated localStorage hook with auto-save
  const [data, setData, { save }] = useLocalStorage<MarketResearchData>(
    "marketResearch",
    defaultData,
    { schema: MarketResearchDataSchema, debounceMs: 300 }
  );

  const [isExporting, setIsExporting] = useState(false);

  const handleSave = () => {
    save();
    toast({
      title: "Saved successfully",
      description: "Your market research has been saved",
    });
  };

  const handleExportPNG = async () => {
    setIsExporting(true);
    try {
      await exportMarketResearchAsPNG();
      toast({
        title: "Export successful",
        description: "Market research exported as PNG",
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export failed",
        description: "Failed to export market research as PNG",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportMarketResearchAsPDF();
      toast({
        title: "Export successful",
        description: "Market research exported as PDF",
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export failed",
        description: "Failed to export market research as PDF",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <BrandHeader />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Market Research</h2>
          <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
            Comprehensive market analysis using proven frameworks
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={handleSave} className="flex-1 sm:flex-none">
            <Save className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Save</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1 sm:flex-none" disabled={isExporting}>
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span className="hidden sm:inline">Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Export</span>
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportPNG} disabled={isExporting}>
                <FileImage className="h-4 w-4 mr-2" />
                Export as PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF} disabled={isExporting}>
                <FileText className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Accordion type="multiple" className="w-full space-y-4" id="market-research-content">
        <MarketDefinition
          value={data.marketDefinition}
          onChange={(value) => setData({ ...data, marketDefinition: value })}
        />

        <TAMSAMSOMSection
          tamCurrent={data.tamCurrent}
          samCurrent={data.samCurrent}
          somCurrent={data.somCurrent}
          tamProjection={data.tamProjection}
          samProjection={data.samProjection}
          somProjection={data.somProjection}
          assumptions={data.tamAssumptions}
          onChange={(field, value) => setData({ ...data, [field]: value })}
        />

        <CustomerSegments
          segments={data.customerSegments}
          onChange={(segments) => setData({ ...data, customerSegments: segments })}
        />

        <CompetitiveLandscape
          competitors={data.competitors}
          onChange={(competitors) => setData({ ...data, competitors: competitors })}
        />

        <PricingSection
          value={data.pricingInfo}
          onChange={(value) => setData({ ...data, pricingInfo: value })}
        />

        <DistributionSection
          value={data.distributionChannels}
          onChange={(value) => setData({ ...data, distributionChannels: value })}
        />

        <RegulatorySection
          value={data.regulatoryInfo}
          onChange={(value) => setData({ ...data, regulatoryInfo: value })}
        />

        <TrendsSection
          value={data.trendsInfo}
          onChange={(value) => setData({ ...data, trendsInfo: value })}
        />

        <ProcurementSection
          value={data.procurementInfo}
          onChange={(value) => setData({ ...data, procurementInfo: value })}
        />

        <RisksSection
          risks={data.risks}
          onChange={(risks) => setData({ ...data, risks: risks })}
        />

        <EntryPlanSection
          entryPlan={data.entryPlan}
          experiments={data.experiments}
          onEntryPlanChange={(value) => setData({ ...data, entryPlan: value })}
          onExperimentsChange={(experiments) => setData({ ...data, experiments: experiments })}
        />
      </Accordion>
    </div>
  );
};

export default MarketResearch;

