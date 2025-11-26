import { useState, useEffect } from "react";
import { getBrandColors, BrandColors } from "@/lib/assetManager";

interface SlideImage {
  url: string;
  size: 'small' | 'medium' | 'large' | 'full';
  alignment: 'left' | 'center' | 'right';
}

interface SlidePreviewProps {
  title: string;
  content: string;
  slideNumber: number;
  totalSlides: number;
  companyLogo?: string;
  images?: SlideImage[];
}

const SlidePreview = ({ title, content, slideNumber, totalSlides, companyLogo, images }: SlidePreviewProps) => {
  // Determine slide type based on title for different layouts
  const isTitleSlide = slideNumber === 1;
  const isContactSlide = title.toLowerCase().includes("contact");

  // Get brand colors with live updates
  const [brandColors, setBrandColors] = useState<BrandColors>(getBrandColors());

  useEffect(() => {
    // Listen for brand color changes
    const handleColorChange = (event: CustomEvent<BrandColors>) => {
      setBrandColors(event.detail);
    };

    window.addEventListener('brandColorsChanged', handleColorChange as EventListener);

    return () => {
      window.removeEventListener('brandColorsChanged', handleColorChange as EventListener);
    };
  }, []);

  // Separate full-size background images from regular images
  const backgroundImage = images?.find(img => img.size === 'full');
  const regularImages = images?.filter(img => img.size !== 'full') || [];

  return (
    <div className="w-full aspect-[16/9] bg-white dark:bg-gray-900 border shadow-lg rounded-sm flex flex-col relative overflow-hidden">
      {/* Background image if Full size is selected */}
      {backgroundImage && (
        <>
          <img
            src={backgroundImage.url}
            alt="Slide background"
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
          {/* Dark overlay for dark mode only */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50 dark:block hidden z-0" />
        </>
      )}
      {/* Decorative elements with brand colors - only show if no background image */}
      {!backgroundImage && (
        <>
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10"
            style={{ backgroundColor: brandColors.primary }}
          />
          <div
            className="absolute bottom-0 left-0 w-24 h-24 rounded-full blur-2xl opacity-10"
            style={{ backgroundColor: brandColors.accent }}
          />
        </>
      )}

      {/* Top accent bar with primary color */}
      <div
        className="absolute top-0 left-0 right-0 h-2 z-10"
        style={{ backgroundColor: brandColors.primary }}
      />

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-12 relative z-20">
        {isTitleSlide ? (
          // Title slide layout
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-6">
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt="Company Logo"
                  className="h-16 w-16 md:h-20 md:w-20 object-contain"
                />
              ) : (
                <div
                  className="h-16 w-16 md:h-20 md:w-20 border-2 border-dashed rounded-lg flex items-center justify-center"
                  style={{ borderColor: `${brandColors.primary}40` }}
                >
                  <span className="text-xs" style={{ color: `${brandColors.primary}80` }}>Logo</span>
                </div>
              )}
            </div>
            <h1
              className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight"
              style={{ color: brandColors.primary }}
            >
              {title || <span className="text-muted-foreground/40">Your Company Name</span>}
            </h1>
            <div
              className="h-1 w-24 mx-auto rounded-full"
              style={{ backgroundColor: brandColors.accent }}
            />
            <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              {content || <span className="text-muted-foreground/40">Your tagline here</span>}
            </p>
          </div>
        ) : isContactSlide ? (
          // Contact slide layout
          <div className="text-center space-y-6 w-full max-w-2xl">
            <h2
              className="text-3xl md:text-4xl font-bold mb-8"
              style={{ color: brandColors.primary }}
            >
              {title}
            </h2>
            <div
              className="h-1 w-16 mx-auto rounded-full mb-6"
              style={{ backgroundColor: brandColors.accent }}
            />
            <div className="text-left space-y-3 text-base md:text-lg text-muted-foreground whitespace-pre-wrap">
              {content || "Add your contact information here..."}
            </div>
          </div>
        ) : (
          // Standard content slide layout
          <div className="w-full h-full flex flex-col">
            <div className="mb-4">
              <h2
                className="text-2xl md:text-4xl font-bold"
                style={{ color: brandColors.primary }}
              >
                {title}
              </h2>
              <div
                className="h-1 w-16 mt-3 rounded-full"
                style={{ backgroundColor: brandColors.secondary }}
              />
            </div>
            <div className="flex-1 overflow-auto space-y-4">
              {content && (
                <p className="text-sm md:text-lg text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {content}
                </p>
              )}

              {/* Display regular images (non-full size) */}
              {regularImages.length > 0 && (
                <div className="space-y-3">
                  {regularImages.map((image, index) => {
                    // Determine width based on size
                    const sizeClasses = {
                      small: 'max-w-xs',
                      medium: 'max-w-md',
                      large: 'max-w-2xl',
                      full: 'w-full'
                    };

                    // Determine alignment
                    const alignmentClasses = {
                      left: 'mr-auto',
                      center: 'mx-auto',
                      right: 'ml-auto'
                    };

                    return (
                      <div
                        key={index}
                        className={`rounded-lg overflow-hidden border border-border/50 ${sizeClasses[image.size]} ${alignmentClasses[image.alignment]}`}
                      >
                        <img
                          src={image.url}
                          alt={`Slide image ${index + 1}`}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {!content && (!images || images.length === 0) && (
                <p className="text-sm md:text-lg text-muted-foreground/40">
                  Add your content here...
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer with slide number */}
      <div className="absolute bottom-4 right-6 text-xs text-muted-foreground/60 z-30">
        {slideNumber} / {totalSlides}
      </div>

      {/* Mizzie branding */}
      <div className="absolute bottom-4 left-6 flex items-center gap-2 text-xs text-muted-foreground/60 z-30">
        <img
          src="/Miss-Buzzie/images/logo.png"
          alt="Mizzie"
          className="h-4 w-4 object-contain opacity-50"
        />
        <span>Mizzie</span>
      </div>
    </div>
  );
};

export default SlidePreview;

