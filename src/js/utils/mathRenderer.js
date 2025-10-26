import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Simple math renderer for fractions and powers only
 * Converts text like "3/4" and "x^2" to properly formatted math
 * Preserves regular text and only renders math expressions
 */
export class MathRenderer {
  static render(text) {
    if (!text || typeof text !== 'string') {
      return text;
    }

    console.log('MathRenderer.render called with:', text); // Debug log

    try {
      // Define regex patterns for math expressions
      const mathPatterns = [
        { regex: /(\d+)\s+(\d+)\/(\d+)/g, replacer: (match, whole, num, denom) => `${whole}\\frac{${num}}{${denom}}` }, // Mixed numbers
        { regex: /(\d+)\/(\d+)/g, replacer: (match, num, denom) => `\\frac{${num}}{${denom}}` }, // Simple fractions
        { regex: /(\([^)]+\))\^(\d+)/g, replacer: (match, base, exp) => `${base}^{${exp}}` }, // Powers with parentheses
        { regex: /([a-zA-Z0-9]+)\^(\d+)/g, replacer: (match, base, exp) => `${base}^{${exp}}` } // Simple powers
      ];

      // Find all math expressions in the text
      const segments = [];
      let lastIndex = 0;
      let hasMath = false;

      // Create a combined regex to find all math expressions
      const combinedRegex = /(\d+)\s+(\d+)\/(\d+)|(\d+)\/(\d+)|(\([^)]+\))\^(\d+)|([a-zA-Z0-9]+)\^(\d+)/g;

      let match;
      while ((match = combinedRegex.exec(text)) !== null) {
        hasMath = true;

        // Add text before the match
        if (match.index > lastIndex) {
          segments.push({
            type: 'text',
            content: text.substring(lastIndex, match.index)
          });
        }

        // Convert the matched expression to LaTeX
        let latexExpr = match[0];
        if (match[1] && match[2] && match[3]) {
          // Mixed number: 2 1/4
          latexExpr = `${match[1]}\\frac{${match[2]}}{${match[3]}}`;
        } else if (match[4] && match[5]) {
          // Simple fraction: 3/4
          latexExpr = `\\frac{${match[4]}}{${match[5]}}`;
        } else if (match[6] && match[7]) {
          // Power with parentheses: (x+1)^2
          latexExpr = `${match[6]}^{${match[7]}}`;
        } else if (match[8] && match[9]) {
          // Simple power: x^2
          latexExpr = `${match[8]}^{${match[9]}}`;
        }

        segments.push({
          type: 'math',
          content: latexExpr
        });

        lastIndex = match.index + match[0].length;
      }

      // Add any remaining text after the last match
      if (lastIndex < text.length) {
        segments.push({
          type: 'text',
          content: text.substring(lastIndex)
        });
      }

      // If no math was found, return the original text
      if (!hasMath) {
        console.log('No math patterns found, returning original text'); // Debug log
        return text;
      }

      console.log('Segments found:', segments); // Debug log

      // Render each segment appropriately
      const renderedSegments = segments.map(segment => {
        if (segment.type === 'math') {
          try {
            return katex.renderToString(segment.content, {
              throwOnError: false,
              displayMode: false,
              output: 'html',
              strict: false
            });
          } catch (error) {
            console.error('Failed to render math segment:', segment.content, error);
            return segment.content; // Fallback to original
          }
        } else {
          // Escape HTML in regular text to prevent injection
          return segment.content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        }
      });

      const result = renderedSegments.join('');
      console.log('KaTeX rendered successfully'); // Debug log
      return result;

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