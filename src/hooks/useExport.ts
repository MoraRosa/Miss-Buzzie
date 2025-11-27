import { useState, useCallback } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useToast } from "@/hooks/use-toast";

interface UseExportOptions {
  /** Element ID to capture */
  elementId: string;
  /** Base filename without extension */
  filename: string;
  /** Scale factor for export quality (default: 2) */
  scale?: number;
}

interface ExportResult {
  isExporting: boolean;
  exportPNG: () => Promise<void>;
  exportPDF: () => Promise<void>;
}

/**
 * Custom hook for exporting content as PNG or PDF
 * Reduces code duplication across all tab components
 */
export function useExport({ elementId, filename, scale = 2 }: UseExportOptions): ExportResult {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const getBackgroundColor = useCallback(() => {
    return document.documentElement.classList.contains("dark") ? "#0a0a0a" : "#ffffff";
  }, []);

  const captureElement = useCallback(async () => {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    return html2canvas(element, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: getBackgroundColor(),
    });
  }, [elementId, scale, getBackgroundColor]);

  const exportPNG = useCallback(async () => {
    setIsExporting(true);
    try {
      const canvas = await captureElement();

      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast({
        title: "Export successful",
        description: `${filename} exported as PNG`,
      });
    } catch (error) {
      console.error("PNG export failed:", error);
      toast({
        title: "Export failed",
        description: "Failed to export as PNG",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  }, [captureElement, filename, toast]);

  const exportPDF = useCallback(async () => {
    setIsExporting(true);
    try {
      const canvas = await captureElement();

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = 297; // A4 height in mm

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png");

      // Handle multi-page PDFs
      if (imgHeight > pageHeight) {
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      } else {
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      }

      pdf.save(`${filename}.pdf`);

      toast({
        title: "Export successful",
        description: `${filename} exported as PDF`,
      });
    } catch (error) {
      console.error("PDF export failed:", error);
      toast({
        title: "Export failed",
        description: "Failed to export as PDF",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  }, [captureElement, filename, toast]);

  return { isExporting, exportPNG, exportPDF };
}

export default useExport;

