import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Save, Trash2, Download, Loader2, FileImage, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import BrandHeader from "./BrandHeader";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  category: string;
}

const Checklist = () => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    category: "General",
  });

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("checklist");
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem("checklist", JSON.stringify(items));
  }, [items]);

  const handleSave = () => {
    localStorage.setItem("checklist", JSON.stringify(items));
    toast({
      title: "Saved successfully",
      description: "Your checklist has been saved",
    });
  };

  const handleExportPNG = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById("checklist-content");
      if (!element) throw new Error("Checklist content not found");

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: document.documentElement.classList.contains("dark") ? "#0a0a0a" : "#ffffff",
      });

      const link = document.createElement("a");
      link.download = "task-checklist.png";
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast({
        title: "Export successful",
        description: "Checklist exported as PNG",
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export failed",
        description: "Failed to export as PNG",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById("checklist-content");
      if (!element) throw new Error("Checklist content not found");

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: document.documentElement.classList.contains("dark") ? "#0a0a0a" : "#ffffff",
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png");

      // If content is longer than one page, split it
      if (imgHeight > 297) {
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= 297;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= 297;
        }
      } else {
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      }

      pdf.save("task-checklist.pdf");

      toast({
        title: "Export successful",
        description: "Checklist exported as PDF",
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export failed",
        description: "Failed to export as PDF",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const addItem = () => {
    if (!newItem.title) {
      toast({
        title: "Title required",
        description: "Please enter a task title",
        variant: "destructive",
      });
      return;
    }

    const item: ChecklistItem = {
      id: Date.now().toString(),
      ...newItem,
      completed: false,
    };

    setItems([...items, item]);
    setNewItem({ title: "", description: "", category: "General" });
    toast({
      title: "Task added",
      description: "New task has been added to your checklist",
    });
  };

  const toggleItem = (id: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)));
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const getItemsByCategory = () => {
    const categories: { [key: string]: ChecklistItem[] } = {};
    items.forEach((item) => {
      const cat = item.category || "General";
      if (!categories[cat]) {
        categories[cat] = [];
      }
      categories[cat].push(item);
    });
    return categories;
  };

  const calculateProgress = () => {
    if (items.length === 0) return 0;
    const completed = items.filter((item) => item.completed).length;
    return Math.round((completed / items.length) * 100);
  };

  const categories = getItemsByCategory();
  const progress = calculateProgress();

  return (
    <div className="space-y-4 md:space-y-6">
      <BrandHeader />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Business Checklist</h2>
          <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
            Track tasks and milestones for your business journey
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isExporting} className="flex-1 sm:flex-none">
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
                    <span className="hidden sm:inline">Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Export</span>
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportPNG} disabled={isExporting}>
                <FileImage className="h-4 w-4 mr-2" />
                Export as PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF} disabled={isExporting}>
                <FileText className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleSave} className="flex-1 sm:flex-none">
            <Save className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Save</span>
          </Button>
        </div>
      </div>

      <div id="checklist-content">
      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
          <CardDescription>
            {items.filter((i) => i.completed).length} of {items.length} tasks completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-3" />
          <p className="text-center mt-2 text-sm font-semibold">{progress}%</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add New Task</CardTitle>
          <CardDescription>Create a task for your checklist</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Task title"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
            />
            <Input
              placeholder="Category (e.g., Product, Marketing)"
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            />
          </div>
          <Input
            placeholder="Description (optional)"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
          />
          <Button onClick={addItem}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(categories).map(([category, categoryItems]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{category}</CardTitle>
              <CardDescription>
                {categoryItems.filter((i) => i.completed).length} of {categoryItems.length} completed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {categoryItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                >
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => toggleItem(item.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <h4
                      className={`font-semibold ${
                        item.completed ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
        {Object.keys(categories).length === 0 && (
          <Card className="lg:col-span-2">
            <CardContent className="py-8 text-center text-muted-foreground">
              No tasks added yet. Create your first task above!
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </div>
  );
};

export default Checklist;
