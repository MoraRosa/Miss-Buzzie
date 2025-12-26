/**
 * Phase 7: Sales & Revenue
 * 
 * Captures sales targets and revenue projections.
 */

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { PhaseProps } from "../types";

const SalesRevenuePhase = ({ data, updateData, isExistingBusiness }: PhaseProps) => {
  return (
    <div className="space-y-6">
      {/* Year One Sales Target */}
      <Card className="p-4 space-y-4">
        <div>
          <h3 className="font-semibold text-lg">Sales Projections</h3>
          <p className="text-sm text-muted-foreground">
            Project your revenue for the first year of operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="year1-target">Year One Sales Target</Label>
            <Input
              id="year1-target"
              value={data.yearOneSalesTarget}
              onChange={(e) => updateData({ yearOneSalesTarget: e.target.value })}
              placeholder="e.g., $100,000"
            />
          </div>
          {isExistingBusiness && (
            <div className="space-y-2">
              <Label htmlFor="first-year-actual">First Year Actual Sales</Label>
              <Input
                id="first-year-actual"
                value={data.firstYearSales}
                onChange={(e) => updateData({ firstYearSales: e.target.value })}
                placeholder="e.g., $85,000"
              />
            </div>
          )}
        </div>
      </Card>

      {/* How You Calculated */}
      <div className="space-y-2">
        <Label htmlFor="calculation" className="text-base font-semibold">
          How did you calculate these sales projections?
        </Label>
        <p className="text-sm text-muted-foreground">
          Show your methodology - market research, comparable businesses, customer commitments, etc.
        </p>
        <Textarea
          id="calculation"
          value={data.howYouCalculatedSales}
          onChange={(e) => updateData({ howYouCalculatedSales: e.target.value })}
          placeholder="Explain how you arrived at these numbers..."
          className="min-h-[120px]"
        />
      </div>

      {/* Units/Customers Needed */}
      <div className="space-y-2">
        <Label htmlFor="units" className="text-base font-semibold">
          How many units or customers do you need?
        </Label>
        <p className="text-sm text-muted-foreground">
          Break down your target into actionable numbers.
        </p>
        <Textarea
          id="units"
          value={data.unitsOrCustomersNeeded}
          onChange={(e) => updateData({ unitsOrCustomersNeeded: e.target.value })}
          placeholder="e.g., 50 customers at $2,000/year = $100,000..."
          className="min-h-[100px]"
        />
      </div>

      {/* First Sale Target */}
      {!isExistingBusiness && (
        <div className="space-y-2">
          <Label htmlFor="first-sale" className="text-base font-semibold">
            When do you expect your first sale?
          </Label>
          <p className="text-sm text-muted-foreground">
            Set a realistic timeline for your first revenue.
          </p>
          <Input
            id="first-sale"
            value={data.firstSaleTarget}
            onChange={(e) => updateData({ firstSaleTarget: e.target.value })}
            placeholder="e.g., Within 3 months of launch"
          />
        </div>
      )}
    </div>
  );
};

export default SalesRevenuePhase;

