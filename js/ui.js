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

        const scaleSelector = createScaleSelector(appConfig.SCALES, currentScale);
        settingsContainer.appendChild(scaleSelectorContainer(scaleSelector));

        const instrumentSelector = createInstrumentSelector(appConfig.INSTRUMENTS, currentInstrument);
        settingsContainer.appendChild(instrumentSelectorContainer(instrumentSelector));

        const eqControls = createEQControls(currentEQ);
        settingsContainer.appendChild(eqControlsContainer(eqControls));

        const modControls = createModulationControls(currentMod);
        settingsContainer.appendChild(modControlsContainer(modControls));
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

    function eqControlsContainer(controls) {
        const fieldset = document.createElement('fieldset');
        const legend = document.createElement('legend');
        legend.textContent = 'Equalizador (EQ)';
        fieldset.appendChild(legend);
        controls.forEach(c => fieldset.appendChild(c));
        return fieldset;
    }

    function modControlsContainer(controls) {
        const fieldset = document.createElement('fieldset');
        const legend = document.createElement('legend');
        legend.textContent = 'Modulação';
        fieldset.appendChild(legend);
        controls.forEach(c => fieldset.appendChild(c));
        return fieldset;
    }

    function createScaleSelector(scales, defaultScale) {
        const select = document.createElement('select');
        select.id = 'scaleSelector';
        for (const scaleName in scales) {
            const option = document.createElement('option');
            option.value = scaleName;
            option.textContent = scaleName.replace(/([A-Z])/g, ' $1').trim(); // Adiciona espaço antes de Maiúsculas
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
        for (const instrumentName in instruments) {
            const option = document.createElement('option');
            option.value = instrumentName;
            option.textContent = instrumentName.charAt(0).toUpperCase() + instrumentName.slice(1);
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

    return {
        initializeUIControls
    };
})(); 