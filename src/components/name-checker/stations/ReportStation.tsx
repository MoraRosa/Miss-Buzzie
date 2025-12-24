/**
 * Station 7: Brand Report
 * 
 * Comprehensive exportable report with all brand data.
 * Supports light/dark mode and uses brand asset manager colors.
 */

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileImage, FileText, Loader2, Globe, Users, Scale, 
  Check, X, AlertCircle, Download, Printer
} from "lucide-react";
import { getBrandColors, getCompanyLogo, type BrandColors } from "@/lib/assetManager";
import type { StationProps } from "../types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const ReportStation = ({ brandName, currentSearch, updateSearch, markStationComplete }: StationProps) => {
  const [brandColors, setBrandColors] = useState<BrandColors>(getBrandColors());
  const [logo, setLogo] = useState<string | null>(getCompanyLogo());
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<"png" | "pdf" | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setBrandColors(getBrandColors());
    setLogo(getCompanyLogo());

    const handleColorsChange = (e: CustomEvent<BrandColors>) => setBrandColors(e.detail);
    const handleLogoChange = (e: CustomEvent<string>) => setLogo(e.detail);

    window.addEventListener("brandColorsChanged", handleColorsChange as EventListener);
    window.addEventListener("companyLogoChanged", handleLogoChange as EventListener);

    return () => {
      window.removeEventListener("brandColorsChanged", handleColorsChange as EventListener);
      window.removeEventListener("companyLogoChanged", handleLogoChange as EventListener);
    };
  }, []);

  // Mark station complete when viewed
  useEffect(() => {
    markStationComplete();
  }, [markStationComplete]);

  const handleExport = async (type: "png" | "pdf") => {
    if (!reportRef.current) return;
    setIsExporting(true);
    setExportType(type);

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });

      if (type === "png") {
        const link = document.createElement("a");
        link.download = `${currentSearch.name}-brand-report.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } else {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: [canvas.width / 2, canvas.height / 2],
        });
        pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
        pdf.save(`${currentSearch.name}-brand-report.pdf`);
      }
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  // Stats calculations
  const domainStats = {
    available: currentSearch.domains.filter(d => d.status === "available").length,
    taken: currentSearch.domains.filter(d => d.status === "taken").length,
    total: currentSearch.domains.length,
  };
  const socialStats = {
    available: currentSearch.socialMedia.filter(s => s.status === "available").length,
    taken: currentSearch.socialMedia.filter(s => s.status === "taken").length,
    total: currentSearch.socialMedia.length,
  };
  const trademarkStats = {
    clear: currentSearch.trademarks.filter(t => t.status === "clear").length,
    conflict: currentSearch.trademarks.filter(t => t.status === "conflict").length,
    total: currentSearch.trademarks.length,
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: "A+", color: "text-green-500" };
    if (score >= 80) return { grade: "A", color: "text-green-500" };
    if (score >= 70) return { grade: "B+", color: "text-lime-500" };
    if (score >= 60) return { grade: "B", color: "text-yellow-500" };
    if (score >= 50) return { grade: "C", color: "text-orange-500" };
    return { grade: "D", color: "text-red-500" };
  };

  const { grade, color: gradeColor } = getScoreGrade(currentSearch.overallScore || 0);

  return (
    <div className="space-y-6">
      {/* Export Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Brand Report</h3>
          <p className="text-sm text-muted-foreground">
            Download your comprehensive brand availability report
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleExport("png")}
            disabled={isExporting}
          >
            {isExporting && exportType === "png" ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <FileImage className="h-4 w-4 mr-2" />
            )}
            Export PNG
          </Button>
          <Button 
            onClick={() => handleExport("pdf")}
            disabled={isExporting}
          >
            {isExporting && exportType === "pdf" ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Export PDF
          </Button>
        </div>
      </div>

      {/* Report Preview */}
      <Card 
        ref={reportRef}
        className="p-6 overflow-hidden"
      >
        {/* Header with gradient using brand colors */}
        <div 
          className="p-6 -m-6 mb-6 text-center"
          style={{ 
            background: `linear-gradient(135deg, ${brandColors.primary}20 0%, ${brandColors.secondary}15 100%)` 
          }}
        >
          <div className="py-4">
            {logo && (
              <img src={logo} alt="Logo" className="h-16 w-16 object-contain mx-auto mb-4" />
            )}
            <h1
              className="text-4xl font-bold mb-2"
              style={{ color: brandColors.primary }}
            >
              {currentSearch.name}
            </h1>
            {currentSearch.slogan && (
              <p className="text-lg text-muted-foreground italic">"{currentSearch.slogan}"</p>
            )}
          </div>
        </div>

        {/* Score Section */}
        <div className="flex items-center justify-center gap-8 p-6 bg-muted/30 rounded-lg mb-6">
          <div className="text-center">
            <div className={`text-5xl font-bold ${gradeColor}`}>
              {currentSearch.overallScore || 0}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">Brand Score</div>
          </div>
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold"
            style={{
              backgroundColor: `${brandColors.primary}20`,
              color: brandColors.primary
            }}
          >
            {grade}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Domains */}
          <div className="p-4 bg-blue-500/10 rounded-lg text-center">
            <Globe className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-500">
              {domainStats.available}/{domainStats.total}
            </div>
            <div className="text-xs text-muted-foreground">Domains Available</div>
          </div>
          {/* Social */}
          <div className="p-4 bg-purple-500/10 rounded-lg text-center">
            <Users className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-500">
              {socialStats.available}/{socialStats.total}
            </div>
            <div className="text-xs text-muted-foreground">Socials Available</div>
          </div>
          {/* Trademarks */}
          <div className="p-4 bg-amber-500/10 rounded-lg text-center">
            <Scale className="h-6 w-6 text-amber-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-amber-500">
              {trademarkStats.clear}/{trademarkStats.total}
            </div>
            <div className="text-xs text-muted-foreground">Trademarks Clear</div>
          </div>
        </div>

        {/* Domain Details */}
        {currentSearch.domains.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-500" /> Domain Availability
            </h3>
            <div className="flex flex-wrap gap-2">
              {currentSearch.domains.map(d => (
                <Badge
                  key={`${d.domain}${d.tld}`}
                  variant={d.status === "available" ? "default" : d.status === "taken" ? "destructive" : "secondary"}
                  className="text-xs py-1"
                >
                  {d.status === "available" && <Check className="h-3 w-3 mr-1" />}
                  {d.status === "taken" && <X className="h-3 w-3 mr-1" />}
                  {d.domain}{d.tld}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Social Media Details */}
        {currentSearch.socialMedia.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" /> Social Media Handles
            </h3>
            <div className="flex flex-wrap gap-2">
              {currentSearch.socialMedia.map(s => (
                <Badge
                  key={s.platform}
                  variant={s.status === "available" ? "default" : s.status === "taken" ? "destructive" : "secondary"}
                  className="text-xs py-1"
                >
                  {s.status === "available" && <Check className="h-3 w-3 mr-1" />}
                  {s.status === "taken" && <X className="h-3 w-3 mr-1" />}
                  @{s.handle} ({s.platform})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Trademark Details */}
        {currentSearch.trademarks.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Scale className="h-4 w-4 text-amber-500" /> Trademark Status
            </h3>
            <div className="flex flex-wrap gap-2">
              {currentSearch.trademarks.map(t => (
                <Badge
                  key={t.countryCode}
                  variant={t.status === "clear" ? "default" : t.status === "conflict" ? "destructive" : "secondary"}
                  className="text-xs py-1"
                >
                  {t.status === "clear" && <Check className="h-3 w-3 mr-1" />}
                  {t.status === "conflict" && <AlertCircle className="h-3 w-3 mr-1" />}
                  {t.country} ({t.office})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          className="pt-4 mt-6 border-t text-center text-xs text-muted-foreground"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <img
              src="/Miss-Buzzie/images/logo.png"
              alt="Mizzie"
              className="h-5 w-5 object-contain"
            />
            <span className="font-medium text-foreground">Mizzie</span>
          </div>
          <div>Generated on {new Date().toLocaleDateString()}</div>
        </div>
      </Card>

      {/* Tips */}
      <p className="text-xs text-muted-foreground text-center">
        💡 Tip: Update your brand colors and logo in the <strong>Brand</strong> tab to see them reflected here
      </p>
    </div>
  );
};

export default ReportStation;

