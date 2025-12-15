# 🚀 PLAN MVP BÁSICO - DIAGNÓSTICO Y TRATAMIENTO DE TINNITUS

## 📋 ESPECIFICACIONES DEL MVP

### Tecnologías
- **HTML5** puro (semántico, accesible)
- **CSS3 moderno** (Grid, Flexbox, Variables CSS, Animaciones)
- **JavaScript Vanilla** (ES6+, Web Audio API, LocalStorage)
- **Sin dependencias externas** (cero frameworks, cero librerías)

### Alcance Funcional
1. ✅ **Módulo 1**: Audiometría Fina Automatizada (15-20 min)
2. ✅ **Módulo 2**: Búsqueda Manual de Frecuencia de Tinnitus
3. ✅ **Módulo 3**: Tratamiento con Sonidos Escalonados

---

## 🎯 MÓDULO 1: AUDIOMETRÍA FINA AUTOMATIZADA

### Objetivo
Realizar una audiometría completa usando **estrategia random adaptativa** para:
- Dibujar curva audiométrica de alta resolución
- Identificar frecuencias con problemas o caídas
- Determinar perfil auditivo del paciente
- Duración: 15-20 minutos

### Estrategia de Testing Random Adaptativo

#### Algoritmo: "Staircase Method con Randomización"

```javascript
CONFIGURACIÓN INICIAL:
- Frecuencias a evaluar: [125, 250, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, 8000, 10000, 12000] Hz
- Rango de volumen: -10 dB a 90 dB HL (pasos de 5 dB)
- Umbral inicial estimado: 25 dB por frecuencia
- Oído inicial: aleatorio (izquierdo/derecho)

PROCESO POR FRECUENCIA:
1. Seleccionar frecuencia aleatoria no completada
2. Presentar tono en oído aleatorio
3. Volumen inicial: 40 dB (audible para mayoría)
4. Usuario responde: "Oigo" o "No oigo" (o timeout 3s = no oigo)

5. Algoritmo adaptativo:
   - SI oye → BAJAR 10 dB
   - SI no oye → SUBIR 10 dB
   - Después de primer cambio de dirección → pasos de 5 dB
   - Después de segundo cambio → pasos de 2 dB

6. Criterio de umbral:
   - 2 respuestas positivas consecutivas al mismo nivel
   - O 3 respuestas positivas en rango de 5 dB

7. Validación cruzada:
   - Re-testear 3 frecuencias aleatorias al final
   - Si diferencia > 10 dB → alertar y re-evaluar

RANDOMIZACIÓN PARA EVITAR PATRONES:
- Orden de frecuencias: aleatorizado
- Oído (L/R): aleatorizado por presentación
- Delays variables: 1.5-3.5s entre tonos
- Duración de tono: 1-2s (variable)
- Tonos "catch" (silencio): 10% probabilidad para detectar falsos positivos

SALIDA:
- Array de umbrales por frecuencia y oído:
  {
    "250Hz": { "left": 20, "right": 25 },
    "500Hz": { "left": 15, "right": 20 },
    ...
  }
- Curva audiométrica dibujada en canvas
- Identificación de frecuencias problema (caídas > 20 dB entre adyacentes)
```

### Interfaz de Usuario

```
┌─────────────────────────────────────────────────────────┐
│  AUDIOMETRÍA FINA - Sesión de Evaluación                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [============================] 67% Completado          │
│  Tiempo estimado restante: 6 minutos                    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │         🎧 Colócate los audífonos              │   │
│  │                                                 │   │
│  │      Presiona cuando escuches un sonido         │   │
│  │                                                 │   │
│  │         Frecuencia actual: 2000 Hz              │   │
│  │              Oído: Izquierdo                    │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│                  [ LO ESCUCHO ]                         │
│                                                         │
│  Instrucciones:                                         │
│  • Presiona el botón cuando escuches un tono            │
│  • Incluso si el sonido es muy suave, presiona          │
│  • Si no estás seguro, NO presiones                     │
│                                                         │
│  Progreso por frecuencia:                               │
│  250Hz ✓  500Hz ✓  1kHz ✓  2kHz [▸]  4kHz ○  8kHz ○   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Visualización de Resultados

```
┌─────────────────────────────────────────────────────────┐
│  AUDIOGRAMA - Resultados                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   dB HL                                                 │
│   -10  ─────────────────────────────────────────────   │
│    0                                                    │
│   10         ○───○                                      │
│   20              ╲  ○───○                             │
│   30               ○      ╲                            │
│   40                       ○                           │
│   50                        ╲                          │
│   60                         ○     [CAÍDA]             │
│   70                          ╲                        │
│   80                           ○───○                   │
│   90  ─────────────────────────────────────────────   │
│      250  500  1k  2k  3k  4k  6k  8k  10k  12k  Hz    │
│                                                         │
│   ─── Oído Izquierdo    ─── Oído Derecho               │
│                                                         │
│  🔍 HALLAZGOS:                                          │
│  ✓ Audición normal en frecuencias bajas (250-2kHz)      │
│  ⚠️ CAÍDA significativa en 4-6 kHz (típica de tinnitus)│
│  ✓ Asimetría mínima entre oídos                         │
│                                                         │
│  📊 Frecuencias con problemas identificadas:            │
│     • 4000 Hz (L: 55dB, R: 60dB) - Moderada            │
│     • 6000 Hz (L: 65dB, R: 70dB) - Moderada-Severa     │
│                                                         │
│  [ Continuar a Búsqueda de Tinnitus → ]                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Implementación Técnica

```javascript
// audiometry-engine.js

class AudiometryEngine {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.frequencies = [125, 250, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, 8000, 10000, 12000];
    this.results = {};
    this.currentFreq = null;
    this.currentEar = null;
    this.currentLevel = 40; // dB HL
    this.stepSize = 10;
    this.reversals = 0;
    this.lastDirection = null;
    this.responsesAtLevel = [];
  }

  // Iniciar audiometría
  async start() {
    this.shuffleFrequencies();
    await this.testNextFrequency();
  }

  // Randomizar orden de frecuencias
  shuffleFrequencies() {
    this.frequencies = this.frequencies.sort(() => Math.random() - 0.5);
  }

  // Presentar tono
  async presentTone(frequency, ear, volumeDB) {
    // Convertir dB HL a ganancia (0-1)
    const gain = this.dbToGain(volumeDB);

    // Crear oscilador
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const panner = this.audioContext.createStereoPanner();

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.value = gain;
    panner.pan.value = (ear === 'left') ? -1 : 1;

    oscillator.connect(gainNode);
    gainNode.connect(panner);
    panner.connect(this.audioContext.destination);

    // Duración aleatoria 1-2s
    const duration = 1 + Math.random();

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);

    // Delay aleatorio antes de siguiente
    const delay = 1500 + Math.random() * 2000; // 1.5-3.5s
    await this.sleep(delay);

    // 10% probabilidad de "catch trial" (silencio)
    if (Math.random() < 0.1) {
      await this.presentCatchTrial();
    }
  }

  // Usuario responde "Escucho"
  onUserResponse(heard) {
    if (heard) {
      // Bajamos volumen
      if (this.lastDirection === 'up') {
        this.reversals++;
        this.adjustStepSize();
      }
      this.currentLevel -= this.stepSize;
      this.lastDirection = 'down';
      this.responsesAtLevel.push({level: this.currentLevel + this.stepSize, response: true});
    } else {
      // Subimos volumen
      if (this.lastDirection === 'down') {
        this.reversals++;
        this.adjustStepSize();
      }
      this.currentLevel += this.stepSize;
      this.lastDirection = 'up';
      this.responsesAtLevel.push({level: this.currentLevel - this.stepSize, response: false});
    }

    // Verificar si encontramos umbral
    if (this.thresholdFound()) {
      this.saveThreshold();
      this.testNextFrequency();
    } else {
      this.presentTone(this.currentFreq, this.currentEar, this.currentLevel);
    }
  }

  adjustStepSize() {
    if (this.reversals === 1) this.stepSize = 5;
    if (this.reversals === 2) this.stepSize = 2;
  }

  thresholdFound() {
    // 2 respuestas positivas consecutivas al mismo nivel
    const recent = this.responsesAtLevel.slice(-2);
    if (recent.length === 2 &&
        recent[0].response && recent[1].response &&
        Math.abs(recent[0].level - recent[1].level) <= 2) {
      return true;
    }

    // O 3 respuestas positivas en rango de 5 dB
    const recentThree = this.responsesAtLevel.slice(-3).filter(r => r.response);
    if (recentThree.length === 3) {
      const levels = recentThree.map(r => r.level);
      const range = Math.max(...levels) - Math.min(...levels);
      if (range <= 5) return true;
    }

    return false;
  }

  saveThreshold() {
    const threshold = Math.round(this.currentLevel);
    if (!this.results[this.currentFreq]) {
      this.results[this.currentFreq] = {};
    }
    this.results[this.currentFreq][this.currentEar] = threshold;
  }

  async testNextFrequency() {
    // Lógica para seleccionar siguiente frecuencia/oído
    // ...
  }

  // Convertir dB HL a ganancia lineal (simplificado)
  dbToGain(dbHL) {
    // Normalización simplificada: 0 dB HL = ganancia 0.3
    // Cada 10 dB = 3.16x cambio
    const referenceGain = 0.3;
    const gainDB = dbHL - 0; // 0 dB HL como referencia
    return referenceGain * Math.pow(10, gainDB / 20);
  }

  // Canvas para dibujar audiograma
  drawAudiogram(canvasId) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');

    // Implementación de gráfica audiométrica
    // ...
  }

  // Identificar frecuencias problema
  identifyProblemFrequencies() {
    const problems = [];
    const freqsSorted = Object.keys(this.results).sort((a, b) => a - b);

    for (let i = 1; i < freqsSorted.length; i++) {
      const prevFreq = freqsSorted[i-1];
      const currFreq = freqsSorted[i];

      ['left', 'right'].forEach(ear => {
        const prevLevel = this.results[prevFreq][ear];
        const currLevel = this.results[currFreq][ear];
        const drop = currLevel - prevLevel;

        if (drop > 20) {
          problems.push({
            frequency: currFreq,
            ear: ear,
            severity: drop > 40 ? 'severa' : drop > 30 ? 'moderada-severa' : 'moderada',
            threshold: currLevel
          });
        }
      });
    }

    return problems;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

## 🎯 MÓDULO 2: BÚSQUEDA MANUAL FINA DE TINNITUS

### Objetivo
Permitir al usuario **identificar con precisión** la frecuencia exacta de su tinnitus mediante:
- Búsqueda guiada en rangos problemáticos
- Slider continuo de frecuencias
- Comparación A/B
- Validación cruzada

### Flujo de Búsqueda

```
ETAPA 1: Identificación de Rango Amplio
┌────────────────────────────────────────┐
│  Basado en audiometría, detectamos:    │
│  posibles rangos de tinnitus:          │
│                                        │
│  ◉ 3000-5000 Hz (zona de caída)        │
│  ○ 6000-8000 Hz (zona de caída)        │
│  ○ Otra frecuencia                     │
└────────────────────────────────────────┘

ETAPA 2: Búsqueda Gruesa (Octavas)
┌────────────────────────────────────────┐
│  Escucha cada frecuencia y compara     │
│  con tu tinnitus:                      │
│                                        │
│  [Reproducir] 3000 Hz  [Más cerca]     │
│  [Reproducir] 4000 Hz  [ES ESTA! ✓]    │
│  [Reproducir] 5000 Hz  [Más cerca]     │
└────────────────────────────────────────┘

ETAPA 3: Refinamiento (Semitonos)
┌────────────────────────────────────────┐
│  Rango seleccionado: 4000 Hz           │
│  Ahora busquemos el tono exacto:       │
│                                        │
│  3500 Hz ─○────────────────── 4500 Hz  │
│           │                             │
│         [4237 Hz] ← Ajusta              │
│                                        │
│  [▶ Reproducir tono de prueba]         │
│                                        │
│  ¿Coincide con tu tinnitus?            │
│  [ Muy bajo ] [ Cercano ] [ EXACTO ]   │
└────────────────────────────────────────┘

ETAPA 4: Ajuste Fino (pasos de 25 Hz)
┌────────────────────────────────────────┐
│  Último ajuste:                        │
│                                        │
│  4200 Hz ─────○─────── 4300 Hz         │
│              4237 Hz                   │
│                                        │
│  [◀ -25Hz]  [▶ PLAY]  [+25Hz ▶]       │
│                                        │
│  Volumen del tono:  [▬▬▬▬▬○▬▬▬]        │
│                                        │
│  [ Confirmar esta frecuencia ]         │
└────────────────────────────────────────┘

ETAPA 5: Validación Cruzada
┌────────────────────────────────────────┐
│  Test de Comparación A/B               │
│                                        │
│  Sonido A: ¿Es tu tinnitus?            │
│  [▶ Reproducir A]  [ Sí ] [ No ]       │
│                                        │
│  Sonido B: ¿Es tu tinnitus?            │
│  [▶ Reproducir B]  [ Sí ] [ No ]       │
│                                        │
│  (Uno es tu frecuencia identificada,   │
│   otro es +/- 200 Hz)                  │
└────────────────────────────────────────┘

SALIDA:
✓ Frecuencia de tinnitus: 4237 Hz
✓ Confianza: Alta (95%)
✓ Oído dominante: Derecho
✓ Tipo: Tonal puro
✓ Loudness subjetivo: 6/10
```

### Interfaz Principal

```html
┌─────────────────────────────────────────────────────────┐
│  IDENTIFICACIÓN DE TINNITUS - Búsqueda Fina             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Paso 2 de 5: Búsqueda Gruesa                          │
│  [▰▰▰▰▱▱▱▱▱▱] 40%                                       │
│                                                         │
│  ╔═══════════════════════════════════════════════════╗ │
│  ║                                                   ║ │
│  ║   Escucha cada tono y selecciona el que más se   ║ │
│  ║   parezca al sonido de tu tinnitus:              ║ │
│  ║                                                   ║ │
│  ║   ┌────────────────────────────────────────┐     ║ │
│  ║   │  Frecuencia  │  Acción  │   Similitud  │     ║ │
│  ║   ├────────────────────────────────────────┤     ║ │
│  ║   │   3000 Hz    │ [▶ Play] │   ★★☆☆☆      │     ║ │
│  ║   │   3500 Hz    │ [▶ Play] │   ★★★☆☆      │     ║ │
│  ║   │   4000 Hz    │ [▶ Play] │   ★★★★★  ✓   │     ║ │
│  ║   │   4500 Hz    │ [▶ Play] │   ★★★☆☆      │     ║ │
│  ║   │   5000 Hz    │ [▶ Play] │   ★★☆☆☆      │     ║ │
│  ║   └────────────────────────────────────────┘     ║ │
│  ║                                                   ║ │
│  ╚═══════════════════════════════════════════════════╝ │
│                                                         │
│  Selección actual: 4000 Hz (Coincidencia alta)         │
│                                                         │
│  Consejos:                                              │
│  • Reproduce cada tono varias veces                     │
│  • Compara mentalmente con tu tinnitus                  │
│  • Si ninguno coincide, ajusta manualmente              │
│                                                         │
│  [ ← Anterior ]        [ Continuar → ]                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Slider de Frecuencia Continua

```html
┌─────────────────────────────────────────────────────────┐
│  AJUSTE FINO - Control Manual                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Frecuencia Actual: 4237 Hz                       │ │
│  │                                                   │ │
│  │  20 Hz ━━━━━━━━━━━━━━●━━━━━━━━━━━━━ 20000 Hz     │ │
│  │                    4237                           │ │
│  │                                                   │ │
│  │  Zoom: 3500 Hz ━━━━━━●━━━━━━ 4500 Hz             │ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Controles Rápidos:                                     │
│  [◀◀ -100] [◀ -25] [◀ -10] [▶ PLAY] [+10 ▶] [+25 ▶] [+100 ▶▶] │
│                                                         │
│  Volumen: [▬▬▬▬▬▬○▬▬▬] 65%                              │
│                                                         │
│  Tipo de onda:                                          │
│  ◉ Tono puro (sine)  ○ Compleja  ○ Ruido estrecho      │
│                                                         │
│  Comparación lado a lado:                               │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │   Tu Tinnitus    │  │  Tono Generado   │            │
│  │                  │  │                  │            │
│  │   (Imaginario)   │  │   [▶ 4237 Hz]    │            │
│  │                  │  │                  │            │
│  └──────────────────┘  └──────────────────┘            │
│                                                         │
│  ¿Qué tan cerca está?                                   │
│  Muy lejos ○─○─○─●─○ Exacto                            │
│                                                         │
│  [ Guardar esta frecuencia ]                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Implementación Técnica

```javascript
// tinnitus-matcher.js

class TinnitusMatcher {
  constructor(audiometryResults) {
    this.audioContext = new AudioContext();
    this.audiometryResults = audiometryResults;
    this.currentFrequency = 4000;
    this.matchConfidence = 0;
    this.oscillator = null;
    this.gainNode = null;
  }

  // Identificar rangos sospechosos de audiometría
  identifySuspiciousRanges() {
    const problems = this.audiometryResults.problemFrequencies || [];

    // Frecuencias con caídas auditivas son candidatas
    const ranges = problems.map(p => {
      return {
        center: parseInt(p.frequency),
        min: parseInt(p.frequency) * 0.7,
        max: parseInt(p.frequency) * 1.3,
        severity: p.severity
      };
    });

    // Agregar rango común de tinnitus si no hay problemas
    if (ranges.length === 0) {
      ranges.push({ center: 4000, min: 2000, max: 8000, severity: 'unknown' });
    }

    return ranges;
  }

  // Búsqueda gruesa por octavas
  async coarseSearch(range) {
    const frequencies = this.generateOctaveSteps(range.min, range.max);
    return frequencies;
  }

  generateOctaveSteps(min, max) {
    const steps = [];
    let current = min;
    while (current <= max) {
      steps.push(Math.round(current));
      current *= Math.pow(2, 1/3); // Pasos de 1/3 octava (aprox semitonos)
    }
    return steps;
  }

  // Reproducir tono de matching
  playMatchingTone(frequency, volume = 0.3, duration = null) {
    this.stopTone(); // Detener tono anterior

    this.oscillator = this.audioContext.createOscillator();
    this.gainNode = this.audioContext.createGain();

    this.oscillator.frequency.value = frequency;
    this.oscillator.type = 'sine';

    this.gainNode.gain.value = volume;

    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);

    this.oscillator.start();

    if (duration) {
      this.oscillator.stop(this.audioContext.currentTime + duration);
    }
  }

  stopTone() {
    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator = null;
    }
  }

  // Ajuste fino con slider
  adjustFrequency(delta) {
    this.currentFrequency = Math.max(20, Math.min(20000, this.currentFrequency + delta));
    return this.currentFrequency;
  }

  // Test de validación A/B
  async abValidation(userFrequency) {
    const testFrequencies = [
      userFrequency,
      userFrequency * 0.95, // -5%
      userFrequency * 1.05  // +5%
    ].sort(() => Math.random() - 0.5); // Randomizar orden

    return testFrequencies;
  }

  // Calcular confianza del match
  calculateConfidence(userRatings) {
    // userRatings = [1, 2, 3, 4, 5] donde 5 = exacto
    const avgRating = userRatings.reduce((a, b) => a + b) / userRatings.length;
    return (avgRating / 5) * 100; // 0-100%
  }

  // Guardar resultado
  saveMatch(frequency, confidence, ear, type) {
    const match = {
      frequency: Math.round(frequency),
      confidence: confidence,
      ear: ear,
      type: type, // 'pure_tone', 'complex', 'noise'
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('tinnitus_match', JSON.stringify(match));
    return match;
  }

  loadMatch() {
    const stored = localStorage.getItem('tinnitus_match');
    return stored ? JSON.parse(stored) : null;
  }
}
```

---

## 🎵 MÓDULO 3: TRATAMIENTO CON SONIDOS ESCALONADOS

### Objetivo
Ofrecer múltiples opciones de tratamiento sonoro personalizado:
1. **Terapia Notched** (sonido con muesca)
2. **Neuromodulación CR** (Coordinated Reset)
3. **Terapia de Enmascaramiento** (masking)
4. **Sonidos Ambientales Terapéuticos**
5. **Terapia Combinada Escalonada**

### Opciones de Tratamiento

```
┌─────────────────────────────────────────────────────────┐
│  SELECCIÓN DE TRATAMIENTO                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Tu Perfil:                                             │
│  • Tinnitus: 4237 Hz, Oído Derecho                      │
│  • Tipo: Tonal puro                                     │
│  • Severidad: Moderada (THI: 42)                        │
│  • Perfil auditivo: Caída en 4-6 kHz                    │
│                                                         │
│  ──────────────────────────────────────────────────     │
│                                                         │
│  TRATAMIENTOS RECOMENDADOS:                             │
│                                                         │
│  ╔═══════════════════════════════════════════════════╗ │
│  ║ 1️⃣ TERAPIA NOTCHED (Recomendado)                  ║ │
│  ║    Ruido blanco con "muesca" en 4237 Hz           ║ │
│  ║    ✓ Basado en evidencia científica               ║ │
│  ║    ✓ Efectividad: 65-75%                          ║ │
│  ║    Duration: 30min/día × 8-12 semanas             ║ │
│  ║    [▶ Probar]  [📖 Info]  [ Iniciar ]             ║ │
│  ╚═══════════════════════════════════════════════════╝ │
│                                                         │
│  ╔═══════════════════════════════════════════════════╗ │
│  ║ 2️⃣ NEUROMODULACIÓN CR                             ║ │
│  ║    4 tonos alrededor de 4237 Hz en patrón         ║ │
│  ║    ✓ Protocolo Tass et al.                        ║ │
│  ║    ✓ Efectividad: 50-60%                          ║ │
│  ║    Duration: 3× 10min/día × 12 semanas            ║ │
│  ║    [▶ Probar]  [📖 Info]  [ Iniciar ]             ║ │
│  ╚═══════════════════════════════════════════════════╝ │
│                                                         │
│  ╔═══════════════════════════════════════════════════╗ │
│  ║ 3️⃣ ENMASCARAMIENTO SONORO                         ║ │
│  ║    Sonidos de banda ancha para cubrir tinnitus    ║ │
│  ║    ○ Alivio inmediato pero temporal               ║ │
│  ║    ○ Efectividad: Variable                        ║ │
│  ║    Duration: Según necesidad                      ║ │
│  ║    [▶ Probar]  [📖 Info]  [ Iniciar ]             ║ │
│  ╚═══════════════════════════════════════════════════╝ │
│                                                         │
│  ╔═══════════════════════════════════════════════════╗ │
│  ║ 4️⃣ SONIDOS AMBIENTALES                            ║ │
│  ║    Lluvia, olas, bosque, ruido marrón             ║ │
│  ║    ○ Relajación y distracción                     ║ │
│  ║    ○ Efectividad: Habituación                     ║ │
│  ║    Duration: Según preferencia                    ║ │
│  ║    [▶ Probar]  [📖 Info]  [ Iniciar ]             ║ │
│  ╚═══════════════════════════════════════════════════╝ │
│                                                         │
│  ╔═══════════════════════════════════════════════════╗ │
│  ║ 5️⃣ TERAPIA ESCALONADA COMBINADA ⭐                ║ │
│  ║    Protocolo inteligente de 12 semanas            ║ │
│  ║    Semanas 1-4:  Notched Sound 30min/día          ║ │
│  ║    Semanas 5-8:  CR + Notched 20min/día           ║ │
│  ║    Semanas 9-12: Ajuste según progreso            ║ │
│  ║    [▶ Probar]  [📖 Info]  [ Iniciar ]             ║ │
│  ╚═══════════════════════════════════════════════════╝ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Interfaz de Sesión de Tratamiento

```html
┌─────────────────────────────────────────────────────────┐
│  SESIÓN DE TRATAMIENTO - Terapia Notched                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Sesión 5 de 84  •  Día 3 de Semana 1                  │
│  Protocolo: Notched Sound @ 4237 Hz                     │
│                                                         │
│  ╔═══════════════════════════════════════════════════╗ │
│  ║                                                   ║ │
│  ║           [▐▐]  REPRODUCIENDO                     ║ │
│  ║                                                   ║ │
│  ║     ━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━           ║ │
│  ║     12:34 / 30:00                                 ║ │
│  ║                                                   ║ │
│  ║     [◀◀]  [▐▐ Pausar]  [▶▶]  [■ Detener]         ║ │
│  ║                                                   ║ │
│  ╚═══════════════════════════════════════════════════╝ │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  CONTROLES                                      │   │
│  │                                                 │   │
│  │  Volumen Principal:  [▬▬▬▬▬▬▬○▬▬▬] 70%         │   │
│  │                                                 │   │
│  │  Frecuencia Notch:  4237 Hz  [Ajustar]         │   │
│  │  Ancho de Notch:    Estrecho ▼                 │   │
│  │                                                 │   │
│  │  Mezcla (opcional):                             │   │
│  │  ┌─ Ruido Blanco     100% ━●━━━━━━━━ 0%        │   │
│  │  ┌─ Ruido Rosa        80% ━━●━━━━━━━ 0%        │   │
│  │  └─ Sonido Ambiental   0% ━━━━━━━━━● 50%       │   │
│  │     (Lluvia)                                    │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  VISUALIZACIÓN                                  │   │
│  │                                                 │   │
│  │  Espectro de Frecuencias:                       │   │
│  │   │▌▌▌▌▌▌▌▌▌▌  ░  ▌▌▌▌▌▌▌▌▌▌│                 │   │
│  │   │            4237           │                 │   │
│  │   │           (notch)         │                 │   │
│  │   20Hz ────────────────── 20kHz                 │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Notas de la sesión (opcional):                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ¿Cómo te sientes? ¿Cambios en el tinnitus?     │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Temporizador automático: ✓                             │
│  Detener al finalizar:    ✓                             │
│  Fade out final:          ✓ (10 segundos)               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Implementación de Motores de Tratamiento

```javascript
// treatment-engines.js

class TreatmentEngineBase {
  constructor(audioContext, tinnitusFreq) {
    this.audioContext = audioContext;
    this.tinnitusFreq = tinnitusFreq;
    this.masterGain = audioContext.createGain();
    this.masterGain.connect(audioContext.destination);
    this.isPlaying = false;
  }

  setVolume(volume) {
    this.masterGain.gain.value = volume;
  }

  stop() {
    this.isPlaying = false;
    // Implementado por subclases
  }
}

// 1. Motor de Terapia Notched
class NotchedSoundEngine extends TreatmentEngineBase {
  constructor(audioContext, tinnitusFreq, notchWidth = 0.5) {
    super(audioContext, tinnitusFreq);
    this.notchWidth = notchWidth; // Octavas
    this.setupNotchedNoise();
  }

  setupNotchedNoise() {
    // Crear buffer de ruido blanco
    const bufferSize = this.audioContext.sampleRate * 2;
    const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1; // Ruido blanco
      }
    }

    this.noiseSource = this.audioContext.createBufferSource();
    this.noiseSource.buffer = buffer;
    this.noiseSource.loop = true;

    // Crear filtro notch
    this.notchFilter = this.audioContext.createBiquadFilter();
    this.notchFilter.type = 'notch';
    this.notchFilter.frequency.value = this.tinnitusFreq;
    this.notchFilter.Q.value = 10; // Q alto = notch estrecho

    // Conectar: Ruido → Notch → Master Gain → Salida
    this.noiseSource.connect(this.notchFilter);
    this.notchFilter.connect(this.masterGain);
  }

  play() {
    if (!this.isPlaying) {
      this.noiseSource.start();
      this.isPlaying = true;
    }
  }

  stop() {
    if (this.isPlaying) {
      this.noiseSource.stop();
      this.isPlaying = false;
    }
  }

  adjustNotchFrequency(newFreq) {
    this.tinnitusFreq = newFreq;
    this.notchFilter.frequency.value = newFreq;
  }

  adjustNotchWidth(octaves) {
    // Q = frecuencia_centro / ancho_banda
    // ancho_banda = frecuencia_centro / Q
    const Q = 1 / octaves; // Simplificado
    this.notchFilter.Q.value = Math.max(0.1, Math.min(100, Q));
  }
}

// 2. Motor de Neuromodulación CR
class CRNeuromodulationEngine extends TreatmentEngineBase {
  constructor(audioContext, tinnitusFreq) {
    super(audioContext, tinnitusFreq);
    this.oscillators = [];
    this.setupCRFrequencies();
  }

  setupCRFrequencies() {
    // Protocolo CR: 4 frecuencias
    this.crFrequencies = [
      this.tinnitusFreq * 0.77,  // f1
      this.tinnitusFreq * 0.90,  // f2
      this.tinnitusFreq * 1.11,  // f3
      this.tinnitusFreq * 1.30   // f4
    ];
  }

  async play() {
    this.isPlaying = true;
    await this.playCRCycle();
  }

  async playCRCycle() {
    // Patrón CR: 3 ciclos de 4 tonos en orden aleatorio
    const cycles = 3;
    const toneDuration = 0.08; // 80ms
    const toneGap = 0.12; // 120ms

    for (let cycle = 0; cycle < cycles; cycle++) {
      if (!this.isPlaying) break;

      // Randomizar orden de frecuencias
      const shuffled = [...this.crFrequencies].sort(() => Math.random() - 0.5);

      for (let freq of shuffled) {
        if (!this.isPlaying) break;

        await this.playTone(freq, toneDuration);
        await this.sleep(toneGap * 1000);
      }
    }

    // Esperar inter-ciclo (variable)
    await this.sleep(1000 + Math.random() * 1000); // 1-2s

    if (this.isPlaying) {
      this.playCRCycle(); // Repetir
    }
  }

  async playTone(frequency, duration) {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.frequency.value = frequency;
    osc.type = 'sine';

    // Envelope: fade in/out rápido
    const now = this.audioContext.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.01); // Fade in 10ms
    gain.gain.linearRampToValueAtTime(0, now + duration); // Fade out

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);

    this.oscillators.push(osc);

    return new Promise(resolve => setTimeout(resolve, duration * 1000));
  }

  stop() {
    this.isPlaying = false;
    this.oscillators.forEach(osc => {
      try { osc.stop(); } catch (e) {}
    });
    this.oscillators = [];
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 3. Motor de Enmascaramiento
class MaskingSoundEngine extends TreatmentEngineBase {
  constructor(audioContext, maskingType = 'white') {
    super(audioContext, 0);
    this.maskingType = maskingType;
    this.setupMaskingSound();
  }

  setupMaskingSound() {
    const bufferSize = this.audioContext.sampleRate * 2;
    const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);

      if (this.maskingType === 'white') {
        // Ruido blanco
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
      } else if (this.maskingType === 'pink') {
        // Ruido rosa (aproximación simple)
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          data[i] *= 0.11; // Normalizar
          b6 = white * 0.115926;
        }
      } else if (this.maskingType === 'brown') {
        // Ruido marrón
        let last = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (last + (0.02 * white)) / 1.02;
          last = data[i];
          data[i] *= 3.5; // Amplificar
        }
      }
    }

    this.source = this.audioContext.createBufferSource();
    this.source.buffer = buffer;
    this.source.loop = true;
    this.source.connect(this.masterGain);
  }

  play() {
    if (!this.isPlaying) {
      this.source.start();
      this.isPlaying = true;
    }
  }

  stop() {
    if (this.isPlaying) {
      this.source.stop();
      this.isPlaying = false;
    }
  }
}

// 4. Motor de Sonidos Ambientales
class AmbientSoundEngine extends TreatmentEngineBase {
  constructor(audioContext, soundType = 'rain') {
    super(audioContext, 0);
    this.soundType = soundType;
    this.setupAmbientSound();
  }

  setupAmbientSound() {
    // Para MVP: generar síntesis de sonidos
    // Para producción: cargar samples reales

    if (this.soundType === 'rain') {
      this.generateRainSound();
    } else if (this.soundType === 'ocean') {
      this.generateOceanSound();
    } else if (this.soundType === 'forest') {
      this.generateForestSound();
    }
  }

  generateRainSound() {
    // Síntesis simple de lluvia: ruido blanco filtrado + gotas aleatorias
    const bufferSize = this.audioContext.sampleRate * 4;
    const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);

      // Base: ruido blanco filtrado (paso-bajo)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3;
      }

      // Gotas aleatorias
      for (let i = 0; i < bufferSize; i += Math.floor(Math.random() * 1000) + 100) {
        const amplitude = Math.random() * 0.5;
        const duration = 100;
        for (let j = 0; j < duration && i + j < bufferSize; j++) {
          data[i + j] += amplitude * Math.exp(-j / 20) * (Math.random() * 2 - 1);
        }
      }
    }

    this.source = this.audioContext.createBufferSource();
    this.source.buffer = buffer;
    this.source.loop = true;

    // Filtro paso-bajo para suavizar
    const lowpass = this.audioContext.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 3000;

    this.source.connect(lowpass);
    lowpass.connect(this.masterGain);
  }

  generateOceanSound() {
    // Olas: LFO modulando ruido blanco filtrado
    // Simplificado para MVP
    const bufferSize = this.audioContext.sampleRate * 8;
    const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      const waveFreq = 0.2; // Hz (olas lentas)

      for (let i = 0; i < bufferSize; i++) {
        const t = i / this.audioContext.sampleRate;
        const wave = Math.sin(2 * Math.PI * waveFreq * t) * 0.5 + 0.5;
        const noise = Math.random() * 2 - 1;
        data[i] = noise * wave * 0.4;
      }
    }

    this.source = this.audioContext.createBufferSource();
    this.source.buffer = buffer;
    this.source.loop = true;

    const lowpass = this.audioContext.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 2000;

    this.source.connect(lowpass);
    lowpass.connect(this.masterGain);
  }

  generateForestSound() {
    // Bosque: ruido rosa + pájaros ocasionales
    // Simplificado
    const bufferSize = this.audioContext.sampleRate * 6;
    const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);

      // Ruido rosa de fondo
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (last + (0.02 * white)) / 1.02;
        last = data[i];
        data[i] *= 0.2;
      }
    }

    this.source = this.audioContext.createBufferSource();
    this.source.buffer = buffer;
    this.source.loop = true;
    this.source.connect(this.masterGain);
  }

  play() {
    if (!this.isPlaying) {
      this.source.start();
      this.isPlaying = true;
    }
  }

  stop() {
    if (this.isPlaying) {
      this.source.stop();
      this.isPlaying = false;
    }
  }
}

// 5. Motor de Terapia Escalonada Combinada
class SteppedTherapyEngine {
  constructor(audioContext, tinnitusProfile) {
    this.audioContext = audioContext;
    this.tinnitusProfile = tinnitusProfile;
    this.currentWeek = 1;
    this.currentEngine = null;
    this.setupProtocol();
  }

  setupProtocol() {
    // Protocol de 12 semanas
    this.protocol = {
      weeks_1_4: {
        name: 'Notched Sound Phase',
        engine: 'notched',
        duration: 30, // minutos
        sessionsPerDay: 1,
        settings: {
          notchWidth: 0.5,
          volume: 0.6
        }
      },
      weeks_5_8: {
        name: 'CR + Notched Combination',
        engine: 'combined',
        cr_duration: 10,
        notched_duration: 20,
        sessionsPerDay: 1,
        settings: {
          crVolume: 0.4,
          notchedVolume: 0.5
        }
      },
      weeks_9_12: {
        name: 'Adaptive Phase',
        engine: 'adaptive', // Selección según progreso
        duration: 30,
        sessionsPerDay: 1
      }
    };
  }

  getEngineForWeek(week) {
    if (week <= 4) {
      return new NotchedSoundEngine(
        this.audioContext,
        this.tinnitusProfile.frequency,
        this.protocol.weeks_1_4.settings.notchWidth
      );
    } else if (week <= 8) {
      // Combinación: CR primero, luego Notched
      // Por simplicidad, retornamos Notched (en producción, alternar)
      return new NotchedSoundEngine(
        this.audioContext,
        this.tinnitusProfile.frequency
      );
    } else {
      // Fase adaptativa: basado en progreso del usuario
      // Por ahora, continuar con Notched
      return new NotchedSoundEngine(
        this.audioContext,
        this.tinnitusProfile.frequency
      );
    }
  }

  startSession(week = this.currentWeek) {
    this.currentWeek = week;
    this.currentEngine = this.getEngineForWeek(week);
    this.currentEngine.play();
  }

  stopSession() {
    if (this.currentEngine) {
      this.currentEngine.stop();
    }
  }

  updateWeek(week) {
    this.currentWeek = week;
  }

  getProtocolDescription(week) {
    if (week <= 4) return this.protocol.weeks_1_4;
    if (week <= 8) return this.protocol.weeks_5_8;
    return this.protocol.weeks_9_12;
  }
}
```

---

## 📂 ESTRUCTURA DE ARCHIVOS DEL MVP

```
tinnitus-mvp/
│
├── index.html                 # Landing page
├── audiometry.html            # Módulo 1: Audiometría
├── matching.html              # Módulo 2: Búsqueda tinnitus
├── treatment.html             # Módulo 3: Tratamiento
├── results.html               # Visualización de resultados
│
├── css/
│   ├── reset.css              # CSS reset
│   ├── variables.css          # Variables CSS (colores, fuentes)
│   ├── global.css             # Estilos globales
│   ├── audiometry.css         # Estilos específicos audiometría
│   ├── matching.css           # Estilos búsqueda
│   └── treatment.css          # Estilos tratamiento
│
├── js/
│   ├── utils.js               # Utilidades generales
│   ├── storage.js             # LocalStorage manager
│   ├── audio-context.js       # Inicialización AudioContext
│   │
│   ├── audiometry/
│   │   ├── audiometry-engine.js    # Motor de audiometría
│   │   ├── audiometry-ui.js        # Interfaz audiometría
│   │   └── audiogram-chart.js      # Dibujo de audiograma
│   │
│   ├── matching/
│   │   ├── tinnitus-matcher.js     # Motor de matching
│   │   ├── frequency-slider.js     # Slider de frecuencia
│   │   └── ab-validator.js         # Test A/B
│   │
│   └── treatment/
│       ├── treatment-engines.js    # Motores de tratamiento
│       ├── treatment-ui.js         # Interfaz de sesión
│       ├── session-timer.js        # Temporizador
│       └── audio-visualizer.js     # Visualización espectro
│
├── assets/
│   ├── icons/                 # Iconos SVG
│   └── sounds/                # (Opcional) Samples de audio
│
├── data/
│   └── protocols.json         # Protocolos de tratamiento
│
└── README.md                  # Documentación
```

---

## 🎨 DISEÑO VISUAL

### Paleta de Colores
```css
:root {
  /* Colores primarios */
  --primary-blue: #3B82F6;
  --primary-dark: #1E40AF;
  --primary-light: #93C5FD;

  /* Colores secundarios */
  --secondary-green: #10B981;
  --secondary-orange: #F59E0B;
  --secondary-red: #EF4444;

  /* Neutrales */
  --bg-primary: #F9FAFB;
  --bg-secondary: #FFFFFF;
  --bg-tertiary: #E5E7EB;
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --border: #D1D5DB;

  /* Audio específico */
  --audio-active: #10B981;
  --audio-inactive: #9CA3AF;
  --waveform-color: #3B82F6;
}
```

### Tipografía
```css
:root {
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
}
```

---

## ⏱️ TIMELINE DE DESARROLLO MVP

### Sprint 1 (Semana 1): Setup y Módulo Base
- [ ] Estructura de archivos
- [ ] HTML/CSS base responsive
- [ ] Sistema de navegación entre módulos
- [ ] LocalStorage manager
- [ ] AudioContext wrapper

### Sprint 2 (Semana 2): Audiometría - Motor
- [ ] Algoritmo de staircase adaptativo
- [ ] Randomización de frecuencias/oídos
- [ ] Generación de tonos puros
- [ ] Captura de respuestas
- [ ] Cálculo de umbrales

### Sprint 3 (Semana 3): Audiometría - UI y Visualización
- [ ] Interfaz de testing
- [ ] Progress bar
- [ ] Dibujo de audiograma en Canvas
- [ ] Identificación de frecuencias problema
- [ ] Guardado de resultados

### Sprint 4 (Semana 4): Búsqueda de Tinnitus
- [ ] Búsqueda gruesa por octavas
- [ ] Slider de frecuencia continua
- [ ] Comparación A/B
- [ ] Ajuste fino (pasos de 25 Hz)
- [ ] Validación y guardado

### Sprint 5 (Semana 5): Tratamiento - Motores
- [ ] NotchedSoundEngine
- [ ] CRNeuromodulationEngine
- [ ] MaskingSoundEngine
- [ ] AmbientSoundEngine
- [ ] SteppedTherapyEngine

### Sprint 6 (Semana 6): Tratamiento - UI
- [ ] Selector de terapias
- [ ] Interfaz de sesión
- [ ] Controles de reproducción
- [ ] Mixer de volúmenes
- [ ] Session timer con auto-stop
- [ ] Visualización de espectro

### Sprint 7 (Semana 7): Integración y Pulido
- [ ] Flujo completo end-to-end
- [ ] Validaciones y manejo de errores
- [ ] Responsive design refinado
- [ ] Animaciones y transiciones
- [ ] Accesibilidad (ARIA, keyboard nav)

### Sprint 8 (Semana 8): Testing y Documentación
- [ ] Testing funcional completo
- [ ] Testing en múltiples navegadores
- [ ] Testing en dispositivos móviles
- [ ] Manual de usuario
- [ ] Documentación técnica
- [ ] Deploy inicial

**DURACIÓN TOTAL: 8 SEMANAS**

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

1. **Crear estructura de carpetas** según arquitectura definida
2. **Inicializar HTML base** con navegación
3. **Implementar AudioContext singleton** compartido
4. **Comenzar con módulo de audiometría** (prioridad)
5. **Testing iterativo** con usuarios reales

---

**¿Deseas que genere el código inicial para algún módulo específico?**

Por ejemplo:
- `index.html` completo con navegación
- `audiometry-engine.js` con algoritmo adaptativo
- `notched-sound-engine.js` completo
- CSS completo con sistema de diseño

¡Dime por dónde empezamos! 🎯
