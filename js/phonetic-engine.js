/**
 * Brazilian Portuguese Phonetic Analysis Engine
 * Advanced Linguistic Analysis Phase 2.1 - Phonetic Patterns
 * 
 * This module provides detailed phonetic analysis for Brazilian Portuguese,
 * mapping phonemes to musical properties and handling regional variations.
 */

const PhoneticEngine = (() => {
    // Brazilian Portuguese phoneme-to-pitch mapping
    const PHONEME_MAP = {
        // Oral vowels - based on mouth opening and tongue position
        'a': { 
            pitch: 'C4', 
            duration: '4n', 
            openness: 'open',
            position: 'central',
            energy: 0.9,
            brightness: 0.7
        },
        'e': { 
            pitch: 'E4', 
            duration: '8n', 
            openness: 'mid',
            position: 'front',
            energy: 0.7,
            brightness: 0.8
        },
        'é': { 
            pitch: 'E4', 
            duration: '8n', 
            openness: 'mid-open',
            position: 'front',
            energy: 0.8,
            brightness: 0.85
        },
        'ê': { 
            pitch: 'Eb4', 
            duration: '8n', 
            openness: 'mid-closed',
            position: 'front',
            energy: 0.6,
            brightness: 0.75
        },
        'i': { 
            pitch: 'G5', 
            duration: '8n', 
            openness: 'closed',
            position: 'front',
            energy: 0.6,
            brightness: 1.0
        },
        'o': { 
            pitch: 'A3', 
            duration: '4n', 
            openness: 'mid',
            position: 'back',
            energy: 0.7,
            brightness: 0.5
        },
        'ó': { 
            pitch: 'A3', 
            duration: '4n', 
            openness: 'mid-open',
            position: 'back',
            energy: 0.8,
            brightness: 0.55
        },
        'ô': { 
            pitch: 'Ab3', 
            duration: '4n', 
            openness: 'mid-closed',
            position: 'back',
            energy: 0.6,
            brightness: 0.45
        },
        'u': { 
            pitch: 'F4', 
            duration: '8n', 
            openness: 'closed',
            position: 'back',
            energy: 0.5,
            brightness: 0.3
        },
        
        // Nasal vowels - longer duration, different timbre
        'ã': { 
            pitch: 'D4', 
            duration: '2n', 
            nasal: true,
            openness: 'open',
            energy: 0.8,
            brightness: 0.6,
            nasality: 0.8
        },
        'ẽ': { 
            pitch: 'F#4', 
            duration: '4n', 
            nasal: true,
            openness: 'mid',
            energy: 0.7,
            brightness: 0.7,
            nasality: 0.7
        },
        'ĩ': { 
            pitch: 'A5', 
            duration: '8n', 
            nasal: true,
            openness: 'closed',
            energy: 0.6,
            brightness: 0.9,
            nasality: 0.6
        },
        'õ': { 
            pitch: 'G3', 
            duration: '2n', 
            nasal: true,
            openness: 'mid',
            energy: 0.7,
            brightness: 0.4,
            nasality: 0.8
        },
        'ũ': { 
            pitch: 'E4', 
            duration: '4n', 
            nasal: true,
            openness: 'closed',
            energy: 0.5,
            brightness: 0.2,
            nasality: 0.7
        },
        
        // Consonants - organized by articulation
        // Plosives
        'p': { pitch: 'C3', duration: '16n', articulation: 'plosive', voicing: false, energy: 0.8 },
        'b': { pitch: 'C3', duration: '16n', articulation: 'plosive', voicing: true, energy: 0.7 },
        't': { pitch: 'D3', duration: '16n', articulation: 'plosive', voicing: false, energy: 0.8 },
        'd': { pitch: 'D3', duration: '16n', articulation: 'plosive', voicing: true, energy: 0.7 },
        'k': { pitch: 'E3', duration: '16n', articulation: 'plosive', voicing: false, energy: 0.8 },
        'g': { pitch: 'E3', duration: '16n', articulation: 'plosive', voicing: true, energy: 0.7 },
        
        // Fricatives
        'f': { pitch: 'F3', duration: '8n', articulation: 'fricative', voicing: false, energy: 0.6 },
        'v': { pitch: 'F3', duration: '8n', articulation: 'fricative', voicing: true, energy: 0.5 },
        's': { pitch: 'G3', duration: '8n', articulation: 'fricative', voicing: false, energy: 0.7 },
        'z': { pitch: 'G3', duration: '8n', articulation: 'fricative', voicing: true, energy: 0.6 },
        'ʃ': { pitch: 'A3', duration: '8n', articulation: 'fricative', voicing: false, energy: 0.7 }, // 'ch'
        'ʒ': { pitch: 'A3', duration: '8n', articulation: 'fricative', voicing: true, energy: 0.6 },  // 'j'
        
        // Nasals
        'm': { pitch: 'C4', duration: '4n', articulation: 'nasal', energy: 0.6, brightness: 0.5 },
        'n': { pitch: 'D4', duration: '4n', articulation: 'nasal', energy: 0.6, brightness: 0.6 },
        'ɲ': { pitch: 'E4', duration: '4n', articulation: 'nasal', energy: 0.6, brightness: 0.7 }, // 'nh'
        
        // Liquids
        'l': { pitch: 'F4', duration: '8n', articulation: 'liquid', energy: 0.5, flow: true },
        'ʎ': { pitch: 'G4', duration: '8n', articulation: 'liquid', energy: 0.6, flow: true }, // 'lh'
        'r': { pitch: 'G#3', duration: '16n', articulation: 'liquid', energy: 0.4, trill: 0.3 },
        'ʀ': { pitch: 'F#3', duration: '8n', articulation: 'liquid', energy: 0.8, trill: 0.8 }, // strong 'rr'
        'ɾ': { pitch: 'A3', duration: '16n', articulation: 'liquid', energy: 0.3, tap: true }, // flap 'r'
        
        // Semivowels
        'j': { pitch: 'B4', duration: '16n', articulation: 'semivowel', energy: 0.4 }, // 'i' in diphthongs
        'w': { pitch: 'F#3', duration: '16n', articulation: 'semivowel', energy: 0.4 }, // 'u' in diphthongs
    };

    // Brazilian Portuguese specific phonetic transformations
    const BRAZILIAN_TRANSFORMATIONS = {
        // Consonant clusters and digraphs
        'ch': 'ʃ',
        'lh': 'ʎ', 
        'nh': 'ɲ',
        'rr': 'ʀ',
        'ss': 's',
        'sc': 's',
        'sç': 's',
        'xc': 's',
        
        // Regional variations (carioca/paulista patterns)
        'ti': 'tʃi',  // 'ti' -> 'chi' in many dialects
        'di': 'dʒi',  // 'di' -> 'ji' in many dialects
        'te': 'tʃe',  // Final 'te' -> 'che'
        'de': 'dʒe',  // Final 'de' -> 'je'
        
        // Final consonant weakening
        'r$': 'ʀ',    // Final 'r' strengthened
        's$': 'ʃ',    // Final 's' -> 'sh'
        'z$': 'ʃ',    // Final 'z' -> 'sh'
        
        // Vowel harmony patterns
        'qu': 'k',
        'gu': 'g'
    };

    // Diphthongs in Brazilian Portuguese
    const DIPHTHONGS = {
        'ai': ['a', 'j'],
        'ei': ['e', 'j'],
        'oi': ['o', 'j'],
        'ui': ['u', 'j'],
        'au': ['a', 'w'],
        'eu': ['e', 'w'],
        'ou': ['o', 'w'],
        'iu': ['i', 'w'],
        'ão': ['ã', 'w'],
        'õe': ['õ', 'j'],
        'ãe': ['ã', 'j'],
        'ũi': ['ũ', 'j']
    };

    // Regional variation patterns
    const REGIONAL_VARIATIONS = {
        carioca: {
            // Rio de Janeiro patterns
            's_final': 'ʃ',
            'r_final': 'ʀ',
            'ti_palatalization': true,
            'di_palatalization': true
        },
        paulista: {
            // São Paulo patterns
            's_final': 's',
            'r_final': 'ɾ',
            'ti_palatalization': true,
            'di_palatalization': true
        },
        nordestino: {
            // Northeastern patterns
            's_final': 's',
            'r_final': 'r',
            'ti_palatalization': false,
            'di_palatalization': false
        },
        gaucho: {
            // Southern patterns
            's_final': 's',
            'r_final': 'r',
            'ti_palatalization': false,
            'di_palatalization': false
        }
    };

    /**
     * Converts text to phonetic representation
     * @param {string} text - Input text
     * @param {string} dialect - Brazilian Portuguese dialect
     * @returns {Array} Array of phonemes
     */
    function convertToPhonemes(text, dialect = 'carioca') {
        let phonetic = text.toLowerCase();
        const dialectRules = REGIONAL_VARIATIONS[dialect] || REGIONAL_VARIATIONS.carioca;
        
        // Apply Brazilian Portuguese transformations
        Object.entries(BRAZILIAN_TRANSFORMATIONS).forEach(([pattern, replacement]) => {
            if (pattern.endsWith('$')) {
                // Word-final pattern
                const regex = new RegExp(pattern.slice(0, -1) + '\\b', 'g');
                phonetic = phonetic.replace(regex, replacement);
            } else {
                // General pattern
                const regex = new RegExp(pattern, 'g');
                phonetic = phonetic.replace(regex, replacement);
            }
        });
        
        // Apply dialect-specific rules
        if (dialectRules.ti_palatalization) {
            phonetic = phonetic.replace(/ti(?=[aeiou]|$)/g, 'tʃi');
        }
        if (dialectRules.di_palatalization) {
            phonetic = phonetic.replace(/di(?=[aeiou]|$)/g, 'dʒi');
        }
        
        // Handle final consonants based on dialect
        if (dialectRules.s_final) {
            phonetic = phonetic.replace(/s\b/g, dialectRules.s_final);
        }
        if (dialectRules.r_final) {
            phonetic = phonetic.replace(/r\b/g, dialectRules.r_final);
        }
        
        // Convert to phoneme array
        const phonemes = [];
        let i = 0;
        
        while (i < phonetic.length) {
            const char = phonetic[i];
            const nextChar = phonetic[i + 1];
            const twoChar = char + nextChar;
            
            // Check for diphthongs
            if (DIPHTHONGS[twoChar]) {
                phonemes.push(...DIPHTHONGS[twoChar]);
                i += 2;
                continue;
            }
            
            // Check for special phonemes
            if (PHONEME_MAP[char]) {
                phonemes.push(char);
            } else if (char === ' ') {
                phonemes.push('_'); // Word boundary marker
            } else if (/[.,!?;:]/.test(char)) {
                phonemes.push('|'); // Pause marker
            }
            
            i++;
        }
        
        return phonemes;
    }

    /**
     * Maps phoneme to musical properties
     * @param {string} phoneme - Phoneme symbol
     * @param {Object} context - Contextual information
     * @returns {Object} Musical properties
     */
    function phonemeToMusic(phoneme, context = {}) {
        const phonemeData = PHONEME_MAP[phoneme];
        if (!phonemeData) {
            if (phoneme === '_') {
                return { note: null, duration: '16n', isWordBoundary: true };
            }
            if (phoneme === '|') {
                return { note: null, duration: '4n', isPause: true };
            }
            return { note: null, duration: '16n' };
        }
        
        // Base musical properties
        let musicData = {
            note: phonemeData.pitch,
            duration: phonemeData.duration,
            velocity: phonemeData.energy || 0.5,
            phoneme: phoneme,
            articulation: phonemeData.articulation,
            voicing: phonemeData.voicing
        };
        
        // Apply phonetic-specific effects
        if (phonemeData.nasal) {
            musicData.effects = { nasal: phonemeData.nasality };
            musicData.timbre = 'nasal';
        }
        
        if (phonemeData.trill) {
            musicData.effects = { trill: phonemeData.trill };
            musicData.ornament = 'trill';
        }
        
        if (phonemeData.brightness !== undefined) {
            musicData.brightness = phonemeData.brightness;
            musicData.filter = `highpass(${phonemeData.brightness * 1000}Hz)`;
        }
        
        if (phonemeData.flow) {
            musicData.legato = true;
            musicData.articulation = 'smooth';
        }
        
        // Context-based adjustments
        if (context.stress) {
            musicData.velocity *= 1.3;
            musicData.duration = increaseDuration(musicData.duration);
        }
        
        if (context.position === 'syllable_start') {
            musicData.velocity *= 1.1;
        }
        
        return musicData;
    }

    /**
     * Processes text with full phonetic analysis
     * @param {string} text - Input text
     * @param {string} dialect - Dialect variant
     * @returns {Array} Array of musical note objects with phonetic context
     */
    function processTextPhonetically(text, dialect = 'carioca') {
        const phonemes = convertToPhonemes(text, dialect);
        const musicalSequence = [];
        
        for (let i = 0; i < phonemes.length; i++) {
            const phoneme = phonemes[i];
            const context = {
                position: i === 0 ? 'start' : (i === phonemes.length - 1 ? 'end' : 'middle'),
                previous: phonemes[i - 1],
                next: phonemes[i + 1]
            };
            
            const musicData = phonemeToMusic(phoneme, context);
            musicalSequence.push(musicData);
        }
        
        return musicalSequence;
    }

    /**
     * Increases duration by one step
     * @param {string} duration - Tone.js duration
     * @returns {string} Increased duration
     */
    function increaseDuration(duration) {
        const durationMap = {
            '32n': '16n',
            '16n': '8n',
            '8n': '4n',
            '4n': '2n',
            '2n': '1n',
            '1n': '1n'
        };
        return durationMap[duration] || duration;
    }

    /**
     * Analyzes phonetic complexity of text
     * @param {string} text - Text to analyze
     * @param {string} dialect - Dialect to use
     * @returns {Object} Complexity analysis
     */
    function analyzePhoneticComplexity(text, dialect = 'carioca') {
        const phonemes = convertToPhonemes(text, dialect);
        
        const stats = {
            totalPhonemes: phonemes.length,
            vowels: 0,
            consonants: 0,
            nasals: 0,
            liquids: 0,
            fricatives: 0,
            plosives: 0,
            diphthongs: 0,
            wordBoundaries: 0
        };
        
        phonemes.forEach(phoneme => {
            const data = PHONEME_MAP[phoneme];
            if (!data) {
                if (phoneme === '_') stats.wordBoundaries++;
                return;
            }
            
            if (data.openness) {
                stats.vowels++;
                if (data.nasal) stats.nasals++;
            } else {
                stats.consonants++;
                if (data.articulation === 'nasal') stats.nasals++;
                if (data.articulation === 'liquid') stats.liquids++;
                if (data.articulation === 'fricative') stats.fricatives++;
                if (data.articulation === 'plosive') stats.plosives++;
            }
        });
        
        // Calculate complexity score
        const complexity = (
            stats.nasals * 1.5 +
            stats.liquids * 1.3 +
            stats.fricatives * 1.2 +
            stats.plosives * 1.0
        ) / Math.max(1, stats.totalPhonemes);
        
        return {
            ...stats,
            complexity: complexity,
            averageComplexityPerWord: complexity / Math.max(1, stats.wordBoundaries + 1)
        };
    }

    /**
     * Provides debugging information for phonetic processing
     * @param {string} text - Text to debug
     * @param {string} dialect - Dialect to use
     * @returns {Object} Debug information
     */
    function debugPhoneticProcessing(text, dialect = 'carioca') {
        const phonemes = convertToPhonemes(text, dialect);
        const musicalSequence = processTextPhonetically(text, dialect);
        const complexity = analyzePhoneticComplexity(text, dialect);
        
        return {
            originalText: text,
            dialect: dialect,
            phonemes: phonemes,
            musicalSequence: musicalSequence,
            complexity: complexity,
            transformations: Object.entries(BRAZILIAN_TRANSFORMATIONS).filter(
                ([pattern]) => new RegExp(pattern.replace('$', '\\b')).test(text.toLowerCase())
            ),
            dialectRules: REGIONAL_VARIATIONS[dialect]
        };
    }

    // Export public interface
    return {
        convertToPhonemes,
        phonemeToMusic,
        processTextPhonetically,
        analyzePhoneticComplexity,
        debugPhoneticProcessing,
        PHONEME_MAP,
        BRAZILIAN_TRANSFORMATIONS,
        DIPHTHONGS,
        REGIONAL_VARIATIONS
    };
})();

// Make available globally
if (typeof window !== 'undefined') {
    window.PhoneticEngine = PhoneticEngine;
}