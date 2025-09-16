/**
 * Harmonic Analysis Engine
 * Advanced Linguistic Analysis Phase 1.2 - Mathematical Harmonic Rules
 * 
 * This module provides chord progression analysis and harmonic context
 * for text-to-music conversion, creating musically coherent accompaniment.
 */

const HarmonicEngine = (() => {
    // Chord progression definitions with musical theory
    const CHORD_PROGRESSIONS = {
        'I-V-vi-IV': {
            name: 'Pop Progression',
            chords: ['I', 'V', 'vi', 'IV'],
            mood: 'uplifting',
            tension: [0.1, 0.7, 0.4, 0.2],
            description: 'Happy, popular, energetic'
        },
        'ii-V-I': {
            name: 'Jazz Progression',
            chords: ['ii', 'V', 'I'],
            mood: 'sophisticated',
            tension: [0.5, 0.8, 0.1],
            description: 'Smooth, sophisticated, resolved'
        },
        'vi-IV-I-V': {
            name: 'Ballad Progression',
            chords: ['vi', 'IV', 'I', 'V'],
            mood: 'emotional',
            tension: [0.6, 0.3, 0.1, 0.7],
            description: 'Emotional, dramatic, storytelling'
        },
        'I-vi-ii-V': {
            name: 'Circle Progression',
            chords: ['I', 'vi', 'ii', 'V'],
            mood: 'classical',
            tension: [0.1, 0.4, 0.6, 0.8],
            description: 'Classical, flowing, building'
        },
        'vi-ii-V-I': {
            name: 'Minor Circle',
            chords: ['vi', 'ii', 'V', 'I'],
            mood: 'melancholic',
            tension: [0.7, 0.5, 0.8, 0.1],
            description: 'Melancholic, introspective, resolved'
        },
        'I-IV-V-I': {
            name: 'Classic Cadence',
            chords: ['I', 'IV', 'V', 'I'],
            mood: 'traditional',
            tension: [0.1, 0.3, 0.8, 0.1],
            description: 'Traditional, stable, conclusive'
        }
    };

    // Key signatures and their corresponding chords
    const KEY_SIGNATURES = {
        'C': {
            'I': 'Cmaj', 'ii': 'Dm', 'iii': 'Em', 'IV': 'F', 'V': 'G', 'vi': 'Am', 'vii°': 'Bdim'
        },
        'G': {
            'I': 'Gmaj', 'ii': 'Am', 'iii': 'Bm', 'IV': 'C', 'V': 'D', 'vi': 'Em', 'vii°': 'F#dim'
        },
        'D': {
            'I': 'Dmaj', 'ii': 'Em', 'iii': 'F#m', 'IV': 'G', 'V': 'A', 'vi': 'Bm', 'vii°': 'C#dim'
        },
        'A': {
            'I': 'Amaj', 'ii': 'Bm', 'iii': 'C#m', 'IV': 'D', 'V': 'E', 'vi': 'F#m', 'vii°': 'G#dim'
        },
        'E': {
            'I': 'Emaj', 'ii': 'F#m', 'iii': 'G#m', 'IV': 'A', 'V': 'B', 'vi': 'C#m', 'vii°': 'D#dim'
        },
        'F': {
            'I': 'Fmaj', 'ii': 'Gm', 'iii': 'Am', 'IV': 'Bb', 'V': 'C', 'vi': 'Dm', 'vii°': 'Edim'
        },
        'Bb': {
            'I': 'Bbmaj', 'ii': 'Cm', 'iii': 'Dm', 'IV': 'Eb', 'V': 'F', 'vi': 'Gm', 'vii°': 'Adim'
        }
    };

    // Mood detection keywords in Portuguese
    const MOOD_KEYWORDS = {
        happy: ['alegre', 'feliz', 'contente', 'animado', 'eufórico', 'radiante', 'festivo', 'celebração', 'festa', 'diversão'],
        sad: ['triste', 'melancólico', 'deprimido', 'sombrio', 'lamentável', 'doloroso', 'pesar', 'luto', 'sofrimento', 'angústia'],
        romantic: ['amor', 'romântico', 'paixão', 'coração', 'beijar', 'abraçar', 'carinho', 'ternura', 'saudade', 'querido'],
        energetic: ['energia', 'força', 'poder', 'dinâmico', 'ativo', 'vibrante', 'intenso', 'forte', 'potente', 'explosivo'],
        calm: ['calmo', 'pacífico', 'sereno', 'tranquilo', 'relaxado', 'suave', 'gentil', 'macio', 'silêncio', 'paz'],
        mysterious: ['mistério', 'secreto', 'oculto', 'sombra', 'enigma', 'escuro', 'noturno', 'sussurro', 'estranho', 'inquietante'],
        spiritual: ['espiritual', 'sagrado', 'divino', 'celestial', 'alma', 'oração', 'meditação', 'transcendental', 'eterno', 'luz']
    };

    // Sentence type detection patterns
    const SENTENCE_PATTERNS = {
        question: /[?]|^(como|onde|quando|por que|o que|quem|qual|quantos?|que horas)/i,
        exclamation: /[!]|^(que|como|quanto)/i,
        command: /^(faça|vá|venha|pare|continue|digite|clique|abra|feche)/i,
        statement: /[.]|^[A-ZÁÉÍÓÚÇÂÊÔÃÕ]/
    };

    /**
     * Analyzes text to detect emotional mood
     * @param {string} text - Text to analyze
     * @returns {Object} Mood analysis results
     */
    function analyzeMood(text) {
        const words = text.toLowerCase().split(/\s+/);
        const moodScores = {};
        
        // Initialize mood scores
        Object.keys(MOOD_KEYWORDS).forEach(mood => {
            moodScores[mood] = 0;
        });
        
        // Count mood keyword matches
        words.forEach(word => {
            Object.entries(MOOD_KEYWORDS).forEach(([mood, keywords]) => {
                if (keywords.some(keyword => word.includes(keyword) || keyword.includes(word))) {
                    moodScores[mood]++;
                }
            });
        });
        
        // Find dominant mood
        const dominantMood = Object.entries(moodScores)
            .reduce((max, [mood, score]) => score > max.score ? {mood, score} : max, {mood: 'neutral', score: 0});
        
        // Calculate confidence based on text length and keyword density
        const confidence = Math.min(1.0, dominantMood.score / Math.max(1, words.length / 10));
        
        return {
            dominantMood: dominantMood.mood,
            confidence: confidence,
            allScores: moodScores,
            textLength: words.length
        };
    }

    /**
     * Detects sentence type from text patterns
     * @param {string} sentence - Sentence to analyze
     * @returns {string} Sentence type
     */
    function detectSentenceType(sentence) {
        if (SENTENCE_PATTERNS.question.test(sentence)) return 'question';
        if (SENTENCE_PATTERNS.exclamation.test(sentence)) return 'exclamation';
        if (SENTENCE_PATTERNS.command.test(sentence)) return 'command';
        return 'statement';
    }

    /**
     * Selects appropriate chord progression based on mood and sentence type
     * @param {string} text - Text to analyze
     * @returns {Object} Selected progression with context
     */
    function selectProgressionByContext(text) {
        const moodAnalysis = analyzeMood(text);
        const sentenceType = detectSentenceType(text);
        
        let selectedProgression = 'I-V-vi-IV'; // Default
        
        // Select based on dominant mood
        switch (moodAnalysis.dominantMood) {
            case 'happy':
            case 'energetic':
                selectedProgression = 'I-V-vi-IV';
                break;
            case 'sad':
            case 'melancholic':
                selectedProgression = 'vi-ii-V-I';
                break;
            case 'romantic':
                selectedProgression = 'vi-IV-I-V';
                break;
            case 'calm':
            case 'spiritual':
                selectedProgression = 'I-vi-ii-V';
                break;
            case 'mysterious':
                selectedProgression = 'ii-V-I';
                break;
            default:
                selectedProgression = 'I-IV-V-I';
        }
        
        // Modify based on sentence type
        if (sentenceType === 'question') {
            // Questions often need unresolved endings
            selectedProgression = 'I-vi-ii-V';
        } else if (sentenceType === 'exclamation') {
            // Exclamations are dramatic
            selectedProgression = 'vi-IV-I-V';
        }
        
        return {
            progression: selectedProgression,
            moodAnalysis: moodAnalysis,
            sentenceType: sentenceType,
            progressionData: CHORD_PROGRESSIONS[selectedProgression]
        };
    }

    /**
     * Converts roman numeral chord to actual chord name in given key
     * @param {string} romanChord - Roman numeral (e.g., 'vi', 'IV')
     * @param {string} key - Musical key (e.g., 'C', 'G')
     * @returns {string} Actual chord name
     */
    function romanToChord(romanChord, key = 'C') {
        const keyChords = KEY_SIGNATURES[key];
        if (!keyChords) {
            console.warn(`Key ${key} not found, using C major`);
            return KEY_SIGNATURES['C'][romanChord] || 'C';
        }
        return keyChords[romanChord] || 'C';
    }

    /**
     * Generates harmonic context for a musical sequence
     * @param {Array} musicalSequence - Sequence from MusicalGrammar
     * @param {string} key - Musical key
     * @returns {Array} Sequence with harmonic context added
     */
    function addHarmonicContext(musicalSequence, key = 'C') {
        if (!musicalSequence.length) return [];
        
        // Analyze the text to get appropriate progression
        const fullText = musicalSequence.map(note => note.character || '').join('');
        const progressionContext = selectProgressionByContext(fullText);
        const progression = progressionContext.progressionData;
        
        // Calculate chord changes based on sequence length
        const chordDuration = Math.max(1, Math.floor(musicalSequence.length / progression.chords.length));
        
        return musicalSequence.map((noteData, index) => {
            // Determine which chord we're in
            const chordIndex = Math.floor(index / chordDuration) % progression.chords.length;
            const currentRomanChord = progression.chords[chordIndex];
            const currentChord = romanToChord(currentRomanChord, key);
            const currentTension = progression.tension[chordIndex];
            
            return {
                ...noteData,
                harmonic: {
                    chord: currentChord,
                    romanChord: currentRomanChord,
                    tension: currentTension,
                    progression: progressionContext.progression,
                    mood: progressionContext.moodAnalysis.dominantMood,
                    chordIndex: chordIndex,
                    positionInChord: index % chordDuration
                }
            };
        });
    }

    /**
     * Applies harmonic adjustments to note properties
     * @param {Object} noteData - Note data with harmonic context
     * @returns {Object} Note data with harmonic adjustments
     */
    function applyHarmonicAdjustments(noteData) {
        if (!noteData.note || !noteData.harmonic) return noteData;
        
        const { tension, mood, positionInChord } = noteData.harmonic;
        
        // Adjust velocity based on harmonic tension
        let harmonicVelocity = noteData.velocity || 0.5;
        harmonicVelocity *= (0.7 + tension * 0.3); // Higher tension = louder
        
        // Adjust duration based on chord position
        let harmonicDuration = noteData.duration || '8n';
        if (positionInChord === 0) {
            // First note of chord gets emphasis
            harmonicDuration = noteData.adjustedDuration || harmonicDuration;
        }
        
        // Mood-based adjustments
        let moodMultiplier = 1.0;
        switch (mood) {
            case 'energetic':
                moodMultiplier = 1.2;
                break;
            case 'calm':
                moodMultiplier = 0.8;
                break;
            case 'mysterious':
                moodMultiplier = 0.9;
                break;
            case 'romantic':
                moodMultiplier = 1.1;
                break;
        }
        
        return {
            ...noteData,
            velocity: Math.min(1.0, harmonicVelocity * moodMultiplier),
            harmonicVelocity: harmonicVelocity,
            moodMultiplier: moodMultiplier
        };
    }

    /**
     * Generates bass line progression
     * @param {string} text - Original text
     * @param {string} key - Musical key
     * @returns {Array} Bass line notes
     */
    function generateBassLine(text, key = 'C') {
        const progressionContext = selectProgressionByContext(text);
        const progression = progressionContext.progressionData;
        
        return progression.chords.map((romanChord, index) => {
            const chordName = romanToChord(romanChord, key);
            const bassNote = chordName.replace(/maj|m|dim|°/, ''); // Get root note
            
            return {
                note: bassNote + '2', // Bass octave
                chord: chordName,
                romanChord: romanChord,
                tension: progression.tension[index],
                duration: '1n', // Whole note bass
                velocity: 0.6
            };
        });
    }

    /**
     * Provides detailed harmonic analysis for debugging
     * @param {string} text - Text to analyze
     * @param {string} key - Musical key
     * @returns {Object} Comprehensive harmonic analysis
     */
    function debugHarmonicAnalysis(text, key = 'C') {
        const moodAnalysis = analyzeMood(text);
        const sentenceType = detectSentenceType(text);
        const progressionContext = selectProgressionByContext(text);
        const bassLine = generateBassLine(text, key);
        
        return {
            originalText: text,
            key: key,
            moodAnalysis: moodAnalysis,
            sentenceType: sentenceType,
            selectedProgression: progressionContext,
            chordSequence: progressionContext.progressionData.chords.map(roman => ({
                roman: roman,
                chord: romanToChord(roman, key)
            })),
            bassLine: bassLine,
            harmonicStructure: {
                totalChords: progressionContext.progressionData.chords.length,
                averageTension: progressionContext.progressionData.tension.reduce((a, b) => a + b) / progressionContext.progressionData.tension.length,
                moodConfidence: moodAnalysis.confidence
            }
        };
    }

    // Export public interface
    return {
        analyzeMood,
        detectSentenceType,
        selectProgressionByContext,
        addHarmonicContext,
        applyHarmonicAdjustments,
        generateBassLine,
        debugHarmonicAnalysis,
        romanToChord,
        CHORD_PROGRESSIONS,
        KEY_SIGNATURES,
        MOOD_KEYWORDS
    };
})();

// Make available globally
if (typeof window !== 'undefined') {
    window.HarmonicEngine = HarmonicEngine;
}