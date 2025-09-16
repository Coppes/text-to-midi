/**
 * Prosodic Engine for Brazilian Portuguese
 * Advanced Linguistic Analysis Phase 2.3 - Prosodic Melody Contours
 * 
 * This module implements prosodic melody patterns for different sentence types,
 * creating natural intonation contours for declarative, interrogative, and exclamative sentences.
 */

const ProsodicEngine = (() => {
    // Intonation patterns for different sentence types
    const INTONATION_PATTERNS = {
        DECLARATIVE: {
            name: 'Declarative',
            description: 'Neutral statement with falling intonation',
            contour: {
                start: 0.0,      // Neutral start
                prehead: 0.1,    // Slight rise in prehead
                head: 0.2,       // Peak in head
                nucleus: 0.3,    // Highest point (nuclear stress)
                tail: -0.8       // Strong fall to end
            },
            stressAmplification: 1.2,
            confidence: 0.9
        },
        INTERROGATIVE_YES_NO: {
            name: 'Yes/No Question',
            description: 'Rising intonation for yes/no questions',
            contour: {
                start: 0.0,      // Neutral start
                prehead: -0.1,   // Slight dip
                head: 0.1,       // Gradual rise
                nucleus: 0.4,    // High point
                tail: 1.2        // Strong rise at end
            },
            stressAmplification: 1.1,
            confidence: 0.95
        },
        INTERROGATIVE_WH: {
            name: 'WH Question',
            description: 'Falling intonation for WH questions',
            contour: {
                start: 0.4,      // High start (question word emphasis)
                prehead: 0.2,    // Maintain elevation
                head: 0.1,       // Gradual descent
                nucleus: 0.0,    // Normal nuclear stress
                tail: -0.6       // Fall but not as strong as declarative
            },
            stressAmplification: 1.3,
            confidence: 0.9
        },
        EXCLAMATIVE: {
            name: 'Exclamative',
            description: 'High start with dramatic contour',
            contour: {
                start: 0.8,      // Very high start
                prehead: 0.9,    // Maintain high level
                head: 1.0,       // Peak excitement
                nucleus: 0.6,    // High nuclear stress
                tail: -0.3       // Moderate fall (remains elevated)
            },
            stressAmplification: 1.5,
            confidence: 0.85
        },
        COMMAND: {
            name: 'Command/Imperative',
            description: 'Authoritative falling pattern',
            contour: {
                start: 0.3,      // Elevated start
                prehead: 0.4,    // Build authority
                head: 0.5,       // Strong peak
                nucleus: 0.2,    // Controlled nuclear stress
                tail: -1.0       // Very strong fall (finality)
            },
            stressAmplification: 1.4,
            confidence: 0.8
        },
        CONTINUATION: {
            name: 'Continuation',
            description: 'Mid-level plateau for continuation',
            contour: {
                start: 0.0,      // Neutral start
                prehead: 0.2,    // Slight rise
                head: 0.3,       // Moderate peak
                nucleus: 0.1,    // Reduced nuclear stress
                tail: 0.4        // Rise indicating continuation
            },
            stressAmplification: 0.9,
            confidence: 0.7
        }
    };

    // Prosodic phrase boundaries and their effects
    const PHRASE_BOUNDARIES = {
        MAJOR: {
            name: 'Major Phrase Boundary',
            pauseDuration: '4n',
            pitchReset: true,
            stressReset: true,
            breathGroup: true
        },
        MINOR: {
            name: 'Minor Phrase Boundary',
            pauseDuration: '8n',
            pitchReset: false,
            stressReset: false,
            breathGroup: false
        },
        WORD: {
            name: 'Word Boundary',
            pauseDuration: '16n',
            pitchReset: false,
            stressReset: false,
            breathGroup: false
        }
    };

    // Focus and emphasis patterns
    const FOCUS_PATTERNS = {
        CONTRASTIVE: {
            name: 'Contrastive Focus',
            pitchRange: 1.5,
            stressBoost: 1.8,
            durationExtension: 1.3
        },
        EMPHATIC: {
            name: 'Emphatic Focus',
            pitchRange: 1.3,
            stressBoost: 1.5,
            durationExtension: 1.2
        },
        NEW_INFORMATION: {
            name: 'New Information Focus',
            pitchRange: 1.2,
            stressBoost: 1.3,
            durationExtension: 1.1
        }
    };

    /**
     * Detects sentence type from linguistic cues
     * @param {string} sentence - Sentence to analyze
     * @returns {Object} Sentence type analysis
     */
    function detectSentenceType(sentence) {
        const trimmed = sentence.trim();
        
        // Check punctuation first
        if (trimmed.endsWith('?')) {
            // Determine if it's WH or Yes/No question
            const whWords = /^(como|onde|quando|por que|o que|quem|qual|quantos?|que horas|por onde|para onde|desde quando|até quando)/i;
            if (whWords.test(trimmed)) {
                return {
                    type: 'INTERROGATIVE_WH',
                    confidence: 0.95,
                    reason: 'wh_question_word'
                };
            } else {
                return {
                    type: 'INTERROGATIVE_YES_NO',
                    confidence: 0.9,
                    reason: 'question_mark'
                };
            }
        }
        
        if (trimmed.endsWith('!')) {
            return {
                type: 'EXCLAMATIVE',
                confidence: 0.9,
                reason: 'exclamation_mark'
            };
        }
        
        // Check for command patterns
        const commandPatterns = /^(faça|vá|venha|pare|continue|digite|clique|abra|feche|tome|traga|coloque|retire|mova|pressione)/i;
        if (commandPatterns.test(trimmed)) {
            return {
                type: 'COMMAND',
                confidence: 0.8,
                reason: 'imperative_verb'
            };
        }
        
        // Check for continuation indicators
        const continuationIndicators = /[,;:]$|^(mas|porém|contudo|entretanto|além disso|por outro lado)/i;
        if (continuationIndicators.test(trimmed)) {
            return {
                type: 'CONTINUATION',
                confidence: 0.7,
                reason: 'continuation_marker'
            };
        }
        
        // Default to declarative
        return {
            type: 'DECLARATIVE',
            confidence: 0.8,
            reason: 'default_statement'
        };
    }

    /**
     * Identifies prosodic phrase boundaries in text
     * @param {string} text - Text to analyze
     * @returns {Array} Array of boundary markers
     */
    function identifyPhraseBoundaries(text) {
        const boundaries = [];
        
        // Major boundaries (sentence-level)
        const majorBoundaryMarkers = /[.!?;]/g;
        let match;
        while ((match = majorBoundaryMarkers.exec(text)) !== null) {
            boundaries.push({
                position: match.index,
                type: 'MAJOR',
                marker: match[0]
            });
        }
        
        // Minor boundaries (clause-level)
        const minorBoundaryMarkers = /[,]/g;
        while ((match = minorBoundaryMarkers.exec(text)) !== null) {
            boundaries.push({
                position: match.index,
                type: 'MINOR',
                marker: match[0]
            });
        }
        
        // Word boundaries (spaces)
        const wordBoundaryMarkers = /\s+/g;
        while ((match = wordBoundaryMarkers.exec(text)) !== null) {
            boundaries.push({
                position: match.index,
                type: 'WORD',
                marker: ' '
            });
        }
        
        return boundaries.sort((a, b) => a.position - b.position);
    }

    /**
     * Applies intonation contour to musical sequence
     * @param {Array} musicalSequence - Sequence of musical notes
     * @param {string} sentenceType - Type of sentence
     * @returns {Array} Sequence with prosodic contour applied
     */
    function applyIntonationContour(musicalSequence, sentenceType) {
        const pattern = INTONATION_PATTERNS[sentenceType];
        if (!pattern) {
            console.warn(`Unknown sentence type: ${sentenceType}`);
            return musicalSequence;
        }
        
        const sequenceLength = musicalSequence.length;
        if (sequenceLength === 0) return musicalSequence;
        
        // Define prosodic positions
        const positions = calculateProsodicPositions(sequenceLength);
        
        return musicalSequence.map((noteData, index) => {
            const relativePosition = index / (sequenceLength - 1);
            const pitchAdjustment = interpolatePitchContour(relativePosition, pattern.contour, positions);
            const stressMultiplier = calculateStressMultiplier(noteData, pattern);
            
            return {
                ...noteData,
                prosodic: {
                    sentenceType: sentenceType,
                    pitchAdjustment: pitchAdjustment,
                    stressMultiplier: stressMultiplier,
                    prosodicPosition: getProsodicPosition(relativePosition, positions),
                    originalPitch: noteData.note
                },
                note: adjustNotePitch(noteData.note, pitchAdjustment),
                velocity: adjustVelocity(noteData.velocity || 0.5, stressMultiplier),
                duration: adjustDuration(noteData.duration || '8n', stressMultiplier)
            };
        });
    }

    /**
     * Calculates prosodic positions within the sequence
     * @param {number} length - Sequence length
     * @returns {Object} Prosodic position markers
     */
    function calculateProsodicPositions(length) {
        return {
            prehead: Math.floor(length * 0.1),
            head: Math.floor(length * 0.4),
            nucleus: Math.floor(length * 0.7),
            tail: Math.floor(length * 0.9)
        };
    }

    /**
     * Interpolates pitch contour based on position
     * @param {number} position - Relative position (0.0 to 1.0)
     * @param {Object} contour - Intonation contour
     * @param {Object} positions - Prosodic positions
     * @returns {number} Pitch adjustment value
     */
    function interpolatePitchContour(position, contour, positions) {
        if (position <= 0.1) {
            // Prehead region
            return lerp(contour.start, contour.prehead, position * 10);
        } else if (position <= 0.4) {
            // Head region
            return lerp(contour.prehead, contour.head, (position - 0.1) / 0.3);
        } else if (position <= 0.7) {
            // Nucleus region
            return lerp(contour.head, contour.nucleus, (position - 0.4) / 0.3);
        } else {
            // Tail region
            return lerp(contour.nucleus, contour.tail, (position - 0.7) / 0.3);
        }
    }

    /**
     * Linear interpolation between two values
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} t - Interpolation factor (0.0 to 1.0)
     * @returns {number} Interpolated value
     */
    function lerp(start, end, t) {
        return start + (end - start) * Math.min(1, Math.max(0, t));
    }

    /**
     * Calculates stress multiplier based on note properties and pattern
     * @param {Object} noteData - Note data
     * @param {Object} pattern - Intonation pattern
     * @returns {number} Stress multiplier
     */
    function calculateStressMultiplier(noteData, pattern) {
        let multiplier = 1.0;
        
        // Base amplification from pattern
        multiplier *= pattern.stressAmplification;
        
        // Boost for stressed syllables
        if (noteData.stressed) {
            multiplier *= 1.3;
        }
        
        // Boost for vowels (more prominent in prosody)
        if (noteData.isVowel) {
            multiplier *= 1.1;
        }
        
        // Boost for important word types
        if (noteData.wordType === 'VERB' || noteData.wordType === 'NOUN') {
            multiplier *= 1.2;
        }
        
        return Math.min(2.0, multiplier); // Cap at 2x
    }

    /**
     * Gets prosodic position name
     * @param {number} relativePosition - Position (0.0 to 1.0)
     * @param {Object} positions - Prosodic positions
     * @returns {string} Position name
     */
    function getProsodicPosition(relativePosition, positions) {
        if (relativePosition <= 0.1) return 'prehead';
        if (relativePosition <= 0.4) return 'head';
        if (relativePosition <= 0.7) return 'nucleus';
        return 'tail';
    }

    /**
     * Adjusts note pitch based on prosodic contour
     * @param {string} basePitch - Base pitch (e.g., "C4")
     * @param {number} adjustment - Pitch adjustment (-1.0 to 1.0)
     * @returns {string} Adjusted pitch
     */
    function adjustNotePitch(basePitch, adjustment) {
        if (!basePitch || adjustment === 0) return basePitch;
        
        try {
            const match = basePitch.match(/([A-G]#?)(\d)/);
            if (!match) return basePitch;
            
            const [, note, octave] = match;
            const noteIndex = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(note);
            const semitoneAdjustment = Math.round(adjustment * 12); // Convert to semitones
            
            const newMidiNote = noteIndex + (parseInt(octave) + 1) * 12 + semitoneAdjustment;
            const newOctave = Math.floor(newMidiNote / 12) - 1;
            const newNoteIndex = newMidiNote % 12;
            const newNote = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][newNoteIndex];
            
            // Clamp octave to reasonable range
            const clampedOctave = Math.min(7, Math.max(1, newOctave));
            return newNote + clampedOctave;
        } catch (e) {
            return basePitch; // Return original if adjustment fails
        }
    }

    /**
     * Adjusts velocity based on stress multiplier
     * @param {number} baseVelocity - Base velocity
     * @param {number} multiplier - Stress multiplier
     * @returns {number} Adjusted velocity
     */
    function adjustVelocity(baseVelocity, multiplier) {
        return Math.min(1.0, Math.max(0.1, baseVelocity * multiplier));
    }

    /**
     * Adjusts duration based on stress multiplier
     * @param {string} baseDuration - Base duration
     * @param {number} multiplier - Stress multiplier
     * @returns {string} Adjusted duration
     */
    function adjustDuration(baseDuration, multiplier) {
        if (multiplier < 0.8) {
            // Shorten duration
            const shorterMap = { '1n': '2n', '2n': '4n', '4n': '8n', '8n': '16n', '16n': '32n' };
            return shorterMap[baseDuration] || baseDuration;
        } else if (multiplier > 1.3) {
            // Lengthen duration
            const longerMap = { '32n': '16n', '16n': '8n', '8n': '4n', '4n': '2n', '2n': '1n' };
            return longerMap[baseDuration] || baseDuration;
        }
        return baseDuration;
    }

    /**
     * Applies focus and emphasis to specific elements
     * @param {Array} musicalSequence - Musical sequence
     * @param {Array} focusTargets - Elements to emphasize
     * @param {string} focusType - Type of focus
     * @returns {Array} Sequence with focus applied
     */
    function applyFocusEmphasis(musicalSequence, focusTargets, focusType = 'EMPHATIC') {
        const focusPattern = FOCUS_PATTERNS[focusType];
        if (!focusPattern) return musicalSequence;
        
        return musicalSequence.map((noteData, index) => {
            const isFocused = focusTargets.includes(index);
            if (!isFocused) return noteData;
            
            return {
                ...noteData,
                note: adjustNotePitch(noteData.note, 0.3 * focusPattern.pitchRange),
                velocity: adjustVelocity(noteData.velocity || 0.5, focusPattern.stressBoost),
                duration: adjustDuration(noteData.duration || '8n', focusPattern.durationExtension),
                focus: {
                    type: focusType,
                    pattern: focusPattern
                }
            };
        });
    }

    /**
     * Provides comprehensive prosodic analysis for debugging
     * @param {string} text - Text to analyze
     * @param {Array} musicalSequence - Musical sequence
     * @returns {Object} Prosodic analysis
     */
    function debugProsodicAnalysis(text, musicalSequence) {
        const sentenceTypeAnalysis = detectSentenceType(text);
        const boundaries = identifyPhraseBoundaries(text);
        const prosodicSequence = applyIntonationContour(musicalSequence, sentenceTypeAnalysis.type);
        
        return {
            originalText: text,
            sentenceType: sentenceTypeAnalysis,
            phraseBoundaries: boundaries,
            intonationPattern: INTONATION_PATTERNS[sentenceTypeAnalysis.type],
            originalSequence: musicalSequence,
            prosodicSequence: prosodicSequence,
            prosodicStatistics: {
                averagePitchAdjustment: prosodicSequence.reduce((sum, note) => 
                    sum + (note.prosodic?.pitchAdjustment || 0), 0) / prosodicSequence.length,
                averageStressMultiplier: prosodicSequence.reduce((sum, note) => 
                    sum + (note.prosodic?.stressMultiplier || 1), 0) / prosodicSequence.length,
                prosodicPositions: prosodicSequence.map(note => note.prosodic?.prosodicPosition).filter(Boolean)
            }
        };
    }

    // Export public interface
    return {
        detectSentenceType,
        identifyPhraseBoundaries,
        applyIntonationContour,
        applyFocusEmphasis,
        debugProsodicAnalysis,
        adjustNotePitch,
        INTONATION_PATTERNS,
        PHRASE_BOUNDARIES,
        FOCUS_PATTERNS
    };
})();

// Make available globally
if (typeof window !== 'undefined') {
    window.ProsodicEngine = ProsodicEngine;
}