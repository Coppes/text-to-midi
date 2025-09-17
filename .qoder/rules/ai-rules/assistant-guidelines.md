# AI Assistant Rules for Text-to-MIDI Project

## 1. ARCHITECTURAL ENFORCEMENT

### Module Separation (MANDATORY)
- **NEVER** allow cross-module responsibility violations
- `main.js` ONLY handles orchestration and global state
- `ui.js` ONLY handles DOM manipulation and UI events
- `audio.js` ONLY handles Tone.js operations and audio logic
- `config.js` ONLY contains static configuration data

### Code Generation Rules
- Always generate code that follows the modular architecture
- Ensure proper error handling for all Tone.js async operations
- Use ES6+ features consistently (const/let, arrow functions, destructuring)
- Validate that new code doesn't break existing module boundaries

## 2. DEVELOPMENT WORKFLOW ENFORCEMENT

### Before Code Changes
1. **MUST** update roadmap.md if adding new features
2. **MUST** verify the change aligns with current phase objectives
3. **MUST** check existing code for similar patterns before creating new ones

### During Implementation
1. Follow single responsibility principle for all functions
2. Use pure functions where possible
3. Document complex logic and design decisions
4. Ensure proper memory management for audio nodes

### After Implementation
1. **MUST** test across multiple browsers (Chrome, Firefox, Safari)
2. **MUST** verify no performance regressions
3. **MUST** update documentation if public APIs change

## 3. QUALITY ASSURANCE RULES

### Code Review Checklist (MANDATORY)
- [ ] Follows modular architecture strictly
- [ ] Proper error handling for audio operations
- [ ] No memory leaks in audio nodes or DOM elements
- [ ] Performance considerations addressed
- [ ] Documentation updated appropriately
- [ ] Browser compatibility maintained

### Testing Requirements
- Manual testing across target browsers required
- Audio functionality must be tested with different scales/instruments
- UI responsiveness must be verified
- State management (sharing/restoration) must be validated

## 4. FORBIDDEN ACTIONS

### Technology Restrictions
- **NEVER** suggest React, Vue, Angular, or any UI framework
- **NEVER** introduce build tools (Webpack, Vite, Parcel)
- **NEVER** use Web Audio API directly (use Tone.js wrapper)
- **NEVER** add server-side processing

### Architecture Violations
- **NEVER** put DOM manipulation in audio.js or config.js
- **NEVER** put audio logic in ui.js or config.js
- **NEVER** put application state in ui.js or audio.js
- **NEVER** add functions or logic to config.js

## 5. PERFORMANCE REQUIREMENTS

### Audio Performance (CRITICAL)
- Minimize audio latency for real-time feedback
- Dispose of unused audio nodes promptly
- Limit concurrent audio processing to prevent browser overload
- Optimize buffer sizes for low-latency audio

### Memory Management
- Always dispose of Tone.js nodes when not needed
- Prevent DOM element memory leaks
- Monitor and limit simultaneous audio nodes
- Clean up event listeners properly

## 6. ERROR HANDLING STANDARDS

### Audio Context Handling
- Always ensure audio context is started with user gesture
- Gracefully handle audio context failures
- Provide fallbacks for unsupported audio features
- Handle browser-specific audio limitations

### Input Validation
- Sanitize text input for XSS prevention
- Validate URL parameters for shared state
- Handle special characters appropriately
- Provide meaningful error messages to users

## 7. COMMUNICATION RULES

### Code Comments
- Document public functions and their parameters
- Explain complex musical theory implementations
- Record significant architectural decisions
- Include browser compatibility notes where relevant

### Documentation Updates
- Update dev.md for significant changes
- Maintain roadmap.md alignment with implementation
- Keep README.md current with setup instructions
- Document new features in user-facing documentation

## 8. PHASE-BASED DEVELOPMENT

### Current Phase Awareness
- Always check roadmap.md for current phase objectives
- Implement features according to phase priorities
- Don't implement future phase features prematurely
- Ensure current phase completion before advancing

### Feature Implementation Order
1. **Phase 2:** Core functionality (text input, basic instruments)
2. **Phase 3:** Extended features (multiple scales/instruments)
3. **Phase 4:** Advanced features (URL sharing, state restoration)
4. **Phase 5:** Future enhancements (recording, mobile optimization)

---

**Priority Level:** CRITICAL - All rules must be followed  
**Enforcement:** Automatic via AI assistant behavior  
**Updates:** Require team review and roadmap alignment