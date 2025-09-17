/**
 * Text Highlighting Engine
 * Visual feedback system for text-to-MIDI playback
 * 
 * This module provides real-time visual highlighting of text during audio playback,
 * supporting character, syllable, and word-level highlighting modes.
 */

const TextHighlighter = (() => {
    // Highlighting modes
    const HIGHLIGHT_MODES = {
        CHARACTER: 'character',
        SYLLABLE: 'syllable', 
        WORD: 'word',
        PHONEME: 'phoneme'
    };

    // Current state
    let currentMode = HIGHLIGHT_MODES.CHARACTER;
    let isHighlighting = false;
    let highlightScheduleIds = [];
    let textContainer = null;
    let originalText = '';
    let processedSequence = null;

    // Highlight styles
    const HIGHLIGHT_STYLES = {
        current: {
            backgroundColor: '#ffeb3b',
            color: '#333',
            fontWeight: 'bold',
            borderRadius: '3px',
            padding: '2px 4px',
            margin: '0 1px',
            transition: 'all 0.2s ease'
        },
        upcoming: {
            backgroundColor: '#e3f2fd',
            color: '#1976d2',
            borderRadius: '3px',
            padding: '2px 4px',
            margin: '0 1px'
        },
        completed: {
            backgroundColor: '#c8e6c9',
            color: '#388e3c',
            borderRadius: '3px',
            padding: '2px 4px',
            margin: '0 1px',
            opacity: '0.8'
        },
        grammatical: {
            NOUN: { borderBottom: '2px solid #4CAF50' },
            VERB: { borderBottom: '2px solid #F44336' },
            ADJECTIVE: { borderBottom: '2px solid #2196F3' },
            ADVERB: { borderBottom: '2px solid #FF9800' },
            ARTICLE: { borderBottom: '2px solid #9E9E9E' },
            PREPOSITION: { borderBottom: '2px solid #607D8B' },
            PRONOUN: { borderBottom: '2px solid #795548' },
            CONJUNCTION: { borderBottom: '2px solid #9C27B0' },
            INTERJECTION: { borderBottom: '2px solid #E91E63' }
        },
        stress: {
            primary: { 
                textShadow: '0 0 8px #ffeb3b',
                fontWeight: 'bold'
            },
            secondary: {
                textShadow: '0 0 4px #ffc107',
                fontWeight: '600'
            },
            weak: {
                opacity: '0.7'
            }
        }
    };

    /**
     * Initializes the text highlighter with a container element
     * @param {HTMLElement} container - Container element for highlighted text
     */
    function initialize(container) {
        textContainer = container;
        
        // Add CSS styles to document
        addHighlightStyles();
        
        console.log('Text Highlighter initialized');
    }

    /**
     * Sets the highlighting mode
     * @param {string} mode - Highlighting mode (character, syllable, word, phoneme)
     */
    function setHighlightMode(mode) {
        if (!Object.values(HIGHLIGHT_MODES).includes(mode)) {
            console.error(`Invalid highlight mode: ${mode}`);
            return false;
        }
        
        currentMode = mode;
        console.log(`Highlight mode set to: ${mode}`);
        return true;
    }

    /**
     * Prepares text for highlighting based on current mode and linguistic analysis
     * @param {string} text - Original text
     * @param {Object} linguisticResult - Result from LinguisticIntegration.processText
     */
    function prepareText(text, linguisticResult) {
        originalText = text;
        processedSequence = linguisticResult;
        
        if (!textContainer) {
            console.error('Text container not initialized');
            return;
        }

        // Clear previous content
        textContainer.innerHTML = '';
        
        // Generate highlighted structure based on mode
        switch (currentMode) {
            case HIGHLIGHT_MODES.CHARACTER:
                generateCharacterHighlights(text, linguisticResult);
                break;
            case HIGHLIGHT_MODES.SYLLABLE:
                generateSyllableHighlights(text, linguisticResult);
                break;
            case HIGHLIGHT_MODES.WORD:
                generateWordHighlights(text, linguisticResult);
                break;
            case HIGHLIGHT_MODES.PHONEME:
                generatePhonemeHighlights(text, linguisticResult);
                break;
        }
    }

    /**
     * Generates character-level highlighting structure
     * @param {string} text - Original text
     * @param {Object} linguisticResult - Linguistic analysis result
     */
    function generateCharacterHighlights(text, linguisticResult) {
        const sequence = linguisticResult.finalSequence || [];
        
        text.split('').forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char;
            span.className = 'highlight-char';
            span.dataset.index = index;
            span.dataset.char = char;
            
            // Add grammatical styling if available
            const sequenceItem = sequence[index];
            if (sequenceItem && sequenceItem.wordType) {
                span.classList.add(`grammar-${sequenceItem.wordType.toLowerCase()}`);
                if (sequenceItem.stressed) {
                    span.classList.add('stressed');
                }
            }
            
            // Handle spaces and punctuation
            if (char === ' ') {
                span.classList.add('space');
            } else if (/[.,!?;:]/.test(char)) {
                span.classList.add('punctuation');
            }
            
            textContainer.appendChild(span);
        });
    }

    /**
     * Generates syllable-level highlighting structure
     * @param {string} text - Original text
     * @param {Object} linguisticResult - Linguistic analysis result
     */
    function generateSyllableHighlights(text, linguisticResult) {
        const words = text.split(/(\s+)/); // Preserve whitespace
        let syllableIndex = 0;
        
        words.forEach(word => {
            if (/^\s+$/.test(word)) {
                // Whitespace
                const span = document.createElement('span');
                span.textContent = word;
                span.className = 'highlight-space';
                textContainer.appendChild(span);
                return;
            }
            
            // Get syllables for this word
            const syllables = StressAnalyzer.syllabify(word);
            const stressAnalysis = StressAnalyzer.detectStress(word);
            
            syllables.forEach((syllable, index) => {
                const span = document.createElement('span');
                span.textContent = syllable;
                span.className = 'highlight-syllable';
                span.dataset.syllableIndex = syllableIndex;
                span.dataset.wordSyllableIndex = index;
                span.dataset.syllable = syllable;
                
                // Add stress styling
                if (index === stressAnalysis.position) {
                    span.classList.add('primary-stress');
                } else {
                    const stressLevel = StressAnalyzer.calculateStressLevel(index, stressAnalysis, syllables.length);
                    if (stressLevel > 0.5) {
                        span.classList.add('secondary-stress');
                    } else {
                        span.classList.add('weak-stress');
                    }
                }
                
                textContainer.appendChild(span);
                syllableIndex++;
            });
        });
    }

    /**
     * Generates word-level highlighting structure
     * @param {string} text - Original text
     * @param {Object} linguisticResult - Linguistic analysis result
     */
    function generateWordHighlights(text, linguisticResult) {
        const words = text.split(/(\s+)/); // Preserve whitespace
        const grammaticalAnalysis = linguisticResult.grammaticalAnalysis || [];
        let wordIndex = 0;
        
        words.forEach(word => {
            const span = document.createElement('span');
            span.textContent = word;
            
            if (/^\s+$/.test(word)) {
                // Whitespace
                span.className = 'highlight-space';
            } else {
                // Word
                span.className = 'highlight-word';
                span.dataset.wordIndex = wordIndex;
                span.dataset.word = word;
                
                // Add grammatical styling
                const grammarData = grammaticalAnalysis[wordIndex];
                if (grammarData) {
                    span.classList.add(`grammar-${grammarData.type.toLowerCase()}`);
                    span.dataset.grammarType = grammarData.type;
                    span.dataset.weight = grammarData.weight;
                }
                
                wordIndex++;
            }
            
            textContainer.appendChild(span);
        });
    }

    /**
     * Generates phoneme-level highlighting structure
     * @param {string} text - Original text
     * @param {Object} linguisticResult - Linguistic analysis result
     */
    function generatePhonemeHighlights(text, linguisticResult) {
        if (!linguisticResult.phoneticAnalysis) {
            // Fallback to character highlighting
            generateCharacterHighlights(text, linguisticResult);
            return;
        }
        
        const phonemes = linguisticResult.phoneticAnalysis;
        let charIndex = 0;
        
        phonemes.forEach((phoneme, index) => {
            const span = document.createElement('span');
            
            if (phoneme === '_') {
                // Word boundary
                span.textContent = ' ';
                span.className = 'highlight-space';
                charIndex++;
            } else if (phoneme === '|') {
                // Pause marker
                span.textContent = text[charIndex] || '';
                span.className = 'highlight-pause';
                charIndex++;
            } else {
                // Regular phoneme
                span.textContent = text[charIndex] || phoneme;
                span.className = 'highlight-phoneme';
                span.dataset.phonemeIndex = index;
                span.dataset.phoneme = phoneme;
                
                // Add phonetic styling
                const phonemeData = PhoneticEngine.PHONEME_MAP[phoneme];
                if (phonemeData) {
                    if (phonemeData.nasal) span.classList.add('nasal');
                    if (phonemeData.voicing) span.classList.add('voiced');
                    if (phonemeData.articulation) span.classList.add(phonemeData.articulation);
                }
                
                charIndex++;
            }
            
            textContainer.appendChild(span);
        });
    }

    /**
     * Starts real-time highlighting synchronized with audio playback
     * @param {Object} linguisticResult - Result from text processing
     */
    function startHighlighting(linguisticResult) {
        if (isHighlighting) {
            stopHighlighting();
        }
        
        isHighlighting = true;
        highlightScheduleIds = [];
        
        const sequence = linguisticResult.finalSequence || [];
        let currentTime = 0;
        
        console.log(`Starting ${currentMode} highlighting for ${sequence.length} items`);
        
        sequence.forEach((item, index) => {
            const duration = item.duration || '8n';
            const durationSeconds = Tone.Time(duration).toSeconds();
            
            // Schedule highlight activation
            const scheduleId = Tone.Transport.scheduleOnce(() => {
                highlightItem(index, 'current');
                
                // Clear previous highlights
                if (index > 0) {
                    highlightItem(index - 1, 'completed');
                }
                
                // Show upcoming highlights
                if (index < sequence.length - 1) {
                    highlightItem(index + 1, 'upcoming');
                }
                
            }, currentTime);
            
            highlightScheduleIds.push(scheduleId);
            currentTime += durationSeconds;
        });
        
        // Schedule final cleanup
        const cleanupId = Tone.Transport.scheduleOnce(() => {
            if (sequence.length > 0) {
                highlightItem(sequence.length - 1, 'completed');
            }
            isHighlighting = false;
        }, currentTime);
        
        highlightScheduleIds.push(cleanupId);
    }

    /**
     * Highlights a specific item based on the current mode
     * @param {number} index - Index of item to highlight
     * @param {string} state - Highlight state (current, upcoming, completed)
     */
    function highlightItem(index, state) {
        if (!textContainer) return;
        
        let selector;
        switch (currentMode) {
            case HIGHLIGHT_MODES.CHARACTER:
                selector = `.highlight-char[data-index="${index}"]`;
                break;
            case HIGHLIGHT_MODES.SYLLABLE:
                selector = `.highlight-syllable[data-syllable-index="${index}"]`;
                break;
            case HIGHLIGHT_MODES.WORD:
                selector = `.highlight-word[data-word-index="${index}"]`;
                break;
            case HIGHLIGHT_MODES.PHONEME:
                selector = `.highlight-phoneme[data-phoneme-index="${index}"]`;
                break;
        }
        
        const element = textContainer.querySelector(selector);
        if (!element) return;
        
        // Clear previous highlight classes
        element.classList.remove('highlight-current', 'highlight-upcoming', 'highlight-completed');
        
        // Add new highlight class
        element.classList.add(`highlight-${state}`);
        
        // Scroll element into view if needed
        if (state === 'current') {
            element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'nearest'
            });
        }
    }

    /**
     * Stops highlighting and clears all scheduled events
     */
    function stopHighlighting() {
        if (!isHighlighting) return;
        
        // Cancel all scheduled highlight events
        highlightScheduleIds.forEach(id => {
            Tone.Transport.clear(id);
        });
        
        highlightScheduleIds = [];
        isHighlighting = false;
        
        // Clear all highlight classes
        if (textContainer) {
            const highlightedElements = textContainer.querySelectorAll('[class*="highlight-"]');
            highlightedElements.forEach(element => {
                element.classList.remove('highlight-current', 'highlight-upcoming', 'highlight-completed');
            });
        }
        
        console.log('Highlighting stopped');
    }

    /**
     * Adds CSS styles for highlighting to the document
     */
    function addHighlightStyles() {
        const styleId = 'text-highlighter-styles';
        
        // Check if styles already exist
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* Text Highlighter Styles */
            .highlight-char, .highlight-syllable, .highlight-word, .highlight-phoneme {
                display: inline-block;
                transition: all 0.2s ease;
                position: relative;
            }
            
            .highlight-space {
                white-space: pre;
            }
            
            /* Current highlight */
            .highlight-current {
                background-color: #ffeb3b !important;
                color: #333 !important;
                font-weight: bold !important;
                border-radius: 3px !important;
                padding: 2px 4px !important;
                margin: 0 1px !important;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
                transform: scale(1.05);
                z-index: 10;
            }
            
            /* Upcoming highlight */
            .highlight-upcoming {
                background-color: #e3f2fd !important;
                color: #1976d2 !important;
                border-radius: 3px !important;
                padding: 2px 4px !important;
                margin: 0 1px !important;
            }
            
            /* Completed highlight */
            .highlight-completed {
                background-color: #c8e6c9 !important;
                color: #388e3c !important;
                border-radius: 3px !important;
                padding: 2px 4px !important;
                margin: 0 1px !important;
                opacity: 0.8 !important;
            }
            
            /* Grammatical type styling */
            .grammar-noun { border-bottom: 2px solid #4CAF50; }
            .grammar-verb { border-bottom: 2px solid #F44336; }
            .grammar-adjective { border-bottom: 2px solid #2196F3; }
            .grammar-adverb { border-bottom: 2px solid #FF9800; }
            .grammar-article { border-bottom: 2px solid #9E9E9E; }
            .grammar-preposition { border-bottom: 2px solid #607D8B; }
            .grammar-pronoun { border-bottom: 2px solid #795548; }
            .grammar-conjunction { border-bottom: 2px solid #9C27B0; }
            .grammar-interjection { border-bottom: 2px solid #E91E63; }
            
            /* Stress level styling */
            .primary-stress {
                text-shadow: 0 0 8px #ffeb3b;
                font-weight: bold;
            }
            
            .secondary-stress {
                text-shadow: 0 0 4px #ffc107;
                font-weight: 600;
            }
            
            .weak-stress {
                opacity: 0.7;
            }
            
            /* Phonetic styling */
            .nasal { text-decoration: underline wavy; }
            .voiced { font-style: italic; }
            .fricative { letter-spacing: 1px; }
            .plosive { font-weight: bold; }
            .liquid { text-decoration: underline; }
            
            /* Punctuation styling */
            .punctuation {
                color: #666;
                font-weight: normal;
            }
            
            /* Hover effects */
            .highlight-char:hover, .highlight-syllable:hover, 
            .highlight-word:hover, .highlight-phoneme:hover {
                background-color: #f5f5f5;
                cursor: pointer;
            }
            
            /* Animation for current highlight */
            @keyframes highlight-pulse {
                0% { transform: scale(1.05); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1.05); }
            }
            
            .highlight-current {
                animation: highlight-pulse 0.5s ease-in-out;
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
                .highlight-char, .highlight-syllable, 
                .highlight-word, .highlight-phoneme {
                    padding: 1px 2px !important;
                    margin: 0 0.5px !important;
                    font-size: 0.9em;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * Gets current highlighting state and statistics
     * @returns {Object} Current state information
     */
    function getHighlightState() {
        return {
            mode: currentMode,
            isHighlighting: isHighlighting,
            scheduledEvents: highlightScheduleIds.length,
            containerInitialized: !!textContainer,
            originalTextLength: originalText.length,
            availableModes: Object.values(HIGHLIGHT_MODES)
        };
    }

    /**
     * Provides debugging information for the highlighter
     * @returns {Object} Debug information
     */
    function debugHighlighter() {
        const state = getHighlightState();
        const containerInfo = textContainer ? {
            hasContainer: true,
            childCount: textContainer.children.length,
            innerHTML: textContainer.innerHTML.substring(0, 200) + '...'
        } : { hasContainer: false };
        
        return {
            state: state,
            container: containerInfo,
            styles: document.getElementById('text-highlighter-styles') ? 'loaded' : 'missing',
            modes: HIGHLIGHT_MODES
        };
    }

    // Export public interface
    return {
        initialize,
        setHighlightMode,
        prepareText,
        startHighlighting,
        stopHighlighting,
        getHighlightState,
        debugHighlighter,
        HIGHLIGHT_MODES
    };
})();

// Make available globally
if (typeof window !== 'undefined') {
    window.TextHighlighter = TextHighlighter;
}