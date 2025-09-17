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
    const textDisplay = document.getElementById('textDisplay');
    
    // Text highlighting temporarily disabled for better implementation later
    console.log('Text highlighting disabled - will implement better version later');
    if (textDisplay) {
        showBasicTextDisplay();
    }

    let currentScale = AppConfig.DEFAULT_SCALE;
    let currentInstrument = AppConfig.DEFAULT_INSTRUMENT;
    let audioInitializedByInteraction = false;
    let currentEQ = { ...AppConfig.EFFECTS.defaultEQ };
    let currentMod = { ...AppConfig.EFFECTS.defaultModulation };
    let currentTempo = AppConfig.DEFAULT_TEMPO;
    let currentRhythm = 'uniform';
    let currentAnalysisMode = 'COMPLETE';
    let currentHighlightMode = 'character';
    let currentDialect = 'carioca';
    let isEnhancedMode = false;
    
    // Chord accompaniment settings
    let currentChordSettings = {
        enabled: false,
        pattern: 'block',
        volume: 0.6,
        bassVolume: 0.4,
        progression: 'I-V-vi-IV'
    };

    // Initialize audio and chord system on first user interaction
    function userInteractionListener() {
        if (!AudioManager.isAudioActive && !audioInitializedByInteraction) {
            AudioManager.initializeAudio().then(() => {
                audioInitializedByInteraction = true;
                console.log("Audio initialized after user interaction.");
                
                // Text highlighting disabled - using basic display
                showBasicTextDisplay();
                
                // Initialize chord system if available
                if (typeof ChordPlaybackEngine !== 'undefined') {
                    console.log('🎼 Initializing chord playback system...');
                    ChordPlaybackEngine.initializeChordInstruments().then(() => {
                        console.log('✓ Chord playback system initialized');
                    }).catch(error => {
                        console.warn('Chord system initialization failed:', error);
                    });
                } else {
                    console.warn('❌ ChordPlaybackEngine not available');
                }
                
                // Show visual feedback that audio is ready
                document.body.classList.add('audio-ready');
            }).catch(error => {
                console.error("Error initializing audio after interaction:", error);
                showAudioError("Error initializing audio. Check if your browser supports Web Audio.");
            });
        }
        // Remove listeners after first interaction
        document.body.removeEventListener('click', userInteractionListener);
        document.body.removeEventListener('keydown', userInteractionListener);
    }

    function showAudioError(message) {
        showAudioMessage(message, 'error');
    }
    
    function showAudioMessage(message, type = 'info') {
        // Create or update message element
        let messageElement = document.getElementById('audioMessage');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'audioMessage';
            messageElement.className = 'audio-message';
            document.querySelector('.container').prepend(messageElement);
        }
        
        // Update message content and type
        messageElement.textContent = message;
        messageElement.className = `audio-message ${type}`;
        messageElement.style.display = 'block';
        
        // Auto-hide based on type
        const hideDelay = type === 'error' ? 8000 : type === 'success' ? 4000 : 3000;
        setTimeout(() => {
            if (messageElement) {
                messageElement.style.display = 'none';
            }
        }, hideDelay);
    }

    /**
     * Shows basic text display without highlighting features
     */
    function showBasicTextDisplay() {
        if (!textDisplay) return;
        
        const text = textInput.value.trim();
        if (text) {
            textDisplay.innerHTML = `
                <div style="padding: 15px; border: 1px solid #ddd; background: #f8f9fa; border-radius: 4px; font-family: monospace; line-height: 1.6; white-space: pre-wrap;">
                    ${text}
                </div>
            `;
        } else {
            showEmptyStateMessage();
        }
    }

    /**
     * Shows empty state message
     */
    function showEmptyStateMessage() {
        if (!textDisplay) return;
        
        textDisplay.innerHTML = `
            <div style="color: #999; font-style: italic; text-align: center; padding: 20px;">
                O texto será mostrado aqui.
                <br><small>Digite algum texto acima para visualizar.</small>
            </div>
        `;
    }
    
    /**
     * Shows fallback text display when TextHighlighter is not available
     */
    function showFallbackTextDisplay() {
        if (!textDisplay) return;
        
        const text = textInput.value.trim();
        if (text) {
            textDisplay.innerHTML = `
                <div style="padding: 15px; border: 1px solid #ffc107; background: #fff3cd; border-radius: 4px; text-align: center;">
                    <div style="margin-bottom: 10px; line-height: 1.6;">${text}</div>
                    <small style="color: #856404; font-style: italic;">💡 Modo básico - Sistema de destaque não disponível</small>
                </div>
            `;
        } else {
            showEmptyStateMessage();
        }
    }
    
    /**
     * Shows empty state message in text display
     */
    function showEmptyStateMessage() {
        if (!textDisplay) return;
        
        textDisplay.innerHTML = `
            <div style="color: #999; font-style: italic; text-align: center; padding: 20px; line-height: 1.6;">
                <span style="font-size: 1.2em;">🎵</span><br>
                O texto será destacado aqui durante a reprodução.<br>
                <small style="margin-top: 8px; display: block;">Digite algum texto acima para ver o destaque visual.</small>
            </div>
        `;
    }
    
    /**
     * Prepares the current text for highlighting display with enhanced error handling
     */
    function prepareTextForHighlighting() {
        const text = textInput.value.trim();
        
        // Handle empty text
        if (!text) {
            showEmptyStateMessage();
            return;
        }
        
        // Check if TextHighlighter is available
        if (typeof TextHighlighter === 'undefined') {
            showFallbackTextDisplay();
            return;
        }
        
        try {
            console.log(`Preparing text for highlighting: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
            
            // Set current highlight mode
            TextHighlighter.setHighlightMode(currentHighlightMode);
            
            let linguisticResult;
            
            // Try to use linguistic integration if available
            if (typeof LinguisticIntegration !== 'undefined' && isEnhancedMode) {
                try {
                    LinguisticIntegration.setAnalysisMode(currentAnalysisMode);
                    LinguisticIntegration.setDialect(currentDialect);
                    linguisticResult = LinguisticIntegration.processText(text, currentScale);
                    
                    console.log(`✓ Linguistic analysis completed: ${currentAnalysisMode} mode`);
                } catch (linguisticError) {
                    console.warn('Linguistic integration failed, using basic mode:', linguisticError);
                    linguisticResult = createBasicLinguisticResult(text);
                }
            } else {
                // Create basic result for simple character highlighting
                linguisticResult = createBasicLinguisticResult(text);
                console.log('✓ Using basic character highlighting mode');
            }
            
            // Prepare text for highlighting
            TextHighlighter.prepareText(text, linguisticResult);
            
            // Add visual indicator for current mode
            addHighlightModeIndicator();
            
            console.log(`✓ Text prepared: ${currentHighlightMode} mode, ${linguisticResult.finalSequence?.length || 0} elements`);
            
        } catch (error) {
            console.error('Error preparing text for highlighting:', error);
            
            // Fallback: show text with basic character segmentation
            if (textDisplay) {
                const segments = text.split('').map((char, index) => 
                    `<span class="char-segment" data-index="${index}">${char === ' ' ? '&nbsp;' : char}</span>`
                ).join('');
                
                textDisplay.innerHTML = `
                    <div style="padding: 15px; line-height: 1.8; border: 1px solid #dc3545; background: #f8d7da; border-radius: 4px;">
                        <div style="margin-bottom: 10px;">${segments}</div>
                        <small style="color: #721c24; font-style: italic;">
                            ⚠️ Modo de emergência - Destaque limitado por caracteres
                        </small>
                    </div>
                `;
            }
        }
    }
    
    /**
     * Creates basic linguistic result for fallback mode
     * @param {string} text - Input text
     * @returns {Object} Basic linguistic result object
     */
    function createBasicLinguisticResult(text) {
        return {
            finalSequence: text.split('').map((char, index) => ({
                character: char,
                note: char === ' ' ? null : 'C4', // null for spaces to create silence
                duration: char === ' ' ? '8n' : '8n',
                index: index,
                type: 'character'
            })),
            processedText: text,
            analysisMode: 'BASIC'
        };
    }
    
    /**
     * Adds visual indicator showing current highlight mode
     */
    function addHighlightModeIndicator() {
        if (!textDisplay) return;
        
        // Remove existing indicator
        const existingIndicator = textDisplay.querySelector('.highlight-mode-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        // Create new indicator
        const indicator = document.createElement('div');
        indicator.className = 'highlight-mode-indicator';
        indicator.style.cssText = `
            position: absolute;
            top: -8px;
            right: 15px;
            background: ${isEnhancedMode ? '#28a745' : '#6c757d'};
            color: white;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 11px;
            font-weight: bold;
            z-index: 10;
        `;
        
        const modeLabel = {
            'character': 'CHAR',
            'syllable': 'SÍLABA', 
            'word': 'PALAVRA',
            'phoneme': 'FONEMA'
        }[currentHighlightMode] || 'BASIC';
        
        indicator.textContent = modeLabel;
        
        // Insert indicator
        textDisplay.style.position = 'relative';
        textDisplay.appendChild(indicator);
    }

    /**
     * Toggles playback with chord support
     */
    function togglePlaybackMode() {
        const text = textInput.value.trim();
        if (!text) {
            showAudioError('Digite um texto para reproduzir');
            return false;
        }

        console.log(`Playback mode: Chords=${currentChordSettings.enabled}`);
        
        // Use basic playback with chord accompaniment if enabled
        if (currentChordSettings.enabled && typeof AudioManager.togglePlaybackWithChords !== 'undefined') {
            console.log('🎼 Using basic playback with chord accompaniment');
            return AudioManager.togglePlaybackWithChords(text, currentScale, currentChordSettings);
        } else {
            console.log('🎵 Using basic playback mode');
            return toggleBasicPlayback(text);
        }
    }

    /**
     * Basic playback without highlighting
     */
    function toggleBasicPlayback(text) {
        console.log('Starting basic playback mode');
        
        try {
            const isPlaying = AudioManager.togglePlayback(text, currentScale, currentRhythm);
            playPauseButton.textContent = isPlaying ? 'Pause' : 'Play';
            
            if (isPlaying) {
                // Show text in basic mode
                showTextDisplay();
                
                // Prepare basic text highlighting if available
                if (typeof TextHighlighter !== 'undefined') {
                    try {
                        prepareTextForHighlighting();
                        console.log('✓ Basic text highlighting prepared');
                    } catch (error) {
                        console.warn('Basic highlighting failed:', error);
                    }
                }
                
                console.log('✓ Basic playback started');
            } else {
                hideTextDisplay();
                console.log('✓ Basic playback stopped');
            }
            
            return isPlaying;
        } catch (error) {
            console.error('Basic playback failed:', error);
            showAudioError('Erro na reprodução básica');
            return false;
        }
    }

    /**
     * Shows the text display for highlighting
     */
    function showTextDisplay() {
        if (textDisplay) {
            textDisplay.classList.add('active');
            // No longer setting display style since it's always visible
        }
    }

    /**
     * Hides the text display
     */
    function hideTextDisplay() {
        if (textDisplay) {
            textDisplay.classList.remove('active');
            // Clear any highlighting when hiding
            if (typeof TextHighlighter !== 'undefined') {
                TextHighlighter.stopHighlighting();
            }
        }
    }

    document.body.addEventListener('click', userInteractionListener);
    document.body.addEventListener('keydown', userInteractionListener, { once: true }); // Para o caso de começar a digitar antes de clicar


    textInput.addEventListener('input', (event) => {
        // Handle audio initialization and character playback
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
        
        // Prepare text for highlighting whenever text changes with debouncing
        clearTimeout(textInput.highlightingTimeout);
        textInput.highlightingTimeout = setTimeout(() => {
            try {
                prepareTextForHighlighting();
                console.log('Text highlighting updated after input change');
            } catch (error) {
                console.warn('Error updating text highlighting:', error);
            }
        }, 150); // 150ms debounce to avoid excessive updates
        
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

    playPauseButton.addEventListener('click', async () => {
        // Ensure Tone.js is started first (required by modern browsers)
        if (Tone.context.state !== 'running') {
            try {
                await Tone.start();
                console.log('✓ Tone.js context started');
            } catch (error) {
                console.error('Failed to start Tone.js context:', error);
                showAudioError('Erro ao inicializar sistema de áudio');
                return;
            }
        }
        
        if (!AudioManager.isAudioActive && !audioInitializedByInteraction) {
            // Add loading state
            playPauseButton.classList.add('loading');
            playPauseButton.disabled = true;
            
            // Tenta inicializar o áudio primeiro, depois tenta o playback
            AudioManager.initializeAudio().then(() => {
                audioInitializedByInteraction = true;
                console.log("✓ Áudio inicializado pelo botão Play/Pause.");
                
                // Initialize text highlighter
                initializeTextHighlighter();
                
                // Remove loading state
                playPauseButton.classList.remove('loading');
                playPauseButton.disabled = false;
                
                // Start playback with enhanced features
                const playbackStarted = togglePlaybackMode();
                if (!playbackStarted) {
                    console.warn('Playback failed to start');
                    showAudioError('Erro ao iniciar reprodução');
                }
            }).catch(error => {
                console.error("Erro ao inicializar áudio no Play/Pause:", error);
                
                // Remove loading state and show error
                playPauseButton.classList.remove('loading');
                playPauseButton.disabled = false;
                showAudioError("Erro ao inicializar áudio. Tente novamente.");
            });
        } else {
            const playbackStarted = togglePlaybackMode();
            if (!playbackStarted) {
                console.warn('Playback toggle failed');
            }
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
        
        // Add linguistic analysis parameters
        params.append('analysisMode', currentAnalysisMode);
        params.append('highlightMode', currentHighlightMode);
        params.append('dialect', currentDialect);
        
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
        
        // Linguistic analysis parameters
        if (params.has('analysisMode')) {
            const mode = params.get('analysisMode');
            if (typeof LinguisticIntegration !== 'undefined' && 
                LinguisticIntegration.ANALYSIS_MODES[mode]) {
                currentAnalysisMode = mode;
            }
        }
        
        if (params.has('highlightMode')) {
            const mode = params.get('highlightMode');
            if (typeof TextHighlighter !== 'undefined' && 
                Object.values(TextHighlighter.HIGHLIGHT_MODES).includes(mode)) {
                currentHighlightMode = mode;
            }
        }
        
        if (params.has('dialect')) {
            const dialect = params.get('dialect');
            const availableDialects = ['carioca', 'paulista', 'nordestino', 'gaucho'];
            if (availableDialects.includes(dialect)) {
                currentDialect = dialect;
            }
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

    // Initialize linguistic integration if available
    if (typeof LinguisticIntegration !== 'undefined') {
        LinguisticIntegration.setAnalysisMode(currentAnalysisMode);
        LinguisticIntegration.setDialect(currentDialect);
        LinguisticIntegration.setMusicalKey('C'); // Default key
        isEnhancedMode = true;
        console.log('✓ Linguistic Integration initialized - Enhanced mode enabled');
    } else {
        isEnhancedMode = false;
        console.warn('LinguisticIntegration not available - Enhanced mode disabled');
    }

    // DISABLED: Initialize text highlighter
    // Text highlighting temporarily disabled for better implementation later
    /*
    if (typeof TextHighlighter !== 'undefined' && textDisplay) {
        const initSuccess = initializeTextHighlighter();
        if (initSuccess) {
            console.log('✓ Text highlighter initialized on page load');
        } else {
            console.warn('Text highlighter initialization failed');
        }
    } else {
        console.warn('TextHighlighter or textDisplay not available:', {
            TextHighlighter: typeof TextHighlighter !== 'undefined',
            textDisplay: !!textDisplay
        });
    }
    */ 

    // Enhanced UI initialization with chord settings
    const initialValues = {
        scale: currentScale,
        instrument: currentInstrument,
        eq: currentEQ,
        mod: currentMod,
        tempo: currentTempo,
        rhythm: currentRhythm,
        chords: currentChordSettings
    };
    UIModule.initializeUIControls(AppConfig, onSettingsChange, initialValues);
    
    // Initialize recent creations list
    if (StorageManager.isLocalStorageAvailable()) {
        UIModule.updateRecentCreationsList();
    }
    
    // Prepare any existing text for highlighting after everything is initialized
    setTimeout(() => {
        if (textInput.value.trim()) {
            console.log('Preparing existing text for highlighting on page load');
            prepareTextForHighlighting();
        }
    }, 100);
    
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

    function onSettingsChange(changes) {
        console.log('Settings changed:', changes);
        
        if (changes.scale && changes.scale !== currentScale) {
            currentScale = changes.scale;
            console.log("Escala alterada para:", currentScale);
            // Se estiver tocando com Tone.Transport, precisa parar e, se desejar, reiniciar com a nova escala.
            // Por enquanto, a mudança de escala só afetará novas notas tocadas individualmente ou o próximo play.
            if (Tone.Transport.state === 'started') {
                AudioManager.stopAllSounds();
                playPauseButton.textContent = 'Play'; 
            }
        }
        if (changes.instrument && changes.instrument !== currentInstrument) {
            currentInstrument = changes.instrument;
            AudioManager.loadInstrument(currentInstrument);
            console.log("Instrumento alterado para:", currentInstrument);
        }
        
        let eqChanged = false;
        if (changes.eq) {
            const incomingEQ = { ...currentEQ, ...changes.eq }; // Merge para pegar apenas o que mudou
            if (incomingEQ.low !== currentEQ.low) { currentEQ.low = incomingEQ.low; eqChanged = true; }
            if (incomingEQ.mid !== currentEQ.mid) { currentEQ.mid = incomingEQ.mid; eqChanged = true; }
            if (incomingEQ.high !== currentEQ.high) { currentEQ.high = incomingEQ.high; eqChanged = true; }
            if (eqChanged) {
                AudioManager.updateEQ(currentEQ.low, currentEQ.mid, currentEQ.high);
            }
        }

        let modChanged = false;
        if (changes.mod) {
            const incomingMod = { ...currentMod, ...changes.mod }; // Merge
            if (incomingMod.vibratoRate !== currentMod.vibratoRate) { currentMod.vibratoRate = incomingMod.vibratoRate; modChanged = true; }
            if (incomingMod.vibratoDepth !== currentMod.vibratoDepth) { currentMod.vibratoDepth = incomingMod.vibratoDepth; modChanged = true; }
            if (incomingMod.tremoloRate !== currentMod.tremoloRate) { currentMod.tremoloRate = incomingMod.tremoloRate; modChanged = true; }
            if (incomingMod.tremoloDepth !== currentMod.tremoloDepth) { currentMod.tremoloDepth = incomingMod.tremoloDepth; modChanged = true; }
            if (modChanged) {
                AudioManager.updateModulation(
                    currentMod.vibratoRate, currentMod.vibratoDepth,
                    currentMod.tremoloRate, currentMod.tremoloDepth
                );
            }
        }

        if (changes.tempo && changes.tempo !== currentTempo) {
            currentTempo = changes.tempo;
            AudioManager.updateTempo(currentTempo);
            console.log("Tempo alterado para:", currentTempo, "BPM");
        }
        
        if (changes.rhythm && changes.rhythm !== currentRhythm) {
            currentRhythm = changes.rhythm;
            console.log("Padrão rítmico alterado para:", currentRhythm);
            // Se estiver tocando, parar para aplicar novo padrão
            if (Tone.Transport.state === 'started') {
                AudioManager.stopAllSounds();
                playPauseButton.textContent = 'Play';
            }
        }
        
        // Handle linguistic analysis settings
        if (changes.analysisMode && changes.analysisMode !== currentAnalysisMode) {
            currentAnalysisMode = changes.analysisMode;
            if (typeof LinguisticIntegration !== 'undefined') {
                LinguisticIntegration.setAnalysisMode(currentAnalysisMode);
            }
            console.log("Modo de análise alterado para:", currentAnalysisMode);
            
            // Reprepare text with new analysis mode
            prepareTextForHighlighting();
            
        }
        
        if (changes.highlightMode && changes.highlightMode !== currentHighlightMode) {
            currentHighlightMode = changes.highlightMode;
            if (typeof TextHighlighter !== 'undefined') {
                TextHighlighter.setHighlightMode(currentHighlightMode);
            }
            console.log("Modo de destaque alterado para:", currentHighlightMode);
            
            // Reprepare text with new highlight mode
            prepareTextForHighlighting();
            
        }
        
        if (changes.dialect && changes.dialect !== currentDialect) {
            currentDialect = changes.dialect;
            if (typeof LinguisticIntegration !== 'undefined') {
                LinguisticIntegration.setDialect(currentDialect);
            }
            console.log("Dialeto alterado para:", currentDialect);
        }
        
        // Handle chord accompaniment settings
        if (changes.chords) {
            console.log('Chord settings changed:', changes.chords);
            
            // Update current chord settings
            Object.assign(currentChordSettings, changes.chords);
            
            // Apply chord settings to engine if available
            if (typeof ChordPlaybackEngine !== 'undefined') {
                if (changes.chords.enabled !== undefined) {
                    ChordPlaybackEngine.setAccompanimentEnabled(changes.chords.enabled);
                }
                if (changes.chords.pattern) {
                    ChordPlaybackEngine.setAccompanimentPattern(changes.chords.pattern);
                }
                if (changes.chords.volume !== undefined) {
                    // Use enhanced volume mixing for better audio balance
                    if (ChordPlaybackEngine.setAccompanimentVolumeWithMixing) {
                        ChordPlaybackEngine.setAccompanimentVolumeWithMixing(changes.chords.volume, true);
                    } else {
                        ChordPlaybackEngine.setAccompanimentVolume(changes.chords.volume);
                    }
                }
                if (changes.chords.bassVolume !== undefined) {
                    ChordPlaybackEngine.setBassVolume(changes.chords.bassVolume);
                }
            }
            
            // Show chord status message
            if (changes.chords.enabled !== undefined) {
                showAudioMessage(
                    changes.chords.enabled 
                        ? '🎼 Acompanhamento de acordes ativado!' 
                        : '🎼 Acompanhamento de acordes desativado',
                    changes.chords.enabled ? 'success' : 'info'
                );
            }
            
            console.log('✓ Chord settings applied:', currentChordSettings);
        }
        
        // Update URL when settings change
        updateShareUrlInput();
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
    
    // Add event listeners for user interaction
    document.body.addEventListener('click', userInteractionListener);
    document.body.addEventListener('keydown', userInteractionListener);
    
    // Update text display when user types
    textInput.addEventListener('input', () => {
        showBasicTextDisplay();
    });
    
    // Initialize UI controls
    const onSettingsChange = (settings) => {
        console.log('Settings changed:', settings);
        
        if (settings.scale) {
            currentScale = settings.scale;
            console.log('Scale changed to:', currentScale);
        }
        
        if (settings.instrument) {
            currentInstrument = settings.instrument;
            console.log('Instrument changed to:', currentInstrument);
            AudioManager.setCurrentInstrument(currentInstrument);
        }
        
        if (settings.tempo) {
            currentTempo = settings.tempo;
            console.log('Tempo changed to:', currentTempo);
            AudioManager.setTempo(currentTempo);
        }
        
        if (settings.rhythm) {
            currentRhythm = settings.rhythm;
            console.log('Rhythm changed to:', currentRhythm);
        }
        
        if (settings.eq) {
            currentEQ = { ...currentEQ, ...settings.eq };
            console.log('EQ settings changed:', currentEQ);
            AudioManager.updateEQSettings(currentEQ);
        }
        
        if (settings.mod) {
            currentMod = { ...currentMod, ...settings.mod };
            console.log('Modulation settings changed:', currentMod);
            AudioManager.updateModulationSettings(currentMod);
        }
        
        if (settings.chords) {
            currentChordSettings = { ...currentChordSettings, ...settings.chords };
            console.log('🎼 Chord settings changed:', currentChordSettings);
            
            // Update chord engine if available
            if (typeof ChordPlaybackEngine !== 'undefined') {
                ChordPlaybackEngine.setAccompanimentEnabled(currentChordSettings.enabled);
                ChordPlaybackEngine.setAccompanimentPattern(currentChordSettings.pattern);
                ChordPlaybackEngine.setAccompanimentVolume(currentChordSettings.volume);
                ChordPlaybackEngine.setBassVolume(currentChordSettings.bassVolume);
            }
        }
        
        // Save settings to localStorage
        const allSettings = {
            scale: currentScale,
            instrument: currentInstrument,
            tempo: currentTempo,
            rhythm: currentRhythm,
            eq: currentEQ,
            mod: currentMod,
            chords: currentChordSettings
        };
        
        try {
            localStorage.setItem('textToMidiSettings', JSON.stringify(allSettings));
            console.log('✓ Settings saved to localStorage');
        } catch (error) {
            console.warn('Failed to save settings to localStorage:', error);
        }
    };
    
    // Load saved settings
    let savedSettings = {};
    try {
        const saved = localStorage.getItem('textToMidiSettings');
        if (saved) {
            savedSettings = JSON.parse(saved);
            console.log('✓ Loaded saved settings:', savedSettings);
            
            // Apply saved settings
            if (savedSettings.scale) currentScale = savedSettings.scale;
            if (savedSettings.instrument) currentInstrument = savedSettings.instrument;
            if (savedSettings.tempo) currentTempo = savedSettings.tempo;
            if (savedSettings.rhythm) currentRhythm = savedSettings.rhythm;
            if (savedSettings.eq) currentEQ = { ...currentEQ, ...savedSettings.eq };
            if (savedSettings.mod) currentMod = { ...currentMod, ...savedSettings.mod };
            if (savedSettings.chords) currentChordSettings = { ...currentChordSettings, ...savedSettings.chords };
        }
    } catch (error) {
        console.warn('Failed to load saved settings:', error);
    }
    
    // Initialize UI controls with saved settings
    UIModule.initializeUIControls(AppConfig, onSettingsChange, savedSettings);
    
    // Connect play/pause button
    playPauseButton.addEventListener('click', () => {
        togglePlaybackMode();
    });
    
    // Connect share button
    shareButton.addEventListener('click', () => {
        const text = textInput.value.trim();
        if (!text) {
            showAudioError('Digite um texto para compartilhar');
            return;
        }
        
        const encodedText = encodeURIComponent(text);
        const shareUrl = `${window.location.origin}${window.location.pathname}?text=${encodedText}`;
        shareUrlInput.value = shareUrl;
        
        // Copy to clipboard
        navigator.clipboard.writeText(shareUrl).then(() => {
            showAudioMessage('Link copiado para a área de transferência!', 'success');
        }).catch(() => {
            showAudioMessage('Link criado! Copie manualmente do campo acima.', 'info');
        });
    });
    
    // Connect QR button
    qrButton.addEventListener('click', () => {
        const text = textInput.value.trim();
        if (!text) {
            showAudioError('Digite um texto para gerar QR Code');
            return;
        }
        
        const encodedText = encodeURIComponent(text);
        const shareUrl = `${window.location.origin}${window.location.pathname}?text=${encodedText}`;
        showQRCode(shareUrl);
    });
    
    // Check URL parameters for shared text
    const urlParams = new URLSearchParams(window.location.search);
    const sharedText = urlParams.get('text');
    if (sharedText) {
        textInput.value = decodeURIComponent(sharedText);
        showBasicTextDisplay();
        showAudioMessage('Texto compartilhado carregado!', 'success');
    }
    
    // Initialize display
    showBasicTextDisplay();
    
    console.log('✓ Text-to-MIDI application initialized successfully');
    console.log('🎼 Chord functionality:', typeof ChordPlaybackEngine !== 'undefined' ? 'Available' : 'Not Available');
    console.log('🎵 Text highlighting:', 'Disabled (will implement better version later)');
}); 