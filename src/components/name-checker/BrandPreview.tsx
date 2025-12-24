import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBrandColors, getCompanyLogo, type BrandColors } from "@/lib/assetManager";
import { Download, Eye, Smartphone, Monitor, Type } from "lucide-react";
import html2canvas from "html2canvas";

interface BrandPreviewProps {
  brandName: string;
  slogan: string;
}

const BrandPreview = ({ brandName, slogan }: BrandPreviewProps) => {
  const [brandColors, setBrandColors] = useState<BrandColors>(getBrandColors());
  const [logo, setLogo] = useState<string | null>(getCompanyLogo());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [previewStyle, setPreviewStyle] = useState<"card" | "hero" | "minimal">("card");

  useEffect(() => {
    setBrandColors(getBrandColors());
    setLogo(getCompanyLogo());
    setIsDarkMode(document.documentElement.classList.contains("dark"));

    const handleColorsChange = (e: CustomEvent<BrandColors>) => {
      setBrandColors(e.detail);
    };
    const handleLogoChange = (e: CustomEvent<string>) => {
      setLogo(e.detail);
    };

    // Observe dark mode changes
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    window.addEventListener("brandColorsChanged", handleColorsChange as EventListener);
    window.addEventListener("companyLogoChanged", handleLogoChange as EventListener);

    return () => {
      window.removeEventListener("brandColorsChanged", handleColorsChange as EventListener);
      window.removeEventListener("companyLogoChanged", handleLogoChange as EventListener);
      observer.disconnect();
    };
  }, []);

  const handleExport = async () => {
    const element = document.getElementById("brand-preview-content");
    if (!element) return;

    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 2,
    });

    const link = document.createElement("a");
    link.download = `${brandName || "brand"}-preview.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const displayName = brandName || "Your Brand";
  const displaySlogan = slogan || "Your tagline goes here";

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Eye className="h-6 w-6 text-primary" />
            Brand Preview
          </h2>
          <p className="text-muted-foreground">
            See how your brand name and slogan look together
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Style selector */}
          <Tabs value={previewStyle} onValueChange={(v) => setPreviewStyle(v as typeof previewStyle)}>
            <TabsList>
              <TabsTrigger value="card" className="flex items-center gap-1">
                <Monitor className="h-3 w-3" />
                <span className="text-xs">Card</span>
              </TabsTrigger>
              <TabsTrigger value="hero" className="flex items-center gap-1">
                <Smartphone className="h-3 w-3" />
                <span className="text-xs">Hero</span>
              </TabsTrigger>
              <TabsTrigger value="minimal" className="flex items-center gap-1">
                <Type className="h-3 w-3" />
                <span className="text-xs">Minimal</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Preview area */}
      <Card className="overflow-hidden">
        <div id="brand-preview-content" className="rounded-lg overflow-hidden">
          {previewStyle === "card" && (
            <div 
              className="p-8 flex flex-col items-center justify-center min-h-[200px] relative overflow-hidden"
              style={{ 
                background: isDarkMode 
                  ? `linear-gradient(135deg, ${brandColors.primary}15 0%, ${brandColors.secondary}10 100%)`
                  : `linear-gradient(135deg, ${brandColors.primary}20 0%, ${brandColors.secondary}15 100%)`
              }}
            >
              {/* Decorative circles */}
              <div 
                className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20"
                style={{ backgroundColor: brandColors.primary }}
              />
              <div 
                className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-2xl opacity-15"
                style={{ backgroundColor: brandColors.accent }}
              />
              
              {/* Logo */}
              {logo && (
                <img src={logo} alt="Logo" className="h-16 w-16 object-contain mb-4" />
              )}
              
              {/* Brand name */}
              <h2 
                className="text-3xl md:text-4xl font-bold text-center mb-2"
                style={{ color: brandColors.primary }}
              >
                {displayName}
              </h2>
              
              {/* Slogan */}
              <p className="text-lg text-muted-foreground text-center max-w-md">
                {displaySlogan}
              </p>
            </div>
          )}

          {previewStyle === "hero" && (
            <div
              className="p-12 flex flex-col items-center justify-center min-h-[280px] text-white relative"
              style={{
                background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`
              }}
            >
              {logo && (
                <img src={logo} alt="Logo" className="h-20 w-20 object-contain mb-6 drop-shadow-lg" />
              )}
              <h2 className="text-4xl md:text-5xl font-bold text-center mb-3 drop-shadow-md">
                {displayName}
              </h2>
              <p className="text-xl text-white/90 text-center max-w-lg">
                {displaySlogan}
              </p>
            </div>
          )}

          {previewStyle === "minimal" && (
            <div className="p-8 flex items-center gap-6 min-h-[120px] bg-card border rounded-lg">
              {logo && (
                <img src={logo} alt="Logo" className="h-12 w-12 object-contain flex-shrink-0" />
              )}
              <div className="flex-1">
                <h2
                  className="text-2xl font-bold mb-1"
                  style={{ color: brandColors.primary }}
                >
                  {displayName}
                </h2>
                <p className="text-muted-foreground">
                  {displaySlogan}
                </p>
              </div>
              <div
                className="w-1 h-16 rounded-full flex-shrink-0"
                style={{ backgroundColor: brandColors.accent }}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Brand info hint */}
      <p className="text-xs text-muted-foreground text-center">
        💡 Tip: Update your brand colors and logo in the <strong>Brand</strong> tab to see them reflected here
      </p>
    </div>
  );
};

export default BrandPreview;

