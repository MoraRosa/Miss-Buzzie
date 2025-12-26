/**
 * Phase 6: Competition & Advantage
 * 
 * Captures competitor analysis and competitive differentiation.
 * Reuses Competitor schema from market research.
 */

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { PhaseProps } from "../types";
import { generateId } from "../utils";
import { Competitor } from "@/lib/validators/schemas";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const CompetitionPhase = ({ data, updateData, isExistingBusiness }: PhaseProps) => {
  const [openCompetitors, setOpenCompetitors] = useState<Set<string>>(new Set());

  const toggleCompetitor = (id: string) => {
    const newOpen = new Set(openCompetitors);
    if (newOpen.has(id)) {
      newOpen.delete(id);
    } else {
      newOpen.add(id);
    }
    setOpenCompetitors(newOpen);
  };

  const addCompetitor = () => {
    const newCompetitor: Competitor = {
      id: generateId("competitor"),
      name: "",
      foundingYear: "",
      hq: "",
      fundingRevenue: "",
      coreOffer: "",
      pricingModel: "",
      differentiators: "",
      gtmMotion: "",
      notableCustomers: "",
    };
    updateData({ competitors: [...data.competitors, newCompetitor] });
    setOpenCompetitors(new Set([...openCompetitors, newCompetitor.id]));
  };

  const updateCompetitor = (id: string, updates: Partial<Competitor>) => {
    updateData({
      competitors: data.competitors.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    });
  };

  const removeCompetitor = (id: string) => {
    updateData({
      competitors: data.competitors.filter((c) => c.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Competitors List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Competitors</Label>
          <Button variant="outline" size="sm" onClick={addCompetitor}>
            <Plus className="h-4 w-4 mr-2" />
            Add Competitor
          </Button>
        </div>

        {data.competitors.length === 0 ? (
          <Card className="p-4 text-center text-muted-foreground">
            <p>No competitors added yet.</p>
            <p className="text-sm">Identify 3-5 key competitors to analyze.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {data.competitors.map((competitor) => (
              <Collapsible
                key={competitor.id}
                open={openCompetitors.has(competitor.id)}
                onOpenChange={() => toggleCompetitor(competitor.id)}
              >
                <Card className="p-3">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between cursor-pointer">
                      <span className="font-medium">
                        {competitor.name || "Unnamed Competitor"}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCompetitor(competitor.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        {openCompetitors.has(competitor.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Competitor Name</Label>
                        <Input
                          value={competitor.name}
                          onChange={(e) => updateCompetitor(competitor.id, { name: e.target.value })}
                          placeholder="Company name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Core Offer</Label>
                        <Input
                          value={competitor.coreOffer}
                          onChange={(e) => updateCompetitor(competitor.id, { coreOffer: e.target.value })}
                          placeholder="What do they offer?"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Differentiators</Label>
                      <Textarea
                        value={competitor.differentiators}
                        onChange={(e) => updateCompetitor(competitor.id, { differentiators: e.target.value })}
                        placeholder="What makes them unique?"
                        className="min-h-[60px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Pricing Model</Label>
                      <Input
                        value={competitor.pricingModel}
                        onChange={(e) => updateCompetitor(competitor.id, { pricingModel: e.target.value })}
                        placeholder="How do they price?"
                      />
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        )}
      </div>

      {/* Competitive Advantage */}
      <div className="space-y-2">
        <Label htmlFor="why-different" className="text-base font-semibold">
          How are you different from competitors?
        </Label>
        <Textarea
          id="why-different"
          value={data.howYouAreDifferent}
          onChange={(e) => updateData({ howYouAreDifferent: e.target.value })}
          placeholder="What makes you unique?"
          className="min-h-[100px]"
        />
      </div>

      {isExistingBusiness ? (
        <div className="space-y-2">
          <Label htmlFor="why-buy" className="text-base font-semibold">
            Why do customers currently buy from you?
          </Label>
          <Textarea
            id="why-buy"
            value={data.whyCustomersBuyFromYou}
            onChange={(e) => updateData({ whyCustomersBuyFromYou: e.target.value })}
            placeholder="What feedback have customers given?"
            className="min-h-[100px]"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="why-prefer" className="text-base font-semibold">
            Why will customers prefer you?
          </Label>
          <Textarea
            id="why-prefer"
            value={data.whyCustomersPreferYou}
            onChange={(e) => updateData({ whyCustomersPreferYou: e.target.value })}
            placeholder="What will make customers choose you?"
            className="min-h-[100px]"
          />
        </div>
      )}

      {/* Pricing */}
      <div className="space-y-2">
        <Label htmlFor="pricing" className="text-base font-semibold">
          Your pricing strategy
        </Label>
        <Textarea
          id="pricing"
          value={data.pricingInfo}
          onChange={(e) => updateData({ pricingInfo: e.target.value })}
          placeholder="How will you price your products/services?"
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
};

export default CompetitionPhase;

