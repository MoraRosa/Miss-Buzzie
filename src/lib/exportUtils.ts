import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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

export const importAllData = (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        if (data.canvas) localStorage.setItem("businessModelCanvas", data.canvas);
        if (data.pitchDeck) localStorage.setItem("pitchDeck", data.pitchDeck);
        if (data.roadmap) localStorage.setItem("roadmap", data.roadmap);
        if (data.orgChart) localStorage.setItem("orgChart", data.orgChart);
        if (data.checklist) localStorage.setItem("checklist", data.checklist);
        if (data.forecasting) localStorage.setItem("forecasting", data.forecasting);
        if (data.brandAssets) localStorage.setItem("brandAssets", data.brandAssets);
        
        resolve(true);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
};
