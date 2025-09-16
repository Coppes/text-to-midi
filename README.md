# Text-to-MIDI Experimental Website

A real-time text-to-MIDI converter that transforms typed text into musical sequences using web audio technology.

## 🎵 Features

### MVP (Currently Implemented)
- **Real-time Audio Feedback**: Each typed character plays a corresponding musical note
- **Multiple Musical Scales**: C Major, G Major, A Minor Pentatonic, and Chromatic
- **Multiple Instruments**: Piano (Sampler), Synthesizer Lead, Guitar (Sampler)
- **Play/Pause Functionality**: Play back entire text as a musical sequence
- **Audio Effects**: 3-band EQ and modulation controls (Vibrato/Tremolo)
- **URL Sharing**: Share your musical creations via unique URLs
- **Cross-browser Support**: Works on Chrome, Firefox, Safari, and Edge

### Key Benefits
- **No Backend Required**: Pure client-side processing
- **Low Latency**: Real-time feedback with <50ms response time
- **Accessible**: Works in any modern web browser
- **Shareable**: Create and share musical compositions via URLs

## 🚀 Quick Start

### Prerequisites
- Modern web browser with Web Audio API support
- Python 3 (for local development server)

### Running Locally

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd text-to-midi
   ```

2. **Start the development server**
   ```bash
   # Using Python (recommended for WSL/Linux)
   python3 -m http.server 8080
   
   # Or using npm (if Node.js is available)
   npm start
   ```

3. **Open in browser**
   Navigate to `http://localhost:8080`

### First Use
1. Click anywhere on the page or start typing to initialize audio
2. Type text and hear corresponding musical notes
3. Use controls to change scales, instruments, and audio effects
4. Click "Play" to hear your complete text as a musical sequence
5. Use "Share" to copy a URL that preserves your creation

## 🎹 How It Works

### Text-to-Music Mapping
- **Letters**: Mapped to musical notes based on selected scale
- **Numbers**: Additional octave range for more variety
- **Spaces**: Create musical pauses/rests
- **Unmapped Characters**: Ignored (no sound)

### Musical Scales Available
- **C Major**: Traditional major scale (C, D, E, F, G, A, B)
- **G Major**: Major scale starting on G (G, A, B, C, D, E, F#)
- **A Minor Pentatonic**: Five-note scale (A, C, D, E, G)
- **Chromatic**: All 12 semitones for maximum expression

### Instruments
- **Piano**: High-quality sampled piano sounds
- **Synth Lead**: Electronic synthesizer with rich harmonics
- **Guitar**: Acoustic guitar samples

## 🔧 Technical Architecture

### Frontend Stack
- **HTML5**: Semantic structure and Web Audio API
- **CSS3**: Responsive styling and visual feedback
- **Vanilla JavaScript**: ES6+ with modular architecture
- **Tone.js**: Professional Web Audio framework

### Code Structure
```
text-to-midi/
├── index.html          # Main application page
├── style.css           # Visual styling and responsive design
├── js/
│   ├── main.js        # Application orchestration and state management
│   ├── ui.js          # DOM manipulation and user interface
│   ├── audio.js       # Tone.js integration and audio processing
│   └── config.js      # Musical scales, instruments, and settings
├── roadmap.md         # Development roadmap and feature planning
├── .qoder-rules.md    # Project development rules and standards
└── README.md          # This documentation
```

### Module Responsibilities
- **main.js**: Event coordination, state management, URL handling
- **ui.js**: Dynamic UI generation, control event handling
- **audio.js**: Audio engine, instrument loading, effect processing
- **config.js**: Static data (scales, instruments, default settings)

## 🎛️ User Interface

### Main Controls
- **Text Area**: Type your text here for conversion
- **Play/Pause**: Control playback of the complete sequence
- **Share**: Generate and copy shareable URLs

### Settings Panel
- **Scale Selector**: Choose musical scale for note mapping  
- **Instrument Selector**: Switch between available instruments
- **Equalizer**: 3-band EQ (Bass, Mid, Treble) adjustment
- **Modulation**: Vibrato and Tremolo effect controls

## 🌐 Browser Compatibility

### Fully Supported
- **Chrome** 66+ (recommended)
- **Firefox** 60+
- **Safari** 11.1+
- **Edge** 79+

### Requirements
- Web Audio API support
- ES6 JavaScript features
- Modern clipboard API (for sharing)

### Known Limitations
- Mobile browsers may have audio latency variations
- Safari requires user interaction before audio playback
- Some older browsers may need fallback clipboard methods

## 📱 Usage Tips

### For Best Experience
1. **Use headphones** to avoid audio feedback loops
2. **Click/tap first** to ensure audio context is initialized
3. **Try different scales** to find your preferred sound
4. **Experiment with effects** to customize your musical style
5. **Share interesting combinations** using the URL feature

### Troubleshooting
- **No sound?** Click anywhere on the page to enable audio
- **Laggy response?** Try refreshing the page and clicking before typing
- **Sharing not working?** Use a modern browser with clipboard API support

## 🗺️ Development Roadmap

### Phase 2: MVP ✅ (Current)
- Basic text-to-MIDI conversion
- Multiple scales and instruments
- Real-time feedback and playback
- URL sharing functionality

### Phase 3: Enhanced Features (Next)
- Additional musical scales and modes
- More instrument options and effects
- Rhythm and timing variations
- Mobile responsiveness improvements

### Phase 4: Advanced Features (Future)
- MIDI file export capabilities
- Audio recording and playback
- Advanced music theory implementations
- Collaborative sharing features

## 🤝 Contributing

This project follows strict development standards outlined in `.qoder-rules.md`. Key principles:

- **Modular Architecture**: Maintain separation of concerns
- **Vanilla JavaScript**: No UI frameworks
- **Performance First**: Optimize for low-latency audio
- **Cross-browser**: Support all modern browsers
- **Documentation**: Keep README and code comments updated

## 📄 License

This project is experimental and educational. Feel free to explore, learn, and adapt the code for your own musical experiments.

## 🎼 Credits

- **Tone.js**: Web Audio framework by Yotam Mann
- **Audio Samples**: Various creative commons sources
- **Inspiration**: Interactive music creation and algorithmic composition

---

**Ready to make music with text? Start typing and let the melodies flow! 🎹🎵**