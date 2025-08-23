import { jsPDF } from '/node_modules/jspdf/dist/jspdf.es.js';

export class PdfGen {
  constructor() {
    this.doc = new jsPDF();
  }

  async generate(imageContainer, problemContainer, singlePage = false) {
    if (!imageContainer || !problemContainer) {
      console.error("Invalid container elements provided!");
      return;
    }

    try {
      // Wait for fonts to load (important for KaTeX math rendering)
      await document.fonts.ready;
      
      // Small delay to ensure math rendering is complete
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Import html2canvas dynamically
      const html2canvas = (await import('html2canvas')).default;

      // Convert containers to canvas using html2canvas
      const imageCanvas = await html2canvas(imageContainer, {
        backgroundColor: 'white',
        useCORS: true,
        allowTaint: true,
        scale: 2, // Higher resolution for better math rendering
        logging: false // Reduce console noise
      });

      const problemCanvas = await html2canvas(problemContainer, {
        backgroundColor: 'white',
        useCORS: true,
        allowTaint: true,
        scale: 2, // Higher resolution for better math rendering
        logging: false
      });

      // Generate PDF
      if (singlePage) {
        this.doc.addImage(imageCanvas, 'JPEG', 10, 10, 130, 130, null, 'NONE', 0);
        this.doc.addImage(problemCanvas, 'JPEG', 10, 150, 130, 130, null, 'NONE', 0);
      } else {
        this.doc.addImage(imageCanvas, 'JPEG', 10, 50, 190, 190, null, 'NONE', 0);
        this.doc.addPage();
        this.doc.addImage(problemCanvas, 'JPEG', 10, 50, 190, 190, null, 'NONE', 0);
      }

      this.doc.save(`worksheet-${Date.now()}.pdf`);
      this.doc = new jsPDF();

    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  }
}