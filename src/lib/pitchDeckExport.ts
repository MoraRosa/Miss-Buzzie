import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getBrandColors } from "./assetManager";

// pptxgenjs is dynamically imported only when needed (see exportPitchDeckAsPPTX)

/**
 * Export all pitch deck slides as a single PNG image (stacked vertically)
 */
export const exportPitchDeckAsPNG = async (filename: string) => {
  // Find the preview container with all slides
  const previewContainer = document.querySelector('[data-pitch-deck-preview]');
  
  if (!previewContainer) {
    throw new Error("Please switch to Preview mode before exporting");
  }

  try {
    const canvas = await html2canvas(previewContainer as HTMLElement, {
      scale: 2,
      useCORS: false,
      logging: false,
      backgroundColor: "#ffffff",
      allowTaint: true,
      imageTimeout: 0,
    });

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
      }
    });
  } catch (error) {
    console.error("PNG export error:", error);
    throw new Error("Failed to export as PNG. Please try again.");
  }
};

/**
 * Export pitch deck as multi-page PDF (one slide per page)
 */
export const exportPitchDeckAsPDF = async (filename: string) => {
  // Find all slide preview elements
  const slideElements = document.querySelectorAll('[data-slide-preview]');

  if (slideElements.length === 0) {
    throw new Error("Please switch to Preview mode before exporting");
  }

  const pdf = new jsPDF("landscape", "mm", "a4");
  const pageWidth = 297; // A4 landscape width in mm
  const pageHeight = 210; // A4 landscape height in mm
  let isFirstPage = true;

  try {
    for (let i = 0; i < slideElements.length; i++) {
      const slideElement = slideElements[i] as HTMLElement;

      const canvas = await html2canvas(slideElement, {
        scale: 2,
        useCORS: false,
        logging: false,
        backgroundColor: "#ffffff",
        allowTaint: true,
        imageTimeout: 0,
      });

      if (canvas.height === 0) {
        continue;
      }

      const imgData = canvas.toDataURL("image/png");

      if (!isFirstPage) {
        pdf.addPage();
      }
      isFirstPage = false;

      // Calculate dimensions to maintain aspect ratio
      const canvasAspectRatio = canvas.width / canvas.height;
      const pageAspectRatio = pageWidth / pageHeight;

      let imgWidth = pageWidth;
      let imgHeight = pageHeight;
      let xOffset = 0;
      let yOffset = 0;

      if (canvasAspectRatio > pageAspectRatio) {
        // Canvas is wider - fit to width
        imgHeight = pageWidth / canvasAspectRatio;
        yOffset = (pageHeight - imgHeight) / 2;
      } else {
        // Canvas is taller - fit to height
        imgWidth = pageHeight * canvasAspectRatio;
        xOffset = (pageWidth - imgWidth) / 2;
      }

      // Center the slide on the page with proper aspect ratio
      pdf.addImage(imgData, "PNG", xOffset, yOffset, imgWidth, imgHeight);
    }

    pdf.save(filename);
  } catch (error) {
    console.error("PDF export error:", error);
    throw new Error("Failed to export as PDF. Please try again.");
  }
};

interface SlideImage {
  url: string;
  size: 'small' | 'medium' | 'large' | 'full';
  alignment: 'left' | 'center' | 'right';
}

/**
 * Export pitch deck as PowerPoint (PPTX)
 * Uses dynamic import to load pptxgenjs only when needed (reduces initial bundle)
 */
export const exportPitchDeckAsPPTX = async (
  filename: string,
  slides: Array<{ title: string; content: string; images?: SlideImage[] }>,
  companyLogo?: string
) => {
  try {
    // Dynamic import - pptxgenjs is only loaded when this function is called
    const pptxgenModule = await import("pptxgenjs");
    const pptxgen = pptxgenModule.default;
    const pptx = new pptxgen();

    // Set presentation properties
    pptx.author = "Mizzie - Business Planning Made Simple";
    pptx.company = "Mizzie";
    pptx.subject = "Pitch Deck";
    pptx.title = slides[0]?.title || "Pitch Deck";

    // Define layout (16:9 aspect ratio)
    pptx.layout = "LAYOUT_16x9";

    // Get brand colors from Asset Manager
    const brandColors = getBrandColors();
    const primaryColor = brandColors.primary.replace('#', ''); // Remove # for pptxgen
    const secondaryColor = brandColors.secondary.replace('#', '');
    const accentColor = brandColors.accent.replace('#', '');
    const textColor = "1F2937"; // Dark gray
    const subtleColor = "6B7280"; // Medium gray

    for (let i = 0; i < slides.length; i++) {
      const slide = pptx.addSlide();
      const { title, content, images } = slides[i];
      const isTitleSlide = i === 0;
      const isContactSlide = title.toLowerCase().includes("contact");

      // Add gradient background
      slide.background = { fill: "F9FAFB" };

      // Add top accent bar with primary color
      slide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: "100%",
        h: 0.1,
        fill: { color: primaryColor },
        line: { type: "none" }
      });

      if (isTitleSlide) {
        // Title slide layout
        if (companyLogo) {
          // Add company logo (centered at top, maintaining aspect ratio)
          slide.addImage({
            data: companyLogo,
            x: "40%",
            y: "12%",
            sizing: { type: "contain", w: 1.5, h: 1.5 }
          });
        }

        // Company name (large, bold) - USE PRIMARY COLOR
        slide.addText(title || "Your Company Name", {
          x: "10%",
          y: companyLogo ? "30%" : "25%",
          w: "80%",
          h: "20%",
          fontSize: 44,
          bold: true,
          color: primaryColor,
          align: "center",
          valign: "middle",
        });

        // Accent divider line below company name
        slide.addShape(pptx.ShapeType.rect, {
          x: "42%",
          y: companyLogo ? "48%" : "43%",
          w: "16%",
          h: 0.08,
          fill: { color: accentColor },
          line: { type: "none" }
        });

        // Tagline (subtitle)
        if (content) {
          slide.addText(content, {
            x: "10%",
            y: companyLogo ? "52%" : "47%",
            w: "80%",
            h: "15%",
            fontSize: 24,
            color: subtleColor,
            align: "center",
            valign: "middle",
          });
        }
      } else if (isContactSlide) {
        // Contact slide layout - USE PRIMARY COLOR FOR TITLE
        slide.addText(title, {
          x: "10%",
          y: "10%",
          w: "80%",
          h: "15%",
          fontSize: 36,
          bold: true,
          color: primaryColor,
          align: "center",
        });

        // Accent divider line below title
        slide.addShape(pptx.ShapeType.rect, {
          x: "45%",
          y: "23%",
          w: "10%",
          h: 0.08,
          fill: { color: accentColor },
          line: { type: "none" }
        });

        // Split content by lines for contact info
        const lines = content.split("\n").filter(line => line.trim());
        const startY = 30;
        const lineHeight = 8;

        lines.forEach((line, index) => {
          slide.addText(line, {
            x: "20%",
            y: `${startY + (index * lineHeight)}%`,
            w: "60%",
            h: "8%",
            fontSize: 18,
            color: textColor,
            align: "center",
          });
        });
      } else {
        // Separate full-size background images from regular images
        const backgroundImage = images?.find(img => img.size === 'full');
        const regularImages = images?.filter(img => img.size !== 'full') || [];

        // Add background image if Full size is selected
        if (backgroundImage) {
          slide.addImage({
            data: backgroundImage.url,
            x: 0,
            y: 0,
            w: "100%",
            h: "100%"
            // No sizing property needed - w/h percentages fill the slide
          });

          // Add dark overlay for better text readability
          slide.addShape(pptx.ShapeType.rect, {
            x: 0,
            y: 0,
            w: "100%",
            h: "100%",
            fill: { color: "000000", transparency: 60 }, // 40% opacity black
            line: { type: "none" }
          });
        }

        // Standard content slide - USE PRIMARY COLOR FOR TITLE
        slide.addText(title, {
          x: "8%",
          y: "8%",
          w: "84%",
          h: "12%",
          fontSize: 32,
          bold: true,
          color: primaryColor,
          align: "left",
        });

        // Secondary color accent bar below title
        slide.addShape(pptx.ShapeType.rect, {
          x: "8%",
          y: "18%",
          w: "10%",
          h: 0.08,
          fill: { color: secondaryColor },
          line: { type: "none" }
        });

        // Determine layout based on content and regular images
        const hasRegularImages = regularImages.length > 0;

        // Calculate dynamic content height based on text length
        let estimatedContentHeight = 0;
        if (content) {
          const lines = content.split("\n").filter(line => line.trim());
          const lineCount = Math.max(lines.length, 1);
          // Each line takes ~5-6% of slide height, cap at reasonable max
          estimatedContentHeight = Math.min(lineCount * 5.5, hasRegularImages ? 30 : 60);
        }

        const contentHeight = estimatedContentHeight > 0 ? `${estimatedContentHeight}%` : "0%";
        const contentStartY = 25; // Content starts at 25%
        const contentEndY = contentHeight !== "0%" ? contentStartY + estimatedContentHeight : contentStartY;

        // Content area
        if (content) {
          // Check if content has bullet points
          const lines = content.split("\n").filter(line => line.trim());
          const hasBullets = lines.some(line => line.trim().startsWith("-") || line.trim().startsWith("•"));

          if (hasBullets) {
            // Format as bullet points with SECONDARY COLOR
            const bullets = lines.map(line => {
              const text = line.replace(/^[-•]\s*/, "").trim();
              return { text, options: { bullet: true } };
            });

            slide.addText(bullets, {
              x: "8%",
              y: `${contentStartY}%`,
              w: "84%",
              h: contentHeight as `${number}%`,
              fontSize: 18,
              color: textColor,
              bullet: { code: "2022" }, // Bullet character
            });
          } else {
            // Regular paragraph text
            slide.addText(content, {
              x: "8%",
              y: `${contentStartY}%`,
              w: "84%",
              h: contentHeight as `${number}%`,
              fontSize: 18,
              color: textColor,
              align: "left",
              valign: "top",
            });
          }
        }

        // Add regular images (non-full size) if present
        if (hasRegularImages) {
          // Start images right after content with small gap (2-3%)
          let currentY = content ? contentEndY + 3 : 25; // Start right after content + 3% gap, or 25% if no content

          regularImages.forEach((image) => {
            // Determine size in inches based on size setting (using contain to maintain aspect ratio)
            const sizeMap = {
              small: { w: 2.5, h: 2.5 },   // Small: 2.5" x 2.5" max (maintains aspect ratio)
              medium: { w: 4, h: 4 },       // Medium: 4" x 4" max (maintains aspect ratio)
              large: { w: 6, h: 6 },        // Large: 6" x 6" max (maintains aspect ratio)
              full: { w: 8, h: 8 }          // This won't be used since we filter out full-size images
            };
            const imageSize = sizeMap[image.size];

            // Determine x position based on alignment (in percentage for positioning)
            let xPos: string;
            if (image.alignment === 'left') {
              xPos = "8%";
            } else if (image.alignment === 'right') {
              xPos = "70%"; // Adjusted for right alignment
            } else { // center
              xPos = "30%"; // Centered
            }

            slide.addImage({
              data: image.url,
              x: xPos as `${number}%`,
              y: `${currentY}%`,
              sizing: { type: "contain", w: imageSize.w, h: imageSize.h } // Inch-based with contain maintains aspect ratio
            });

            // Move down for next image based on size
            // Estimate vertical space needed (in percentage) based on image size
            const verticalSpaceMap = {
              small: 20,   // Small images need ~20% vertical space
              medium: 25,  // Medium images need ~25% vertical space
              large: 30,   // Large images need ~30% vertical space
              full: 0      // Not used
            };
            currentY += verticalSpaceMap[image.size];
          });
        }
      }

      // Add bottom accent line with accent color
      slide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: "98%",
        w: "100%",
        h: 0.08,
        fill: { color: accentColor },
        line: { type: "none" }
      });

      // Add Mizzie bee logo in footer (using contain to maintain aspect ratio)
      slide.addImage({
        path: "public/images/logo.png", // Mizzie bee logo
        x: "2%",
        y: "91.5%",
        sizing: { type: "contain", w: 0.35, h: 0.35 } // Slightly smaller, maintains aspect ratio
      });

      // Add Mizzie text branding footer (subtle)
      slide.addText("Mizzie", {
        x: "5%",
        y: "92%",
        w: "15%",
        h: "5%",
        fontSize: 10,
        color: subtleColor,
      });

      // Add slide number with accent color
      slide.addText(`${i + 1}`, {
        x: "92%",
        y: "92%",
        w: "6%",
        h: "5%",
        fontSize: 10,
        color: accentColor,
        align: "right",
      });
    }

    // Save the presentation
    await pptx.writeFile({ fileName: filename });
  } catch (error) {
    console.error("PPTX export error:", error);
    throw new Error("Failed to export as PowerPoint. Please try again.");
  }
};

