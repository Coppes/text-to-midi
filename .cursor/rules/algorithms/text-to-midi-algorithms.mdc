---
trigger: always_on
alwaysApply: true
---
# Algorithm Rules for Text-to-MIDI Conversion

## 1. CORE ALGORITHM ARCHITECTURE

### Text Processing Pipeline
```
Text Input → Preprocessing → Linguistic Analysis → Musical Mapping → Audio Generation
     ↓              ↓               ↓                ↓               ↓
Sanitization   Tokenization   Grammar/Phonetics   Note Selection  MIDI/Audio
```

### Algorithm Phases
1. **Preprocessing Phase:** Text cleaning and normalization
2. **Analysis Phase:** Linguistic feature extraction
3. **Mapping Phase:** Convert linguistic features to musical parameters
4. **Generation Phase:** Create MIDI sequences and audio output

## 2. LINGUISTIC PROCESSING RULES

### Text Preprocessing (MANDATORY)
```javascript
// Required preprocessing steps:
const preprocessText = (text) => {
    return text
        .toLowerCase()                    // Normalize case
        .replace(/[^\w\s\u00C0-\u017F]/g, '') // Keep only letters, spaces, accents
        .replace(/\s+/g, ' ')            // Normalize whitespace
        .trim();                         // Remove leading/trailing spaces
};
```

### Brazilian Portuguese Phonetic Rules
```javascript
// Stress patterns (MANDATORY for Phase 2)
const stressPatterns = {
    oxytone: /[aeiouâêôàáéíóú]$/,      // Final syllable stress
    paroxytone: /[aeiouâêôàáéíóú].$/,  // Penultimate syllable stress
    proparoxytone: /.+[aeiouâêôàáéíóú]..$/  // Antepenultimate stress
};

// Consonant clusters (MANDATORY)
const consonantClusters = {
    'rr': ['r', 'strong'],     // Strong R sound
    'lh': ['ʎ', 'palatal'],    // Palatal L
    'nh': ['ɲ', 'palatal'],    // Palatal N
    'ch': ['ʃ', 'fricative']   // Sh sound
};

// Nasal vowels (MANDATORY)
const nasalVowels = {
    'ã': ['a', 'nasal'],
    'õ': ['o', 'nasal'],
    'ẽ': ['e', 'nasal']
};
```

### Grammatical Classification Rules
```javascript
// Word classification weights (Phase 1 requirement)
const grammaticalWeights = {
    // Content words (higher musical weight)
    nouns: { weight: 0.8, duration: 'long', pitch: 'mid-high' },
    verbs: { weight: 0.9, duration: 'long', pitch: 'high' },
    adjectives: { weight: 0.7, duration: 'medium', pitch: 'mid' },
    adverbs: { weight: 0.6, duration: 'medium', pitch: 'mid-low' },
    
    // Function words (lower musical weight)
    articles: { weight: 0.2, duration: 'short', pitch: 'low' },
    prepositions: { weight: 0.3, duration: 'short', pitch: 'low' },
    conjunctions: { weight: 0.3, duration: 'short', pitch: 'low' },
    pronouns: { weight: 0.4, duration: 'short', pitch: 'mid-low' }
};
```

## 3. MUSICAL MAPPING ALGORITHMS

### Note Selection Algorithm (MANDATORY)
```javascript
// Frequency-weighted note selection
const selectNote = (word, grammaticalType, position, scaleNotes) => {
    const baseWeight = grammaticalWeights[grammaticalType].weight;
    const positionWeight = calculatePositionWeight(position);
    const phoneticWeight = calculatePhoneticWeight(word);
    
    const totalWeight = (baseWeight * 0.5) + (positionWeight * 0.3) + (phoneticWeight * 0.2);
    const noteIndex = Math.floor(totalWeight * scaleNotes.length);
    
    return scaleNotes[noteIndex % scaleNotes.length];
};

// Position weight calculation
const calculatePositionWeight = (position, totalWords) => {
    // Higher weight for beginning and end of sentences
    const normalized = position / totalWords;
    return 0.5 + 0.5 * Math.sin(normalized * Math.PI);
};
```

### Harmonic Progression Rules (Phase 1)
```javascript
// Mathematical harmonic progressions
const harmonicProgressions = {
    major: {
        I: [0, 2, 4],      // Tonic
        V: [4, 6, 1],      // Dominant
        vi: [5, 0, 2],     // Relative minor
        IV: [3, 5, 0]      // Subdominant
    },
    
    // Progression probabilities based on text structure
    progressionWeights: {
        sentenceStart: { I: 0.7, V: 0.1, vi: 0.1, IV: 0.1 },
        sentenceMiddle: { I: 0.2, V: 0.4, vi: 0.3, IV: 0.1 },
        sentenceEnd: { I: 0.6, V: 0.3, vi: 0.05, IV: 0.05 }
    }
};
```

### Rhythm Generation Algorithm
```javascript
// Syllable-based rhythm patterns
const generateRhythm = (syllables, stressPattern) => {
    return syllables.map((syllable, index) => {
        const isStressed = stressPattern[index];
        const duration = isStressed ? 'quarter' : 'eighth';
        const velocity = isStressed ? 0.8 : 0.6;
        
        return { duration, velocity, offset: 0 };
    });
};
```

## 4. PROSODIC MELODY RULES (Phase 2)

### Sentence Type Detection
```javascript
// Prosodic contour mapping
const prosodicContours = {
    declarative: {
        pattern: 'falling',
        startPitch: 0.7,
        endPitch: 0.3,
        curve: 'linear'
    },
    interrogative: {
        pattern: 'rising',
        startPitch: 0.5,
        endPitch: 0.9,
        curve: 'exponential'
    },
    exclamative: {
        pattern: 'peak',
        startPitch: 0.6,
        peakPitch: 0.95,
        endPitch: 0.4,
        curve: 'bell'
    }
};
```

### Stress-Based Pitch Modulation
```javascript
// Pitch adjustment based on syllable stress
const applyStressModulation = (baseNote, stressLevel, contourPosition) => {
    const stressMultiplier = {
        primary: 1.2,      // +20% pitch increase
        secondary: 1.1,    // +10% pitch increase
        unstressed: 0.95   // -5% pitch decrease
    };
    
    const contourMultiplier = calculatePitchContour(contourPosition);
    return baseNote * stressMultiplier[stressLevel] * contourMultiplier;
};
```

## 5. PERFORMANCE OPTIMIZATION RULES

### Algorithm Efficiency Requirements
- **Real-time Processing:** All algorithms must process text under 150ms
- **Memory Usage:** Limit working memory to 50MB for linguistic processing
- **CPU Usage:** Maintain under 30% CPU usage during processing
- **Scalability:** Support text input up to 1000 words efficiently

### Optimization Strategies
```javascript
// Memoization for repeated calculations
const memoizedStressAnalysis = memoize(analyzeStressPattern);
const memoizedGrammaticalAnalysis = memoize(classifyGrammatically);

// Batch processing for efficiency
const processBatch = (words, batchSize = 50) => {
    const results = [];
    for (let i = 0; i < words.length; i += batchSize) {
        const batch = words.slice(i, i + batchSize);
        results.push(...processBatchInternal(batch));
    }
    return results;
};
```

### Error Handling in Algorithms
```javascript
// Graceful degradation for algorithm failures
const safeAnalyze = (text, analysisFunction, fallbackFunction) => {
    try {
        return analysisFunction(text);
    } catch (error) {
        console.warn('Analysis failed, using fallback:', error);
        return fallbackFunction(text);
    }
};
```

## 6. ACCURACY AND VALIDATION RULES

### Success Metrics (MANDATORY)
- **Grammatical Classification:** 85%+ accuracy for Portuguese words
- **Stress Detection:** 90%+ accuracy for syllable stress patterns
- **Phoneme Coverage:** 100% coverage of Portuguese phoneme inventory
- **Real-time Performance:** Sub-150ms processing time

### Validation Algorithms
```javascript
// Algorithm accuracy testing
const validateAccuracy = (testSet, algorithm) => {
    const results = testSet.map(test => ({
        input: test.input,
        expected: test.expected,
        actual: algorithm(test.input),
        correct: algorithm(test.input) === test.expected
    }));
    
    const accuracy = results.filter(r => r.correct).length / results.length;
    return { accuracy, results };
};
```

### Fallback Strategies
- **Linguistic Analysis Failure:** Use simple character-to-note mapping
- **Stress Detection Failure:** Apply default paroxytone stress pattern
- **Harmonic Analysis Failure:** Use basic I-V-vi-IV progression
- **Performance Issues:** Reduce processing complexity automatically

## 7. ALGORITHM EXTENSIBILITY

### Plugin Architecture for New Languages
```javascript
// Language-specific algorithm modules
const languageModules = {
    'pt-BR': {
        phonetic: './phonetic-engine.js',
        prosodic: './prosodic-engine.js',
        grammar: './grammar.js'
    },
    // Future language support
    'en-US': { /* English modules */ },
    'es-ES': { /* Spanish modules */ }
};
```

### Algorithm Configuration
```javascript
// Configurable algorithm parameters
const algorithmConfig = {
    linguistic: {
        enableStressAnalysis: true,
        enableProsodicContours: true,
        phoneticAccuracy: 'high'
    },
    musical: {
        harmonicComplexity: 'medium',
        rhythmVariation: 'high',
        scaleMappingStrategy: 'weighted'
    }
};
```

---

**Performance Requirements:** CRITICAL - All timing constraints must be met  
**Accuracy Requirements:** MANDATORY - Minimum accuracy thresholds must be achieved  
**Extensibility:** Designed for future language and feature additions  
**Last Updated:** 2025-09-16