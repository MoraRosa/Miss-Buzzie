import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Slide {
  title: string;
  content: string;
}

const defaultSlides: Slide[] = [
  { title: "Company Name & Tagline", content: "" },
  { title: "Problem", content: "" },
  { title: "Solution", content: "" },
  { title: "Market Opportunity", content: "" },
  { title: "Product/Service", content: "" },
  { title: "Business Model", content: "" },
  { title: "Traction & Milestones", content: "" },
  { title: "Competition", content: "" },
  { title: "Team", content: "" },
  { title: "Financial Projections", content: "" },
  { title: "Investment Ask", content: "" },
  { title: "Contact Information", content: "" },
];

const PitchDeck = () => {
  const { toast } = useToast();
  const [slides, setSlides] = useState<Slide[]>(defaultSlides);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("pitchDeck");
    if (saved) {
      setSlides(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("pitchDeck", JSON.stringify(slides));
    toast({
      title: "Saved successfully",
      description: "Your pitch deck has been saved",
    });
  };

  const updateSlide = (index: number, field: keyof Slide, value: string) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setSlides(newSlides);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Pitch Deck</h2>
          <p className="text-muted-foreground mt-2">
            Create a compelling pitch deck for investors and stakeholders
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
          disabled={currentSlide === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Slide {currentSlide + 1} of {slides.length}
        </span>
        <Button
          variant="outline"
          onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
          disabled={currentSlide === slides.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      <Card className="border-2">
        <CardHeader>
          <Input
            value={slides[currentSlide].title}
            onChange={(e) => updateSlide(currentSlide, "title", e.target.value)}
            className="text-2xl font-bold border-none p-0 h-auto"
            placeholder="Slide Title"
          />
          <CardDescription>Slide {currentSlide + 1}</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={slides[currentSlide].content}
            onChange={(e) => updateSlide(currentSlide, "content", e.target.value)}
            placeholder="Enter your slide content here..."
            className="min-h-[400px] text-base"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {slides.map((slide, index) => (
          <Button
            key={index}
            variant={currentSlide === index ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentSlide(index)}
            className="h-auto py-2 px-3 text-xs"
          >
            <div className="truncate w-full text-left">
              {index + 1}. {slide.title || "Untitled"}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default PitchDeck;
