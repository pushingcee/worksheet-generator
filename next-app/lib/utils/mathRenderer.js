import { MathRenderer as PackageRenderer } from '@jahnchock/math-to-latex';
import 'katex/dist/katex.min.css';

/**
 * Simple math renderer for fractions and powers only
 * Converts text like "3/4" and "x^2" to properly formatted math
 * Preserves regular text and only renders math expressions
 * 
 * Delegates to @jahnchock/math-to-latex package
 */
export class MathRenderer {
  static render(text) {
    return PackageRenderer.render(text);
  }

  /**
   * Test if text contains math patterns we can render
   */
  static containsMath(text) {
    return PackageRenderer.containsMath(text);
  }

  /**
   * Render math and ensure fonts are loaded for PDF generation
   */
  static async renderForPDF(text) {
    // Wait for fonts to be ready
    await document.fonts.ready;

    return this.render(text);
  }
}