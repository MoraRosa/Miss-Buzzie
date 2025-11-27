import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, Download, Loader2, FileImage, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BrandHeader from "./BrandHeader";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CanvasData {
  keyPartners: string;
  keyActivities: string;
  keyResources: string;
  valuePropositions: string;
  customerRelationships: string;
  channels: string;
  customerSegments: string;
  costStructure: string;
  revenueStreams: string;
}

const BusinessModelCanvas = () => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [data, setData] = useState<CanvasData>({
    keyPartners: "",
    keyActivities: "",
    keyResources: "",
    valuePropositions: "",
    customerRelationships: "",
    channels: "",
    customerSegments: "",
    costStructure: "",
    revenueStreams: "",
  });

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("businessModelCanvas");
    if (saved) {
      setData(JSON.parse(saved));
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem("businessModelCanvas", JSON.stringify(data));
  }, [data]);

  const handleSave = () => {
    localStorage.setItem("businessModelCanvas", JSON.stringify(data));
    toast({
      title: "Saved successfully",
      description: "Your business model canvas has been saved",
    });
  };

  const handleExportPNG = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById("business-model-canvas-content");
      if (!element) throw new Error("Canvas content not found");

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: document.documentElement.classList.contains("dark") ? "#0a0a0a" : "#ffffff",
      });

      const link = document.createElement("a");
      link.download = "business-model-canvas.png";
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast({
        title: "Export successful",
        description: "Business Model Canvas exported as PNG",
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export failed",
        description: "Failed to export as PNG",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById("business-model-canvas-content");
      if (!element) throw new Error("Canvas content not found");

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: document.documentElement.classList.contains("dark") ? "#0a0a0a" : "#ffffff",
      });

      const imgWidth = 297; // A4 landscape width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("business-model-canvas.pdf");

      toast({
        title: "Export successful",
        description: "Business Model Canvas exported as PDF",
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export failed",
        description: "Failed to export as PDF",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const updateField = (field: keyof CanvasData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <BrandHeader />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Business Model Canvas</h2>
          <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
            Define your business model using the Business Model Canvas framework
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isExporting} className="flex-1 sm:flex-none">
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
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
          <Button onClick={handleSave} className="flex-1 sm:flex-none">
            <Save className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Save</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4" id="business-model-canvas-content">
        <Card className="md:col-span-1 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Key Partners</CardTitle>
            <CardDescription className="text-xs md:text-sm">Who are your key partners and suppliers?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="List your key partnerships..."
              value={data.keyPartners}
              onChange={(e) => updateField("keyPartners", e.target.value)}
              className="min-h-[150px] md:min-h-[200px] text-sm md:text-base"
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-1 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Key Activities</CardTitle>
            <CardDescription className="text-xs md:text-sm">What are your key activities?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Describe your key activities..."
              value={data.keyActivities}
              onChange={(e) => updateField("keyActivities", e.target.value)}
              className="min-h-[150px] md:min-h-[200px] text-sm md:text-base"
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1 border-2 border-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Value Propositions</CardTitle>
            <CardDescription className="text-xs md:text-sm">What value do you deliver to customers?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Describe your unique value proposition..."
              value={data.valuePropositions}
              onChange={(e) => updateField("valuePropositions", e.target.value)}
              className="min-h-[150px] md:min-h-[200px] text-sm md:text-base"
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-1 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Customer Relationships</CardTitle>
            <CardDescription className="text-xs md:text-sm">How do you interact with customers?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Describe customer relationships..."
              value={data.customerRelationships}
              onChange={(e) => updateField("customerRelationships", e.target.value)}
              className="min-h-[150px] md:min-h-[200px] text-sm md:text-base"
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-1 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Customer Segments</CardTitle>
            <CardDescription className="text-xs md:text-sm">Who are your target customers?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Define your customer segments..."
              value={data.customerSegments}
              onChange={(e) => updateField("customerSegments", e.target.value)}
              className="min-h-[150px] md:min-h-[200px] text-sm md:text-base"
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-1 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Key Resources</CardTitle>
            <CardDescription className="text-xs md:text-sm">What resources do you need?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="List your key resources..."
              value={data.keyResources}
              onChange={(e) => updateField("keyResources", e.target.value)}
              className="min-h-[150px] md:min-h-[200px] text-sm md:text-base"
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-1 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Channels</CardTitle>
            <CardDescription className="text-xs md:text-sm">How do you reach customers?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Describe your channels..."
              value={data.channels}
              onChange={(e) => updateField("channels", e.target.value)}
              className="min-h-[150px] md:min-h-[200px] text-sm md:text-base"
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Cost Structure</CardTitle>
            <CardDescription className="text-xs md:text-sm">What are your main costs?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Detail your cost structure..."
              value={data.costStructure}
              onChange={(e) => updateField("costStructure", e.target.value)}
              className="min-h-[120px] md:min-h-[150px] text-sm md:text-base"
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Revenue Streams</CardTitle>
            <CardDescription className="text-xs md:text-sm">How do you make money?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Describe your revenue streams..."
              value={data.revenueStreams}
              onChange={(e) => updateField("revenueStreams", e.target.value)}
              className="min-h-[120px] md:min-h-[150px] text-sm md:text-base"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessModelCanvas;
