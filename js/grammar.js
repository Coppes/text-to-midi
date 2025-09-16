/**
 * Portuguese Grammar Analysis Engine
 * Advanced Linguistic Analysis Phase 1.1
 * 
 * This module provides grammatical analysis capabilities for Portuguese text,
 * classifying words by type and providing musical weighting for note selection.
 */

const GrammarAnalyzer = (() => {
    // Word type definitions with musical properties
    const WORD_TYPES = {
        NOUN: { 
            weight: 0.8, 
            octaveShift: 0, 
            emphasis: 'strong',
            color: '#4CAF50' // Green - stable, grounding
        },
        VERB: { 
            weight: 0.9, 
            octaveShift: 1, 
            emphasis: 'very_strong',
            color: '#F44336' // Red - action, movement
        },
        ADJECTIVE: { 
            weight: 0.6, 
            octaveShift: -1, 
            emphasis: 'medium',
            color: '#2196F3' // Blue - descriptive, flowing
        },
        ADVERB: { 
            weight: 0.7, 
            octaveShift: 0, 
            emphasis: 'medium',
            color: '#FF9800' // Orange - modifying, supporting
        },
        PREPOSITION: { 
            weight: 0.3, 
            octaveShift: -2, 
            emphasis: 'weak',
            color: '#9E9E9E' // Gray - connecting, subtle
        },
        ARTICLE: { 
            weight: 0.2, 
            octaveShift: -2, 
            emphasis: 'very_weak',
            color: '#607D8B' // Blue Gray - functional, minimal
        },
        PRONOUN: { 
            weight: 0.4, 
            octaveShift: -1, 
            emphasis: 'weak',
            color: '#795548' // Brown - referential
        },
        CONJUNCTION: { 
            weight: 0.3, 
            octaveShift: -2, 
            emphasis: 'weak',
            color: '#9C27B0' // Purple - linking
        },
        INTERJECTION: { 
            weight: 1.0, 
            octaveShift: 2, 
            emphasis: 'extreme',
            color: '#E91E63' // Pink - emotional, expressive
        }
    };

    // Portuguese language patterns for word classification
    const PORTUGUESE_PATTERNS = {
        // Articles
        articles: /^(o|a|os|as|um|uma|uns|umas)$/i,
        
        // Prepositions
        prepositions: /^(de|do|da|dos|das|em|no|na|nos|nas|por|pelo|pela|pelos|pelas|para|pra|com|sem|sob|sobre|entre|contra|desde|até|durante|mediante|segundo|conforme|perante|ante)$/i,
        
        // Pronouns
        pronouns: /^(eu|tu|ele|ela|nós|vós|eles|elas|me|te|se|nos|vos|lhe|lhes|meu|minha|meus|minhas|teu|tua|teus|tuas|seu|sua|seus|suas|nosso|nossa|nossos|nossas|vosso|vossa|vossos|vossas|este|esta|estes|estas|esse|essa|esses|essas|aquele|aquela|aqueles|aquelas|isto|isso|aquilo|que|quem|qual|quais|cujo|cuja|cujos|cujas|onde|quando|como|quanto|quanta|quantos|quantas)$/i,
        
        // Conjunctions
        conjunctions: /^(e|ou|mas|porém|contudo|todavia|entretanto|no entanto|portanto|logo|assim|então|pois|porque|que|se|caso|embora|ainda que|mesmo que|conquanto|posto que|apesar de|salvo|exceto|menos|senão|apenas|só|somente|nem|tampouco|também|inclusive|até|mesmo|ainda|já|sempre|nunca|jamais|talvez|acaso|por ventura)$/i,
        
        // Interjections
        interjections: /^(ah|oh|ei|oi|olá|tchau|puxa|nossa|caramba|eita|uau|hum|psiu|bis|bravo|viva|oxalá|tomara|ui|ai|eba|opa|ih|xi|poxa)$/i,
        
        // Adverb patterns (words ending in -mente)
        adverbMente: /mente$/i,
        
        // Common adverbs
        commonAdverbs: /^(não|sim|muito|pouco|mais|menos|bem|mal|melhor|pior|aqui|ali|lá|aí|hoje|ontem|amanhã|sempre|nunca|jamais|antes|depois|cedo|tarde|devagar|depressa|talvez|certamente|realmente|verdadeiramente|facilmente|dificilmente)$/i,
        
        // Noun patterns
        nounSuffixes: /(ção|são|mento|ismo|ista|dade|tude|eza|ura|ncia|ência|agem|ice|ez|eza)$/i,
        
        // Adjective patterns
        adjectiveSuffixes: /(oso|osa|ivo|iva|ado|ada|ido|ida|ante|ente|inte|vel|al|ar|ário|ária|ório|ória)$/i,
        
        // Verb patterns (infinitive)
        verbInfinitive: /(ar|er|ir)$/i,
        
        // Verb patterns (conjugated forms)
        verbConjugated: /(am|ão|ava|ia|ou|eu|as|es|a|e|mos|eis|em|ei|aste|aste|amos|aram|eram|iam|ará|erá|irá|aria|eria|iria|asse|esse|isse)$/i
    };

    /**
     * Analyzes a word and determines its grammatical type
     * @param {string} word - The word to analyze
     * @param {string} previousWord - Previous word for context (optional)
     * @param {string} nextWord - Next word for context (optional)
     * @returns {string} The grammatical type of the word
     */
    function analyzeWordType(word, previousWord = '', nextWord = '') {
        const cleanWord = word.toLowerCase().replace(/[^a-zà-ÿ]/g, '');
        
        if (!cleanWord) return 'PUNCTUATION';
        
        // Check specific patterns first (most reliable)
        if (PORTUGUESE_PATTERNS.articles.test(cleanWord)) return 'ARTICLE';
        if (PORTUGUESE_PATTERNS.prepositions.test(cleanWord)) return 'PREPOSITION';
        if (PORTUGUESE_PATTERNS.pronouns.test(cleanWord)) return 'PRONOUN';
        if (PORTUGUESE_PATTERNS.conjunctions.test(cleanWord)) return 'CONJUNCTION';
        if (PORTUGUESE_PATTERNS.interjections.test(cleanWord)) return 'INTERJECTION';
        
        // Check adverbs
        if (PORTUGUESE_PATTERNS.adverbMente.test(cleanWord)) return 'ADVERB';
        if (PORTUGUESE_PATTERNS.commonAdverbs.test(cleanWord)) return 'ADVERB';
        
        // Check verb patterns
        if (PORTUGUESE_PATTERNS.verbInfinitive.test(cleanWord)) return 'VERB';
        if (PORTUGUESE_PATTERNS.verbConjugated.test(cleanWord)) return 'VERB';
        
        // Check adjective patterns (before noun patterns as they can overlap)
        if (PORTUGUESE_PATTERNS.adjectiveSuffixes.test(cleanWord)) {
            // Context check: adjectives often follow articles or come after nouns
            if (previousWord && (PORTUGUESE_PATTERNS.articles.test(previousWord) || 
                analyzeWordType(previousWord) === 'NOUN')) {
                return 'ADJECTIVE';
            }
            return 'ADJECTIVE';
        }
        
        // Check noun patterns
        if (PORTUGUESE_PATTERNS.nounSuffixes.test(cleanWord)) return 'NOUN';
        
        // Contextual analysis
        if (previousWord) {
            const prevType = PORTUGUESE_PATTERNS.articles.test(previousWord) ? 'ARTICLE' : 
                           PORTUGUESE_PATTERNS.prepositions.test(previousWord) ? 'PREPOSITION' : null;
            
            if (prevType === 'ARTICLE') {
                // After articles, we typically have nouns or adjectives
                return cleanWord.length > 6 ? 'NOUN' : 'ADJECTIVE';
            }
            
            if (prevType === 'PREPOSITION') {
                // After prepositions, we typically have nouns or pronouns
                return 'NOUN';
            }
        }
        
        // Default heuristics based on word length and common patterns
        if (cleanWord.length <= 3) return 'ARTICLE'; // Short words tend to be functional
        if (cleanWord.length >= 8) return 'NOUN'; // Longer words tend to be nouns
        if (/^[aeiou]/i.test(cleanWord)) return 'ADJECTIVE'; // Words starting with vowels often adjectives
        
        return 'NOUN'; // Default fallback
    }

    /**
     * Analyzes a complete sentence for grammatical structure
     * @param {string} sentence - The sentence to analyze
     * @returns {Array} Array of word analysis objects
     */
    function analyzeSentence(sentence) {
        const words = sentence.split(/\s+/).filter(word => word.length > 0);
        const analysis = [];
        
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const previousWord = i > 0 ? words[i - 1] : '';
            const nextWord = i < words.length - 1 ? words[i + 1] : '';
            
            const wordType = analyzeWordType(word, previousWord, nextWord);
            const typeData = WORD_TYPES[wordType] || WORD_TYPES.NOUN;
            
            analysis.push({
                word: word,
                cleanWord: word.toLowerCase().replace(/[^a-zà-ÿ]/g, ''),
                type: wordType,
                weight: typeData.weight,
                octaveShift: typeData.octaveShift,
                emphasis: typeData.emphasis,
                color: typeData.color,
                position: i,
                length: words.length
            });
        }
        
        return analysis;
    }

    /**
     * Calculates musical weight for a character based on its word context
     * @param {string} char - Character to analyze
     * @param {Object} wordAnalysis - Analysis of the word containing this character
     * @param {number} charPosition - Position of character within the word
     * @returns {Object} Musical properties for the character
     */
    function getCharacterMusicalProperties(char, wordAnalysis, charPosition) {
        const baseWeight = wordAnalysis.weight;
        const wordLength = wordAnalysis.word.length;
        
        // Position-based weighting within word
        let positionWeight = 1.0;
        if (charPosition === 0) {
            positionWeight = 1.2; // First character emphasis
        } else if (charPosition === wordLength - 1) {
            positionWeight = 1.1; // Last character slight emphasis
        } else {
            positionWeight = 0.9; // Middle characters slightly reduced
        }
        
        // Vowel vs consonant weighting
        const isVowel = /[aeiouáéíóúàèìòùâêîôûãõ]/i.test(char);
        const vowelWeight = isVowel ? 1.1 : 0.9;
        
        return {
            weight: baseWeight * positionWeight * vowelWeight,
            octaveShift: wordAnalysis.octaveShift,
            emphasis: wordAnalysis.emphasis,
            isVowel: isVowel,
            wordType: wordAnalysis.type
        };
    }

    /**
     * Provides debugging information about word classification
     * @param {string} word - Word to debug
     * @returns {Object} Debug information
     */
    function debugWordClassification(word) {
        const cleanWord = word.toLowerCase().replace(/[^a-zà-ÿ]/g, '');
        const type = analyzeWordType(word);
        const patterns = {};
        
        // Check which patterns match
        for (const [patternName, pattern] of Object.entries(PORTUGUESE_PATTERNS)) {
            patterns[patternName] = pattern.test(cleanWord);
        }
        
        return {
            originalWord: word,
            cleanWord: cleanWord,
            classifiedAs: type,
            properties: WORD_TYPES[type],
            matchingPatterns: Object.entries(patterns)
                .filter(([name, matches]) => matches)
                .map(([name]) => name)
        };
    }

    // Export public interface
    return {
        analyzeWordType,
        analyzeSentence,
        getCharacterMusicalProperties,
        debugWordClassification,
        WORD_TYPES,
        PORTUGUESE_PATTERNS
    };
})();

// Make available globally for integration with existing code
if (typeof window !== 'undefined') {
    window.GrammarAnalyzer = GrammarAnalyzer;
}