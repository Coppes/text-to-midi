// Chord Integration Test Suite
const ChordIntegrationTest = (() => {
    
    /**
     * Tests the complete chord accompaniment integration
     */
    function runChordIntegrationTests() {
        console.log('🎼 Starting Chord Integration Tests');
        console.log('=' .repeat(50));
        
        const results = {
            timestamp: new Date().toISOString(),
            tests: {},
            summary: { passed: 0, failed: 0, total: 0 }
        };
        
        try {
            // Test 1: Chord Engine Availability
            results.tests.engineAvailability = testChordEngineAvailability();
            
            // Test 2: Chord Initialization
            results.tests.initialization = testChordInitialization();
            
            // Test 3: Volume Mixing
            results.tests.volumeMixing = testVolumeMixing();
            
            // Test 4: Pattern Integration
            results.tests.patternIntegration = testPatternIntegration();
            
            // Test 5: Harmonic Analysis Integration
            results.tests.harmonicIntegration = testHarmonicAnalysisIntegration();
            
            // Test 6: UI Controls Integration
            results.tests.uiIntegration = testUIControlsIntegration();
            
            // Calculate summary
            Object.values(results.tests).forEach(test => {
                results.summary.total++;
                if (test.passed) {
                    results.summary.passed++;
                } else {
                    results.summary.failed++;
                }
            });
            
            // Final results
            const passRate = (results.summary.passed / results.summary.total * 100).toFixed(1);
            console.log(`\n🎯 Test Results: ${results.summary.passed}/${results.summary.total} passed (${passRate}%)`);
            
            if (results.summary.failed > 0) {
                console.warn('⚠️  Some tests failed. Check individual test results.');
            } else {
                console.log('✅ All chord integration tests passed!');
            }
            
            return results;
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
            results.error = error.message;
            return results;
        }
    }
    
    /**
     * Test chord engine availability
     */
    function testChordEngineAvailability() {
        const test = { name: 'Chord Engine Availability', passed: false, details: {} };
        
        try {
            // Check if ChordPlaybackEngine is available
            test.details.engineLoaded = typeof ChordPlaybackEngine !== 'undefined';
            
            if (test.details.engineLoaded) {
                // Check essential methods
                const requiredMethods = [
                    'initializeChordInstruments',
                    'playChord',
                    'setAccompanimentPattern',
                    'setAccompanimentVolume',
                    'scheduleChordAccompaniment'
                ];
                
                test.details.methodsAvailable = requiredMethods.every(method => 
                    typeof ChordPlaybackEngine[method] === 'function'
                );
                
                // Check constants
                test.details.constantsAvailable = !!(
                    ChordPlaybackEngine.ACCOMPANIMENT_PATTERNS &&
                    ChordPlaybackEngine.CHORD_VOICINGS
                );
                
                test.passed = test.details.methodsAvailable && test.details.constantsAvailable;
            }
            
            console.log(test.passed ? '✅' : '❌', test.name, test.details);
            
        } catch (error) {
            test.error = error.message;
            console.log('❌', test.name, 'Error:', error.message);
        }
        
        return test;
    }
    
    /**
     * Test chord initialization
     */
    function testChordInitialization() {
        const test = { name: 'Chord Initialization', passed: false, details: {} };
        
        try {
            if (typeof ChordPlaybackEngine !== 'undefined') {
                // Test initialization state
                test.details.initialState = ChordPlaybackEngine.getState();
                
                // Test initialization method
                const initPromise = ChordPlaybackEngine.initializeChordInstruments();
                test.details.initMethodWorks = initPromise instanceof Promise;
                
                test.passed = test.details.initMethodWorks;
            } else {
                test.details.error = 'ChordPlaybackEngine not available';
            }
            
            console.log(test.passed ? '✅' : '❌', test.name, test.details);
            
        } catch (error) {
            test.error = error.message;
            console.log('❌', test.name, 'Error:', error.message);
        }
        
        return test;
    }
    
    /**
     * Test volume mixing functionality
     */
    function testVolumeMixing() {
        const test = { name: 'Volume Mixing', passed: false, details: {} };
        
        try {
            if (typeof ChordPlaybackEngine !== 'undefined') {
                // Test basic volume setting
                const basicVolumeResult = ChordPlaybackEngine.setAccompanimentVolume(0.5);
                test.details.basicVolumeWorks = basicVolumeResult;
                
                // Test enhanced volume mixing if available
                if (ChordPlaybackEngine.setAccompanimentVolumeWithMixing) {
                    const enhancedVolumeResult = ChordPlaybackEngine.setAccompanimentVolumeWithMixing(0.6, true);
                    test.details.enhancedVolumeWorks = enhancedVolumeResult;
                } else {
                    test.details.enhancedVolumeWorks = false;
                    test.details.note = 'Enhanced volume mixing not available';
                }
                
                // Test bass volume
                const bassVolumeResult = ChordPlaybackEngine.setBassVolume(0.4);
                test.details.bassVolumeWorks = bassVolumeResult;
                
                test.passed = test.details.basicVolumeWorks && test.details.bassVolumeWorks;
            } else {
                test.details.error = 'ChordPlaybackEngine not available';
            }
            
            console.log(test.passed ? '✅' : '❌', test.name, test.details);
            
        } catch (error) {
            test.error = error.message;
            console.log('❌', test.name, 'Error:', error.message);
        }
        
        return test;
    }
    
    /**
     * Test pattern integration
     */
    function testPatternIntegration() {
        const test = { name: 'Pattern Integration', passed: false, details: {} };
        
        try {
            if (typeof ChordPlaybackEngine !== 'undefined') {
                // Test pattern setting
                const patterns = ['block', 'arpeggio', 'strum'];
                test.details.patternResults = {};
                
                patterns.forEach(pattern => {
                    const result = ChordPlaybackEngine.setAccompanimentPattern(pattern);
                    test.details.patternResults[pattern] = result;
                });
                
                // Check if all patterns work
                test.details.allPatternsWork = Object.values(test.details.patternResults).every(result => result);
                
                // Test current pattern getter
                test.details.currentPattern = ChordPlaybackEngine.currentPattern;
                test.details.hasCurrentPattern = typeof test.details.currentPattern === 'string';
                
                test.passed = test.details.allPatternsWork && test.details.hasCurrentPattern;
            } else {
                test.details.error = 'ChordPlaybackEngine not available';
            }
            
            console.log(test.passed ? '✅' : '❌', test.name, test.details);
            
        } catch (error) {
            test.error = error.message;
            console.log('❌', test.name, 'Error:', error.message);
        }
        
        return test;
    }
    
    /**
     * Test harmonic analysis integration
     */
    function testHarmonicAnalysisIntegration() {
        const test = { name: 'Harmonic Analysis Integration', passed: false, details: {} };
        
        try {
            // Test if HarmonicEngine is available
            test.details.harmonicEngineAvailable = typeof HarmonicEngine !== 'undefined';
            
            if (test.details.harmonicEngineAvailable) {
                // Test harmonic analysis
                const testText = "Esta é uma música feliz e alegre";
                const harmonicAnalysis = HarmonicEngine.debugHarmonicAnalysis(testText, 'C');
                
                test.details.harmonicAnalysisWorks = !!(
                    harmonicAnalysis &&
                    harmonicAnalysis.chordSequence &&
                    harmonicAnalysis.bassLine
                );
                
                test.details.chordSequenceLength = harmonicAnalysis.chordSequence ? harmonicAnalysis.chordSequence.length : 0;
                test.details.bassLineLength = harmonicAnalysis.bassLine ? harmonicAnalysis.bassLine.length : 0;
                
                test.passed = test.details.harmonicAnalysisWorks;
            } else {
                test.details.error = 'HarmonicEngine not available';
                test.passed = false; // This is expected to fail if harmonic engine isn't loaded
            }
            
            console.log(test.passed ? '✅' : '❌', test.name, test.details);
            
        } catch (error) {
            test.error = error.message;
            console.log('❌', test.name, 'Error:', error.message);
        }
        
        return test;
    }
    
    /**
     * Test UI controls integration
     */
    function testUIControlsIntegration() {
        const test = { name: 'UI Controls Integration', passed: false, details: {} };
        
        try {
            // Check if chord controls function exists
            test.details.controlsFunctionExists = typeof createChordAccompanimentControls === 'function';
            
            if (test.details.controlsFunctionExists) {
                // Test creating controls (this should not throw an error)
                const testSettings = {
                    enabled: false,
                    pattern: 'block',
                    volume: 0.6,
                    bassVolume: 0.4
                };
                
                const controls = createChordAccompanimentControls(testSettings);
                test.details.controlsCreated = !!(controls && controls.nodeType === 1); // Check if it's a DOM element
                
                // Check for expected control elements
                if (test.details.controlsCreated) {
                    test.details.hasEnableToggle = !!controls.querySelector('#enableChordAccompaniment');
                    test.details.hasPatternSelector = !!controls.querySelector('#chordPatternSelector');
                    test.details.hasVolumeControls = !!controls.querySelector('#chordVolume');
                }
                
                test.passed = test.details.controlsCreated && test.details.hasEnableToggle;
            } else {
                test.details.error = 'createChordAccompanimentControls function not available';
            }
            
            console.log(test.passed ? '✅' : '❌', test.name, test.details);
            
        } catch (error) {
            test.error = error.message;
            console.log('❌', test.name, 'Error:', error.message);
        }
        
        return test;
    }
    
    // Export public interface
    return {
        runChordIntegrationTests,
        testChordEngineAvailability,
        testChordInitialization,
        testVolumeMixing,
        testPatternIntegration,
        testHarmonicAnalysisIntegration,
        testUIControlsIntegration
    };
})();

// Auto-run tests if in development mode
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log('🧪 Development mode detected - Chord integration tests available');
    console.log('Run ChordIntegrationTest.runChordIntegrationTests() to test chord system');
}