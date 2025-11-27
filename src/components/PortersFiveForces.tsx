import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Save, Trash2, Download, Loader2, FileImage, FileText, Swords, Package, ShoppingCart, RefreshCw, DoorOpen } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Factor {
  id: string;
  text: string;
}

interface Force {
  rating: "low" | "medium" | "high" | "";
  factors: Factor[];
  notes: string;
}

interface PortersData {
  competitiveRivalry: Force;
  supplierPower: Force;
  buyerPower: Force;
  threatOfSubstitutes: Force;
  threatOfNewEntrants: Force;
}

const PortersFiveForces = () => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [data, setData] = useState<PortersData>({
    competitiveRivalry: { rating: "", factors: [], notes: "" },
    supplierPower: { rating: "", factors: [], notes: "" },
    buyerPower: { rating: "", factors: [], notes: "" },
    threatOfSubstitutes: { rating: "", factors: [], notes: "" },
    threatOfNewEntrants: { rating: "", factors: [], notes: "" },
  });

  const [newFactors, setNewFactors] = useState({
    competitiveRivalry: "",
    supplierPower: "",
    buyerPower: "",
    threatOfSubstitutes: "",
    threatOfNewEntrants: "",
  });

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("portersFiveForces");
    if (saved) {
      setData(JSON.parse(saved));
    }
  }, []);

  // Auto-save to localStorage with debounce (500ms delay)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem("portersFiveForces", JSON.stringify(data));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [data]);

  const handleSave = () => {
    localStorage.setItem("portersFiveForces", JSON.stringify(data));
    toast({
      title: "Saved successfully",
      description: "Your Porter's 5 Forces analysis has been saved",
    });
  };

  const handleExportPNG = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById("porters-content");
      if (!element) throw new Error("Porter's content not found");

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: document.documentElement.classList.contains("dark") ? "#0a0a0a" : "#ffffff",
      });

      const link = document.createElement("a");
      link.download = "porters-five-forces.png";
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast({
        title: "Export successful",
        description: "Porter's 5 Forces exported as PNG",
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
      const element = document.getElementById("porters-content");
      if (!element) throw new Error("Porter's content not found");

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: document.documentElement.classList.contains("dark") ? "#0a0a0a" : "#ffffff",
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? "portrait" : "landscape",
        unit: "mm",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png");

      // If content is longer than one page, split it
      if (imgHeight > 297) {
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= 297;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= 297;
        }
      } else {
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      }

      pdf.save("porters-five-forces.pdf");

      toast({
        title: "Export successful",
        description: "Porter's 5 Forces exported as PDF",
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

  const addFactor = (force: keyof PortersData) => {
    const text = newFactors[force].trim();
    if (!text) {
      toast({
        title: "Text required",
        description: "Please enter some text before adding",
        variant: "destructive",
      });
      return;
    }

    const newFactor: Factor = {
      id: Date.now().toString(),
      text,
    };

    setData((prev) => ({
      ...prev,
      [force]: {
        ...prev[force],
        factors: [...prev[force].factors, newFactor],
      },
    }));

    setNewFactors((prev) => ({
      ...prev,
      [force]: "",
    }));
  };

  const removeFactor = (force: keyof PortersData, id: string) => {
    setData((prev) => ({
      ...prev,
      [force]: {
        ...prev[force],
        factors: prev[force].factors.filter((f) => f.id !== id),
      },
    }));
  };

  const updateRating = (force: keyof PortersData, rating: "low" | "medium" | "high") => {
    setData((prev) => ({
      ...prev,
      [force]: {
        ...prev[force],
        rating,
      },
    }));
  };

  const updateNotes = (force: keyof PortersData, notes: string) => {
    setData((prev) => ({
      ...prev,
      [force]: {
        ...prev[force],
        notes,
      },
    }));
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "low":
        return "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800";
      case "medium":
        return "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800";
      case "high":
        return "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800";
      default:
        return "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-800";
    }
  };

  const renderForceCard = (
    title: string,
    icon: any,
    force: keyof PortersData,
    description: string,
    examples: string
  ) => {
    const Icon = icon;
    const forceData = data[force];
    const newFactor = newFactors[force];

    return (
      <Card key={force}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Threat Level</label>
            <Select
              value={forceData.rating}
              onValueChange={(value) => updateRating(force, value as "low" | "medium" | "high")}
            >
              <SelectTrigger className={getRatingColor(forceData.rating)}>
                <SelectValue placeholder="Select threat level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Add Factor */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Key Factors</label>
            <div className="flex gap-2">
              <Input
                placeholder={examples}
                value={newFactor}
                onChange={(e) => setNewFactors({ ...newFactors, [force]: e.target.value })}
                onKeyPress={(e) => e.key === "Enter" && addFactor(force)}
              />
              <Button onClick={() => addFactor(force)} size="icon" className="shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Factors List */}
          {forceData.factors.length > 0 && (
            <div className="space-y-2">
              {forceData.factors.map((factor) => (
                <div
                  key={factor.id}
                  className="flex items-start gap-2 p-2 rounded-lg bg-muted border"
                >
                  <p className="flex-1 text-sm">{factor.text}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                    onClick={() => removeFactor(force, factor.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Analysis Notes</label>
            <Textarea
              placeholder="Add your analysis and insights..."
              value={forceData.notes}
              onChange={(e) => updateNotes(force, e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <BrandHeader />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Porter's 5 Forces</h2>
          <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
            Analyze the competitive forces shaping your industry
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

      <div id="porters-content" className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {renderForceCard(
            "Competitive Rivalry",
            Swords,
            "competitiveRivalry",
            "Intensity of competition among existing competitors",
            "e.g., Number of competitors, market growth rate..."
          )}

          {renderForceCard(
            "Supplier Power",
            Package,
            "supplierPower",
            "Bargaining power of suppliers",
            "e.g., Few suppliers, unique products..."
          )}

          {renderForceCard(
            "Buyer Power",
            ShoppingCart,
            "buyerPower",
            "Bargaining power of customers",
            "e.g., Large buyers, price sensitivity..."
          )}

          {renderForceCard(
            "Threat of Substitutes",
            RefreshCw,
            "threatOfSubstitutes",
            "Likelihood of customers finding alternative solutions",
            "e.g., Alternative products, switching costs..."
          )}

          {renderForceCard(
            "Threat of New Entrants",
            DoorOpen,
            "threatOfNewEntrants",
            "Ease of new competitors entering the market",
            "e.g., Capital requirements, regulations..."
          )}
        </div>
      </div>
    </div>
  );
};

export default PortersFiveForces;

