/**
 * Phase 4: Market Analysis
 * 
 * Captures market opportunity including TAM/SAM/SOM, trends, and evidence of viability.
 */

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { PhaseProps } from "../types";

const MarketAnalysisPhase = ({ data, updateData }: PhaseProps) => {
  return (
    <div className="space-y-6">
      {/* Market Definition */}
      <div className="space-y-2">
        <Label htmlFor="market-def" className="text-base font-semibold">
          Define your market
        </Label>
        <p className="text-sm text-muted-foreground">
          What industry are you in? What geographic area do you serve?
        </p>
        <Textarea
          id="market-def"
          value={data.marketDefinition}
          onChange={(e) => updateData({ marketDefinition: e.target.value })}
          placeholder="Describe your target market..."
          className="min-h-[100px]"
        />
      </div>

      {/* TAM/SAM/SOM */}
      <Card className="p-4 space-y-4">
        <div>
          <h3 className="font-semibold text-lg">Market Size (TAM/SAM/SOM)</h3>
          <p className="text-sm text-muted-foreground">
            Estimate your market opportunity at different levels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tam">TAM (Total Addressable Market)</Label>
            <Input
              id="tam"
              value={data.tamCurrent}
              onChange={(e) => updateData({ tamCurrent: e.target.value })}
              placeholder="e.g., $10B"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sam">SAM (Serviceable Addressable Market)</Label>
            <Input
              id="sam"
              value={data.samCurrent}
              onChange={(e) => updateData({ samCurrent: e.target.value })}
              placeholder="e.g., $500M"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="som">SOM (Serviceable Obtainable Market)</Label>
            <Input
              id="som"
              value={data.somCurrent}
              onChange={(e) => updateData({ somCurrent: e.target.value })}
              placeholder="e.g., $5M"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="assumptions">Key Assumptions</Label>
          <Textarea
            id="assumptions"
            value={data.tamAssumptions}
            onChange={(e) => updateData({ tamAssumptions: e.target.value })}
            placeholder="What assumptions are these estimates based on?"
            className="min-h-[80px]"
          />
        </div>
      </Card>

      {/* Evidence of Viability */}
      <div className="space-y-2">
        <Label htmlFor="evidence" className="text-base font-semibold">
          Evidence of market viability
        </Label>
        <p className="text-sm text-muted-foreground">
          What proof do you have that customers want your product/service?
        </p>
        <Textarea
          id="evidence"
          value={data.evidenceOfViability}
          onChange={(e) => updateData({ evidenceOfViability: e.target.value })}
          placeholder="Pre-orders, letters of intent, pilot customers, market research..."
          className="min-h-[100px]"
        />
      </div>

      {/* Customer Survey Results */}
      <div className="space-y-2">
        <Label htmlFor="surveys" className="text-base font-semibold">
          Customer research or survey results
        </Label>
        <Textarea
          id="surveys"
          value={data.customerSurveyResults}
          onChange={(e) => updateData({ customerSurveyResults: e.target.value })}
          placeholder="Summarize any customer interviews, surveys, or research you've conducted..."
          className="min-h-[100px]"
        />
      </div>

      {/* Market Trends */}
      <div className="space-y-2">
        <Label htmlFor="trends" className="text-base font-semibold">
          Market trends and growth drivers
        </Label>
        <p className="text-sm text-muted-foreground">
          What trends support your business? Is the market growing?
        </p>
        <Textarea
          id="trends"
          value={data.marketTrends}
          onChange={(e) => updateData({ marketTrends: e.target.value })}
          placeholder="Describe relevant market trends..."
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
};

export default MarketAnalysisPhase;

