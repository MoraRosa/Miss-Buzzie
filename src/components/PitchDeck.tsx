import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BrandHeader from "./BrandHeader";

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
    <div className="space-y-4 md:space-y-6">
      <BrandHeader />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Pitch Deck</h2>
          <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
            Create a compelling pitch deck for investors and stakeholders
          </p>
        </div>
        <Button onClick={handleSave} className="w-full sm:w-auto">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
          disabled={currentSlide === 0}
          className="h-9 px-2 md:px-4"
        >
          <ChevronLeft className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Previous</span>
        </Button>
        <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">
          Slide {currentSlide + 1} of {slides.length}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
          disabled={currentSlide === slides.length - 1}
          className="h-9 px-2 md:px-4"
        >
          <span className="hidden md:inline">Next</span>
          <ChevronRight className="h-4 w-4 md:ml-2" />
        </Button>
      </div>

      <Card className="border-2">
        <CardHeader className="pb-3">
          <Input
            value={slides[currentSlide].title}
            onChange={(e) => updateSlide(currentSlide, "title", e.target.value)}
            className="text-lg md:text-2xl font-bold border-none p-0 h-auto"
            placeholder="Slide Title"
          />
          <CardDescription className="text-xs md:text-sm">Slide {currentSlide + 1}</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={slides[currentSlide].content}
            onChange={(e) => updateSlide(currentSlide, "content", e.target.value)}
            placeholder="Enter your slide content here..."
            className="min-h-[300px] md:min-h-[400px] text-sm md:text-base"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5 md:gap-2">
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
