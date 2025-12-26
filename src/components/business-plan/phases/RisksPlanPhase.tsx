/**
 * Phase 10: Risks & Plan
 * 
 * Captures risk assessment and entry/action plan.
 * Reuses Risk and Experiment schemas from market research.
 */

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { PhaseProps } from "../types";
import { generateId } from "../utils";
import { Risk } from "@/lib/validators/schemas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LIKELIHOOD_OPTIONS = ["Low", "Medium", "High"] as const;
const IMPACT_OPTIONS = ["Low", "Medium", "High"] as const;

const RisksPlanPhase = ({ data, updateData }: PhaseProps) => {
  const addRisk = () => {
    const newRisk: Risk = {
      id: generateId("risk"),
      description: "",
      likelihood: "Medium",
      impact: "Medium",
    };
    updateData({ risks: [...data.risks, newRisk] });
  };

  const updateRisk = (id: string, updates: Partial<Risk>) => {
    updateData({
      risks: data.risks.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    });
  };

  const removeRisk = (id: string) => {
    updateData({
      risks: data.risks.filter((r) => r.id !== id),
    });
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "High": return "destructive";
      case "Medium": return "secondary";
      case "Low": return "outline";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Risks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold">Identified Risks</Label>
            <p className="text-sm text-muted-foreground">
              What could go wrong? Identify and assess key risks.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={addRisk}>
            <Plus className="h-4 w-4 mr-2" />
            Add Risk
          </Button>
        </div>

        {data.risks.length === 0 ? (
          <Card className="p-4 text-center text-muted-foreground">
            <p>No risks identified yet.</p>
            <p className="text-sm">Click "Add Risk" to identify potential challenges.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {data.risks.map((risk) => (
              <Card key={risk.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <Input
                      value={risk.description}
                      onChange={(e) => updateRisk(risk.id, { description: e.target.value })}
                      placeholder="Describe the risk..."
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRisk(risk.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Likelihood:</Label>
                    <Select
                      value={risk.likelihood}
                      onValueChange={(value: "Low" | "Medium" | "High") =>
                        updateRisk(risk.id, { likelihood: value })
                      }
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LIKELIHOOD_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Impact:</Label>
                    <Select
                      value={risk.impact}
                      onValueChange={(value: "Low" | "Medium" | "High") =>
                        updateRisk(risk.id, { impact: value })
                      }
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {IMPACT_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Entry/Action Plan */}
      <div className="space-y-2">
        <Label htmlFor="entry-plan" className="text-base font-semibold">
          Action Plan & Milestones
        </Label>
        <p className="text-sm text-muted-foreground">
          What are your key next steps and milestones for the first year?
        </p>
        <Textarea
          id="entry-plan"
          value={data.entryPlan}
          onChange={(e) => updateData({ entryPlan: e.target.value })}
          placeholder="List your key action items and milestones..."
          className="min-h-[150px]"
        />
      </div>
    </div>
  );
};

export default RisksPlanPhase;

