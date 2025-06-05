const AudioManager = (() => {
    let instrument = null;
    let eq = null;
    let vibrato = null;
    let tremolo = null;
    let isAudioContextStarted = false;

    async function initializeAudio() {
        if (isAudioContextStarted) return;
        await Tone.start();
        console.log("Contexto de áudio iniciado pelo usuário.");
        isAudioContextStarted = true;

        // Configurar efeitos (serão conectados ao instrumento quando carregado)
        eq = new Tone.EQ3(AppConfig.EFFECTS.defaultEQ.low, AppConfig.EFFECTS.defaultEQ.mid, AppConfig.EFFECTS.defaultEQ.high).toDestination();
        vibrato = new Tone.Vibrato(AppConfig.EFFECTS.defaultModulation.vibratoRate, AppConfig.EFFECTS.defaultModulation.vibratoDepth);
        tremolo = new Tone.Tremolo(AppConfig.EFFECTS.defaultModulation.tremoloRate, AppConfig.EFFECTS.defaultModulation.tremoloDepth).start();

        // Carregar instrumento padrão
        await loadInstrument(AppConfig.DEFAULT_INSTRUMENT);
    }

    async function loadInstrument(instrumentName) {
        if (!isAudioContextStarted) {
            console.warn("Contexto de áudio não iniciado. Clique na tela para iniciar.");
            // Em um app real, você poderia mostrar um botão "Iniciar Áudio"
            // await Tone.start(); // Tentar iniciar de novo, mas idealmente é uma ação do usuário
            // isAudioContextStarted = true;
        }

        const instrumentConfig = AppConfig.INSTRUMENTS[instrumentName];
        if (!instrumentConfig) {
            console.error(`Instrumento '${instrumentName}' não encontrado na configuração.`);
            return;
        }

        // Desconectar e descartar instrumento e efeitos antigos, se existirem
        if (instrument) {
            instrument.dispose();
        }
        // Efeitos já estão criados, só precisamos (re)conectar

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
            try {
                await Tone.loaded();
                console.log(`Instrumento '${instrumentName}' (Sampler) carregado.`);
            } catch (error) {
                console.error(`Erro ao carregar samples para '${instrumentName}':`, error);
            }
        } else {
            console.log(`Instrumento '${instrumentName}' (Synth) carregado.`);
        }
    }

    function playNote(noteName, duration = AppConfig.NOTE_DURATION, time = Tone.now()) {
        if (!instrument || !isAudioContextStarted) {
            // console.warn("Instrumento não carregado ou áudio não iniciado. Nota não tocada.");
            return;
        }
        if (noteName) { // Só toca se houver uma nota (ignora null para silêncios)
            instrument.triggerAttackRelease(noteName, duration, time);
        }
    }

    function scheduleText(text, scaleName, noteDuration, silenceDuration) {
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

            if (note !== undefined) { // Se o caractere está mapeado (pode ser null para silêncio)
                if (note) { // Se é uma nota (não null)
                    Tone.Transport.scheduleOnce((time) => {
                        playNote(note, noteDuration, time);
                    }, currentTime);
                    currentTime += Tone.Time(noteDuration).toSeconds();
                } else { // É um silêncio (mapeado para null)
                    currentTime += Tone.Time(silenceDuration).toSeconds();
                }
            } else {
                // Caractere não mapeado na escala, podemos tratar como silêncio ou ignorar
                currentTime += Tone.Time(silenceDuration).toSeconds(); // Tratar como silêncio
            }
        }
        Tone.Transport.start("+0.1"); // Inicia o transporte com um pequeno delay
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

    function togglePlayback(text, scaleName) {
        if (!isAudioContextStarted) {
             // Tenta iniciar o áudio se ainda não foi (ex: primeiro play)
            initializeAudio().then(() => {
                 if (Tone.Transport.state !== "started") {
                    scheduleText(text, scaleName, AppConfig.NOTE_DURATION, AppConfig.SILENCE_DURATION);
                } else {
                    stopAllSounds();
                }
            });
            return Tone.Transport.state !== "started"; // Retorna o estado futuro esperado
        }

        if (Tone.Transport.state !== "started") {
            scheduleText(text, scaleName, AppConfig.NOTE_DURATION, AppConfig.SILENCE_DURATION);
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

    // Expor funções públicas
    return {
        initializeAudio,
        loadInstrument,
        playNote,
        togglePlayback,
        stopAllSounds,
        updateEQ,
        updateModulation,
        // Getter para verificar se o áudio foi iniciado (útil para UI)
        get isAudioActive() { return isAudioContextStarted; }
    };
})(); 