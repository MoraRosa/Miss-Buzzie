import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, ChevronLeft, ChevronRight, Edit, Eye, Columns2, Download, FileImage, FileText, Presentation, Loader2, Image as ImageIcon, X, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import BrandHeader from "./BrandHeader";
import SlidePreview from "./SlidePreview";
import ImagePicker from "./ImagePicker";
import { exportPitchDeckAsPNG, exportPitchDeckAsPDF, exportPitchDeckAsPPTX } from "@/lib/pitchDeckExport";
import { getCompanyLogo } from "@/lib/assetManager";
import { PitchDeckDataSchema } from "@/lib/validators/schemas";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SlideImage {
  url: string;
  size: 'small' | 'medium' | 'large' | 'full';
  alignment: 'left' | 'center' | 'right';
}

interface Slide {
  title: string;
  content: string;
  images?: SlideImage[]; // Array of image objects with settings
}

type ViewMode = "edit" | "split" | "preview";

const defaultSlides: Slide[] = [
  { title: "", content: "" },
  { title: "", content: "" },
  { title: "", content: "" },
  { title: "", content: "" },
  { title: "", content: "" },
  { title: "", content: "" },
  { title: "", content: "" },
  { title: "", content: "" },
  { title: "", content: "" },
  { title: "", content: "" },
  { title: "", content: "" },
  { title: "", content: "" },
  { title: "", content: "" },
];

// Placeholder text for each slide
const slidePlaceholders = [
  { title: "Your Company Name", content: "Your tagline here" },
  { title: "Problem", content: "What problem are you solving?" },
  { title: "Solution", content: "How does your product/service solve it?" },
  { title: "Market Opportunity", content: "How big is the market?" },
  { title: "Product/Service", content: "What do you offer?" },
  { title: "Business Model", content: "How do you make money?" },
  { title: "Traction & Milestones", content: "What progress have you made?" },
  { title: "Competition", content: "Who are your competitors?" },
  { title: "Team", content: "Who is building this?" },
  { title: "Financial Projections", content: "What are your revenue projections?" },
  { title: "Investment Ask", content: "What are you asking for?" },
  { title: "Exit Strategy", content: "Timeline: 5-7 years\n\nPotential Acquirers:\n• Strategic buyers in industry\n• Private equity firms\n• Larger competitors\n\nExit Multiple: 5-10x revenue\n\nComparable Exits:\n• [Similar company] acquired for $XM" },
  { title: "Contact Information", content: "How can investors reach you?" },
];

const PitchDeck = () => {
  const { toast } = useToast();

  // Use validated localStorage hook with auto-save
  const [slides, setSlides, { save }] = useLocalStorage<Slide[]>(
    "pitchDeck",
    defaultSlides,
    { schema: PitchDeckDataSchema, debounceMs: 300 }
  );

  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("edit");
  const [companyLogo, setCompanyLogo] = useState<string | null>(getCompanyLogo());
  const [isExporting, setIsExporting] = useState(false);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);

  // Listen for company logo changes from Brand Manager
  useEffect(() => {
    const handleLogoChange = (event: CustomEvent<string>) => {
      setCompanyLogo(event.detail);
    };

    window.addEventListener('companyLogoChanged', handleLogoChange as EventListener);

    return () => {
      window.removeEventListener('companyLogoChanged', handleLogoChange as EventListener);
    };
  }, []);

  // Migrate existing users: add Exit Strategy slide (13th) if they only have 12 slides
  // This runs only on mount to perform one-time migration of legacy data
  useEffect(() => {
    if (slides.length === 12) {
      // Insert Exit Strategy before Contact (which was slide 12, now 13)
      setSlides(prevSlides => {
        const newSlides = [...prevSlides];
        newSlides.splice(11, 0, { title: "", content: "" }); // Insert at position 11 (0-indexed)
        return newSlides;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = () => {
    save();
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

  const addImageToSlide = (imageUrl: string) => {
    const newSlides = [...slides];
    const currentImages = newSlides[currentSlide].images || [];
    const newImage: SlideImage = {
      url: imageUrl,
      size: 'medium',
      alignment: 'center'
    };
    newSlides[currentSlide] = {
      ...newSlides[currentSlide],
      images: [...currentImages, newImage]
    };
    setSlides(newSlides);
    toast({
      title: "Image added",
      description: "Image has been added to the slide",
    });
  };

  const removeImageFromSlide = (slideIndex: number, imageIndex: number) => {
    const newSlides = [...slides];
    const currentImages = newSlides[slideIndex].images || [];
    newSlides[slideIndex] = {
      ...newSlides[slideIndex],
      images: currentImages.filter((_, i) => i !== imageIndex)
    };
    setSlides(newSlides);
  };

  const updateImageSettings = (slideIndex: number, imageIndex: number, settings: Partial<SlideImage>) => {
    const newSlides = [...slides];
    const currentImages = newSlides[slideIndex].images || [];
    currentImages[imageIndex] = { ...currentImages[imageIndex], ...settings };
    newSlides[slideIndex] = {
      ...newSlides[slideIndex],
      images: currentImages
    };
    setSlides(newSlides);
  };

  const reorderImages = (slideIndex: number, fromIndex: number, toIndex: number) => {
    const newSlides = [...slides];
    const currentImages = [...(newSlides[slideIndex].images || [])];
    const [movedImage] = currentImages.splice(fromIndex, 1);
    currentImages.splice(toIndex, 0, movedImage);
    newSlides[slideIndex] = {
      ...newSlides[slideIndex],
      images: currentImages
    };
    setSlides(newSlides);
  };

  // Drag & Drop handlers for images from Brand Assets
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    const imageUrl = e.dataTransfer.getData('image/url');
    if (imageUrl) {
      addImageToSlide(imageUrl);
    }
  };

  // Drag & Drop handlers for reordering images within a slide
  const handleImageDragStart = (e: React.DragEvent, index: number) => {
    setDraggedImageIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedImageIndex !== null && draggedImageIndex !== index) {
      reorderImages(currentSlide, draggedImageIndex, index);
      setDraggedImageIndex(index);
    }
  };

  const handleImageDragEnd = () => {
    setDraggedImageIndex(null);
  };

  // Generate filename from company name
  const generateFilename = (extension: string) => {
    const companyName = slides[0]?.title || "pitch-deck";
    const sanitized = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
    return sanitized ? `${sanitized}.${extension}` : `mizzie-pitch-deck.${extension}`;
  };



  const handleExportPNG = async () => {
    if (viewMode !== "preview") {
      toast({
        title: "Switch to Preview mode",
        description: "Please switch to Preview mode before exporting",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    toast({
      title: "Exporting...",
      description: "Creating PNG image of your pitch deck...",
    });

    try {
      const filename = generateFilename("png");
      await exportPitchDeckAsPNG(filename);
      toast({
        title: "✅ Export successful!",
        description: `Exported as ${filename}`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (viewMode !== "preview") {
      toast({
        title: "Switch to Preview mode",
        description: "Please switch to Preview mode before exporting",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    toast({
      title: "Exporting...",
      description: "Creating multi-page PDF (this may take a moment)...",
    });

    try {
      const filename = generateFilename("pdf");
      await exportPitchDeckAsPDF(filename);
      toast({
        title: "✅ Export successful!",
        description: `Exported as ${filename}`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPPTX = async () => {
    setIsExporting(true);
    toast({
      title: "Exporting...",
      description: "Creating PowerPoint presentation...",
    });

    try {
      const filename = generateFilename("pptx");
      await exportPitchDeckAsPPTX(filename, slides, companyLogo || undefined);
      toast({
        title: "✅ Export successful!",
        description: `Exported as ${filename}`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
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
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={handleSave} className="flex-1 sm:flex-none">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" className="flex-1 sm:flex-none" disabled={isExporting}>
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export
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
              <DropdownMenuItem onClick={handleExportPPTX} disabled={isExporting}>
                <Presentation className="h-4 w-4 mr-2" />
                Export as PowerPoint
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 border rounded-lg p-1 bg-muted/50">
          <Button
            variant={viewMode === "edit" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("edit")}
            className="flex-1 sm:flex-none"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant={viewMode === "split" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("split")}
            className="flex-1 sm:flex-none"
          >
            <Columns2 className="h-4 w-4 mr-2" />
            Split
          </Button>
          <Button
            variant={viewMode === "preview" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("preview")}
            className="flex-1 sm:flex-none"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
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
      </div>

      {/* Main Content Area - Changes based on view mode */}
      {viewMode === "edit" && (
        <Card
          className={`border-2 transition-colors ${isDraggingOver ? 'border-primary bg-primary/5' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardHeader className="pb-3">
            <Input
              value={slides[currentSlide].title}
              onChange={(e) => updateSlide(currentSlide, "title", e.target.value)}
              className="text-lg md:text-2xl font-bold border-none p-0 h-auto"
              placeholder={slidePlaceholders[currentSlide].title}
            />
            <CardDescription className="text-xs md:text-sm">
              Slide {currentSlide + 1} • Drag images from Brand Assets here
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={slides[currentSlide].content}
              onChange={(e) => updateSlide(currentSlide, "content", e.target.value)}
              placeholder={slidePlaceholders[currentSlide].content}
              className="min-h-[300px] md:min-h-[400px] text-sm md:text-base"
            />

            {/* Image Management */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Images</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setImagePickerOpen(true)}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Insert Image
                </Button>
              </div>

              {slides[currentSlide].images && slides[currentSlide].images!.length > 0 && (
                <div className="space-y-3">
                  {slides[currentSlide].images!.map((image, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-3 space-y-3 cursor-move transition-all ${draggedImageIndex === index ? 'opacity-50 scale-95' : ''}`}
                      draggable={true}
                      onDragStart={(e) => handleImageDragStart(e, index)}
                      onDragOver={(e) => handleImageDragOver(e, index)}
                      onDragEnd={handleImageDragEnd}
                    >
                      <div className="flex gap-3">
                        {/* Drag Handle */}
                        <div className="flex items-center text-muted-foreground">
                          <GripVertical className="h-5 w-5" />
                        </div>

                        {/* Image Preview */}
                        <div className="relative group w-32 h-20 rounded overflow-hidden border-2 border-border flex-shrink-0">
                          <img
                            src={image.url}
                            alt={`Slide image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => removeImageFromSlide(currentSlide, index)}
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Controls */}
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Size</label>
                            <Select
                              value={image.size}
                              onValueChange={(value) => updateImageSettings(currentSlide, index, { size: value as SlideImage['size'] })}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="small">Small</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="large">Large</SelectItem>
                                <SelectItem value="full">Full Width</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Alignment</label>
                            <Select
                              value={image.alignment}
                              onValueChange={(value) => updateImageSettings(currentSlide, index, { alignment: value as SlideImage['alignment'] })}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="left">Left</SelectItem>
                                <SelectItem value="center">Center</SelectItem>
                                <SelectItem value="right">Right</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === "split" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Edit Panel */}
          <Card
            className={`border-2 transition-colors ${isDraggingOver ? 'border-primary bg-primary/5' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">Edit</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Slide {currentSlide + 1} • Drag images here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  value={slides[currentSlide].title}
                  onChange={(e) => updateSlide(currentSlide, "title", e.target.value)}
                  placeholder={slidePlaceholders[currentSlide].title}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Content</label>
                <Textarea
                  value={slides[currentSlide].content}
                  onChange={(e) => updateSlide(currentSlide, "content", e.target.value)}
                  placeholder={slidePlaceholders[currentSlide].content}
                  className="min-h-[150px] text-sm"
                />
              </div>

              {/* Image Management */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Images</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setImagePickerOpen(true)}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Insert
                  </Button>
                </div>

                {slides[currentSlide].images && slides[currentSlide].images!.length > 0 && (
                  <div className="space-y-2">
                    {slides[currentSlide].images!.map((image, index) => (
                      <div
                        key={index}
                        className={`border rounded p-2 space-y-2 cursor-move transition-all ${draggedImageIndex === index ? 'opacity-50 scale-95' : ''}`}
                        draggable={true}
                        onDragStart={(e) => handleImageDragStart(e, index)}
                        onDragOver={(e) => handleImageDragOver(e, index)}
                        onDragEnd={handleImageDragEnd}
                      >
                        <div className="flex gap-2">
                          {/* Drag Handle */}
                          <div className="flex items-center text-muted-foreground">
                            <GripVertical className="h-4 w-4" />
                          </div>

                          {/* Image Preview */}
                          <div className="relative group w-20 h-14 rounded overflow-hidden border flex-shrink-0">
                            <img
                              src={image.url}
                              alt={`Image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => removeImageFromSlide(currentSlide, index)}
                              className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </div>

                          {/* Controls */}
                          <div className="flex-1 grid grid-cols-2 gap-1.5">
                            <div>
                              <label className="text-[10px] text-muted-foreground mb-0.5 block">Size</label>
                              <Select
                                value={image.size}
                                onValueChange={(value) => updateImageSettings(currentSlide, index, { size: value as SlideImage['size'] })}
                              >
                                <SelectTrigger className="h-7 text-[11px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="small">Small</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="large">Large</SelectItem>
                                  <SelectItem value="full">Full</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="text-[10px] text-muted-foreground mb-0.5 block">Align</label>
                              <Select
                                value={image.alignment}
                                onValueChange={(value) => updateImageSettings(currentSlide, index, { alignment: value as SlideImage['alignment'] })}
                              >
                                <SelectTrigger className="h-7 text-[11px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="left">Left</SelectItem>
                                  <SelectItem value="center">Center</SelectItem>
                                  <SelectItem value="right">Right</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground px-1">Preview</div>
            <SlidePreview
              title={slides[currentSlide].title}
              content={slides[currentSlide].content}
              slideNumber={currentSlide + 1}
              totalSlides={slides.length}
              companyLogo={companyLogo ?? undefined}
              images={slides[currentSlide].images}
            />
          </div>
        </div>
      )}

      {viewMode === "preview" && (
        <div className="space-y-1 bg-muted/30 p-4 rounded-lg" data-pitch-deck-preview>
          <div className="text-center mb-6 pb-4 border-b">
            <h3 className="text-lg font-semibold text-foreground">Full Pitch Deck Preview</h3>
            <p className="text-sm text-muted-foreground">Scroll to view all {slides.length} slides • Presentation Mode</p>
          </div>
          <div className="space-y-1 max-w-5xl mx-auto">
            {slides.map((slide, index) => (
              <div key={index} data-slide-preview>
                <SlidePreview
                  title={slide.title}
                  content={slide.content}
                  slideNumber={index + 1}
                  totalSlides={slides.length}
                  companyLogo={companyLogo ?? undefined}
                  images={slide.images}
                />
              </div>
            ))}
          </div>
          <div className="text-center mt-6 pt-4 border-t text-sm text-muted-foreground">
            End of Presentation
          </div>
        </div>
      )}

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

      {/* Image Picker Modal */}
      <ImagePicker
        open={imagePickerOpen}
        onOpenChange={setImagePickerOpen}
        onSelectImage={addImageToSlide}
      />
    </div>
  );
};

export default PitchDeck;
