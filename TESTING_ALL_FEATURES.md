# Testing All Features - Tinnitus Treatment App
## Comprehensive Test Plan
**Date:** 2025-12-15
**Test Session:** Sprint 5-6 Final Testing
**Features to Test:**
1. CSS Improvements (colors, contrasts, buttons)
2. Manual Frequency Input
3. Expanded Sound Options (7 masking + 10 ambient)
4. Treatment Engine Core Features
5. Frequency Editing

---

## 1. CSS & UI Improvements

### Test 1.1: Button Contrast
**URL:** http://localhost:8000/treatment.html

**Steps:**
1. Navigate to treatment page
2. Observe all button types on screen
3. Check text readability

**Expected Results:**
- ✓ `.btn-secondary` should have gray-600 background with white text (NOT gray-200)
- ✓ `.btn-danger` should be visible with red background and white text
- ✓ `.btn-outline` should have transparent background with visible border
- ✓ All button text should be clearly readable

**Validation Commands:**
```javascript
// In browser console
const btn = document.querySelector('.btn-secondary');
console.log('Background:', window.getComputedStyle(btn).backgroundColor);
console.log('Color:', window.getComputedStyle(btn).color);
// Should show: rgb(75, 85, 99) background, rgb(255, 255, 255) text
```

### Test 1.2: Badge Contrast
**Steps:**
1. View therapy cards on welcome screen
2. Check effectiveness badges

**Expected Results:**
- ✓ All badges should have white text on colored backgrounds
- ✓ No badges with light backgrounds and dark text
- ✓ Clear readability for all badge types (success, warning, info, error)

### Test 1.3: Card & Text Visibility
**Steps:**
1. Review all cards throughout the application
2. Check text color against backgrounds

**Expected Results:**
- ✓ All text clearly visible against card backgrounds
- ✓ No washed-out text on white/light backgrounds
- ✓ Proper contrast ratios (WCAG AA minimum)

---

## 2. Manual Frequency Input Feature

### Test 2.1: Initial Entry (No Match Data)
**URL:** http://localhost:8000/treatment.html (with no localStorage data)

**Setup:**
```javascript
// Clear localStorage
localStorage.clear();
location.reload();
```

**Steps:**
1. Open treatment.html
2. Should see "Sin datos de frecuencia" error screen
3. Locate manual frequency input card
4. Enter frequency: 4500 Hz
5. Click "Usar Esta Frecuencia y Probar Tratamientos"

**Expected Results:**
- ✓ Error screen displays with manual input option
- ✓ Input field accepts numeric values 20-20000
- ✓ After submit, welcome screen appears
- ✓ Frequency display shows "4500 Hz"
- ✓ Warning indicator: "⚠️ Frecuencia ingresada manualmente"
- ✓ All 4 therapy cards are visible

**Validation Commands:**
```javascript
const matchData = JSON.parse(localStorage.getItem('tinnitus-match'));
console.log('Frequency:', matchData.frequency); // Should be 4500
console.log('Manual flag:', matchData.manual);  // Should be true
console.log('Confidence:', matchData.confidence); // Should be 0
```

### Test 2.2: Frequency Validation
**Steps:**
1. Try entering invalid frequencies:
   - Below 20 Hz
   - Above 20000 Hz
   - Non-numeric values
   - Empty input

**Expected Results:**
- ✓ Alert message: "Por favor ingresa una frecuencia válida entre 20 y 20000 Hz"
- ✓ No navigation occurs
- ✓ User remains on input screen

### Test 2.3: Edit Frequency from Welcome Screen
**Steps:**
1. From welcome screen, click "✏️ Editar" button
2. Edit frequency screen should appear
3. Try preset buttons: 3000, 4000, 6000, 8000 Hz
4. Try manual input: 5500 Hz
5. Click "Guardar Frecuencia"

**Expected Results:**
- ✓ Edit screen displays with current frequency pre-filled
- ✓ Preset buttons update input field immediately
- ✓ Can manually type any frequency
- ✓ After save, returns to welcome screen with new frequency
- ✓ Manual flag remains true
- ✓ All therapies re-initialize with new frequency

**Validation Commands:**
```javascript
console.log('Engine frequency:', treatmentUI.engine.tinnitusFrequency);
console.log('Match frequency:', JSON.parse(localStorage.getItem('tinnitus-match')).frequency);
// Both should match the new value
```

---

## 3. Expanded Sound Options

### Test 3.1: Masking Therapy - 7 Noise Types
**URL:** http://localhost:8000/treatment.html

**Steps:**
1. Select "Sound Masking" therapy
2. Observe "Tipo de Ruido" selector
3. Count available noise types

**Expected Results:**
- ✓ Title shows: "Tipo de Ruido (7 opciones)"
- ✓ 7 buttons displayed in grid:
  - ⚪ Blanco
  - 🌸 Rosa
  - 🟤 Marrón
  - 🔵 Azul
  - 🟣 Violeta
  - 🔴 Rojo
  - 📊 Banda Estrecha
- ✓ Recommendations section visible below buttons
- ✓ All buttons properly styled with btn-outline btn-sm

### Test 3.2: Test Each Noise Type
**Steps:**
For each noise type:
1. Click the noise type button
2. Set volume to 30%
3. Set duration to 1 minute
4. Click "Iniciar Sesión"
5. Listen for 5-10 seconds
6. Click "Detener Sesión"

**Test Matrix:**

| Noise Type | Expected Sound Characteristics | Status |
|------------|-------------------------------|--------|
| Blanco (White) | Equal power across all frequencies, "shhh" sound | ⬜ |
| Rosa (Pink) | Lower frequencies emphasized, softer than white | ⬜ |
| Marrón (Brown) | Deep, low rumble, like distant waterfall | ⬜ |
| Azul (Blue) | Higher frequencies emphasized, brighter | ⬜ |
| Violeta (Violet) | Very high frequencies, sharp/hissy | ⬜ |
| Rojo (Red) | Very low frequencies, deep rumble | ⬜ |
| Banda Estrecha | Narrow band around your frequency (e.g., 4000 Hz ±200 Hz) | ⬜ |

**Validation Commands:**
```javascript
// While playing
console.log('Current therapy:', treatmentUI.engine.currentTherapy); // 'masking'
console.log('Current subtype:', treatmentUI.currentSubType);
console.log('Is playing:', treatmentUI.engine.isPlaying); // true
```

### Test 3.3: Ambient Sounds - 10 Options
**Steps:**
1. Go back to welcome screen
2. Select "Sonidos Ambientales" therapy
3. Observe "Sonido Ambiental" selector
4. Count available ambient sounds

**Expected Results:**
- ✓ Title shows: "Sonido Ambiental (10 opciones)"
- ✓ 10 buttons displayed in grid:
  - 🌧️ Lluvia (Rain)
  - 🌊 Océano (Ocean)
  - 💨 Viento (Wind)
  - 🌲 Bosque (Forest)
  - 🏞️ Río (River)
  - 💦 Cascada (Waterfall)
  - 🐦 Pájaros (Birds)
  - ⛈️ Tormenta (Thunder)
  - 🦗 Grillos (Crickets)
  - 🏔️ Arroyo (Stream)
- ✓ Characteristics section visible below buttons
- ✓ All buttons properly styled

### Test 3.4: Test Each Ambient Sound
**Steps:**
For each ambient sound:
1. Click the sound button
2. Set volume to 40%
3. Set duration to 1 minute
4. Click "Iniciar Sesión"
5. Listen for 10-15 seconds
6. Click "Detener Sesión"

**Test Matrix:**

| Ambient Sound | Expected Characteristics | Status |
|---------------|-------------------------|--------|
| 🌧️ Lluvia | Pink noise with slow LFO modulation (0.5 Hz) | ⬜ |
| 🌊 Océano | Brown noise with gentle wave-like LFO (0.3 Hz) | ⬜ |
| 💨 Viento | White noise with slow variation (0.2 Hz) | ⬜ |
| 🌲 Bosque | Pink noise base with gentle LFO (0.4 Hz) | ⬜ |
| 🏞️ Río | Brown noise with medium LFO (0.3 Hz) | ⬜ |
| 💦 Cascada | White noise with rapid LFO (1.5 Hz) | ⬜ |
| 🐦 Pájaros | Pink noise + random chirps (2000-5000 Hz) every 2-5s | ⬜ |
| ⛈️ Tormenta | Brown noise + periodic rumbles (40 Hz) every 8-20s | ⬜ |
| 🦗 Grillos | Rapid chirping sounds (3000-5000 Hz), 3 simultaneous | ⬜ |
| 🏔️ Arroyo | Pink noise with gentle LFO (0.2 Hz) | ⬜ |

### Test 3.5: Switching Sounds During Playback
**Steps:**
1. Start any masking or ambient therapy
2. While playing, click different sound type buttons
3. Verify smooth transitions

**Expected Results:**
- ✓ Sound changes immediately without stopping session
- ✓ No audio glitches or pops
- ✓ Active button highlights correctly
- ✓ Progress continues uninterrupted
- ✓ Console logs show: "Cambiando subtipo a: [new-type]"

---

## 4. Treatment Engine Core Features

### Test 4.1: Notched Sound Therapy
**Steps:**
1. Select "Notched Sound" therapy
2. No subtype selector (uses automatic notch)
3. Start session with 2 min duration

**Expected Results:**
- ✓ White noise plays with notch around tinnitus frequency
- ✓ Notch width: ±10% of frequency (e.g., 4000 Hz → notch 3600-4400 Hz)
- ✓ Smooth audio without artifacts
- ✓ Console shows: "🔇 Configurando terapia Notched Sound"

### Test 4.2: CR Neuromodulation
**Steps:**
1. Select "CR Neuromodulation" therapy
2. Default duration should be 60 min (longer than others)
3. Start session

**Expected Results:**
- ✓ 4 distinct tones play in pattern
- ✓ Frequencies: f×0.77, f×0.9, f×1.1, f×1.32 (where f = tinnitus freq)
- ✓ Tones alternate in coordinated pattern (Tass protocol)
- ✓ 280ms tone duration with 1 second cycle
- ✓ Console shows: "🎵 Configurando CR Neuromodulation"

### Test 4.3: Volume Control
**Steps:**
1. Start any therapy
2. Adjust volume slider during playback
3. Test range: 0% to 100%

**Expected Results:**
- ✓ Volume changes immediately
- ✓ Volume display updates: "[value]%"
- ✓ 0% = silent (but session continues)
- ✓ 100% = maximum volume
- ✓ Smooth transitions, no pops

### Test 4.4: Duration Control
**Steps:**
1. Before starting session, adjust duration slider
2. Try: 5, 10, 30, 60, 120 minutes

**Expected Results:**
- ✓ Duration display updates: "[value] min"
- ✓ Slider labels visible: "5 min" ... "120 min"
- ✓ Session duration matches selected value
- ✓ Progress bar calculates correctly

### Test 4.5: Session Progress
**Steps:**
1. Start 2-minute session
2. Observe progress updates

**Expected Results:**
- ✓ Progress container becomes visible
- ✓ Time current increments: 0:01, 0:02, 0:03...
- ✓ Time target shows: 2:00
- ✓ Progress bar fills proportionally
- ✓ Percentage updates: 0%, 1%, 2%... 100%
- ✓ At 100%, session auto-completes

### Test 4.6: Session Completion
**Steps:**
1. Let a short (1 min) session complete fully
2. Observe completion modal

**Expected Results:**
- ✓ Modal appears: "✅ Sesión Completada"
- ✓ Shows therapy name and duration
- ✓ Two buttons: "Repetir Sesión" and "Cambiar Terapia"
- ✓ Session saved to localStorage
- ✓ Console logs: "Session ended: [therapy], [duration]s"

**Validation Commands:**
```javascript
const sessions = JSON.parse(localStorage.getItem('treatment-sessions'));
console.log('Total sessions:', sessions.length);
console.log('Latest session:', sessions[sessions.length - 1]);
// Should show: therapy, duration, timestamp, completed: true
```

### Test 4.7: Stop Before Completion
**Steps:**
1. Start session
2. Stop after 30 seconds
3. Check session history

**Expected Results:**
- ✓ Session stops immediately
- ✓ Progress freezes at current position
- ✓ Play button returns to "▶ Iniciar Sesión"
- ✓ Session saved with completed: false
- ✓ Badge shows: "Parcial" (not "✓ Completada")

---

## 5. Integration Tests

### Test 5.1: Complete User Flow - Manual Entry
**Steps:**
1. Clear all localStorage
2. Open treatment.html
3. Enter manual frequency: 6000 Hz
4. Test all 4 therapies with various settings
5. Complete at least 2 full sessions

**Expected Results:**
- ✓ Smooth navigation throughout
- ✓ All therapies work with manual frequency
- ✓ Session history builds correctly
- ✓ Can edit frequency and therapies adjust
- ✓ No console errors

### Test 5.2: Complete User Flow - From Matching
**Steps:**
1. Complete audiometry module
2. Complete matching module (get real frequency match)
3. Open treatment.html
4. Verify frequency data loaded
5. Test therapies

**Expected Results:**
- ✓ Frequency loads from matching results
- ✓ Confidence percentage shown (not manual warning)
- ✓ All therapies personalized to matched frequency
- ✓ Can still edit frequency if desired

### Test 5.3: Multiple Sessions Over Time
**Steps:**
1. Complete 5-6 sessions across different therapies
2. Check session history displays

**Expected Results:**
- ✓ Session history shows last 5 sessions per therapy
- ✓ Sessions sorted by date (newest first)
- ✓ Accurate duration and completion status
- ✓ Can track usage patterns

---

## 6. Error Handling & Edge Cases

### Test 6.1: Invalid Frequency Values
**Test Cases:**
- Frequency: -100 (negative)
- Frequency: 0
- Frequency: 19 (below minimum)
- Frequency: 20001 (above maximum)
- Frequency: "abc" (non-numeric)
- Frequency: null/undefined

**Expected Results:**
- ✓ All invalid inputs rejected
- ✓ Alert message displayed
- ✓ No navigation occurs
- ✓ No errors in console

### Test 6.2: Audio Context Blocked
**Steps:**
1. Open treatment.html
2. Browser may block audio context
3. Try to start therapy

**Expected Results:**
- ✓ Audio context resumes on user interaction
- ✓ Therapy starts successfully
- ✓ Clear error message if audio fails

### Test 6.3: Rapid Button Clicking
**Steps:**
1. Rapidly click start/stop multiple times
2. Rapidly switch between sound types
3. Rapidly change therapies

**Expected Results:**
- ✓ No audio glitches
- ✓ State remains consistent
- ✓ No memory leaks
- ✓ No duplicate sounds playing

### Test 6.4: Browser Compatibility
**Test in multiple browsers:**
- Chrome/Edge (Chromium)
- Firefox
- Safari (if available)

**Expected Results:**
- ✓ All features work consistently
- ✓ Web Audio API supported
- ✓ UI renders correctly
- ✓ localStorage functions properly

---

## 7. Performance Tests

### Test 7.1: Audio Performance
**Steps:**
1. Start therapy
2. Monitor CPU usage
3. Check for audio dropouts

**Expected Results:**
- ✓ Smooth audio playback
- ✓ Reasonable CPU usage (<10%)
- ✓ No stuttering or glitches
- ✓ Consistent frame rate

### Test 7.2: Long Session Stability
**Steps:**
1. Start 30-minute session
2. Monitor throughout
3. Let complete fully

**Expected Results:**
- ✓ No memory leaks
- ✓ Consistent audio quality
- ✓ Progress updates accurately
- ✓ Completes successfully

---

## 8. Console Log Verification

### Expected Console Messages
During testing, verify these logs appear:

**Initialization:**
```
Treatment UI initialized
🎯 Inicializando tratamiento para frecuencia: [freq] Hz
```

**Therapy Start:**
```
🔇 Configurando terapia Notched Sound  (or other therapy)
Session started: [therapy] for [duration] min
```

**Volume Changes:**
```
🔊 Volumen ajustado a: [value]
```

**Subtype Changes:**
```
🔄 Cambiando subtipo a: [subtype]
```

**Session End:**
```
Session ended: [therapy], [duration]s
✅ Sesión guardada: [therapy], [duration]s, completada: [true/false]
```

**No Errors Should Appear:**
- ❌ No "TypeError" messages
- ❌ No "ReferenceError" messages
- ❌ No "synthesizeAmbient is not a function"
- ❌ No "undefined" errors

---

## Test Summary Checklist

### CSS/UI ✓
- [ ] Button contrasts improved (secondary, danger, outline)
- [ ] Badge contrasts improved (all white text)
- [ ] All text clearly visible on backgrounds
- [ ] No visual glitches or layout issues

### Manual Frequency Input ✓
- [ ] Can enter frequency from error screen
- [ ] Validation works (20-20000 Hz range)
- [ ] Manual flag saved correctly
- [ ] Can edit frequency from welcome screen
- [ ] Preset buttons work
- [ ] Frequency changes apply to therapies

### Expanded Sound Options ✓
- [ ] 7 masking noise types display and work
- [ ] 10 ambient sounds display and work
- [ ] Each sound has distinct characteristics
- [ ] Can switch sounds during playback
- [ ] All sounds synthesize correctly

### Treatment Engine ✓
- [ ] Notched Sound therapy works
- [ ] CR Neuromodulation works
- [ ] Sound Masking works (all 7 types)
- [ ] Ambient Sounds work (all 10 types)
- [ ] Volume control responsive
- [ ] Duration control works
- [ ] Progress tracking accurate
- [ ] Session completion triggers modal
- [ ] Sessions save to localStorage

### Integration ✓
- [ ] Complete flows work end-to-end
- [ ] Manual entry flow smooth
- [ ] Matching integration works
- [ ] Session history displays correctly
- [ ] No console errors throughout

### Error Handling ✓
- [ ] Invalid input rejected gracefully
- [ ] Audio context issues handled
- [ ] Rapid interactions don't break app
- [ ] Browser compatibility verified

---

## Critical Issues to Watch For

1. **Audio Doesn't Play:** Check browser audio permissions, AudioContext state
2. **Methods Not Found:** Verify all method names match (e.g., startAmbientTherapy not synthesizeAmbient)
3. **Undefined Variables:** Ensure sessionDuration initialized before use
4. **LocalStorage Issues:** Test in private/incognito mode
5. **CSS Not Applied:** Check file paths, clear cache
6. **Buttons Not Responsive:** Verify onclick handlers and CSS classes

---

## Test Results Summary

**Date Completed:** _______________
**Tester:** _______________
**Browser/Version:** _______________

**Pass Rate:** _____ / _____ tests passed

**Critical Issues Found:**
1.
2.
3.

**Minor Issues Found:**
1.
2.
3.

**Overall Status:** ⬜ PASS | ⬜ FAIL | ⬜ NEEDS REVIEW

---

## Next Steps After Testing

If all tests pass:
1. Mark "Testing completo de todas las features" as completed
2. Create user documentation
3. Prepare deployment

If issues found:
1. Document each issue with reproduction steps
2. Prioritize: Critical → High → Medium → Low
3. Fix critical issues first
4. Re-test after fixes
5. Iterate until all critical tests pass
