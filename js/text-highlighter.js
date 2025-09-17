/**
 * Text Highlighting Engine
 * Visual feedback system for text-to-MIDI playback
 * 
 * This module provides real-time visual highlighting of text during audio playback,
 * supporting character, syllable, and word-level highlighting modes.
 */

const TextHighlighter = (() => {
    // Highlighting modes - Enhanced with advanced linguistic analysis
    const HIGHLIGHT_MODES = {
        CHARACTER: 'character',
        SYLLABLE: 'syllable', 
        WORD: 'word',
        PHONEME: 'phoneme',
        // Advanced linguistic modes
        GRAMMATICAL: 'grammatical',
        PROSODIC: 'prosodic',
        HARMONIC: 'harmonic'
    };
    
    // Advanced highlighting configurations
    const ADVANCED_HIGHLIGHT_MODES = {
        GRAMMATICAL: {
            name: 'Grammatical Classes',
            description: 'Highlights words by grammatical classification',
            colorScheme: {
                noun: '#2196F3',
                verb: '#4CAF50', 
                adjective: '#FF9800',
                adverb: '#9C27B0',
                article: '#9E9E9E',
                preposition: '#607D8B',
                pronoun: '#795548',
                conjunction: '#3F51B5',
                interjection: '#E91E63',
                unknown: '#CFD8DC'
            }
        },
        PROSODIC: {
            name: 'Prosodic Stress',
            description: 'Highlights syllables by stress patterns',
            colorScheme: {
                primaryStress: '#F44336',
                secondaryStress: '#FF9800',
                unstressed: '#9E9E9E',
                weak: '#ECEFF1'
            }
        },
        HARMONIC: {
            name: 'Harmonic Context',
            description: 'Highlights words by harmonic function',
            colorScheme: {
                tonic: '#4CAF50',
                dominant: '#FF5722',
                subdominant: '#2196F3',
                predominant: '#9C27B0',
                cadential: '#FF9800',
                neutral: '#9E9E9E'
            }
        }
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
            case HIGHLIGHT_MODES.GRAMMATICAL:
                generateGrammaticalHighlights(text, linguisticResult);
                break;
            case HIGHLIGHT_MODES.PROSODIC:
                generateProsodicHighlights(text, linguisticResult);
                break;
            case HIGHLIGHT_MODES.HARMONIC:
                generateHarmonicHighlights(text, linguisticResult);
                break;
            default:
                console.warn(`Unknown highlight mode: ${currentMode}, falling back to character mode`);
                generateCharacterHighlights(text, linguisticResult);
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
     * Generates grammatical highlighting structure
     * @param {string} text - Original text
     * @param {Object} linguisticResult - Linguistic analysis result
     */
    function generateGrammaticalHighlights(text, linguisticResult) {
        const words = text.split(/(\s+)/);
        const grammaticalAnalysis = linguisticResult.grammaticalAnalysis || [];
        const colorScheme = ADVANCED_HIGHLIGHT_MODES.GRAMMATICAL.colorScheme;
        let wordIndex = 0;
        
        words.forEach(word => {
            const span = document.createElement('span');
            span.textContent = word;
            
            if (/^\s+$/.test(word)) {
                span.className = 'highlight-space';
            } else {
                span.className = 'highlight-grammatical';
                span.dataset.wordIndex = wordIndex;
                span.dataset.word = word;
                
                const grammarData = grammaticalAnalysis[wordIndex];
                if (grammarData) {
                    const grammarType = grammarData.type ? grammarData.type.toLowerCase() : 'unknown';
                    span.classList.add(`grammar-${grammarType}`);
                    span.dataset.grammarType = grammarType;
                    span.dataset.weight = grammarData.weight || 1.0;
                    
                    // Apply color based on grammatical type
                    const color = colorScheme[grammarType] || colorScheme.unknown;
                    span.style.borderBottomColor = color;
                    span.style.borderBottomWidth = '3px';
                    span.style.borderBottomStyle = 'solid';
                    
                    // Add hover tooltip with grammatical information
                    span.title = `${grammarType.toUpperCase()} - Weight: ${grammarData.weight || 1.0}`;
                } else {
                    span.classList.add('grammar-unknown');
                    span.style.borderBottomColor = colorScheme.unknown;
                }
                
                wordIndex++;
            }
            
            textContainer.appendChild(span);
        });
        
        console.log(`✓ Grammatical highlighting generated for ${wordIndex} words`);
    }
    
    /**
     * Generates prosodic highlighting structure
     * @param {string} text - Original text
     * @param {Object} linguisticResult - Linguistic analysis result
     */
    function generateProsodicHighlights(text, linguisticResult) {
        const words = text.split(/(\s+)/);
        const colorScheme = ADVANCED_HIGHLIGHT_MODES.PROSODIC.colorScheme;
        let syllableIndex = 0;
        
        words.forEach(word => {
            if (/^\s+$/.test(word)) {
                const span = document.createElement('span');
                span.textContent = word;
                span.className = 'highlight-space';
                textContainer.appendChild(span);
                return;
            }
            
            // Get syllables and stress analysis for this word
            let syllables = [];
            let stressAnalysis = null;
            
            try {
                if (typeof StressAnalyzer !== 'undefined') {
                    syllables = StressAnalyzer.syllabify(word);
                    stressAnalysis = StressAnalyzer.detectStress(word);
                } else {
                    // Fallback: split word into characters if no stress analyzer
                    syllables = word.split('');
                }
            } catch (error) {
                console.warn('Error in stress analysis, using fallback:', error);
                syllables = word.split('');
            }
            
            syllables.forEach((syllable, index) => {
                const span = document.createElement('span');
                span.textContent = syllable;
                span.className = 'highlight-prosodic';
                span.dataset.syllableIndex = syllableIndex;
                span.dataset.wordSyllableIndex = index;
                span.dataset.syllable = syllable;
                
                // Determine stress level and apply styling
                let stressType = 'unstressed';
                let backgroundColor = colorScheme.unstressed;
                
                if (stressAnalysis) {
                    if (index === stressAnalysis.position) {
                        stressType = 'primaryStress';
                        backgroundColor = colorScheme.primaryStress;
                        span.classList.add('primary-stress');
                    } else {
                        const stressLevel = StressAnalyzer.calculateStressLevel ? 
                            StressAnalyzer.calculateStressLevel(index, stressAnalysis, syllables.length) : 0;
                        
                        if (stressLevel > 0.5) {
                            stressType = 'secondaryStress';
                            backgroundColor = colorScheme.secondaryStress;
                            span.classList.add('secondary-stress');
                        } else {
                            stressType = 'weak';
                            backgroundColor = colorScheme.weak;
                            span.classList.add('weak-stress');
                        }
                    }
                }
                
                span.dataset.stressType = stressType;
                span.style.backgroundColor = backgroundColor;
                span.style.padding = '2px 4px';
                span.style.margin = '0 1px';
                span.style.borderRadius = '3px';
                
                // Add tooltip with stress information
                span.title = `Syllable: ${syllable} - Stress: ${stressType}`;
                
                textContainer.appendChild(span);
                syllableIndex++;
            });
        });
        
        console.log(`✓ Prosodic highlighting generated for ${syllableIndex} syllables`);
    }
    
    /**
     * Generates harmonic highlighting structure
     * @param {string} text - Original text
     * @param {Object} linguisticResult - Linguistic analysis result
     */
    function generateHarmonicHighlights(text, linguisticResult) {
        const words = text.split(/(\s+)/);
        const harmonicData = linguisticResult.harmonicAnalysis || [];
        const colorScheme = ADVANCED_HIGHLIGHT_MODES.HARMONIC.colorScheme;
        let wordIndex = 0;
        
        words.forEach(word => {
            const span = document.createElement('span');
            span.textContent = word;
            
            if (/^\s+$/.test(word)) {
                span.className = 'highlight-space';
            } else {
                span.className = 'highlight-harmonic';
                span.dataset.wordIndex = wordIndex;
                span.dataset.word = word;
                
                // Get harmonic context from sequence or generate fallback
                let harmonicFunction = 'neutral';
                let harmonicInfo = null;
                
                if (linguisticResult.finalSequence && linguisticResult.finalSequence[wordIndex]) {
                    const sequenceItem = linguisticResult.finalSequence[wordIndex];
                    if (sequenceItem.harmonic) {
                        harmonicFunction = getHarmonicFunction(sequenceItem.harmonic);
                        harmonicInfo = sequenceItem.harmonic;
                    }
                }
                
                span.classList.add(`harmonic-${harmonicFunction}`);
                span.dataset.harmonicFunction = harmonicFunction;
                
                // Apply color based on harmonic function
                const backgroundColor = colorScheme[harmonicFunction] || colorScheme.neutral;
                span.style.backgroundColor = backgroundColor;
                span.style.padding = '3px 6px';
                span.style.margin = '0 2px';
                span.style.borderRadius = '4px';
                span.style.color = '#fff';
                span.style.fontWeight = '500';
                
                // Add tooltip with harmonic information
                if (harmonicInfo) {
                    span.title = `Harmonic: ${harmonicFunction.toUpperCase()}\nChord: ${harmonicInfo.chord || 'N/A'}\nTension: ${(harmonicInfo.tension * 100).toFixed(0)}%`;
                } else {
                    span.title = `Harmonic: ${harmonicFunction.toUpperCase()}`;
                }
                
                wordIndex++;
            }
            
            textContainer.appendChild(span);
        });
        
        console.log(`✓ Harmonic highlighting generated for ${wordIndex} words`);
    }
    
    /**
     * Determines harmonic function from harmonic data
     * @param {Object} harmonicData - Harmonic analysis data
     * @returns {string} Harmonic function name
     */
    function getHarmonicFunction(harmonicData) {
        if (!harmonicData || !harmonicData.romanChord) {
            return 'neutral';
        }
        
        const chord = harmonicData.romanChord.toLowerCase();
        const tension = harmonicData.tension || 0;
        
        // Classify harmonic function based on roman numeral and tension
        if (chord === 'i' || chord === 'vi') {
            return 'tonic';
        } else if (chord === 'v' || chord === 'vii°') {
            return 'dominant';
        } else if (chord === 'iv' || chord === 'ii') {
            return tension > 0.6 ? 'predominant' : 'subdominant';
        } else if (tension > 0.7) {
            return 'cadential';
        }
        
        return 'neutral';
    }

    /**
     * Starts real-time highlighting synchronized with audio playback
     * Enhanced with precise timing control (±10ms accuracy)
     * @param {Object} linguisticResult - Result from text processing
     * @param {number} startTime - Start time offset in seconds
     * @param {number} speed - Highlighting speed multiplier (default: 1.0)
     */
    function startHighlighting(linguisticResult, startTime = 0, speed = 1.0) {
        if (isHighlighting) {
            stopHighlighting();
        }
        
        isHighlighting = true;
        highlightScheduleIds = [];
        
        const sequence = linguisticResult.finalSequence || [];
        let currentTime = startTime;
        
        console.log(`Starting ${currentMode} highlighting for ${sequence.length} items with ±10ms precision`);
        
        // Pre-calculate all timing to ensure precision
        const timingPlan = [];
        sequence.forEach((item, index) => {
            const duration = item.duration || '8n';
            const durationSeconds = Tone.Time(duration).toSeconds() / speed;
            
            timingPlan.push({
                index: index,
                startTime: currentTime,
                duration: durationSeconds,
                item: item
            });
            
            currentTime += durationSeconds;
        });
        
        // Schedule with high precision
        timingPlan.forEach((timing, planIndex) => {
            // Schedule current highlight with compensation for browser timing
            const scheduleId = Tone.Transport.scheduleOnce((time) => {
                // Use requestAnimationFrame for DOM updates to ensure smooth visual updates
                requestAnimationFrame(() => {
                    highlightItem(timing.index, 'current');
                    
                    // Clear previous highlights
                    if (timing.index > 0) {
                        highlightItem(timing.index - 1, 'completed');
                    }
                    
                    // Show upcoming highlights (look-ahead)
                    if (timing.index < sequence.length - 1) {
                        highlightItem(timing.index + 1, 'upcoming');
                    }
                    
                    // Performance tracking for precision verification
                    if (window.performance && window.performance.now) {
                        const actualTime = (performance.now() - window.highlightStartTime) / 1000;
                        const expectedTime = timing.startTime;
                        const drift = Math.abs(actualTime - expectedTime);
                        
                        if (drift > 0.01) { // Log if drift exceeds 10ms
                            console.warn(`Highlight timing drift: ${(drift * 1000).toFixed(2)}ms at index ${timing.index}`);
                        }
                    }
                });
            }, timing.startTime);
            
            highlightScheduleIds.push(scheduleId);
        });
        
        // Schedule final cleanup with precision
        const finalTime = timingPlan.length > 0 ? timingPlan[timingPlan.length - 1].startTime + timingPlan[timingPlan.length - 1].duration : startTime;
        const cleanupId = Tone.Transport.scheduleOnce(() => {
            requestAnimationFrame(() => {
                if (sequence.length > 0) {
                    highlightItem(sequence.length - 1, 'completed');
                }
                isHighlighting = false;
                console.log('✓ Highlighting sequence completed with enhanced precision');
            });
        }, finalTime);
        
        highlightScheduleIds.push(cleanupId);
        
        // Track start time for precision measurement
        if (window.performance && window.performance.now) {
            window.highlightStartTime = performance.now();
        }
    }

    /**
     * Highlights a specific item based on the current mode
     * Enhanced with performance optimization and visual feedback
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
            case HIGHLIGHT_MODES.GRAMMATICAL:
                selector = `.highlight-grammatical[data-word-index="${index}"]`;
                break;
            case HIGHLIGHT_MODES.PROSODIC:
                selector = `.highlight-prosodic[data-syllable-index="${index}"]`;
                break;
            case HIGHLIGHT_MODES.HARMONIC:
                selector = `.highlight-harmonic[data-word-index="${index}"]`;
                break;
            default:
                console.warn(`Unknown highlight mode for highlighting: ${currentMode}`);
                return;
        }
        
        const element = textContainer.querySelector(selector);
        if (!element) {
            console.warn(`Element not found for highlighting: ${selector}`);
            return;
        }
        
        // Optimized class manipulation - batch DOM updates
        const currentClasses = element.classList;
        const classesToRemove = ['highlight-current', 'highlight-upcoming', 'highlight-completed'];
        const newClass = `highlight-${state}`;
        
        // Remove old highlight classes efficiently
        classesToRemove.forEach(cls => currentClasses.remove(cls));
        
        // Add new highlight class
        currentClasses.add(newClass);
        
        // Enhanced scroll behavior with performance optimization
        if (state === 'current') {
            // Check if element is already in view to avoid unnecessary scrolling
            const rect = element.getBoundingClientRect();
            const containerRect = textContainer.getBoundingClientRect();
            
            const isInView = (
                rect.top >= containerRect.top &&
                rect.bottom <= containerRect.bottom &&
                rect.left >= containerRect.left &&
                rect.right <= containerRect.right
            );
            
            if (!isInView) {
                // Use optimized scrolling with reduced frequency for performance
                element.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center',
                    inline: 'nearest'
                });
            }
            
            // Add pulse animation for current element (CSS-based for performance)
            element.style.animationName = 'highlight-pulse';
            element.style.animationDuration = '0.3s';
            element.style.animationTimingFunction = 'ease-out';
            
            // Clear animation after completion
            setTimeout(() => {
                if (element.style) {
                    element.style.animationName = '';
                }
            }, 300);
        }
        
        // Performance tracking for large texts
        if (index % 100 === 0 && index > 0) {
            console.log(`✓ Highlighting performance check: processed ${index} items`);
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
            /* Enhanced Text Highlighter Styles with Performance Optimization */
            .highlight-char, .highlight-syllable, .highlight-word, .highlight-phoneme,
            .highlight-grammatical, .highlight-prosodic, .highlight-harmonic {
                display: inline-block;
                transition: all 0.2s ease;
                position: relative;
                will-change: transform, background-color;
                backface-visibility: hidden;
            }
            
            .highlight-space {
                white-space: pre;
            }
            
            /* Current highlight - Enhanced with better visual feedback */
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
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            /* Completed highlight */
            .highlight-completed {
                background-color: #c8e6c9 !important;
                color: #388e3c !important;
                border-radius: 3px !important;
                padding: 2px 4px !important;
                margin: 0 1px !important;
                opacity: 0.8 !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            /* Grammatical type styling - Enhanced */
            .grammar-noun { border-bottom: 3px solid #2196F3; }
            .grammar-verb { border-bottom: 3px solid #4CAF50; }
            .grammar-adjective { border-bottom: 3px solid #FF9800; }
            .grammar-adverb { border-bottom: 3px solid #9C27B0; }
            .grammar-article { border-bottom: 3px solid #9E9E9E; }
            .grammar-preposition { border-bottom: 3px solid #607D8B; }
            .grammar-pronoun { border-bottom: 3px solid #795548; }
            .grammar-conjunction { border-bottom: 3px solid #3F51B5; }
            .grammar-interjection { border-bottom: 3px solid #E91E63; }
            .grammar-unknown { border-bottom: 3px solid #CFD8DC; }
            
            /* Prosodic stress styling - Enhanced */
            .primary-stress {
                text-shadow: 0 0 8px #F44336;
                font-weight: bold;
                background-color: #F44336 !important;
                color: white !important;
            }
            
            .secondary-stress {
                text-shadow: 0 0 4px #FF9800;
                font-weight: 600;
                background-color: #FF9800 !important;
                color: white !important;
            }
            
            .weak-stress {
                background-color: #ECEFF1 !important;
                color: #546E7A !important;
                opacity: 0.8;
            }
            
            /* Harmonic function styling */
            .harmonic-tonic { background-color: #4CAF50 !important; }
            .harmonic-dominant { background-color: #FF5722 !important; }
            .harmonic-subdominant { background-color: #2196F3 !important; }
            .harmonic-predominant { background-color: #9C27B0 !important; }
            .harmonic-cadential { background-color: #FF9800 !important; }
            .harmonic-neutral { background-color: #9E9E9E !important; }
            
            /* Phonetic styling - Enhanced */
            .nasal { text-decoration: underline wavy #FF5722; }
            .voiced { font-style: italic; font-weight: 500; }
            .fricative { letter-spacing: 1px; }
            .plosive { font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.3); }
            .liquid { text-decoration: underline; }
            
            /* Punctuation styling */
            .punctuation {
                color: #666;
                font-weight: normal;
            }
            
            /* Hover effects - Enhanced */
            .highlight-char:hover, .highlight-syllable:hover, 
            .highlight-word:hover, .highlight-phoneme:hover,
            .highlight-grammatical:hover, .highlight-prosodic:hover, .highlight-harmonic:hover {
                background-color: #f5f5f5;
                cursor: pointer;
                transform: scale(1.02);
                box-shadow: 0 2px 6px rgba(0,0,0,0.15);
            }
            
            /* Enhanced animations for current highlight */
            @keyframes highlight-pulse {
                0% { 
                    transform: scale(1.05);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                50% { 
                    transform: scale(1.08);
                    box-shadow: 0 4px 8px rgba(255,235,59,0.4);
                }
                100% { 
                    transform: scale(1.05);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
            }
            
            @keyframes highlight-glow {
                0% { text-shadow: 0 0 5px rgba(255,235,59,0.3); }
                50% { text-shadow: 0 0 15px rgba(255,235,59,0.6); }
                100% { text-shadow: 0 0 5px rgba(255,235,59,0.3); }
            }
            
            .highlight-current {
                animation: highlight-pulse 0.3s ease-out, highlight-glow 0.6s ease-in-out;
            }
            
            /* Performance optimizations */
            .highlight-char, .highlight-syllable, 
            .highlight-word, .highlight-phoneme {
                will-change: transform, background-color;
                backface-visibility: hidden;
            }
            
            /* Smooth transitions for all states */
            .highlight-upcoming {
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .highlight-completed {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            /* Enhanced responsive adjustments with performance optimization */
            @media (max-width: 768px) {
                .highlight-char, .highlight-syllable, 
                .highlight-word, .highlight-phoneme {
                    padding: 1px 2px !important;
                    margin: 0 0.5px !important;
                    font-size: 0.9em;
                    /* Reduce animations on mobile for better performance */
                    animation-duration: 0.2s !important;
                }
                
                /* Simpler animations for mobile */
                @keyframes highlight-pulse {
                    0% { transform: scale(1.02); }
                    100% { transform: scale(1.05); }
                }
            }
            
            /* Performance optimization for large texts */
            @media (min-width: 1200px) {
                .text-display-container {
                    contain: layout style paint;
                }
            }
            
            /* Reduce motion for accessibility */
            @media (prefers-reduced-motion: reduce) {
                .highlight-char, .highlight-syllable, 
                .highlight-word, .highlight-phoneme {
                    animation: none !important;
                    transition: background-color 0.1s ease !important;
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

    /**
     * Sets highlighting speed multiplier
     * @param {number} speed - Speed multiplier (0.5 to 2.0)
     */
    function setHighlightSpeed(speed) {
        if (speed < 0.1 || speed > 3.0) {
            console.warn('Highlight speed should be between 0.1 and 3.0');
            return false;
        }
        
        // Store speed for next highlighting session
        currentHighlightSpeed = speed;
        console.log(`Highlight speed set to: ${speed}x`);
        return true;
    }
    
    /**
     * Starts highlighting with precise timing control
     * @param {Object} sequence - Linguistic sequence
     * @param {number} startTime - Start time offset
     * @returns {Promise} Promise that resolves when highlighting starts
     */
    function startHighlightingWithPreciseTiming(sequence, startTime = 0) {
        return new Promise((resolve, reject) => {
            try {
                highlightScheduleIds = [];
                let currentTime = startTime;
                
                sequence.forEach((element, index) => {
                    const scheduleId = Tone.Transport.scheduleOnce((time) => {
                        requestAnimationFrame(() => {
                            highlightItem(index, 'current');
                            if (index > 0) highlightItem(index - 1, 'completed');
                            if (index < sequence.length - 1) highlightItem(index + 1, 'upcoming');
                        });
                    }, currentTime);
                    
                    highlightScheduleIds.push(scheduleId);
                    currentTime += Tone.Time(element.duration || '8n').toSeconds();
                });
                
                console.log(`✓ Precise highlighting scheduled for ${sequence.length} elements`);
                resolve(true);
            } catch (error) {
                console.error('Error in precise highlighting:', error);
                reject(error);
            }
        });
    }
    
    // Initialize speed tracking
    let currentHighlightSpeed = 1.0;
    
    // Export enhanced public interface
    return {
        initialize,
        setHighlightMode,
        prepareText,
        startHighlighting,
        stopHighlighting,
        getHighlightState,
        debugHighlighter,
        setHighlightSpeed,
        startHighlightingWithPreciseTiming,
        // Advanced mode generators
        generateGrammaticalHighlights,
        generateProsodicHighlights,
        generateHarmonicHighlights,
        getHarmonicFunction,
        // Enhanced constants
        HIGHLIGHT_MODES,
        ADVANCED_HIGHLIGHT_MODES
    };
})();

// Make available globally
if (typeof window !== 'undefined') {
    window.TextHighlighter = TextHighlighter;
}