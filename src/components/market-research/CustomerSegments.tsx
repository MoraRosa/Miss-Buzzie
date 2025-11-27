import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Users } from "lucide-react";
import { CustomerSegment } from "../MarketResearch";

interface CustomerSegmentsProps {
  segments: CustomerSegment[];
  onChange: (segments: CustomerSegment[]) => void;
}

const CustomerSegments = ({ segments, onChange }: CustomerSegmentsProps) => {
  const addSegment = () => {
    const newSegment: CustomerSegment = {
      id: Date.now().toString(),
      name: "",
      jtbd: "",
      buyingTriggers: "",
      procurementCycle: "",
      budget: "",
      quotes: "",
    };
    onChange([...segments, newSegment]);
  };

  const removeSegment = (id: string) => {
    onChange(segments.filter((s) => s.id !== id));
  };

  const updateSegment = (id: string, field: keyof CustomerSegment, value: string) => {
    onChange(
      segments.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  return (
    <AccordionItem value="customer-segments" className="border rounded-lg px-4 bg-card">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-base md:text-lg">Customer Segments & Jobs-to-Be-Done</h3>
            <p className="text-xs md:text-sm text-muted-foreground font-normal">
              Top segments, JTBD, buying triggers, and budgets
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-4 pb-6">
        <div className="space-y-4">
          {segments.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-4">No customer segments yet</p>
              <Button onClick={addSegment} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add First Segment
              </Button>
            </div>
          ) : (
            <>
              {segments.map((segment, index) => (
                <Card key={segment.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Segment {index + 1}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSegment(segment.id)}
                        aria-label={`Remove segment ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label htmlFor={`segment-name-${segment.id}`} className="text-sm font-medium mb-2 block">Segment Name</label>
                      <Input
                        id={`segment-name-${segment.id}`}
                        placeholder="e.g., Small Marketing Agencies"
                        value={segment.name}
                        onChange={(e) => updateSegment(segment.id, "name", e.target.value)}
                      />
                    </div>

                    <div>
                      <label htmlFor={`segment-jtbd-${segment.id}`} className="text-sm font-medium mb-2 block">
                        Jobs-to-Be-Done (JTBD)
                      </label>
                      <Textarea
                        id={`segment-jtbd-${segment.id}`}
                        placeholder="What job is this segment hiring your product to do?"
                        value={segment.jtbd}
                        onChange={(e) => updateSegment(segment.id, "jtbd", e.target.value)}
                        className="min-h-[80px]"
                      />
                    </div>

                    <div>
                      <label htmlFor={`segment-triggers-${segment.id}`} className="text-sm font-medium mb-2 block">Buying Triggers</label>
                      <Input
                        id={`segment-triggers-${segment.id}`}
                        placeholder="e.g., New client onboarding, team expansion"
                        value={segment.buyingTriggers}
                        onChange={(e) => updateSegment(segment.id, "buyingTriggers", e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor={`segment-cycle-${segment.id}`} className="text-sm font-medium mb-2 block">
                          Procurement Cycle
                        </label>
                        <Input
                          id={`segment-cycle-${segment.id}`}
                          placeholder="e.g., 2-4 weeks"
                          value={segment.procurementCycle}
                          onChange={(e) => updateSegment(segment.id, "procurementCycle", e.target.value)}
                        />
                      </div>

                      <div>
                        <label htmlFor={`segment-budget-${segment.id}`} className="text-sm font-medium mb-2 block">Typical Budget</label>
                        <Input
                          id={`segment-budget-${segment.id}`}
                          placeholder="e.g., $500-2000/month"
                          value={segment.budget}
                          onChange={(e) => updateSegment(segment.id, "budget", e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor={`segment-quotes-${segment.id}`} className="text-sm font-medium mb-2 block">
                        Buyer Quotes (3-5 verbatim quotes from credible sources)
                      </label>
                      <Textarea
                        id={`segment-quotes-${segment.id}`}
                        placeholder="Include actual quotes from potential buyers, customer interviews, or industry research"
                        value={segment.quotes}
                        onChange={(e) => updateSegment(segment.id, "quotes", e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button onClick={addSegment} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Another Segment
              </Button>
            </>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default CustomerSegments;

