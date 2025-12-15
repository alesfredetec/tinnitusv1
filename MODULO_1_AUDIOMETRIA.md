# 📊 Módulo 1: Audiometría Adaptativa de 2 Etapas

**Estado:** ✅ Completado (Sprint 2-3)
**Duración:** 15-25 minutos
**Archivo:** `audiometry.html`

---

## 🎯 Objetivo

Sistema de audiometría automática con **dos etapas** para identificar umbrales auditivos y detectar frecuencias problema con precisión, especialmente en el rango donde ocurre el tinnitus (4000-7000 Hz).

---

## 🏗️ Arquitectura

```
AudiometryEngine (Motor)
    ↓
    ├─ Etapa 1: Audiometría Estándar (13 frecuencias)
    │   ├─ Algoritmo Adaptativo (Staircase Method)
    │   ├─ Randomización
    │   ├─ Catch Trials (10%)
    │   └─ Detección de umbrales
    │
    ├─ Análisis de Resultados
    │   └─ Identificación de problemas
    │
    └─ Etapa 2: Micro-audiometría Automática
        ├─ Escaneo fino (100 Hz steps)
        ├─ Foco: 4000-7000 Hz
        └─ Rango: ±500 Hz

AudiometryUI (Interfaz)
    ↓
    ├─ Pantallas: Welcome → Calibration → Testing → Results
    ├─ Visualización en Canvas (Audiograma)
    └─ Exportación de resultados
```

---

## 📋 Flujo de Usuario

### 1️⃣ Pantalla de Bienvenida
- Información sobre el proceso
- Instrucciones claras
- Disclaimer médico
- Botón: "Comenzar Calibración"

### 2️⃣ Calibración de Volumen
- Tono de prueba: 1000 Hz
- Slider de volumen (0-100%)
- Ajuste a nivel cómodo
- Botón: "Calibración Correcta"

### 3️⃣ Pantalla de Testing

#### Etapa 1: Audiometría Estándar
- **Frecuencias testeadas:** 125, 250, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, 8000, 10000, 12000 Hz
- **Orden:** Aleatorizado (shuffle)
- **Oídos:** Ambos (izquierdo y derecho)
- **Total de tests:** 26 (13 frecuencias × 2 oídos)

**Visualización:**
```
┌──────────────────────────────────────┐
│ Etapa 1: Audiometría Estándar       │
│ ████████████░░░░░░░░░░  12/26 (46%) │
│                                      │
│        5000 Hz                       │
│    Oído Derecho                      │
│    Nivel: 35 dB HL                   │
│                                      │
│  🎵 Escuchando...                    │
│  ¿Puedes oír el tono?                │
│                                      │
│  [✓ Escuché el Tono] (pulsando)     │
└──────────────────────────────────────┘
```

#### Etapa 2: Micro-audiometría (Automática)
- Se activa **automáticamente** si se detectan:
  - Caídas > 20 dB entre frecuencias adyacentes
  - Umbrales > 30 dB en rango 4000-7000 Hz
  - Cualquier cambio > 15 dB en rango crítico

**Características:**
- **Paso:** 100 Hz
- **Rango:** ±500 Hz alrededor del problema
- **Ejemplo:** Si problema en 5000 Hz → escanea 4500-5500 Hz
- **Prioridad:** Alta para rango 4000-7000 Hz

**Visualización:**
```
┌──────────────────────────────────────┐
│ Etapa 2: Micro-audiometría (2 áreas)│
│ ████████████████░░░░░░  34/42 (81%) │
│                                      │
│      🔍 Micro-audiometría activada   │
│   Escaneo fino con pasos de 100 Hz  │
│                                      │
│        5300 Hz                       │
│    Oído Izquierdo                    │
│    Nivel: 42 dB HL                   │
└──────────────────────────────────────┘
```

### 4️⃣ Pantalla de Resultados

**Resumen:**
```
┌─────────────────┬─────────────────┐
│ Oído Izquierdo  │ Oído Derecho    │
│   28 dB HL      │   32 dB HL      │
│   [Normal]      │   [Leve]        │
└─────────────────┴─────────────────┘
```

**Audiograma:**
- Gráfico en Canvas con ambos oídos
- Línea azul: Oído izquierdo
- Línea roja: Oído derecho
- Puntos finos: Micro-audiometría

**Frecuencias Problema:**
```
⚠️ 5200 Hz (Izquierdo) - Umbral: 45 dB HL • Caída: 25 dB
⚠️ 6000 Hz (Derecho) - Umbral: 48 dB HL • Caída: 22 dB
```

**Acciones:**
- 💾 Descargar Resultados (JSON)
- ➡️ Continuar a Búsqueda de Tinnitus
- 🔄 Realizar Nueva Audiometría

---

## 🧮 Algoritmo: Staircase Method

### Configuración Inicial
```javascript
{
  minLevel: -10 dB HL,
  maxLevel: 90 dB HL,
  startLevel: 40 dB HL,

  // Tamaños de paso adaptativos
  initialStep: 10 dB,    // Inicial
  smallStep: 5 dB,       // Después del 1er reversal
  fineStep: 2 dB,        // Después del 2do reversal

  toneDuration: 1-2 s (variable),
  toneGap: 1.5-3.5 s (variable),
  responseTimeout: 3000 ms
}
```

### Lógica Adaptativa

```
INICIO: Nivel = 40 dB HL, Paso = 10 dB

┌─────────────────────────────────┐
│ Usuario ESCUCHÓ el tono:        │
│   → Bajar nivel: -10 dB         │
│   → Si dirección anterior = UP  │
│       → REVERSAL detectado      │
│       → Ajustar paso            │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Usuario NO escuchó el tono:     │
│   → Subir nivel: +10 dB         │
│   → Si dirección anterior = DOWN│
│       → REVERSAL detectado      │
│       → Ajustar paso            │
└─────────────────────────────────┘

REVERSALS:
  0 → Paso = 10 dB
  1 → Paso = 5 dB
  2+ → Paso = 2 dB
```

### Criterios de Umbral

El umbral se considera encontrado cuando **cualquiera** de estas condiciones se cumple:

1. **2 respuestas positivas consecutivas** en el mismo nivel (±2 dB)
2. **3 respuestas positivas** dentro de un rango de 5 dB
3. **20 respuestas totales** (límite de seguridad)

Y además:
- Mínimo 2 reversales completados

**Cálculo del umbral:**
```javascript
threshold = average(last_3_positive_responses)
threshold = round(threshold)
```

### Catch Trials

**Probabilidad:** 10% de los trials

- **Objetivo:** Detectar falsos positivos
- **Implementación:** Silencio en lugar de tono
- **Respuesta correcta:** NO presionar el botón
- **Penalización:** Se registra pero no afecta el umbral

---

## 🔬 Micro-audiometría Dinámica

### Detección de Problemas

**Criterios para activar micro-audiometría:**

1. **Caída significativa:**
   ```
   Si (nivel_actual - nivel_anterior) > 20 dB
   ```

2. **Rango crítico de tinnitus (4000-7000 Hz):**
   ```
   Si frecuencia ∈ [4000, 7000] Hz
   Y (nivel_actual - nivel_anterior) > 15 dB
   ```

3. **Umbral elevado en rango crítico:**
   ```
   Si frecuencia ∈ [4000, 7000] Hz
   Y umbral > 30 dB HL
   ```

### Generación de Tests Micro

Para cada problema detectado en frecuencia `F`:

```javascript
// Generar frecuencias a testear
start = F - 500 Hz
end = F + 500 Hz
step = 100 Hz

frequencies = [start, start+100, start+200, ..., end]
// Ejemplo: F=5000 → [4500, 4600, 4700, ..., 5400, 5500]

// Filtrar frecuencias ya testeadas en etapa estándar
frequencies = frequencies.filter(f => !standardFreqs.includes(f))

// Randomizar orden
frequencies = shuffle(frequencies)
```

### Ejemplo Completo

**Etapa 1 - Resultados:**
```
4000 Hz: 25 dB HL
6000 Hz: 48 dB HL  ← Caída de 23 dB (problema detectado)
8000 Hz: 50 dB HL
```

**Etapa 2 - Micro-audiometría en 6000 Hz:**
```
Tests generados:
5500 Hz → 38 dB
5600 Hz → 40 dB
5700 Hz → 42 dB
5800 Hz → 44 dB
5900 Hz → 46 dB
6000 Hz → Ya testeado (skip)
6100 Hz → 49 dB
6200 Hz → 50 dB
6300 Hz → 48 dB
6400 Hz → 47 dB
6500 Hz → 45 dB
```

**Resultado:** Pico exacto de pérdida auditiva identificado en 6100-6200 Hz

---

## 💾 Almacenamiento de Datos

### Estructura en LocalStorage

```javascript
{
  testDate: "2025-12-15T14:30:00.000Z",
  duration: 1234567, // ms

  // Resultados Etapa 1
  results: {
    125: { left: 15, right: 18 },
    250: { left: 18, right: 20 },
    // ... 13 frecuencias
  },

  // Resultados Etapa 2 (si aplica)
  microResults: {
    5500: { left: 38 },
    5600: { left: 40 },
    // ... frecuencias finas
  },

  // Problemas detectados
  problemFrequencies: [
    {
      centerFrequency: 6000,
      ear: "left",
      threshold: 48,
      drop: 23,
      priority: "high"
    }
  ],

  // Análisis
  analysis: {
    averageThreshold: { left: 28, right: 32 },
    hearingLoss: { left: "normal", right: "mild" },
    problemFrequencies: [...],
    asymmetry: [...]
  }
}
```

### Clasificación de Pérdida Auditiva

| Umbral Promedio | Clasificación      |
|-----------------|--------------------|
| ≤ 25 dB HL      | Normal             |
| 26-40 dB HL     | Leve               |
| 41-55 dB HL     | Moderada           |
| 56-70 dB HL     | Moderada-Severa    |
| 71-90 dB HL     | Severa             |
| > 90 dB HL      | Profunda           |

---

## 🎨 Visualización: Audiograma

### Canvas API

**Dimensiones:** 800×400 px
**Márgenes:** top: 40, right: 40, bottom: 60, left: 60

### Escala Logarítmica (Frecuencias)

```javascript
frequencies = [125, 250, 500, 1000, 2000, 4000, 8000]
x = margin.left + ((log(freq) - log(125)) / (log(8000) - log(125))) * graphWidth
```

### Escala Lineal (dB HL)

```javascript
dbLevels = [-10, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90]
y = margin.top + ((db - (-10)) / (90 - (-10))) * graphHeight
```

### Capas del Gráfico

1. **Grid:** Líneas horizontales (dB) y verticales (freq)
2. **Etapa 1:** Líneas gruesas + puntos grandes
   - Azul (#3B82F6): Oído izquierdo
   - Rojo (#EF4444): Oído derecho
3. **Etapa 2:** Líneas finas + puntos pequeños
   - Azul claro (#6699FF): Micro izquierdo
   - Rojo claro (#FF9999): Micro derecho
4. **Leyenda:** Superior izquierda

---

## 🔧 API Pública

### AudiometryEngine

```javascript
const engine = new AudiometryEngine();

// Callbacks
engine.onTonePresented = (freq, ear, level) => { ... };
engine.onResponseRequired = (type) => { ... }; // 'tone' | 'catch'
engine.onThresholdFound = (freq, ear, threshold) => { ... };
engine.onProgress = (completed, total, freq, ear) => { ... };
engine.onStageChange = (stage, problemCount) => { ... }; // 'standard' | 'micro'
engine.onTestComplete = (results, analysis) => { ... };

// Control
await engine.start();
engine.pause();
engine.resume();
engine.stop();

// Respuestas del usuario
engine.userHeard();     // Usuario presionó botón
engine.noResponse();    // Timeout

// Estado
engine.getProgress();   // { stage, completed, total, percentage, ... }
```

### AudiometryUI

```javascript
const ui = new AudiometryUI('audiometry-container');

// Navegación
ui.showWelcome();
ui.startCalibration();
ui.confirmCalibration();
ui.showResults(results, analysis);

// Control
ui.pauseTest();
ui.resumeTest();
ui.stopTest();
ui.restart();

// Acciones
ui.downloadResults();
```

---

## 📊 Métricas y Análisis

### Identificación de Problemas

```javascript
analysis.problemFrequencies = [
  {
    frequency: 6000,
    ear: "left",
    threshold: 48,
    drop: 23,
    severity: "moderate" // 'moderate' | 'moderate-severe' | 'severe'
  }
]

// Severidad
drop > 40 dB → 'severe'
drop > 30 dB → 'moderate-severe'
drop > 20 dB → 'moderate'
```

### Detección de Asimetría

```javascript
analysis.asymmetry = [
  {
    frequency: 4000,
    leftThreshold: 30,
    rightThreshold: 48,
    difference: 18 // > 15 dB = asimetría significativa
  }
]
```

---

## 🧪 Testing

### Modo de Prueba

Para testing rápido, modificar en `audiometry-engine.js`:

```javascript
// Reducir frecuencias de prueba
this.frequencies = [1000, 4000, 8000]; // 3 freq × 2 oídos = 6 tests

// Reducir respuestas mínimas
this.config.responseTimeout = 1000; // 1 segundo
```

### Consola de Debug

```javascript
// Ver progreso
console.log(engine.getProgress());

// Ver resultados parciales
console.log(engine.results);
console.log(engine.microResults);

// Ver problemas detectados
console.log(engine.problemFrequencies);
```

---

## 🚀 Próximos Pasos

- [x] Sprint 2: Motor de audiometría con micro-audiometría
- [x] Sprint 3: UI completa con visualización
- [ ] Sprint 4: Integrar con Módulo 2 (Búsqueda de Tinnitus)
- [ ] Sprint 5-6: Módulo 3 (Tratamiento)

---

## 📖 Referencias

- **Staircase Method:** Levitt, H. (1971). "Transformed up-down methods in psychoacoustics"
- **Audiometría Clínica:** ANSI/ASA S3.21-2004
- **Web Audio API:** MDN Web Docs
- **Canvas API:** MDN Web Docs

---

**Última actualización:** 2025-12-15
**Versión:** 1.0.0
**Autor:** Tinnitus Care MVP Team
