import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Download, Loader2, FileImage, FileText, Plus, Trash2, DollarSign, PieChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useExport } from "@/hooks/useExport";
import { ForecastDataSchema, type ForecastData, type UseOfFundsItem } from "@/lib/validators/schemas";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BrandHeader from "./BrandHeader";
import FinancialForecastVisual from "./FinancialForecastVisual";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const Forecasting = () => {
  const { toast } = useToast();

  // Use the new custom hooks
  const [data, setData, { save }] = useLocalStorage<ForecastData>(
    "forecasting",
    defaultForecastData,
    { schema: ForecastDataSchema }
  );

  const { isExporting, exportPNG, exportPDF } = useExport({
    elementId: "forecasting-content",
    filename: "financial-forecast",
  });

  const handleSave = () => {
    save();
    toast({
      title: "Saved successfully",
      description: "Your financial forecast has been saved",
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

  return (
    <div className="space-y-4 md:space-y-6">
      <BrandHeader />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Financial Forecasting</h2>
          <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
            Project your revenue, expenses, and profitability over 25 years
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

      <div id="forecasting-content">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Year 1</CardTitle>
            <CardDescription>First year projections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Revenue ($)</label>
              <Input
                type="number"
                placeholder="0"
                value={data.year1Revenue}
                onChange={(e) => updateField("year1Revenue", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Expenses ($)</label>
              <Input
                type="number"
                placeholder="0"
                value={data.year1Expenses}
                onChange={(e) => updateField("year1Expenses", e.target.value)}
              />
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">Net Profit</p>
              <p className={`text-2xl font-bold ${
                calculateProfit(data.year1Revenue, data.year1Expenses) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}>
                ${calculateProfit(data.year1Revenue, data.year1Expenses).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Year 2</CardTitle>
            <CardDescription>Second year projections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Revenue ($)</label>
              <Input
                type="number"
                placeholder="0"
                value={data.year2Revenue}
                onChange={(e) => updateField("year2Revenue", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Expenses ($)</label>
              <Input
                type="number"
                placeholder="0"
                value={data.year2Expenses}
                onChange={(e) => updateField("year2Expenses", e.target.value)}
              />
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">Net Profit</p>
              <p className={`text-2xl font-bold ${
                calculateProfit(data.year2Revenue, data.year2Expenses) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}>
                ${calculateProfit(data.year2Revenue, data.year2Expenses).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Year 3</CardTitle>
            <CardDescription>Third year projections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Revenue ($)</label>
              <Input
                type="number"
                placeholder="0"
                value={data.year3Revenue}
                onChange={(e) => updateField("year3Revenue", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Expenses ($)</label>
              <Input
                type="number"
                placeholder="0"
                value={data.year3Expenses}
                onChange={(e) => updateField("year3Expenses", e.target.value)}
              />
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">Net Profit</p>
              <p className={`text-2xl font-bold ${
                calculateProfit(data.year3Revenue, data.year3Expenses) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}>
                ${calculateProfit(data.year3Revenue, data.year3Expenses).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Year 5</CardTitle>
            <CardDescription>Five year projections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Revenue ($)</label>
              <Input
                type="number"
                placeholder="0"
                value={data.year5Revenue}
                onChange={(e) => updateField("year5Revenue", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Expenses ($)</label>
              <Input
                type="number"
                placeholder="0"
                value={data.year5Expenses}
                onChange={(e) => updateField("year5Expenses", e.target.value)}
              />
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">Net Profit</p>
              <p className={`text-2xl font-bold ${
                calculateProfit(data.year5Revenue, data.year5Expenses) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}>
                ${calculateProfit(data.year5Revenue, data.year5Expenses).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Year 10</CardTitle>
            <CardDescription>Ten year projections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Revenue ($)</label>
              <Input
                type="number"
                placeholder="0"
                value={data.year10Revenue}
                onChange={(e) => updateField("year10Revenue", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Expenses ($)</label>
              <Input
                type="number"
                placeholder="0"
                value={data.year10Expenses}
                onChange={(e) => updateField("year10Expenses", e.target.value)}
              />
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">Net Profit</p>
              <p className={`text-2xl font-bold ${
                calculateProfit(data.year10Revenue, data.year10Expenses) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}>
                ${calculateProfit(data.year10Revenue, data.year10Expenses).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Year 15</CardTitle>
            <CardDescription>Fifteen year projections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Revenue ($)</label>
              <Input
                type="number"
                placeholder="0"
                value={data.year15Revenue}
                onChange={(e) => updateField("year15Revenue", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Expenses ($)</label>
              <Input
                type="number"
                placeholder="0"
                value={data.year15Expenses}
                onChange={(e) => updateField("year15Expenses", e.target.value)}
              />
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">Net Profit</p>
              <p className={`text-2xl font-bold ${
                calculateProfit(data.year15Revenue, data.year15Expenses) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}>
                ${calculateProfit(data.year15Revenue, data.year15Expenses).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Year 25</CardTitle>
            <CardDescription>Twenty-five year projections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Revenue ($)</label>
              <Input
                type="number"
                placeholder="0"
                value={data.year25Revenue}
                onChange={(e) => updateField("year25Revenue", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Expenses ($)</label>
              <Input
                type="number"
                placeholder="0"
                value={data.year25Expenses}
                onChange={(e) => updateField("year25Expenses", e.target.value)}
              />
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">Net Profit</p>
              <p className={`text-2xl font-bold ${
                calculateProfit(data.year25Revenue, data.year25Expenses) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}>
                ${calculateProfit(data.year25Revenue, data.year25Expenses).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Forecast Visualizations */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Visual Forecast</CardTitle>
          <CardDescription>Interactive visualizations of your 25-year financial journey</CardDescription>
        </CardHeader>
        <CardContent>
          <FinancialForecastVisual data={data} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Assumptions</CardTitle>
          <CardDescription>Document your forecasting assumptions and methodology</CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full min-h-[200px] p-3 rounded-md border border-input bg-background text-sm"
            placeholder="Enter your key assumptions here (e.g., customer acquisition rate, pricing strategy, market growth rate, etc.)"
            value={data.assumptions}
            onChange={(e) => updateField("assumptions", e.target.value)}
          />
        </CardContent>
      </Card>

      {/* The Ask - Funding Request */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            The Ask
          </CardTitle>
          <CardDescription>How much funding are you seeking and how will you use it?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Funding Amount and Stage */}
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

          {/* Use of Funds */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Use of Funds
              </label>
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
                          {(data.useOfFunds || []).reduce((sum, i) => sum + i.amount, 0) !== data.fundingAsk && (
                            <span className="text-amber-600 ml-1">
                              (diff: ${Math.abs(data.fundingAsk - (data.useOfFunds || []).reduce((sum, i) => sum + i.amount, 0)).toLocaleString()})
                            </span>
                          )}
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>25-Year Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
              <p className="text-2xl font-bold">
                ${(
                  (parseFloat(data.year1Revenue) || 0) +
                  (parseFloat(data.year2Revenue) || 0) +
                  (parseFloat(data.year3Revenue) || 0) +
                  (parseFloat(data.year5Revenue) || 0) +
                  (parseFloat(data.year10Revenue) || 0) +
                  (parseFloat(data.year15Revenue) || 0) +
                  (parseFloat(data.year25Revenue) || 0)
                ).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
              <p className="text-2xl font-bold">
                ${(
                  (parseFloat(data.year1Expenses) || 0) +
                  (parseFloat(data.year2Expenses) || 0) +
                  (parseFloat(data.year3Expenses) || 0) +
                  (parseFloat(data.year5Expenses) || 0) +
                  (parseFloat(data.year10Expenses) || 0) +
                  (parseFloat(data.year15Expenses) || 0) +
                  (parseFloat(data.year25Expenses) || 0)
                ).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Net Profit</p>
              <p className={`text-2xl font-bold ${
                (
                  calculateProfit(data.year1Revenue, data.year1Expenses) +
                  calculateProfit(data.year2Revenue, data.year2Expenses) +
                  calculateProfit(data.year3Revenue, data.year3Expenses) +
                  calculateProfit(data.year5Revenue, data.year5Expenses) +
                  calculateProfit(data.year10Revenue, data.year10Expenses) +
                  calculateProfit(data.year15Revenue, data.year15Expenses) +
                  calculateProfit(data.year25Revenue, data.year25Expenses)
                ) >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                ${(
                  calculateProfit(data.year1Revenue, data.year1Expenses) +
                  calculateProfit(data.year2Revenue, data.year2Expenses) +
                  calculateProfit(data.year3Revenue, data.year3Expenses) +
                  calculateProfit(data.year5Revenue, data.year5Expenses) +
                  calculateProfit(data.year10Revenue, data.year10Expenses) +
                  calculateProfit(data.year15Revenue, data.year15Expenses) +
                  calculateProfit(data.year25Revenue, data.year25Expenses)
                ).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default Forecasting;
