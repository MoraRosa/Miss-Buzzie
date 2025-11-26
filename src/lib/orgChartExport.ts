import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Role {
  id: string;
  title: string;
  department: string;
  responsibilities: string;
  reportsTo: string;
}

// Generate filename based on company name or default
const generateFilename = (extension: string): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  return `mizzie-org-chart-${timestamp}.${extension}`;
};

// Export as PNG (respects user's theme)
export const exportOrgChartAsPNG = async (): Promise<void> => {
  const element = document.querySelector('[data-org-chart-preview]') as HTMLElement;
  if (!element) {
    throw new Error("Org chart preview not found");
  }

  // Detect if user is in dark mode
  const isDarkMode = document.documentElement.classList.contains('dark');

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: isDarkMode ? "#0a0a0a" : "#ffffff", // Respect theme
    logging: false,
  });

  const link = document.createElement("a");
  link.download = generateFilename("png");
  link.href = canvas.toDataURL("image/png");
  link.click();
};

// Export as PDF (respects user's theme)
export const exportOrgChartAsPDF = async (): Promise<void> => {
  const element = document.querySelector('[data-org-chart-preview]') as HTMLElement;
  if (!element) {
    throw new Error("Org chart preview not found");
  }

  // Detect if user is in dark mode
  const isDarkMode = document.documentElement.classList.contains('dark');

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: isDarkMode ? "#0a0a0a" : "#ffffff", // Respect theme
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? "landscape" : "portrait",
    unit: "px",
    format: [canvas.width, canvas.height],
  });

  pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save(generateFilename("pdf"));
};


