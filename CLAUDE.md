# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a worksheet generator application for educators, specifically designed to create interactive math puzzles from uploaded images. The application splits an image into a grid, scrambles the pieces, and creates a PDF worksheet where students solve problems to determine the correct order of image pieces.

## Development Commands

- `npm run serve` - Start development server on port 8080 with hot reload
- `npm run build:dev` - Build for development with source maps
- `npm run build:prod` - Build for production with minification 
- `npm run build` - Alias for production build

The application uses webpack with separate configs for development and production environments.

## Architecture Overview

### Core System Components

**Entry Point**: `src/js/scripts.js` - Main application initialization and event handling

**Grid System**: 
- `GridManager` - Calculates optimal grid dimensions and tile positions based on problem count
- Automatically finds closest rectangular factor pairs for non-perfect squares

**Canvas Rendering**:
- `CanvasRenderer` (puzzleCanvasRenderer.js) - Handles image display, tile shuffling, and answer placement
- `ProblemGridRenderer` (problemCanvasRenderer.js) - Renders the answer grid with questions

**Core Logic**:
- `Scrambler` - Orchestrates the entire puzzle creation process, coordinates grid manager and renderers
- `PdfGen` - Generates downloadable PDF worksheets using jsPDF

**UI Management**:
- `domHelper.js` - Dynamic form generation, input validation, and DOM manipulation utilities

### Key Data Flow

1. User uploads image → Canvas dimensions set to match image
2. User enters problems/answers → Input validation triggers scrambler initialization  
3. Scrambler creates GridManager → Calculates grid layout based on problem count
4. Canvas renderers draw puzzle and answer grids
5. User clicks "Generate" → PDF created with both grids

### Important Implementation Details

- Problem count is restricted to non-prime numbers (4-36) for proper grid division
- Canvas operations use `willReadFrequently: true` context for tile swapping performance
- Custom event system (`allInputsFilled`) coordinates between DOM and canvas updates
- Scrambler maintains separate arrays for original and shuffled tile positions
- PDF generation supports single-page or dual-page layouts

### File Organization

- `/src/js/` - All JavaScript modules using ES6 imports
- `/src/css/` - Styles including reset.css and custom fonts (Fredoka, Nunito)
- `/src/html/` - Single HTML template processed by webpack
- Webpack bundles everything into `/dist/` for deployment

The codebase follows a modular ES6 architecture with clear separation of concerns between grid logic, rendering, and UI management.