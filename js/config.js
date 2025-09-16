const AppConfig = {
    DEFAULT_SCALE: 'cMajor',
    DEFAULT_INSTRUMENT: 'piano',
    NOTE_DURATION: '8n', // Duração da nota (oitava nota)
    SILENCE_DURATION: '8n', // Duração do silêncio para espaços
    DEFAULT_TEMPO: 120, // BPM
    MIN_TEMPO: 60,
    MAX_TEMPO: 200,
    
    // Rhythm and timing configurations
    RHYTHM_PATTERNS: {
        uniform: {
            name: 'Uniforme',
            noteDuration: '8n',
            silenceDuration: '8n'
        },
        punctuation: {
            name: 'Baseado em Pontuação',
            // Variable durations based on punctuation
            durations: {
                '.': '2n',    // Period = half note
                '!': '4n',    // Exclamation = quarter note
                '?': '4n',    // Question = quarter note
                ',': '4n',    // Comma = quarter note
                ';': '4n',    // Semicolon = quarter note
                ':': '4n',    // Colon = quarter note
                '-': '8n',    // Dash = eighth note
                ' ': '8n',    // Space = eighth note
                'default': '8n' // Default for characters
            }
        },
        expressive: {
            name: 'Expressivo',
            // Varied durations for musical expression
            durations: {
                'vowels': '4n',      // a, e, i, o, u = quarter notes
                'consonants': '8n',   // consonants = eighth notes
                'punctuation': '2n',  // punctuation = half notes
                'space': '4n',       // spaces = quarter note rest
                'default': '8n'
            }
        }
    },

    SCALES: {
        cMajor: {
            // Enhanced mapping covering more letters for C Major scale
            // Main keyboard row (QWERTY)
            'q': 'C4', 'w': 'D4', 'e': 'E4', 'r': 'F4', 't': 'G4', 'y': 'A4', 'u': 'B4', 'i': 'C5', 'o': 'D5', 'p': 'E5',
            // Home row (ASDF...)
            'a': 'C4', 's': 'D4', 'd': 'E4', 'f': 'F4', 'g': 'G4', 'h': 'A4', 'j': 'B4', 'k': 'C5', 'l': 'D5',
            // Bottom row (ZXCV...)
            'z': 'F3', 'x': 'G3', 'c': 'A3', 'v': 'B3', 'b': 'C4', 'n': 'D4', 'm': 'E4',
            // Numbers for higher octave
            '1': 'C3', '2': 'D3', '3': 'E3', '4': 'F3', '5': 'G3', '6': 'A3', '7': 'B3', '8': 'C4', '9': 'D4', '0': 'E4',
            // Space for silence
            ' ': null
        },
        gMajor: {
            // Enhanced mapping for G Major (G, A, B, C, D, E, F#)
            'q': 'G3', 'w': 'A3', 'e': 'B3', 'r': 'C4', 't': 'D4', 'y': 'E4', 'u': 'F#4', 'i': 'G4', 'o': 'A4', 'p': 'B4',
            'a': 'G3', 's': 'A3', 'd': 'B3', 'f': 'C4', 'g': 'D4', 'h': 'E4', 'j': 'F#4', 'k': 'G4', 'l': 'A4',
            'z': 'C3', 'x': 'D3', 'c': 'E3', 'v': 'F#3', 'b': 'G3', 'n': 'A3', 'm': 'B3',
            '1': 'G2', '2': 'A2', '3': 'B2', '4': 'C3', '5': 'D3', '6': 'E3', '7': 'F#3', '8': 'G3', '9': 'A3', '0': 'B3',
            ' ': null
        },
        aMinorPentatonic: {
            // Enhanced mapping for A Minor Pentatonic (A, C, D, E, G)
            'q': 'A3', 'w': 'C4', 'e': 'D4', 'r': 'E4', 't': 'G4', 'y': 'A4', 'u': 'C5', 'i': 'D5', 'o': 'E5', 'p': 'G5',
            'a': 'A3', 's': 'C4', 'd': 'D4', 'f': 'E4', 'g': 'G4', 'h': 'A4', 'j': 'C5', 'k': 'D5', 'l': 'E5',
            'z': 'E3', 'x': 'G3', 'c': 'A3', 'v': 'C4', 'b': 'D4', 'n': 'E4', 'm': 'G4',
            '1': 'A2', '2': 'C3', '3': 'D3', '4': 'E3', '5': 'G3', '6': 'A3', '7': 'C4', '8': 'D4', '9': 'E4', '0': 'G4',
            ' ': null
        },
        chromatic: {
            // Enhanced mapping for chromatic scale (all 12 semitones)
            'q': 'C4', 'w': 'C#4', 'e': 'D4', 'r': 'D#4', 't': 'E4', 'y': 'F4', 'u': 'F#4', 'i': 'G4', 'o': 'G#4', 'p': 'A4',
            'a': 'A#4', 's': 'B4', 'd': 'C5', 'f': 'C#5', 'g': 'D5', 'h': 'D#5', 'j': 'E5', 'k': 'F5', 'l': 'F#5',
            'z': 'G3', 'x': 'G#3', 'c': 'A3', 'v': 'A#3', 'b': 'B3', 'n': 'C4', 'm': 'C#4',
            '1': 'C3', '2': 'C#3', '3': 'D3', '4': 'D#3', '5': 'E3', '6': 'F3', '7': 'F#3', '8': 'G3', '9': 'G#3', '0': 'A3',
            ' ': null
        },
        dMajor: {
            // D Major scale (D, E, F#, G, A, B, C#)
            'q': 'D3', 'w': 'E3', 'e': 'F#3', 'r': 'G3', 't': 'A3', 'y': 'B3', 'u': 'C#4', 'i': 'D4', 'o': 'E4', 'p': 'F#4',
            'a': 'D3', 's': 'E3', 'd': 'F#3', 'f': 'G3', 'g': 'A3', 'h': 'B3', 'j': 'C#4', 'k': 'D4', 'l': 'E4',
            'z': 'G2', 'x': 'A2', 'c': 'B2', 'v': 'C#3', 'b': 'D3', 'n': 'E3', 'm': 'F#3',
            '1': 'D2', '2': 'E2', '3': 'F#2', '4': 'G2', '5': 'A2', '6': 'B2', '7': 'C#3', '8': 'D3', '9': 'E3', '0': 'F#3',
            ' ': null
        },
        eMinor: {
            // E Minor scale (E, F#, G, A, B, C, D)
            'q': 'E3', 'w': 'F#3', 'e': 'G3', 'r': 'A3', 't': 'B3', 'y': 'C4', 'u': 'D4', 'i': 'E4', 'o': 'F#4', 'p': 'G4',
            'a': 'E3', 's': 'F#3', 'd': 'G3', 'f': 'A3', 'g': 'B3', 'h': 'C4', 'j': 'D4', 'k': 'E4', 'l': 'F#4',
            'z': 'A2', 'x': 'B2', 'c': 'C3', 'v': 'D3', 'b': 'E3', 'n': 'F#3', 'm': 'G3',
            '1': 'E2', '2': 'F#2', '3': 'G2', '4': 'A2', '5': 'B2', '6': 'C3', '7': 'D3', '8': 'E3', '9': 'F#3', '0': 'G3',
            ' ': null
        },
        cMajorPentatonic: {
            // C Major Pentatonic (C, D, E, G, A)
            'q': 'C3', 'w': 'D3', 'e': 'E3', 'r': 'G3', 't': 'A3', 'y': 'C4', 'u': 'D4', 'i': 'E4', 'o': 'G4', 'p': 'A4',
            'a': 'C3', 's': 'D3', 'd': 'E3', 'f': 'G3', 'g': 'A3', 'h': 'C4', 'j': 'D4', 'k': 'E4', 'l': 'G4',
            'z': 'G2', 'x': 'A2', 'c': 'C3', 'v': 'D3', 'b': 'E3', 'n': 'G3', 'm': 'A3',
            '1': 'C2', '2': 'D2', '3': 'E2', '4': 'G2', '5': 'A2', '6': 'C3', '7': 'D3', '8': 'E3', '9': 'G3', '0': 'A3',
            ' ': null
        }
        // Outras escalas serão adicionadas aqui (gMajor, aMinorPentatonic, etc.)
    },

    INSTRUMENTS: {
        piano: {
            type: 'Sampler',
            options: {
                urls: {
                    'C4': 'C4.mp3',
                    'D#4': 'Ds4.mp3', // D#4 é o mesmo que Eb4
                    'F#4': 'Fs4.mp3', // F#4 é o mesmo que Gb4
                    'A4': 'A4.mp3'
                },
                release: 1,
                baseUrl: 'https://tonejs.github.io/audio/salamander/' // Nova BaseURL para samples de piano
            }
        },
        synthLead: {
            type: 'Synth',
            options: {
                oscillator: {
                    type: 'fatsawtooth',
                    count: 3,
                    spread: 30
                },
                envelope: {
                    attack: 0.01,
                    decay: 0.1,
                    sustain: 0.5,
                    release: 0.4,
                    attackCurve: 'exponential'
                }
            }
        },
        guitar: {
            type: 'Sampler',
            options: {
                 urls: {
                    'E2': 'https://tonejs.github.io/audio/berklee/guitar-acoustic-E2.mp3',
                    'A2': 'https://tonejs.github.io/audio/berklee/guitar-acoustic-A2.mp3',
                    'C3': 'https://tonejs.github.io/audio/berklee/guitar-acoustic-C3.mp3',
                    'E3': 'https://tonejs.github.io/audio/berklee/guitar-acoustic-E3.mp3',
                    'A3': 'https://tonejs.github.io/audio/berklee/guitar-acoustic-A3.mp3',
                    'C4': 'https://tonejs.github.io/audio/berklee/guitar-acoustic-C4.mp3',
                 },
                 release: 1,
                 baseUrl: ''
            }
        },
        synthPad: {
            type: 'Synth',
            options: {
                oscillator: {
                    type: 'triangle',
                    partials: [0, 2, 3, 4]
                },
                envelope: {
                    attack: 0.8,
                    decay: 0.2,
                    sustain: 0.8,
                    release: 2.0
                }
            }
        },
        electricPiano: {
            type: 'Sampler',
            options: {
                urls: {
                    'C3': 'https://tonejs.github.io/audio/berklee/electric-piano-C3.mp3',
                    'C4': 'https://tonejs.github.io/audio/berklee/electric-piano-C4.mp3',
                    'C5': 'https://tonejs.github.io/audio/berklee/electric-piano-C5.mp3'
                },
                release: 1,
                baseUrl: ''
            }
        },
        bass: {
            type: 'Synth',
            options: {
                oscillator: {
                    type: 'triangle'
                },
                envelope: {
                    attack: 0.01,
                    decay: 0.1,
                    sustain: 0.3,
                    release: 0.8
                }
            }
        },
        bells: {
            type: 'Synth',
            options: {
                oscillator: {
                    type: 'sine',
                    partials: [1, 0, 2, 0, 3]
                },
                envelope: {
                    attack: 0.001,
                    decay: 1.4,
                    sustain: 0,
                    release: 1.4
                }
            }
        }
        // Outros instrumentos serão adicionados aqui
    },

    EFFECTS: {
        defaultEQ: {
            low: 0,    // dB
            mid: 0,    // dB
            high: 0    // dB
        },
        defaultModulation: {
            // Para Vibrato (LFO no pitch)
            vibratoRate: 0, // Hz
            vibratoDepth: 0, // 0 a 1
            // Para Tremolo (LFO na amplitude)
            tremoloRate: 0, // Hz
            tremoloDepth: 0 // 0 a 1
        },
        // EQ Presets for quick setup
        EQ_PRESETS: {
            flat: { low: 0, mid: 0, high: 0 },
            bright: { low: -2, mid: 1, high: 4 },
            warm: { low: 3, mid: 2, high: -1 },
            bass_boost: { low: 6, mid: 0, high: -2 },
            presence: { low: -1, mid: 3, high: 2 },
            radio: { low: -4, mid: 2, high: -3 }
        },
        // Modulation Presets
        MOD_PRESETS: {
            none: { vibratoRate: 0, vibratoDepth: 0, tremoloRate: 0, tremoloDepth: 0 },
            subtle: { vibratoRate: 4, vibratoDepth: 0.1, tremoloRate: 2, tremoloDepth: 0.05 },
            classic: { vibratoRate: 6, vibratoDepth: 0.2, tremoloRate: 4, tremoloDepth: 0.15 },
            dramatic: { vibratoRate: 8, vibratoDepth: 0.4, tremoloRate: 6, tremoloDepth: 0.3 }
        }
    }
}; 