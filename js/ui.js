const UIModule = (() => {
    let onSettingsChangeCallback = null;

    function initializeUIControls(appConfig, callback, initialValues = {}) {
        onSettingsChangeCallback = callback;
        const settingsContainer = document.querySelector('.settings');
        if (!settingsContainer) return;

        settingsContainer.innerHTML = '';

        const currentScale = initialValues.scale || appConfig.DEFAULT_SCALE;
        const currentInstrument = initialValues.instrument || appConfig.DEFAULT_INSTRUMENT;
        const currentEQ = initialValues.eq || appConfig.EFFECTS.defaultEQ;
        const currentMod = initialValues.mod || appConfig.EFFECTS.defaultModulation;
        const currentTempo = initialValues.tempo || appConfig.DEFAULT_TEMPO;
        const currentRhythm = initialValues.rhythm || 'uniform';

        const scaleSelector = createScaleSelector(appConfig.SCALES, currentScale);
        settingsContainer.appendChild(scaleSelectorContainer(scaleSelector));

        const instrumentSelector = createInstrumentSelector(appConfig.INSTRUMENTS, currentInstrument);
        settingsContainer.appendChild(instrumentSelectorContainer(instrumentSelector));

        const tempoControl = createTempoControl(currentTempo);
        settingsContainer.appendChild(tempoControlContainer(tempoControl));
        
        const rhythmSelector = createRhythmSelector(appConfig.RHYTHM_PATTERNS, currentRhythm);
        settingsContainer.appendChild(rhythmSelectorContainer(rhythmSelector));

        const eqControls = createEQControls(currentEQ);
        settingsContainer.appendChild(eqControlsContainer(eqControls));

        const modControls = createModulationControls(initialValues.mod || appConfig.EFFECTS.defaultModulation);
        settingsContainer.appendChild(modControlsContainer(modControls));

        // Create linguistic analysis controls if available
        if (typeof LinguisticIntegration !== 'undefined') {
            const analysisControls = createLinguisticAnalysisControls(
                initialValues.analysis || LinguisticIntegration.getDefaultSettings()
            );
            settingsContainer.appendChild(analysisControls);
        }
        
        // DISABLED: Create enhanced highlighting controls
        // Text highlighting temporarily disabled for better implementation later
        /*
        if (typeof TextHighlighter !== 'undefined') {
            const highlightControls = createTextHighlightControls(
                initialValues.highlighting || { mode: 'character', speed: 1.0 }
            );
            settingsContainer.appendChild(highlightControls);
        }
        */
        
        // Create chord accompaniment controls - FORCE CREATION FOR DEBUGGING
        console.log('🎼 DEBUGGING: ChordPlaybackEngine type:', typeof ChordPlaybackEngine);
        console.log('🎼 DEBUGGING: ChordPlaybackEngine value:', ChordPlaybackEngine);
        console.log('🎼 DEBUGGING: Window.ChordPlaybackEngine:', window.ChordPlaybackEngine);
        
        // Force create chord controls regardless of ChordPlaybackEngine status for testing
        console.log('🎼 FORCE CREATING chord accompaniment controls for debugging...');
        try {
            const chordControls = createChordAccompanimentControls(initialValues.chords || {});
            settingsContainer.appendChild(chordControls);
            console.log('✓ Chord controls successfully added to UI');
        } catch (error) {
            console.error('❌ Error creating chord controls:', error);
        }
        
        // Add storage section
        const storageSection = createStorageSection();
        settingsContainer.appendChild(storageSection);
    }

    function createControlContainer(label, controlElement) {
        const container = document.createElement('div');
        container.classList.add('control-group');
        const labelElement = document.createElement('label');
        labelElement.textContent = label;
        container.appendChild(labelElement);
        container.appendChild(controlElement);
        return container;
    }

    function scaleSelectorContainer(selector) {
        return createControlContainer('Escala Musical:', selector);
    }

    function instrumentSelectorContainer(selector) {
        return createControlContainer('Instrumento:', selector);
    }

    function tempoControlContainer(control) {
        return createControlContainer('Tempo (BPM):', control);
    }
    
    function rhythmSelectorContainer(selector) {
        return createControlContainer('Padrão Rítmico:', selector);
    }

    function eqControlsContainer(controls) {
        const fieldset = document.createElement('fieldset');
        const legend = document.createElement('legend');
        legend.textContent = 'Equalizador (EQ)';
        fieldset.appendChild(legend);
        
        // Add EQ presets dropdown
        const presetContainer = createEQPresetSelector();
        fieldset.appendChild(presetContainer);
        
        controls.forEach(c => fieldset.appendChild(c));
        return fieldset;
    }

    function modControlsContainer(controls) {
        const fieldset = document.createElement('fieldset');
        const legend = document.createElement('legend');
        legend.textContent = 'Modulação';
        fieldset.appendChild(legend);
        
        // Add modulation presets dropdown
        const presetContainer = createModulationPresetSelector();
        fieldset.appendChild(presetContainer);
        
        controls.forEach(c => fieldset.appendChild(c));
        return fieldset;
    }

    function createScaleSelector(scales, defaultScale) {
        const select = document.createElement('select');
        select.id = 'scaleSelector';
        
        // Scale display names mapping
        const scaleNames = {
            'cMajor': 'C Major',
            'gMajor': 'G Major', 
            'dMajor': 'D Major',
            'aMinorPentatonic': 'A Minor Pentatonic',
            'cMajorPentatonic': 'C Major Pentatonic',
            'eMinor': 'E Minor',
            'chromatic': 'Chromatic (All Notes)'
        };
        
        for (const scaleName in scales) {
            const option = document.createElement('option');
            option.value = scaleName;
            option.textContent = scaleNames[scaleName] || scaleName;
            if (scaleName === defaultScale) {
                option.selected = true;
            }
            select.appendChild(option);
        }
        select.addEventListener('change', (e) => {
            if (onSettingsChangeCallback) onSettingsChangeCallback({ scale: e.target.value });
        });
        return select;
    }

    function createInstrumentSelector(instruments, defaultInstrument) {
        const select = document.createElement('select');
        select.id = 'instrumentSelector';
        
        // Instrument display names mapping
        const instrumentNames = {
            'piano': 'Piano',
            'synthLead': 'Synth Lead',
            'synthPad': 'Synth Pad',
            'guitar': 'Acoustic Guitar',
            'electricPiano': 'Electric Piano',
            'bass': 'Bass Synth',
            'bells': 'Bells'
        };
        
        for (const instrumentName in instruments) {
            const option = document.createElement('option');
            option.value = instrumentName;
            option.textContent = instrumentNames[instrumentName] || instrumentName;
            if (instrumentName === defaultInstrument) {
                option.selected = true;
            }
            select.appendChild(option);
        }
        select.addEventListener('change', (e) => {
            if (onSettingsChangeCallback) onSettingsChangeCallback({ instrument: e.target.value });
        });
        return select;
    }

    function createTempoControl(defaultTempo) {
        const container = document.createElement('div');
        container.classList.add('slider-control');
        
        const valueSpan = document.createElement('span');
        valueSpan.id = 'tempoValue';
        valueSpan.textContent = defaultTempo;
        
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = 'tempoSlider';
        slider.min = AppConfig.MIN_TEMPO;
        slider.max = AppConfig.MAX_TEMPO;
        slider.value = defaultTempo;
        slider.step = 1;
        
        slider.addEventListener('input', (e) => {
            const newValue = parseInt(e.target.value);
            valueSpan.textContent = newValue;
            if (onSettingsChangeCallback) {
                onSettingsChangeCallback({ tempo: newValue });
            }
        });
        
        container.appendChild(slider);
        container.appendChild(valueSpan);
        return container;
    }
    
    function createRhythmSelector(rhythmPatterns, defaultRhythm) {
        const select = document.createElement('select');
        select.id = 'rhythmSelector';
        
        Object.keys(rhythmPatterns).forEach(patternName => {
            const option = document.createElement('option');
            option.value = patternName;
            option.textContent = rhythmPatterns[patternName].name;
            if (patternName === defaultRhythm) {
                option.selected = true;
            }
            select.appendChild(option);
        });
        
        select.addEventListener('change', (e) => {
            if (onSettingsChangeCallback) {
                onSettingsChangeCallback({ rhythm: e.target.value });
            }
        });
        
        return select;
    }

    function createSliderControl(id, label, min, max, value, step, updateFn) {
        const container = document.createElement('div');
        container.classList.add('slider-control');
        const labelElement = document.createElement('label');
        labelElement.textContent = label + ': ';
        labelElement.htmlFor = id;
        
        const valueSpan = document.createElement('span');
        valueSpan.id = id + 'Value';
        valueSpan.textContent = value;
        
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = id;
        slider.min = min;
        slider.max = max;
        slider.value = value;
        slider.step = step;
        
        slider.addEventListener('input', (e) => {
            const newValue = parseFloat(e.target.value);
            valueSpan.textContent = newValue.toFixed(step.toString().includes('.') ? step.toString().split('.')[1].length : 0);
            updateFn(newValue);
        });
        
        container.appendChild(labelElement);
        container.appendChild(slider);
        container.appendChild(valueSpan);
        return container;
    }

    function createEQControls(defaultEQConfig) {
        const controls = [];
        controls.push(createSliderControl('eqLow', 'Graves', -12, 12, defaultEQConfig.low, 1, (val) => {
            if (onSettingsChangeCallback) onSettingsChangeCallback({ eq: { low: val } });
        }));
        controls.push(createSliderControl('eqMid', 'Médios', -12, 12, defaultEQConfig.mid, 1, (val) => {
            if (onSettingsChangeCallback) onSettingsChangeCallback({ eq: { mid: val } });
        }));
        controls.push(createSliderControl('eqHigh', 'Agudos', -12, 12, defaultEQConfig.high, 1, (val) => {
            if (onSettingsChangeCallback) onSettingsChangeCallback({ eq: { high: val } });
        }));
        return controls;
    }

    function createModulationControls(defaultModConfig) {
        const controls = [];
        controls.push(createSliderControl('vibratoRate', 'Vibrato Taxa (Hz)', 0, 10, defaultModConfig.vibratoRate, 0.1, (val) => {
             if (onSettingsChangeCallback) onSettingsChangeCallback({ mod: { vibratoRate: val } });
        }));
        controls.push(createSliderControl('vibratoDepth', 'Vibrato Profundidade', 0, 1, defaultModConfig.vibratoDepth, 0.01, (val) => {
             if (onSettingsChangeCallback) onSettingsChangeCallback({ mod: { vibratoDepth: val } });
        }));
        controls.push(createSliderControl('tremoloRate', 'Tremolo Taxa (Hz)', 0, 20, defaultModConfig.tremoloRate, 0.1, (val) => {
             if (onSettingsChangeCallback) onSettingsChangeCallback({ mod: { tremoloRate: val } });
        }));
        controls.push(createSliderControl('tremoloDepth', 'Tremolo Profundidade', 0, 1, defaultModConfig.tremoloDepth, 0.01, (val) => {
             if (onSettingsChangeCallback) onSettingsChangeCallback({ mod: { tremoloDepth: val } });
        }));
        return controls;
    }

    function createEQPresetSelector() {
        const container = document.createElement('div');
        container.classList.add('preset-selector');
        
        const label = document.createElement('label');
        label.textContent = 'Preset EQ: ';
        
        const select = document.createElement('select');
        select.id = 'eqPresetSelector';
        
        const presetNames = {
            'flat': 'Flat (Neutro)',
            'bright': 'Bright (Brilhante)',
            'warm': 'Warm (Quente)',
            'bass_boost': 'Bass Boost',
            'presence': 'Presence',
            'radio': 'Radio'
        };
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Selecionar Preset --';
        select.appendChild(defaultOption);
        
        // Add preset options
        Object.keys(AppConfig.EFFECTS.EQ_PRESETS).forEach(presetName => {
            const option = document.createElement('option');
            option.value = presetName;
            option.textContent = presetNames[presetName] || presetName;
            select.appendChild(option);
        });
        
        select.addEventListener('change', (e) => {
            if (e.target.value && onSettingsChangeCallback) {
                const preset = AppConfig.EFFECTS.EQ_PRESETS[e.target.value];
                if (preset) {
                    onSettingsChangeCallback({ eq: preset });
                    updateControlValues({ eq: preset });
                }
            }
        });
        
        container.appendChild(label);
        container.appendChild(select);
        return container;
    }

    function createModulationPresetSelector() {
        const container = document.createElement('div');
        container.classList.add('preset-selector');
        
        const label = document.createElement('label');
        label.textContent = 'Preset Modulação: ';
        
        const select = document.createElement('select');
        select.id = 'modPresetSelector';
        
        const presetNames = {
            'none': 'Nenhum',
            'subtle': 'Sutil',
            'classic': 'Clássico',
            'dramatic': 'Dramático'
        };
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Selecionar Preset --';
        select.appendChild(defaultOption);
        
        // Add preset options
        Object.keys(AppConfig.EFFECTS.MOD_PRESETS).forEach(presetName => {
            const option = document.createElement('option');
            option.value = presetName;
            option.textContent = presetNames[presetName] || presetName;
            select.appendChild(option);
        });
        
        select.addEventListener('change', (e) => {
            if (e.target.value && onSettingsChangeCallback) {
                const preset = AppConfig.EFFECTS.MOD_PRESETS[e.target.value];
                if (preset) {
                    onSettingsChangeCallback({ mod: preset });
                    updateControlValues({ mod: preset });
                }
            }
        });
        
        container.appendChild(label);
        container.appendChild(select);
        return container;
    }

    function updateControlValues(values) {
        if (values.eq) {
            if (values.eq.low !== undefined) {
                const slider = document.getElementById('eqLow');
                const valueSpan = document.getElementById('eqLowValue');
                if (slider && valueSpan) {
                    slider.value = values.eq.low;
                    valueSpan.textContent = values.eq.low;
                }
            }
            if (values.eq.mid !== undefined) {
                const slider = document.getElementById('eqMid');
                const valueSpan = document.getElementById('eqMidValue');
                if (slider && valueSpan) {
                    slider.value = values.eq.mid;
                    valueSpan.textContent = values.eq.mid;
                }
            }
            if (values.eq.high !== undefined) {
                const slider = document.getElementById('eqHigh');
                const valueSpan = document.getElementById('eqHighValue');
                if (slider && valueSpan) {
                    slider.value = values.eq.high;
                    valueSpan.textContent = values.eq.high;
                }
            }
        }
        
        if (values.mod) {
            if (values.mod.vibratoRate !== undefined) {
                const slider = document.getElementById('vibratoRate');
                const valueSpan = document.getElementById('vibratoRateValue');
                if (slider && valueSpan) {
                    slider.value = values.mod.vibratoRate;
                    valueSpan.textContent = values.mod.vibratoRate.toFixed(1);
                }
            }
            if (values.mod.vibratoDepth !== undefined) {
                const slider = document.getElementById('vibratoDepth');
                const valueSpan = document.getElementById('vibratoDepthValue');
                if (slider && valueSpan) {
                    slider.value = values.mod.vibratoDepth;
                    valueSpan.textContent = values.mod.vibratoDepth.toFixed(2);
                }
            }
            if (values.mod.tremoloRate !== undefined) {
                const slider = document.getElementById('tremoloRate');
                const valueSpan = document.getElementById('tremoloRateValue');
                if (slider && valueSpan) {
                    slider.value = values.mod.tremoloRate;
                    valueSpan.textContent = values.mod.tremoloRate.toFixed(1);
                }
            }
            if (values.mod.tremoloDepth !== undefined) {
                const slider = document.getElementById('tremoloDepth');
                const valueSpan = document.getElementById('tremoloDepthValue');
                if (slider && valueSpan) {
                    slider.value = values.mod.tremoloDepth;
                    valueSpan.textContent = values.mod.tremoloDepth.toFixed(2);
                }
            }
        }
    }

    function createStorageSection() {
        const fieldset = document.createElement('fieldset');
        const legend = document.createElement('legend');
        legend.textContent = 'Armazenamento';
        fieldset.appendChild(legend);
        
        // Save current button
        const saveCurrentButton = document.createElement('button');
        saveCurrentButton.textContent = 'Salvar Atual';
        saveCurrentButton.className = 'storage-button';
        saveCurrentButton.addEventListener('click', () => {
            if (onSettingsChangeCallback) {
                onSettingsChangeCallback({ action: 'saveCurrent' });
            }
        });
        
        // Recent creations dropdown
        const recentContainer = document.createElement('div');
        recentContainer.className = 'storage-control';
        
        const recentLabel = document.createElement('label');
        recentLabel.textContent = 'Criações Recentes:';
        
        const recentSelect = document.createElement('select');
        recentSelect.id = 'recentCreations';
        recentSelect.innerHTML = '<option value="">-- Selecionar Criação --</option>';
        
        recentSelect.addEventListener('change', (e) => {
            if (e.target.value && onSettingsChangeCallback) {
                onSettingsChangeCallback({ action: 'loadRecent', id: e.target.value });
            }
        });
        
        recentContainer.appendChild(recentLabel);
        recentContainer.appendChild(recentSelect);
        
        // Clear recent button
        const clearRecentButton = document.createElement('button');
        clearRecentButton.textContent = 'Limpar Recentes';
        clearRecentButton.className = 'storage-button secondary';
        clearRecentButton.addEventListener('click', () => {
            if (onSettingsChangeCallback) {
                onSettingsChangeCallback({ action: 'clearRecent' });
            }
        });
        
        fieldset.appendChild(saveCurrentButton);
        fieldset.appendChild(recentContainer);
        fieldset.appendChild(clearRecentButton);
        
        return fieldset;
    }

    function updateRecentCreationsList() {
        const recentSelect = document.getElementById('recentCreations');
        if (!recentSelect) return;
        
        const recentCreations = StorageManager.loadRecentCreations();
        recentSelect.innerHTML = '<option value="">-- Selecionar Criação --</option>';
        
        recentCreations.forEach(creation => {
            const option = document.createElement('option');
            option.value = creation.id;
            
            const preview = creation.text.length > 30 
                ? creation.text.substring(0, 30) + '...' 
                : creation.text;
            const date = new Date(creation.timestamp).toLocaleDateString();
            option.textContent = `${preview} (${date})`;
            
            recentSelect.appendChild(option);
        });
    }

    /**
     * Creates chord accompaniment controls UI
     * @param {Object} initialSettings - Initial chord settings
     * @returns {HTMLElement} Chord control fieldset
     */
    function createChordAccompanimentControls(initialSettings = {}) {
        const fieldset = document.createElement('fieldset');
        const legend = document.createElement('legend');
        legend.textContent = '🎼 Acompanhamento de Acordes';
        fieldset.appendChild(legend);
        
        // Enable/disable toggle
        const enableContainer = document.createElement('div');
        enableContainer.className = 'control-group';
        
        const enableLabel = document.createElement('label');
        enableLabel.textContent = 'Ativar Acordes: ';
        
        const enableToggle = document.createElement('input');
        enableToggle.type = 'checkbox';
        enableToggle.id = 'enableChordAccompaniment';
        enableToggle.checked = initialSettings.enabled || false;
        
        enableToggle.addEventListener('change', (e) => {
            const enabled = e.target.checked;
            if (typeof ChordPlaybackEngine !== 'undefined') {
                ChordPlaybackEngine.setAccompanimentEnabled(enabled);
            }
            if (onSettingsChangeCallback) {
                onSettingsChangeCallback({ chords: { enabled } });
            }
            
            // Enable/disable other chord controls
            const chordControls = fieldset.querySelectorAll('select, input[type="range"]');
            chordControls.forEach(control => {
                if (control !== enableToggle) {
                    control.disabled = !enabled;
                }
            });
        });
        
        enableContainer.appendChild(enableLabel);
        enableContainer.appendChild(enableToggle);
        fieldset.appendChild(enableContainer);
        
        // Pattern selector
        const patternContainer = document.createElement('div');
        patternContainer.className = 'control-group';
        
        const patternLabel = document.createElement('label');
        patternLabel.textContent = 'Padrão: ';
        
        const patternSelector = document.createElement('select');
        patternSelector.id = 'chordPatternSelector';
        
        // Add patterns from ChordPlaybackEngine if available
        if (typeof ChordPlaybackEngine !== 'undefined' && ChordPlaybackEngine.ACCOMPANIMENT_PATTERNS) {
            Object.entries(ChordPlaybackEngine.ACCOMPANIMENT_PATTERNS).forEach(([key, pattern]) => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = pattern.name;
                if (key === (initialSettings.pattern || 'block')) {
                    option.selected = true;
                }
                patternSelector.appendChild(option);
            });
        }
        
        patternSelector.addEventListener('change', (e) => {
            if (typeof ChordPlaybackEngine !== 'undefined') {
                ChordPlaybackEngine.setAccompanimentPattern(e.target.value);
            }
            if (onSettingsChangeCallback) {
                onSettingsChangeCallback({ chords: { pattern: e.target.value } });
            }
        });
        
        patternContainer.appendChild(patternLabel);
        patternContainer.appendChild(patternSelector);
        fieldset.appendChild(patternContainer);
        
        // Volume controls
        const chordVolumeControl = createSliderControl(
            'chordVolume', 'Volume Acordes', 0, 1, 
            initialSettings.volume || 0.6, 0.05,
            (value) => {
                if (typeof ChordPlaybackEngine !== 'undefined') {
                    // Use enhanced volume mixing for better audio balance
                    if (ChordPlaybackEngine.setAccompanimentVolumeWithMixing) {
                        ChordPlaybackEngine.setAccompanimentVolumeWithMixing(value, true);
                    } else {
                        ChordPlaybackEngine.setAccompanimentVolume(value);
                    }
                }
                if (onSettingsChangeCallback) {
                    onSettingsChangeCallback({ chords: { volume: value } });
                }
            }
        );
        
        const bassVolumeControl = createSliderControl(
            'bassVolume', 'Volume Baixo', 0, 1, 
            initialSettings.bassVolume || 0.4, 0.05,
            (value) => {
                if (typeof ChordPlaybackEngine !== 'undefined') {
                    ChordPlaybackEngine.setBassVolume(value);
                }
                if (onSettingsChangeCallback) {
                    onSettingsChangeCallback({ chords: { bassVolume: value } });
                }
            }
        );
        
        fieldset.appendChild(chordVolumeControl);
        fieldset.appendChild(bassVolumeControl);
        
        // Initialize controls state
        const initialEnabled = enableToggle.checked;
        const chordControls = fieldset.querySelectorAll('select, input[type="range"]');
        chordControls.forEach(control => {
            if (control !== enableToggle) {
                control.disabled = !initialEnabled;
            }
        });
        
        console.log('✓ Chord accompaniment controls created');
        return fieldset;
    }

    function createLinguisticAnalysisSection(initialValues = {}) {
        const fieldset = document.createElement('fieldset');
        const legend = document.createElement('legend');
        legend.textContent = 'Análise Linguística';
        fieldset.appendChild(legend);
        
        // Analysis Mode selector
        const analysisModeContainer = document.createElement('div');
        analysisModeContainer.classList.add('control-group');
        
        const analysisModeLabel = document.createElement('label');
        analysisModeLabel.textContent = 'Modo de Análise:';
        
        const analysisModeSelect = document.createElement('select');
        analysisModeSelect.id = 'analysisMode';
        
        const analysisOptions = [
            { value: 'BASIC', label: 'Básico (Caracteres)' },
            { value: 'GRAMMATICAL', label: 'Gramatical' },
            { value: 'HARMONIC', label: 'Harmônico' },
            { value: 'PHONETIC', label: 'Fonético' },
            { value: 'PROSODIC', label: 'Prosódico' },
            { value: 'COMPLETE', label: 'Completo' }
        ];
        
        analysisOptions.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            if (option.value === (initialValues.analysisMode || 'COMPLETE')) {
                optionElement.selected = true;
            }
            analysisModeSelect.appendChild(optionElement);
        });
        
        analysisModeSelect.addEventListener('change', (e) => {
            if (onSettingsChangeCallback) {
                onSettingsChangeCallback({ analysisMode: e.target.value });
            }
        });
        
        analysisModeContainer.appendChild(analysisModeLabel);
        analysisModeContainer.appendChild(analysisModeSelect);
        
        // Highlight Mode selector
        const highlightModeContainer = document.createElement('div');
        highlightModeContainer.classList.add('control-group');
        
        const highlightModeLabel = document.createElement('label');
        highlightModeLabel.textContent = 'Destaque Visual:';
        
        const highlightModeSelect = document.createElement('select');
        highlightModeSelect.id = 'highlightMode';
        
        const highlightOptions = [
            { value: 'character', label: 'Caractere' },
            { value: 'syllable', label: 'Sílaba' },
            { value: 'word', label: 'Palavra' },
            { value: 'phoneme', label: 'Fonema' }
        ];
        
        highlightOptions.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            if (option.value === (initialValues.highlightMode || 'character')) {
                optionElement.selected = true;
            }
            highlightModeSelect.appendChild(optionElement);
        });
        
        highlightModeSelect.addEventListener('change', (e) => {
            if (onSettingsChangeCallback) {
                onSettingsChangeCallback({ highlightMode: e.target.value });
            }
        });
        
        highlightModeContainer.appendChild(highlightModeLabel);
        highlightModeContainer.appendChild(highlightModeSelect);
        
        // Dialect selector
        const dialectContainer = document.createElement('div');
        dialectContainer.classList.add('control-group');
        
        const dialectLabel = document.createElement('label');
        dialectLabel.textContent = 'Dialeto:';
        
        const dialectSelect = document.createElement('select');
        dialectSelect.id = 'dialectSelect';
        
        const dialectOptions = [
            { value: 'carioca', label: 'Carioca (Rio)' },
            { value: 'paulista', label: 'Paulista (São Paulo)' },
            { value: 'nordestino', label: 'Nordestino' },
            { value: 'gaucho', label: 'Gaúcho (Sul)' }
        ];
        
        dialectOptions.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            if (option.value === (initialValues.dialect || 'carioca')) {
                optionElement.selected = true;
            }
            dialectSelect.appendChild(optionElement);
        });
        
        dialectSelect.addEventListener('change', (e) => {
            if (onSettingsChangeCallback) {
                onSettingsChangeCallback({ dialect: e.target.value });
            }
        });
        
        dialectContainer.appendChild(dialectLabel);
        dialectContainer.appendChild(dialectSelect);
        
        // Add info section about linguistic features
        const infoContainer = document.createElement('div');
        infoContainer.style.fontSize = '12px';
        infoContainer.style.color = '#666';
        infoContainer.style.marginTop = '10px';
        infoContainer.style.padding = '8px';
        infoContainer.style.backgroundColor = '#f9f9f9';
        infoContainer.style.borderRadius = '4px';
        infoContainer.innerHTML = `
            <strong>Recursos Linguísticos:</strong><br>
            • <strong>Completo:</strong> Análise gramatical + harmônica + fonética + prosódica<br>
            • <strong>Destaque:</strong> Mostra visualmente qual texto está tocando<br>
            • <strong>Dialetos:</strong> Suporte a variações regionais do português
        `;
        
        fieldset.appendChild(analysisModeContainer);
        fieldset.appendChild(highlightModeContainer);
        fieldset.appendChild(dialectContainer);
        fieldset.appendChild(infoContainer);
        
        return fieldset;
    }

    /**
     * Creates chord accompaniment controls
     * @param {Object} initialSettings - Initial chord settings
     * @returns {HTMLElement} Chord controls container
     */
    function createChordAccompanimentControls(initialSettings = {}) {
        const fieldset = document.createElement('fieldset');
        const legend = document.createElement('legend');
        legend.textContent = 'Acompanhamento de Acordes 🎵';
        fieldset.appendChild(legend);
        
        const settings = {
            enabled: false,
            pattern: 'block',
            volume: 0.6,
            bassVolume: 0.4,
            progression: 'I-V-vi-IV',
            ...initialSettings
        };
        
        // Enable/Disable toggle
        const enableContainer = document.createElement('div');
        enableContainer.classList.add('control-group');
        
        const enableLabel = document.createElement('label');
        enableLabel.textContent = 'Ativar Acompanhamento:';
        
        const enableCheckbox = document.createElement('input');
        enableCheckbox.type = 'checkbox';
        enableCheckbox.id = 'chordEnabled';
        enableCheckbox.checked = settings.enabled;
        enableCheckbox.addEventListener('change', (e) => {
            if (onSettingsChangeCallback) {
                onSettingsChangeCallback({ 
                    chords: { ...settings, enabled: e.target.checked } 
                });
            }
        });
        
        enableContainer.appendChild(enableLabel);
        enableContainer.appendChild(enableCheckbox);
        fieldset.appendChild(enableContainer);
        
        // Pattern selector
        const patternContainer = document.createElement('div');
        patternContainer.classList.add('control-group');
        
        const patternLabel = document.createElement('label');
        patternLabel.textContent = 'Padrão:';
        
        const patternSelect = document.createElement('select');
        patternSelect.id = 'chordPattern';
        
        const patterns = {
            'block': 'Acordes Blocos',
            'arpeggio': 'Arpejos',
            'strum': 'Dedilhado',
            'broken': 'Acordes Quebrados',
            'waltz': 'Padrão Valsa'
        };
        
        for (const [value, name] of Object.entries(patterns)) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = name;
            if (value === settings.pattern) {
                option.selected = true;
            }
            patternSelect.appendChild(option);
        }
        
        patternSelect.addEventListener('change', (e) => {
            if (onSettingsChangeCallback) {
                onSettingsChangeCallback({ 
                    chords: { ...settings, pattern: e.target.value } 
                });
            }
        });
        
        patternContainer.appendChild(patternLabel);
        patternContainer.appendChild(patternSelect);
        fieldset.appendChild(patternContainer);
        
        // Volume controls
        const volumeContainer = document.createElement('div');
        volumeContainer.classList.add('control-group');
        
        const volumeLabel = document.createElement('label');
        volumeLabel.textContent = 'Volume Acordes:';
        
        const volumeSlider = document.createElement('input');
        volumeSlider.type = 'range';
        volumeSlider.min = '0';
        volumeSlider.max = '1';
        volumeSlider.step = '0.1';
        volumeSlider.value = settings.volume;
        volumeSlider.id = 'chordVolume';
        
        const volumeValue = document.createElement('span');
        volumeValue.textContent = Math.round(settings.volume * 100) + '%';
        
        volumeSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            volumeValue.textContent = Math.round(value * 100) + '%';
            if (onSettingsChangeCallback) {
                onSettingsChangeCallback({ 
                    chords: { ...settings, volume: value } 
                });
            }
        });
        
        volumeContainer.appendChild(volumeLabel);
        volumeContainer.appendChild(volumeSlider);
        volumeContainer.appendChild(volumeValue);
        fieldset.appendChild(volumeContainer);
        
        // Bass volume controls
        const bassVolumeContainer = document.createElement('div');
        bassVolumeContainer.classList.add('control-group');
        
        const bassVolumeLabel = document.createElement('label');
        bassVolumeLabel.textContent = 'Volume Baixo:';
        
        const bassVolumeSlider = document.createElement('input');
        bassVolumeSlider.type = 'range';
        bassVolumeSlider.min = '0';
        bassVolumeSlider.max = '1';
        bassVolumeSlider.step = '0.1';
        bassVolumeSlider.value = settings.bassVolume;
        bassVolumeSlider.id = 'chordBassVolume';
        
        const bassVolumeValue = document.createElement('span');
        bassVolumeValue.textContent = Math.round(settings.bassVolume * 100) + '%';
        
        bassVolumeSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            bassVolumeValue.textContent = Math.round(value * 100) + '%';
            if (onSettingsChangeCallback) {
                onSettingsChangeCallback({ 
                    chords: { ...settings, bassVolume: value } 
                });
            }
        });
        
        bassVolumeContainer.appendChild(bassVolumeLabel);
        bassVolumeContainer.appendChild(bassVolumeSlider);
        bassVolumeContainer.appendChild(bassVolumeValue);
        fieldset.appendChild(bassVolumeContainer);
        
        // Chord progression
        const progressionContainer = document.createElement('div');
        progressionContainer.classList.add('control-group');
        
        const progressionLabel = document.createElement('label');
        progressionLabel.textContent = 'Progressão:';
        
        const progressionSelect = document.createElement('select');
        progressionSelect.id = 'chordProgression';
        
        const progressions = {
            'I-V-vi-IV': 'I-V-vi-IV (Pop Comum)',
            'vi-IV-I-V': 'vi-IV-I-V (Emocional)',
            'I-vi-IV-V': 'I-vi-IV-V (Progressão dos Anos 50)',
            'I-IV-V-I': 'I-IV-V-I (Blues/Rock)',
            'ii-V-I': 'ii-V-I (Jazz)'
        };
        
        for (const [value, name] of Object.entries(progressions)) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = name;
            if (value === settings.progression) {
                option.selected = true;
            }
            progressionSelect.appendChild(option);
        }
        
        progressionSelect.addEventListener('change', (e) => {
            if (onSettingsChangeCallback) {
                onSettingsChangeCallback({ 
                    chords: { ...settings, progression: e.target.value } 
                });
            }
        });
        
        progressionContainer.appendChild(progressionLabel);
        progressionContainer.appendChild(progressionSelect);
        fieldset.appendChild(progressionContainer);
        
        return fieldset;
    }

    return {
        initializeUIControls,
        updateControlValues,
        updateRecentCreationsList
    };
})(); 