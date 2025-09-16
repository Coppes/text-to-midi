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

        const modControls = createModulationControls(currentMod);
        settingsContainer.appendChild(modControlsContainer(modControls));
        
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

    return {
        initializeUIControls,
        updateControlValues,
        updateRecentCreationsList
    };
})(); 