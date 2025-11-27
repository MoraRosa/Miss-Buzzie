import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Save, Trash2, Download, Loader2, FileImage, FileText, Swords, Package, ShoppingCart, RefreshCw, DoorOpen, LucideIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useExport } from "@/hooks/useExport";
import { PortersDataSchema, type PortersData, type Factor } from "@/lib/validators/schemas";
import BrandHeader from "./BrandHeader";
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

const defaultPortersData: PortersData = {
  competitiveRivalry: { rating: "", factors: [], notes: "" },
  supplierPower: { rating: "", factors: [], notes: "" },
  buyerPower: { rating: "", factors: [], notes: "" },
  threatOfSubstitutes: { rating: "", factors: [], notes: "" },
  threatOfNewEntrants: { rating: "", factors: [], notes: "" },
};

const PortersFiveForces = () => {
  const { toast } = useToast();

  // Use custom hooks with debounce for auto-save
  const [data, setData, { save }] = useLocalStorage<PortersData>(
    "portersFiveForces",
    defaultPortersData,
    { schema: PortersDataSchema, debounceMs: 500 }
  );

  const { isExporting, exportPNG, exportPDF } = useExport({
    elementId: "porters-content",
    filename: "porters-five-forces",
  });

  const [newFactors, setNewFactors] = useState({
    competitiveRivalry: "",
    supplierPower: "",
    buyerPower: "",
    threatOfSubstitutes: "",
    threatOfNewEntrants: "",
  });

  const handleSave = () => {
    save();
    toast({
      title: "Saved successfully",
      description: "Your Porter's 5 Forces analysis has been saved",
    });
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
    Icon: LucideIcon,
    force: keyof PortersData,
    description: string,
    examples: string
  ) => {
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
            <label htmlFor={`rating-${force}`} className="text-sm font-medium">Threat Level</label>
            <Select
              value={forceData.rating}
              onValueChange={(value) => updateRating(force, value as "low" | "medium" | "high")}
            >
              <SelectTrigger id={`rating-${force}`} className={getRatingColor(forceData.rating)}>
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
            <label htmlFor={`factor-${force}`} className="text-sm font-medium">Key Factors</label>
            <div className="flex gap-2">
              <Input
                id={`factor-${force}`}
                placeholder={examples}
                value={newFactor}
                onChange={(e) => setNewFactors({ ...newFactors, [force]: e.target.value })}
                onKeyPress={(e) => e.key === "Enter" && addFactor(force)}
              />
              <Button onClick={() => addFactor(force)} size="icon" className="shrink-0" aria-label={`Add factor to ${title}`}>
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
                    aria-label="Remove factor"
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
              <DropdownMenuItem onClick={exportPNG} disabled={isExporting}>
                <FileImage className="h-4 w-4 mr-2" />
                Export as PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportPDF} disabled={isExporting}>
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

