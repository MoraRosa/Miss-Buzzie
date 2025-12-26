/**
 * Phase 5: Customers
 * 
 * Captures target customer description and segments.
 * Reuses CustomerSegment schema from market research.
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
import { CustomerSegment } from "@/lib/validators/schemas";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const CustomersPhase = ({ data, updateData }: PhaseProps) => {
  const [openSegments, setOpenSegments] = useState<Set<string>>(new Set());

  const toggleSegment = (id: string) => {
    const newOpen = new Set(openSegments);
    if (newOpen.has(id)) {
      newOpen.delete(id);
    } else {
      newOpen.add(id);
    }
    setOpenSegments(newOpen);
  };

  const addSegment = () => {
    const newSegment: CustomerSegment = {
      id: generateId("segment"),
      name: "",
      jtbd: "",
      buyingTriggers: "",
      procurementCycle: "",
      budget: "",
      quotes: "",
    };
    updateData({ customerSegments: [...data.customerSegments, newSegment] });
    setOpenSegments(new Set([...openSegments, newSegment.id]));
  };

  const updateSegment = (id: string, updates: Partial<CustomerSegment>) => {
    updateData({
      customerSegments: data.customerSegments.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    });
  };

  const removeSegment = (id: string) => {
    updateData({
      customerSegments: data.customerSegments.filter((s) => s.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Customer Description */}
      <div className="space-y-2">
        <Label htmlFor="customer-desc" className="text-base font-semibold">
          Describe your ideal customer
        </Label>
        <p className="text-sm text-muted-foreground">
          Who are they? What are their demographics, behaviors, and needs?
        </p>
        <Textarea
          id="customer-desc"
          value={data.customerDescription}
          onChange={(e) => updateData({ customerDescription: e.target.value })}
          placeholder="Describe your target customer in detail..."
          className="min-h-[120px]"
        />
      </div>

      {/* Customer Segments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Customer Segments</Label>
          <Button variant="outline" size="sm" onClick={addSegment}>
            <Plus className="h-4 w-4 mr-2" />
            Add Segment
          </Button>
        </div>

        {data.customerSegments.length === 0 ? (
          <Card className="p-4 text-center text-muted-foreground">
            <p>No customer segments defined yet.</p>
            <p className="text-sm">Click "Add Segment" to define your target customers.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {data.customerSegments.map((segment) => (
              <Collapsible
                key={segment.id}
                open={openSegments.has(segment.id)}
                onOpenChange={() => toggleSegment(segment.id)}
              >
                <Card className="p-3">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between cursor-pointer">
                      <span className="font-medium">
                        {segment.name || "Unnamed Segment"}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSegment(segment.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        {openSegments.has(segment.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4 space-y-4">
                    <div className="space-y-2">
                      <Label>Segment Name</Label>
                      <Input
                        value={segment.name}
                        onChange={(e) => updateSegment(segment.id, { name: e.target.value })}
                        placeholder="e.g., Small Business Owners"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Jobs to be Done (JTBD)</Label>
                      <Textarea
                        value={segment.jtbd}
                        onChange={(e) => updateSegment(segment.id, { jtbd: e.target.value })}
                        placeholder="What problems are they trying to solve?"
                        className="min-h-[80px]"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Budget Range</Label>
                        <Input
                          value={segment.budget}
                          onChange={(e) => updateSegment(segment.id, { budget: e.target.value })}
                          placeholder="e.g., $500-$2000/month"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Buying Triggers</Label>
                        <Input
                          value={segment.buyingTriggers}
                          onChange={(e) => updateSegment(segment.id, { buyingTriggers: e.target.value })}
                          placeholder="What makes them buy?"
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomersPhase;

