import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, X, HelpCircle, ExternalLink } from "lucide-react";
import type { SocialMediaCheck } from "@/lib/validators/schemas";

interface SocialMediaCheckerProps {
  brandName: string;
  checks: SocialMediaCheck[];
  defaultPlatforms: string[];
  onUpdate: (checks: SocialMediaCheck[]) => void;
}

// Platform configurations
const PLATFORM_CONFIG: { 
  id: string; 
  name: string; 
  icon: string;
  color: string;
  searchUrl: (handle: string) => string;
  profileUrl: (handle: string) => string;
}[] = [
  { 
    id: "twitter", 
    name: "X (Twitter)", 
    icon: "𝕏",
    color: "bg-black text-white",
    searchUrl: (h) => `https://twitter.com/${h}`,
    profileUrl: (h) => `https://twitter.com/${h}`,
  },
  { 
    id: "instagram", 
    name: "Instagram", 
    icon: "📸",
    color: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    searchUrl: (h) => `https://instagram.com/${h}`,
    profileUrl: (h) => `https://instagram.com/${h}`,
  },
  { 
    id: "tiktok", 
    name: "TikTok", 
    icon: "🎵",
    color: "bg-black text-white",
    searchUrl: (h) => `https://tiktok.com/@${h}`,
    profileUrl: (h) => `https://tiktok.com/@${h}`,
  },
  { 
    id: "youtube", 
    name: "YouTube", 
    icon: "▶️",
    color: "bg-red-600 text-white",
    searchUrl: (h) => `https://youtube.com/@${h}`,
    profileUrl: (h) => `https://youtube.com/@${h}`,
  },
  { 
    id: "facebook", 
    name: "Facebook", 
    icon: "📘",
    color: "bg-blue-600 text-white",
    searchUrl: (h) => `https://facebook.com/${h}`,
    profileUrl: (h) => `https://facebook.com/${h}`,
  },
  { 
    id: "linkedin", 
    name: "LinkedIn", 
    icon: "💼",
    color: "bg-blue-700 text-white",
    searchUrl: (h) => `https://linkedin.com/company/${h}`,
    profileUrl: (h) => `https://linkedin.com/company/${h}`,
  },
  { 
    id: "pinterest", 
    name: "Pinterest", 
    icon: "📌",
    color: "bg-red-500 text-white",
    searchUrl: (h) => `https://pinterest.com/${h}`,
    profileUrl: (h) => `https://pinterest.com/${h}`,
  },
  { 
    id: "threads", 
    name: "Threads", 
    icon: "🧵",
    color: "bg-black text-white",
    searchUrl: (h) => `https://threads.net/@${h}`,
    profileUrl: (h) => `https://threads.net/@${h}`,
  },
  { 
    id: "github", 
    name: "GitHub", 
    icon: "🐙",
    color: "bg-gray-900 text-white",
    searchUrl: (h) => `https://github.com/${h}`,
    profileUrl: (h) => `https://github.com/${h}`,
  },
];

const StatusBadge = ({ status }: { status: SocialMediaCheck["status"] }) => {
  switch (status) {
    case "available":
      return <Badge className="bg-green-500 hover:bg-green-600"><Check className="h-3 w-3 mr-1" />Available</Badge>;
    case "taken":
      return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Taken</Badge>;
    default:
      return <Badge variant="outline"><HelpCircle className="h-3 w-3 mr-1" />Verify</Badge>;
  }
};

const SocialMediaChecker = ({ brandName, checks, defaultPlatforms, onUpdate }: SocialMediaCheckerProps) => {
  // Initialize checks on mount
  useEffect(() => {
    if (checks.length === 0 && brandName) {
      const initialChecks: SocialMediaCheck[] = PLATFORM_CONFIG
        .filter(p => defaultPlatforms.includes(p.id))
        .map(p => ({
          platform: p.id,
          handle: brandName,
          status: "unknown" as const,
          searchUrl: p.searchUrl(brandName),
          profileUrl: p.profileUrl(brandName),
        }));
      onUpdate(initialChecks);
    }
  }, [brandName, checks.length, defaultPlatforms, onUpdate]);

  const markStatus = (platform: string, status: "available" | "taken") => {
    onUpdate(checks.map(c => 
      c.platform === platform 
        ? { ...c, status, checkedAt: new Date().toISOString() }
        : c
    ));
  };

  const addPlatform = (platformId: string) => {
    const platform = PLATFORM_CONFIG.find(p => p.id === platformId);
    if (!platform || checks.some(c => c.platform === platformId)) return;
    
    onUpdate([...checks, {
      platform: platformId,
      handle: brandName,
      status: "unknown" as const,
      searchUrl: platform.searchUrl(brandName),
      profileUrl: platform.profileUrl(brandName),
    }]);
  };

  const availablePlatforms = PLATFORM_CONFIG.filter(p => !checks.some(c => c.platform === p.id));
  const availableCount = checks.filter(c => c.status === "available").length;
  const takenCount = checks.filter(c => c.status === "taken").length;

  return (
    <AccordionItem value="social" className="border rounded-lg">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-3">
          <span className="text-xl">📱</span>
          <div className="text-left">
            <div className="font-semibold">Social Media Handles</div>
            <div className="text-sm text-muted-foreground font-normal">
              {checks.length} platforms • {availableCount} available • {takenCount} taken
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {checks.map((check) => {
            const platform = PLATFORM_CONFIG.find(p => p.id === check.platform);
            if (!platform) return null;

            return (
              <Card key={check.platform} className="overflow-hidden">
                <CardHeader className={`py-2 px-3 ${platform.color}`}>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <span>{platform.icon}</span>
                    {platform.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-mono text-sm">@{check.handle}</div>
                      <StatusBadge status={check.status} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button size="sm" variant="outline" asChild className="h-7 text-xs">
                        <a href={check.searchUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Check
                        </a>
                      </Button>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markStatus(check.platform, "available")}
                          className="h-6 w-6 p-0 text-green-600"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markStatus(check.platform, "taken")}
                          className="h-6 w-6 p-0 text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add more platforms */}
        {availablePlatforms.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Add more platforms:</p>
            <div className="flex flex-wrap gap-2">
              {availablePlatforms.map(platform => (
                <Button
                  key={platform.id}
                  variant="secondary"
                  size="sm"
                  onClick={() => addPlatform(platform.id)}
                  className="text-xs"
                >
                  {platform.icon} {platform.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

export default SocialMediaChecker;

