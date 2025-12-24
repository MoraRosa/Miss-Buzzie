/**
 * Station 6: Action Plan
 * 
 * Personalized checklist of next steps based on availability results.
 */

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Check, ExternalLink, Globe, Users, Scale, Sparkles, ArrowRight, Copy
} from "lucide-react";
import type { StationProps } from "../types";
import type { ActionableStep } from "@/lib/validators/schemas";
import { getCompanyLogo, getBrandColors } from "@/lib/assetManager";

// Generate action steps based on search results
const generateActionSteps = (search: StationProps["currentSearch"]): ActionableStep[] => {
  const steps: ActionableStep[] = [];
  let priority = 1;
  const brandName = search.name;

  // Check if logo and colors already exist in Brand Manager
  const hasLogo = !!getCompanyLogo();
  const colors = getBrandColors();
  const hasCustomColors = colors.primary !== '#FFA500'; // Not default Mizzie orange

  // Domain actions
  const availableDomains = search.domains.filter(d => d.status === "available");
  const comDomain = search.domains.find(d => d.tld === ".com");

  if (comDomain?.status === "available") {
    steps.push({
      id: `domain-com`,
      category: "domain",
      priority: priority++,
      title: `Register ${brandName}.com`,
      description: "Your primary .com domain is available - secure it immediately!",
      actionUrl: comDomain.registrarLink,
      completed: false,
      urgent: true,
    });
  } else if (comDomain?.status === "taken") {
    steps.push({
      id: `domain-com-alt`,
      category: "domain",
      priority: priority++,
      title: "Consider alternative TLDs",
      description: ".com is taken. Consider .io, .co, or .app as alternatives.",
      completed: false,
      urgent: false,
    });
  }

  availableDomains.filter(d => d.tld !== ".com").slice(0, 2).forEach(d => {
    steps.push({
      id: `domain-${d.tld}`,
      category: "domain",
      priority: priority++,
      title: `Register ${brandName}${d.tld}`,
      description: `Secure this domain to protect your brand.`,
      actionUrl: d.registrarLink,
      completed: false,
      urgent: false,
    });
  });

  // Social media actions
  const availableSocial = search.socialMedia.filter(s => s.status === "available");
  const majorPlatforms = ["twitter", "instagram", "tiktok"];

  availableSocial.filter(s => majorPlatforms.includes(s.platform)).forEach(s => {
    steps.push({
      id: `social-${s.platform}`,
      category: "social",
      priority: priority++,
      title: `Claim @${brandName} on ${s.platform}`,
      description: "Major platform - claim this handle before someone else does.",
      actionUrl: s.profileUrl,
      completed: false,
      urgent: true,
    });
  });

  availableSocial.filter(s => !majorPlatforms.includes(s.platform)).slice(0, 2).forEach(s => {
    steps.push({
      id: `social-${s.platform}`,
      category: "social",
      priority: priority++,
      title: `Claim @${brandName} on ${s.platform}`,
      description: "Secure your brand presence on this platform.",
      actionUrl: s.profileUrl,
      completed: false,
      urgent: false,
    });
  });

  // Trademark actions
  const clearTrademarks = search.trademarks.filter(t => t.status === "clear");
  const conflictTrademarks = search.trademarks.filter(t => t.status === "conflict");

  if (conflictTrademarks.length > 0) {
    steps.push({
      id: `tm-conflict`,
      category: "trademark",
      priority: 1, // High priority
      title: "Consult a trademark attorney",
      description: `Potential conflicts found in ${conflictTrademarks.map(t => t.country).join(", ")}. Get legal advice before proceeding.`,
      completed: false,
      urgent: true,
    });
  }

  clearTrademarks.forEach(t => {
    steps.push({
      id: `tm-${t.countryCode}`,
      category: "trademark",
      priority: priority++,
      title: `File trademark in ${t.country}`,
      description: `No conflicts found. Consider registering your trademark with ${t.office}.`,
      actionUrl: t.searchUrl,
      completed: false,
      urgent: false,
    });
  });

  // General brand steps - auto-complete if already done in Brand Manager
  steps.push({
    id: "brand-logo",
    category: "brand",
    priority: priority++,
    title: "Design your brand logo",
    description: hasLogo
      ? "✓ Logo already uploaded in Brand Manager!"
      : "Create a professional logo that represents your brand identity.",
    completed: hasLogo,
    urgent: false,
  });

  steps.push({
    id: "brand-guidelines",
    category: "brand",
    priority: priority++,
    title: "Create brand guidelines",
    description: hasCustomColors
      ? "✓ Brand colors already set in Brand Manager!"
      : "Document your brand colors, fonts, and usage rules.",
    completed: hasCustomColors,
    urgent: false,
  });

  return steps.sort((a, b) => {
    if (a.urgent && !b.urgent) return -1;
    if (!a.urgent && b.urgent) return 1;
    return a.priority - b.priority;
  });
};

const ActionStation = ({ brandName, currentSearch, updateSearch, markStationComplete }: StationProps) => {
  // Generate/regenerate action steps when brand name changes or on initial load
  useEffect(() => {
    // Regenerate steps if: empty, or if any step has wrong brand name
    const needsRegenerate = currentSearch.actionableSteps.length === 0 ||
      currentSearch.actionableSteps.some(s =>
        s.title.includes('@s ') ||
        (brandName && s.title.includes('@') && !s.title.toLowerCase().includes(brandName.toLowerCase()))
      );

    if (needsRegenerate && brandName) {
      const steps = generateActionSteps(currentSearch);
      updateSearch({ actionableSteps: steps });
    }
  }, [brandName]);

  // Mark complete when any step is checked
  useEffect(() => {
    if (currentSearch.actionableSteps.some(s => s.completed)) {
      markStationComplete();
    }
  }, [currentSearch.actionableSteps, markStationComplete]);

  const toggleStep = (stepId: string) => {
    updateSearch({
      actionableSteps: currentSearch.actionableSteps.map(s =>
        s.id === stepId ? { ...s, completed: !s.completed } : s
      ),
    });
  };

  const completedCount = currentSearch.actionableSteps.filter(s => s.completed).length;
  const progress = currentSearch.actionableSteps.length > 0
    ? (completedCount / currentSearch.actionableSteps.length) * 100
    : 0;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "domain": return Globe;
      case "social": return Users;
      case "trademark": return Scale;
      default: return Sparkles;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "domain": return "bg-blue-500/10 text-blue-500";
      case "social": return "bg-purple-500/10 text-purple-500";
      case "trademark": return "bg-amber-500/10 text-amber-500";
      default: return "bg-primary/10 text-primary";
    }
  };

  const copyToClipboard = () => {
    const text = currentSearch.actionableSteps
      .map((s, i) => `${s.completed ? "✓" : "○"} ${i + 1}. ${s.title}`)
      .join("\n");
    navigator.clipboard.writeText(`Action Plan for "${brandName}"\n\n${text}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Your Action Plan</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span>{completedCount}/{currentSearch.actionableSteps.length} completed</span>
            <Progress value={progress} className="h-2 w-32" />
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1" onClick={copyToClipboard}>
            <Copy className="h-4 w-4" />
            Copy
          </Button>
        </div>
      </div>

      {/* Urgent Actions */}
      {currentSearch.actionableSteps.filter(s => s.urgent && !s.completed).length > 0 && (
        <Card className="p-4 bg-red-500/5 border-red-500/20">
          <h4 className="font-medium text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
            ⚡ Urgent Actions
          </h4>
          <div className="space-y-2">
            {currentSearch.actionableSteps.filter(s => s.urgent && !s.completed).map(step => {
              const Icon = getCategoryIcon(step.category);
              return (
                <div
                  key={step.id}
                  className="flex items-start gap-3 p-3 bg-background rounded-lg border"
                >
                  <Checkbox
                    checked={step.completed}
                    onCheckedChange={() => toggleStep(step.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded ${getCategoryColor(step.category)}`}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <span className="font-medium">{step.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                  </div>
                  {step.actionUrl && (
                    <Button
                      size="sm"
                      variant="default"
                      className="gap-1"
                      onClick={() => window.open(step.actionUrl, "_blank")}
                    >
                      Go <ArrowRight className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* All Actions */}
      <div className="space-y-2">
        {currentSearch.actionableSteps.filter(s => !s.urgent || s.completed).map(step => {
          const Icon = getCategoryIcon(step.category);
          return (
            <div
              key={step.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                step.completed ? "bg-muted/50 opacity-60" : "bg-background"
              }`}
            >
              <Checkbox
                checked={step.completed}
                onCheckedChange={() => toggleStep(step.id)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded ${getCategoryColor(step.category)}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <span className={`font-medium ${step.completed ? "line-through" : ""}`}>
                    {step.title}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
              </div>
              {step.actionUrl && !step.completed && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => window.open(step.actionUrl, "_blank")}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
              {step.completed && (
                <Check className="h-5 w-5 text-green-500" />
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Message */}
      {progress === 100 && (
        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h4 className="text-lg font-semibold text-green-600">All Done!</h4>
          <p className="text-sm text-muted-foreground">
            You've completed all action items for "{brandName}". Your brand is ready to launch!
          </p>
        </Card>
      )}
    </div>
  );
};

export default ActionStation;

