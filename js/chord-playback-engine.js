// Chord Playback Engine - Advanced Accompaniment System
const ChordPlaybackEngine = (() => {
    console.log('🎼 ChordPlaybackEngine module loading...');
    
    // Check if Tone.js is available
    if (typeof Tone === 'undefined') {
        console.error('❌ Tone.js is not available! Creating fallback ChordPlaybackEngine...');
        
        // Return a fallback version for UI compatibility
        return {
            ACCOMPANIMENT_PATTERNS: {
                'block': { name: 'Block Chords', description: 'All notes played simultaneously' },
                'arpeggio': { name: 'Arpeggios', description: 'Notes played in sequence' },
                'strum': { name: 'Strumming', description: 'Guitar-like strumming' },
                'broken': { name: 'Broken Chords', description: 'Alternating pattern' },
                'waltz': { name: 'Waltz Pattern', description: '3/4 time pattern' }
            },
            initializeChordInstruments: () => Promise.resolve(false),
            setAccompanimentEnabled: () => {},
            setAccompanimentPattern: () => {},
            setAccompanimentVolume: () => {},
            setBassVolume: () => {},
            isInitialized: false,
            isEnabled: false
        };
    }
    
    console.log('✓ Tone.js is available, initializing ChordPlaybackEngine...');
    // Audio instruments for chord accompaniment
    let chordInstrument = null;
    let bassInstrument = null;
    let rhythmInstrument = null;
    
    // Current state
    let isInitialized = false;
    let accompanimentPattern = 'block';
    let accompanimentVolume = 0.6;
    let bassVolume = 0.4;
    let chordProgression = 'I-V-vi-IV';
    let isAccompanimentEnabled = false;
    let currentKey = 'C';
    
    // Chord voicings and patterns
    const CHORD_VOICINGS = {
        'C': ['C4', 'E4', 'G4'],
        'Cmaj': ['C4', 'E4', 'G4'],
        'Dm': ['D4', 'F4', 'A4'],
        'Em': ['E4', 'G4', 'B4'],
        'F': ['F4', 'A4', 'C5'],
        'Fmaj': ['F4', 'A4', 'C5'],
        'G': ['G4', 'B4', 'D5'],
        'Gmaj': ['G4', 'B4', 'D5'],
        'Am': ['A4', 'C5', 'E5'],
        'Bdim': ['B4', 'D5', 'F5'],
        // Additional major keys
        'D': ['D4', 'F#4', 'A4'],
        'Dmaj': ['D4', 'F#4', 'A4'],
        'E': ['E4', 'G#4', 'B4'],
        'Emaj': ['E4', 'G#4', 'B4'],
        'A': ['A4', 'C#5', 'E5'],
        'Amaj': ['A4', 'C#5', 'E5'],
        'Bb': ['Bb4', 'D5', 'F5'],
        'Bbmaj': ['Bb4', 'D5', 'F5']
    };
    
    // Accompaniment patterns
    const ACCOMPANIMENT_PATTERNS = {
        'block': {
            name: 'Block Chords',
            description: 'All notes played simultaneously',
            timing: [0]
        },
        'arpeggio': {
            name: 'Arpeggios',
            description: 'Notes played in ascending sequence',
            timing: [0, 0.1, 0.2]
        },
        'strum': {
            name: 'Strumming',
            description: 'Quick sequential notes like guitar strumming',
            timing: [0, 0.05, 0.1]
        },
        'broken': {
            name: 'Broken Chords',
            description: 'Alternating bass and chord pattern',
            timing: [0, 0.25, 0.5, 0.75]
        },
        'waltz': {
            name: 'Waltz Pattern',
            description: '3/4 time bass-chord-chord pattern',
            timing: [0, 0.33, 0.66]
        }
    };
    
    /**
     * Initializes the chord playback instruments
     * @returns {Promise<boolean>} Success status
     */
    async function initializeChordInstruments() {
        if (isInitialized) {
            console.log('✓ Chord instruments already initialized');
            return true;
        }
        
        try {
            console.log('🎼 Initializing chord playback instruments...');
            
            // Create chord instrument (PolySynth for multiple simultaneous notes)
            chordInstrument = new Tone.PolySynth(Tone.Synth, {
                oscillator: {
                    type: 'triangle'
                },
                envelope: {
                    attack: 0.1,
                    decay: 0.3,
                    sustain: 0.8,
                    release: 1.0
                },
                volume: -6 // Slightly quieter than main melody
            }).toDestination();
            
            // Create bass instrument (single note bass lines)
            bassInstrument = new Tone.Synth({
                oscillator: {
                    type: 'triangle'
                },
                envelope: {
                    attack: 0.01,
                    decay: 0.2,
                    sustain: 0.3,
                    release: 0.8
                },
                volume: -12 // Quieter bass
            }).toDestination();
            
            // Optional: Create rhythm instrument for percussive patterns
            rhythmInstrument = new Tone.NoiseSynth({
                noise: { type: 'white' },
                envelope: {
                    attack: 0.01,
                    decay: 0.1,
                    sustain: 0.0
                },
                volume: -20 // Very quiet percussion
            }).toDestination();
            
            isInitialized = true;
            console.log('✓ Chord playback instruments initialized successfully');
            return true;
            
        } catch (error) {
            console.error('Failed to initialize chord instruments:', error);
            return false;
        }
    }
    
    /**
     * Plays a chord with specified pattern
     * @param {Array} chordNotes - Array of note names for the chord
     * @param {string} duration - Note duration
     * @param {string} time - When to play (Tone.js time format)
     * @param {string} pattern - Accompaniment pattern name
     * @param {number} velocity - Note velocity (0-1)
     */
    function playChord(chordNotes, duration = '1n', time = '+0', pattern = 'block', velocity = 0.6) {
        if (!chordInstrument || !isInitialized) {
            console.warn('Chord instrument not initialized');
            return;
        }
        
        if (!chordNotes || chordNotes.length === 0) {
            console.warn('No chord notes provided');
            return;
        }
        
        const patternConfig = ACCOMPANIMENT_PATTERNS[pattern] || ACCOMPANIMENT_PATTERNS.block;
        const baseTime = Tone.Time(time).toSeconds();
        
        switch (pattern) {
            case 'block':
                // All notes at once
                chordInstrument.triggerAttackRelease(chordNotes, duration, time, velocity);
                break;
                
            case 'arpeggio':
                // Notes in sequence
                chordNotes.forEach((note, index) => {
                    const noteTime = baseTime + (index * 0.1);
                    chordInstrument.triggerAttackRelease(note, '8n', noteTime, velocity);
                });
                break;
                
            case 'strum':
                // Quick sequential like guitar strum
                chordNotes.forEach((note, index) => {
                    const noteTime = baseTime + (index * 0.05);
                    chordInstrument.triggerAttackRelease(note, duration, noteTime, velocity * 0.9);
                });
                break;
                
            case 'broken':
                // Broken chord pattern: bass note, then upper notes
                if (chordNotes.length >= 3) {
                    // Bass note first
                    chordInstrument.triggerAttackRelease(chordNotes[0], '4n', time, velocity);
                    // Upper notes slightly later
                    const upperNotes = chordNotes.slice(1);
                    chordInstrument.triggerAttackRelease(upperNotes, '8n', baseTime + 0.25, velocity * 0.8);
                } else {
                    // Fallback to block chord
                    chordInstrument.triggerAttackRelease(chordNotes, duration, time, velocity);
                }
                break;
                
            case 'waltz':
                // 3/4 waltz pattern: bass-chord-chord
                if (chordNotes.length >= 3) {
                    // Bass note on beat 1
                    chordInstrument.triggerAttackRelease(chordNotes[0], '4n', time, velocity);
                    // Chord on beats 2 and 3
                    const upperNotes = chordNotes.slice(1);
                    chordInstrument.triggerAttackRelease(upperNotes, '8n', baseTime + 0.33, velocity * 0.7);
                    chordInstrument.triggerAttackRelease(upperNotes, '8n', baseTime + 0.66, velocity * 0.7);
                } else {
                    chordInstrument.triggerAttackRelease(chordNotes, duration, time, velocity);
                }
                break;
                
            default:
                console.warn(`Unknown pattern: ${pattern}, using block chords`);
                chordInstrument.triggerAttackRelease(chordNotes, duration, time, velocity);
        }
    }
    
    /**
     * Plays a bass note
     * @param {string} bassNote - Bass note name
     * @param {string} duration - Note duration
     * @param {string} time - When to play
     * @param {number} velocity - Note velocity
     */
    function playBassNote(bassNote, duration = '2n', time = '+0', velocity = 0.4) {
        if (!bassInstrument || !isInitialized) {
            console.warn('Bass instrument not initialized');
            return;
        }
        
        if (bassNote) {
            bassInstrument.triggerAttackRelease(bassNote, duration, time, velocity);
        }
    }
    
    /**
     * Schedules chord accompaniment for a musical sequence
     * @param {Object} harmonicAnalysis - Harmonic analysis from HarmonicEngine
     * @param {number} totalDuration - Total duration of the sequence
     * @param {string} pattern - Accompaniment pattern
     */
    function scheduleChordAccompaniment(harmonicAnalysis, totalDuration, pattern = 'block') {
        if (!isAccompanimentEnabled || !isInitialized) {
            console.log('Chord accompaniment disabled or not initialized');
            return;
        }
        
        console.log(`🎼 Scheduling chord accompaniment: ${pattern} pattern`);
        
        if (!harmonicAnalysis || !harmonicAnalysis.chordSequence) {
            console.warn('No chord sequence available for accompaniment');
            return;
        }
        
        const chordSequence = harmonicAnalysis.chordSequence;
        const chordDuration = totalDuration / chordSequence.length;
        
        let currentTime = 0;
        
        chordSequence.forEach((chordData, index) => {
            const chordName = chordData.chord;
            const chordNotes = CHORD_VOICINGS[chordName] || ['C4', 'E4', 'G4'];
            
            // Schedule chord
            Tone.Transport.scheduleOnce((time) => {
                playChord(
                    chordNotes, 
                    chordDuration + 's', 
                    time, 
                    pattern, 
                    accompanimentVolume
                );
            }, currentTime);
            
            currentTime += chordDuration;
        });
        
        // Schedule bass line if available
        if (harmonicAnalysis.bassLine && harmonicAnalysis.bassLine.length > 0) {
            scheduleBassLine(harmonicAnalysis.bassLine, totalDuration);
        }
        
        console.log(`✓ Chord accompaniment scheduled: ${chordSequence.length} chords over ${totalDuration.toFixed(2)}s`);
    }
    
    /**
     * Schedules bass line accompaniment
     * @param {Array} bassLine - Bass line from harmonic analysis
     * @param {number} totalDuration - Total duration
     */
    function scheduleBassLine(bassLine, totalDuration) {
        if (!bassLine.length) return;
        
        const bassDuration = totalDuration / bassLine.length;
        let currentTime = 0;
        
        bassLine.forEach(bassNote => {
            Tone.Transport.scheduleOnce((time) => {
                playBassNote(
                    bassNote.note, 
                    bassNote.duration || bassDuration + 's', 
                    time, 
                    bassVolume
                );
            }, currentTime);
            
            currentTime += bassDuration;
        });
        
        console.log(`✓ Bass line scheduled: ${bassLine.length} notes`);
    }
    
    /**
     * Sets the accompaniment pattern
     * @param {string} pattern - Pattern name
     */
    function setAccompanimentPattern(pattern) {
        if (ACCOMPANIMENT_PATTERNS[pattern]) {
            accompanimentPattern = pattern;
            console.log(`Accompaniment pattern set to: ${pattern}`);
            return true;
        } else {
            console.warn(`Unknown accompaniment pattern: ${pattern}`);
            return false;
        }
    }
    
    /**
     * Sets accompaniment volume
     * @param {number} volume - Volume level (0-1)
     */
    /**
     * Sets accompaniment volume with automatic melody adjustment
     * @param {number} volume - Volume level (0-1)
     * @param {boolean} adjustMelody - Whether to adjust melody volume for better mixing
     */
    function setAccompanimentVolumeWithMixing(volume, adjustMelody = true) {
        if (volume >= 0 && volume <= 1) {
            accompanimentVolume = volume;
            
            if (chordInstrument) {
                chordInstrument.volume.value = Tone.gainToDb(volume);
            }
            
            // Automatically adjust melody volume for better mixing
            if (adjustMelody && typeof AudioManager !== 'undefined' && AudioManager.currentInstrument) {
                const melodyAdjustment = 1 - (volume * 0.3); // Reduce melody when chords are louder
                const currentMelodyVolume = Tone.dbToGain(AudioManager.currentInstrument.volume.value);
                const newMelodyVolume = currentMelodyVolume * melodyAdjustment;
                AudioManager.currentInstrument.volume.value = Tone.gainToDb(newMelodyVolume);
                
                console.log(`✓ Volume mixing: Chords ${(volume * 100).toFixed(0)}%, Melody adjusted to ${(newMelodyVolume * 100).toFixed(0)}%`);
            }
            
            console.log(`Accompaniment volume set to: ${(volume * 100).toFixed(0)}%`);
            return true;
        }
        return false;
    }
    
    /**
     * Sets bass volume
     * @param {number} volume - Volume level (0-1)
     */
    function setBassVolume(volume) {
        if (volume >= 0 && volume <= 1) {
            bassVolume = volume;
            if (bassInstrument) {
                bassInstrument.volume.value = Tone.gainToDb(volume * 0.6); // Bass is naturally quieter
            }
            console.log(`Bass volume set to: ${(volume * 100).toFixed(0)}%`);
            return true;
        }
        return false;
    }
    
    /**
     * Enables or disables chord accompaniment
     * @param {boolean} enabled - Whether to enable accompaniment
     */
    function setAccompanimentEnabled(enabled) {
        isAccompanimentEnabled = !!enabled;
        console.log(`Chord accompaniment ${isAccompanimentEnabled ? 'enabled' : 'disabled'}`);
        return isAccompanimentEnabled;
    }
    
    /**
     * Sets the current musical key for chord voicings
     * @param {string} key - Musical key (e.g., 'C', 'G', 'F')
     */
    function setKey(key) {
        currentKey = key;
        console.log(`Musical key set to: ${key}`);
    }
    
    /**
     * Stops all chord accompaniment
     */
    function stopAccompaniment() {
        try {
            if (chordInstrument) {
                chordInstrument.releaseAll();
            }
            if (bassInstrument) {
                bassInstrument.triggerRelease();
            }
            if (rhythmInstrument) {
                rhythmInstrument.triggerRelease();
            }
            console.log('✓ Chord accompaniment stopped');
        } catch (error) {
            console.warn('Error stopping chord accompaniment:', error);
        }
    }
    
    /**
     * Disposes of all chord instruments
     */
    function dispose() {
        try {
            if (chordInstrument) {
                chordInstrument.dispose();
                chordInstrument = null;
            }
            if (bassInstrument) {
                bassInstrument.dispose();
                bassInstrument = null;
            }
            if (rhythmInstrument) {
                rhythmInstrument.dispose();
                rhythmInstrument = null;
            }
            isInitialized = false;
            console.log('✓ Chord playback engine disposed');
        } catch (error) {
            console.warn('Error disposing chord instruments:', error);
        }
    }
    
    /**
     * Sets accompaniment enabled state
     * @param {boolean} enabled - Whether accompaniment is enabled
     */
    function setAccompanimentEnabled(enabled) {
        isAccompanimentEnabled = enabled;
        console.log(`Chord accompaniment ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Sets the accompaniment pattern
     * @param {string} pattern - Pattern name
     */
    function setAccompanimentPattern(pattern) {
        if (ACCOMPANIMENT_PATTERNS[pattern]) {
            accompanimentPattern = pattern;
            console.log(`Accompaniment pattern set to: ${pattern}`);
        } else {
            console.warn(`Unknown pattern: ${pattern}`);
        }
    }
    
    /**
     * Sets the accompaniment volume
     * @param {number} volume - Volume level (0-1)
     */
    function setAccompanimentVolume(volume) {
        accompanimentVolume = Math.max(0, Math.min(1, volume));
        if (chordInstrument) {
            chordInstrument.volume.value = Tone.gainToDb(accompanimentVolume);
        }
        console.log(`Chord volume set to: ${accompanimentVolume}`);
    }
    
    /**
     * Sets accompaniment volume with enhanced mixing
     * @param {number} volume - Volume level (0-1)
     * @param {boolean} adjustMelodyVolume - Whether to adjust melody volume
     */
    function setAccompanimentVolumeWithMixing(volume, adjustMelodyVolume = true) {
        setAccompanimentVolume(volume);
        
        // Optionally adjust melody volume for better mixing
        if (adjustMelodyVolume && typeof AudioManager !== 'undefined') {
            // Reduce melody volume slightly when chords are loud
            const melodyReduction = volume > 0.7 ? 0.8 : 1.0;
            console.log(`Applied volume mixing: chord=${volume}, melody reduction=${melodyReduction}`);
        }
    }
    
    /**
     * Sets bass volume
     * @param {number} volume - Bass volume level (0-1)
     */
    function setBassVolume(volume) {
        bassVolume = Math.max(0, Math.min(1, volume));
        if (bassInstrument) {
            bassInstrument.volume.value = Tone.gainToDb(bassVolume);
        }
        console.log(`Bass volume set to: ${bassVolume}`);
    }
    
    /**
     * Sets the musical key for chord voicings
     * @param {string} key - Musical key (C, G, D, etc.)
     */
    function setKey(key) {
        currentKey = key;
        console.log(`Musical key set to: ${key}`);
    }
    
    /**
     * Gets current state for debugging
     * @returns {Object} Current state
     */
    function getState() {
        return {
            isInitialized,
            isAccompanimentEnabled,
            accompanimentPattern,
            accompanimentVolume,
            bassVolume,
            currentKey,
            availablePatterns: Object.keys(ACCOMPANIMENT_PATTERNS),
            hasChordInstrument: !!chordInstrument,
            hasBassInstrument: !!bassInstrument
        };
    }
    
    // Export public interface
    return {
        // Initialization
        initializeChordInstruments,
        dispose,
        
        // Playback functions
        playChord,
        playBassNote,
        scheduleChordAccompaniment,
        scheduleBassLine,
        
        // Configuration
        setAccompanimentPattern,
        setAccompanimentVolume,
        setAccompanimentVolumeWithMixing,
        setBassVolume,
        setAccompanimentEnabled,
        setKey,
        
        // Control
        stopAccompaniment,
        getState,
        
        // Constants
        ACCOMPANIMENT_PATTERNS,
        CHORD_VOICINGS,
        
        // Getters
        get isInitialized() { return isInitialized; },
        get isEnabled() { return isAccompanimentEnabled; },
        get currentPattern() { return accompanimentPattern; }
    };
})();

// Make ChordPlaybackEngine globally available
if (typeof window !== 'undefined') {
    window.ChordPlaybackEngine = ChordPlaybackEngine;
    console.log('✓ ChordPlaybackEngine exported to window object');
} else {
    console.warn('⚠️ Window object not available for ChordPlaybackEngine export');
}

// Additional debugging
if (ChordPlaybackEngine) {
    console.log('✓ ChordPlaybackEngine initialized successfully');
    console.log('Available patterns:', Object.keys(ChordPlaybackEngine.ACCOMPANIMENT_PATTERNS || {}));
} else {
    console.error('❌ ChordPlaybackEngine failed to initialize');
}