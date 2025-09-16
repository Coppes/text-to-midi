const TouchHandler = (() => {
    let isMobile = false;
    let touchStartTime = 0;
    let isTouch = false;

    function detectMobile() {
        const userAgent = navigator.userAgent.toLowerCase();
        const mobileKeywords = ['mobile', 'iphone', 'ipod', 'android', 'blackberry', 'nokia', 'opera mini', 'windows mobile', 'windows phone', 'iemobile'];
        
        isMobile = mobileKeywords.some(keyword => userAgent.includes(keyword)) || 
                   window.innerWidth <= 768 ||
                   ('ontouchstart' in window) ||
                   (navigator.maxTouchPoints > 0);
        
        console.log('Device detected as mobile:', isMobile);
        return isMobile;
    }

    function addMobileClass() {
        if (isMobile) {
            document.body.classList.add('mobile-device');
        }
    }

    function initializeTouchEvents() {
        if (!isMobile) return;

        // Add touch feedback to buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            addTouchFeedback(button);
        });

        // Add touch feedback to sliders
        const sliders = document.querySelectorAll('input[type="range"]');
        sliders.forEach(slider => {
            addSliderTouchFeedback(slider);
        });

        // Prevent double-tap zoom on control elements
        const controlElements = document.querySelectorAll('button, input, select');
        controlElements.forEach(element => {
            preventDoubleTabZoom(element);
        });

        // Handle textarea on mobile
        const textarea = document.getElementById('textInput');
        if (textarea) {
            handleTextareaOnMobile(textarea);
        }

        console.log('Touch events initialized for mobile');
    }

    function addTouchFeedback(button) {
        let touchStartTime = 0;

        button.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            button.classList.add('touch-active');
            
            // Provide haptic feedback if available
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
        }, { passive: true });

        button.addEventListener('touchend', (e) => {
            setTimeout(() => {
                button.classList.remove('touch-active');
            }, 150);
            
            // Prevent ghost clicks if touch was too quick
            const touchDuration = Date.now() - touchStartTime;
            if (touchDuration < 50) {
                e.preventDefault();
            }
        }, { passive: false });

        button.addEventListener('touchcancel', () => {
            button.classList.remove('touch-active');
        });
    }

    function addSliderTouchFeedback(slider) {
        let isDragging = false;

        slider.addEventListener('touchstart', (e) => {
            isDragging = true;
            slider.classList.add('touch-active');
            
            // Provide haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate(5);
            }
        }, { passive: true });

        slider.addEventListener('touchmove', (e) => {
            if (isDragging) {
                // Provide subtle haptic feedback during drag
                if (navigator.vibrate && Math.random() < 0.1) {
                    navigator.vibrate(2);
                }
            }
        }, { passive: true });

        slider.addEventListener('touchend', () => {
            isDragging = false;
            setTimeout(() => {
                slider.classList.remove('touch-active');
            }, 100);
        });

        slider.addEventListener('touchcancel', () => {
            isDragging = false;
            slider.classList.remove('touch-active');
        });
    }

    function preventDoubleTabZoom(element) {
        let lastTouchEnd = 0;
        
        element.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
    }

    function handleTextareaOnMobile(textarea) {
        // Auto-resize textarea on mobile
        textarea.addEventListener('input', () => {
            if (isMobile) {
                textarea.style.height = 'auto';
                textarea.style.height = Math.max(120, textarea.scrollHeight) + 'px';
            }
        });

        // Handle virtual keyboard
        let initialViewportHeight = window.innerHeight;
        
        textarea.addEventListener('focus', () => {
            if (isMobile) {
                // Add class to handle virtual keyboard
                document.body.classList.add('keyboard-open');
                
                // Scroll textarea into view
                setTimeout(() => {
                    textarea.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }, 300);
            }
        });

        textarea.addEventListener('blur', () => {
            if (isMobile) {
                document.body.classList.remove('keyboard-open');
            }
        });

        // Handle viewport changes (keyboard show/hide)
        window.addEventListener('resize', () => {
            if (isMobile) {
                const currentHeight = window.innerHeight;
                const heightDifference = initialViewportHeight - currentHeight;
                
                if (heightDifference > 150) {
                    // Keyboard is likely open
                    document.body.classList.add('keyboard-open');
                } else {
                    // Keyboard is likely closed
                    document.body.classList.remove('keyboard-open');
                }
            }
        });
    }

    function optimizeForMobile() {
        if (!isMobile) return;

        // Add viewport meta tag if not present
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
            viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            document.head.appendChild(viewportMeta);
        }
        viewportMeta.content = 'width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1.0';

        // Prevent text size adjustment
        document.body.style.webkitTextSizeAdjust = '100%';
        document.body.style.textSizeAdjust = '100%';

        // Improve touch scrolling
        document.body.style.webkitOverflowScrolling = 'touch';
        document.body.style.overflowScrolling = 'touch';
    }

    function handleOrientationChange() {
        if (!isMobile) return;

        window.addEventListener('orientationchange', () => {
            // Handle orientation change
            setTimeout(() => {
                // Recalculate layout
                window.scrollTo(0, 0);
                
                // Trigger resize events
                window.dispatchEvent(new Event('resize'));
            }, 500);
        });
    }

    function init() {
        detectMobile();
        addMobileClass();
        optimizeForMobile();
        handleOrientationChange();
        
        // Initialize touch events after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeTouchEvents);
        } else {
            initializeTouchEvents();
        }
    }

    // Public interface
    return {
        init,
        detectMobile,
        addTouchFeedback,
        get isMobile() { return isMobile; }
    };
})();

// Initialize touch handling
TouchHandler.init();