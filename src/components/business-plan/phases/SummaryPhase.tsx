/**
 * Phase 12: Summary
 * 
 * Final phase showing the complete business plan preview.
 * Includes export functionality for PNG and PDF.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Download, FileImage, FileText, Loader2, CheckCircle2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { PhaseProps } from "../types";
import BusinessPlanPreview from "../BusinessPlanPreview";

const SummaryPhase = ({ data }: PhaseProps) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<"png" | "pdf" | null>(null);

  const getFilename = (ext: string) => {
    const name = data.businessName || data.ownerName || "business-plan";
    const safeName = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return `${safeName}-plan.${ext}`;
  };

  const handleExportPNG = async () => {
    const element = document.querySelector("[data-mizzie-business-plan]") as HTMLElement;
    if (!element) {
      toast({
        title: "Export failed",
        description: "Could not find preview element",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    setExportType("png");

    try {
      const isDarkMode = document.documentElement.classList.contains("dark");
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: isDarkMode ? "#0a0a0a" : "#ffffff",
        logging: false,
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = getFilename("png");
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast({
        title: "✅ Export successful!",
        description: "Your business plan has been saved as PNG",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleExportPDF = async () => {
    const element = document.querySelector("[data-mizzie-business-plan]") as HTMLElement;
    if (!element) {
      toast({
        title: "Export failed",
        description: "Could not find preview element",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    setExportType("pdf");

    try {
      const isDarkMode = document.documentElement.classList.contains("dark");
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: isDarkMode ? "#0a0a0a" : "#ffffff",
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // A4 dimensions in mm
      const pdfWidth = 210;
      const pdfHeight = (imgHeight * pdfWidth) / imgWidth;

      const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? "portrait" : "landscape",
        unit: "mm",
        format: [pdfWidth, pdfHeight],
      });

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(getFilename("pdf"));

      toast({
        title: "✅ Export successful!",
        description: "Your business plan has been saved as PDF",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  // Calculate completion stats
  const completedPhasesCount = (data.completedPhases ?? []).length;
  const totalPhases = 11; // Excluding summary phase
  const completionPercent = Math.round((completedPhasesCount / totalPhases) * 100);

  return (
    <div className="space-y-6">
      {/* Completion Status */}
      <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
        <div className="flex items-center gap-4">
          <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-green-800 dark:text-green-200">
              {completionPercent >= 80 ? "Great Progress!" : completionPercent >= 50 ? "Keep Going!" : "Getting Started"}
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              You've completed {completedPhasesCount} of {totalPhases} sections ({completionPercent}%)
            </p>
          </div>
        </div>
      </Card>

      {/* Export Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button
          onClick={handleExportPNG}
          disabled={isExporting}
          variant="outline"
          className="gap-2"
        >
          {isExporting && exportType === "png" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileImage className="h-4 w-4" />
          )}
          <span>Export as PNG</span>
        </Button>
        <Button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
        >
          {isExporting && exportType === "pdf" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          <span>Export as PDF</span>
        </Button>
      </div>

      {/* Preview Document */}
      <div className="mt-6">
        <p className="text-sm text-muted-foreground text-center mb-4">
          Preview your complete business plan below. Scroll to review all sections.
        </p>
        <div
          className="border rounded-lg overflow-auto max-h-[600px] shadow-inner"
          style={{ scrollbarWidth: "thin" }}
        >
          <BusinessPlanPreview data={data} />
        </div>
      </div>

      {/* Tips */}
      <Card className="p-4 bg-muted/30">
        <h4 className="font-medium mb-2">💡 Export Tips</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <strong>PNG:</strong> Best for sharing on social media or with friends/family</li>
          <li>• <strong>PDF:</strong> Professional format for investors, banks, or business partners</li>
          <li>• Your brand colors and logo are automatically included</li>
          <li>• The export uses your current theme (light/dark mode)</li>
        </ul>
      </Card>
    </div>
  );
};

export default SummaryPhase;

