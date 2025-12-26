/**
 * Phase 8: Financing
 * 
 * Captures funding needs and sources.
 */

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { PhaseProps } from "../types";

const FinancingPhase = ({ data, updateData, isExistingBusiness }: PhaseProps) => {
  const updateFundingSource = (key: keyof typeof data.fundingSources, value: string) => {
    updateData({
      fundingSources: {
        ...data.fundingSources,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Cash Required */}
      <div className="space-y-2">
        <Label htmlFor="cash-required" className="text-base font-semibold">
          Total cash required to start/grow
        </Label>
        <p className="text-sm text-muted-foreground">
          How much funding do you need in total?
        </p>
        <Input
          id="cash-required"
          value={data.cashRequired}
          onChange={(e) => updateData({ cashRequired: e.target.value })}
          placeholder="e.g., $50,000"
          className="text-lg"
        />
      </div>

      {/* Use of Funds */}
      <div className="space-y-2">
        <Label htmlFor="use-of-funds" className="text-base font-semibold">
          How will the funds be used?
        </Label>
        <p className="text-sm text-muted-foreground">
          Break down how you'll allocate the funding.
        </p>
        <Textarea
          id="use-of-funds"
          value={data.useOfFunds}
          onChange={(e) => updateData({ useOfFunds: e.target.value })}
          placeholder="e.g., Equipment: $15,000, Inventory: $10,000, Marketing: $5,000..."
          className="min-h-[120px]"
        />
      </div>

      {/* Funding Sources */}
      <Card className="p-4 space-y-4">
        <div>
          <h3 className="font-semibold text-lg">Funding Sources</h3>
          <p className="text-sm text-muted-foreground">
            Where will the money come from? Enter amounts for each source.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Personal Investment</Label>
            <Input
              value={data.fundingSources.personalInvestment}
              onChange={(e) => updateFundingSource("personalInvestment", e.target.value)}
              placeholder="$0"
            />
          </div>
          <div className="space-y-2">
            <Label>Bank Loans</Label>
            <Input
              value={data.fundingSources.bankLoans}
              onChange={(e) => updateFundingSource("bankLoans", e.target.value)}
              placeholder="$0"
            />
          </div>
          <div className="space-y-2">
            <Label>Line of Credit</Label>
            <Input
              value={data.fundingSources.lineOfCredit}
              onChange={(e) => updateFundingSource("lineOfCredit", e.target.value)}
              placeholder="$0"
            />
          </div>
          <div className="space-y-2">
            <Label>Family/Friends Support</Label>
            <Input
              value={data.fundingSources.familySupport}
              onChange={(e) => updateFundingSource("familySupport", e.target.value)}
              placeholder="$0"
            />
          </div>
          <div className="space-y-2">
            <Label>Grants</Label>
            <Input
              value={data.fundingSources.grants}
              onChange={(e) => updateFundingSource("grants", e.target.value)}
              placeholder="$0"
            />
          </div>
          <div className="space-y-2">
            <Label>Investors</Label>
            <Input
              value={data.fundingSources.investors}
              onChange={(e) => updateFundingSource("investors", e.target.value)}
              placeholder="$0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Other Sources</Label>
          <Input
            value={data.fundingSources.other}
            onChange={(e) => updateFundingSource("other", e.target.value)}
            placeholder="Describe other funding sources..."
          />
        </div>
      </Card>

      {/* Why Start Business / Achievements */}
      {isExistingBusiness ? (
        <div className="space-y-2">
          <Label htmlFor="achievements" className="text-base font-semibold">
            Key business achievements so far
          </Label>
          <Textarea
            id="achievements"
            value={data.businessAchievements}
            onChange={(e) => updateData({ businessAchievements: e.target.value })}
            placeholder="What milestones have you reached?"
            className="min-h-[100px]"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="why-start" className="text-base font-semibold">
            Why are you starting this business?
          </Label>
          <p className="text-sm text-muted-foreground">
            Share your motivation and commitment.
          </p>
          <Textarea
            id="why-start"
            value={data.whyStartBusiness}
            onChange={(e) => updateData({ whyStartBusiness: e.target.value })}
            placeholder="What drives you to start this business?"
            className="min-h-[100px]"
          />
        </div>
      )}
    </div>
  );
};

export default FinancingPhase;

