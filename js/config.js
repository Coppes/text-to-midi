const AppConfig = {
    DEFAULT_SCALE: 'cMajor',
    DEFAULT_INSTRUMENT: 'piano',
    NOTE_DURATION: '8n', // Duração da nota (oitava nota)
    SILENCE_DURATION: '8n', // Duração do silêncio para espaços

    SCALES: {
        cMajor: {
            // Mapeamento simples de algumas letras para notas em C Major
            // Idealmente, isso seria mais abrangente e musicalmente pensado
            'a': 'C4',
            's': 'D4',
            'd': 'E4',
            'f': 'F4',
            'g': 'G4',
            'h': 'A4',
            'j': 'B4',
            'k': 'C5',
            // Adicionando mais letras para cobrir um teclado QWERTY de forma mais linear
            'q': 'C4',
            'w': 'D4',
            'e': 'E4',
            'r': 'F4',
            't': 'G4',
            'y': 'A4',
            'u': 'B4',
            'i': 'C5',
            'o': 'D5',
            'p': 'E5',
            'z': 'F3',
            'x': 'G3',
            'c': 'A3',
            'v': 'B3',
            'b': 'C4', // Repetindo para ter mais teclas
            'n': 'D4',
            'm': 'E4',
            // Outras letras podem ser mapeadas para silêncio ou notas específicas
            // Por enquanto, letras não mapeadas não tocarão nada.
            ' ': null // Espaço representa silêncio
        },
        gMajor: {
            // Mapeamento para G Major (G, A, B, C, D, E, F#)
            'a': 'G3', 's': 'A3', 'd': 'B3', 'f': 'C4', 'g': 'D4', 'h': 'E4', 'j': 'F#4', 'k': 'G4',
            'q': 'G3', 'w': 'A3', 'e': 'B3', 'r': 'C4', 't': 'D4', 'y': 'E4', 'u': 'F#4', 'i': 'G4',
            'o': 'A4', 'p': 'B4',
            'z': 'C3', 'x': 'D3', 'c': 'E3', 'v': 'F#3',
            ' ': null
        },
        aMinorPentatonic: {
            // Mapeamento para A Minor Pentatonic (A, C, D, E, G)
            'a': 'A3', 's': 'C4', 'd': 'D4', 'f': 'E4', 'g': 'G4', 'h': 'A4', 'j': 'C5', 'k': 'D5',
            'q': 'A3', 'w': 'C4', 'e': 'D4', 'r': 'E4', 't': 'G4', 'y': 'A4', 'u': 'C5', 'i': 'D5',
            'o': 'E5', 'p': 'G5',
            'z': 'E3', 'x': 'G3',
            ' ': null
        },
        chromatic: {
            // Mapeamento simples para escala cromática (notas consecutivas)
            'a': 'C4', 's': 'C#4', 'd': 'D4', 'f': 'D#4', 'g': 'E4', 'h': 'F4', 'j': 'F#4', 'k': 'G4', 'l': 'G#4',
            'q': 'C4', 'w': 'C#4', 'e': 'D4', 'r': 'D#4', 't': 'E4', 'y': 'F4', 'u': 'F#4', 'i': 'G4', 'o': 'G#4', 'p': 'A4',
            'z': 'A#3', 'x': 'B3',
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
        }
    }
}; 