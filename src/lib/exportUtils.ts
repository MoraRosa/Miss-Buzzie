import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  ImportDataSchema,
  CanvasDataSchema,
  PitchDeckDataSchema,
  RoadmapDataSchema,
  OrgChartDataSchema,
  ChecklistDataSchema,
  ForecastDataSchema,
  AssetsDataSchema,
  MarketResearchDataSchema,
  SWOTDataSchema,
  PortersDataSchema,
  NameCheckerDataSchema,
  validateDataItem,
} from "./validators/schemas";

export const exportAllTabsToPDF = async (filename: string) => {
  // Get all tab content elements
  const tabContents = document.querySelectorAll('[role="tabpanel"]');
  if (tabContents.length === 0) {
    throw new Error("No tab content found");
  }

  console.log(`Found ${tabContents.length} tabs to export`);

  const pdf = new jsPDF("p", "mm", "a4");
  const imgWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  let isFirstPage = true;

  // Create a temporary container for rendering
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '0';
  tempContainer.style.width = '1200px';
  tempContainer.style.backgroundColor = '#ffffff';
  tempContainer.style.padding = '20px';
  document.body.appendChild(tempContainer);

  try {
    // Export each tab to a separate page
    for (let i = 0; i < tabContents.length; i++) {
      const tabContent = tabContents[i] as HTMLElement;

      try {
        console.log(`Capturing tab ${i + 1}/${tabContents.length}...`);

        // Clone the tab content
        const clone = tabContent.cloneNode(true) as HTMLElement;

        // Force visibility on clone
        clone.style.display = 'block';
        clone.style.visibility = 'visible';
        clone.style.opacity = '1';
        clone.style.height = 'auto';
        clone.style.overflow = 'visible';
        clone.style.position = 'static';
        clone.removeAttribute('data-state');
        clone.removeAttribute('hidden');

        // Add clone to temp container
        tempContainer.innerHTML = '';
        tempContainer.appendChild(clone);

        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 300));

        const canvas = await html2canvas(tempContainer, {
          scale: 2,
          useCORS: false,
          logging: false,
          backgroundColor: "#ffffff",
          allowTaint: true,
          imageTimeout: 0,
        });

        console.log(`Tab ${i + 1} canvas size: ${canvas.width}x${canvas.height}`);

        // Skip if canvas has no height (empty tab)
        if (canvas.height === 0) {
          console.warn(`Tab ${i + 1} has no content, skipping...`);
          continue;
        }

        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const imgData = canvas.toDataURL("image/png");

        // Validate the image data
        if (!imgData || imgData === 'data:,') {
          console.warn(`Tab ${i + 1} generated invalid image data, skipping...`);
          continue;
        }

        let heightLeft = imgHeight;
        let position = 0;

        // Start each tab on a new page (except the first one)
        if (!isFirstPage) {
          pdf.addPage();
        }
        isFirstPage = false;

        // Add first page of this tab
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Add additional pages if content is taller than one page
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      } catch (error) {
        console.error(`Error exporting tab ${i + 1}:`, error);
        // Continue with next tab even if one fails
      }
    }

    console.log("PDF generation complete!");
    pdf.save(filename);
  } catch (error) {
    console.error("PDF export error:", error);
    throw new Error("Failed to generate PDF. Please try again.");
  } finally {
    // Remove temporary container
    document.body.removeChild(tempContainer);
  }
};

export const exportToPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("Element not found");
  }

  // Show all content by temporarily removing height restrictions
  const originalOverflow = element.style.overflow;
  const originalHeight = element.style.height;
  element.style.overflow = "visible";
  element.style.height = "auto";

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      allowTaint: true,
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    const pdf = new jsPDF("p", "mm", "a4");
    let position = 0;

    // Add first page
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } finally {
    // Restore original styles
    element.style.overflow = originalOverflow;
    element.style.height = originalHeight;
  }
};

export const exportAllTabsToImage = async (filename: string) => {
  // Get all tab content elements
  const tabContents = document.querySelectorAll('[role="tabpanel"]');
  if (tabContents.length === 0) {
    throw new Error("No tab content found");
  }

  // Store original display styles
  const originalStyles = Array.from(tabContents).map(el => ({
    element: el as HTMLElement,
    display: (el as HTMLElement).style.display,
    dataState: el.getAttribute('data-state')
  }));

  try {
    // Make all tabs visible temporarily
    tabContents.forEach(el => {
      (el as HTMLElement).style.display = "block";
      el.setAttribute('data-state', 'active');
    });

    // Create container for all tabs
    const container = document.createElement('div');
    container.style.padding = '20px';
    container.style.backgroundColor = '#ffffff';

    // Clone all tab contents into container
    tabContents.forEach((tab, index) => {
      const clone = (tab as HTMLElement).cloneNode(true) as HTMLElement;
      if (index > 0) {
        const separator = document.createElement('div');
        separator.style.height = '40px';
        separator.style.borderTop = '2px solid #e5e7eb';
        separator.style.margin = '40px 0';
        container.appendChild(separator);
      }
      container.appendChild(clone);
    });

    document.body.appendChild(container);

    // Wait for render and images to load
    await new Promise(resolve => setTimeout(resolve, 500));

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: false,
      logging: false,
      backgroundColor: "#ffffff",
      allowTaint: true,
      imageTimeout: 0,
      removeContainer: true,
    });

    // Remove temporary container
    document.body.removeChild(container);

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
    console.error("Image export error:", error);
    throw new Error("Failed to generate image. Please try again.");
  } finally {
    // Restore original styles
    originalStyles.forEach(({ element, display, dataState }) => {
      element.style.display = display;
      if (dataState) {
        element.setAttribute('data-state', dataState);
      }
    });
  }
};

export const exportToImage = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("Element not found");
  }

  // Show all content
  const originalOverflow = element.style.overflow;
  const originalHeight = element.style.height;
  element.style.overflow = "visible";
  element.style.height = "auto";

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
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
  } finally {
    // Restore original styles
    element.style.overflow = originalOverflow;
    element.style.height = originalHeight;
  }
};

export const exportAllData = () => {
  const data = {
    canvas: localStorage.getItem("businessModelCanvas"),
    pitchDeck: localStorage.getItem("pitchDeck"),
    roadmap: localStorage.getItem("roadmap"),
    orgChart: localStorage.getItem("orgChart"),
    checklist: localStorage.getItem("checklist"),
    forecasting: localStorage.getItem("forecasting"),
    brandAssets: localStorage.getItem("brandAssets"),
    marketResearch: localStorage.getItem("marketResearch"),
    swot: localStorage.getItem("swotAnalysis"),
    porters: localStorage.getItem("portersFiveForces"),
    nameChecker: localStorage.getItem("nameChecker"),
    exportDate: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `business-plan-backup-${new Date().toISOString().split("T")[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);

  return data;
};

export interface ImportResult {
  success: boolean;
  imported: string[];
  skipped: string[];
  errors: string[];
}

export const importAllData = (file: File): Promise<ImportResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawData = JSON.parse(event.target?.result as string);

        // Validate the overall import structure
        const importValidation = ImportDataSchema.safeParse(rawData);
        if (!importValidation.success) {
          reject(new Error("Invalid backup file format. Please use a valid Mizzie backup file."));
          return;
        }

        const data = importValidation.data;
        const result: ImportResult = {
          success: true,
          imported: [],
          skipped: [],
          errors: [],
        };

        // Define validation mappings with explicit schema types
        const validationMap = [
          { key: "canvas" as const, storageKey: "businessModelCanvas", schema: CanvasDataSchema, name: "Business Model Canvas" },
          { key: "pitchDeck" as const, storageKey: "pitchDeck", schema: PitchDeckDataSchema, name: "Pitch Deck" },
          { key: "roadmap" as const, storageKey: "roadmap", schema: RoadmapDataSchema, name: "Roadmap" },
          { key: "orgChart" as const, storageKey: "orgChart", schema: OrgChartDataSchema, name: "Org Chart" },
          { key: "checklist" as const, storageKey: "checklist", schema: ChecklistDataSchema, name: "Checklist" },
          { key: "forecasting" as const, storageKey: "forecasting", schema: ForecastDataSchema, name: "Forecasting" },
          { key: "brandAssets" as const, storageKey: "brandAssets", schema: AssetsDataSchema, name: "Brand Assets" },
          { key: "marketResearch" as const, storageKey: "marketResearch", schema: MarketResearchDataSchema, name: "Market Research" },
          { key: "swot" as const, storageKey: "swot", schema: SWOTDataSchema, name: "SWOT Analysis" },
          { key: "porters" as const, storageKey: "porters", schema: PortersDataSchema, name: "Porter's Five Forces" },
          { key: "nameChecker" as const, storageKey: "nameChecker", schema: NameCheckerDataSchema, name: "Name Checker" },
        ];

        // Validate and import each data item
        for (const { key, storageKey, schema, name } of validationMap) {
          const rawValue = data[key];
          if (!rawValue) {
            continue; // Skip if not present in import
          }

          const validation = validateDataItem(rawValue, schema as Parameters<typeof validateDataItem>[1]);
          if (validation.success) {
            localStorage.setItem(storageKey, rawValue);
            result.imported.push(name);
          } else {
            result.skipped.push(name);
            result.errors.push(`${name}: ${validation.error}`);
          }
        }

        // If nothing was imported, consider it a failure
        if (result.imported.length === 0) {
          result.success = false;
        }

        resolve(result);
      } catch (error) {
        reject(new Error("Failed to parse backup file. The file may be corrupted."));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
};
