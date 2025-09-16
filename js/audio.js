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
    }

    function togglePlayback(text, scaleName, rhythmPattern = null) {
        if (!isAudioContextStarted) {
             // Tenta iniciar o áudio se ainda não foi (ex: primeiro play)
            initializeAudio().then(() => {
                 if (Tone.Transport.state !== "started") {
                    scheduleText(text, scaleName, AppConfig.NOTE_DURATION, AppConfig.SILENCE_DURATION, rhythmPattern);
                } else {
                    stopAllSounds();
                }
            });
            return Tone.Transport.state !== "started"; // Retorna o estado futuro esperado
        }

        if (Tone.Transport.state !== "started") {
            scheduleText(text, scaleName, AppConfig.NOTE_DURATION, AppConfig.SILENCE_DURATION, rhythmPattern);
            return true; // Estava parado, agora tocando
        } else {
            stopAllSounds();
            return false; // Estava tocando, agora parado
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

    // Expor funções públicas
    return {
        initializeAudio,
        loadInstrument,
        playNote,
        togglePlayback,
        stopAllSounds,
        updateEQ,
        updateModulation,
        updateTempo,
        // Getter para verificar se o áudio foi iniciado (útil para UI)
        get isAudioActive() { return isAudioContextStarted; }
    };
})(); 