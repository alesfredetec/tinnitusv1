# Tinnitus Care - AI Coding Agent Instructions

## Project Overview
**Tinnitus Care** is a vanilla JavaScript web application for tinnitus diagnosis and treatment. Zero dependencies. Pure HTML5, CSS3, and ES6+ JavaScript using Web Audio API for sound generation and LocalStorage for persistence.

**Status**: Sprint 1 complete (foundation layer). Modules 1-3 are placeholder shells awaiting implementation.

## Architecture: Three-Module Sequential Flow

```
1. Audiometry (audiometry.html) → 2. Matching (matching.html) → 3. Treatment (treatment.html)
      ↓                                    ↓                              ↓
   js/audiometry/                      js/matching/                   js/treatment/
```

**Critical Pattern**: Each HTML page loads the same foundation scripts:
```html
<script src="js/utils.js"></script>
<script src="js/storage.js"></script>
<script src="js/audio-context.js"></script>
```

Module-specific logic goes in `js/{module-name}/` directories (currently empty).

## Core Singletons (Always Use These)

### 1. AudioContextManager (`js/audio-context.js`)
Singleton managing Web Audio API. **Must init after user interaction** (browser requirement).

```javascript
// Initialize once per session
AudioContextManager.init();

// Play tone: frequency (Hz), duration (s), volume (0-1)
AudioContextManager.playTone(440, 1, 0.5);

// Generate noise: type ('white'|'pink'), duration, volume
AudioContextManager.playNoise('white', 2, 0.3);
```

**Key Methods**:
- `init()` - Call once after user interaction
- `resume()` - Restore suspended context
- `playTone(freq, duration, volume, ear='both')` - Pure tones
- `playNoise(type, duration, volume)` - White/pink noise
- `setMasterVolume(0-1)` - Global volume control

### 2. Storage (`js/storage.js`)
LocalStorage wrapper with JSON serialization. All keys prefixed `tinnitus_`.

```javascript
// Predefined storage keys in Storage.KEYS
Storage.KEYS = {
  AUDIOMETRY_RESULTS: 'tinnitus_audiometry_results',
  TINNITUS_MATCH: 'tinnitus_match',
  TREATMENT_PLAN: 'tinnitus_treatment_plan',
  // ... see storage.js for full list
}

// Save/retrieve
Storage.saveAudiometryResults({ '250Hz': { left: 20, right: 25 }, ... });
const results = Storage.getAudiometryResults();

// Generic access
Storage.set('custom_key', { data: 'value' });
Storage.get('custom_key', defaultValue);
```

### 3. Utils (`js/utils.js`)
Common helpers: `formatDate()`, `formatDuration()`, `debounce()`, `throttle()`, `sleep()`, `clamp()`, `randomRange()`, `shuffle()`.

## Module Development Patterns

### Audiometry Module (Sprint 2-3)
**Algorithm**: Adaptive staircase method with randomization
- **Frequencies**: `[125, 250, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, 8000, 10000, 12000]` Hz
- **Decibel range**: -10 to 90 dB HL (steps: 10dB → 5dB → 2dB)
- **Ear selection**: Randomized per trial
- **Anti-gaming**: Random delays (1.5-3.5s), variable tone duration (1-2s), 10% catch trials (silence)

**Expected Output Format**:
```javascript
{
  "250Hz": { "left": 20, "right": 25 },
  "500Hz": { "left": 15, "right": 20 },
  // ... all frequencies
  "metadata": {
    "date": "2025-12-15T10:30:00Z",
    "duration": 1080  // seconds
  }
}
```

Reference: `PLAN_MVP_BASICO.md` lines 1-100 for full algorithm specification.

### Matching Module (Sprint 4)
**Goal**: Identify tinnitus pitch frequency
- Multi-stage search: Coarse (octave jumps) → Medium (half-octaves) → Fine (5-10 Hz steps)
- Slider range: 20-20,000 Hz (log scale for display)
- A/B validation: Present matched frequency vs ±1 semitone to confirm

### Treatment Module (Sprint 5-6)
**Protocols** (from `VISION_GENERAL_SISTEMA_COMPLETO.md`):
1. **Notched Sound**: White/pink noise with narrow notch filter at tinnitus frequency (Q=10)
2. **CR Neuromodulation**: 4 tones around tinnitus freq (0.77f, 0.90f, 1.11f, 1.30f), 80ms ON/120ms OFF
3. **Masking**: Ambient sounds (rain, ocean, white noise)

## CSS Architecture: Variable-Driven Design System

All styling uses CSS variables from `css/variables.css`:
```css
/* Colors */
var(--primary-blue), var(--success), var(--danger)

/* Spacing */
var(--space-2) /* 0.5rem */, var(--space-4) /* 1rem */, var(--space-8) /* 2rem */

/* Typography */
var(--text-sm), var(--text-base), var(--text-xl), var(--text-4xl)

/* Shadows/Borders */
var(--shadow-md), var(--radius-lg), var(--border-light)
```

**Component Classes** (from `css/global.css`):
- `.card` - Standard container with shadow
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-lg` - Button variants
- `.alert`, `.alert-info`, `.alert-success` - Notification boxes
- `.progress-grid`, `.modules-grid` - Layout grids

**Do not add new colors or spacing values** - reuse existing variables.

## Development Commands

```powershell
# Local server (Python)
python -m http.server 8000

# OR with Node.js
npx serve

# Open: http://localhost:8000
```

**No build step, no bundler.** Edit files → refresh browser.

## Testing in Console

```javascript
// Initialize audio
AudioContextManager.init();
AudioContextManager.playTone(1000, 2, 0.5); // 1kHz, 2s, 50% volume

// Storage test
Storage.set('test_key', { foo: 'bar' });
console.log(Storage.get('test_key')); // { foo: 'bar' }

// Utils test
console.log(Utils.formatDuration(125)); // "02:05"
```

## Critical Constraints

1. **Zero dependencies** - No npm packages, no frameworks. Use vanilla JS only.
2. **Browser audio limits** - `AudioContext` must init after user gesture (click/tap). Always wrap in event handler.
3. **LocalStorage quotas** - ~5MB limit. Store only essential data. Audiometry results are ~2KB, safe to store.
4. **Spanish UI** - All user-facing text in Spanish. Code comments can be English.
5. **Mobile-first** - Responsive design. Test on 375px viewport minimum.

## File Naming & Organization

```
Module files: js/{module}/main.js, js/{module}/algorithm.js, js/{module}/ui.js
CSS: Add module-specific styles to css/global.css (keep variables.css untouched)
HTML: Module pages already exist (audiometry.html, matching.html, treatment.html)
```

When adding new JavaScript:
1. Load order: `utils.js` → `storage.js` → `audio-context.js` → module scripts
2. Use IIFE or modules to avoid global pollution
3. Document public APIs with JSDoc

## Current Development Priority

**Sprint 2**: Implement audiometry adaptive algorithm in `js/audiometry/main.js`. See `PLAN_MVP_BASICO.md` lines 1-100 for detailed pseudocode and state machine.

Key challenge: Balancing test duration (target 15-20 min) with accuracy (2-3 dB precision at threshold).

---

**Questions/Clarifications**: Check `readme.md` for feature roadmap, `PLAN_MVP_BASICO.md` for implementation specs, `VISION_GENERAL_SISTEMA_COMPLETO.md` for long-term architecture (backend, ML, PWA - future phases).
