/**
 * Phase 10: Risks & Plan
 *
 * Captures risk assessment, experiments for validation, and entry/action plan.
 * Experiments are low-cost tests to validate assumptions before fully committing.
 * They flow to the Tasks tab for tracking but are NOT included in formal business plan exports.
 */

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Beaker, ChevronDown, ChevronUp } from "lucide-react";
import { PhaseProps } from "../types";
import { generateId } from "../utils";
import { Risk, Experiment } from "@/lib/validators/schemas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

const LIKELIHOOD_OPTIONS = ["Low", "Medium", "High"] as const;
const IMPACT_OPTIONS = ["Low", "Medium", "High"] as const;

const RisksPlanPhase = ({ data, updateData }: PhaseProps) => {
  const [experimentsOpen, setExperimentsOpen] = useState(true);

  // Risk handlers
  const addRisk = () => {
    const newRisk: Risk = {
      id: generateId("risk"),
      description: "",
      likelihood: "Medium",
      impact: "Medium",
    };
    updateData({ risks: [...data.risks, newRisk] });
  };

  // Experiment handlers
  const addExperiment = () => {
    const newExperiment: Experiment = {
      id: generateId("exp"),
      name: "",
      description: "",
      costRange: "",
    };
    updateData({ experiments: [...(data.experiments || []), newExperiment] });
  };

  const updateExperiment = (id: string, updates: Partial<Experiment>) => {
    updateData({
      experiments: (data.experiments || []).map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    });
  };

  const removeExperiment = (id: string) => {
    updateData({
      experiments: (data.experiments || []).filter((e) => e.id !== id),
    });
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

      {/* Experiments - Validation Tests */}
      <Collapsible open={experimentsOpen} onOpenChange={setExperimentsOpen}>
        <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
          <CollapsibleTrigger asChild>
            <div className="p-4 cursor-pointer hover:bg-primary/10 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Beaker className="h-5 w-5 text-primary" />
                  <div>
                    <Label className="text-base font-semibold cursor-pointer">
                      🧪 Validation Experiments
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Low-cost tests to validate assumptions before fully committing
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    → Auto-added to Tasks
                  </span>
                  {experimentsOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3">
              {(data.experiments || []).length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No experiments yet. Add quick tests like:</p>
                  <p className="text-xs mt-1 italic">
                    "Customer interviews - $0" • "Landing page test - $50" • "Pop-up shop - $500"
                  </p>
                </div>
              ) : (
                (data.experiments || []).map((exp) => (
                  <Card key={exp.id} className="p-3 space-y-2 bg-background">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                        <Input
                          value={exp.name}
                          onChange={(e) =>
                            updateExperiment(exp.id, { name: e.target.value })
                          }
                          placeholder="Experiment name"
                          className="md:col-span-2"
                        />
                        <Input
                          value={exp.costRange}
                          onChange={(e) =>
                            updateExperiment(exp.id, { costRange: e.target.value })
                          }
                          placeholder="Cost (e.g., $0-50)"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExperiment(exp.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <Textarea
                      value={exp.description}
                      onChange={(e) =>
                        updateExperiment(exp.id, { description: e.target.value })
                      }
                      placeholder="What are you testing? What would success look like?"
                      className="min-h-[60px] text-sm"
                    />
                  </Card>
                ))
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={addExperiment}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Experiment
              </Button>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};

export default RisksPlanPhase;

