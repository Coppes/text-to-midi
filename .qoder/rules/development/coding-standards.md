---
trigger: always_on
alwaysApply: true
---
# Development Rules and Standards

## 1. CODE STYLE GUIDELINES

### JavaScript Style Standards (MANDATORY)

#### Variable and Function Naming
```javascript
// REQUIRED: camelCase for variables and functions
const textInput = document.getElementById('text-input');
const noteFrequency = 440;
const analyzeGrammatically = (text) => { /* ... */ };

// REQUIRED: PascalCase for classes and constructors
class AudioEngine { /* ... */ }
class TextHighlighter { /* ... */ }

// REQUIRED: UPPER_SNAKE_CASE for constants
const DEFAULT_TEMPO = 120;
const MAX_SIMULTANEOUS_NOTES = 8;
const SCALE_DEFINITIONS = { /* ... */ };
```

#### Function Structure Requirements
```javascript
// REQUIRED: Pure functions when possible
const calculateNoteFromChar = (char, scale) => {
    return scale[char.charCodeAt(0) % scale.length];
};

// REQUIRED: Single responsibility principle
const sanitizeInput = (text) => text.toLowerCase().trim();
const tokenizeText = (text) => text.split(/\s+/);
const classifyWords = (tokens) => tokens.map(classifyWord);

// REQUIRED: Explicit return types in comments for complex functions
/**
 * Analyzes syllable stress patterns in Portuguese text
 * @param {string} word - The word to analyze
 * @returns {Array<'primary'|'secondary'|'unstressed'>} Stress pattern array
 */
const analyzeStressPattern = (word) => { /* ... */ };
```

#### ES6+ Feature Usage (MANDATORY)
```javascript
// REQUIRED: Use const/let instead of var
const immutableValue = 'hello';
let mutableValue = 0;

// REQUIRED: Arrow functions for callbacks and simple functions
const processWords = words => words.map(word => word.toLowerCase());

// REQUIRED: Destructuring when appropriate
const { scale, tempo, instrument } = config.defaultSettings;
const [firstNote, ...remainingNotes] = noteSequence;

// REQUIRED: Template literals for string formatting
const logMessage = `Processing ${wordCount} words at ${tempo} BPM`;

// REQUIRED: Default parameters
const playNote = (note, duration = '4n', velocity = 0.7) => { /* ... */ };
```

### CSS Style Standards

#### Organization and Structure
```css
/* REQUIRED: Logical property grouping */
.text-input {
    /* Layout properties */
    display: flex;
    position: relative;
    
    /* Box model */
    width: 100%;
    height: 200px;
    padding: 1rem;
    margin: 0.5rem 0;
    
    /* Visual properties */
    background-color: #ffffff;
    border: 2px solid #333;
    border-radius: 8px;
    
    /* Typography */
    font-family: 'Courier New', monospace;
    font-size: 1rem;
    line-height: 1.5;
}
```

#### Naming Conventions
```css
/* REQUIRED: BEM methodology for complex components */
.text-highlighter { }
.text-highlighter__segment { }
.text-highlighter__segment--active { }
.text-highlighter__segment--completed { }

/* REQUIRED: Semantic class names */
.audio-controls { }
.scale-selector { }
.instrument-panel { }
.playback-status { }
```

### HTML Structure Standards

#### Semantic Markup (MANDATORY)
```html
<!-- REQUIRED: Proper semantic structure -->
<main class="app-container">
    <header class="app-header">
        <h1>Text-to-MIDI Converter</h1>
        <nav class="control-nav">
            <!-- Navigation elements -->
        </nav>
    </header>
    
    <section class="input-section">
        <label for="text-input">Enter your text:</label>
        <textarea id="text-input" aria-describedby="input-help"></textarea>
        <div id="input-help" class="help-text">Type text to convert to music</div>
    </section>
    
    <section class="output-section">
        <div id="text-display" class="text-highlighter"></div>
        <div class="audio-controls"></div>
    </section>
</main>
```

## 2. DOCUMENTATION STANDARDS

### Function Documentation (MANDATORY)
```javascript
/**
 * Converts text input to a sequence of musical notes
 * @param {string} text - The input text to convert
 * @param {Object} options - Configuration options
 * @param {string} options.scale - Musical scale to use ('major', 'minor', etc.)
 * @param {string} options.instrument - Instrument type ('piano', 'guitar', etc.)
 * @param {number} options.tempo - Playback tempo in BPM (default: 120)
 * @returns {Promise<Array<Object>>} Array of note objects with pitch, duration, timing
 * @throws {Error} When text is empty or scale is invalid
 * @example
 * const notes = await convertTextToNotes('hello world', {
 *     scale: 'major',
 *     instrument: 'piano',
 *     tempo: 140
 * });
 */
const convertTextToNotes = async (text, options = {}) => {
    // Implementation...
};
```

### Module Documentation
```javascript
/**
 * @fileoverview Audio processing module for text-to-MIDI conversion
 * Handles all Tone.js operations, instrument management, and audio playback
 * 
 * @module audio
 * @requires tone
 * @version 2.0.0
 * @author Text-to-MIDI Development Team
 * @since 1.0.0
 */

// Module dependencies and exports...
```

### README and Documentation Files
```markdown
# Module Name

## Purpose
Brief description of what this module does and why it exists.

## Dependencies
- List all internal and external dependencies
- Specify version requirements where applicable

## API Reference
- Document all public functions and their signatures
- Include usage examples for complex operations

## Configuration
- Document all configurable parameters
- Provide examples of common configurations

## Error Handling
- List possible error conditions
- Document error codes and messages

## Performance Notes
- Document any performance considerations
- Include optimization recommendations
```

## 3. TESTING REQUIREMENTS

### Manual Testing Checklist (MANDATORY)
```javascript
// Browser compatibility testing
const browserTests = [
    'Chrome 80+: All features working',
    'Firefox 75+: Audio context handling verified',
    'Safari 13+: Web Audio API compatibility confirmed',
    'Edge 80+: Full functionality validated'
];

// Feature testing requirements
const featureTests = [
    'Text input: Special characters handled correctly',
    'Audio playback: No dropouts or latency issues',
    'Visual feedback: Highlighting synchronized with audio',
    'State management: URL sharing and restoration working',
    'Error handling: Graceful degradation when features fail',
    'Performance: No memory leaks after extended use'
];
```

### Code Quality Validation
```javascript
// Performance testing
const performanceTests = {
    textProcessing: 'Under 150ms for 1000 words',
    audioLatency: 'Under 50ms from trigger to sound',
    memoryUsage: 'Under 100MB total application memory',
    cpuUsage: 'Under 30% during active processing'
};

// Accuracy validation
const accuracyTests = {
    grammaticalClassification: 'Minimum 85% accuracy',
    stressDetection: 'Minimum 90% accuracy for Portuguese',
    phoneticMapping: '100% phoneme coverage',
    harmonicProgression: 'Musically coherent output'
};
```

### Error Scenario Testing
```javascript
// Required error handling tests
const errorScenarios = [
    'Empty text input: Graceful handling with user feedback',
    'Very long text: Performance degradation handling',
    'Invalid characters: Sanitization without data loss',
    'Audio context failure: Fallback mechanism activation',
    'Network issues: Offline functionality maintained',
    'Browser compatibility: Feature detection and fallbacks'
];
```

## 4. GIT WORKFLOW STANDARDS

### Commit Message Format (MANDATORY)
```bash
# Format: <type>(<scope>): <description>
# 
# Types: feat, fix, docs, style, refactor, test, chore
# Scope: module name (audio, ui, main, config, etc.)
# Description: Imperative mood, no capital, no period

# Examples:
feat(audio): add harmonic progression algorithm
fix(ui): resolve text highlighting synchronization issue
docs(readme): update installation instructions
refactor(main): simplify state management logic
test(linguistic): add Portuguese stress pattern validation
chore(deps): update Tone.js to latest stable version
```

### Branch Naming Convention
```bash
# Feature branches
feature/harmonic-progression-engine
feature/brazilian-portuguese-phonetics
feature/mobile-touch-support

# Bug fix branches
fix/audio-context-initialization
fix/text-highlighting-offset
fix/memory-leak-disposal

# Documentation branches
docs/api-reference-update
docs/architecture-documentation
```

### Pull Request Requirements
1. **Code Review Checklist Completed:** All items verified
2. **Tests Passing:** Manual testing across target browsers
3. **Documentation Updated:** All changes documented appropriately
4. **Performance Verified:** No regressions in key metrics
5. **Architecture Compliance:** Module boundaries respected

## 5. ERROR HANDLING STANDARDS

### Async Operation Handling (MANDATORY)
```javascript
// REQUIRED: Proper async/await error handling
const loadInstrument = async (instrumentName) => {
    try {
        const instrument = await Tone.Sampler.fromUrl(instrumentUrls[instrumentName]);
        return instrument;
    } catch (error) {
        console.error(`Failed to load instrument ${instrumentName}:`, error);
        // Fallback to default instrument
        return await Tone.Sampler.fromUrl(instrumentUrls.default);
    }
};

// REQUIRED: Promise rejection handling
const processText = (text) => {
    return new Promise((resolve, reject) => {
        try {
            const result = performComplexProcessing(text);
            resolve(result);
        } catch (error) {
            reject(new Error(`Text processing failed: ${error.message}`));
        }
    });
};
```

### User-Facing Error Messages
```javascript
// REQUIRED: User-friendly error messages
const errorMessages = {
    audioContextFailed: 'Unable to initialize audio. Please check your browser settings.',
    textTooLong: 'Text is too long. Please limit to 1000 words for optimal performance.',
    instrumentLoadFailed: 'Could not load the selected instrument. Using default piano.',
    invalidScale: 'The selected musical scale is not available. Using C Major scale.',
    networkError: 'Network connection required for some features. Working offline with limited functionality.'
};
```

## 6. PERFORMANCE STANDARDS

### Memory Management (CRITICAL)
```javascript
// REQUIRED: Proper cleanup of resources
class AudioEngine {
    constructor() {
        this.activeInstruments = new Map();
        this.audioNodes = [];
    }
    
    dispose() {
        // Clean up audio nodes
        this.audioNodes.forEach(node => node.dispose());
        this.audioNodes.length = 0;
        
        // Clear instrument cache
        this.activeInstruments.clear();
        
        // Remove event listeners
        this.removeAllListeners();
    }
}
```

### Optimization Requirements
- **Lazy Loading:** Heavy modules loaded only when needed
- **Debouncing:** User input processing debounced to prevent overload
- **Memoization:** Expensive calculations cached appropriately
- **Batch Processing:** Large datasets processed in chunks

---

**Compliance Level:** MANDATORY - All standards must be followed  
**Review Required:** For any deviations from established patterns  
**Tool Integration:** Standards enforced through code review process  
**Last Updated:** 2025-09-16