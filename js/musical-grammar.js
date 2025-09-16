/**
 * Musical Grammar Integration Engine
 * Advanced Linguistic Analysis Phase 1.1 - Frequency-Weighted Note Selection
 * 
 * This module integrates grammatical analysis with musical note selection,
 * applying linguistic weights and octave shifts to create more expressive melodies.
 */

const MusicalGrammar = (() => {
    // Musical constants
    const OCTAVE_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const BASE_OCTAVE = 4;
    const MAX_OCTAVE = 7;
    const MIN_OCTAVE = 2;

    /**
     * Converts a note name to MIDI number for calculations
     * @param {string} noteName - Note name like "C4", "A#3"
     * @returns {number} MIDI note number
     */
    function noteToMidi(noteName) {
        if (!noteName) return 60; // Default to C4
        
        const match = noteName.match(/([A-G]#?)(\d)/);
        if (!match) return 60;
        
        const [, note, octave] = match;
        const noteIndex = OCTAVE_NOTES.indexOf(note);
        return (parseInt(octave) + 1) * 12 + noteIndex;
    }

    /**
     * Converts MIDI number back to note name
     * @param {number} midiNumber - MIDI note number
     * @returns {string} Note name like "C4"
     */
    function midiToNote(midiNumber) {
        const octave = Math.floor(midiNumber / 12) - 1;
        const noteIndex = midiNumber % 12;
        return OCTAVE_NOTES[noteIndex] + octave;
    }

    /**
     * Applies octave shift while keeping within reasonable bounds
     * @param {string} baseNote - Original note
     * @param {number} octaveShift - Number of octaves to shift
     * @returns {string} Adjusted note
     */
    function applyOctaveShift(baseNote, octaveShift) {
        if (!baseNote || octaveShift === 0) return baseNote;
        
        const midiNumber = noteToMidi(baseNote);
        const shiftedMidi = midiNumber + (octaveShift * 12);
        
        // Clamp to reasonable octave range
        const clampedMidi = Math.max(
            MIN_OCTAVE * 12, 
            Math.min(MAX_OCTAVE * 12, shiftedMidi)
        );
        
        return midiToNote(clampedMidi);
    }

    /**
     * Applies weight-based modifications to note selection
     * @param {string} baseNote - Original note from scale mapping
     * @param {number} weight - Grammatical weight (0.0 to 1.0+)
     * @param {string} emphasis - Emphasis level
     * @returns {Object} Modified note properties
     */
    function applyGrammaticalWeight(baseNote, weight, emphasis) {
        if (!baseNote) return { note: null, velocity: 0.5, duration: '8n' };
        
        // Calculate velocity based on weight
        let velocity = Math.min(1.0, Math.max(0.1, weight));
        
        // Adjust velocity by emphasis level
        const emphasisMultipliers = {
            'very_weak': 0.3,
            'weak': 0.5,
            'medium': 0.7,
            'strong': 0.9,
            'very_strong': 1.0,
            'extreme': 1.2
        };
        
        velocity *= emphasisMultipliers[emphasis] || 0.7;
        velocity = Math.min(1.0, velocity);
        
        // Calculate duration based on weight and emphasis
        let duration = '8n'; // Default eighth note
        
        if (weight > 0.8 && emphasis === 'very_strong') {
            duration = '4n'; // Quarter note for strong elements
        } else if (weight < 0.4) {
            duration = '16n'; // Sixteenth note for weak elements
        }
        
        return {
            note: baseNote,
            velocity: velocity,
            duration: duration,
            weight: weight,
            emphasis: emphasis
        };
    }

    /**
     * Selects note for a character based on grammatical context
     * @param {string} char - Character to process
     * @param {string} scaleName - Current musical scale
     * @param {Object} wordAnalysis - Grammatical analysis of the containing word
     * @param {number} charPosition - Position of character within word
     * @returns {Object} Musical note properties
     */
    function selectNoteByGrammar(char, scaleName, wordAnalysis, charPosition) {
        // Get base note from existing scale mapping
        const scaleMap = AppConfig.SCALES[scaleName];
        if (!scaleMap) {
            console.error(`Scale '${scaleName}' not found`);
            return { note: null, velocity: 0.5, duration: '8n' };
        }
        
        const baseNote = scaleMap[char.toLowerCase()];
        if (!baseNote) {
            return { note: null, velocity: 0.5, duration: '8n' }; // Silence for unmapped characters
        }
        
        // Get character-specific musical properties
        const charProps = GrammarAnalyzer.getCharacterMusicalProperties(
            char, wordAnalysis, charPosition
        );
        
        // Apply octave shift based on grammatical type
        const adjustedNote = applyOctaveShift(baseNote, charProps.octaveShift);
        
        // Apply weight-based modifications
        const noteProperties = applyGrammaticalWeight(
            adjustedNote, 
            charProps.weight, 
            charProps.emphasis
        );
        
        // Add additional context information
        noteProperties.wordType = charProps.wordType;
        noteProperties.isVowel = charProps.isVowel;
        noteProperties.originalNote = baseNote;
        noteProperties.character = char;
        
        return noteProperties;
    }

    /**
     * Processes entire text with grammatical awareness
     * @param {string} text - Input text to process
     * @param {string} scaleName - Musical scale to use
     * @returns {Array} Array of musical note objects with grammatical context
     */
    function processTextWithGrammar(text, scaleName) {
        // First, analyze the sentence grammatically
        const sentenceAnalysis = GrammarAnalyzer.analyzeSentence(text);
        
        const musicalSequence = [];
        let currentWordIndex = 0;
        let currentCharInWord = 0;
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            
            if (char === ' ') {
                // Space between words - add a short pause
                musicalSequence.push({
                    note: null,
                    velocity: 0,
                    duration: '16n',
                    character: ' ',
                    wordType: 'SPACE',
                    isWordBreak: true
                });
                
                currentWordIndex++;
                currentCharInWord = 0;
                continue;
            }
            
            if (/[^a-zA-ZàáâãäéêëíîïóôõöúûüçÀÁÂÃÄÉÊËÍÎÏÓÔÕÖÚÛÜÇ]/.test(char)) {
                // Punctuation or special characters
                musicalSequence.push({
                    note: null,
                    velocity: 0.3,
                    duration: '8n',
                    character: char,
                    wordType: 'PUNCTUATION',
                    isPunctuation: true
                });
                continue;
            }
            
            // Get the word analysis for this character
            const wordAnalysis = sentenceAnalysis[currentWordIndex];
            if (!wordAnalysis) {
                // Fallback if word analysis is incomplete
                const fallbackNote = AppConfig.SCALES[scaleName][char.toLowerCase()];
                musicalSequence.push({
                    note: fallbackNote,
                    velocity: 0.5,
                    duration: '8n',
                    character: char,
                    wordType: 'UNKNOWN'
                });
                continue;
            }
            
            // Generate musical properties for this character
            const noteProps = selectNoteByGrammar(char, scaleName, wordAnalysis, currentCharInWord);
            musicalSequence.push(noteProps);
            
            currentCharInWord++;
        }
        
        return musicalSequence;
    }

    /**
     * Calculates timing adjustments based on grammatical rhythm
     * @param {Array} musicalSequence - Sequence from processTextWithGrammar
     * @returns {Array} Sequence with adjusted timing
     */
    function applyGrammaticalRhythm(musicalSequence) {
        return musicalSequence.map((noteProps, index) => {
            if (!noteProps.note) return noteProps; // Skip silences and punctuation
            
            // Adjust timing based on word type
            let timingMultiplier = 1.0;
            
            switch (noteProps.wordType) {
                case 'VERB':
                    timingMultiplier = 1.2; // Verbs get slightly longer timing
                    break;
                case 'NOUN':
                    timingMultiplier = 1.1; // Nouns get moderately longer timing
                    break;
                case 'ADJECTIVE':
                    timingMultiplier = 0.9; // Adjectives are slightly quicker
                    break;
                case 'ARTICLE':
                case 'PREPOSITION':
                    timingMultiplier = 0.7; // Function words are much quicker
                    break;
                case 'INTERJECTION':
                    timingMultiplier = 1.5; // Interjections get extended timing
                    break;
            }
            
            // Apply vowel/consonant timing differences
            if (noteProps.isVowel) {
                timingMultiplier *= 1.1; // Vowels slightly longer
            } else {
                timingMultiplier *= 0.9; // Consonants slightly shorter
            }
            
            return {
                ...noteProps,
                timingMultiplier: timingMultiplier,
                adjustedDuration: calculateAdjustedDuration(noteProps.duration, timingMultiplier)
            };
        });
    }

    /**
     * Calculates adjusted duration based on timing multiplier
     * @param {string} baseDuration - Original duration (Tone.js format)
     * @param {number} multiplier - Timing multiplier
     * @returns {string} Adjusted duration
     */
    function calculateAdjustedDuration(baseDuration, multiplier) {
        // Simple mapping for common durations
        const durationMap = {
            '16n': ['32n', '16n', '8n', '4n'],
            '8n': ['16n', '8n', '4n', '2n'],
            '4n': ['8n', '4n', '2n', '1n'],
            '2n': ['4n', '2n', '1n', '1n']
        };
        
        const currentMap = durationMap[baseDuration] || ['8n', '8n', '4n', '2n'];
        
        if (multiplier < 0.8) return currentMap[0]; // Shorter
        if (multiplier < 1.1) return currentMap[1]; // Normal
        if (multiplier < 1.4) return currentMap[2]; // Longer
        return currentMap[3]; // Much longer
    }

    /**
     * Provides debugging information for grammatical musical processing
     * @param {string} text - Text to analyze
     * @param {string} scaleName - Scale to use
     * @returns {Object} Debug information
     */
    function debugGrammaticalProcessing(text, scaleName) {
        const sentenceAnalysis = GrammarAnalyzer.analyzeSentence(text);
        const musicalSequence = processTextWithGrammar(text, scaleName);
        const rhythmicSequence = applyGrammaticalRhythm(musicalSequence);
        
        return {
            originalText: text,
            scale: scaleName,
            sentenceAnalysis: sentenceAnalysis,
            musicalSequence: musicalSequence,
            rhythmicSequence: rhythmicSequence,
            statistics: {
                totalCharacters: text.length,
                words: sentenceAnalysis.length,
                musicalNotes: musicalSequence.filter(n => n.note).length,
                silences: musicalSequence.filter(n => !n.note).length
            }
        };
    }

    // Export public interface
    return {
        selectNoteByGrammar,
        processTextWithGrammar,
        applyGrammaticalRhythm,
        debugGrammaticalProcessing,
        applyOctaveShift,
        applyGrammaticalWeight
    };
})();

// Make available globally
if (typeof window !== 'undefined') {
    window.MusicalGrammar = MusicalGrammar;
}