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
        if (Tone.Transport.state === "started") {
            Tone.Transport.stop();
        }
        if (instrument && typeof instrument.releaseAll === 'function') {
            instrument.releaseAll(); // Para synths/samplers que podem ter notas presas
        }
        Tone.Transport.cancel(); // Limpa eventos agendados
        
        // Stop text highlighting if available
        if (typeof TextHighlighter !== 'undefined') {
            TextHighlighter.stopHighlighting();
        }
    }

    /**
     * Enhanced playback with linguistic analysis and visual highlighting
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
     * Starts enhanced playback with linguistic analysis and highlighting
     * @param {string} text - Input text
     * @param {string} scaleName - Musical scale
     * @param {string} analysisMode - Analysis mode
     * @param {string} highlightMode - Highlighting mode
     * @returns {boolean} Success status
     */
    function startEnhancedPlayback(text, scaleName, analysisMode, highlightMode) {
        try {
            console.log(`Starting enhanced playback: ${analysisMode} + ${highlightMode}`);
            
            let linguisticResult;
            
            // Use linguistic integration if available
            if (typeof LinguisticIntegration !== 'undefined') {
                try {
                    // Set analysis mode
                    LinguisticIntegration.setAnalysisMode(analysisMode);
                    
                    // Process text with linguistic analysis
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
            
            console.log(`Enhanced playback started: ${analysisMode} analysis, ${highlightMode} highlighting`);
            return true;
            
        } catch (error) {
            console.error('Error starting enhanced playback:', error);
            // Fallback to basic playback
            try {
                scheduleText(text, scaleName, AppConfig.NOTE_DURATION, AppConfig.SILENCE_DURATION);
                console.log('Fallback to basic playback successful');
                return true;
            } catch (fallbackError) {
                console.error('Fallback playback also failed:', fallbackError);
                return false;
            }
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
                // Space becomes silence
                note = null;
                duration = AppConfig.SILENCE_DURATION;
            } else if (scale && scale.hasOwnProperty(lowerChar)) {
                // Character maps to a note
                note = scale[lowerChar];
            } else {
                // Unmapped character becomes silence
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
        
        console.log(`Fallback sequence created: ${finalSequence.length} elements, ${finalSequence.filter(s => s.note).length} notes, ${finalSequence.filter(s => !s.note).length} silences`);
        
        return {
            finalSequence: finalSequence,
            processedText: text,
            analysisMode: 'FALLBACK',
            bassLine: [] // Empty bass line for fallback
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
        
        Tone.Transport.cancel(); // Clear existing events
        let currentTime = 0;
        let highlightingStarted = false;
        
        linguisticResult.finalSequence.forEach((noteData, index) => {
            const duration = noteData.duration || AppConfig.NOTE_DURATION;
            const velocity = noteData.velocity || 0.5;
            
            // Schedule note playback (even for silence to maintain timing)
            Tone.Transport.scheduleOnce((time) => {
                try {
                    if (noteData.note && instrument) {
                        // Play actual note
                        instrument.triggerAttackRelease(noteData.note, duration, time, velocity);
                        console.log(`Playing note: ${noteData.note} at time ${currentTime.toFixed(2)}s`);
                    } else {
                        // Handle silence/space - just log for timing
                        console.log(`Silence/space at time ${currentTime.toFixed(2)}s (duration: ${duration})`);
                    }
                } catch (error) {
                    console.warn(`Error playing note ${noteData.note}:`, error);
                }
            }, currentTime);
            
            // Update timing for next note (regardless of whether it's a note or silence)
            currentTime += Tone.Time(duration).toSeconds();
        });
        
        // Start highlighting synchronized with audio (with small delay for better sync)
        if (typeof TextHighlighter !== 'undefined') {
            try {
                // Schedule highlighting to start slightly before audio for better visual sync
                setTimeout(() => {
                    TextHighlighter.startHighlighting(linguisticResult);
                    highlightingStarted = true;
                    console.log('✓ Text highlighting started');
                }, 50); // 50ms delay for better synchronization
            } catch (highlightError) {
                console.warn('Failed to start text highlighting:', highlightError);
            }
        }
        
        // Schedule bass line if available
        if (linguisticResult.bassLine && linguisticResult.bassLine.length > 0) {
            try {
                scheduleBassLine(linguisticResult.bassLine, currentTime);
                console.log('✓ Bass line scheduled');
            } catch (bassError) {
                console.warn('Failed to schedule bass line:', bassError);
            }
        }
        
        // Schedule cleanup when sequence completes
        Tone.Transport.scheduleOnce(() => {
            console.log('Enhanced sequence completed');
            // Stop highlighting if it was started
            if (highlightingStarted && typeof TextHighlighter !== 'undefined') {
                try {
                    TextHighlighter.stopHighlighting();
                } catch (error) {
                    console.warn('Error stopping highlighting:', error);
                }
            }
        }, currentTime + 0.5); // Small buffer after sequence ends
        
        // Start transport
        Tone.Transport.start("+0.1");
        console.log(`✓ Enhanced sequence scheduled and started: ${linguisticResult.finalSequence.length} notes over ${currentTime.toFixed(2)}s`);
    }
    
    /**
     * Schedules bass line for harmonic accompaniment
     * @param {Array} bassLine - Bass line notes
     * @param {number} totalDuration - Total duration of main sequence
     */
    function scheduleBassLine(bassLine, totalDuration) {
        if (!bassLine.length) return;
        
        const chordDuration = totalDuration / bassLine.length;
        let currentTime = 0;
        
        bassLine.forEach(bassNote => {
            Tone.Transport.scheduleOnce((time) => {
                if (instrument) {
                    instrument.triggerAttackRelease(
                        bassNote.note, 
                        bassNote.duration, 
                        time, 
                        bassNote.velocity * 0.6 // Quieter bass
                    );
                }
            }, currentTime);
            
            currentTime += chordDuration;
        });
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

    // Expor funções públicas
    return {
        initializeAudio,
        loadInstrument,
        playNote,
        togglePlayback,
        togglePlaybackWithHighlighting,
        stopAllSounds,
        updateEQ,
        updateModulation,
        updateTempo,
        // Getter para verificar se o áudio foi iniciado (útil para UI)
        get isAudioActive() { return isAudioContextStarted; }
    };
})(); 