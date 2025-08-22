# 6. Dead Code & Code Organization

## Priority: **MEDIUM-LOW**
## Estimated Time: **0.5 days**

---

## Problem Analysis

### Current Issues

The codebase contains unused functions, inconsistent organization, and remnants from the canvas-to-div migration that create maintenance overhead.

#### **Dead/Unused Code**

**Location**: `src/js/scripts.js:234-236`
```javascript
// Helper function to check if container has content (equivalent to canvas check)
function isContainerEmpty(container) {
  return container.children.length === 0;
}
// ↑ This function is defined but never used anywhere
```

**Location**: `src/js/aspectRatios.js`
```javascript
export const AspectRatios = {
  // This entire module might be unused after canvas removal
};
```

#### **Inconsistent Imports**
**Location**: `src/js/scripts.js:1-8`
```javascript
import { AspectRatios } from './aspectRatios.js';  // Potentially unused
import { Scrambler } from './scrambler.js';
import { PdfGen } from './pdfGenerator.js';
import * as domHelper from './domHelper.js'      // Missing semicolon, inconsistent style
import "../css/styles.css";
import "../css/reset.css"                        // Missing semicolon
import '@fontsource/fredoka';
import '@fontsource/nunito'; 
```

#### **Mixed Concerns in Single Files**
**Location**: `src/js/domHelper.js`
Contains multiple unrelated responsibilities:
- DOM element creation (`createInfoBox`)
- Canvas utilities (`isCanvasEmpty`) - potentially obsolete after canvas removal
- Array utilities (`getAllQuestions`, `getAllAnswers`)
- Form generation (`generateQuestionAnswerSpace`)
- Math utilities (`isPrime`)
- Event handling (`checkInputsAndEmitEvent`)

#### **Inconsistent Function Organization**
**Location**: `src/js/scripts.js`
```javascript
// Functions are scattered throughout the file:
// - init() at line 12 (104 lines)
// - paintImageOnContainer() at line 104 (nested inside init)
// - exportProblems() at line 118 (nested inside init)  
// - importProblems() at line 151 (nested inside init)
// - _setupContainerDimensions() at line 208 (global scope)
// - _setupScrambler() at line 216 (global scope)
// - isContainerEmpty() at line 234 (global scope, unused)
```

#### **Naming Inconsistencies**
- Functions starting with `_` (private convention) in global scope
- Mix of camelCase and underscore prefixes
- Some functions have descriptive names, others are generic

---

## Why These Practices Are Bad

### **1. Maintenance Overhead**
```javascript
// Dead code creates confusion
function isContainerEmpty(container) {
  return container.children.length === 0;  
}
// Developers see this and think:
// - Is this used somewhere I can't see?
// - Should I maintain/update this function?
// - Does removing it break something?
// - What was this intended for?
```

### **2. Bundle Size Impact**
- **Unused imports**: Add unnecessary bytes to production bundle
- **Dead functions**: Take up space in final JavaScript
- **Unused dependencies**: Increase build time and complexity

### **3. Developer Confusion**
```javascript
// Mixed concerns make it hard to find things
// domHelper.js contains:
export function createInfoBox(i) { ... }        // DOM creation
export function isCanvasEmpty(canvas) { ... }   // Canvas utilities (obsolete?)  
export function isPrime(n) { ... }              // Math utilities
export function getAllQuestions() { ... }       // Form utilities

// Where should a new DOM utility go?
// Where should a new math utility go?
```

### **4. Poor Discoverability**
- **Nested functions**: Hard to find `exportProblems` buried inside `init()`
- **Inconsistent naming**: Functions with `_` prefix aren't actually private
- **Mixed organization**: Related functions scattered across different scopes

### **5. Testing Difficulties**
```javascript
// Can't test nested functions in isolation
function init() {
  // ... 100+ lines
  
  function exportProblems() {  // Can't unit test this!
    // ... 20+ lines
  }
  
  function importProblems() {  // Can't unit test this!
    // ... 50+ lines  
  }
}
```

---

## Suggested Improvements

### **Strategy: Clean, Organize, and Structure**

#### **Step 1: Remove Dead Code**

```javascript
// AUDIT: Check if AspectRatios is actually used
import { AspectRatios } from './aspectRatios.js';  // ← Check usage

// Search codebase for AspectRatios usage:
// If not used → Remove import and potentially the entire file

// REMOVE: Unused function
// function isContainerEmpty(container) {
//   return container.children.length === 0;
// }

// AUDIT: Check if any canvas-related utilities remain in domHelper.js
// If isCanvasEmpty is not used → Remove it
```

#### **Step 2: Reorganize domHelper.js by Responsibility**

```javascript
// BEFORE: Mixed concerns in domHelper.js
export function createInfoBox(i) { ... }      // DOM creation
export function isCanvasEmpty(canvas) { ... } // Canvas (obsolete?)
export function getAllQuestions() { ... }     // Form queries
export function isPrime(n) { ... }            // Math utility

// AFTER: Split into focused modules

// src/js/utils/domUtils.js
export const DOMUtils = {
  createInfoBox(i) {
    // DOM creation utilities
  },
  
  createLabeledInput(id, labelText, type = 'text') {
    // Reusable input creation
  }
};

// src/js/utils/formUtils.js  
export const FormUtils = {
  getAllQuestions() {
    return Array.from(document.querySelectorAll(".q"));
  },
  
  getAllAnswers() {
    return Array.from(document.querySelectorAll(".a"));
  },
  
  getAllInputs() {
    return [...this.getAllQuestions(), ...this.getAllAnswers()];
  },
  
  generateQuestionAnswerSpace(problemSpace, problemCount) {
    // Form generation logic
  },
  
  editQuestionAnswerSpace(problemSpace, problemCount, targetProblemCount) {
    // Form editing logic
  }
};

// src/js/utils/mathUtils.js
export const MathUtils = {
  isPrime(n) {
    if (typeof n !== "number") {
      throw new Error("N must be a number");
    }
    if (n <= 1) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
      if (n % i === 0) return false;
    }
    return true;
  },
  
  findFactorPairs(number) {
    // Additional math utilities
  }
};

// src/js/utils/eventUtils.js
export const allInputsFilledEvent = new Event("allInputsFilled");

export const EventUtils = {
  checkInputsAndEmitEvent() {
    const allFilled = FormUtils.getAllInputs().every(input => 
      input.value.trim() !== ""
    );
    if (allFilled) {
      document.dispatchEvent(allInputsFilledEvent);
    }
  }
};
```

#### **Step 3: Extract and Organize Main Application Logic**

```javascript
// BEFORE: Everything in init() function
function init() {
  // 104 lines of mixed concerns
}

// AFTER: Organized application structure

// src/js/app/ApplicationInitializer.js
export class ApplicationInitializer {
  #elements;
  #state;
  #handlers;
  
  constructor() {
    this.#elements = this.#initializeDOMElements();
    this.#state = this.#initializeState();
    this.#handlers = this.#createEventHandlers();
  }
  
  initialize() {
    this.#setupInitialForm();
    this.#bindEventListeners();
    this.#initializePuzzleDefaults();
  }
  
  #initializeDOMElements() {
    const elements = {
      problemSpace: document.getElementById("problem-space"),
      problemCountElement: document.getElementById("problem-count"),
      fileInput: document.getElementById('upload'),
      imageContainer: document.getElementById('image-container'),
      problemContainer: document.getElementById('answer-grid-container'),
      reshuffle: document.getElementById('reshuffle'),
      generateButton: document.getElementById("generate"),
      exportButton: document.getElementById("export-problems"),
      importButton: document.getElementById("import-problems"),
      importFileInput: document.getElementById("import-file"),
      checkBoxes: document.querySelectorAll(".check-box")
    };
    
    // Validate required elements exist
    const requiredElements = ['problemSpace', 'problemCountElement', 'imageContainer'];
    for (const elementName of requiredElements) {
      if (!elements[elementName]) {
        throw new Error(`Required DOM element not found: ${elementName}`);
      }
    }
    
    return elements;
  }
  
  #initializeState() {
    return {
      selectedProblemCount: 4,
      singlePage: false,
      scrambler: null,
      pdfGenerator: new PdfGen()
    };
  }
  
  // ... other organized methods
}

// src/js/app/FileHandlers.js
export class FileHandlers {
  static async handleImageUpload(file, elements, state) {
    // Extracted from paintImageOnContainer
  }
  
  static async handleProblemImport(file, elements, state) {
    // Extracted from importProblems
  }
  
  static handleProblemExport(state) {
    // Extracted from exportProblems
  }
}

// src/js/app/PuzzleManager.js  
export class PuzzleManager {
  static setupScrambler(image, imageContainer, problemContainer, problemCount) {
    // Extracted from _setupScrambler
  }
  
  static setupContainerDimensions(image, imageContainer, problemContainer) {
    // Extracted from _setupContainerDimensions  
  }
}
```

#### **Step 4: Consistent Import Organization**

```javascript
// BEFORE: Inconsistent imports
import { AspectRatios } from './aspectRatios.js';  // Potentially unused
import { Scrambler } from './scrambler.js';
import { PdfGen } from './pdfGenerator.js';
import * as domHelper from './domHelper.js'      // Missing semicolon
import "../css/styles.css";

// AFTER: Organized and consistent imports
// 1. External dependencies
import '@fontsource/fredoka';
import '@fontsource/nunito';

// 2. Internal modules (alphabetically)
import { PdfGen } from './pdfGenerator.js';
import { Scrambler } from './scrambler.js';

// 3. Utilities (grouped by type)
import { FormUtils } from './utils/formUtils.js';
import { FileHandlers } from './app/FileHandlers.js';
import { PuzzleManager } from './app/PuzzleManager.js';

// 4. Styles (last)
import '../css/reset.css';
import '../css/styles.css';
```

#### **Step 5: Create Consistent File Structure**

```
src/js/
├── app/                          # Main application logic
│   ├── ApplicationInitializer.js # App startup and coordination
│   ├── FileHandlers.js          # File upload/import/export
│   └── PuzzleManager.js          # Puzzle-specific logic
├── components/                   # UI components  
│   ├── puzzleRenderer.js        # Puzzle rendering
│   ├── problemRenderer.js       # Problem grid rendering
│   └── pdfGenerator.js          # PDF generation
├── core/                         # Core business logic
│   ├── scrambler.js             # Main puzzle logic
│   └── gridManager.js           # Grid calculations
├── utils/                        # Utilities and helpers
│   ├── domUtils.js              # DOM manipulation helpers
│   ├── formUtils.js             # Form-related utilities
│   ├── mathUtils.js             # Mathematical utilities
│   └── eventUtils.js            # Event handling utilities
└── scripts.js                    # Entry point (minimal, just initialization)
```

---

## Benefits of New Approach

### **1. Improved Maintainability**
- **Clear organization**: Easy to find related functionality
- **No dead code**: Every line has a purpose
- **Consistent structure**: Similar patterns across files

### **2. Better Discoverability**
- **Logical grouping**: Related functions are together
- **Clear naming**: Function names indicate their purpose
- **Consistent imports**: Easy to understand dependencies

### **3. Enhanced Testability**
- **Isolated functions**: Can test utilities independently
- **Clear boundaries**: Easy to mock dependencies
- **No nested functions**: All functions are testable

### **4. Reduced Bundle Size**
- **No unused imports**: Only necessary code included
- **Tree shaking**: Build tools can eliminate unused code
- **Smaller footprint**: Better performance

### **5. Team Productivity**
- **Faster navigation**: Developers can find code quickly
- **Less confusion**: Clear separation of concerns
- **Easier onboarding**: New developers understand structure

---

## Tradeoffs

### **Potential Drawbacks**
1. **More files**: Increased number of files to manage
2. **Import complexity**: More import statements needed
3. **Over-organization**: Risk of creating too many small modules

### **Mitigation Strategies**
1. **Logical grouping**: Keep related functionality together
2. **Barrel exports**: Use index.js files to simplify imports
3. **Balance**: Don't split everything - keep related code together

### **Guidelines for Organization**
**✅ Create separate files for:**
- Different responsibilities (DOM, math, events)
- Large classes or complex logic
- Reusable utilities
- Independent features

**❌ Don't separate:**
- Tightly coupled functions
- Very small utilities (< 10 lines)
- Single-use helpers

---

## Implementation Timeline

### **Phase 1: Dead Code Removal (0.2 days)**
- Audit and remove unused imports
- Remove unused functions
- Clean up obsolete canvas references

### **Phase 2: Module Reorganization (0.2 days)**
- Split domHelper into focused modules
- Create utility directories
- Update import statements

### **Phase 3: Application Structure (0.1 days)**  
- Extract nested functions from init()
- Create organized application classes
- Update entry point

### **Total Estimated Time: 0.5 days**

---

## Success Metrics

- ✅ No dead/unused code in codebase
- ✅ Consistent import organization across files
- ✅ Clear module boundaries and responsibilities
- ✅ Functions are discoverable and testable
- ✅ Logical file structure and naming
- ✅ Reduced bundle size (no unused dependencies)
- ✅ No regression in existing functionality