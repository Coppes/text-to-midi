document.addEventListener('DOMContentLoaded', () => {
    // Register service worker for PWA support
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('Service Worker registered successfully:', registration.scope);
            })
            .catch((error) => {
                console.log('Service Worker registration failed:', error);
            });
    }
    const textInput = document.getElementById('textInput');
    const playPauseButton = document.getElementById('playPauseButton');
    const shareButton = document.getElementById('shareButton');
    const qrButton = document.getElementById('qrButton');
    const shareUrlInput = document.getElementById('shareUrlInput');

    let currentScale = AppConfig.DEFAULT_SCALE;
    let currentInstrument = AppConfig.DEFAULT_INSTRUMENT;
    let audioInitializedByInteraction = false;
    let currentEQ = { ...AppConfig.EFFECTS.defaultEQ };
    let currentMod = { ...AppConfig.EFFECTS.defaultModulation };
    let currentTempo = AppConfig.DEFAULT_TEMPO;
    let currentRhythm = 'uniform';

    // Inicializa o áudio na primeira interação do usuário com a página
    // Isso é crucial para políticas de autoplay dos navegadores
    function userInteractionListener() {
        if (!AudioManager.isAudioActive && !audioInitializedByInteraction) {
            AudioManager.initializeAudio().then(() => {
                audioInitializedByInteraction = true;
                console.log("Áudio inicializado após interação do usuário.");
                // Show visual feedback that audio is ready
                document.body.classList.add('audio-ready');
            }).catch(error => {
                console.error("Erro ao inicializar áudio após interação:", error);
                // Show error feedback to user
                showAudioError("Erro ao inicializar áudio. Verifique se seu navegador suporta Web Audio.");
            });
        }
        // Remove o listener após a primeira interação para não executar múltiplas vezes
        document.body.removeEventListener('click', userInteractionListener);
        document.body.removeEventListener('keydown', userInteractionListener);
    }

    function showAudioError(message) {
        // Create or update error message element
        let errorElement = document.getElementById('audioError');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'audioError';
            errorElement.className = 'audio-error';
            document.querySelector('.container').prepend(errorElement);
        }
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Hide error after 5 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
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
            }).catch(error => {
                console.error("Erro ao inicializar áudio durante digitação:", error);
            });
        } else if (AudioManager.isAudioActive) {
            playLastTypedCharacter(event);
        }
        updateShareUrlInput(); // Atualiza a URL dinamicamente enquanto digita
    });

    function playLastTypedCharacter(event) {
        const text = event.target.value;
        if (text.length === 0) return;

        // Get the last character typed more reliably
        let lastChar;
        if (event.inputType === 'insertText' && event.data) {
            lastChar = event.data[event.data.length - 1];
        } else {
            lastChar = text[text.length - 1];
        }
        
        if (lastChar) {
            const charToPlay = lastChar.toLowerCase();
            const scaleMap = AppConfig.SCALES[currentScale];
            
            if (scaleMap && scaleMap.hasOwnProperty(charToPlay)) {
                const note = scaleMap[charToPlay];
                if (note) { // Se for uma nota (não null para silêncio)
                    // Use immediate timing for real-time feedback
                    AudioManager.playNote(note, AppConfig.NOTE_DURATION, "+0");
                }
                // Para silêncios (null), não faz nada
            }
            // Para caracteres não mapeados, não faz nada
        }
    }

    playPauseButton.addEventListener('click', () => {
        if (!AudioManager.isAudioActive && !audioInitializedByInteraction) {
            // Add loading state
            playPauseButton.classList.add('loading');
            playPauseButton.disabled = true;
            
            // Tenta inicializar o áudio primeiro, depois tenta o playback
            AudioManager.initializeAudio().then(() => {
                audioInitializedByInteraction = true;
                console.log("Áudio inicializado pelo botão Play/Pause.");
                
                // Remove loading state
                playPauseButton.classList.remove('loading');
                playPauseButton.disabled = false;
                
                const isPlaying = AudioManager.togglePlayback(textInput.value, currentScale, currentRhythm);
                playPauseButton.textContent = isPlaying ? 'Pause' : 'Play';
            }).catch(error => {
                console.error("Erro ao inicializar áudio no Play/Pause:", error);
                
                // Remove loading state and show error
                playPauseButton.classList.remove('loading');
                playPauseButton.disabled = false;
                showAudioError("Erro ao inicializar áudio. Tente novamente.");
            });
        } else {
            const isPlaying = AudioManager.togglePlayback(textInput.value, currentScale, currentRhythm);
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
        params.append('tempo', currentTempo);
        params.append('rhythm', currentRhythm);
        return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    }

    function updateShareUrlInput() {
        shareUrlInput.value = generateShareURL();
    }

    shareButton.addEventListener('click', () => {
        const url = generateShareURL();
        shareUrlInput.value = url;
        
        // Try modern clipboard API first, fallback to older method
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(url).then(() => {
                showCopySuccess();
            }).catch(err => {
                console.error('Erro ao copiar URL com clipboard API: ', err);
                fallbackCopyToClipboard(url);
            });
        } else {
            fallbackCopyToClipboard(url);
        }
    });
    
    qrButton.addEventListener('click', () => {
        const url = generateShareURL();
        showQRModal(url);
    });

    function fallbackCopyToClipboard(text) {
        // Fallback method for older browsers
        shareUrlInput.select();
        shareUrlInput.setSelectionRange(0, 99999); // For mobile devices
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showCopySuccess();
            } else {
                showCopyError();
            }
        } catch (err) {
            console.error('Erro ao copiar URL com execCommand: ', err);
            showCopyError();
        }
    }

    function showCopySuccess() {
        const originalText = shareButton.textContent;
        shareButton.textContent = 'Copiado!';
        shareButton.classList.add('copied');
        setTimeout(() => {
            shareButton.textContent = originalText;
            shareButton.classList.remove('copied');
        }, 2000);
    }

    function showCopyError() {
        const originalText = shareButton.textContent;
        shareButton.textContent = 'Erro!';
        shareButton.style.backgroundColor = '#dc3545';
        setTimeout(() => {
            shareButton.textContent = originalText;
            shareButton.style.backgroundColor = '';
        }, 2000);
    }

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
        
        if (params.has('tempo')) {
            const tempo = parseInt(params.get('tempo'));
            if (tempo >= AppConfig.MIN_TEMPO && tempo <= AppConfig.MAX_TEMPO) {
                currentTempo = tempo;
            }
        }
        
        if (params.has('rhythm') && AppConfig.RHYTHM_PATTERNS[params.get('rhythm')]) {
            currentRhythm = params.get('rhythm');
        }

        if (stateLoaded || params.has('eqLow') /* check one of effects param as proxy */) {
             console.log("Estado carregado da URL:", { 
                text: textInput.value, 
                scale: currentScale, 
                instrument: currentInstrument, 
                eq: {...currentEQ}, 
                mod: {...currentMod},
                tempo: currentTempo,
                rhythm: currentRhythm
            });
        }
        // A UI será atualizada/inicializada depois, e os efeitos aplicados via updateSettings / initializeAudio
    }
    
    // Carregar estado da URL ANTES de inicializar a UI com os padrões
    loadStateFromURL();
    
    // Load user preferences from storage
    loadUserPreferencesFromStorage(); 

    UIModule.initializeUIControls(AppConfig, updateSettings, {
        scale: currentScale,
        instrument: currentInstrument,
        eq: currentEQ,
        mod: currentMod,
        tempo: currentTempo,
        rhythm: currentRhythm
    });
    
    // Initialize recent creations list
    if (StorageManager.isLocalStorageAvailable()) {
        UIModule.updateRecentCreationsList();
    }
    
    // Aplicar configurações carregadas (especialmente instrumento e efeitos)
    // Isso garante que mesmo sem interação do usuário, se a URL tiver params, eles sejam aplicados
    // após a UI ser construída e o áudio potencialmente inicializado.
    function applyLoadedSettings() {
        AudioManager.loadInstrument(currentInstrument); // Garante que o instrumento correto seja carregado
        AudioManager.updateEQ(currentEQ.low, currentEQ.mid, currentEQ.high);
        AudioManager.updateModulation(currentMod.vibratoRate, currentMod.vibratoDepth, currentMod.tremoloRate, currentMod.tremoloDepth);
        AudioManager.updateTempo(currentTempo);
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

        if (newSettings.tempo && newSettings.tempo !== currentTempo) {
            currentTempo = newSettings.tempo;
            AudioManager.updateTempo(currentTempo);
            console.log("Tempo alterado para:", currentTempo, "BPM");
            overallSettingsChanged = true;
        }
        
        if (newSettings.rhythm && newSettings.rhythm !== currentRhythm) {
            currentRhythm = newSettings.rhythm;
            console.log("Padrão rítmico alterado para:", currentRhythm);
            overallSettingsChanged = true;
            // Se estiver tocando, parar para aplicar novo padrão
            if (Tone.Transport.state === 'started') {
                AudioManager.stopAllSounds();
                playPauseButton.textContent = 'Play';
            }
        }

        if (overallSettingsChanged) {
            console.log('Configurações atualizadas:', { 
                scale: currentScale, 
                instrument: currentInstrument, 
                eq: { ...currentEQ }, 
                mod: { ...currentMod },
                tempo: currentTempo,
                rhythm: currentRhythm
            });
            updateShareUrlInput();
            
            // Auto-save user preferences
            if (StorageManager.isLocalStorageAvailable()) {
                const preferences = {
                    scale: currentScale,
                    instrument: currentInstrument,
                    tempo: currentTempo
                };
                StorageManager.autoSavePreferences(preferences);
            }
        }
        
        // Handle storage actions
        if (newSettings.action) {
            switch (newSettings.action) {
                case 'saveCurrent':
                    saveCurrentCreation();
                    break;
                case 'loadRecent':
                    loadRecentCreation(newSettings.id);
                    break;
                case 'clearRecent':
                    clearRecentCreations();
                    break;
            }
        }
    }
    
    function loadUserPreferencesFromStorage() {
        if (!StorageManager.isLocalStorageAvailable()) {
            console.log('localStorage não está disponível');
            return;
        }
        
        const preferences = StorageManager.loadUserPreferences();
        if (preferences) {
            // Apply loaded preferences if URL didn't override them
            if (!new URLSearchParams(window.location.search).has('scale')) {
                currentScale = preferences.scale || currentScale;
            }
            if (!new URLSearchParams(window.location.search).has('instrument')) {
                currentInstrument = preferences.instrument || currentInstrument;
            }
            if (!new URLSearchParams(window.location.search).has('tempo')) {
                currentTempo = preferences.tempo || currentTempo;
            }
            
            console.log('Preferências do usuário aplicadas:', preferences);
        }
    }
    
    function saveCurrentCreation() {
        if (!StorageManager.isLocalStorageAvailable()) {
            console.log('localStorage não está disponível para salvar criação');
            return;
        }
        
        const currentState = StorageManager.getCurrentAppState(
            textInput.value,
            currentScale,
            currentInstrument,
            currentEQ,
            currentMod,
            currentTempo
        );
        
        if (currentState.text.trim()) {
            const success = StorageManager.saveRecentCreation(currentState);
            if (success) {
                UIModule.updateRecentCreationsList();
                showStorageMessage('Criação salva!');
            } else {
                showStorageMessage('Erro ao salvar criação!', 'error');
            }
        } else {
            showStorageMessage('Digite algum texto antes de salvar!', 'warning');
        }
    }
    
    function loadRecentCreation(creationId) {
        if (!StorageManager.isLocalStorageAvailable()) return;
        
        const recentCreations = StorageManager.loadRecentCreations();
        const creation = recentCreations.find(c => c.id === creationId);
        
        if (creation) {
            // Load the creation state
            textInput.value = creation.text;
            currentScale = creation.scale;
            currentInstrument = creation.instrument;
            currentEQ = { ...creation.eq };
            currentMod = { ...creation.mod };
            currentTempo = creation.tempo || AppConfig.DEFAULT_TEMPO;
            
            // Update UI controls
            UIModule.updateControlValues({
                eq: currentEQ,
                mod: currentMod
            });
            
            // Update audio settings
            if (AudioManager.isAudioActive) {
                AudioManager.loadInstrument(currentInstrument);
                AudioManager.updateEQ(currentEQ.low, currentEQ.mid, currentEQ.high);
                AudioManager.updateModulation(
                    currentMod.vibratoRate, currentMod.vibratoDepth,
                    currentMod.tremoloRate, currentMod.tremoloDepth
                );
                AudioManager.updateTempo(currentTempo);
            }
            
            updateShareUrlInput();
            showStorageMessage('Criação carregada!');
        }
    }
    
    function clearRecentCreations() {
        if (!StorageManager.isLocalStorageAvailable()) return;
        
        const success = StorageManager.clearRecentCreations();
        if (success) {
            UIModule.updateRecentCreationsList();
            showStorageMessage('Criações recentes removidas!');
        } else {
            showStorageMessage('Erro ao limpar criações!', 'error');
        }
    }
    
    function showStorageMessage(message, type = 'success') {
        // Create or update storage message element
        let messageElement = document.getElementById('storageMessage');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'storageMessage';
            messageElement.className = 'storage-message';
            document.querySelector('.container').prepend(messageElement);
        }
        
        messageElement.textContent = message;
        messageElement.className = `storage-message ${type}`;
        messageElement.style.display = 'block';
        
        // Hide message after 3 seconds
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 3000);
    }
    
    function showQRModal(url) {
        // Check if QRious library is available
        if (typeof QRious === 'undefined') {
            showStorageMessage('QR Code library não carregada!', 'error');
            return;
        }
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'qr-modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'qr-modal-content';
        
        const title = document.createElement('h3');
        title.textContent = 'Escaneie o QR Code para abrir no celular';
        
        const canvas = document.createElement('canvas');
        
        // Generate QR code
        try {
            const qr = new QRious({
                element: canvas,
                value: url,
                size: 256,
                background: 'white',
                foreground: 'black',
                level: 'M'
            });
        } catch (error) {
            console.error('Erro ao gerar QR Code:', error);
            showStorageMessage('Erro ao gerar QR Code!', 'error');
            return;
        }
        
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Fechar';
        closeButton.className = 'qr-modal-close';
        
        const instructions = document.createElement('p');
        instructions.textContent = 'Use a câmera do seu celular para escanear este código';
        instructions.style.fontSize = '14px';
        instructions.style.color = '#666';
        instructions.style.marginTop = '10px';
        
        modalContent.appendChild(title);
        modalContent.appendChild(canvas);
        modalContent.appendChild(instructions);
        modalContent.appendChild(closeButton);
        modal.appendChild(modalContent);
        
        document.body.appendChild(modal);
        
        // Close modal handlers
        const closeModal = () => {
            document.body.removeChild(modal);
        };
        
        closeButton.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // ESC key to close
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }
}); 