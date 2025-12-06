/**
 * Station 6: Brand DNA Card
 *
 * The culmination of the journey - a beautiful summary of the brand identity
 * that can be exported and referenced across the platform.
 */

import { useRef, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Share2, Sparkles, Copy, Check } from "lucide-react";
import { StationProps } from "./types";
import {
  ARCHETYPES,
  EMOTIONS,
  VOICE_STYLES,
} from "@/lib/brandStrategy";
import { getBrandColors, getCompanyLogo, BrandColors } from "@/lib/assetManager";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";

// Helper to convert hex to RGB for gradients
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

// Helper to lighten/darken a hex color (same as RoadmapVisual)
const adjustColor = (hex: string, amount: number): string => {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

const BrandDNAStation = ({ strategy }: StationProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [brandColors, setBrandColors] = useState<BrandColors>(getBrandColors());
  const [companyLogo, setCompanyLogo] = useState<string | null>(getCompanyLogo());
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode (same pattern as RoadmapVisual)
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  // Listen for brand color/logo changes
  useEffect(() => {
    const handleColorsChange = (e: CustomEvent<BrandColors>) => setBrandColors(e.detail);
    const handleLogoChange = (e: CustomEvent<string>) => setCompanyLogo(e.detail);

    window.addEventListener('brandColorsChanged', handleColorsChange as EventListener);
    window.addEventListener('companyLogoChanged', handleLogoChange as EventListener);

    return () => {
      window.removeEventListener('brandColorsChanged', handleColorsChange as EventListener);
      window.removeEventListener('companyLogoChanged', handleLogoChange as EventListener);
    };
  }, []);

  // Get RGB values for gradients
  const primaryRgb = hexToRgb(brandColors.primary);
  const secondaryRgb = hexToRgb(brandColors.secondary);
  const accentRgb = hexToRgb(brandColors.accent);

  // Theme-aware colors (same pattern as RoadmapVisual)
  const colors = {
    primary: brandColors.primary,
    secondary: brandColors.secondary,
    accent: brandColors.accent,
    // Background colors
    cardBg: isDarkMode ? "#171717" : "#fafafa",
    cardBgAlt: isDarkMode ? "#262626" : "#f5f5f5",
    // Text colors
    textPrimary: isDarkMode ? "#f5f5f5" : "#171717",
    textSecondary: isDarkMode ? "#a3a3a3" : "#525252",
    textMuted: isDarkMode ? "#737373" : "#a3a3a3",
  };

  const primaryArchetype = ARCHETYPES.find(a => a.id === strategy.primaryArchetype);
  const secondaryArchetype = ARCHETYPES.find(a => a.id === strategy.secondaryArchetype);
  const primaryVoice = VOICE_STYLES.find(v => v.id === strategy.voice.primaryStyle);
  const secondaryVoice = VOICE_STYLES.find(v => v.id === strategy.voice.secondaryStyle);
  const selectedEmotions = strategy.emotions.map(id => EMOTIONS.find(e => e.id === id)).filter(Boolean);

  const isComplete = strategy.brandName && strategy.primaryArchetype && strategy.emotions.length > 0;

  // Check if story sections have content
  const hasStory = strategy.story.catalyst || strategy.story.coreTruth || strategy.story.proof;

  const handleExport = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: colors.cardBg,
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
          const clonedCard = clonedDoc.querySelector('[data-brand-dna-card]') as HTMLElement;
          if (clonedCard) {
            // Apply background gradient
            const gradient = isDarkMode
              ? `linear-gradient(135deg, ${colors.cardBg} 0%, ${adjustColor(colors.primary, -120)}30 50%, ${adjustColor(colors.secondary, -100)}25 100%)`
              : `linear-gradient(135deg, ${colors.cardBg} 0%, ${adjustColor(colors.primary, 80)}40 50%, ${adjustColor(colors.secondary, 60)}30 100%)`;
            clonedCard.style.background = gradient;
            clonedCard.style.color = colors.textPrimary;

            // Fix brand name - html2canvas can't render bg-clip-text
            // Replace gradient text with solid colored text
            const brandNameEl = clonedCard.querySelector('h2') as HTMLElement;
            if (brandNameEl) {
              brandNameEl.style.background = 'none';
              brandNameEl.style.backgroundImage = 'none';
              brandNameEl.style.webkitBackgroundClip = 'unset';
              brandNameEl.style.backgroundClip = 'unset';
              brandNameEl.style.webkitTextFillColor = 'unset';
              brandNameEl.style.color = colors.primary;
            }

            // Remove line-clamp from story sections for full text export
            const storyTexts = clonedCard.querySelectorAll('.line-clamp-2, .line-clamp-3');
            storyTexts.forEach((el) => {
              (el as HTMLElement).style.webkitLineClamp = 'unset';
              (el as HTMLElement).style.display = 'block';
              (el as HTMLElement).style.overflow = 'visible';
            });
          }
        }
      });

      const link = document.createElement('a');
      link.download = `${strategy.brandName || 'brand'}-dna.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast({
        title: "Brand DNA exported!",
        description: "Your brand identity card has been downloaded.",
      });
    } catch {
      toast({
        title: "Export failed",
        description: "Could not generate image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyText = () => {
    const text = `
Brand DNA: ${strategy.brandName}

Archetype: ${primaryArchetype?.name || 'Not set'}${secondaryArchetype ? ` + ${secondaryArchetype.name}` : ''}

Associations: ${strategy.associations.map(a => a.word).join(', ') || 'Not set'}

Core Emotions: ${selectedEmotions.map(e => e?.name).join(', ') || 'Not set'}

Voice: ${primaryVoice?.name || 'Not set'}

Origin Story:
- Catalyst: ${strategy.story.catalyst || 'Not set'}
- Core Truth: ${strategy.story.coreTruth || 'Not set'}
- Proof: ${strategy.story.proof || 'Not set'}

Emotional Promise: ${strategy.emotionalPromise || 'Not set'}
    `.trim();

    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard!",
      description: "Your brand DNA summary is ready to paste.",
    });
  };

  // Dynamic background gradient based on theme and brand colors (same pattern as RoadmapVisual)
  const bgGradient = isDarkMode
    ? `linear-gradient(135deg, ${colors.cardBg} 0%, ${adjustColor(colors.primary, -120)}30 50%, ${adjustColor(colors.secondary, -100)}25 100%)`
    : `linear-gradient(135deg, ${colors.cardBg} 0%, ${adjustColor(colors.primary, 80)}40 50%, ${adjustColor(colors.secondary, 60)}30 100%)`;

  return (
    <div className="space-y-6">
      {/* DNA Card */}
      <div
        ref={cardRef}
        data-brand-dna-card
        className="relative overflow-hidden rounded-2xl p-4 sm:p-6 md:p-8"
        style={{
          background: bgGradient,
          color: colors.textPrimary,
        }}
      >
        {/* Decorative blur elements using brand colors */}
        <div
          className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 rounded-full blur-3xl"
          style={{
            backgroundColor: colors.primary,
            opacity: isDarkMode ? 0.15 : 0.2
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-36 sm:w-48 h-36 sm:h-48 rounded-full blur-3xl"
          style={{
            backgroundColor: colors.accent,
            opacity: isDarkMode ? 0.15 : 0.2
          }}
        />

        {/* Header with optional logo */}
        <div className="relative flex items-center gap-3 mb-4 sm:mb-6">
          {companyLogo ? (
            <img
              src={companyLogo}
              alt="Company Logo"
              className="h-8 w-8 sm:h-10 sm:w-10 object-contain rounded"
            />
          ) : (
            <Sparkles
              className="h-5 w-5 sm:h-6 sm:w-6"
              style={{ color: colors.primary }}
            />
          )}
          <span
            className="font-medium uppercase tracking-wider text-xs sm:text-sm"
            style={{ color: colors.primary }}
          >
            Brand DNA
          </span>
        </div>

        {/* Brand Name */}
        <h2
          className="relative text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-clip-text text-transparent"
          style={{
            backgroundImage: `linear-gradient(90deg, ${colors.textPrimary} 0%, ${colors.primary} 50%, ${colors.accent} 100%)`,
          }}
        >
          {strategy.brandName || 'Your Brand'}
        </h2>

        <div className="relative grid sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column */}
          <div className="space-y-3 sm:space-y-4">
            {/* Archetype */}
            <div>
              <p className="text-[10px] sm:text-xs uppercase tracking-wider mb-1" style={{ color: colors.textMuted }}>Archetype</p>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {primaryArchetype && (
                  <Badge
                    className="text-xs sm:text-base px-2 sm:px-3 py-0.5 sm:py-1 text-white"
                    style={{ backgroundColor: colors.primary }}
                  >
                    {primaryArchetype.emoji} {primaryArchetype.name}
                  </Badge>
                )}
                {secondaryArchetype && (
                  <Badge
                    variant="outline"
                    className="text-xs sm:text-base px-2 sm:px-3 py-0.5 sm:py-1"
                    style={{ borderColor: colors.secondary, color: colors.textPrimary }}
                  >
                    + {secondaryArchetype.emoji} {secondaryArchetype.name}
                  </Badge>
                )}
                {!primaryArchetype && <span style={{ color: colors.textMuted }} className="text-sm">Not selected</span>}
              </div>
            </div>

            {/* Associations */}
            <div>
              <p className="text-[10px] sm:text-xs uppercase tracking-wider mb-1" style={{ color: colors.textMuted }}>Known For</p>
              <div className="flex flex-wrap gap-1">
                {strategy.associations.length > 0 ? (
                  strategy.associations.map(a => (
                    <Badge
                      key={a.id}
                      variant="outline"
                      className="text-xs"
                      style={{ borderColor: `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.5)`, color: colors.textPrimary }}
                    >
                      {a.word}
                    </Badge>
                  ))
                ) : (
                  <span style={{ color: colors.textMuted }} className="text-sm">No associations set</span>
                )}
              </div>
            </div>

            {/* Voice */}
            <div>
              <p className="text-[10px] sm:text-xs uppercase tracking-wider mb-1" style={{ color: colors.textMuted }}>Voice</p>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm sm:text-base" style={{ color: colors.textPrimary }}>{primaryVoice?.name || 'Not selected'}</p>
                {secondaryVoice && (
                  <span style={{ color: colors.textSecondary }} className="text-xs">+ {secondaryVoice.name}</span>
                )}
              </div>
              {strategy.voice.topicFocus && (
                <p className="text-xs sm:text-sm mt-1" style={{ color: colors.textSecondary }}>Focus: {strategy.voice.topicFocus}</p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3 sm:space-y-4">
            {/* Emotions */}
            <div>
              <p className="text-[10px] sm:text-xs uppercase tracking-wider mb-1" style={{ color: colors.textMuted }}>Core Emotions</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {selectedEmotions.length > 0 ? (
                  selectedEmotions.map((emotion) => (
                    <span key={emotion?.id} className="text-xl sm:text-2xl" title={emotion?.name}>
                      {emotion?.emoji}
                    </span>
                  ))
                ) : (
                  <span style={{ color: colors.textMuted }} className="text-sm">No emotions selected</span>
                )}
              </div>
              {strategy.emotionalPromise && (
                <p className="text-xs sm:text-sm mt-2 italic" style={{ color: colors.textSecondary }}>
                  "They feel {strategy.emotionalPromise}"
                </p>
              )}
            </div>

            {/* Origin Story Section */}
            {hasStory && (
              <div className="space-y-2">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider mb-1" style={{ color: colors.textMuted }}>Origin Story</p>
                {strategy.story.catalyst && (
                  <div>
                    <p className="text-[10px] uppercase" style={{ color: colors.textMuted }}>The Catalyst</p>
                    <p className="text-xs" style={{ color: colors.textSecondary }}>{strategy.story.catalyst}</p>
                  </div>
                )}
                {strategy.story.coreTruth && (
                  <div>
                    <p className="text-[10px] uppercase" style={{ color: colors.textMuted }}>Core Truth</p>
                    <p className="text-xs" style={{ color: colors.textSecondary }}>{strategy.story.coreTruth}</p>
                  </div>
                )}
                {strategy.story.proof && (
                  <div>
                    <p className="text-[10px] uppercase" style={{ color: colors.textMuted }}>The Proof</p>
                    <p className="text-xs" style={{ color: colors.textSecondary }}>{strategy.story.proof}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <Separator className="my-4 sm:my-6" style={{ backgroundColor: `${colors.textMuted}30` }} />
        <div className="relative flex items-center justify-between text-[10px] sm:text-xs" style={{ color: colors.textMuted }}>
          <span>Generated by Mizzie</span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
        <Button onClick={handleExport} className="gap-2 text-sm" disabled={!isComplete}>
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export as Image</span>
          <span className="sm:hidden">Export</span>
        </Button>
        <Button onClick={handleCopyText} variant="outline" className="gap-2 text-sm">
          <Copy className="h-4 w-4" />
          <span className="hidden sm:inline">Copy as Text</span>
          <span className="sm:hidden">Copy</span>
        </Button>
      </div>

      {/* Completion Status */}
      {!isComplete && (
        <div className="text-center p-3 sm:p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200">
            <strong>Almost there!</strong> Complete all stations to unlock the full Brand DNA experience.
          </p>
        </div>
      )}
    </div>
  );
};

export default BrandDNAStation;

