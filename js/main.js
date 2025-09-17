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
    
    // Initialize text highlighter immediately if elements are available
    if (textDisplay) {
        console.log('textDisplay element found, initializing highlighter...');
        
        // Try immediate initialization
        const initResult = initializeTextHighlighter();
        
        if (!initResult) {
            // If immediate init failed, try again after a short delay
            setTimeout(() => {
                console.log('Retrying text highlighter initialization...');
                const retryResult = initializeTextHighlighter();
                if (!retryResult) {
                    console.warn('Text highlighter initialization failed - using basic mode');
                    showFallbackTextDisplay();
                }
            }, 100);
        }
    } else {
        console.error('textDisplay element not found!');
        // Try to find it after DOM is fully loaded
        setTimeout(() => {
            const laterTextDisplay = document.getElementById('textDisplay');
            if (laterTextDisplay) {
                console.log('textDisplay found on retry, initializing...');
                textDisplay = laterTextDisplay;
                initializeTextHighlighter();
            }
        }, 200);
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

    // Inicializa o áudio na primeira interação do usuário com a página
    // Isso é crucial para políticas de autoplay dos navegadores
    function userInteractionListener() {
        if (!AudioManager.isAudioActive && !audioInitializedByInteraction) {
            AudioManager.initializeAudio().then(() => {
                audioInitializedByInteraction = true;
                console.log("Áudio inicializado após interação do usuário.");
                // Initialize text highlighter after audio is ready
                initializeTextHighlighter();
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

    /**
     * Initializes the text highlighter system with enhanced error handling
     */
    function initializeTextHighlighter() {
        console.log('Initializing text highlighter system...');
        
        // Check for required elements
        if (!textDisplay) {
            console.error('textDisplay element not found - text highlighting disabled');
            return false;
        }
        
        // Check for TextHighlighter availability
        if (typeof TextHighlighter === 'undefined') {
            console.warn('TextHighlighter module not loaded - using fallback mode');
            showFallbackTextDisplay();
            return false;
        }
        
        try {
            // Initialize the text highlighter
            TextHighlighter.initialize(textDisplay);
            console.log('✓ Text Highlighter initialized successfully');
            
            // Set up linguistic integration if available
            if (typeof LinguisticIntegration !== 'undefined') {
                isEnhancedMode = true;
                console.log('✓ Enhanced linguistic mode enabled');
                
                // Configure linguistic integration
                LinguisticIntegration.setAnalysisMode(currentAnalysisMode);
                LinguisticIntegration.setDialect(currentDialect);
                LinguisticIntegration.setMusicalKey('C');
            } else {
                console.warn('LinguisticIntegration not available - using basic character mode');
                isEnhancedMode = false;
            }
            
            // Set initial highlight mode
            TextHighlighter.setHighlightMode(currentHighlightMode);
            
            // Prepare initial text if any exists
            const initialText = textInput.value.trim();
            if (initialText) {
                console.log('Preparing initial text for highlighting:', initialText.substring(0, 50) + '...');
                prepareTextForHighlighting();
            } else {
                showEmptyStateMessage();
            }
            
            return true;
            
        } catch (error) {
            console.error('Error initializing text highlighter:', error);
            showFallbackTextDisplay();
            return false;
        }
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
     * Toggles between enhanced and basic playback modes
     */
    function togglePlaybackMode() {
        const text = textInput.value.trim();
        if (!text) {
            showAudioError('Digite um texto para reproduzir');
            return false;
        }

        console.log(`Playback mode check: Enhanced=${isEnhancedMode}, AudioManager.togglePlaybackWithHighlighting=${typeof AudioManager.togglePlaybackWithHighlighting}`);
        
        // Force enhanced mode if all components are available
        const hasLinguisticIntegration = typeof LinguisticIntegration !== 'undefined';
        const hasTextHighlighter = typeof TextHighlighter !== 'undefined';
        const hasEnhancedAudio = typeof AudioManager.togglePlaybackWithHighlighting !== 'undefined';
        
        if (hasLinguisticIntegration && hasTextHighlighter && hasEnhancedAudio) {
            console.log('✓ All enhanced components available - using enhanced playback');
            isEnhancedMode = true;
            return toggleEnhancedPlayback(text);
        } else {
            console.log(`⚠️ Using basic playback - Missing: ${!hasLinguisticIntegration ? 'LinguisticIntegration ' : ''}${!hasTextHighlighter ? 'TextHighlighter ' : ''}${!hasEnhancedAudio ? 'EnhancedAudio' : ''}`);
            return toggleBasicPlayback(text);
        }
    }

    /**
     * Enhanced playback with linguistic analysis and highlighting
     */
    function toggleEnhancedPlayback(text) {
        const isCurrentlyPlaying = Tone.Transport.state === 'started';
        
        if (isCurrentlyPlaying) {
            // Stop playback
            console.log('Stopping enhanced playback...');
            AudioManager.stopAllSounds();
            hideTextDisplay();
            playPauseButton.textContent = 'Play';
            return false;
        } else {
            // Start enhanced playback
            console.log('Starting enhanced playback...');
            showTextDisplay();
            
            // Ensure text is prepared for highlighting before starting playback
            prepareTextForHighlighting();
            
            try {
                const result = AudioManager.togglePlaybackWithHighlighting(
                    text, 
                    currentScale, 
                    currentAnalysisMode, 
                    currentHighlightMode
                );
                
                if (result) {
                    playPauseButton.textContent = 'Pause';
                    console.log(`✓ Enhanced playback started: ${currentAnalysisMode} + ${currentHighlightMode}`);
                    
                    // Add event listener for transport events
                    setupTransportEventListeners();
                    
                    return true;
                } else {
                    console.warn('Enhanced playback failed, trying basic mode');
                    return toggleBasicPlayback(text);
                }
            } catch (error) {
                console.error('Enhanced playback failed, falling back to basic:', error);
                return toggleBasicPlayback(text);
            }
        }
    }
    
    /**
     * Sets up event listeners for Tone.js Transport events
     */
    function setupTransportEventListeners() {
        // Clean up existing listeners
        Tone.Transport.off('start');
        Tone.Transport.off('stop');
        
        // Add new listeners
        Tone.Transport.on('start', () => {
            console.log('✓ Audio transport started');
            if (textDisplay) {
                textDisplay.classList.add('active');
            }
        });
        
        Tone.Transport.on('stop', () => {
            console.log('✓ Audio transport stopped');
            if (textDisplay) {
                textDisplay.classList.remove('active');
            }
            
            // Clean up highlighting
            if (typeof TextHighlighter !== 'undefined') {
                try {
                    TextHighlighter.stopHighlighting();
                } catch (error) {
                    console.warn('Error stopping highlighting on transport stop:', error);
                }
            }
            
            // Reset play button
            playPauseButton.textContent = 'Play';
        });
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

    // Initialize text highlighter if available
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

    UIModule.initializeUIControls(AppConfig, updateSettings, {
        scale: currentScale,
        instrument: currentInstrument,
        eq: currentEQ,
        mod: currentMod,
        tempo: currentTempo,
        rhythm: currentRhythm,
        analysisMode: currentAnalysisMode,
        highlightMode: currentHighlightMode,
        dialect: currentDialect
    });
    
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
        
        // Handle linguistic analysis settings
        if (newSettings.analysisMode && newSettings.analysisMode !== currentAnalysisMode) {
            currentAnalysisMode = newSettings.analysisMode;
            if (typeof LinguisticIntegration !== 'undefined') {
                LinguisticIntegration.setAnalysisMode(currentAnalysisMode);
            }
            console.log("Modo de análise alterado para:", currentAnalysisMode);
            
            // Reprepare text with new analysis mode
            prepareTextForHighlighting();
            
            overallSettingsChanged = true;
        }
        
        if (newSettings.highlightMode && newSettings.highlightMode !== currentHighlightMode) {
            currentHighlightMode = newSettings.highlightMode;
            if (typeof TextHighlighter !== 'undefined') {
                TextHighlighter.setHighlightMode(currentHighlightMode);
            }
            console.log("Modo de destaque alterado para:", currentHighlightMode);
            
            // Reprepare text with new highlight mode
            prepareTextForHighlighting();
            
            overallSettingsChanged = true;
        }
        
        if (newSettings.dialect && newSettings.dialect !== currentDialect) {
            currentDialect = newSettings.dialect;
            if (typeof LinguisticIntegration !== 'undefined') {
                LinguisticIntegration.setDialect(currentDialect);
            }
            console.log("Dialeto alterado para:", currentDialect);
            overallSettingsChanged = true;
        }

        if (overallSettingsChanged) {
            console.log('Configurações atualizadas:', { 
                scale: currentScale, 
                instrument: currentInstrument, 
                eq: { ...currentEQ }, 
                mod: { ...currentMod },
                tempo: currentTempo,
                rhythm: currentRhythm,
                analysisMode: currentAnalysisMode,
                highlightMode: currentHighlightMode,
                dialect: currentDialect
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