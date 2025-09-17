# New Features Roadmap - Text-to-MIDI

## PROJECT STATUS & NEXT EVOLUTION

**Current Status**: Production-ready application with advanced Brazilian Portuguese linguistic analysis  
**Next Phase**: Enhanced User Experience & Musical Creativity Features

This document outlines the next generation of features for the text-to-MIDI application.

---

## 🎯 **PHASE 5: ENHANCED VISUAL & MUSICAL FEATURES**

### **Priority Features Overview**
1. **Enhanced Text Highlighting** (90% implemented - needs finalization) ⚠️
2. **Chord Accompaniment Generation** (0% implemented) ⚠️
3. **MIDI Editor Interface** (new feature - comprehensive implementation needed) 🆕

---

## 📍 **FEATURE 1: ENHANCED TEXT HIGHLIGHTING SYSTEM**

**Status**: 90% implemented, needs finalization  
**Files**: `text-highlighter.js`, `style.css`, integrated in `main.js`  
**Priority**: HIGH (finalization needed)

### 1.1 Current Implementation Status

#### ✅ **Already Implemented**:
- Complete highlighting engine with 4 modes (character, syllable, word, phoneme)
- Visual styles for current/upcoming/completed states
- Integration with linguistic analysis engines
- Basic synchronization with audio playback

#### ⚠️ **Needs Completion**:
- **Real-time synchronization** with precise audio timing
- **Performance optimization** for texts > 500 characters  
- **Mobile touch optimization**
- **Advanced highlighting modes** for grammatical/prosodic analysis

### 1.2 Implementation Tasks

#### **Task 1.1: Finalize Real-time Synchronization**
**Duration**: 2-3 days | **Priority**: CRITICAL

```javascript
// Enhanced synchronization in text-highlighter.js
function startHighlightingWithPreciseTiming(sequence, startTime = 0) {
    highlightScheduleIds = [];
    let currentTime = startTime;
    
    sequence.forEach((element, index) => {
        const scheduleId = Tone.Transport.scheduleOnce((time) => {
            highlightElement(index, 'current');
            if (index > 0) highlightElement(index - 1, 'completed');
            if (index < sequence.length - 1) highlightElement(index + 1, 'upcoming');
        }, currentTime);
        
        highlightScheduleIds.push(scheduleId);
        currentTime += Tone.Time(element.duration).toSeconds();
    });
}
```

#### **Task 1.2: Advanced Highlighting Modes**
**Duration**: 3-4 days | **Priority**: HIGH

```javascript
// Enhanced modes for linguistic analysis
const ADVANCED_HIGHLIGHT_MODES = {
    GRAMMATICAL: {
        name: 'Grammatical Classes',
        colorScheme: {
            noun: '#2196F3', verb: '#4CAF50', 
            adjective: '#FF9800', adverb: '#9C27B0'
        }
    },
    PROSODIC: {
        name: 'Prosodic Stress',
        colorScheme: {
            primaryStress: '#F44336',
            secondaryStress: '#FF9800',
            unstressed: '#9E9E9E'
        }
    },
    HARMONIC: {
        name: 'Harmonic Context',
        colorScheme: {
            tonic: '#4CAF50', dominant: '#FF5722', subdominant: '#2196F3'
        }
    }
};
```

#### **Task 1.3: UI Integration**
**Duration**: 2 days | **Priority**: MEDIUM

```javascript
// New highlighting controls in ui.js
function createHighlightingControls(currentMode) {
    const container = document.createElement('div');
    container.className = 'highlighting-controls';
    
    // Mode selector
    const modeSelector = document.createElement('select');
    Object.entries(TextHighlighter.HIGHLIGHT_MODES).forEach(([key, value]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = formatModeName(value);
        modeSelector.appendChild(option);
    });
    
    // Speed control
    const speedControl = createSliderControl(
        'highlightSpeed', 'Highlight Speed', 0.5, 2.0, 1.0, 0.1,
        (value) => TextHighlighter.setHighlightSpeed(value)
    );
    
    container.appendChild(createControlGroup('Highlight Mode:', modeSelector));
    container.appendChild(speedControl);
    return container;
}
```

### 1.3 Success Metrics
- ✅ Visual sync within ±10ms tolerance
- ✅ Smooth performance for 1000+ character texts
- ✅ Real-time mode switching
- ✅ Mobile-optimized controls

---

## 🎼 **FEATURE 2: CHORD ACCOMPANIMENT GENERATION**

**Status**: 60% implemented (harmonic engine exists, needs UI integration)  
**Files**: `harmonic-engine.js`, needs new UI controls  
**Priority**: HIGH (build on existing foundation)

### 2.1 Current Implementation Status

#### ✅ **Already Implemented**:
- Advanced harmonic analysis engine with chord progressions
- Mood-based progression selection
- Bass line generation
- Chord-to-key mapping system

#### ⚠️ **Needs Implementation**:
- **UI controls** for chord accompaniment
- **Real-time chord playback** integration  
- **Accompaniment patterns** (block chords, arpeggios, strumming)
- **Volume mixing** controls

### 2.2 Implementation Tasks

#### **Task 2.1: Chord Playback Engine**
**Duration**: 4-5 days | **Priority**: CRITICAL

```javascript
// New ChordPlaybackEngine in audio.js
const ChordPlaybackEngine = (() => {
    let chordInstrument = null;
    let bassInstrument = null;
    let accompanimentPattern = 'block';
    
    async function initializeChordInstruments() {
        chordInstrument = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.1, decay: 0.3, sustain: 0.8, release: 1.0 }
        }).toDestination();
        
        bassInstrument = new Tone.Synth({
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.8 }
        }).toDestination();
    }
    
    function playChord(chordNotes, duration = '1n', time = '+0', pattern = 'block') {
        if (!chordInstrument) return;
        
        switch (pattern) {
            case 'block':
                chordInstrument.triggerAttackRelease(chordNotes, duration, time);
                break;
            case 'arpeggio':
                chordNotes.forEach((note, index) => {
                    const noteTime = Tone.Time(time).toSeconds() + (index * 0.1);
                    chordInstrument.triggerAttackRelease(note, '8n', noteTime);
                });
                break;
            case 'strum':
                chordNotes.forEach((note, index) => {
                    const noteTime = Tone.Time(time).toSeconds() + (index * 0.05);
                    chordInstrument.triggerAttackRelease(note, duration, noteTime);
                });
                break;
        }
    }
    
    return { initializeChordInstruments, playChord, setAccompanimentPattern };
})();
```

#### **Task 2.2: Chord UI Controls**  
**Duration**: 3-4 days | **Priority**: HIGH

```javascript
// Chord accompaniment controls in ui.js
function createChordAccompanimentControls(initialSettings = {}) {
    const container = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = '🎼 Accompaniment';
    container.appendChild(legend);
    
    // Enable/disable toggle
    const enableToggle = document.createElement('input');
    enableToggle.type = 'checkbox';
    enableToggle.id = 'enableAccompaniment';
    enableToggle.checked = initialSettings.enabled || false;
    
    // Progression selector
    const progressionSelector = document.createElement('select');
    Object.entries(HarmonicEngine.CHORD_PROGRESSIONS).forEach(([key, progression]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = `${progression.name} (${progression.mood})`;
        progressionSelector.appendChild(option);
    });
    
    // Pattern selector
    const patternSelector = document.createElement('select');
    const patterns = [
        { value: 'block', name: 'Block Chords' },
        { value: 'arpeggio', name: 'Arpeggios' },
        { value: 'strum', name: 'Strumming' }
    ];
    patterns.forEach(pattern => {
        const option = document.createElement('option');
        option.value = pattern.value;
        option.textContent = pattern.name;
        patternSelector.appendChild(option);
    });
    
    // Volume control
    const volumeControl = createSliderControl(
        'chordVolume', 'Chord Volume', 0, 1, 0.6, 0.05,
        (value) => ChordPlaybackEngine.setVolume(value)
    );
    
    container.appendChild(createControlGroup('Enable Chords:', enableToggle));
    container.appendChild(createControlGroup('Progression:', progressionSelector));
    container.appendChild(createControlGroup('Pattern:', patternSelector));
    container.appendChild(volumeControl);
    
    return container;
}
```

#### **Task 2.3: Integration with Audio System**
**Duration**: 3 days | **Priority**: HIGH

```javascript
// Enhanced playback with chords in audio.js
function togglePlaybackWithChords(text, scaleName, accompanimentSettings) {
    if (Tone.Transport.state === 'started') {
        stopAllSounds();
        return false;
    }
    
    // Schedule melody
    scheduleText(text, scaleName, AppConfig.NOTE_DURATION, AppConfig.SILENCE_DURATION);
    
    // Schedule chord accompaniment if enabled
    if (accompanimentSettings.enabled) {
        const harmonicAnalysis = HarmonicEngine.debugHarmonicAnalysis(text, scaleName);
        
        scheduleChordAccompaniment(
            harmonicAnalysis.chordSequence, 
            accompanimentSettings.pattern,
            accompanimentSettings.progression
        );
        
        scheduleBassLine(harmonicAnalysis.bassLine);
    }
    
    Tone.Transport.start("+0.1");
    return true;
}
```

### 2.3 Success Metrics
- ✅ Harmonically coherent chord progressions
- ✅ Real-time pattern switching
- ✅ Balanced volume mixing
- ✅ Multiple accompaniment styles

---

## 🎹 **FEATURE 3: MIDI EDITOR INTERFACE**

**Status**: New feature - comprehensive implementation needed  
**Files**: New - `midi-editor.js`, enhanced UI components  
**Priority**: MEDIUM-HIGH (major new feature)

### 3.1 Core Components
1. **Piano Roll Editor** - Visual note editing interface
2. **Note Properties Panel** - Velocity, duration, pitch editing  
3. **Timeline Management** - Time-based navigation
4. **Export/Import System** - MIDI file handling

### 3.2 Implementation Tasks

#### **Task 3.1: Piano Roll Interface**
**Duration**: 7-10 days | **Priority**: CRITICAL

```javascript
// Core MIDI Editor module
const MIDIEditor = (() => {
    class PianoRollEditor {
        constructor(container, options = {}) {
            this.container = container;
            this.pixelsPerBeat = options.pixelsPerBeat || 100;
            this.noteHeight = options.noteHeight || 20;
            this.totalBeats = options.totalBeats || 16;
            this.currentSequence = [];
            this.selectedNotes = new Set();
            
            this.initializeEditor();
        }
        
        initializeEditor() {
            this.createEditorDOM();
            this.setupEventListeners();
            this.renderPianoKeys();
            this.renderTimelineGrid();
        }
        
        createEditorDOM() {
            this.container.innerHTML = `
                <div class="midi-editor">
                    <div class="editor-header">
                        <div class="editor-controls">
                            <button id="playEditorSequence">▶ Play</button>
                            <button id="stopEditorSequence">⏹ Stop</button>
                            <button id="clearEditor">🗑 Clear</button>
                            <button id="exportMIDI">💾 Export</button>
                        </div>
                        <div class="editor-info">
                            <span id="noteCount">0 notes</span>
                        </div>
                    </div>
                    <div class="editor-main">
                        <div class="piano-keys" id="pianoKeys"></div>
                        <div class="piano-roll-container">
                            <div class="timeline-ruler" id="timelineRuler"></div>
                            <div class="note-grid" id="noteGrid"></div>
                        </div>
                    </div>
                    <div class="note-properties" id="noteProperties">
                        <label>Velocity: <input type="range" id="noteVelocity" min="0" max="127" value="80"></label>
                        <label>Duration: <select id="noteDuration">
                            <option value="16n">1/16</option>
                            <option value="8n" selected>1/8</option>
                            <option value="4n">1/4</option>
                            <option value="2n">1/2</option>
                        </select></label>
                    </div>
                </div>
            `;
        }
        
        addNote(midiNote, startTime, duration, velocity = 80) {
            const noteElement = document.createElement('div');
            noteElement.className = 'midi-note';
            noteElement.dataset.midiNote = midiNote;
            noteElement.dataset.startTime = startTime;
            noteElement.dataset.duration = duration;
            noteElement.dataset.velocity = velocity;
            
            // Position and style
            const left = startTime * this.pixelsPerBeat;
            const top = (84 - midiNote) * this.noteHeight; // C6 = 84
            const width = Tone.Time(duration).toSeconds() * this.pixelsPerBeat;
            
            noteElement.style.left = `${left}px`;
            noteElement.style.top = `${top}px`;
            noteElement.style.width = `${width}px`;
            noteElement.style.height = `${this.noteHeight - 2}px`;
            noteElement.style.backgroundColor = this.getVelocityColor(velocity);
            
            this.setupNoteEvents(noteElement);
            document.getElementById('noteGrid').appendChild(noteElement);
            
            this.currentSequence.push({
                midiNote: parseInt(midiNote),
                startTime: parseFloat(startTime),
                duration: duration,
                velocity: parseInt(velocity),
                element: noteElement
            });
            
            this.updateNoteCount();
        }
        
        setupNoteEvents(noteElement) {
            // Drag and resize functionality
            let isDragging = false;
            let isResizing = false;
            
            noteElement.addEventListener('mousedown', (e) => {
                const rect = noteElement.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                
                if (clickX > rect.width - 10) {
                    isResizing = true;
                } else {
                    isDragging = true;
                }
                
                this.selectNote(noteElement);
            });
            
            noteElement.addEventListener('dblclick', () => {
                this.deleteNote(noteElement);
            });
        }
        
        loadSequenceFromText(textSequence) {
            this.clearEditor();
            let currentTime = 0;
            
            textSequence.forEach(note => {
                if (note.note) {
                    const midiNote = Tone.Frequency(note.note).toMidi();
                    this.addNote(midiNote, currentTime, note.duration || '8n', note.velocity || 80);
                }
                currentTime += Tone.Time(note.duration || '8n').toSeconds();
            });
        }
        
        exportSequence() {
            return this.currentSequence.map(note => ({
                note: Tone.Frequency(note.midiNote, "midi").toNote(),
                midiNote: note.midiNote,
                startTime: note.startTime,
                duration: note.duration,
                velocity: note.velocity
            }));
        }
    }
    
    return { createEditor: (container, options) => new PianoRollEditor(container, options) };
})();
```

#### **Task 3.2: MIDI Export System**
**Duration**: 4-5 days | **Priority**: HIGH

```javascript
// MIDI file export functionality
const MIDIExporter = (() => {
    function exportToMIDI(sequence, filename = 'text-to-midi-export.mid') {
        // Create MIDI data structure
        const midiData = {
            header: { format: 1, tracks: 1, ticksPerQuarter: 480 },
            tracks: []
        };
        
        const track = [];
        
        // Add tempo
        track.push({ deltaTime: 0, type: 'setTempo', microsecondsPerQuarter: 500000 });
        
        // Add notes
        sequence.forEach(note => {
            const startTicks = Math.round(note.startTime * 480);
            const duration = Math.round(Tone.Time(note.duration).toSeconds() * 480);
            
            track.push({
                deltaTime: startTicks,
                type: 'noteOn',
                channel: 0,
                noteNumber: note.midiNote,
                velocity: note.velocity
            });
            
            track.push({
                deltaTime: duration,
                type: 'noteOff', 
                channel: 0,
                noteNumber: note.midiNote,
                velocity: 0
            });
        });
        
        midiData.tracks.push(track);
        
        // Convert to binary and download
        const midiBytes = encodeMIDI(midiData);
        const blob = new Blob([midiBytes], { type: 'audio/midi' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    return { exportToMIDI };
})();
```

#### **Task 3.3: Editor Integration**
**Duration**: 3-4 days | **Priority**: MEDIUM

```javascript
// Integration with main application
function initializeMIDIEditor() {
    const editorContainer = document.createElement('div');
    editorContainer.id = 'midiEditorContainer';
    editorContainer.style.display = 'none';
    
    // Add editor toggle button
    const editorToggle = document.createElement('button');
    editorToggle.textContent = '🎹 Open MIDI Editor';
    editorToggle.addEventListener('click', () => {
        toggleMIDIEditor();
    });
    
    // Add to main interface
    document.querySelector('.controls-main-buttons').appendChild(editorToggle);
    document.querySelector('.container').appendChild(editorContainer);
}

function toggleMIDIEditor() {
    const container = document.getElementById('midiEditorContainer');
    
    if (container.style.display === 'none') {
        container.style.display = 'block';
        
        const editor = MIDIEditor.createEditor(container);
        
        // Load current text sequence
        const currentText = document.getElementById('textInput').value;
        if (currentText) {
            const sequence = generateSequenceFromText(currentText);
            editor.loadSequenceFromText(sequence);
        }
    } else {
        container.style.display = 'none';
    }
}
```

### 3.3 Success Metrics
- ✅ Visual note editing with drag & drop
- ✅ MIDI file export functionality
- ✅ Integration with text-generated sequences
- ✅ Real-time preview and playback

---

## 📅 **IMPLEMENTATION TIMELINE**

### **Phase 5.1: Text Highlighting Finalization (1-2 weeks)**
- Week 1: Real-time sync + advanced modes
- Week 2: Performance optimization + UI integration

### **Phase 5.2: Chord Accompaniment (2-3 weeks)**  
- Week 1-2: Chord playback engine + UI controls
- Week 3: Audio system integration + testing

### **Phase 5.3: MIDI Editor (3-4 weeks)**
- Week 1-2: Piano roll interface
- Week 3: Export system + file handling
- Week 4: Integration + polish

### **Total Estimated Duration: 6-9 weeks**

---

## 🎯 **SUCCESS CRITERIA**

### **Feature Completion Metrics**
- ✅ Text highlighting synchronized within 10ms
- ✅ Chord accompaniment with 4+ progression types
- ✅ MIDI editor with full note editing capabilities
- ✅ Export functionality for standard MIDI files

### **User Experience Metrics**
- ✅ Intuitive interface for all new features
- ✅ Seamless integration with existing functionality  
- ✅ Mobile-responsive design for all components
- ✅ Professional-quality visual feedback

### **Technical Metrics**
- ✅ No performance degradation with new features
- ✅ Cross-browser compatibility maintained
- ✅ Modular code architecture preserved
- ✅ Comprehensive error handling

---

**Document Version:** 1.0  
**Created:** Current Session  
**Status:** Ready for Implementation  
**Next Review:** After Phase 5.1 completion