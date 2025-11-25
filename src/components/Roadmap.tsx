import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BrandHeader from "./BrandHeader";

interface Milestone {
  id: string;
  title: string;
  description: string;
  timeframe: string;
  category: "1-year" | "5-year" | "10-year";
}

const Roadmap = () => {
  const { toast } = useToast();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    timeframe: "",
    category: "1-year" as Milestone["category"],
  });

  useEffect(() => {
    const saved = localStorage.getItem("roadmap");
    if (saved) {
      setMilestones(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("roadmap", JSON.stringify(milestones));
    toast({
      title: "Saved successfully",
      description: "Your roadmap has been saved",
    });
  };

  const addMilestone = () => {
    if (!newMilestone.title) {
      toast({
        title: "Title required",
        description: "Please enter a milestone title",
        variant: "destructive",
      });
      return;
    }

    const milestone: Milestone = {
      id: Date.now().toString(),
      ...newMilestone,
    };

    setMilestones([...milestones, milestone]);
    setNewMilestone({ title: "", description: "", timeframe: "", category: "1-year" });
    toast({
      title: "Milestone added",
      description: "Your milestone has been added to the roadmap",
    });
  };

  const removeMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const getMilestonesByCategory = (category: Milestone["category"]) => {
    return milestones.filter((m) => m.category === category);
  };

  return (
    <div className="space-y-6">
      <BrandHeader />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Roadmap Timeline</h2>
          <p className="text-muted-foreground mt-2">
            Plan your business milestones across 1-year, 5-year, and 10-year timeframes
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Milestone</CardTitle>
          <CardDescription>Create a milestone for your roadmap</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Milestone title"
              value={newMilestone.title}
              onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
            />
            <Input
              placeholder="Timeframe (e.g., Q1 2024)"
              value={newMilestone.timeframe}
              onChange={(e) => setNewMilestone({ ...newMilestone, timeframe: e.target.value })}
            />
          </div>
          <Input
            placeholder="Description"
            value={newMilestone.description}
            onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
          />
          <div className="flex gap-2">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={newMilestone.category}
              onChange={(e) =>
                setNewMilestone({ ...newMilestone, category: e.target.value as Milestone["category"] })
              }
            >
              <option value="1-year">1-Year Plan</option>
              <option value="5-year">5-Year Plan</option>
              <option value="10-year">10-Year Plan</option>
            </select>
            <Button onClick={addMilestone}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {(["1-year", "5-year", "10-year"] as const).map((category) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{category === "1-year" ? "1-Year" : category === "5-year" ? "5-Year" : "10-Year"} Plan</CardTitle>
              <CardDescription>
                {getMilestonesByCategory(category).length} milestone(s)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {getMilestonesByCategory(category).map((milestone) => (
                <div
                  key={milestone.id}
                  className="p-3 rounded-lg border bg-card space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{milestone.title}</h4>
                      {milestone.timeframe && (
                        <p className="text-sm text-muted-foreground">{milestone.timeframe}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMilestone(milestone.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {milestone.description && (
                    <p className="text-sm text-muted-foreground">{milestone.description}</p>
                  )}
                </div>
              ))}
              {getMilestonesByCategory(category).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No milestones yet. Add one above!
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Roadmap;
