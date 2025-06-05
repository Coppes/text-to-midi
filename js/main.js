document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const playPauseButton = document.getElementById('playPauseButton');
    const shareButton = document.getElementById('shareButton');
    const shareUrlInput = document.getElementById('shareUrlInput');

    let currentScale = AppConfig.DEFAULT_SCALE;
    let currentInstrument = AppConfig.DEFAULT_INSTRUMENT;
    let audioInitializedByInteraction = false;
    let currentEQ = { ...AppConfig.EFFECTS.defaultEQ };
    let currentMod = { ...AppConfig.EFFECTS.defaultModulation };

    // Inicializa o áudio na primeira interação do usuário com a página
    // Isso é crucial para políticas de autoplay dos navegadores
    function userInteractionListener() {
        if (!AudioManager.isAudioActive && !audioInitializedByInteraction) {
            AudioManager.initializeAudio().then(() => {
                audioInitializedByInteraction = true;
                console.log("Áudio inicializado após interação do usuário.");
            }).catch(error => {
                console.error("Erro ao inicializar áudio após interação:", error);
            });
        }
        // Remove o listener após a primeira interação para não executar múltiplas vezes
        document.body.removeEventListener('click', userInteractionListener);
        document.body.removeEventListener('keydown', userInteractionListener);
    }

    document.body.addEventListener('click', userInteractionListener);
    document.body.addEventListener('keydown', userInteractionListener, { once: true }); // Para o caso de começar a digitar antes de clicar


    textInput.addEventListener('input', (event) => {
        if (!AudioManager.isAudioActive && !audioInitializedByInteraction) {
            // Tenta inicializar o áudio se o usuário começou a digitar direto
            // Idealmente, o clique/keydown anterior já teria feito isso.
            AudioManager.initializeAudio().then(() => {
                audioInitializedByInteraction = true;
                playLastTypedCharacter(event);
            });
        } else if (AudioManager.isAudioActive) {
            playLastTypedCharacter(event);
        }
        updateShareUrlInput(); // Atualiza a URL dinamicamente enquanto digita
    });

    function playLastTypedCharacter(event) {
        const text = event.target.value;
        if (text.length === 0) return;

        // Pega o último caractere digitado
        // event.data é mais robusto para isso do que text[text.length-1] em alguns casos (ex: colar texto)
        const lastChar = event.data ? event.data[event.data.length -1] : text[text.length - 1];
        
        if (lastChar) {
            const charToPlay = lastChar.toLowerCase();
            const scaleMap = AppConfig.SCALES[currentScale];
            
            if (scaleMap && scaleMap.hasOwnProperty(charToPlay)) {
                const note = scaleMap[charToPlay];
                if (note) { // Se for uma nota (não null para silêncio)
                    AudioManager.playNote(note, AppConfig.NOTE_DURATION);
                } else {
                    // É um silêncio (charToPlay é ' '), não faz nada sonoramente,
                    // mas o playNote já não toca se a nota for null.
                }
            } else {
                // Caractere não mapeado, não toca nada.
            }
        }
    }

    playPauseButton.addEventListener('click', () => {
        if (!AudioManager.isAudioActive && !audioInitializedByInteraction) {
            // Tenta inicializar o áudio primeiro, depois tenta o playback
            AudioManager.initializeAudio().then(() => {
                audioInitializedByInteraction = true;
                console.log("Áudio inicializado pelo botão Play/Pause.");
                const isPlaying = AudioManager.togglePlayback(textInput.value, currentScale);
                playPauseButton.textContent = isPlaying ? 'Pause' : 'Play';
            }).catch(error => {
                console.error("Erro ao inicializar áudio no Play/Pause:", error);
            });
        } else {
            const isPlaying = AudioManager.togglePlayback(textInput.value, currentScale);
            playPauseButton.textContent = isPlaying ? 'Pause' : 'Play';
        }
    });

    function generateShareURL() {
        const params = new URLSearchParams();
        params.append('text', textInput.value);
        params.append('scale', currentScale);
        params.append('instrument', currentInstrument);
        params.append('eqLow', currentEQ.low);
        params.append('eqMid', currentEQ.mid);
        params.append('eqHigh', currentEQ.high);
        params.append('vibRate', currentMod.vibratoRate);
        params.append('vibDepth', currentMod.vibratoDepth);
        params.append('tremRate', currentMod.tremoloRate);
        params.append('tremDepth', currentMod.tremoloDepth);
        return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    }

    function updateShareUrlInput() {
        shareUrlInput.value = generateShareURL();
    }

    shareButton.addEventListener('click', () => {
        const url = generateShareURL();
        shareUrlInput.value = url;
        navigator.clipboard.writeText(url).then(() => {
            const originalText = shareButton.textContent;
            shareButton.textContent = 'Copiado!';
            shareButton.classList.add('copied');
            setTimeout(() => {
                shareButton.textContent = originalText;
                shareButton.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Erro ao copiar URL: ', err);
            // Poderia exibir uma mensagem de erro para o usuário aqui
        });
    });

    function loadStateFromURL() {
        const params = new URLSearchParams(window.location.search);
        let stateLoaded = false;

        if (params.has('text')) {
            textInput.value = params.get('text');
            stateLoaded = true;
        }
        if (params.has('scale') && AppConfig.SCALES[params.get('scale')]) {
            currentScale = params.get('scale');
            stateLoaded = true;
        }
        if (params.has('instrument') && AppConfig.INSTRUMENTS[params.get('instrument')]) {
            currentInstrument = params.get('instrument');
            // A inicialização do instrumento ocorrerá no initializeAudio ou no updateSettings
            stateLoaded = true;
        }
        if (params.has('eqLow')) currentEQ.low = parseFloat(params.get('eqLow'));
        if (params.has('eqMid')) currentEQ.mid = parseFloat(params.get('eqMid'));
        if (params.has('eqHigh')) currentEQ.high = parseFloat(params.get('eqHigh'));
        
        if (params.has('vibRate')) currentMod.vibratoRate = parseFloat(params.get('vibRate'));
        if (params.has('vibDepth')) currentMod.vibratoDepth = parseFloat(params.get('vibDepth'));
        if (params.has('tremRate')) currentMod.tremoloRate = parseFloat(params.get('tremRate'));
        if (params.has('tremDepth')) currentMod.tremoloDepth = parseFloat(params.get('tremDepth'));

        if (stateLoaded || params.has('eqLow') /* check one of effects param as proxy */) {
             console.log("Estado carregado da URL:", { 
                text: textInput.value, 
                scale: currentScale, 
                instrument: currentInstrument, 
                eq: {...currentEQ}, 
                mod: {...currentMod} 
            });
        }
        // A UI será atualizada/inicializada depois, e os efeitos aplicados via updateSettings / initializeAudio
    }
    
    // Carregar estado da URL ANTES de inicializar a UI com os padrões
    loadStateFromURL(); 

    UIModule.initializeUIControls(AppConfig, updateSettings, {
        scale: currentScale,
        instrument: currentInstrument,
        eq: currentEQ,
        mod: currentMod
    });
    
    // Aplicar configurações carregadas (especialmente instrumento e efeitos)
    // Isso garante que mesmo sem interação do usuário, se a URL tiver params, eles sejam aplicados
    // após a UI ser construída e o áudio potencialmente inicializado.
    function applyLoadedSettings() {
        AudioManager.loadInstrument(currentInstrument); // Garante que o instrumento correto seja carregado
        AudioManager.updateEQ(currentEQ.low, currentEQ.mid, currentEQ.high);
        AudioManager.updateModulation(currentMod.vibratoRate, currentMod.vibratoDepth, currentMod.tremoloRate, currentMod.tremoloDepth);
        updateShareUrlInput(); // Atualiza o campo da URL com os valores carregados
    }
    
    // Se o áudio já foi inicializado (ex: por autoplay permitido ou interação prévia não capturada)
    // ou se houver uma interação que o inicialize, então aplicamos as configurações.
    if (AudioManager.isAudioActive) {
        applyLoadedSettings();
    } else {
        // Adiciona um listener para aplicar após a primeira inicialização de áudio bem-sucedida
        const initialAudioSetupListener = () => {
            if (AudioManager.isAudioActive) {
                applyLoadedSettings();
                document.body.removeEventListener('click', initialAudioSetupListener);
                document.body.removeEventListener('keydown', initialAudioSetupListener);
            }
        };
        document.body.addEventListener('click', initialAudioSetupListener, { once: true });
        document.body.addEventListener('keydown', initialAudioSetupListener, { once: true });
    }

    function updateSettings(newSettings) {
        let overallSettingsChanged = false;

        if (newSettings.scale && newSettings.scale !== currentScale) {
            currentScale = newSettings.scale;
            console.log("Escala alterada para:", currentScale);
            overallSettingsChanged = true;
            // Se estiver tocando com Tone.Transport, precisa parar e, se desejar, reiniciar com a nova escala.
            // Por enquanto, a mudança de escala só afetará novas notas tocadas individualmente ou o próximo play.
            if (Tone.Transport.state === 'started') {
                AudioManager.stopAllSounds();
                playPauseButton.textContent = 'Play'; 
            }
        }
        if (newSettings.instrument && newSettings.instrument !== currentInstrument) {
            currentInstrument = newSettings.instrument;
            AudioManager.loadInstrument(currentInstrument);
            console.log("Instrumento alterado para:", currentInstrument);
            overallSettingsChanged = true;
        }
        
        let eqChanged = false;
        if (newSettings.eq) {
            const incomingEQ = { ...currentEQ, ...newSettings.eq }; // Merge para pegar apenas o que mudou
            if (incomingEQ.low !== currentEQ.low) { currentEQ.low = incomingEQ.low; eqChanged = true; }
            if (incomingEQ.mid !== currentEQ.mid) { currentEQ.mid = incomingEQ.mid; eqChanged = true; }
            if (incomingEQ.high !== currentEQ.high) { currentEQ.high = incomingEQ.high; eqChanged = true; }
            if (eqChanged) {
                AudioManager.updateEQ(currentEQ.low, currentEQ.mid, currentEQ.high);
                overallSettingsChanged = true;
            }
        }

        let modChanged = false;
        if (newSettings.mod) {
            const incomingMod = { ...currentMod, ...newSettings.mod }; // Merge
            if (incomingMod.vibratoRate !== currentMod.vibratoRate) { currentMod.vibratoRate = incomingMod.vibratoRate; modChanged = true; }
            if (incomingMod.vibratoDepth !== currentMod.vibratoDepth) { currentMod.vibratoDepth = incomingMod.vibratoDepth; modChanged = true; }
            if (incomingMod.tremoloRate !== currentMod.tremoloRate) { currentMod.tremoloRate = incomingMod.tremoloRate; modChanged = true; }
            if (incomingMod.tremoloDepth !== currentMod.tremoloDepth) { currentMod.tremoloDepth = incomingMod.tremoloDepth; modChanged = true; }
            if (modChanged) {
                AudioManager.updateModulation(
                    currentMod.vibratoRate, currentMod.vibratoDepth,
                    currentMod.tremoloRate, currentMod.tremoloDepth
                );
                overallSettingsChanged = true;
            }
        }

        if (overallSettingsChanged) {
            console.log('Configurações atualizadas:', { 
                scale: currentScale, 
                instrument: currentInstrument, 
                eq: { ...currentEQ }, 
                mod: { ...currentMod } 
            });
            updateShareUrlInput();
        }
    }
}); 