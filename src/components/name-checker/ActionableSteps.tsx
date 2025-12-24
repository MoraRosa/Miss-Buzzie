import { useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ListChecks, ExternalLink, AlertTriangle, Clock, Zap } from "lucide-react";
import type { DomainCheck, SocialMediaCheck, AppStoreCheck, TrademarkCheck, ActionableStep } from "@/lib/validators/schemas";

interface ActionableStepsProps {
  brandName: string;
  domains: DomainCheck[];
  socialMedia: SocialMediaCheck[];
  appStores: AppStoreCheck[];
  trademarks: TrademarkCheck[];
  steps: ActionableStep[];
  onUpdate: (steps: ActionableStep[]) => void;
}

// Priority badge component
const PriorityBadge = ({ priority }: { priority: ActionableStep["priority"] }) => {
  switch (priority) {
    case "high":
      return <Badge className="bg-red-500 hover:bg-red-600"><Zap className="h-3 w-3 mr-1" />High</Badge>;
    case "medium":
      return <Badge className="bg-amber-500 hover:bg-amber-600"><Clock className="h-3 w-3 mr-1" />Medium</Badge>;
    default:
      return <Badge variant="secondary">Low</Badge>;
  }
};

// Category icon
const CategoryIcon = ({ category }: { category: ActionableStep["category"] }) => {
  switch (category) {
    case "domain": return <span>🌐</span>;
    case "social": return <span>📱</span>;
    case "trademark": return <span>⚖️</span>;
    case "appstore": return <span>📲</span>;
    default: return <span>📋</span>;
  }
};

const ActionableSteps = ({ brandName, domains, socialMedia, appStores, trademarks, steps, onUpdate }: ActionableStepsProps) => {
  // Generate actionable steps based on current state
  const generatedSteps = useMemo(() => {
    const newSteps: ActionableStep[] = [];
    
    // Domain actions - prioritize .com
    const comDomain = domains.find(d => d.tld === ".com");
    if (comDomain?.status === "available") {
      newSteps.push({
        id: "domain-com",
        title: `Register ${brandName}.com immediately`,
        description: "The .com domain is available! This is the most valuable TLD - register it before someone else does.",
        priority: "high",
        category: "domain",
        completed: false,
        link: comDomain.registrarLink,
      });
    } else if (comDomain?.status === "taken") {
      // Suggest alternatives
      const availableAlt = domains.find(d => d.status === "available" && d.domain === brandName);
      if (availableAlt) {
        newSteps.push({
          id: "domain-alt",
          title: `Register ${brandName}${availableAlt.tld} as alternative`,
          description: `Since .com is taken, secure ${availableAlt.tld} as your primary domain.`,
          priority: "high",
          category: "domain",
          completed: false,
          link: availableAlt.registrarLink,
        });
      }
      
      // Suggest variation
      const availableVariation = domains.find(d => d.status === "available" && d.domain !== brandName && d.tld === ".com");
      if (availableVariation) {
        newSteps.push({
          id: "domain-variation",
          title: `Consider ${availableVariation.domain}.com`,
          description: `A variation of your brand name is available as a .com domain.`,
          priority: "medium",
          category: "domain",
          completed: false,
          link: availableVariation.registrarLink,
        });
      }
    }

    // Social media actions
    const availableSocial = socialMedia.filter(s => s.status === "available");
    const takenSocial = socialMedia.filter(s => s.status === "taken");
    
    if (availableSocial.length > 0) {
      newSteps.push({
        id: "social-register",
        title: `Register @${brandName} on ${availableSocial.length} available platforms`,
        description: `Secure your handle on: ${availableSocial.map(s => s.platform).join(", ")}`,
        priority: "high",
        category: "social",
        completed: false,
      });
    }
    
    if (takenSocial.length > 0) {
      newSteps.push({
        id: "social-alternative",
        title: "Consider handle variations for taken platforms",
        description: `@${brandName} is taken on: ${takenSocial.map(s => s.platform).join(", ")}. Consider using variations like @${brandName}official or @get${brandName}`,
        priority: "medium",
        category: "social",
        completed: false,
      });
    }

    // Trademark actions
    const conflictTM = trademarks.filter(t => t.status === "conflict");
    const uncheckedTM = trademarks.filter(t => t.status === "unknown");
    
    if (conflictTM.length > 0) {
      newSteps.push({
        id: "tm-conflict",
        title: "⚠️ Address trademark conflicts",
        description: `Potential conflicts found in: ${conflictTM.map(t => t.country).join(", ")}. Consult a trademark attorney before proceeding.`,
        priority: "high",
        category: "trademark",
        completed: false,
      });
    }
    
    if (uncheckedTM.length > 0) {
      newSteps.push({
        id: "tm-search",
        title: "Complete trademark searches",
        description: `Still need to verify: ${uncheckedTM.map(t => t.office).join(", ")}`,
        priority: "high",
        category: "trademark",
        completed: false,
      });
    }
    
    const clearTM = trademarks.filter(t => t.status === "clear");
    if (clearTM.length > 0 && conflictTM.length === 0) {
      newSteps.push({
        id: "tm-register",
        title: "File trademark application",
        description: `Preliminary searches are clear in ${clearTM.length} jurisdiction(s). Consider filing a trademark application.`,
        priority: "medium",
        category: "trademark",
        completed: false,
      });
    }

    // App store actions
    if (appStores.some(a => a.status === "available")) {
      newSteps.push({
        id: "app-reserve",
        title: "Reserve app name if planning mobile app",
        description: "If you plan to launch a mobile app, create developer accounts and reserve your app name early.",
        priority: "low",
        category: "appstore",
        completed: false,
      });
    }

    // General recommendations
    newSteps.push({
      id: "general-email",
      title: "Set up professional email",
      description: `Create ${brandName}@yourdomain.com using Google Workspace or Microsoft 365.`,
      priority: "medium",
      category: "other",
      completed: false,
    });

    return newSteps;
  }, [brandName, domains, socialMedia, appStores, trademarks]);

  // Sync generated steps with saved steps
  useEffect(() => {
    if (steps.length === 0 && generatedSteps.length > 0) {
      onUpdate(generatedSteps);
    }
  }, [generatedSteps, steps.length, onUpdate]);

  const toggleStep = (stepId: string) => {
    onUpdate(steps.map(s =>
      s.id === stepId ? { ...s, completed: !s.completed } : s
    ));
  };

  const regenerateSteps = () => {
    onUpdate(generatedSteps);
  };

  // Use saved steps if available, otherwise generated
  const displaySteps = steps.length > 0 ? steps : generatedSteps;
  const completedCount = displaySteps.filter(s => s.completed).length;

  // Group steps by priority
  const highPriority = displaySteps.filter(s => s.priority === "high" && !s.completed);
  const mediumPriority = displaySteps.filter(s => s.priority === "medium" && !s.completed);
  const lowPriority = displaySteps.filter(s => s.priority === "low" && !s.completed);
  const completedSteps = displaySteps.filter(s => s.completed);

  return (
    <AccordionItem value="steps" className="border rounded-lg">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-3">
          <ListChecks className="h-5 w-5 text-green-600" />
          <div className="text-left">
            <div className="font-semibold">Actionable Steps</div>
            <div className="text-sm text-muted-foreground font-normal">
              {completedCount}/{displaySteps.length} completed • {highPriority.length} high priority
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="flex justify-end mb-4">
          <Button variant="outline" size="sm" onClick={regenerateSteps}>
            Regenerate Steps
          </Button>
        </div>

        {/* High Priority */}
        {highPriority.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Do First (High Priority)
            </h4>
            <div className="space-y-2">
              {highPriority.map(step => (
                <Card key={step.id} className="border-red-200 dark:border-red-900">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={step.completed}
                        onCheckedChange={() => toggleStep(step.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CategoryIcon category={step.category} />
                          <span className="font-medium">{step.title}</span>
                          <PriorityBadge priority={step.priority} />
                        </div>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                        {step.link && (
                          <Button size="sm" variant="link" asChild className="p-0 h-auto mt-1">
                            <a href={step.link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Take action
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Medium Priority */}
        {mediumPriority.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-amber-600 dark:text-amber-400 mb-2">Do Soon (Medium Priority)</h4>
            <div className="space-y-2">
              {mediumPriority.map(step => (
                <Card key={step.id} className="border-amber-200 dark:border-amber-900">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Checkbox checked={step.completed} onCheckedChange={() => toggleStep(step.id)} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CategoryIcon category={step.category} />
                          <span className="font-medium">{step.title}</span>
                          <PriorityBadge priority={step.priority} />
                        </div>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                        {step.link && (
                          <Button size="sm" variant="link" asChild className="p-0 h-auto mt-1">
                            <a href={step.link} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3 mr-1" />Take action</a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Low Priority */}
        {lowPriority.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-600 dark:text-gray-400 mb-2">Nice to Have (Low Priority)</h4>
            <div className="space-y-2">
              {lowPriority.map(step => (
                <Card key={step.id}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Checkbox checked={step.completed} onCheckedChange={() => toggleStep(step.id)} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CategoryIcon category={step.category} />
                          <span className="font-medium">{step.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Completed */}
        {completedSteps.length > 0 && (
          <div>
            <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">✅ Completed</h4>
            <div className="space-y-2 opacity-60">
              {completedSteps.map(step => (
                <Card key={step.id}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Checkbox checked={step.completed} onCheckedChange={() => toggleStep(step.id)} className="mt-1" />
                      <span className="line-through">{step.title}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

export default ActionableSteps;

