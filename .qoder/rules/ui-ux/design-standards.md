# UI/UX Design Rules and Standards

## 1. DESIGN PRINCIPLES

### Visual Hierarchy (MANDATORY)
```css
/* Primary elements - highest visual weight */
.primary-action {
    background: #007bff;
    color: white;
    font-size: 1.2rem;
    font-weight: 600;
    padding: 1rem 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,123,255,0.3);
}

/* Secondary elements - medium visual weight */
.secondary-action {
    background: transparent;
    color: #007bff;
    border: 2px solid #007bff;
    font-size: 1rem;
    padding: 0.75rem 1.5rem;
}

/* Tertiary elements - lowest visual weight */
.tertiary-action {
    background: none;
    color: #6c757d;
    border: none;
    font-size: 0.9rem;
    text-decoration: underline;
}
```

### Color System (MANDATORY)
```css
:root {
    /* Primary brand colors */
    --primary-blue: #007bff;
    --primary-dark: #0056b3;
    --primary-light: #66b3ff;
    
    /* Semantic colors */
    --success-green: #28a745;
    --warning-yellow: #ffc107;
    --error-red: #dc3545;
    --info-cyan: #17a2b8;
    
    /* Neutral colors */
    --neutral-100: #f8f9fa;
    --neutral-200: #e9ecef;
    --neutral-300: #dee2e6;
    --neutral-500: #6c757d;
    --neutral-700: #495057;
    --neutral-900: #212529;
    
    /* Text highlighting colors */
    --highlight-current: #ffeb3b;
    --highlight-upcoming: #2196f3;
    --highlight-completed: #4caf50;
}
```

### Typography Scale
```css
:root {
    /* Font families */
    --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-mono: 'Fira Code', 'Courier New', monospace;
    
    /* Type scale */
    --text-xs: 0.75rem;    /* 12px */
    --text-sm: 0.875rem;   /* 14px */
    --text-base: 1rem;     /* 16px */
    --text-lg: 1.125rem;   /* 18px */
    --text-xl: 1.25rem;    /* 20px */
    --text-2xl: 1.5rem;    /* 24px */
    --text-3xl: 1.875rem;  /* 30px */
    --text-4xl: 2.25rem;   /* 36px */
    
    /* Line heights */
    --leading-tight: 1.25;
    --leading-normal: 1.5;
    --leading-relaxed: 1.75;
}
```

## 2. LAYOUT STANDARDS

### Responsive Grid System
```css
/* Container widths */
.container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

/* Responsive breakpoints */
@media (min-width: 576px) { .container { max-width: 540px; } }
@media (min-width: 768px) { .container { max-width: 720px; } }
@media (min-width: 992px) { .container { max-width: 960px; } }
@media (min-width: 1200px) { .container { max-width: 1140px; } }

/* Flexbox layout patterns */
.flex-row { display: flex; flex-direction: row; }
.flex-col { display: flex; flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.justify-center { justify-content: center; }
.items-center { align-items: center; }
.flex-1 { flex: 1; }
```

### Spacing System (8px Grid)
```css
:root {
    --space-1: 0.25rem;   /* 4px */
    --space-2: 0.5rem;    /* 8px */
    --space-3: 0.75rem;   /* 12px */
    --space-4: 1rem;      /* 16px */
    --space-5: 1.25rem;   /* 20px */
    --space-6: 1.5rem;    /* 24px */
    --space-8: 2rem;      /* 32px */
    --space-10: 2.5rem;   /* 40px */
    --space-12: 3rem;     /* 48px */
    --space-16: 4rem;     /* 64px */
}

/* Consistent spacing classes */
.p-4 { padding: var(--space-4); }
.m-4 { margin: var(--space-4); }
.mb-6 { margin-bottom: var(--space-6); }
.mt-8 { margin-top: var(--space-8); }
```

## 3. COMPONENT DESIGN STANDARDS

### Form Elements (MANDATORY)
```css
/* Text input styling */
.form-input {
    width: 100%;
    padding: var(--space-3) var(--space-4);
    border: 2px solid var(--neutral-300);
    border-radius: 8px;
    font-size: var(--text-base);
    font-family: var(--font-mono);
    line-height: var(--leading-normal);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-input:focus {
    outline: none;
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-input:invalid {
    border-color: var(--error-red);
}

/* Consistent button styling */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-3) var(--space-6);
    border: none;
    border-radius: 8px;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-primary {
    background: var(--primary-blue);
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: var(--primary-dark);
    transform: translateY(-1px);
}
```

### Control Panels
```css
/* Audio control panel */
.audio-controls {
    display: flex;
    gap: var(--space-4);
    align-items: center;
    padding: var(--space-4);
    background: var(--neutral-100);
    border-radius: 12px;
    border: 1px solid var(--neutral-200);
}

/* Slider styling */
.slider {
    -webkit-appearance: none;
    width: 100%;
    height: 8px;
    border-radius: 4px;
    background: var(--neutral-200);
    outline: none;
}

.slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--primary-blue);
    cursor: pointer;
    transition: background 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
    background: var(--primary-dark);
}
```

## 4. INTERACTION PATTERNS

### Visual Feedback System (MANDATORY)
```css
/* Text highlighting states */
.text-segment {
    display: inline;
    padding: 2px 4px;
    border-radius: 4px;
    transition: all 0.3s ease;
    position: relative;
}

.text-segment--current {
    background-color: var(--highlight-current);
    animation: pulse 1s infinite;
    box-shadow: 0 0 8px rgba(255, 235, 59, 0.5);
}

.text-segment--upcoming {
    background-color: var(--highlight-upcoming);
    opacity: 0.7;
}

.text-segment--completed {
    background-color: var(--highlight-completed);
    opacity: 0.5;
}

/* Pulse animation for current segment */
@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

/* Smooth transitions */
.text-segment {
    transition: background-color 0.3s ease,
                opacity 0.3s ease,
                transform 0.3s ease;
}
```

### Loading States
```css
/* Loading spinner */
.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--neutral-200);
    border-top: 4px solid var(--primary-blue);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Loading text animation */
.loading-text::after {
    content: '';
    animation: dots 1.5s steps(4, end) infinite;
}

@keyframes dots {
    0%, 20% { content: ''; }
    40% { content: '.'; }
    60% { content: '..'; }
    80%, 100% { content: '...'; }
}
```

### Micro-Interactions
```css
/* Button press feedback */
.btn:active {
    transform: translateY(1px);
}

/* Focus indicators */
.focusable:focus {
    outline: 2px solid var(--primary-blue);
    outline-offset: 2px;
}

/* Hover effects */
.interactive:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

## 5. ACCESSIBILITY STANDARDS (MANDATORY)

### ARIA Labels and Roles
```html
<!-- Required ARIA attributes -->
<button aria-label="Play audio sequence" aria-pressed="false">
    <span aria-hidden="true">▶️</span>
    Play
</button>

<div role="slider" 
     aria-label="Playback tempo" 
     aria-valuemin="60" 
     aria-valuemax="200" 
     aria-valuenow="120">
</div>

<div role="status" aria-live="polite" id="playback-status">
    Ready to play
</div>

<!-- Text highlighting with proper semantics -->
<div role="main" aria-label="Text display with highlighting">
    <span class="text-segment text-segment--current" 
          aria-current="true">
        Current word
    </span>
</div>
```

### Keyboard Navigation
```css
/* Focus management */
.keyboard-focusable {
    position: relative;
}

.keyboard-focusable:focus {
    outline: 2px solid var(--primary-blue);
    outline-offset: 2px;
    z-index: 10;
}

/* Skip links for screen readers */
.skip-link {
    position: absolute;
    top: -40px;
    left: 6px;
    background: var(--neutral-900);
    color: white;
    padding: 8px;
    text-decoration: none;
    border-radius: 4px;
    z-index: 1000;
}

.skip-link:focus {
    top: 6px;
}
```

### Color Contrast Requirements
```css
/* WCAG AA compliance - minimum 4.5:1 contrast ratio */
:root {
    /* High contrast text combinations */
    --text-on-light: #212529;    /* 16.4:1 ratio on white */
    --text-on-dark: #ffffff;     /* 21:1 ratio on #212529 */
    --text-secondary: #6c757d;   /* 4.6:1 ratio on white */
    
    /* Accessible link colors */
    --link-blue: #0056b3;        /* 7.2:1 ratio on white */
    --link-visited: #6f42c1;     /* 5.3:1 ratio on white */
}
```

## 6. MOBILE RESPONSIVENESS (MANDATORY)

### Touch-Friendly Interface
```css
/* Minimum touch target sizes (44px minimum) */
.touch-target {
    min-height: 44px;
    min-width: 44px;
    padding: var(--space-3);
}

/* Touch feedback */
.touch-feedback:active {
    background-color: rgba(0, 0, 0, 0.1);
    transform: scale(0.98);
}

/* Mobile-specific controls */
@media (max-width: 768px) {
    .audio-controls {
        flex-direction: column;
        gap: var(--space-3);
    }
    
    .form-input {
        font-size: 16px; /* Prevents zoom on iOS */
    }
    
    .btn {
        width: 100%;
        justify-content: center;
    }
}
```

### Responsive Text Display
```css
/* Scalable text highlighting for mobile */
.text-display {
    font-size: clamp(1rem, 2.5vw, 1.25rem);
    line-height: var(--leading-relaxed);
    word-wrap: break-word;
    overflow-wrap: break-word;
}

@media (max-width: 480px) {
    .text-segment {
        padding: 4px 6px;
        margin: 2px;
        display: inline-block;
        min-height: 32px;
    }
}
```

## 7. ANIMATION AND TRANSITIONS

### Performance-Optimized Animations
```css
/* Hardware-accelerated animations */
.smooth-transform {
    transform: translateZ(0); /* Create compositing layer */
    will-change: transform;
}

/* Reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
    .text-segment,
    .btn,
    .interactive {
        animation: none;
        transition: none;
    }
    
    .text-segment--current {
        animation: none;
        background-color: var(--highlight-current);
    }
}

/* Smooth page transitions */
.fade-in {
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
```

## 8. ERROR STATES AND FEEDBACK

### User Feedback Patterns
```css
/* Success states */
.success-message {
    background: rgba(40, 167, 69, 0.1);
    border: 1px solid var(--success-green);
    color: var(--success-green);
    padding: var(--space-4);
    border-radius: 8px;
    margin: var(--space-4) 0;
}

/* Error states */
.error-message {
    background: rgba(220, 53, 69, 0.1);
    border: 1px solid var(--error-red);
    color: var(--error-red);
    padding: var(--space-4);
    border-radius: 8px;
    margin: var(--space-4) 0;
}

/* Warning states */
.warning-message {
    background: rgba(255, 193, 7, 0.1);
    border: 1px solid var(--warning-yellow);
    color: #856404;
    padding: var(--space-4);
    border-radius: 8px;
    margin: var(--space-4) 0;
}
```

---

**Accessibility Level:** WCAG AA Compliance Required  
**Mobile Support:** iOS Safari 13+, Chrome Mobile 80+  
**Animation Performance:** 60fps target for all animations  
**Touch Targets:** Minimum 44px for all interactive elements  
**Last Updated:** 2025-09-16