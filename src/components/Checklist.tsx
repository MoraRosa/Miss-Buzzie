import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Save, Trash2, Download, Loader2, FileImage, FileText, Sparkles, RefreshCw, ChevronDown, ChevronUp, Rocket, ClipboardList, Eye, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  ChecklistDataSchema,
  type ChecklistItem,
  type CanvasData,
  type SWOTData,
  type Milestone,
  type ForecastData,
  type Role,
  type Slide,
  type MarketResearchData,
  type PortersData
} from "@/lib/validators/schemas";

import BrandHeader from "./BrandHeader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getBrandStrategy,
  generateBrandActions,
  ARCHETYPES,
  VOICE_STYLES,
  type BrandActionItem,
  type BrandStrategy
} from "@/lib/brandStrategy";
import {
  generateAllTasks,
  TASK_CATEGORIES,
  type BusinessTask,
  type TaskCategory,
} from "@/lib/businessTasks";
import TaskSummaryPreview from "./TaskSummaryPreview";
import { getBrandColors, type BrandColors } from "@/lib/assetManager";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Category labels for brand actions
const CATEGORY_LABELS: Record<BrandActionItem['category'], { label: string; emoji: string }> = {
  'voice-check': { label: 'Voice Check', emoji: '🎤' },
  'weekly-action': { label: 'Weekly Brand Actions', emoji: '📅' },
  'content-prompt': { label: 'Content Ideas', emoji: '💡' },
  'brand-audit': { label: 'Brand Audit', emoji: '🔍' },
  'pitch-prep': { label: 'Pitch Prep', emoji: '🎯' },
};

// Styled progress bar with brand colors
const BrandProgress = ({ value, color, className }: { value: number; color: string; className?: string }) => (
  <div className={`relative h-2 w-full overflow-hidden rounded-full bg-muted ${className || ''}`}>
    <div
      className="h-full transition-all duration-300"
      style={{ width: `${value}%`, backgroundColor: color }}
    />
  </div>
);

const Checklist = () => {
  const { toast } = useToast();

  // View mode and export state
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [isExporting, setIsExporting] = useState(false);
  const [brandColors, setBrandColors] = useState<BrandColors>(getBrandColors());

  // Listen for brand color changes
  useEffect(() => {
    setBrandColors(getBrandColors());
    const handleColorsChange = (e: CustomEvent<BrandColors>) => {
      setBrandColors(e.detail);
    };
    window.addEventListener('brandColorsChanged', handleColorsChange as EventListener);
    return () => window.removeEventListener('brandColorsChanged', handleColorsChange as EventListener);
  }, []);

  // Brand strategy state
  const [brandStrategy, setBrandStrategy] = useState<BrandStrategy | null>(null);
  const [completedBrandActions, setCompletedBrandActions] = useLocalStorage<string[]>(
    "completedBrandActions",
    []
  );

  // Business tasks state
  const [completedBusinessTasks, setCompletedBusinessTasks] = useLocalStorage<string[]>(
    "completedBusinessTasks",
    []
  );
  const [businessTasksExpanded, setBusinessTasksExpanded] = useState<Record<string, boolean>>({
    'legal-admin': true,
    'financial-setup': false,
    'pre-launch': false,
    'launch': false,
    'post-launch': false,
    'canvas-tasks': true,
    'roadmap-tasks': false,
    'forecast-tasks': false,
    'swot-tasks': false,
    'market-tasks': false,
    'org-tasks': false,
    'pitch-tasks': false,
    'porters-tasks': false,
    'brand-tasks': false,
  });

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'voice-check': true,
    'weekly-action': true,
    'content-prompt': false,
    'brand-audit': false,
    'pitch-prep': false,
  });

  // Load all data from localStorage
  const [tabData, setTabData] = useState<{
    canvas?: CanvasData;
    swot?: SWOTData;
    milestones?: Milestone[];
    forecast?: ForecastData;
    roles?: Role[];
    slides?: Slide[];
    market?: MarketResearchData;
    porters?: PortersData;
  }>({});

  // Load tab data from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        const canvas = localStorage.getItem('canvas');
        const swot = localStorage.getItem('swot');
        const roadmap = localStorage.getItem('roadmap');
        const forecast = localStorage.getItem('forecast');
        const orgChart = localStorage.getItem('orgChart');
        const pitchDeck = localStorage.getItem('pitchDeck');
        const marketResearch = localStorage.getItem('marketResearch');
        const porters = localStorage.getItem('porters');

        setTabData({
          canvas: canvas ? JSON.parse(canvas) : undefined,
          swot: swot ? JSON.parse(swot) : undefined,
          milestones: roadmap ? JSON.parse(roadmap) : undefined,
          forecast: forecast ? JSON.parse(forecast) : undefined,
          roles: orgChart ? JSON.parse(orgChart) : undefined,
          slides: pitchDeck ? JSON.parse(pitchDeck) : undefined,
          market: marketResearch ? JSON.parse(marketResearch) : undefined,
          porters: porters ? JSON.parse(porters) : undefined,
        });
      } catch (error) {
        console.error('Error loading tab data:', error);
      }
    };

    loadData();
    // Re-load when storage changes
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  // Load brand strategy
  useEffect(() => {
    const strategy = getBrandStrategy();
    if (strategy.completedStations.length > 0) {
      setBrandStrategy(strategy);
    }

    const handleChange = (e: CustomEvent<BrandStrategy>) => {
      if (e.detail.completedStations.length > 0) {
        setBrandStrategy(e.detail);
      }
    };
    window.addEventListener('brandStrategyChanged', handleChange as EventListener);
    return () => window.removeEventListener('brandStrategyChanged', handleChange as EventListener);
  }, []);

  // Generate all business tasks
  const businessTasks = useMemo(() => {
    return generateAllTasks({
      ...tabData,
      brandStrategy: brandStrategy || undefined,
    });
  }, [tabData, brandStrategy]);

  // Group business tasks by category
  const businessTasksByCategory = useMemo(() => {
    const grouped: Record<TaskCategory, BusinessTask[]> = {} as Record<TaskCategory, BusinessTask[]>;
    TASK_CATEGORIES.forEach(cat => {
      grouped[cat.id] = [];
    });
    businessTasks.forEach(task => {
      if (grouped[task.category]) {
        grouped[task.category].push(task);
      }
    });
    return grouped;
  }, [businessTasks]);

  const toggleBusinessTask = (id: string) => {
    setCompletedBusinessTasks(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const resetBusinessCategory = (category: TaskCategory) => {
    const idsToRemove = businessTasksByCategory[category].map(t => t.id);
    setCompletedBusinessTasks(prev => prev.filter(id => !idsToRemove.includes(id)));
    const catInfo = TASK_CATEGORIES.find(c => c.id === category);
    toast({
      title: "Reset complete",
      description: `${catInfo?.label || category} checklist has been reset.`,
    });
  };

  const toggleBusinessCategory = (category: string) => {
    setBusinessTasksExpanded(prev => ({ ...prev, [category]: !prev[category] }));
  };

  // Generate brand actions based on strategy
  const brandActions = useMemo(() => {
    if (!brandStrategy) return [];
    return generateBrandActions(brandStrategy);
  }, [brandStrategy]);

  // Group brand actions by category
  const brandActionsByCategory = useMemo(() => {
    const grouped: Record<BrandActionItem['category'], BrandActionItem[]> = {
      'voice-check': [],
      'weekly-action': [],
      'content-prompt': [],
      'brand-audit': [],
      'pitch-prep': [],
    };
    brandActions.forEach(action => {
      grouped[action.category].push(action);
    });
    return grouped;
  }, [brandActions]);

  const toggleBrandAction = (id: string) => {
    setCompletedBrandActions(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const resetBrandActions = (category: BrandActionItem['category']) => {
    const idsToRemove = brandActionsByCategory[category].map(a => a.id);
    setCompletedBrandActions(prev => prev.filter(id => !idsToRemove.includes(id)));
    toast({
      title: "Reset complete",
      description: `${CATEGORY_LABELS[category].label} checklist has been reset.`,
    });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  // Use custom hooks for localStorage
  const [items, setItems, { save }] = useLocalStorage<ChecklistItem[]>(
    "checklist",
    [],
    { schema: ChecklistDataSchema }
  );

  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    category: "General",
  });

  const handleSave = () => {
    save();
    toast({
      title: "Saved successfully",
      description: "Your checklist has been saved",
    });
  };

  // Custom export functions for the preview
  const handleExportPNG = async () => {
    if (viewMode !== "preview") {
      toast({
        title: "Switch to Preview mode",
        description: "Please switch to Preview mode before exporting",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const element = document.querySelector('[data-task-summary-preview]') as HTMLElement;
      if (!element) throw new Error("Preview not found");

      const isDarkMode = document.documentElement.classList.contains('dark');
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: isDarkMode ? "#0a0a0a" : "#ffffff",
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `${brandStrategy?.brandName || 'business'}-task-checklist.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast({
        title: "✅ Export successful!",
        description: "Task checklist exported as PNG",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (viewMode !== "preview") {
      toast({
        title: "Switch to Preview mode",
        description: "Please switch to Preview mode before exporting",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const element = document.querySelector('[data-task-summary-preview]') as HTMLElement;
      if (!element) throw new Error("Preview not found");

      const isDarkMode = document.documentElement.classList.contains('dark');
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: isDarkMode ? "#0a0a0a" : "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${brandStrategy?.brandName || 'business'}-task-checklist.pdf`);

      toast({
        title: "✅ Export successful!",
        description: "Task checklist exported as PDF",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const addItem = () => {
    if (!newItem.title) {
      toast({
        title: "Title required",
        description: "Please enter a task title",
        variant: "destructive",
      });
      return;
    }

    const item: ChecklistItem = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...newItem,
      completed: false,
    };

    setItems([...items, item]);
    setNewItem({ title: "", description: "", category: "General" });
    toast({
      title: "Task added",
      description: "New task has been added to your checklist",
    });
  };

  const toggleItem = (id: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)));
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const getItemsByCategory = () => {
    const categories: { [key: string]: ChecklistItem[] } = {};
    items.forEach((item) => {
      const cat = item.category || "General";
      if (!categories[cat]) {
        categories[cat] = [];
      }
      categories[cat].push(item);
    });
    return categories;
  };

  const calculateProgress = () => {
    if (items.length === 0) return 0;
    const completed = items.filter((item) => item.completed).length;
    return Math.round((completed / items.length) * 100);
  };

  const categories = getItemsByCategory();
  const progress = calculateProgress();

  return (
    <div className="space-y-4 md:space-y-6">
      <BrandHeader />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold" style={{ color: viewMode === 'preview' ? brandColors.primary : undefined }}>
            Business Checklist
          </h2>
          <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
            Track tasks and milestones for your business journey
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border overflow-hidden">
            <Button
              variant={viewMode === "edit" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("edit")}
              className="rounded-none"
            >
              <Pencil className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button
              variant={viewMode === "preview" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("preview")}
              className="rounded-none"
              style={viewMode === "preview" ? { backgroundColor: brandColors.primary } : undefined}
            >
              <Eye className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Preview</span>
            </Button>
          </div>

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
              <DropdownMenuItem onClick={handleExportPNG} disabled={isExporting}>
                <FileImage className="h-4 w-4 mr-2" />
                Export as PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF} disabled={isExporting}>
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

      {/* Preview Mode */}
      {viewMode === "preview" ? (
        <div className="overflow-auto border rounded-lg">
          <TaskSummaryPreview
            tasks={businessTasks}
            completedTasks={completedBusinessTasks}
            brandName={brandStrategy?.brandName}
          />
        </div>
      ) : (
        /* Edit Mode */
        <div id="checklist-content">
          <Tabs defaultValue="business-tasks" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="business-tasks" className="gap-2">
                <Rocket className="h-4 w-4" />
                <span className="hidden sm:inline">Launch Checklist</span>
                <span className="sm:hidden">Launch</span>
              </TabsTrigger>
              <TabsTrigger value="brand-actions" className="gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Brand Actions</span>
                <span className="sm:hidden">Brand</span>
              </TabsTrigger>
              <TabsTrigger value="custom-tasks" className="gap-2">
                <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">My Tasks</span>
              <span className="sm:hidden">My</span>
            </TabsTrigger>
          </TabsList>

          {/* Business Tasks Tab - The Launch Checklist */}
          <TabsContent value="business-tasks" className="space-y-4">
            {/* Overall Business Progress */}
            <Card
              className="border-2"
              style={{
                background: `linear-gradient(to right, ${brandColors.primary}08, ${brandColors.secondary}08)`,
                borderColor: `${brandColors.primary}30`,
              }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Rocket className="h-5 w-5" style={{ color: brandColors.primary }} />
                  Startup Launch Progress
                </CardTitle>
                <CardDescription>
                  {completedBusinessTasks.length} of {businessTasks.length} tasks completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BrandProgress
                  value={(completedBusinessTasks.length / Math.max(businessTasks.length, 1)) * 100}
                  color={brandColors.primary}
                />
              </CardContent>
            </Card>

            {/* Universal Startup Checklists */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">
                📋 Universal Startup Checklists
              </h3>
              {TASK_CATEGORIES.filter(cat =>
                ['legal-admin', 'financial-setup', 'pre-launch', 'launch', 'post-launch'].includes(cat.id)
              ).map(category => {
                const tasks = businessTasksByCategory[category.id] || [];
                if (tasks.length === 0) return null;
                const completedCount = tasks.filter(t => completedBusinessTasks.includes(t.id)).length;
                const isExpanded = businessTasksExpanded[category.id];

                return (
                  <Card key={category.id}>
                    <CardHeader
                      className="cursor-pointer hover:bg-muted/50 transition-colors py-3"
                      onClick={() => toggleBusinessCategory(category.id)}
                    >
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <span>{category.emoji}</span>
                          {category.label}
                          <span className="text-xs font-normal text-muted-foreground">
                            ({category.phase})
                          </span>
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {completedCount}/{tasks.length}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <BrandProgress value={(completedCount / tasks.length) * 100} color={brandColors.primary} className="mt-2" />
                    </CardHeader>
                    {isExpanded && (
                      <CardContent className="space-y-2 pt-0">
                        {tasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                          >
                            <Checkbox
                              checked={completedBusinessTasks.includes(task.id)}
                              onCheckedChange={() => toggleBusinessTask(task.id)}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${
                                completedBusinessTasks.includes(task.id) ? 'line-through text-muted-foreground' : ''
                              }`}>
                                {task.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {task.description}
                              </p>
                              {task.estimatedTime && (
                                <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-muted rounded-full">
                                  ⏱️ {task.estimatedTime}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                        {completedCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full mt-2 text-muted-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              resetBusinessCategory(category.id);
                            }}
                          >
                            <RefreshCw className="h-3 w-3 mr-2" />
                            Reset {category.label}
                          </Button>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>

            {/* Tab-Generated Tasks */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">
                🎯 Based on Your Business Plan
              </h3>
              {TASK_CATEGORIES.filter(cat =>
                !['legal-admin', 'financial-setup', 'pre-launch', 'launch', 'post-launch'].includes(cat.id)
              ).map(category => {
                const tasks = businessTasksByCategory[category.id] || [];
                if (tasks.length === 0) return null;
                const completedCount = tasks.filter(t => completedBusinessTasks.includes(t.id)).length;
                const isExpanded = businessTasksExpanded[category.id];

                return (
                  <Card key={category.id}>
                    <CardHeader
                      className="cursor-pointer hover:bg-muted/50 transition-colors py-3"
                      onClick={() => toggleBusinessCategory(category.id)}
                    >
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <span>{category.emoji}</span>
                          {category.label}
                          {tasks[0]?.sourceTab && (
                            <span className="text-xs font-normal text-muted-foreground">
                              (from {tasks[0].sourceTab})
                            </span>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {completedCount}/{tasks.length}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <BrandProgress value={(completedCount / tasks.length) * 100} color={brandColors.primary} className="mt-2" />
                    </CardHeader>
                    {isExpanded && (
                      <CardContent className="space-y-2 pt-0">
                        {tasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                          >
                            <Checkbox
                              checked={completedBusinessTasks.includes(task.id)}
                              onCheckedChange={() => toggleBusinessTask(task.id)}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${
                                completedBusinessTasks.includes(task.id) ? 'line-through text-muted-foreground' : ''
                              }`}>
                                {task.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {task.description}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {task.priority === 'critical' && (
                                  <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                                    🔥 Critical
                                  </span>
                                )}
                                {task.estimatedTime && (
                                  <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
                                    ⏱️ {task.estimatedTime}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {completedCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full mt-2 text-muted-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              resetBusinessCategory(category.id);
                            }}
                          >
                            <RefreshCw className="h-3 w-3 mr-2" />
                            Reset {category.label}
                          </Button>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}

              {/* Show prompt if no tab data */}
              {Object.values(tabData).every(v => !v) && (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground text-sm">
                      Complete other tabs (Canvas, SWOT, Roadmap, etc.) to see personalized tasks generated from your business plan.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Brand Actions Tab */}
          <TabsContent value="brand-actions" className="space-y-4">
            {brandStrategy ? (
              <>
                {/* Brand DNA Summary */}
                <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Your Brand: {brandStrategy.brandName || 'Unnamed'}
                    </CardTitle>
                    <CardDescription>
                      {brandStrategy.primaryArchetype && (
                        <span>
                          {ARCHETYPES.find(a => a.id === brandStrategy.primaryArchetype)?.emoji}{' '}
                          {ARCHETYPES.find(a => a.id === brandStrategy.primaryArchetype)?.name}
                          {brandStrategy.secondaryArchetype && (
                            <> + {ARCHETYPES.find(a => a.id === brandStrategy.secondaryArchetype)?.name}</>
                          )}
                        </span>
                      )}
                      {brandStrategy.voice.primaryStyle && (
                        <span className="ml-3">
                          • {VOICE_STYLES.find(v => v.id === brandStrategy.voice.primaryStyle)?.name}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Brand Action Categories */}
                {(Object.entries(brandActionsByCategory) as [BrandActionItem['category'], BrandActionItem[]][]).map(([category, actions]) => {
                  if (actions.length === 0) return null;
                  const { label, emoji } = CATEGORY_LABELS[category];
                  const completedCount = actions.filter(a => completedBrandActions.includes(a.id)).length;
                  const isExpanded = expandedCategories[category];

                  return (
                    <Card key={category}>
                      <CardHeader
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => toggleCategory(category)}
                      >
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <span>{emoji}</span>
                            {label}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {completedCount}/{actions.length}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                        <BrandProgress value={(completedCount / actions.length) * 100} color={brandColors.primary} className="mt-2" />
                      </CardHeader>
                      {isExpanded && (
                        <CardContent className="space-y-2 pt-0">
                          {actions.map((action) => (
                            <div
                              key={action.id}
                              className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                            >
                              <Checkbox
                                checked={completedBrandActions.includes(action.id)}
                                onCheckedChange={() => toggleBrandAction(action.id)}
                                className="mt-0.5"
                              />
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${
                                  completedBrandActions.includes(action.id) ? 'line-through text-muted-foreground' : ''
                                }`}>
                                  {action.title}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {action.description}
                                </p>
                              </div>
                            </div>
                          ))}
                          {completedCount > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full mt-2 text-muted-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                resetBrandActions(category);
                              }}
                            >
                              <RefreshCw className="h-3 w-3 mr-2" />
                              Reset {label}
                            </Button>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Complete Your Brand Journey</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    Visit the <strong>Brand</strong> tab to define your brand identity.
                    Once complete, personalized action items will appear here based on your archetype and voice.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Custom Tasks Tab */}
          <TabsContent value="custom-tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Overall Progress</CardTitle>
                <CardDescription>
                  {items.filter((i) => i.completed).length} of {items.length} tasks completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BrandProgress value={progress} color={brandColors.primary} className="h-3" />
                <p className="text-center mt-2 text-sm font-semibold" style={{ color: brandColors.primary }}>{progress}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add New Task</CardTitle>
                <CardDescription>Create a task for your checklist</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Task title"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  />
                  <Input
                    placeholder="Category (e.g., Product, Marketing)"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  />
                </div>
                <Input
                  placeholder="Description (optional)"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                />
                <Button onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(categories).map(([category, categoryItems]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle>{category}</CardTitle>
                    <CardDescription>
                      {categoryItems.filter((i) => i.completed).length} of {categoryItems.length} completed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                      >
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() => toggleItem(item.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <h4
                            className={`font-semibold ${
                              item.completed ? "line-through text-muted-foreground" : ""
                            }`}
                          >
                            {item.title}
                          </h4>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.title} task`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
              {Object.keys(categories).length === 0 && (
                <Card className="lg:col-span-2">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No tasks added yet. Create your first task above!
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
        </div>
      )}
    </div>
  );
};

export default Checklist;
