# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

**Tinnitus Care** - Complete MVP for tinnitus diagnosis and treatment. All three modules fully implemented and production-ready. Zero dependencies, vanilla JavaScript, Web Audio API for sound generation.

## Development Server

```bash
python -m http.server 8000
# OR
npx serve
```

Access at: http://localhost:8000

**No build step required** - edit files and refresh browser.

## Module Flow

Sequential workflow (data flows via LocalStorage):

1. **Audiometry** → http://localhost:8000/audiometry.html (15-20 min)
   - 28 tests: 13 frequencies × 2 ears + catch trials
   - Randomized sequence with Hughson-Westlake algorithm
   - Auto-triggers micro-audiometry (100 Hz steps) on notches >15 dB
   - Outputs: `tinnitus_audiometry_results` with `problemFrequencies[]`

2. **Matching** → http://localhost:8000/matching.html (10-15 min)
   - 5-stage refinement: Range → Coarse → Slider → Fine → A/B
   - Uses audiometry `problemFrequencies` for suggested ranges
   - Outputs: `tinnitus_match` with exact `frequency`

3. **Treatment** → http://localhost:8000/treatment.html (variable)
   - 6 therapy types personalized to matched frequency
   - Real-time frequency adjustment, stereo balance L-R, session recording
   - Outputs: `tinnitus_treatment_sessions[]`

## Console Testing

```javascript
// Test audio system
AudioContextManager.init();
AudioContextManager.playTone(440, 1, 0.5);

// Inspect stored data
Storage.getLatestAudiometryResults();
Storage.getTinnitusMatch();
Storage.getTreatmentSessions();

// Debug storage
debugStorage(); // Available on audiometry.html

// Clear all data
localStorage.clear();
location.reload();
```

## Architecture: Core Singletons

### AudioContextManager (`js/audio-context.js`)

IIFE singleton managing global Web Audio API. **Must init after user interaction.**

**Key Pattern:**
```javascript
// All audio nodes connect through master gain
source → gain/filter → stereoPanner → masterGain → destination
```

**Methods:**
- `init()` - Initialize context (call after user gesture)
- `resume()` - Resume suspended context
- `getContext()` - Get AudioContext instance
- `getMasterGain()` - Get master gain node (all audio routes through this)
- `setMasterVolume(0-1)` - Global volume control

**Never:**
- Connect directly to `audioContext.destination`
- Reuse stopped oscillators (create new ones)
- Forget to call `disconnect()` on cleanup

### Storage (`js/storage.js`)

LocalStorage wrapper with JSON serialization. All keys in `Storage.KEYS`.

**Pattern:**
```javascript
Storage.saveAudiometryResults(data);
const results = Storage.getLatestAudiometryResults();
```

### Logger (`js/logger.js`)

Structured logging with levels (debug/info/warn/error) and persistence:
```javascript
Logger.info('module-name', 'Message');
Logger.error('module-name', 'Error details');

// Console commands
logger.summary();  // View stats
logger.download(); // Export logs
logger.setLevel('debug'); // Change level
```

### Utils (`js/utils.js`)

Helpers: `formatDate()`, `formatDuration()`, `debounce()`, `throttle()`, `sleep()`, `clamp()`, `randomRange()`, `shuffle()`.

## Module Architecture

Each module follows **Engine + UI pattern**:

```
js/{module}/
├── {module}-engine.js  - Logic, algorithms, audio generation
└── {module}-ui.js      - DOM manipulation, screens, events
```

**Engine:**
- State management
- Core algorithms
- Callback pattern for UI updates (`onX` properties)
- NO direct DOM manipulation

**UI:**
- Screen rendering (generates HTML strings)
- Event handlers
- Calls engine methods
- Updates DOM via engine callbacks

## Audio Node Management

### Critical Pattern

```javascript
class Engine {
  constructor() {
    this.oscillators = [];
    this.gainNodes = [];
    this.filters = [];
    this.stereoPanner = null;
  }

  start() {
    const osc = AudioContextManager.getContext().createOscillator();
    const gain = AudioContextManager.getContext().createGain();
    const stereoPanner = this.initStereoPanner();

    osc.connect(gain);
    gain.connect(stereoPanner); // Route through stereo panner
    stereoPanner.connect(AudioContextManager.getMasterGain());

    // Store references for cleanup
    this.oscillators.push(osc);
    this.gainNodes.push(gain);

    osc.start();
  }

  stop() {
    // Always disconnect in try-catch
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) { /* already stopped */ }
    });

    this.gainNodes.forEach(node => node.disconnect());
    if (this.stereoPanner) this.stereoPanner.disconnect();

    // Clear arrays
    this.oscillators = [];
    this.gainNodes = [];
    this.filters = [];
  }
}
```

### StereoPannerNode for L-R Balance

All treatments support stereo balance via `StereoPannerNode`:

```javascript
initStereoPanner() {
  const context = AudioContextManager.getContext();
  if (typeof context.createStereoPanner !== 'function') {
    Logger.error('treatment', 'StereoPannerNode not supported');
    return null; // Graceful fallback
  }

  this.stereoPanner = context.createStereoPanner();
  this.stereoPanner.pan.value = this.stereoBalance; // -1 to 1
  this.stereoPanner.connect(AudioContextManager.getMasterGain());
  return this.stereoPanner;
}

setStereoBalance(balance) {
  this.stereoBalance = Utils.clamp(balance, -1, 1);
  if (this.stereoPanner) {
    const currentTime = context.currentTime;
    this.stereoPanner.pan.cancelScheduledValues(currentTime);
    this.stereoPanner.pan.linearRampToValueAtTime(
      this.stereoBalance,
      currentTime + 0.15 // 150ms smooth transition
    );
  }
}
```

**Use cases:**
- Unilateral tinnitus (balance to affected ear)
- Asymmetric hearing loss
- User preference

## Treatment Module Specifics

### 6 Therapy Types

1. **Notched Sound Therapy**
   - White/pink/brown noise with BiquadFilter (type='notch')
   - Q=10, centered at tinnitus frequency
   - Bandwidth: ~400 Hz notch

2. **CR Neuromodulation**
   - 4 oscillators at 0.77x, 0.90x, 1.11x, 1.29x of tinnitus freq
   - Random shuffled pattern (no consecutive repeats)
   - 250ms tone + 750ms gap per tone

3. **Sound Masking**
   - 7 types: white, pink, brown, violet, grey, narrowband, bandpass
   - Algorithmic generation (Paul Kellet pink noise algorithm)
   - No external audio files

4-6. **Ambient Sounds**
   - 10 types synthesized with noise + LFO modulation
   - Examples: rain, ocean, forest, river, wind
   - No external audio files

7-8. **Hybrid Therapies**
   - Notched + Ambient (dual gain nodes with balance slider)
   - CR + Ambient (same pattern)
   - Crossfade transitions (1.5s) when switching ambient sound

### Real-Time Features

**Frequency Adjustment:**
- Slider: ±5% from matched frequency
- Updates tinnitus frequency in real-time
- Restarts therapy with new frequency (includes hybrid cases)

**Stereo Balance:**
- Slider: -100 (left) to +100 (right)
- Uses StereoPannerNode for panning
- Auto-reconnects canvas if DOM changes (therapy switching)

**Session Recording:**
- Records 30-second WAV files (Web Audio API → Float32Array → WAV format)
- Filename: `tinnitus_therapy_YYYYMMDD_HHMMSS.wav`
- Preserves stereo balance and all effects

### Visualization

**VisualizationEngine** (`js/treatment/visualization-engine.js`):
- 5 types: fractal, waves, particles, mandala, aurora
- Canvas 2D with requestAnimationFrame
- Auto-reconnects if canvas becomes disconnected (therapy changes)

**Fullscreen:**
- Attempts on `<canvas>` element
- Verifies DOM connection before requesting
- Diagnostic logging on failure

## Audiometry Algorithm Details

### Randomized Sequencer

**`js/audiometry/randomized-sequencer.js`:**
- Generates intelligent randomized sequence
- Constraints:
  - Max 2 consecutive tests same ear
  - Avoid adjacent frequencies consecutively
  - Catch trials every 5-10 tests (15% of total)
  - Log-scale frequency spacing

**Purpose:**
- Eliminate anticipation bias
- Detect false positives (catch trials = silence)
- Improve test reliability

### Hughson-Westlake Modified Algorithm

**Fast-track descent:**
- Start: 40 dB
- Heard: -10 dB
- Not heard: +20 dB (fast-track)

**Threshold finding:**
- Descend phase: -10 dB steps
- Ascend phase: +5 dB steps
- Criterion: 2 of 3 positive responses in ascending
- Max 15 trials per frequency

**Timing optimizations:**
- Tone: 1.0s (varies 0.8-1.2s)
- Gap: 1.5s (varies 1.0-2.0s)
- Response window: 2.5s

### Micro-Audiometry

**Auto-triggers when:**
- Drop >15 dB in 4-7 kHz range, OR
- Drop >20 dB between any adjacent frequencies

**Execution:**
- Scans ±500 Hz around problem frequency
- Steps: 100 Hz
- Same staircase algorithm per frequency
- Adds ~11 tests per problem area

**Output:**
- Precise tinnitus localization (within 100 Hz)
- Notch characterization
- Feeds into matching module as priority range

## Critical Bug Fixes (Recent)

### 1. Frequency Adjustment on Hybrid Therapies

**Problem:** Audio cut out when adjusting frequency during hybrid therapy session.

**Cause:** `updateFrequency()` missing switch cases for `'hybrid-notched-ambient'` and `'hybrid-cr-ambient'`.

**Fix:** Added cases to restart hybrid therapies with new frequency (treatment-engine.js:999-1006).

### 2. Canvas Disconnection on Therapy Change

**Problem:** Fullscreen button failed with "Element is not connected" after switching therapies.

**Cause:** DOM re-render destroys old canvas, but `VisualizationEngine.canvas` still references it.

**Fix:** Auto-reconnect logic in `toggleFullscreen()` and `start()` methods - detects disconnection and re-acquires canvas reference (visualization-engine.js:206-241, 133-142).

### 3. Browser Cache Issues

**Solution:** Always instruct users to hard refresh after code updates:
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

## Data Flow

```
1. Audiometry generates:
   {
     testMode: 'standard' | 'micro',
     results: { '125Hz': { left: 20, right: 25 }, ... },
     problemFrequencies: [
       { frequency: 4000, drop: 20, priority: 'high', ear: 'right' }
     ],
     classification: 'moderate',
     reliability: { falsePositives: 0, catchTrials: 3 }
   }

2. Matching uses problemFrequencies to suggest ranges, outputs:
   {
     frequency: 4100,
     confidence: 0.85,
     volume: 0.6,
     waveType: 'sine'
   }

3. Treatment personalizes all therapies:
   - Notch filter: centered at 4100 Hz
   - CR tones: [3157, 3690, 4551, 5289] Hz
   - Balance: auto-suggest based on ear asymmetry
```

## Common Issues

**AudioContextManager is not defined**
- Check script load order in HTML
- `audio-context.js` must load before module scripts

**Audio doesn't play**
- Context suspended: call `AudioContextManager.resume()`
- Check `AudioContextManager.isReady()` returns true

**Data not persisting between modules**
- Use `Storage.getX()` methods, not `localStorage.getItem()`
- Check browser console for quota errors (~5MB limit)

**Visualization not showing**
- Container `display: none` → set to `'block'`
- Canvas not initialized → check logs for init success/fail
- Canvas disconnected → logs show auto-reconnect attempt

**Catch trials failing**
- User pressing button during silence
- >2 false positives → warn user, >3 → flag as unreliable

## Spanish UI

All user-facing text in Spanish. Code comments can be English for technical clarity.

**Examples:**
- Button: "Iniciar Sesión" not "Start Session"
- Label: "Balance Estéreo" not "Stereo Balance"
- Error: "Error al reproducir audio" not "Error playing audio"

## Scientific Basis

Therapies based on peer-reviewed research:
- **Notched Sound:** Okamoto et al. (2010) PNAS
- **CR Neuromodulation:** Tass et al. (2012)
- **Staircase Method:** Levitt (1971)
- **Hughson-Westlake:** Clinical audiometry standard (ISO 8253-1)

**Maintain scientific accuracy:**
- CR frequency ratios: exactly 0.77, 0.90, 1.11, 1.29
- Notch Q factor: 10 (bandwidth ~400 Hz)
- Audiometry thresholds: 2/3 criterion in ascending

## File Structure

```
C:\tmp\tinitus1\
├── index.html              - Landing page
├── audiometry.html         - Module 1
├── matching.html           - Module 2
├── treatment.html          - Module 3
├── css/
│   ├── variables.css       - Design tokens (DO NOT EDIT)
│   ├── global.css          - Component classes
│   └── reset.css
├── js/
│   ├── utils.js            - Helpers
│   ├── storage.js          - LocalStorage wrapper
│   ├── logger.js           - Logging system
│   ├── audio-context.js    - Audio singleton
│   ├── audiometry/
│   │   ├── audiometry-engine.js
│   │   ├── audiometry-ui.js
│   │   └── randomized-sequencer.js
│   ├── matching/
│   │   ├── matching-engine.js
│   │   └── matching-ui.js
│   └── treatment/
│       ├── treatment-engine.js
│       ├── treatment-ui.js
│       └── visualization-engine.js
└── [~40 .md docs]          - Extensive documentation
```

## Documentation

Extensive docs cover features, algorithms, testing, and fixes:
- `README.md` - Overview and quick start
- `EXPLICACION_28_TEST_AUDIOMETRIA_FINA.md` - Audiometry theory
- `EJEMPLO_PRACTICO_28_TESTS.md` - Step-by-step case study
- `FEATURE_STEREO_BALANCE_LR.md` - L-R balance implementation
- `FIX_FREQUENCY_FULLSCREEN_2025-12-16.md` - Recent bug fixes
- `SPRINT_*_COMPLETADO.md` - Sprint summaries

Read relevant docs before making changes to understand context.
