// Audio Engine Module - Enhanced with precise timing
const AudioManager = (() => {
    let instrument = null;
    let eq = null;
    let vibrato = null;
    let tremolo = null;
    let isAudioContextStarted = false;

    async function initializeAudio() {
        if (isAudioContextStarted) return;
        
        try {
            await Tone.start();
            console.log("Contexto de áudio iniciado pelo usuário.");
            isAudioContextStarted = true;

            // Set default tempo
            Tone.Transport.bpm.value = AppConfig.DEFAULT_TEMPO;

            // Configurar efeitos (serão conectados ao instrumento quando carregado)
            eq = new Tone.EQ3(AppConfig.EFFECTS.defaultEQ.low, AppConfig.EFFECTS.defaultEQ.mid, AppConfig.EFFECTS.defaultEQ.high).toDestination();
            vibrato = new Tone.Vibrato(AppConfig.EFFECTS.defaultModulation.vibratoRate, AppConfig.EFFECTS.defaultModulation.vibratoDepth);
            tremolo = new Tone.Tremolo(AppConfig.EFFECTS.defaultModulation.tremoloRate, AppConfig.EFFECTS.defaultModulation.tremoloDepth).start();

            // Carregar instrumento padrão
            await loadInstrument(AppConfig.DEFAULT_INSTRUMENT);
        } catch (error) {
            console.error("Erro ao inicializar contexto de áudio:", error);
            throw error;
        }
    }

    async function loadInstrument(instrumentName) {
        if (!isAudioContextStarted) {
            console.warn("Contexto de áudio não iniciado. Clique na tela para iniciar.");
            return;
        }

        const instrumentConfig = AppConfig.INSTRUMENTS[instrumentName];
        if (!instrumentConfig) {
            console.error(`Instrumento '${instrumentName}' não encontrado na configuração.`);
            return;
        }

        try {
            // Desconectar e descartar instrumento antigo, se existir
            if (instrument) {
                instrument.dispose();
            }

            if (instrumentConfig.type === 'Sampler') {
                instrument = new Tone.Sampler(instrumentConfig.options);
            } else if (instrumentConfig.type === 'Synth') {
                instrument = new Tone.Synth(instrumentConfig.options);
            } else {
                console.error(`Tipo de instrumento '${instrumentConfig.type}' não suportado.`);
                return;
            }

            // Conectar instrumento à cadeia de efeitos e à saída
            instrument.chain(vibrato, tremolo, eq, Tone.Destination);

            if (instrumentConfig.type === 'Sampler') {
                await Tone.loaded();
                console.log(`Instrumento '${instrumentName}' (Sampler) carregado.`);
            } else {
                console.log(`Instrumento '${instrumentName}' (Synth) carregado.`);
            }
        } catch (error) {
            console.error(`Erro ao carregar instrumento '${instrumentName}':`, error);
        }
    }

    function playNote(noteName, duration = AppConfig.NOTE_DURATION, time = "+0") {
        if (!instrument || !isAudioContextStarted) {
            return;
        }
        if (noteName) { // Só toca se houver uma nota (ignora null para silêncios)
            // Use immediate timing with small offset for better responsiveness
            const playTime = time === "+0" ? Tone.now() : time;
            instrument.triggerAttackRelease(noteName, duration, playTime);
        }
    }

    function scheduleText(text, scaleName, noteDuration, silenceDuration, rhythmPattern = null) {
        if (!instrument || !isAudioContextStarted) {
            console.warn("Instrumento não carregado ou áudio não iniciado para agendamento.");
            return;
        }

        const scaleMap = AppConfig.SCALES[scaleName];
        if (!scaleMap) {
            console.error(`Escala '${scaleName}' não encontrada.`);
            return;
        }

        Tone.Transport.cancel(); // Limpa eventos agendados anteriormente
        let currentTime = 0;

        for (let i = 0; i < text.length; i++) {
            const char = text[i].toLowerCase();
            const note = scaleMap[char];
            
            // Determine duration based on rhythm pattern
            let charNoteDuration = noteDuration;
            let charSilenceDuration = silenceDuration;
            
            if (rhythmPattern && AppConfig.RHYTHM_PATTERNS[rhythmPattern]) {
                const pattern = AppConfig.RHYTHM_PATTERNS[rhythmPattern];
                
                if (pattern.durations) {
                    // Get duration based on character type
                    charNoteDuration = getDurationForCharacter(char, text[i], pattern);
                    charSilenceDuration = charNoteDuration;
                }
            }

            if (note !== undefined) { // Se o caractere está mapeado (pode ser null para silêncio)
                if (note) { // Se é uma nota (não null)
                    Tone.Transport.scheduleOnce((time) => {
                        playNote(note, charNoteDuration, time);
                    }, currentTime);
                    currentTime += Tone.Time(charNoteDuration).toSeconds();
                } else { // É um silêncio (mapeado para null)
                    currentTime += Tone.Time(charSilenceDuration).toSeconds();
                }
            } else {
                // Caractere não mapeado na escala, tratar baseado no padrão rítmico
                if (rhythmPattern && AppConfig.RHYTHM_PATTERNS[rhythmPattern].durations) {
                    const duration = getDurationForCharacter(char, text[i], AppConfig.RHYTHM_PATTERNS[rhythmPattern]);
                    currentTime += Tone.Time(duration).toSeconds();
                } else {
                    currentTime += Tone.Time(charSilenceDuration).toSeconds();
                }
            }
        }
        Tone.Transport.start("+0.1"); // Inicia o transporte com um pequeno delay
    }
    
    function getDurationForCharacter(lowerChar, originalChar, pattern) {
        const durations = pattern.durations;
        
        // Check specific character mappings first
        if (durations[lowerChar]) {
            return durations[lowerChar];
        }
        
        // Check for punctuation
        if (/[.!?,:;\-]/.test(originalChar)) {
            return durations[originalChar] || durations.punctuation || durations.default;
        }
        
        // Check for vowels
        if (/[aeiouáéíóúàèìòùâêîôûãõç]/.test(lowerChar)) {
            return durations.vowels || durations.default;
        }
        
        // Check for consonants
        if (/[bcdfghjklmnpqrstvwxyz]/.test(lowerChar)) {
            return durations.consonants || durations.default;
        }
        
        // Check for space
        if (originalChar === ' ') {
            return durations.space || durations[' '] || durations.default;
        }
        
        return durations.default;
    }

    function stopAllSounds() {
        // Enhanced stop with highlighting coordination
        if (Tone.Transport.state === "started") {
            Tone.Transport.stop();
        }
        
        // Stop instrument notes
        if (instrument) {
            if (typeof instrument.releaseAll === 'function') {
                instrument.releaseAll();
            }
            
            // For PolySynth, dispose of active voices to prevent hanging notes
            if (instrument.activeVoices) {
                instrument.activeVoices.forEach(voice => {
                    if (voice.triggerRelease) {
                        voice.triggerRelease();
                    }
                });
            }
        }
        
        // Clear transport events
        Tone.Transport.cancel();
        
        // Stop text highlighting with coordination
        if (typeof TextHighlighter !== 'undefined') {
            try {
                TextHighlighter.stopHighlighting();
                console.log('✓ Text highlighting stopped');
            } catch (error) {
                console.warn('Error stopping highlighting:', error);
            }
        }
        
        // Stop chord accompaniment if available
        if (typeof ChordPlaybackEngine !== 'undefined' && ChordPlaybackEngine.stopAccompaniment) {
            try {
                ChordPlaybackEngine.stopAccompaniment();
                console.log('✓ Chord accompaniment stopped');
            } catch (error) {
                console.warn('Error stopping chord accompaniment:', error);
            }
        }
        
        console.log('✓ All audio and visual elements stopped');
    }
    
    /**
     * Enhanced playback with chord accompaniment integration
     * @param {string} text - Input text
     * @param {string} scaleName - Musical scale
     * @param {Object} accompanimentSettings - Chord settings
     * @returns {boolean} Playback state
     */
    function togglePlaybackWithChords(text, scaleName, accompanimentSettings = {}) {
        if (!isAudioContextStarted) {
            return initializeAudio().then(() => {
                return togglePlaybackWithChords(text, scaleName, accompanimentSettings);
            });
        }
        
        if (Tone.Transport.state !== "started") {
            return startPlaybackWithChords(text, scaleName, accompanimentSettings);
        } else {
            stopAllSounds();
            return false;
        }
    }
    
    /**
     * Starts playback with integrated chord accompaniment
     * @param {string} text - Input text
     * @param {string} scaleName - Musical scale
     * @param {Object} accompanimentSettings - Chord settings
     * @returns {boolean} Success state
     */
    function startPlaybackWithChords(text, scaleName, accompanimentSettings) {
        try {
            console.log('🎼 Starting playback with chord accompaniment');
            
            // Initialize chord instruments if not already done
            if (typeof ChordPlaybackEngine !== 'undefined' && !ChordPlaybackEngine.isInitialized) {
                ChordPlaybackEngine.initializeChordInstruments();
            }
            
            // Schedule main melody
            scheduleText(text, scaleName, AppConfig.NOTE_DURATION, AppConfig.SILENCE_DURATION);
            
            // Schedule chord accompaniment if enabled
            if (accompanimentSettings.enabled && typeof ChordPlaybackEngine !== 'undefined') {
                scheduleChordAccompanimentWithMelody(text, scaleName, accompanimentSettings);
            }
            
            console.log('✓ Playback with chords started successfully');
            return true;
            
        } catch (error) {
            console.error('Failed to start playback with chords:', error);
            return false;
        }
    }
    
    /**
     * Schedules chord accompaniment synchronized with melody
     * @param {string} text - Original text
     * @param {string} scaleName - Musical scale
     * @param {Object} settings - Accompaniment settings
     */
    function scheduleChordAccompanimentWithMelody(text, scaleName, settings) {
        try {
            // Get harmonic analysis
            let harmonicAnalysis = null;
            if (typeof HarmonicEngine !== 'undefined') {
                harmonicAnalysis = HarmonicEngine.debugHarmonicAnalysis(text, getKeyFromScale(scaleName));
            }
            
            if (!harmonicAnalysis) {
                console.warn('No harmonic analysis available for accompaniment');
                return;
            }
            
            // Calculate total melody duration
            const melodyDuration = text.length * Tone.Time(AppConfig.NOTE_DURATION).toSeconds();
            
            // Apply volume mixing - reduce melody volume when chords are enabled
            const melodyVolumeReduction = settings.enabled ? 0.8 : 1.0;
            if (instrument && instrument.volume) {
                const currentVolume = instrument.volume.value;
                instrument.volume.value = Tone.gainToDb(Tone.dbToGain(currentVolume) * melodyVolumeReduction);
            }
            
            // Configure chord engine
            if (settings.pattern) {
                ChordPlaybackEngine.setAccompanimentPattern(settings.pattern);
            }
            if (settings.volume !== undefined) {
                ChordPlaybackEngine.setAccompanimentVolume(settings.volume);
            }
            if (settings.bassVolume !== undefined) {
                ChordPlaybackEngine.setBassVolume(settings.bassVolume);
            }
            
            // Schedule the accompaniment
            ChordPlaybackEngine.scheduleChordAccompaniment(
                harmonicAnalysis,
                melodyDuration,
                settings.pattern || 'block'
            );
            
            console.log(`✓ Chord accompaniment scheduled: ${settings.pattern} pattern`);
            
        } catch (error) {
            console.error('Error scheduling chord accompaniment:', error);
        }
    }
    
    /**
     * Gets musical key from scale name
     * @param {string} scaleName - Scale name
     * @returns {string} Musical key
     */
    function getKeyFromScale(scaleName) {
        const scaleToKey = {
            'cMajor': 'C',
            'gMajor': 'G',
            'dMajor': 'D',
            'aMajor': 'A',
            'eMajor': 'E',
            'fMajor': 'F',
            'bbMajor': 'Bb',
            'aMinor': 'A',
            'eMinor': 'E',
            'bMinor': 'B'
        };
        
        return scaleToKey[scaleName] || 'C';
    }

    /**
     * Enhanced playback with linguistic analysis and visual highlighting
     * Improved with precise timing synchronization (±10ms accuracy)
     * @param {string} text - Input text
     * @param {string} scaleName - Musical scale
     * @param {string} analysisMode - Analysis mode for LinguisticIntegration
     * @param {string} highlightMode - Highlighting mode (character, syllable, word, phoneme)
     * @returns {boolean} Playback state
     */
    function togglePlaybackWithHighlighting(text, scaleName, analysisMode = 'BASIC', highlightMode = 'character') {
        if (!isAudioContextStarted) {
            return initializeAudio().then(() => {
                return startEnhancedPlayback(text, scaleName, analysisMode, highlightMode);
            });
        }
        
        if (Tone.Transport.state !== "started") {
            return startEnhancedPlayback(text, scaleName, analysisMode, highlightMode);
        } else {
            stopAllSounds();
            return false;
        }
    }
    
    /**
     * Starts enhanced playback with precise timing coordination
     * @param {string} text - Input text
     * @param {string} scaleName - Musical scale
     * @param {string} analysisMode - Analysis mode
     * @param {string} highlightMode - Highlighting mode
     * @returns {boolean} Success state
     */
    function startEnhancedPlayback(text, scaleName, analysisMode, highlightMode) {
        try {
            console.log(`✓ Starting enhanced playback: ${analysisMode} analysis + ${highlightMode} highlighting`);
            
            let linguisticResult;
            
            // Use linguistic integration if available
            if (typeof LinguisticIntegration !== 'undefined') {
                try {
                    LinguisticIntegration.setAnalysisMode(analysisMode);
                    linguisticResult = LinguisticIntegration.processText(text, scaleName);
                    console.log('✓ Linguistic analysis completed');
                } catch (linguisticError) {
                    console.warn('Linguistic integration failed, using fallback:', linguisticError);
                    linguisticResult = createFallbackLinguisticResult(text, scaleName);
                }
            } else {
                console.warn('LinguisticIntegration not available, using basic mode');
                linguisticResult = createFallbackLinguisticResult(text, scaleName);
            }
            
            // Prepare text highlighting if available
            if (typeof TextHighlighter !== 'undefined') {
                try {
                    TextHighlighter.setHighlightMode(highlightMode);
                    TextHighlighter.prepareText(text, linguisticResult);
                    console.log('✓ Text highlighting prepared');
                } catch (highlightError) {
                    console.warn('Text highlighting preparation failed:', highlightError);
                }
            } else {
                console.warn('TextHighlighter not available');
            }
            
            // Schedule enhanced audio playback
            scheduleEnhancedSequence(linguisticResult);
            
            console.log(`✓ Enhanced playback started: ${analysisMode} analysis, ${highlightMode} highlighting`);
            return true;
            
        } catch (error) {
            console.error('Enhanced playback failed:', error);
            return false;
        }
    }
    
    /**
     * Creates fallback linguistic result when LinguisticIntegration is not available
     * @param {string} text - Input text
     * @param {string} scaleName - Musical scale name
     * @returns {Object} Fallback linguistic result
     */
    function createFallbackLinguisticResult(text, scaleName) {
        const scale = AppConfig.SCALES[scaleName] || AppConfig.SCALES[AppConfig.DEFAULT_SCALE];
        
        console.log(`Creating fallback result for "${text}" using scale: ${scaleName}`);
        
        const finalSequence = text.split('').map((char, index) => {
            const lowerChar = char.toLowerCase();
            let note = null;
            let duration = AppConfig.NOTE_DURATION;
            
            if (char === ' ') {
                note = null;
                duration = AppConfig.SILENCE_DURATION;
            } else if (scale && scale.hasOwnProperty(lowerChar)) {
                note = scale[lowerChar];
            } else {
                note = null;
                duration = AppConfig.SILENCE_DURATION;
            }
            
            return {
                character: char,
                note: note,
                duration: duration,
                velocity: 0.5,
                index: index,
                type: 'character'
            };
        });
        
        return {
            finalSequence: finalSequence,
            processedText: text,
            analysisMode: 'FALLBACK',
            bassLine: []
        };
    }
    
    /**
     * Schedules enhanced sequence with linguistic analysis and synchronized highlighting
     * @param {Object} linguisticResult - Result from LinguisticIntegration.processText
     */
    function scheduleEnhancedSequence(linguisticResult) {
        if (!linguisticResult.finalSequence) {
            console.error('No final sequence available for enhanced playback');
            return;
        }
        
        console.log(`Scheduling enhanced sequence: ${linguisticResult.finalSequence.length} elements`);
        
        Tone.Transport.cancel();
        let currentTime = 0;
        let highlightingStarted = false;
        
        linguisticResult.finalSequence.forEach((noteData, index) => {
            const duration = noteData.duration || AppConfig.NOTE_DURATION;
            const velocity = noteData.velocity || 0.5;
            
            Tone.Transport.scheduleOnce((time) => {
                try {
                    if (noteData.note && instrument) {
                        instrument.triggerAttackRelease(noteData.note, duration, time, velocity);
                    }
                } catch (error) {
                    console.warn(`Error playing note ${noteData.note}:`, error);
                }
            }, currentTime);
            
            currentTime += Tone.Time(duration).toSeconds();
        });
        
        // Start highlighting synchronized with audio
        if (typeof TextHighlighter !== 'undefined') {
            try {
                setTimeout(() => {
                    TextHighlighter.startHighlighting(linguisticResult);
                    highlightingStarted = true;
                    console.log('✓ Text highlighting started');
                }, 50);
            } catch (highlightError) {
                console.warn('Failed to start text highlighting:', highlightError);
            }
        }
        
        // Schedule cleanup when sequence completes
        Tone.Transport.scheduleOnce(() => {
            console.log('Enhanced sequence completed');
            if (highlightingStarted && typeof TextHighlighter !== 'undefined') {
                try {
                    TextHighlighter.stopHighlighting();
                } catch (error) {
                    console.warn('Error stopping highlighting:', error);
                }
            }
        }, currentTime + 0.5);
        
        Tone.Transport.start("+0.1");
        console.log(`✓ Enhanced sequence scheduled and started: ${linguisticResult.finalSequence.length} notes over ${currentTime.toFixed(2)}s`);
        
        // Schedule chord accompaniment if enabled
        if (typeof ChordPlaybackEngine !== 'undefined' && ChordPlaybackEngine.isEnabled) {
            try {
                // Use harmonic analysis if available
                let harmonicAnalysis = null;
                if (typeof HarmonicEngine !== 'undefined') {
                    harmonicAnalysis = HarmonicEngine.debugHarmonicAnalysis(
                        linguisticResult.processedText || '', 
                        'C' // Current key - should be configurable
                    );
                }
                
                if (harmonicAnalysis) {
                    ChordPlaybackEngine.scheduleChordAccompaniment(
                        harmonicAnalysis, 
                        currentTime, 
                        ChordPlaybackEngine.currentPattern
                    );
                    console.log('✓ Chord accompaniment scheduled with melody');
                } else {
                    console.log('No harmonic analysis available for chord accompaniment');
                }
            } catch (chordError) {
                console.warn('Failed to schedule chord accompaniment:', chordError);
            }
        }
    }

    function togglePlayback(text, scaleName, rhythmPattern = null) {
        if (!isAudioContextStarted) {
            return initializeAudio().then(() => {
                return scheduleText(text, scaleName, AppConfig.NOTE_DURATION, AppConfig.SILENCE_DURATION, rhythmPattern);
            });
        }

        if (Tone.Transport.state !== "started") {
            return scheduleText(text, scaleName, AppConfig.NOTE_DURATION, AppConfig.SILENCE_DURATION, rhythmPattern);
        } else {
            stopAllSounds();
            return false;
        }
    }

    // Funções para atualizar efeitos (serão implementadas na Fase 3)
    function updateEQ(low, mid, high) {
        if (eq) {
            eq.low.value = low;
            eq.mid.value = mid;
            eq.high.value = high;
        }
    }

    function updateModulation(vibratoRate, vibratoDepth, tremoloRate, tremoloDepth) {
        if (vibrato) {
            vibrato.frequency.value = vibratoRate;
            vibrato.depth.value = vibratoDepth;
        }
        if (tremolo) {
            tremolo.frequency.value = tremoloRate;
            tremolo.depth.value = tremoloDepth;
            // Re-start tremolo se a profundidade for > 0, ou para se for 0
            if (tremoloDepth > 0 && tremolo.state === 'stopped') {
                tremolo.start();
            } else if (tremoloDepth === 0 && tremolo.state === 'started') {
                tremolo.stop();
            }
        }
    }

    function updateTempo(bpm) {
        if (isAudioContextStarted) {
            Tone.Transport.bpm.value = bpm;
            console.log(`Tempo alterado para: ${bpm} BPM`);
        }
    }

    // Export enhanced public interface
    return {
        initializeAudio,
        loadInstrument,
        playNote,
        scheduleText: scheduleText, // Keep original scheduleText
        scheduleEnhancedSequence,
        startEnhancedPlayback,
        createFallbackLinguisticResult,
        togglePlayback,
        togglePlaybackWithHighlighting,
        stopAllSounds,
        updateEQ,
        updateModulation,
        updateTempo,
        // Enhanced debugging and monitoring
        getAudioState: () => ({
            isAudioContextStarted,
            transportState: Tone.Transport.state,
            currentTime: Tone.Transport.seconds,
            bpm: Tone.Transport.bpm.value,
            hasInstrument: !!instrument,
            instrumentType: instrument ? instrument.constructor.name : null
        }),
        // Chord integration functions
        togglePlaybackWithChords,
        startPlaybackWithChords,
        scheduleChordAccompanimentWithMelody,
        getKeyFromScale,
        // Getter para verificar se o áudio foi iniciado (útil para UI)
        get isAudioActive() { return isAudioContextStarted; }
    };
})(); 