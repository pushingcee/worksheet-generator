import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Simple math renderer for fractions and powers only
 * Converts text like "3/4" and "x^2" to properly formatted math
 */
export class MathRenderer {
  static render(text) {
    if (!text || typeof text !== 'string') {
      return text;
    }

    console.log('MathRenderer.render called with:', text); // Debug log

    try {
      // Convert common patterns to KaTeX syntax
      let mathText = text
        // Fractions: 3/4 → \frac{3}{4}
        .replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}')
        
        // Mixed numbers: 2 1/4 → 2\frac{1}{4}
        .replace(/(\d+)\s+(\d+)\/(\d+)/g, '$1\\frac{$2}{$3}')
        
        // Powers: x^2 → x^{2}, 3^4 → 3^{4}
        .replace(/([a-zA-Z0-9]+)\^(\d+)/g, '$1^{$2}')
        
        // Powers with parentheses: (x+1)^2 → (x+1)^{2}
        .replace(/(\([^)]+\))\^(\d+)/g, '$1^{$2}');

      console.log('Converted to LaTeX:', mathText); // Debug log

      // Only render with KaTeX if we found math patterns
      if (mathText !== text) {
        console.log('Rendering with KaTeX...'); // Debug log
        const rendered = katex.renderToString(mathText, {
          throwOnError: false,    // Don't break on invalid math
          displayMode: false,     // Inline math
          output: 'html',        // HTML output for html2canvas compatibility
          strict: false          // Allow some flexibility
        });
        console.log('KaTeX rendered successfully'); // Debug log
        return rendered;
      }
      
      // No math found, return original text
      console.log('No math patterns found, returning original text'); // Debug log
      return text;
      
    } catch (error) {
      console.error('Math rendering failed for:', text, error);
      return text; // Fallback to original text
    }
  }

  /**
   * Test if text contains math patterns we can render
   */
  static containsMath(text) {
    const hasMath = /(\d+\/\d+|\w+\^\d+)/.test(text);
    console.log('containsMath check for:', text, '→', hasMath); // Debug log
    return hasMath;
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