/**
 * Phase 11: Personal Finances
 * 
 * Captures personal financial position (assets and liabilities).
 * Sensitive data - ensure proper handling.
 */

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PhaseProps } from "../types";
import { generateId, parseNumericString } from "../utils";
import { AssetEntry, LiabilityEntry } from "@/lib/validators/schemas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ASSET_CATEGORIES = [
  "Cash & Savings",
  "RRSP/TFSA",
  "Investments",
  "Vehicle",
  "Real Estate",
  "Business Equity",
  "Other",
];

const LIABILITY_CATEGORIES = [
  "Mortgage",
  "Vehicle Loan",
  "Student Loans",
  "Credit Cards",
  "Line of Credit",
  "Personal Loans",
  "Other",
];

const PersonalFinancesPhase = ({ data, updateData }: PhaseProps) => {
  // Assets
  const addAsset = () => {
    const newAsset: AssetEntry = {
      id: generateId("asset"),
      category: "",
      description: "",
      value: "",
    };
    updateData({ assets: [...data.assets, newAsset] });
  };

  const updateAsset = (id: string, updates: Partial<AssetEntry>) => {
    updateData({
      assets: data.assets.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    });
  };

  const removeAsset = (id: string) => {
    updateData({ assets: data.assets.filter((a) => a.id !== id) });
  };

  // Liabilities
  const addLiability = () => {
    const newLiability: LiabilityEntry = {
      id: generateId("liability"),
      category: "",
      description: "",
      value: "",
    };
    updateData({ liabilities: [...data.liabilities, newLiability] });
  };

  const updateLiability = (id: string, updates: Partial<LiabilityEntry>) => {
    updateData({
      liabilities: data.liabilities.map((l) =>
        l.id === id ? { ...l, ...updates } : l
      ),
    });
  };

  const removeLiability = (id: string) => {
    updateData({ liabilities: data.liabilities.filter((l) => l.id !== id) });
  };

  // Calculate totals
  const totalAssets = data.assets.reduce(
    (sum, a) => sum + parseNumericString(a.value),
    0
  );
  const totalLiabilities = data.liabilities.reduce(
    (sum, l) => sum + parseNumericString(l.value),
    0
  );
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="space-y-6">
      {/* Privacy Notice */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This information is stored locally on your device and is not transmitted to any server.
          It's used to help demonstrate your personal financial capacity to support your business.
        </AlertDescription>
      </Alert>

      {/* Assets */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Assets</h3>
            <p className="text-sm text-muted-foreground">What you own</p>
          </div>
          <Button variant="outline" size="sm" onClick={addAsset}>
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Button>
        </div>

        {data.assets.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No assets added. Click "Add Asset" to begin.
          </p>
        ) : (
          <div className="space-y-3">
            {data.assets.map((asset) => (
              <div key={asset.id} className="flex items-center gap-2">
                <Select
                  value={asset.category}
                  onValueChange={(value) => updateAsset(asset.id, { category: value })}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={asset.description}
                  onChange={(e) => updateAsset(asset.id, { description: e.target.value })}
                  placeholder="Description"
                  className="flex-1"
                />
                <Input
                  value={asset.value}
                  onChange={(e) => updateAsset(asset.id, { value: e.target.value })}
                  placeholder="$0"
                  className="w-[120px]"
                />
                <Button variant="ghost" size="icon" onClick={() => removeAsset(asset.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 border-t text-right">
          <span className="font-semibold">Total Assets: </span>
          <span className="text-lg">${totalAssets.toLocaleString()}</span>
        </div>
      </Card>

      {/* Liabilities */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Liabilities</h3>
            <p className="text-sm text-muted-foreground">What you owe</p>
          </div>
          <Button variant="outline" size="sm" onClick={addLiability}>
            <Plus className="h-4 w-4 mr-2" />
            Add Liability
          </Button>
        </div>

        {data.liabilities.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No liabilities added. Click "Add Liability" to begin.
          </p>
        ) : (
          <div className="space-y-3">
            {data.liabilities.map((liability) => (
              <div key={liability.id} className="flex items-center gap-2">
                <Select
                  value={liability.category}
                  onValueChange={(value) => updateLiability(liability.id, { category: value })}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {LIABILITY_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={liability.description}
                  onChange={(e) => updateLiability(liability.id, { description: e.target.value })}
                  placeholder="Description"
                  className="flex-1"
                />
                <Input
                  value={liability.value}
                  onChange={(e) => updateLiability(liability.id, { value: e.target.value })}
                  placeholder="$0"
                  className="w-[120px]"
                />
                <Button variant="ghost" size="icon" onClick={() => removeLiability(liability.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 border-t text-right">
          <span className="font-semibold">Total Liabilities: </span>
          <span className="text-lg">${totalLiabilities.toLocaleString()}</span>
        </div>
      </Card>

      {/* Net Worth Summary */}
      <Card className={`p-4 ${netWorth >= 0 ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'}`}>
        <div className="text-center">
          <Label className="text-lg">Net Worth</Label>
          <p className={`text-3xl font-bold ${netWorth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            ${netWorth.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Assets (${totalAssets.toLocaleString()}) - Liabilities (${totalLiabilities.toLocaleString()})
          </p>
        </div>
      </Card>
    </div>
  );
};

export default PersonalFinancesPhase;

