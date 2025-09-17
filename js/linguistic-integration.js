/**
 * Linguistic Integration Engine
 * Advanced Linguistic Analysis Integration Module
 * 
 * This module integrates all linguistic analysis engines with the existing audio system,
 * providing a unified interface for advanced text-to-music conversion.
 */

const LinguisticIntegration = (() => {
    // Analysis modes
    const ANALYSIS_MODES = {
        BASIC: {
            name: 'Basic Character Mapping',
            description: 'Simple character-to-note mapping (original behavior)',
            engines: []
        },
        GRAMMATICAL: {
            name: 'Grammatical Analysis',
            description: 'Word type classification with musical weighting',
            engines: ['grammar', 'musical-grammar']
        },
        HARMONIC: {
            name: 'Harmonic Context',
            description: 'Chord progressions based on mood and sentence type',
            engines: ['grammar', 'musical-grammar', 'harmonic']
        },
        PHONETIC: {
            name: 'Phonetic Mapping',
            description: 'Brazilian Portuguese phoneme-to-pitch mapping',
            engines: ['phonetic']
        },
        PROSODIC: {
            name: 'Prosodic Analysis',
            description: 'Full stress and intonation contour analysis',
            engines: ['grammar', 'stress', 'prosodic']
        },
        COMPLETE: {
            name: 'Complete Linguistic Analysis',
            description: 'All engines combined for maximum expressiveness',
            engines: ['grammar', 'musical-grammar', 'harmonic', 'phonetic', 'stress', 'prosodic']
        }
    };

    // Current analysis settings
    let currentMode = 'BASIC';
    let currentDialect = 'carioca';
    let currentKey = 'C';
    let enableHarmonicContext = false;
    let enableStressAnalysis = false;
    let enableProsodicContours = false;

    /**
     * Sets the analysis mode for text processing
     * @param {string} mode - Analysis mode key
     * @returns {boolean} Success status
     */
    function setAnalysisMode(mode) {
        if (!ANALYSIS_MODES[mode]) {
            console.error(`Unknown analysis mode: ${mode}`);
            return false;
        }
        
        currentMode = mode;
        console.log(`Analysis mode set to: ${mode} - ${ANALYSIS_MODES[mode].description}`);
        return true;
    }

    /**
     * Sets the Brazilian Portuguese dialect for phonetic analysis
     * @param {string} dialect - Dialect (carioca, paulista, nordestino, gaucho)
     * @returns {boolean} Success status
     */
    function setDialect(dialect) {
        const availableDialects = ['carioca', 'paulista', 'nordestino', 'gaucho'];
        if (!availableDialects.includes(dialect)) {
            console.error(`Unknown dialect: ${dialect}. Available: ${availableDialects.join(', ')}`);
            return false;
        }
        
        currentDialect = dialect;
        console.log(`Dialect set to: ${dialect}`);
        return true;
    }

    /**
     * Sets the musical key for harmonic analysis
     * @param {string} key - Musical key (C, G, D, A, E, F, Bb)
     * @returns {boolean} Success status
     */
    function setMusicalKey(key) {
        if (!HarmonicEngine.KEY_SIGNATURES[key]) {
            console.error(`Unknown key: ${key}. Available keys: ${Object.keys(HarmonicEngine.KEY_SIGNATURES).join(', ')}`);
            return false;
        }
        
        currentKey = key;
        console.log(`Musical key set to: ${key}`);
        return true;
    }

    /**
     * Processes text using the currently selected analysis mode
     * @param {string} text - Input text
     * @param {string} scaleName - Musical scale to use
     * @returns {Object} Complete analysis result
     */
    function processText(text, scaleName) {
        const mode = ANALYSIS_MODES[currentMode];
        const engines = mode.engines;
        
        console.log(`Processing text with mode: ${currentMode}`);
        console.log(`Engines: ${engines.join(', ')}`);
        
        const result = {
            mode: currentMode,
            originalText: text,
            scale: scaleName,
            dialect: currentDialect,
            key: currentKey,
            timestamp: new Date().toISOString()
        };

        try {
            // Start with basic character processing if no engines specified
            if (engines.length === 0) {
                result.musicalSequence = processBasicCharacters(text, scaleName);
                result.processingTime = 'minimal';
                return result;
            }

            const startTime = performance.now();

            // Step 1: Grammatical Analysis (if enabled)
            if (engines.includes('grammar')) {
                result.grammaticalAnalysis = GrammarAnalyzer.analyzeSentence(text);
                console.log('✓ Grammatical analysis completed');
            }

            // Step 2: Musical Grammar Integration (if enabled)
            if (engines.includes('musical-grammar')) {
                if (result.grammaticalAnalysis) {
                    result.musicalSequence = MusicalGrammar.processTextWithGrammar(text, scaleName);
                    result.rhythmicSequence = MusicalGrammar.applyGrammaticalRhythm(result.musicalSequence);
                    console.log('✓ Musical grammar applied');
                } else {
                    console.warn('Musical grammar requested but no grammatical analysis available');
                }
            }

            // Step 3: Harmonic Analysis (if enabled)
            if (engines.includes('harmonic')) {
                const workingSequence = result.rhythmicSequence || result.musicalSequence;
                if (workingSequence) {
                    result.harmonicAnalysis = HarmonicEngine.selectProgressionByContext(text);
                    result.harmonicSequence = HarmonicEngine.addHarmonicContext(workingSequence, currentKey);
                    result.harmonicSequence = result.harmonicSequence.map(note => 
                        HarmonicEngine.applyHarmonicAdjustments(note)
                    );
                    result.bassLine = HarmonicEngine.generateBassLine(text, currentKey);
                    console.log('✓ Harmonic analysis completed');
                }
            }

            // Step 4: Phonetic Analysis (if enabled)
            if (engines.includes('phonetic')) {
                result.phoneticAnalysis = PhoneticEngine.convertToPhonemes(text, currentDialect);
                result.phoneticSequence = PhoneticEngine.processTextPhonetically(text, currentDialect);
                result.phoneticComplexity = PhoneticEngine.analyzePhoneticComplexity(text, currentDialect);
                console.log('✓ Phonetic analysis completed');
            }

            // Step 5: Stress Analysis (if enabled)
            if (engines.includes('stress')) {
                result.stressAnalysis = analyzeTextStress(text);
                
                // Apply stress to existing sequence
                const workingSequence = result.harmonicSequence || result.rhythmicSequence || result.musicalSequence;
                if (workingSequence && result.stressAnalysis) {
                    result.stressedSequence = applyStressToSequence(workingSequence, result.stressAnalysis);
                    console.log('✓ Stress analysis applied');
                }
            }

            // Step 6: Prosodic Analysis (if enabled)
            if (engines.includes('prosodic')) {
                result.sentenceType = ProsodicEngine.detectSentenceType(text);
                result.phraseBoundaries = ProsodicEngine.identifyPhraseBoundaries(text);
                
                // Apply prosodic contours
                const workingSequence = result.stressedSequence || result.harmonicSequence || 
                                      result.rhythmicSequence || result.musicalSequence;
                if (workingSequence) {
                    result.prosodicSequence = ProsodicEngine.applyIntonationContour(
                        workingSequence, 
                        result.sentenceType.type
                    );
                    console.log('✓ Prosodic analysis completed');
                }
            }

            // Select final sequence
            result.finalSequence = result.prosodicSequence || result.stressedSequence || 
                                 result.harmonicSequence || result.rhythmicSequence || 
                                 result.musicalSequence || processBasicCharacters(text, scaleName);

            const endTime = performance.now();
            result.processingTime = `${(endTime - startTime).toFixed(2)}ms`;
            
            console.log(`✓ Text processing completed in ${result.processingTime}`);
            return result;

        } catch (error) {
            console.error('Error during text processing:', error);
            result.error = error.message;
            result.finalSequence = processBasicCharacters(text, scaleName); // Fallback
            return result;
        }
    }

    /**
     * Basic character-to-note processing (original behavior)
     * @param {string} text - Input text
     * @param {string} scaleName - Musical scale
     * @returns {Array} Basic musical sequence
     */
    function processBasicCharacters(text, scaleName) {
        const scaleMap = AppConfig.SCALES[scaleName];
        if (!scaleMap) return [];

        return text.split('').map(char => {
            const note = scaleMap[char.toLowerCase()];
            return {
                character: char,
                note: note,
                velocity: 0.5,
                duration: '8n',
                mode: 'basic'
            };
        });
    }

    /**
     * Analyzes stress patterns for entire text
     * @param {string} text - Input text
     * @returns {Array} Stress analysis for each word
     */
    function analyzeTextStress(text) {
        const words = text.split(/\s+/).filter(word => word.length > 0);
        return words.map(word => {
            const cleanWord = word.replace(/[^a-zàáâãäéêëíîïóôõöúûüç]/gi, '');
            if (cleanWord.length === 0) return null;
            return StressAnalyzer.detectStress(cleanWord);
        }).filter(analysis => analysis !== null);
    }

    /**
     * Applies stress analysis to musical sequence
     * @param {Array} sequence - Musical sequence
     * @param {Array} stressAnalysis - Stress analysis results
     * @returns {Array} Sequence with stress applied
     */
    function applyStressToSequence(sequence, stressAnalysis) {
        // This is a simplified mapping - in practice, you'd need more sophisticated
        // word-to-sequence alignment
        let wordIndex = 0;
        let charInWord = 0;
        
        return sequence.map((noteData, index) => {
            if (noteData.character === ' ') {
                wordIndex++;
                charInWord = 0;
                return noteData;
            }
            
            const currentStressAnalysis = stressAnalysis[wordIndex];
            if (!currentStressAnalysis) return noteData;
            
            const syllableIndex = Math.floor(charInWord / 2); // Rough syllable estimation
            const isStressed = syllableIndex === currentStressAnalysis.position;
            
            charInWord++;
            
            return {
                ...noteData,
                stressed: isStressed,
                stressLevel: isStressed ? 1.0 : 0.3,
                velocity: adjustVelocityForStress(noteData.velocity || 0.5, isStressed),
                duration: adjustDurationForStress(noteData.duration || '8n', isStressed)
            };
        });
    }

    /**
     * Adjusts velocity based on stress
     * @param {number} baseVelocity - Base velocity
     * @param {boolean} isStressed - Whether syllable is stressed
     * @returns {number} Adjusted velocity
     */
    function adjustVelocityForStress(baseVelocity, isStressed) {
        return isStressed ? Math.min(1.0, baseVelocity * 1.3) : baseVelocity * 0.8;
    }

    /**
     * Adjusts duration based on stress
     * @param {string} baseDuration - Base duration
     * @param {boolean} isStressed - Whether syllable is stressed
     * @returns {string} Adjusted duration
     */
    function adjustDurationForStress(baseDuration, isStressed) {
        if (!isStressed) return baseDuration;
        
        const longerMap = { '32n': '16n', '16n': '8n', '8n': '4n', '4n': '2n', '2n': '1n' };
        return longerMap[baseDuration] || baseDuration;
    }

    /**
     * Schedules the processed sequence for audio playback
     * @param {Object} processedResult - Result from processText
     * @param {number} noteDuration - Base note duration
     * @param {number} silenceDuration - Base silence duration
     * @returns {boolean} Success status
     */
    function scheduleProcessedSequence(processedResult, noteDuration = AppConfig.NOTE_DURATION, silenceDuration = AppConfig.SILENCE_DURATION) {
        if (!processedResult.finalSequence) {
            console.error('No final sequence available for scheduling');
            return false;
        }

        try {
            Tone.Transport.cancel(); // Clear existing events
            let currentTime = 0;

            processedResult.finalSequence.forEach((noteData, index) => {
                if (noteData.note) {
                    // Calculate duration based on note properties
                    const duration = noteData.duration || noteDuration;
                    const velocity = noteData.velocity || 0.5;
                    
                    Tone.Transport.scheduleOnce((time) => {
                        if (AudioManager.instrument) {
                            AudioManager.instrument.triggerAttackRelease(noteData.note, duration, time, velocity);
                        }
                    }, currentTime);
                    
                    currentTime += Tone.Time(duration).toSeconds();
                } else {
                    // Handle silence
                    currentTime += Tone.Time(silenceDuration).toSeconds();
                }
            });

            // Add bass line if available
            if (processedResult.bassLine) {
                scheduleBassLine(processedResult.bassLine, currentTime);
            }

            Tone.Transport.start("+0.1");
            console.log(`Scheduled ${processedResult.finalSequence.length} notes for playback`);
            return true;

        } catch (error) {
            console.error('Error scheduling sequence:', error);
            return false;
        }
    }

    /**
     * Schedules bass line for harmonic accompaniment
     * @param {Array} bassLine - Bass line notes
     * @param {number} totalDuration - Total duration of main sequence
     */
    function scheduleBassLine(bassLine, totalDuration) {
        if (!bassLine.length) return;

        const chordDuration = totalDuration / bassLine.length;
        let currentTime = 0;

        bassLine.forEach(bassNote => {
            Tone.Transport.scheduleOnce((time) => {
                if (AudioManager.instrument) {
                    AudioManager.instrument.triggerAttackRelease(
                        bassNote.note, 
                        bassNote.duration, 
                        time, 
                        bassNote.velocity * 0.7 // Quieter bass
                    );
                }
            }, currentTime);
            
            currentTime += chordDuration;
        });
    }

    /**
     * Provides comprehensive debugging information
     * @param {string} text - Text to analyze
     * @param {string} scaleName - Musical scale
     * @returns {Object} Debug information
     */
    function debugLinguisticProcessing(text, scaleName) {
        const results = {};
        
        // Test each analysis engine individually
        if (typeof GrammarAnalyzer !== 'undefined') {
            results.grammar = GrammarAnalyzer.debugWordClassification(text);
        }
        
        if (typeof MusicalGrammar !== 'undefined') {
            results.musicalGrammar = MusicalGrammar.debugGrammaticalProcessing(text, scaleName);
        }
        
        if (typeof HarmonicEngine !== 'undefined') {
            results.harmonic = HarmonicEngine.debugHarmonicAnalysis(text, currentKey);
        }
        
        if (typeof PhoneticEngine !== 'undefined') {
            results.phonetic = PhoneticEngine.debugPhoneticProcessing(text, currentDialect);
        }
        
        if (typeof StressAnalyzer !== 'undefined') {
            results.stress = analyzeTextStress(text);
        }
        
        if (typeof ProsodicEngine !== 'undefined') {
            results.prosodic = ProsodicEngine.debugProsodicAnalysis(text, []);
        }
        
        // Test complete integration
        results.integrated = processText(text, scaleName);
        
        return results;
    }

    /**
     * Gets current analysis settings
     * @returns {Object} Current settings
     */
    function getSettings() {
        return {
            mode: currentMode,
            modeDescription: ANALYSIS_MODES[currentMode].description,
            dialect: currentDialect,
            key: currentKey,
            availableModes: Object.keys(ANALYSIS_MODES),
            availableDialects: ['carioca', 'paulista', 'nordestino', 'gaucho'],
            availableKeys: Object.keys(HarmonicEngine?.KEY_SIGNATURES || {})
        };
    }

    // Export public interface
    return {
        setAnalysisMode,
        setDialect,
        setMusicalKey,
        processText,
        scheduleProcessedSequence,
        debugLinguisticProcessing,
        getSettings,
        ANALYSIS_MODES
    };
})();

// Make available globally
if (typeof window !== 'undefined') {
    window.LinguisticIntegration = LinguisticIntegration;
}