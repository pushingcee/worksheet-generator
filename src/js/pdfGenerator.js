import { jsPDF } from '/node_modules/jspdf/dist/jspdf.es.js';

export class PdfGen {
  constructor() {
    this.doc = new jsPDF();
  }

  generate(imageCanvas, problemCanvas, singlePage = false) {
    if (!imageCanvas || !problemCanvas) {
      console.error("Invalid canvas elements provided!");
      return;
    }
    if (singlePage) {
      this.doc.addImage(imageCanvas, 'JPEG', 10, 10, 130, 130, null, 'NONE', 0);
      this.doc.addImage(problemCanvas, 'JPEG', 10, 150, 130, 130, null, 'NONE', 0);
    } else {
      this.doc.addImage(imageCanvas, 'JPEG', 10, 50, 190, 190, null, 'NONE', 0);
      this.doc.addPage();
      this.doc.addImage(problemCanvas, 'JPEG', 10, 50, 190, 190, null, 'NONE', 0);
    }
    this.doc.save(`${Date.now()}.pdf`);
    this.doc = new jsPDF();
  }
  
}
