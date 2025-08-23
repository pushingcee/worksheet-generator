# 3. Magic Numbers & Configuration Constants

## Priority: **HIGH**
## Estimated Time: **1 day**

---

## Problem Analysis

### Current Issues

The codebase is littered with magic numbers and hardcoded values that make the code difficult to understand, maintain, and configure.

#### **Critical Magic Numbers**

**Location**: `src/js/scripts.js`
```javascript
let selectedProblemCount = 4;  // Why 4? What's the significance?
```

**Location**: `src/js/puzzleRenderer.js`
```javascript
// Answer overlay positioning and styling
answerDiv.style.top = `${y + rowInterval - 50}px`;  // Why 50?
answerDiv.style.width = '150px';                    // Why 150?
answerDiv.style.height = '50px';                    // Why 50?
answerDiv.style.fontSize = '25px';                  // Why 25?
answerDiv.style.paddingLeft = '5px';               // Why 5?

// Tile styling
tile.style.transform = 'scale(1.02)';              // Why 1.02?
tile.style.borderWidth = '2px';                    // Why 2px?
```

**Location**: `src/js/problemRenderer.js`
```javascript
// Text positioning
textDiv.style.left = `${x + 10}px`;               // Why 10?
textDiv.style.top = `${y + rowInterval - 30}px`;  // Why 30?
textDiv.style.width = `${columnInterval - 20}px`; // Why 20?
textDiv.style.fontSize = '20px';                  // Why 20?
```

**Location**: `src/js/pdfGenerator.js`
```javascript
// PDF positioning and sizing
this.doc.addImage(imageCanvas, 'JPEG', 10, 10, 130, 130, null, 'NONE', 0);  // Why these numbers?
this.doc.addImage(problemCanvas, 'JPEG', 10, 150, 130, 130, null, 'NONE', 0);
this.doc.addImage(imageCanvas, 'JPEG', 10, 50, 190, 190, null, 'NONE', 0);
```

**Location**: `src/js/domHelper.js`
```javascript
// Problem count generation
for (let i = 4; i <= 36; i++) {  // Why 4 to 36?
  if (!isPrime(i)) {             // Why exclude primes?
    // ...
  }
}
```

---

## Why These Practices Are Bad

### **1. Code Comprehension Issues**
```javascript
// What does this mean? Why 50?
answerDiv.style.top = `${y + rowInterval - 50}px`;

// Reader questions:
// - Is 50 pixels? Points? Some other unit?
// - What happens if I change it to 45? 55?
// - Is this related to other layout values?
// - Where else might this value be used?
```

### **2. Maintenance Nightmare**
```javascript
// Same value scattered across files
// puzzleRenderer.js
answerDiv.style.height = '50px';

// problemRenderer.js  
textDiv.style.top = `${y + rowInterval - 30}px`;  // Related to the 50?

// If design changes require different spacing, how many places need updates?
```

### **3. Configuration Inflexibility**
```javascript
// Hardcoded limits make customization impossible
for (let i = 4; i <= 36; i++) {  // What if user wants 40 pieces?

// Hardcoded styling prevents theming
tile.style.fontSize = '25px';    // What if user has vision impairments?
```

### **4. Business Logic Obscurity**
```javascript
// Why exclude primes? Domain knowledge hidden in implementation
if (!isPrime(i)) {
  // This business rule is invisible without context
}
```

### **5. Testing and Debugging Difficulties**
- **Hard to test edge cases**: Can't easily test with different values
- **Unclear failure modes**: When magic number is wrong, error messages are cryptic
- **Difficult to isolate issues**: Is the problem the algorithm or the hardcoded value?

---

## Suggested Improvements

### **Strategy: Extract, Group, and Document**

#### **Step 1: Create Configuration Constants**

```javascript
// BEFORE: Scattered magic numbers
let selectedProblemCount = 4;
answerDiv.style.top = `${y + rowInterval - 50}px`;
answerDiv.style.fontSize = '25px';

// AFTER: Organized configuration
const PUZZLE_CONFIG = {
  DEFAULT_PROBLEM_COUNT: 4,
  MIN_PROBLEM_COUNT: 4,
  MAX_PROBLEM_COUNT: 36,
  
  ANSWER_OVERLAY: {
    HEIGHT: 50,           // pixels from bottom of tile
    WIDTH: 150,           // overlay width in pixels
    FONT_SIZE: '25px',    // answer text size
    PADDING_LEFT: '5px',  // internal spacing
    BACKGROUND_ALPHA: 0.4 // transparency level
  },
  
  TILE_INTERACTION: {
    HOVER_SCALE: 1.02,        // scale factor on hover
    DRAG_OPACITY: 0.5,        // opacity while dragging
    BORDER_HIGHLIGHT: '2px',   // border width when highlighted
    TRANSITION_DURATION: '0.2s' // animation timing
  },
  
  PROBLEM_TEXT: {
    MARGIN_LEFT: 10,      // offset from tile edge
    MARGIN_BOTTOM: 30,    // offset from tile bottom  
    FONT_SIZE: '20px',    // question text size
    MARGIN_RIGHT: 20      // right margin for text area
  },
  
  PDF_LAYOUT: {
    SINGLE_PAGE: {
      IMAGE: { x: 10, y: 10, width: 130, height: 130 },
      PROBLEM: { x: 10, y: 150, width: 130, height: 130 }
    },
    DUAL_PAGE: {
      IMAGE: { x: 10, y: 50, width: 190, height: 190 },
      PROBLEM: { x: 10, y: 50, width: 190, height: 190 }
    }
  }
};

const BUSINESS_RULES = {
  // Why: Prime numbers don't divide evenly into rectangular grids
  // This ensures we can always create a proper puzzle layout
  EXCLUDE_PRIME_COUNTS: true,
  
  // Why: Minimum needed for meaningful puzzle complexity
  MIN_PIECES_FOR_PUZZLE: 4,
  
  // Why: Maximum that maintains reasonable tile size on typical screens
  MAX_PIECES_FOR_USABILITY: 36
};
```

#### **Step 2: Replace Magic Numbers with Named Constants**

```javascript
// BEFORE: Cryptic calculations
answerDiv.style.top = `${y + rowInterval - 50}px`;
answerDiv.style.width = '150px';
answerDiv.style.fontSize = '25px';

// AFTER: Self-documenting code
const { ANSWER_OVERLAY } = PUZZLE_CONFIG;
answerDiv.style.top = `${y + rowInterval - ANSWER_OVERLAY.HEIGHT}px`;
answerDiv.style.width = `${ANSWER_OVERLAY.WIDTH}px`;
answerDiv.style.fontSize = ANSWER_OVERLAY.FONT_SIZE;
```

```javascript
// BEFORE: Unclear business logic
for (let i = 4; i <= 36; i++) {
  if (!isPrime(i)) {
    select.innerHTML += `<option value=${i}>${i}</option>`;
  }
}

// AFTER: Clear business intent
const { MIN_PROBLEM_COUNT, MAX_PROBLEM_COUNT } = PUZZLE_CONFIG;
const { EXCLUDE_PRIME_COUNTS } = BUSINESS_RULES;

for (let i = MIN_PROBLEM_COUNT; i <= MAX_PROBLEM_COUNT; i++) {
  if (!EXCLUDE_PRIME_COUNTS || !isPrime(i)) {
    select.innerHTML += `<option value=${i}>${i}</option>`;
  }
}
```

#### **Step 3: Create Computed Values for Related Constants**

```javascript
// BEFORE: Scattered related values
const ANSWER_HEIGHT = 50;
const PROBLEM_MARGIN_BOTTOM = 30;  // Are these related?

// AFTER: Clear relationships
const LAYOUT = {
  ANSWER_OVERLAY_HEIGHT: 50,
  PROBLEM_TEXT_MARGIN: 30,
  
  // Computed relationships
  get TOTAL_TEXT_HEIGHT() {
    return this.ANSWER_OVERLAY_HEIGHT + this.PROBLEM_TEXT_MARGIN;
  },
  
  get MINIMUM_TILE_HEIGHT() {
    return this.TOTAL_TEXT_HEIGHT + 20; // 20px minimum content area
  }
};
```

#### **Step 4: Environment-based Configuration**

```javascript
// Support different configurations for different environments
const getConfiguration = (environment = 'default') => {
  const baseConfig = PUZZLE_CONFIG;
  
  switch (environment) {
    case 'accessibility':
      return {
        ...baseConfig,
        ANSWER_OVERLAY: {
          ...baseConfig.ANSWER_OVERLAY,
          FONT_SIZE: '30px',  // Larger for better readability
        },
        PROBLEM_TEXT: {
          ...baseConfig.PROBLEM_TEXT,
          FONT_SIZE: '24px',
        }
      };
      
    case 'mobile':
      return {
        ...baseConfig,
        TILE_INTERACTION: {
          ...baseConfig.TILE_INTERACTION,
          HOVER_SCALE: 1.05,  // More pronounced on touch
        }
      };
      
    default:
      return baseConfig;
  }
};
```

---

## Benefits of New Approach

### **1. Enhanced Code Readability**
```javascript
// BEFORE: Requires mental calculation
answerDiv.style.top = `${y + rowInterval - 50}px`;

// AFTER: Immediately clear intent
answerDiv.style.top = `${y + rowInterval - ANSWER_OVERLAY.HEIGHT}px`;
```

### **2. Centralized Configuration**
- **Single source of truth**: All layout values in one place
- **Easy customization**: Change one constant to affect entire app
- **Theme support**: Different configurations for different use cases

### **3. Better Maintainability**
- **Relationship clarity**: Related values are grouped together
- **Change impact**: Easy to see what changes when a value is modified
- **Documentation**: Constants serve as inline documentation

### **4. Improved Testing**
```javascript
// BEFORE: Hard to test different scenarios
it('should position answer overlay', () => {
  // How do you test with different values?
});

// AFTER: Easy configuration-based testing
it('should position answer overlay correctly', () => {
  const testConfig = { ANSWER_OVERLAY: { HEIGHT: 60 } };
  const result = positionAnswerOverlay(100, 50, testConfig);
  expect(result).toBe(40); // 100 - 60
});
```

---

## Tradeoffs

### **Potential Drawbacks**
1. **Increased verbosity**: `PUZZLE_CONFIG.ANSWER_OVERLAY.HEIGHT` vs `50`
2. **Over-abstraction risk**: Not every number needs to be a constant
3. **Import overhead**: More imports at the top of files

### **Guidelines for What to Extract**
**✅ Extract when:**
- Value appears multiple times
- Value has business significance
- Value likely to change
- Value needs documentation

**❌ Don't extract when:**
- Value is truly arbitrary (e.g., array index 0)
- Value is used once and context is obvious
- Value is a standard (e.g., HTTP status codes)

### **Mitigation Strategies**
1. **Selective extraction**: Focus on meaningful constants first
2. **Logical grouping**: Keep related constants together
3. **Clear naming**: Use descriptive names that explain purpose

---

## Implementation Timeline

### **Phase 1: Critical Constants (0.5 days)**
- Extract most frequently used magic numbers
- Focus on layout and styling constants
- Create basic configuration structure

### **Phase 2: Business Logic Constants (0.25 days)**
- Extract puzzle logic constants
- Document business rules with comments
- Update domain-specific calculations

### **Phase 3: Configuration Organization (0.25 days)**
- Group related constants logically
- Create computed values for relationships
- Set up environment-based configuration

### **Total Estimated Time: 1 day**

---

## Success Metrics

- ✅ No hardcoded numbers in layout calculations
- ✅ All business rules documented with constants
- ✅ Related values grouped logically
- ✅ Configuration can be modified in single location
- ✅ Constants have clear, descriptive names
- ✅ No regression in existing functionality