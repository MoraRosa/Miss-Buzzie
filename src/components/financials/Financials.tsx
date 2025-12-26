/**
 * Financials Component
 *
 * Complete financial dashboard that:
 * - Allows editing projections, the ask, and use of funds (saves to "forecasting")
 * - Displays data from businessPlan (phases 7, 8, 11) as read-only
 * - Shows professional charts instead of whimsical visuals
 *
 * Replaces the old Forecasting.tsx component.
 */

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DollarSign,
  TrendingUp,
  Wallet,
  User,
  ExternalLink,
  PieChart as PieChartIcon,
  Target,
  FileText,
  Save,
  Download,
  Loader2,
  FileImage,
  Plus,
  Trash2,
} from "lucide-react";
import {
  ForecastData,
  ForecastDataSchema,
  BusinessPlanData,
  DEFAULT_BUSINESS_PLAN_DATA,
  YearlyProjection,
  UseOfFundsItem,
} from "@/lib/validators/schemas";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useExport } from "@/hooks/useExport";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import BrandHeader from "@/components/BrandHeader";

// Chart components
import {
  RevenueExpenseChart,
  UseOfFundsPieChart,
  ProfitMarginChart,
} from "./charts";

import { formatCurrency, formatCompact } from "./types";

// Helper to parse currency strings
const parseCurrency = (value: string | undefined): number => {
  if (!value) return 0;
  const cleaned = value.replace(/[$,\s]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

const defaultForecastData: ForecastData = {
  year1Revenue: "",
  year1Expenses: "",
  year2Revenue: "",
  year2Expenses: "",
  year3Revenue: "",
  year3Expenses: "",
  year5Revenue: "",
  year5Expenses: "",
  year10Revenue: "",
  year10Expenses: "",
  year15Revenue: "",
  year15Expenses: "",
  year25Revenue: "",
  year25Expenses: "",
  assumptions: "",
  fundingAsk: undefined,
  fundingStage: "",
  useOfFunds: [],
};

const FUNDING_STAGES = [
  "Pre-seed",
  "Seed",
  "Series A",
  "Series B",
  "Series C+",
  "Bridge",
  "Bootstrapped (no external funding)",
];

const USE_OF_FUNDS_CATEGORIES = [
  "Product Development",
  "Engineering/Tech",
  "Marketing & Sales",
  "Hiring/Team",
  "Operations",
  "Legal & Compliance",
  "Office/Equipment",
  "Working Capital",
  "R&D",
  "Other",
];

// Business Plan data (read-only display)
interface BusinessPlanFinancials {
  // Phase 7
  yearOneSalesTarget: string;
  howYouCalculatedSales: string;
  unitsOrCustomersNeeded: string;
  firstSaleTarget: string;
  // Phase 8
  cashRequired: string;
  fundingSources: {
    personalInvestment: string;
    bankLoans: string;
    lineOfCredit: string;
    familySupport: string;
    grants: string;
    investors: string;
    other: string;
  };
  // Phase 11
  assets: { id: string; category: string; description: string; value: string }[];
  liabilities: { id: string; category: string; description: string; value: string }[];
}

const Financials = () => {
  const { toast } = useToast();

  // Editable forecast data (saved to "forecasting" localStorage)
  const [data, setData, { save }] = useLocalStorage<ForecastData>(
    "forecasting",
    defaultForecastData,
    { schema: ForecastDataSchema }
  );

  // Read-only business plan data
  const [planData, setPlanData] = useState<BusinessPlanFinancials | null>(null);

  // Export functionality
  const { isExporting, exportPNG, exportPDF } = useExport({
    elementId: "financials-content",
    filename: "financials-dashboard",
  });

  // Load business plan data (read-only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("businessPlan");
      if (stored) {
        const plan: BusinessPlanData = JSON.parse(stored);
        setPlanData({
          yearOneSalesTarget: plan.yearOneSalesTarget || "",
          howYouCalculatedSales: plan.howYouCalculatedSales || "",
          unitsOrCustomersNeeded: plan.unitsOrCustomersNeeded || "",
          firstSaleTarget: plan.firstSaleTarget || "",
          cashRequired: plan.cashRequired || "",
          fundingSources: plan.fundingSources || {
            personalInvestment: "",
            bankLoans: "",
            lineOfCredit: "",
            familySupport: "",
            grants: "",
            investors: "",
            other: "",
          },
          assets: plan.assets || [],
          liabilities: plan.liabilities || [],
        });
      }
    } catch (error) {
      console.error("Failed to load business plan data:", error);
    }
  }, []);

  const handleSave = () => {
    save();
    toast({
      title: "Saved successfully",
      description: "Your financial data has been saved",
    });
  };

  const updateField = (field: keyof ForecastData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateProfit = (revenue: string, expenses: string) => {
    const rev = parseFloat(revenue) || 0;
    const exp = parseFloat(expenses) || 0;
    return rev - exp;
  };

  // Build projections for charts
  const projections: YearlyProjection[] = [
    { year: 1, revenue: parseCurrency(data.year1Revenue), expenses: parseCurrency(data.year1Expenses), notes: "" },
    { year: 2, revenue: parseCurrency(data.year2Revenue), expenses: parseCurrency(data.year2Expenses), notes: "" },
    { year: 3, revenue: parseCurrency(data.year3Revenue), expenses: parseCurrency(data.year3Expenses), notes: "" },
    { year: 5, revenue: parseCurrency(data.year5Revenue), expenses: parseCurrency(data.year5Expenses), notes: "" },
  ];

  if (data.year10Revenue || data.year10Expenses) {
    projections.push({ year: 10, revenue: parseCurrency(data.year10Revenue), expenses: parseCurrency(data.year10Expenses), notes: "" });
  }

  const hasProjections = projections.some(p => p.revenue > 0 || p.expenses > 0);
  const hasUseOfFunds = (data.useOfFunds || []).length > 0;

  // Calculate totals from business plan
  const totalFundingSources = planData ? Object.values(planData.fundingSources).reduce(
    (sum, val) => sum + parseCurrency(val),
    0
  ) : 0;
  const totalAssets = planData?.assets.reduce((sum, a) => sum + parseCurrency(a.value), 0) || 0;
  const totalLiabilities = planData?.liabilities.reduce((sum, l) => sum + parseCurrency(l.value), 0) || 0;
  const netWorth = totalAssets - totalLiabilities;
  const hasFundingSources = planData ? Object.values(planData.fundingSources).some(v => v && v !== "") : false;
  const hasPersonalFinances = planData ? (planData.assets.length > 0 || planData.liabilities.length > 0) : false;

  return (
    <div className="space-y-4 md:space-y-6">
      <BrandHeader />

      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Financials</h2>
          <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
            Your complete financial picture: projections, funding, and position
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
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
              <DropdownMenuItem onClick={exportPNG} disabled={isExporting}>
                <FileImage className="h-4 w-4 mr-2" />
                Export as PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportPDF} disabled={isExporting}>
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

      <div id="financials-content">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projections">Projections</TabsTrigger>
            <TabsTrigger value="funding">Funding</TabsTrigger>
            <TabsTrigger value="position">Position</TabsTrigger>
          </TabsList>

          {/* ========== OVERVIEW TAB ========== */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>The Ask</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {data.fundingAsk ? formatCompact(data.fundingAsk) : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">{data.fundingStage || "Stage not set"}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Year 1 Revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.year1Revenue ? `$${parseCurrency(data.year1Revenue).toLocaleString()}` : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">Projected</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Cash Required</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {planData?.cashRequired ? `$${parseCurrency(planData.cashRequired).toLocaleString()}` : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">From Business Plan</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Net Worth</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {hasPersonalFinances ? formatCompact(netWorth) : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">Personal position</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            {hasProjections && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RevenueExpenseChart projections={projections} />
                {hasUseOfFunds && (
                  <UseOfFundsPieChart useOfFunds={data.useOfFunds || []} fundingAsk={data.fundingAsk} />
                )}
              </div>
            )}

            {hasProjections && <ProfitMarginChart projections={projections} />}

            {!hasProjections && (
              <Card>
                <CardContent className="py-12 text-center">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Add Your Projections</h3>
                  <p className="text-muted-foreground mb-4">
                    Enter your revenue and expense projections in the Projections tab to see charts here.
                  </p>
                </CardContent>
              </Card>
            )}

          </TabsContent>

          {/* ========== PROJECTIONS TAB ========== */}
          <TabsContent value="projections" className="space-y-6">
            {/* Editable Projection Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* Year 1 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Year 1</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Revenue ($)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={data.year1Revenue}
                      onChange={(e) => updateField("year1Revenue", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Expenses ($)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={data.year1Expenses}
                      onChange={(e) => updateField("year1Expenses", e.target.value)}
                    />
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">Net Profit</p>
                    <p className={`text-xl font-bold ${calculateProfit(data.year1Revenue, data.year1Expenses) >= 0 ? "text-green-600" : "text-red-600"}`}>
                      ${calculateProfit(data.year1Revenue, data.year1Expenses).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Year 2 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Year 2</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Revenue ($)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={data.year2Revenue}
                      onChange={(e) => updateField("year2Revenue", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Expenses ($)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={data.year2Expenses}
                      onChange={(e) => updateField("year2Expenses", e.target.value)}
                    />
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">Net Profit</p>
                    <p className={`text-xl font-bold ${calculateProfit(data.year2Revenue, data.year2Expenses) >= 0 ? "text-green-600" : "text-red-600"}`}>
                      ${calculateProfit(data.year2Revenue, data.year2Expenses).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Year 3 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Year 3</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Revenue ($)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={data.year3Revenue}
                      onChange={(e) => updateField("year3Revenue", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Expenses ($)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={data.year3Expenses}
                      onChange={(e) => updateField("year3Expenses", e.target.value)}
                    />
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">Net Profit</p>
                    <p className={`text-xl font-bold ${calculateProfit(data.year3Revenue, data.year3Expenses) >= 0 ? "text-green-600" : "text-red-600"}`}>
                      ${calculateProfit(data.year3Revenue, data.year3Expenses).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Year 5 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Year 5</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Revenue ($)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={data.year5Revenue}
                      onChange={(e) => updateField("year5Revenue", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Expenses ($)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={data.year5Expenses}
                      onChange={(e) => updateField("year5Expenses", e.target.value)}
                    />
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">Net Profit</p>
                    <p className={`text-xl font-bold ${calculateProfit(data.year5Revenue, data.year5Expenses) >= 0 ? "text-green-600" : "text-red-600"}`}>
                      ${calculateProfit(data.year5Revenue, data.year5Expenses).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Year 10 - Optional */}
              <Card className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-muted-foreground">Year 10 (Optional)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Revenue ($)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={data.year10Revenue}
                      onChange={(e) => updateField("year10Revenue", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Expenses ($)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={data.year10Expenses}
                      onChange={(e) => updateField("year10Expenses", e.target.value)}
                    />
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">Net Profit</p>
                    <p className={`text-xl font-bold ${calculateProfit(data.year10Revenue, data.year10Expenses) >= 0 ? "text-green-600" : "text-red-600"}`}>
                      ${calculateProfit(data.year10Revenue, data.year10Expenses).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Assumptions */}
            <Card>
              <CardHeader>
                <CardTitle>Key Assumptions</CardTitle>
                <CardDescription>Document your forecasting assumptions and methodology</CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full min-h-[150px] p-3 rounded-md border border-input bg-background text-sm"
                  placeholder="Enter your key assumptions here (e.g., customer acquisition rate, pricing strategy, market growth rate, etc.)"
                  value={data.assumptions}
                  onChange={(e) => updateField("assumptions", e.target.value)}
                />
              </CardContent>
            </Card>

            {/* Sales Targets from Business Plan (read-only) */}
            {planData && (planData.yearOneSalesTarget || planData.firstSaleTarget) && (
              <Card className="bg-muted/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Sales Targets
                      </CardTitle>
                      <CardDescription>From Business Plan Phase 7</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => {
                      const event = new CustomEvent('switch-tab', { detail: 'businessplan' });
                      window.dispatchEvent(event);
                    }}>
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Edit in Plan
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-background rounded-lg">
                      <p className="text-sm text-muted-foreground">Year 1 Sales Target</p>
                      <p className="font-semibold">{planData.yearOneSalesTarget || "Not set"}</p>
                    </div>
                    <div className="p-4 bg-background rounded-lg">
                      <p className="text-sm text-muted-foreground">First Sale Target</p>
                      <p className="font-semibold">{planData.firstSaleTarget || "Not set"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ========== FUNDING TAB ========== */}
          <TabsContent value="funding" className="space-y-6">
            {/* The Ask - Editable */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  The Ask
                </CardTitle>
                <CardDescription>How much funding are you seeking?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Funding Amount ($)</label>
                    <Input
                      type="number"
                      placeholder="e.g., 500000"
                      value={data.fundingAsk || ""}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        fundingAsk: e.target.value ? parseFloat(e.target.value) : undefined
                      }))}
                    />
                    {data.fundingAsk && (
                      <p className="text-sm text-muted-foreground">
                        ${data.fundingAsk.toLocaleString()} ({data.fundingAsk >= 1000000
                          ? `$${(data.fundingAsk / 1000000).toFixed(1)}M`
                          : `$${(data.fundingAsk / 1000).toFixed(0)}K`})
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Funding Stage</label>
                    <Select
                      value={data.fundingStage}
                      onValueChange={(value) => setData(prev => ({ ...prev, fundingStage: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {FUNDING_STAGES.map(stage => (
                          <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Use of Funds - Editable */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5" />
                      Use of Funds
                    </CardTitle>
                    <CardDescription>How will you allocate the funding?</CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newItem: UseOfFundsItem = {
                        id: `uof-${Date.now()}`,
                        category: "",
                        amount: 0,
                        description: "",
                      };
                      setData(prev => ({ ...prev, useOfFunds: [...(prev.useOfFunds || []), newItem] }));
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {(data.useOfFunds || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground italic py-4 text-center border rounded-md">
                    Click "Add Item" to break down how you'll use the funding
                  </p>
                ) : (
                  <div className="space-y-3">
                    {(data.useOfFunds || []).map((item, index) => {
                      const totalFunds = data.fundingAsk || 0;
                      const percentage = totalFunds > 0 ? ((item.amount / totalFunds) * 100).toFixed(1) : 0;

                      return (
                        <div key={item.id} className="flex gap-2 items-start p-3 border rounded-md bg-muted/30">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                            <Select
                              value={item.category}
                              onValueChange={(value) => {
                                const updated = [...(data.useOfFunds || [])];
                                updated[index] = { ...item, category: value };
                                setData(prev => ({ ...prev, useOfFunds: updated }));
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Category" />
                              </SelectTrigger>
                              <SelectContent>
                                {USE_OF_FUNDS_CATEGORIES.map(cat => (
                                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                              <Input
                                type="number"
                                placeholder="Amount"
                                className="pl-7"
                                value={item.amount || ""}
                                onChange={(e) => {
                                  const updated = [...(data.useOfFunds || [])];
                                  updated[index] = { ...item, amount: parseFloat(e.target.value) || 0 };
                                  setData(prev => ({ ...prev, useOfFunds: updated }));
                                }}
                              />
                            </div>
                            <Input
                              placeholder="Description (optional)"
                              value={item.description}
                              onChange={(e) => {
                                const updated = [...(data.useOfFunds || [])];
                                updated[index] = { ...item, description: e.target.value };
                                setData(prev => ({ ...prev, useOfFunds: updated }));
                              }}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            {totalFunds > 0 && (
                              <span className="text-sm font-medium text-muted-foreground min-w-[50px]">
                                {percentage}%
                              </span>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                const updated = (data.useOfFunds || []).filter(u => u.id !== item.id);
                                setData(prev => ({ ...prev, useOfFunds: updated }));
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Total Summary */}
                    {(data.useOfFunds || []).length > 0 && (
                      <div className="flex justify-between items-center pt-3 border-t">
                        <span className="font-medium">Total Allocated:</span>
                        <span className={`font-bold ${
                          data.fundingAsk && (data.useOfFunds || []).reduce((sum, i) => sum + i.amount, 0) === data.fundingAsk
                            ? 'text-green-600'
                            : 'text-amber-600'
                        }`}>
                          ${(data.useOfFunds || []).reduce((sum, i) => sum + i.amount, 0).toLocaleString()}
                          {data.fundingAsk && (
                            <span className="text-sm font-normal text-muted-foreground ml-2">
                              of ${data.fundingAsk.toLocaleString()}
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Funding Sources from Business Plan (read-only) */}
            {hasFundingSources && planData && (
              <Card className="bg-muted/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5" />
                        Funding Sources
                      </CardTitle>
                      <CardDescription>From Business Plan Phase 8</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => {
                      const event = new CustomEvent('switch-tab', { detail: 'businessplan' });
                      window.dispatchEvent(event);
                    }}>
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Edit in Plan
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {planData.fundingSources.personalInvestment && (
                      <div className="flex justify-between p-3 bg-background rounded-lg">
                        <span>Personal Investment</span>
                        <span className="font-semibold">${parseCurrency(planData.fundingSources.personalInvestment).toLocaleString()}</span>
                      </div>
                    )}
                    {planData.fundingSources.bankLoans && (
                      <div className="flex justify-between p-3 bg-background rounded-lg">
                        <span>Bank Loans</span>
                        <span className="font-semibold">${parseCurrency(planData.fundingSources.bankLoans).toLocaleString()}</span>
                      </div>
                    )}
                    {planData.fundingSources.grants && (
                      <div className="flex justify-between p-3 bg-background rounded-lg">
                        <span>Grants</span>
                        <span className="font-semibold">${parseCurrency(planData.fundingSources.grants).toLocaleString()}</span>
                      </div>
                    )}
                    {planData.fundingSources.investors && (
                      <div className="flex justify-between p-3 bg-background rounded-lg">
                        <span>Investors</span>
                        <span className="font-semibold">${parseCurrency(planData.fundingSources.investors).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-3 border-t mt-3">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-primary">${totalFundingSources.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ========== POSITION TAB ========== */}
          <TabsContent value="position" className="space-y-6">
            {/* ===== Business Plan Financial Summary (Read-Only) ===== */}
            <Card className="bg-muted/30 border-dashed">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Business Plan Financial Summary
                    </CardTitle>
                    <CardDescription>Data from your Business Plan (read-only)</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {
                    const event = new CustomEvent('switch-tab', { detail: 'businessplan' });
                    window.dispatchEvent(event);
                  }}>
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Edit in Plan
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Phase 7: Sales & Revenue */}
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Phase 7: Sales & Revenue Targets
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-3 bg-background rounded-lg">
                      <p className="text-xs text-muted-foreground">Year 1 Sales Target</p>
                      <p className="font-semibold">{planData?.yearOneSalesTarget || "Not set"}</p>
                    </div>
                    <div className="p-3 bg-background rounded-lg">
                      <p className="text-xs text-muted-foreground">First Sale Target</p>
                      <p className="font-semibold">{planData?.firstSaleTarget || "Not set"}</p>
                    </div>
                    <div className="p-3 bg-background rounded-lg">
                      <p className="text-xs text-muted-foreground">Units/Customers Needed</p>
                      <p className="font-semibold">{planData?.unitsOrCustomersNeeded || "Not set"}</p>
                    </div>
                    <div className="p-3 bg-background rounded-lg">
                      <p className="text-xs text-muted-foreground">How Calculated</p>
                      <p className="font-semibold text-sm truncate" title={planData?.howYouCalculatedSales}>
                        {planData?.howYouCalculatedSales || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Phase 8: Financing */}
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Phase 8: Financing & Funding Sources
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-background rounded-lg col-span-2 md:col-span-1">
                      <p className="text-xs text-muted-foreground">Cash Required</p>
                      <p className="font-semibold text-primary">{planData?.cashRequired ? `$${parseCurrency(planData.cashRequired).toLocaleString()}` : "Not set"}</p>
                    </div>
                    {planData?.fundingSources.personalInvestment && (
                      <div className="p-3 bg-background rounded-lg">
                        <p className="text-xs text-muted-foreground">Personal Investment</p>
                        <p className="font-semibold">${parseCurrency(planData.fundingSources.personalInvestment).toLocaleString()}</p>
                      </div>
                    )}
                    {planData?.fundingSources.bankLoans && (
                      <div className="p-3 bg-background rounded-lg">
                        <p className="text-xs text-muted-foreground">Bank Loans</p>
                        <p className="font-semibold">${parseCurrency(planData.fundingSources.bankLoans).toLocaleString()}</p>
                      </div>
                    )}
                    {planData?.fundingSources.grants && (
                      <div className="p-3 bg-background rounded-lg">
                        <p className="text-xs text-muted-foreground">Grants</p>
                        <p className="font-semibold">${parseCurrency(planData.fundingSources.grants).toLocaleString()}</p>
                      </div>
                    )}
                    {planData?.fundingSources.investors && (
                      <div className="p-3 bg-background rounded-lg">
                        <p className="text-xs text-muted-foreground">Investors</p>
                        <p className="font-semibold">${parseCurrency(planData.fundingSources.investors).toLocaleString()}</p>
                      </div>
                    )}
                    {totalFundingSources > 0 && (
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <p className="text-xs text-muted-foreground">Total Funding Sources</p>
                        <p className="font-bold text-primary">${totalFundingSources.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ===== Personal Financial Position ===== */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Financial Position
                    </CardTitle>
                    <CardDescription>From Business Plan Phase 11</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {
                    const event = new CustomEvent('switch-tab', { detail: 'businessplan' });
                    window.dispatchEvent(event);
                  }}>
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Edit in Plan
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {hasPersonalFinances && planData ? (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Assets</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(totalAssets)}</p>
                      </div>
                      <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Liabilities</p>
                        <p className="text-xl font-bold text-red-600">{formatCurrency(totalLiabilities)}</p>
                      </div>
                      <div className={`p-4 rounded-lg ${netWorth >= 0 ? 'bg-blue-50 dark:bg-blue-950' : 'bg-amber-50 dark:bg-amber-950'}`}>
                        <p className="text-sm text-muted-foreground">Net Worth</p>
                        <p className={`text-xl font-bold ${netWorth >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                          {formatCurrency(netWorth)}
                        </p>
                      </div>
                    </div>

                    {/* Assets */}
                    {planData.assets.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-green-600">Assets</h4>
                        <div className="space-y-2">
                          {planData.assets.map(asset => (
                            <div key={asset.id} className="flex justify-between p-3 bg-green-50/50 dark:bg-green-950/20 rounded-lg">
                              <div>
                                <span className="font-medium">{asset.category}</span>
                                {asset.description && (
                                  <span className="text-sm text-muted-foreground ml-2">- {asset.description}</span>
                                )}
                              </div>
                              <span className="font-semibold">${parseCurrency(asset.value).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Liabilities */}
                    {planData.liabilities.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-red-600">Liabilities</h4>
                        <div className="space-y-2">
                          {planData.liabilities.map(liability => (
                            <div key={liability.id} className="flex justify-between p-3 bg-red-50/50 dark:bg-red-950/20 rounded-lg">
                              <div>
                                <span className="font-medium">{liability.category}</span>
                                {liability.description && (
                                  <span className="text-sm text-muted-foreground ml-2">- {liability.description}</span>
                                )}
                              </div>
                              <span className="font-semibold">${parseCurrency(liability.value).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No personal financial data yet.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Add your assets and liabilities in Business Plan Phase 11.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Financials;