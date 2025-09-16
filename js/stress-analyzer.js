/**
 * Portuguese Syllable Stress Analysis Engine
 * Advanced Linguistic Analysis Phase 2.2 - Stress Detection
 * 
 * This module implements comprehensive stress detection for Portuguese words,
 * following oxytone, paroxytone, and proparoxytone stress patterns.
 */

const StressAnalyzer = (() => {
    // Portuguese vowels for syllable detection
    const VOWELS = 'aeiouáéíóúàèìòùâêîôûãõäëïöüç';
    const STRONG_VOWELS = 'aeoáéóàèòâêôãõ';
    const WEAK_VOWELS = 'iuíúìùîûĩũ';
    
    // Stress rules for Portuguese
    const STRESS_RULES = {
        // Words with graphic accent always follow the accent
        GRAPHIC_ACCENT: /[áéíóúàèìòùâêîôûãõ]/,
        
        // Oxytone endings (stress on last syllable when no accent)
        OXYTONE_ENDINGS: /[aeiou]s?$|[rl]$|[nm]$|im$|ins$|um$|uns$/,
        
        // Paroxytone exceptions (stress on second-to-last when they should be oxytone)
        PAROXYTONE_EXCEPTIONS: /ão$|ãos$|ã$|ãs$/,
        
        // Proparoxytone indicators (all proparoxytones have graphic accent in Portuguese)
        PROPAROXYTONE: /.*[áéíóúàèìòùâêîôûãõ].*[aeiou].*[aeiou]/,
        
        // Monosyllables are generally strong (tonic) if they have meaning
        STRONG_MONOSYLLABLES: /^(que|quem|qual|quando|onde|como|por|para|com|sem|mais|bem|mal|só|já|não|sim|dor|luz|paz|voz|vez|mês|pé|má|dá|vá|há|lá|cá|dê|sê|pôr|vir|ler|ver|ter|ser|dar|ir|vir)$/i
    };

    // Common suffixes and their stress patterns
    const SUFFIX_PATTERNS = {
        // Always oxytone
        oxytone: [
            'ão', 'ões', 'ais', 'éis', 'ois', 'eus',
            'iu', 'éu', 'ás', 'és', 'ós', 'ém', 'éns'
        ],
        
        // Always paroxytone  
        paroxytone: [
            'mente', 'agem', 'ugem', 'oso', 'osa', 'icos', 'icas',
            'ível', 'ável', 'ante', 'ente', 'inte', 'ado', 'ida'
        ],
        
        // Always proparoxytone (with graphic accent)
        proparoxytone: [
            'íamos', 'áveis', 'ássemos', 'êssemos', 'íssemos'
        ]
    };

    /**
     * Breaks word into syllables using Portuguese syllabification rules
     * @param {string} word - Word to syllabify
     * @returns {Array} Array of syllables
     */
    function syllabify(word) {
        if (!word || word.length === 0) return [];
        
        const cleanWord = word.toLowerCase().replace(/[^a-zàáâãäéêëíîïóôõöúûüç]/g, '');
        if (cleanWord.length === 0) return [];
        
        // Handle monosyllables
        if (cleanWord.length <= 3 && containsVowel(cleanWord)) {
            return [cleanWord];
        }
        
        const syllables = [];
        let currentSyllable = '';
        let i = 0;
        
        while (i < cleanWord.length) {
            const char = cleanWord[i];
            const nextChar = cleanWord[i + 1];
            const prevChar = cleanWord[i - 1];
            
            currentSyllable += char;
            
            // If current character is a vowel
            if (isVowel(char)) {
                // Check for diphthongs and triphthongs
                if (nextChar && isVowel(nextChar)) {
                    // Potential diphthong
                    if (isDiphthong(char + nextChar)) {
                        currentSyllable += nextChar;
                        i++;
                        
                        // Check for triphthong
                        const thirdChar = cleanWord[i + 1];
                        if (thirdChar && isVowel(thirdChar) && isTriphthong(char + nextChar + thirdChar)) {
                            currentSyllable += thirdChar;
                            i++;
                        }
                    }
                }
                
                // Look ahead to determine syllable boundary
                let j = i + 1;
                let consonantCluster = '';
                
                // Collect consonants after vowel
                while (j < cleanWord.length && !isVowel(cleanWord[j])) {
                    consonantCluster += cleanWord[j];
                    j++;
                }
                
                // Apply syllable division rules
                if (consonantCluster.length === 0) {
                    // No consonants, vowel is at end or followed by another vowel
                    if (j >= cleanWord.length) {
                        // End of word
                        syllables.push(currentSyllable);
                        currentSyllable = '';
                    }
                } else if (consonantCluster.length === 1) {
                    // Single consonant goes with next syllable
                    syllables.push(currentSyllable);
                    currentSyllable = '';
                } else if (consonantCluster.length === 2) {
                    // Two consonants: check if they can start a syllable
                    if (canStartSyllable(consonantCluster)) {
                        // Both consonants go with next syllable
                        syllables.push(currentSyllable);
                        currentSyllable = '';
                    } else {
                        // Split consonants
                        syllables.push(currentSyllable + consonantCluster[0]);
                        currentSyllable = '';
                        i++; // Skip first consonant as it's already added
                    }
                } else {
                    // Three or more consonants: take first, leave rest
                    syllables.push(currentSyllable + consonantCluster[0]);
                    currentSyllable = '';
                    i++; // Skip first consonant
                }
            }
            
            i++;
        }
        
        // Add remaining syllable if any
        if (currentSyllable) {
            syllables.push(currentSyllable);
        }
        
        return syllables.filter(syl => syl.length > 0);
    }

    /**
     * Detects stress pattern of a Portuguese word
     * @param {string} word - Word to analyze
     * @returns {Object} Stress analysis result
     */
    function detectStress(word) {
        const cleanWord = word.toLowerCase().replace(/[^a-zàáâãäéêëíîïóôõöúûüç]/g, '');
        if (!cleanWord) return { position: 0, type: 'unknown', confidence: 0 };
        
        const syllables = syllabify(cleanWord);
        if (syllables.length === 0) return { position: 0, type: 'unknown', confidence: 0 };
        
        // Check for graphic accent (definitive indicator)
        for (let i = 0; i < syllables.length; i++) {
            if (STRESS_RULES.GRAPHIC_ACCENT.test(syllables[i])) {
                const stressType = getStressType(i, syllables.length);
                return {
                    position: i,
                    type: stressType,
                    confidence: 1.0,
                    reason: 'graphic_accent',
                    syllables: syllables,
                    stressedSyllable: syllables[i]
                };
            }
        }
        
        // Handle monosyllables
        if (syllables.length === 1) {
            const isStrong = STRESS_RULES.STRONG_MONOSYLLABLES.test(cleanWord);
            return {
                position: 0,
                type: 'monosyllable',
                confidence: isStrong ? 0.9 : 0.3,
                reason: isStrong ? 'strong_monosyllable' : 'weak_monosyllable',
                syllables: syllables,
                stressedSyllable: syllables[0]
            };
        }
        
        // Check suffix patterns
        for (const [category, suffixes] of Object.entries(SUFFIX_PATTERNS)) {
            for (const suffix of suffixes) {
                if (cleanWord.endsWith(suffix)) {
                    const stressPos = getStressPositionByType(category, syllables.length);
                    return {
                        position: stressPos,
                        type: category,
                        confidence: 0.9,
                        reason: `suffix_${suffix}`,
                        syllables: syllables,
                        stressedSyllable: syllables[stressPos]
                    };
                }
            }
        }
        
        // Apply general stress rules
        if (STRESS_RULES.PAROXYTONE_EXCEPTIONS.test(cleanWord)) {
            const stressPos = Math.max(0, syllables.length - 2);
            return {
                position: stressPos,
                type: 'paroxytone',
                confidence: 0.8,
                reason: 'paroxytone_exception',
                syllables: syllables,
                stressedSyllable: syllables[stressPos]
            };
        }
        
        if (STRESS_RULES.OXYTONE_ENDINGS.test(cleanWord)) {
            const stressPos = syllables.length - 1;
            return {
                position: stressPos,
                type: 'oxytone',
                confidence: 0.8,
                reason: 'oxytone_ending',
                syllables: syllables,
                stressedSyllable: syllables[stressPos]
            };
        }
        
        // Default to paroxytone (most common in Portuguese)
        const stressPos = Math.max(0, syllables.length - 2);
        return {
            position: stressPos,
            type: 'paroxytone',
            confidence: 0.6,
            reason: 'default_paroxytone',
            syllables: syllables,
            stressedSyllable: syllables[stressPos]
        };
    }

    /**
     * Applies stress pattern to musical sequence
     * @param {Array} syllables - Array of syllables with musical data
     * @param {Object} stressPattern - Stress analysis result
     * @returns {Array} Syllables with stress applied
     */
    function applySyllableStress(syllables, stressPattern) {
        return syllables.map((syllable, index) => {
            const isStressed = index === stressPattern.position;
            const stressLevel = calculateStressLevel(index, stressPattern, syllables.length);
            
            return {
                ...syllable,
                stressed: isStressed,
                stressLevel: stressLevel,
                volume: calculateStressVolume(stressLevel),
                duration: calculateStressDuration(syllable.duration || '8n', stressLevel),
                pitch: adjustStressPitch(syllable.pitch, stressLevel),
                emphasis: getStressEmphasis(stressLevel)
            };
        });
    }

    /**
     * Calculates stress level for a syllable
     * @param {number} index - Syllable index
     * @param {Object} stressPattern - Stress pattern
     * @param {number} totalSyllables - Total number of syllables
     * @returns {number} Stress level (0.0 to 1.0)
     */
    function calculateStressLevel(index, stressPattern, totalSyllables) {
        if (index === stressPattern.position) {
            // Primary stress
            return 1.0 * stressPattern.confidence;
        }
        
        // Secondary stress patterns
        if (totalSyllables > 4) {
            // In longer words, syllables 2 positions before primary stress get secondary stress
            const distanceFromPrimary = Math.abs(index - stressPattern.position);
            if (distanceFromPrimary === 2) {
                return 0.6;
            }
            if (distanceFromPrimary === 4) {
                return 0.4;
            }
        }
        
        // Weak syllables
        return 0.3;
    }

    /**
     * Calculates volume based on stress level
     * @param {number} stressLevel - Stress level (0.0 to 1.0)
     * @returns {number} Volume (0.0 to 1.0)
     */
    function calculateStressVolume(stressLevel) {
        return Math.min(1.0, 0.4 + (stressLevel * 0.6));
    }

    /**
     * Calculates duration based on stress level
     * @param {string} baseDuration - Base duration
     * @param {number} stressLevel - Stress level
     * @returns {string} Adjusted duration
     */
    function calculateStressDuration(baseDuration, stressLevel) {
        const durationMap = {
            '32n': ['32n', '16n', '8n', '4n'],
            '16n': ['16n', '8n', '4n', '2n'],
            '8n': ['8n', '4n', '2n', '1n'],
            '4n': ['4n', '2n', '1n', '1n'],
            '2n': ['2n', '1n', '1n', '1n']
        };
        
        const options = durationMap[baseDuration] || ['8n', '4n', '2n', '1n'];
        
        if (stressLevel >= 0.9) return options[3]; // Longest
        if (stressLevel >= 0.7) return options[2]; // Long
        if (stressLevel >= 0.4) return options[1]; // Medium
        return options[0]; // Short
    }

    /**
     * Adjusts pitch based on stress level
     * @param {string} basePitch - Base pitch
     * @param {number} stressLevel - Stress level
     * @returns {string} Adjusted pitch
     */
    function adjustStressPitch(basePitch, stressLevel) {
        if (!basePitch || stressLevel < 0.5) return basePitch;
        
        // Stressed syllables get slight pitch elevation
        const pitchAdjustment = Math.floor(stressLevel * 2); // 0-2 semitones
        
        try {
            const match = basePitch.match(/([A-G]#?)(\d)/);
            if (match) {
                const [, note, octave] = match;
                const noteIndex = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(note);
                const newIndex = (noteIndex + pitchAdjustment) % 12;
                const newOctave = Math.floor((noteIndex + pitchAdjustment) / 12) + parseInt(octave);
                const newNote = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][newIndex];
                return newNote + Math.min(7, Math.max(1, newOctave));
            }
        } catch (e) {
            // Return original if pitch adjustment fails
        }
        
        return basePitch;
    }

    /**
     * Gets emphasis description for stress level
     * @param {number} stressLevel - Stress level
     * @returns {string} Emphasis description
     */
    function getStressEmphasis(stressLevel) {
        if (stressLevel >= 0.9) return 'primary';
        if (stressLevel >= 0.6) return 'secondary';
        if (stressLevel >= 0.4) return 'tertiary';
        return 'weak';
    }

    // Helper functions
    function isVowel(char) {
        return VOWELS.includes(char.toLowerCase());
    }
    
    function containsVowel(text) {
        return text.split('').some(char => isVowel(char));
    }

    function isDiphthong(vowelPair) {
        const diphthongs = [
            'ai', 'ei', 'oi', 'ui', 'au', 'eu', 'ou', 'iu',
            'ão', 'õe', 'ãe', 'ũi', 'ái', 'éi', 'ói', 'úi'
        ];
        return diphthongs.includes(vowelPair.toLowerCase());
    }

    function isTriphthong(vowelTriple) {
        const triphthongs = ['uai', 'uei', 'uou', 'iai', 'iei'];
        return triphthongs.includes(vowelTriple.toLowerCase());
    }

    function canStartSyllable(consonantCluster) {
        const validClusters = [
            'br', 'cr', 'dr', 'fr', 'gr', 'kr', 'pr', 'tr',
            'bl', 'cl', 'fl', 'gl', 'pl', 'tl',
            'ch', 'lh', 'nh', 'qu', 'gu'
        ];
        return validClusters.includes(consonantCluster.toLowerCase());
    }

    function getStressType(position, totalSyllables) {
        const fromEnd = totalSyllables - 1 - position;
        if (fromEnd === 0) return 'oxytone';
        if (fromEnd === 1) return 'paroxytone';
        if (fromEnd === 2) return 'proparoxytone';
        return 'rare'; // More than 3 syllables from end
    }

    function getStressPositionByType(stressType, totalSyllables) {
        switch (stressType) {
            case 'oxytone':
                return totalSyllables - 1;
            case 'paroxytone':
                return Math.max(0, totalSyllables - 2);
            case 'proparoxytone':
                return Math.max(0, totalSyllables - 3);
            default:
                return Math.max(0, totalSyllables - 2); // Default to paroxytone
        }
    }

    /**
     * Provides debugging information for stress analysis
     * @param {string} word - Word to debug
     * @returns {Object} Debug information
     */
    function debugStressAnalysis(word) {
        const syllables = syllabify(word);
        const stressPattern = detectStress(word);
        const stressedSyllables = applySyllableStress(
            syllables.map(syl => ({ syllable: syl })), 
            stressPattern
        );
        
        return {
            originalWord: word,
            syllables: syllables,
            stressPattern: stressPattern,
            stressedSyllables: stressedSyllables,
            rules: {
                hasGraphicAccent: STRESS_RULES.GRAPHIC_ACCENT.test(word),
                oxytoneEnding: STRESS_RULES.OXYTONE_ENDINGS.test(word),
                paroxytoneException: STRESS_RULES.PAROXYTONE_EXCEPTIONS.test(word),
                proparoxytone: STRESS_RULES.PROPAROXYTONE.test(word)
            }
        };
    }

    // Export public interface
    return {
        syllabify,
        detectStress,
        applySyllableStress,
        debugStressAnalysis,
        calculateStressLevel,
        STRESS_RULES,
        SUFFIX_PATTERNS
    };
})();

// Make available globally
if (typeof window !== 'undefined') {
    window.StressAnalyzer = StressAnalyzer;
}