# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## This is NOT the Next.js you know

The app in `next-app/` runs Next.js **16** — likely newer than your training data.
Before writing any Next.js code, read the relevant guide in
`next-app/node_modules/next/dist/docs/`. Do not trust remembered Next.js conventions.

## Project Overview

This is a worksheet generator application for educators, specifically designed to create interactive math puzzles from uploaded images. The application splits an image into a grid, scrambles the pieces, and creates a PDF worksheet where students solve problems to determine the correct order of image pieces.

The app lives in `next-app/` (Next.js 16.2, JavaScript, App Router, no Tailwind).
The original plain-JS webpack app it was ported from is preserved on the `legacy` branch.

## Development Commands

All commands run from `next-app/`:

- `npm run dev` - Start the dev server
- `npm run build` - Production build
- `npm run start` - Serve the production build
- `npm run lint` - ESLint

## Architecture Overview

### React layer (rewritten during the port)

- `app/layout.js` - Root layout: fonts (`@fontsource/fredoka`, `@fontsource/nunito`) and the global CSS (`app/css/reset.css`, `styles.css`, `divStyles.css`).
- `app/page.js` - Single route; loads the generator with `next/dynamic({ ssr: false })` so jsPDF/html2canvas/the DOM-tile renderers never run during prerender.
- `components/WorksheetGenerator.js` - The single client component holding all UI state:
  - `problems`: array of `{question, answer}`, resized when the problem count changes.
  - `allFilled`: derived state (replaces the legacy `allInputsFilled` DOM event).
  - Effects drive the imperative classes in `lib/`: a new `Scrambler` per uploaded image; a re-commit (`adjustForProblemCount` + `initialize`) whenever all inputs are filled for a new problems/count combination. Count-shrink and JSON import commit immediately, bypassing the filled check.

### Core logic (`lib/`, framework-agnostic plain JS - kept verbatim from the legacy app)

- `gridManager.js` - Calculates grid dimensions/tile positions from the problem count (closest rectangular factor pair).
- `scrambler.js` - Orchestrates puzzle creation; coordinates grid manager and renderers.
- `puzzleRenderer.js` / `problemRenderer.js` - Build the puzzle tiles and answer grid as absolutely-positioned divs (there is **no** `<canvas>` element; "canvas" in older docs refers to these div containers). Includes drag-and-drop tile swapping.
- `pdfGenerator.js` - jsPDF + html2canvas PDF generation; single-page or dual-page layouts.
- `utils/mathRenderer.js` - KaTeX math rendering via `@jahnchock/math-to-latex`.
- `problemCounts.js` - Non-prime 4-36 problem-count validation (grid factorization constraint).
- `problemsIO.js` - JSON import/export of problems (pure data in/out; DOM only for the file download).

### Key Data Flow

1. User uploads image → containers sized to the image, `Scrambler` created
2. User enters problems/answers → when all are filled, the grid re-commits
3. `Scrambler` → `GridManager` → renderers draw the scrambled puzzle + answer grid
4. "Generate worksheet" → PDF with both grids (single or dual page)

### Important Implementation Details

- Problem count is restricted to non-prime numbers (4-36) for proper grid division
- Do NOT rewrite the imperative tile/renderer logic in `lib/` in React - it is deliberately imperative and slated for a monorepo extraction
- Scrambler maintains separate arrays for original and shuffled tile positions
- Each keystroke while all inputs are filled re-initializes (and re-shuffles) the grid - preserved legacy behavior

## Non-functional requirements

Refer to `code_requirements_claude.md` (ES2022 standard applies to `lib/`).
