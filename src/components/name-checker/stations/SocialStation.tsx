/**
 * Station 3: Social Media Handle Availability
 * 
 * Visual cards for each platform with availability checking.
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Users, Check, X, Loader2, ExternalLink, RefreshCw, 
  Plus, AlertCircle 
} from "lucide-react";
import type { StationProps } from "../types";
import type { SocialMediaCheck } from "@/lib/validators/schemas";

// Platform configurations with colors and icons
const PLATFORM_CONFIG = [
  { id: "twitter", name: "X (Twitter)", icon: "𝕏", color: "bg-black text-white", searchUrl: (h: string) => `https://twitter.com/${h}` },
  { id: "instagram", name: "Instagram", icon: "📸", color: "bg-gradient-to-br from-purple-500 to-pink-500 text-white", searchUrl: (h: string) => `https://instagram.com/${h}` },
  { id: "tiktok", name: "TikTok", icon: "🎵", color: "bg-black text-white", searchUrl: (h: string) => `https://tiktok.com/@${h}` },
  { id: "youtube", name: "YouTube", icon: "▶️", color: "bg-red-600 text-white", searchUrl: (h: string) => `https://youtube.com/@${h}` },
  { id: "facebook", name: "Facebook", icon: "👤", color: "bg-blue-600 text-white", searchUrl: (h: string) => `https://facebook.com/${h}` },
  { id: "linkedin", name: "LinkedIn", icon: "💼", color: "bg-blue-700 text-white", searchUrl: (h: string) => `https://linkedin.com/company/${h}` },
  { id: "github", name: "GitHub", icon: "🐙", color: "bg-gray-900 text-white dark:bg-gray-700", searchUrl: (h: string) => `https://github.com/${h}` },
  { id: "threads", name: "Threads", icon: "@", color: "bg-black text-white", searchUrl: (h: string) => `https://threads.net/@${h}` },
  { id: "pinterest", name: "Pinterest", icon: "📌", color: "bg-red-500 text-white", searchUrl: (h: string) => `https://pinterest.com/${h}` },
  { id: "snapchat", name: "Snapchat", icon: "👻", color: "bg-yellow-400 text-black", searchUrl: (h: string) => `https://snapchat.com/add/${h}` },
];

const SocialStation = ({ brandName, currentSearch, data, updateSearch, markStationComplete }: StationProps) => {
  const [checkingPlatform, setCheckingPlatform] = useState<string | null>(null);

  // Initialize social checks on mount
  useEffect(() => {
    if (currentSearch.socialMedia.length === 0 && brandName) {
      const initialChecks: SocialMediaCheck[] = PLATFORM_CONFIG
        .filter(p => data.settings.defaultPlatforms.includes(p.id))
        .map(p => ({
          platform: p.id,
          handle: brandName,
          status: "unknown" as const,
          searchUrl: p.searchUrl(brandName),
          profileUrl: p.searchUrl(brandName),
        }));
      updateSearch({ socialMedia: initialChecks });
    }
  }, [brandName, currentSearch.socialMedia.length, data.settings.defaultPlatforms, updateSearch]);

  // Sync handles when brandName changes
  useEffect(() => {
    if (brandName && currentSearch.socialMedia.length > 0) {
      const needsUpdate = currentSearch.socialMedia.some(s => s.handle !== brandName);
      if (needsUpdate) {
        updateSearch({
          socialMedia: currentSearch.socialMedia.map(s => ({
            ...s,
            handle: brandName,
            searchUrl: PLATFORM_CONFIG.find(p => p.id === s.platform)?.searchUrl(brandName) || s.searchUrl,
            profileUrl: PLATFORM_CONFIG.find(p => p.id === s.platform)?.searchUrl(brandName) || s.profileUrl,
          })),
        });
      }
    }
  }, [brandName]);

  // Auto-complete when some platforms are checked
  useEffect(() => {
    const checked = currentSearch.socialMedia.filter(s => s.status !== "unknown");
    if (checked.length > 0) {
      markStationComplete();
    }
  }, [currentSearch.socialMedia, markStationComplete]);

  const checkPlatform = async (platform: string) => {
    const config = PLATFORM_CONFIG.find(p => p.id === platform);
    if (!config) return;

    setCheckingPlatform(platform);
    
    // Open the profile URL for manual verification
    window.open(config.searchUrl(brandName), "_blank");
    
    // Mark as checking momentarily then back to unknown
    setTimeout(() => {
      setCheckingPlatform(null);
    }, 1000);
  };

  const markStatus = (platform: string, status: "available" | "taken") => {
    updateSearch({
      socialMedia: currentSearch.socialMedia.map(s =>
        s.platform === platform
          ? { ...s, status, checkedAt: new Date().toISOString() }
          : s
      ),
    });
  };

  const addPlatform = (platformId: string) => {
    const platform = PLATFORM_CONFIG.find(p => p.id === platformId);
    if (!platform || currentSearch.socialMedia.some(s => s.platform === platformId)) return;
    
    updateSearch({
      socialMedia: [...currentSearch.socialMedia, {
        platform: platformId,
        handle: brandName,
        status: "unknown" as const,
        searchUrl: platform.searchUrl(brandName),
        profileUrl: platform.searchUrl(brandName),
      }],
    });
  };

  const checkedCount = currentSearch.socialMedia.filter(s => s.status !== "unknown").length;
  const availableCount = currentSearch.socialMedia.filter(s => s.status === "available").length;
  const progress = currentSearch.socialMedia.length > 0 
    ? (checkedCount / currentSearch.socialMedia.length) * 100 
    : 0;

  const availablePlatforms = PLATFORM_CONFIG.filter(
    p => !currentSearch.socialMedia.some(s => s.platform === p.id)
  );

  const getStatusBorder = (status: string) => {
    switch (status) {
      case "available": return "ring-2 ring-green-500";
      case "taken": return "ring-2 ring-red-500";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{checkedCount}/{currentSearch.socialMedia.length} checked</span>
            <span>•</span>
            <span className="text-green-600">{availableCount} available</span>
          </div>
          <Progress value={progress} className="h-2 mt-2 w-48" />
        </div>
        
        {availablePlatforms.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {availablePlatforms.slice(0, 4).map(p => (
              <Button
                key={p.id}
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs gap-1"
                onClick={() => addPlatform(p.id)}
              >
                <Plus className="h-3 w-3" />
                {p.icon}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Platform Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {currentSearch.socialMedia.map((s) => {
          const config = PLATFORM_CONFIG.find(p => p.id === s.platform);
          if (!config) return null;
          
          const isChecking = checkingPlatform === s.platform;
          
          return (
            <Card
              key={s.platform}
              className={`p-4 transition-all ${getStatusBorder(s.status)}`}
            >
              {/* Platform Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 ${config.color}`}>
                {config.icon}
              </div>

              {/* Platform Name & Handle */}
              <div className="mb-3">
                <h4 className="font-medium text-sm">{config.name}</h4>
                <p className="text-xs text-muted-foreground font-mono">@{brandName}</p>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center justify-between">
                {s.status === "available" ? (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Available
                  </span>
                ) : s.status === "taken" ? (
                  <span className="text-xs text-red-600 flex items-center gap-1">
                    <X className="h-3 w-3" /> Taken
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">Not checked</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-1 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-8 text-xs gap-1"
                  onClick={() => checkPlatform(s.platform)}
                  disabled={isChecking}
                >
                  {isChecking ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <ExternalLink className="h-3 w-3" />
                  )}
                  Check
                </Button>

                {s.status === "unknown" && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-green-600"
                      onClick={() => markStatus(s.platform, "available")}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-red-600"
                      onClick={() => markStatus(s.platform, "taken")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}

                {s.status !== "unknown" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2"
                    onClick={() => updateSearch({
                      socialMedia: currentSearch.socialMedia.map(sm =>
                        sm.platform === s.platform
                          ? { ...sm, status: "unknown" as const }
                          : sm
                      ),
                    })}
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Tip */}
      <p className="text-xs text-muted-foreground text-center">
        💡 Click "Check" to open each platform and verify if the handle is available.
      </p>
    </div>
  );
};

export default SocialStation;

