import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Parser for converting math expressions to LaTeX
 */
class MathParser {
  constructor(text) {
    this.text = text;
    this.pos = 0;
    this.tokens = this.tokenize(text);
    this.tokenIndex = 0;
  }

  tokenize(text) {
    const tokens = [];
    let i = 0;
    while (i < text.length) {
      const char = text[i];

      if (/\s/.test(char)) {
        i++;
        continue;
      }

      if (/\d/.test(char)) {
        let num = '';
        while (i < text.length && /\d/.test(text[i])) {
          num += text[i];
          i++;
        }
        tokens.push({ type: 'NUMBER', value: num });
        continue;
      }

      if (['+', '-', '*', '.', '/', '^', '(', ')'].includes(char)) {
        tokens.push({ type: 'OPERATOR', value: char });
        i++;
        continue;
      }

      // Handle unexpected characters by treating them as text/unknown
      // For now, we'll just skip or error? 
      // Let's treat them as single char tokens to be safe
      tokens.push({ type: 'UNKNOWN', value: char });
      i++;
    }
    return tokens;
  }

  peek() {
    return this.tokens[this.tokenIndex];
  }

  consume() {
    return this.tokens[this.tokenIndex++];
  }

  parse() {
    const result = this.parseExpression();
    if (this.tokenIndex < this.tokens.length) {
      throw new Error('Unexpected content after expression');
    }
    return result;
  }

  // Level 0: +, -
  parseExpression() {
    let left = this.parseTerm();

    while (this.peek() && (this.peek().value === '+' || this.peek().value === '-')) {
      const op = this.consume().value;
      const right = this.parseTerm();
      left = `${left} ${op} ${right}`;
    }

    return left;
  }

  // Level 1: ., /
  parseTerm() {
    let left = this.parseFactor();

    while (this.peek() && (this.peek().value === '.' || this.peek().value === '*' || this.peek().value === '/')) {
      const op = this.consume().value;
      const right = this.parseFactor();

      if (op === '/') {
        // Strip outer parentheses from numerator and denominator if present
        const cleanLeft = left.startsWith('(') && left.endsWith(')') ? left.slice(1, -1) : left;
        const cleanRight = right.startsWith('(') && right.endsWith(')') ? right.slice(1, -1) : right;
        left = `\\frac{${cleanLeft}}{${cleanRight}}`;
      } else if (op === '.') {
        left = `${left} \\cdot ${right}`;
      } else if (op === '*') {
        left = `${left} \\cdot ${right}`;
      }
    }

    return left;
  }

  // Level 2: ^
  parseFactor() {
    let left = this.parseBase();

    if (this.peek() && this.peek().value === '^') {
      this.consume();
      const right = this.parseFactor(); // Right associative for powers? Or parseBase?
      // Usually powers are right associative: 2^3^4 = 2^(3^4). 
      // But let's stick to simple recursion for now.
      left = `${left}^{${right}}`;
    }

    return left;
  }

  // Level 3: Numbers, Parentheses
  parseBase() {
    const token = this.peek();

    if (!token) {
      throw new Error('Unexpected end of input');
    }

    if (token.type === 'NUMBER') {
      this.consume();
      return token.value;
    }

    if (token.value === '(') {
      this.consume();
      const expr = this.parseExpression();
      if (!this.peek() || this.peek().value !== ')') {
        throw new Error('Expected closing parenthesis');
      }
      this.consume();

      // Check if we should strip outer parentheses for cleaner fractions
      // This is a simple heuristic: if the expression inside is "safe" or if we are just wrapping it.
      // But for now, let's just return it with parens.
      // Actually, for the specific case of (A) / (B), we might want to strip them in parseTerm.
      // But let's return them here to be safe.
      return `(${expr})`;
    }

    throw new Error(`Unexpected token: ${token.value}`);
  }
}

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

    // Try to parse the entire text as a single math expression first
    try {
      // Quick check: does it look like math?
      // Must contain at least one operator or be a number?
      // The user's examples are pure math strings.
      if (/[\d+\-*/^().]/.test(text)) {
        const parser = new MathParser(text);
        const latex = parser.parse();

        // If we successfully parsed the whole string, render it
        return katex.renderToString(latex, {
          throwOnError: false,
          displayMode: false,
          output: 'html',
          strict: false
        });
      }
    } catch (e) {
      // If parsing fails, fall back to the old segment-based approach
      // This ensures we don't break mixed text like "The answer is 1/2"
      // although the parser might fail on "The answer is".
      console.log('MathParser failed, falling back to regex:', e.message);
    }

    try {
      // Define regex patterns for math expressions (Legacy support)
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
        return text;
      }

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

      return renderedSegments.join('');

    } catch (error) {
      console.error('Math rendering failed for:', text, error);
      return text; // Fallback to original text
    }
  }

  /**
   * Test if text contains math patterns we can render
   */
  static containsMath(text) {
    // Updated to be more permissive since we have a parser now
    const hasMath = /[\d+\-*/^().]/.test(text);
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