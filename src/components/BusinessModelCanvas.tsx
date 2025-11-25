import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CanvasData {
  keyPartners: string;
  keyActivities: string;
  keyResources: string;
  valuePropositions: string;
  customerRelationships: string;
  channels: string;
  customerSegments: string;
  costStructure: string;
  revenueStreams: string;
}

const BusinessModelCanvas = () => {
  const { toast } = useToast();
  const [data, setData] = useState<CanvasData>({
    keyPartners: "",
    keyActivities: "",
    keyResources: "",
    valuePropositions: "",
    customerRelationships: "",
    channels: "",
    customerSegments: "",
    costStructure: "",
    revenueStreams: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("businessModelCanvas");
    if (saved) {
      setData(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("businessModelCanvas", JSON.stringify(data));
    toast({
      title: "Saved successfully",
      description: "Your business model canvas has been saved",
    });
  };

  const updateField = (field: keyof CanvasData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Business Model Canvas</h2>
          <p className="text-muted-foreground mt-2">
            Define your business model using the Business Model Canvas framework
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Key Partners</CardTitle>
            <CardDescription>Who are your key partners and suppliers?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="List your key partnerships..."
              value={data.keyPartners}
              onChange={(e) => updateField("keyPartners", e.target.value)}
              className="min-h-[200px]"
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Key Activities</CardTitle>
            <CardDescription>What are your key activities?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Describe your key activities..."
              value={data.keyActivities}
              onChange={(e) => updateField("keyActivities", e.target.value)}
              className="min-h-[200px]"
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 border-2 border-primary">
          <CardHeader>
            <CardTitle className="text-lg">Value Propositions</CardTitle>
            <CardDescription>What value do you deliver to customers?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Describe your unique value proposition..."
              value={data.valuePropositions}
              onChange={(e) => updateField("valuePropositions", e.target.value)}
              className="min-h-[200px]"
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Customer Relationships</CardTitle>
            <CardDescription>How do you interact with customers?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Describe customer relationships..."
              value={data.customerRelationships}
              onChange={(e) => updateField("customerRelationships", e.target.value)}
              className="min-h-[200px]"
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Customer Segments</CardTitle>
            <CardDescription>Who are your target customers?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Define your customer segments..."
              value={data.customerSegments}
              onChange={(e) => updateField("customerSegments", e.target.value)}
              className="min-h-[200px]"
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Key Resources</CardTitle>
            <CardDescription>What resources do you need?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="List your key resources..."
              value={data.keyResources}
              onChange={(e) => updateField("keyResources", e.target.value)}
              className="min-h-[200px]"
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Channels</CardTitle>
            <CardDescription>How do you reach customers?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Describe your channels..."
              value={data.channels}
              onChange={(e) => updateField("channels", e.target.value)}
              className="min-h-[200px]"
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Cost Structure</CardTitle>
            <CardDescription>What are your main costs?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Detail your cost structure..."
              value={data.costStructure}
              onChange={(e) => updateField("costStructure", e.target.value)}
              className="min-h-[150px]"
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Revenue Streams</CardTitle>
            <CardDescription>How do you make money?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Describe your revenue streams..."
              value={data.revenueStreams}
              onChange={(e) => updateField("revenueStreams", e.target.value)}
              className="min-h-[150px]"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessModelCanvas;
