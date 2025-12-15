# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Server

Start local development server (required for testing):
```bash
python -m http.server 8000
# OR
npx serve
```

Access at: http://localhost:8000

## Testing Flow

The system has 3 sequential modules that must be tested in order:

1. **Audiometry** → http://localhost:8000/audiometry.html (15-20 min)
2. **Matching** → http://localhost:8000/matching.html (10-15 min)
3. **Treatment** → http://localhost:8000/treatment.html (variable)

Each module reads data from the previous module via LocalStorage.

### Quick Console Tests

```javascript
// Test audio system
AudioContextManager.init();
AudioContextManager.playTone(440, 1, 0.5);

// Inspect stored data
Storage.getAudiometryResults();
Storage.getTinnitusMatch();
Storage.getTreatmentSessions();

// Clear all data (reset system)
localStorage.clear();
location.reload();
```

## Architecture Overview

### Core Singleton Managers

**AudioContextManager** (`js/audio-context.js`)
- IIFE singleton managing global Web Audio API context
- Must be initialized after user interaction (browser requirement)
- Provides factory methods: `createOscillator()`, `createGain()`, `createFilter()`, `createBuffer()`
- Single `masterGain` node for global volume control
- All audio nodes should connect through `AudioContextManager.getMasterGain()`

**Storage** (`js/storage.js`)
- Object-based singleton for LocalStorage operations
- All keys defined in `Storage.KEYS` constant
- Automatic JSON serialization/deserialization
- Methods: `get()`, `set()`, `remove()`, specific getters/setters per module

### Module Pattern

Each module follows Engine + UI pattern:

```
Module/
├── module-engine.js  (logic, audio generation, algorithms)
└── module-ui.js      (DOM manipulation, event handlers, screens)
```

**Engine** is a class with:
- State management
- Core algorithms
- Callback pattern for UI communication (`onX` properties)
- No direct DOM manipulation

**UI** is a class with:
- Screen rendering methods
- Event handlers
- Calls engine methods
- Updates DOM based on engine callbacks

### Data Flow Between Modules

```
Audiometry → problemFrequencies array
    ↓ (LocalStorage)
Matching → reads problemFrequencies, generates suggested ranges
    ↓ (LocalStorage)
Treatment → reads exact frequency, personalizes therapies
```

**Critical Integration Points:**

1. **Audiometry → Matching:**
   - Key: `tinnitus_audiometry_results`
   - Data: `problemFrequencies` array with `{ frequency, drop, priority, ear }`
   - Matching uses this to suggest search ranges (high priority = 4000-7000 Hz)

2. **Matching → Treatment:**
   - Key: `tinnitus_match`
   - Data: `{ frequency, confidence, volume, waveType }`
   - Treatment personalizes all therapies using exact `frequency`

3. **Treatment Sessions:**
   - Key: `tinnitus_treatment_sessions`
   - Data: Array of session objects
   - Appended on each session completion

### Audio Architecture

**Audiometry Module:**
- Staircase Method algorithm for adaptive threshold detection
- Micro-audiometry: automatic ±500 Hz fine scan (100 Hz steps) around problem frequencies
- Focus: 4000-7000 Hz range (common tinnitus frequencies)
- Canvas-based audiogram visualization

**Matching Module:**
- 5-stage progressive refinement (Range → Coarse → Refinement → Fine → A/B Validation)
- Star rating system (1-5) for coarse search
- Slider with quick adjust buttons (±10, ±25, ±100 Hz)
- A/B blind validation (3 trials) calculates confidence score

**Treatment Module:**
- **Notched Sound Therapy:** White noise with `BiquadFilterNode` (type='notch') at tinnitus frequency, Q=10
- **CR Neuromodulation:** 4 oscillators at 0.77x, 0.90x, 1.11x, 1.29x tinnitus frequency, random pattern, 750ms spacing
- **Sound Masking:** Algorithmic generation of white/pink/brown/narrowband noise (not external files)
- **Ambient Sounds:** Synthesized using noise + LFO modulation (not external files)

### Web Audio API Patterns

**Node Connection Pattern:**
```javascript
source → filter/gain → AudioContextManager.getMasterGain() → destination
```

**Always:**
- Store node references for cleanup (arrays: `oscillators[]`, `gainNodes[]`, `filters[]`)
- Implement proper `stop()` with try-catch (nodes throw if already stopped)
- Call `disconnect()` on all nodes during cleanup
- Use `cancelScheduledValues()` before scheduling new automation

**Never:**
- Connect directly to `audioContext.destination`
- Reuse stopped oscillators (create new ones)
- Forget to store references for cleanup

## Critical Implementation Details

### Audiometry Staircase Algorithm

- **Initial step:** 10 dB
- **Reversal detection:** Change from "heard" to "not heard" (or vice versa)
- **Step reduction:** After each reversal, step size halves (10→5→2.5→1.25)
- **Termination:** After 3 reversals OR 15 trials max
- **Final threshold:** Average of last 2 reversals

### Micro-audiometry Triggering

Auto-activates when:
1. Drop > 20 dB between adjacent frequencies, OR
2. Frequency in 4000-7000 Hz AND drop > 15 dB

Generates tests: `centerFreq ± 500 Hz` in 100 Hz steps (excludes already-tested frequencies)

### CR Neuromodulation Timing

- 4 tones play in **random shuffled order** each cycle
- Tone duration: 250ms (50ms fade-in + 150ms hold + 50ms fade-out)
- Inter-tone interval: 750ms
- Cycle duration: 3000ms (then repeat)
- Use `setTimeout` for scheduling (not AudioParam automation)

### Pink Noise Generation

Uses Paul Kellet's algorithm (6 IIR filters):
```javascript
b0 = 0.99886 * b0 + white * 0.0555179;
b1 = 0.99332 * b1 + white * 0.0750759;
// ... (6 filters total)
output = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
```

Brown noise uses simple integration filter. Do not use generic lowpass filters.

## Common Issues

**"AudioContextManager is not defined"**
- Check `audio-context.js` is loaded before module scripts
- Verify no syntax errors in audio-context.js (commas after functions in IIFE caused this before)

**Audio doesn't play**
- AudioContext must be initialized after user interaction
- Check `audioContext.state` is "running" (not "suspended")
- Call `AudioContextManager.resume()` if suspended

**Data not persisting between modules**
- Verify LocalStorage keys match `Storage.KEYS` constants
- Check browser console for quota errors
- Use `Storage.get()` methods, not direct `localStorage.getItem()`

**Micro-audiometry not triggering**
- Ensure `enableMicroAudiometry: true` in engine config
- Check `problemThreshold` is appropriate (default: 20 dB)
- Verify problem detection logic runs after standard audiometry completes

## Code Style

- Vanilla JavaScript (no frameworks)
- ES6+ syntax (classes, arrow functions, template literals)
- Comments in Spanish (historical - maintain consistency)
- JSDoc for public methods
- IIFE pattern for singletons (AudioContextManager)
- Object literal for namespaces (Storage, Utils)

## No Build System

- No transpilation, bundling, or compilation
- CSS variables for theming (`css/variables.css`)
- Inline styles in HTML files for module-specific UI
- Direct `<script>` tags in HTML (no module bundler)

## Scientific References

Therapies based on published research:
- **Notched Sound:** Okamoto et al. (2010) PNAS
- **CR Neuromodulation:** Tass et al. (2012) - Desyncra device
- **Staircase Method:** Levitt (1971)

When modifying therapies, maintain scientific accuracy (e.g., CR frequency ratios must be 0.77x, 0.90x, 1.11x, 1.29x).
