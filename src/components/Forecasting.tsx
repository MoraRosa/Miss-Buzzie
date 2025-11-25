import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ForecastData {
  year1Revenue: string;
  year1Expenses: string;
  year2Revenue: string;
  year2Expenses: string;
  year3Revenue: string;
  year3Expenses: string;
  assumptions: string;
}

const Forecasting = () => {
  const { toast } = useToast();
  const [data, setData] = useState<ForecastData>({
    year1Revenue: "",
    year1Expenses: "",
    year2Revenue: "",
    year2Expenses: "",
    year3Revenue: "",
    year3Expenses: "",
    assumptions: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("forecasting");
    if (saved) {
      setData(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("forecasting", JSON.stringify(data));
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Financial Forecasting</h2>
          <p className="text-muted-foreground mt-2">
            Project your revenue, expenses, and profitability over 3 years
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>

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
      </div>

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

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>3-Year Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
              <p className="text-2xl font-bold">
                ${(
                  (parseFloat(data.year1Revenue) || 0) +
                  (parseFloat(data.year2Revenue) || 0) +
                  (parseFloat(data.year3Revenue) || 0)
                ).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
              <p className="text-2xl font-bold">
                ${(
                  (parseFloat(data.year1Expenses) || 0) +
                  (parseFloat(data.year2Expenses) || 0) +
                  (parseFloat(data.year3Expenses) || 0)
                ).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Net Profit</p>
              <p className={`text-2xl font-bold ${
                (
                  calculateProfit(data.year1Revenue, data.year1Expenses) +
                  calculateProfit(data.year2Revenue, data.year2Expenses) +
                  calculateProfit(data.year3Revenue, data.year3Expenses)
                ) >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                ${(
                  calculateProfit(data.year1Revenue, data.year1Expenses) +
                  calculateProfit(data.year2Revenue, data.year2Expenses) +
                  calculateProfit(data.year3Revenue, data.year3Expenses)
                ).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Forecasting;
