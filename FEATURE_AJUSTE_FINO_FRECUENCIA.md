# Feature: Ajuste Fino de Frecuencia en Tiempo Real
## Fecha: 2025-12-15

---

## 🎯 Solicitud del Usuario

> "Control de Sesión, estaría bueno tener una barra de ajustes de la frecuencia +- 5% para ajuste fino. y muchas variables de frecuencia +- 5%"

### Objetivo:
Permitir al usuario ajustar la frecuencia del tinnitus en tiempo real durante una sesión activa, con un rango de ±5% para encontrar el tono exacto que mejor coincida con su percepción del tinnitus.

---

## ✨ Feature Implementada

### Control de Ajuste Fino de Frecuencia

**Ubicación:** Pantalla de Control de Sesión, debajo del control de volumen

**Características:**
- 🎯 Slider de ajuste: -5% a +5%
- 📊 Precisión: 0.1% (100 puntos de ajuste)
- 🔄 Actualización en tiempo real
- 📈 Feedback visual inmediato
- 🎨 Colores codificados para claridad

---

## 🎨 Interfaz de Usuario

### Componentes del Control

```
┌─────────────────────────────────────────────────┐
│ 🎯 Ajuste Fino de Frecuencia                   │
│                                                  │
│ Ajusta la frecuencia en tiempo real para        │
│ encontrar el tono exacto de tu tinnitus (±5%)   │
│                                                  │
│ [-5%]────────[●]────────[+5%]                   │
│  -5%          0%          +5%                    │
│                                                  │
│ ┌──────────────────────────────────────────┐   │
│ │  Frecuencia Base:    4000 Hz             │   │
│ │  Ajuste:             +2.3%               │   │
│ │  Frecuencia Actual:  4092 Hz             │   │
│ └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Elementos Visuales:

1. **Título con Emoji** 🎯
   - Fácil de identificar
   - Indica propósito de precisión

2. **Texto Descriptivo**
   - Explica qué hace el control
   - Indica el rango (±5%)

3. **Slider**
   - Rango: -5% a +5%
   - Centro en 0% (frecuencia base)
   - Paso: 0.1%

4. **Display de Información** (Card gris claro):
   - **Frecuencia Base:** Original detectada/ingresada
   - **Ajuste:** Porcentaje actual con color codificado
   - **Frecuencia Actual:** Valor resultante destacado

---

## 🎨 Colores Codificados

### Ajuste (Porcentaje):

| Ajuste | Color | Significado |
|--------|-------|-------------|
| 0% | Azul (`--primary-blue`) | Frecuencia base sin cambios |
| > 0% | Verde (`--success`) | Frecuencia aumentada |
| < 0% | Naranja (`--warning`) | Frecuencia disminuida |

**Ejemplos:**
- `0%` → Azul
- `+2.3%` → Verde
- `-1.5%` → Naranja

### Frecuencia Actual:

- **Fondo:** Gradiente verde claro (`#d1fae5` → `#a7f3d0`)
- **Texto:** Verde oscuro (`#065f46`)
- **Tamaño:** Grande (2xl) para destacar
- **Animación:** Scale 1.1 al cambiar (200ms)

---

## 🔧 Implementación Técnica

### 1. UI Component (treatment-ui.js)

#### HTML Renderizado (líneas 352-385):

```javascript
<!-- Frequency Fine-Tuning -->
<div class="mb-6">
  <label class="label">🎯 Ajuste Fino de Frecuencia</label>
  <p class="text-xs text-gray-600 mb-2">
    Ajusta la frecuencia en tiempo real para encontrar el tono exacto (±5%)
  </p>

  <input type="range"
         id="frequency-slider"
         class="slider"
         min="-5"
         max="5"
         value="0"
         step="0.1"
         oninput="treatmentUI.updateFrequencyAdjustment(this.value)">

  <div class="frequency-adjustment-display">
    <div class="text-center mt-2">
      <span class="text-sm text-gray-600">Frecuencia Base:</span>
      <span class="font-bold text-lg" id="base-frequency-display">
        ${matchData.frequency} Hz
      </span>
    </div>

    <div class="text-center mt-1">
      <span class="text-sm text-gray-600">Ajuste:</span>
      <span class="font-bold text-xl text-primary-blue" id="frequency-adjustment-display">
        0%
      </span>
    </div>

    <div class="text-center mt-1">
      <span class="text-sm text-gray-600">Frecuencia Actual:</span>
      <span class="font-bold text-2xl text-success" id="current-frequency-display">
        ${matchData.frequency} Hz
      </span>
    </div>
  </div>

  <div class="slider-labels mt-2">
    <span>-5%</span>
    <span>0%</span>
    <span>+5%</span>
  </div>
</div>
```

#### Método updateFrequencyAdjustment() (líneas 612-660):

```javascript
updateFrequencyAdjustment(adjustmentPercent) {
  const adjustment = parseFloat(adjustmentPercent);
  const sign = adjustment >= 0 ? '+' : '';

  // Get base frequency
  const matchData = Storage.getTinnitusMatch();
  const baseFrequency = matchData.frequency;

  // Calculate new frequency
  const newFrequency = Math.round(baseFrequency * (1 + adjustment / 100));

  // Update adjustment display with color coding
  const adjustmentDisplay = document.getElementById('frequency-adjustment-display');
  if (adjustmentDisplay) {
    adjustmentDisplay.textContent = `${sign}${adjustment.toFixed(1)}%`;

    if (adjustment > 0) {
      adjustmentDisplay.style.color = 'var(--success)';      // Verde
    } else if (adjustment < 0) {
      adjustmentDisplay.style.color = 'var(--warning)';      // Naranja
    } else {
      adjustmentDisplay.style.color = 'var(--primary-blue)'; // Azul
    }
  }

  // Update current frequency display with animation
  const currentFreqDisplay = document.getElementById('current-frequency-display');
  if (currentFreqDisplay) {
    currentFreqDisplay.textContent = `${newFrequency} Hz`;
    currentFreqDisplay.style.transition = 'transform 0.2s ease';

    // Animate: scale up then back
    currentFreqDisplay.style.transform = 'scale(1.1)';
    setTimeout(() => {
      currentFreqDisplay.style.transform = 'scale(1)';
    }, 200);
  }

  // Update engine if playing
  if (this.isPlaying) {
    this.engine.updateFrequency(newFrequency);
  }

  Logger.info('treatment-ui',
    `🎯 Ajuste: ${baseFrequency} Hz → ${newFrequency} Hz (${sign}${adjustment.toFixed(1)}%)`
  );
}
```

### 2. Engine Method (treatment-engine.js)

#### Método updateFrequency() (líneas 763-803):

```javascript
async updateFrequency(newFrequency) {
  const oldFrequency = this.tinnitusFrequency;
  this.tinnitusFrequency = newFrequency;

  Logger.info('treatment',
    `🎯 Actualizando frecuencia: ${oldFrequency} Hz → ${newFrequency} Hz`
  );

  // If therapy is playing, restart with new frequency
  if (this.isPlaying && this.currentTherapy) {
    Logger.debug('treatment',
      `Reiniciando terapia ${this.currentTherapy} con nueva frecuencia`
    );

    // Store current state
    const currentSubType = this.currentSubType;

    // Stop audio only (NOT the session)
    this.stopAudioOnly();

    // Restart therapy with new frequency
    switch (this.currentTherapy) {
      case 'notched':
        await this.startNotchedTherapy();
        break;
      case 'cr':
        await this.startCRTherapy();
        break;
      case 'masking':
        await this.startMaskingTherapy(currentSubType || 'white');
        break;
      case 'ambient':
        await this.startAmbientTherapy(currentSubType || 'rain');
        break;
    }

    Logger.success('treatment', '✅ Frecuencia actualizada y terapia reiniciada');
  } else {
    Logger.info('treatment', 'Frecuencia actualizada (se aplicará al iniciar)');
  }
}
```

**Características Clave:**
- ✅ Actualiza `tinnitusFrequency` inmediatamente
- ✅ Si está reproduciendo, reinicia audio con nueva frecuencia
- ✅ Usa `stopAudioOnly()` para no cortar la sesión
- ✅ Preserva el subtipo actual (ej: si está en "Pájaros", sigue en "Pájaros")
- ✅ Funciona con todas las terapias

### 3. CSS Styles (treatment.html)

#### Estilos Agregados (líneas 226-256):

```css
/* Frequency adjustment display */
.frequency-adjustment-display {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--bg-tertiary);      /* Gris claro */
  border-radius: 8px;
  border: 2px solid var(--border-light);
}

#base-frequency-display {
  color: var(--text-primary);
}

#frequency-adjustment-display {
  display: inline-block;
  min-width: 80px;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: var(--bg-secondary);
  transition: all 0.2s ease;
}

#current-frequency-display {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);  /* Gradiente verde */
  color: #065f46;                                           /* Verde oscuro */
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
  transition: transform 0.2s ease;
}
```

---

## 🎬 Flujo de Uso

### Escenario 1: Ajuste Antes de Iniciar Sesión

```
1. Usuario llega a pantalla de control
   - Frecuencia base: 4000 Hz
   - Ajuste: 0%
   - Frecuencia actual: 4000 Hz

2. Usuario mueve slider a +3.5%
   - Frecuencia base: 4000 Hz (sin cambios)
   - Ajuste: +3.5% (VERDE)
   - Frecuencia actual: 4140 Hz (con animación)

3. Usuario inicia sesión
   - Terapia usa 4140 Hz
   - Sesión comienza normalmente
```

### Escenario 2: Ajuste Durante Sesión Activa

```
1. Sesión activa con "Lluvia" a 4000 Hz
   - Reproduciendo
   - Progreso: 2 min / 10 min

2. Usuario nota que el tinnitus es un poco más agudo
   - Mueve slider a +2.0%
   - ↓

3. updateFrequencyAdjustment() ejecuta
   - Calcula: 4000 × 1.02 = 4080 Hz
   - Display actualiza (verde, animación)
   - ↓

4. engine.updateFrequency(4080) ejecuta
   - stopAudioOnly() - detiene lluvia a 4000 Hz
   - startAmbientTherapy('rain') - inicia lluvia a 4080 Hz
   - ✅ Sesión continúa (progreso mantiene)
   - ↓

5. Usuario escucha nuevo tono
   - Lluvia ahora a 4080 Hz
   - Sesión sigue: 2:05... 2:06... hasta 10:00
   - ✅ SIN popup, SIN corte
```

### Escenario 3: Múltiples Ajustes

```
1. Sesión con "CR Neuromodulation" a 4000 Hz

2. Minuto 2: Ajusta a +1.5% (4060 Hz)
   - CR se reinicia con 4 tonos alrededor de 4060 Hz
   - Sesión continúa

3. Minuto 5: Ajusta a -0.5% (3980 Hz)
   - CR se reinicia con 4 tonos alrededor de 3980 Hz
   - Sesión continúa

4. Minuto 8: Ajusta a 0% (4000 Hz)
   - CR vuelve a frecuencia base
   - Sesión continúa

5. Minuto 10: Sesión completa
   - Popup aparece
   - Última frecuencia usada: 4000 Hz
```

---

## 📊 Ejemplos de Cálculo

### Fórmula:
```
Frecuencia Actual = Frecuencia Base × (1 + Ajuste% / 100)
```

### Ejemplos:

| Base (Hz) | Ajuste % | Cálculo | Resultado (Hz) |
|-----------|----------|---------|----------------|
| 4000 | 0% | 4000 × 1.00 | 4000 |
| 4000 | +5% | 4000 × 1.05 | 4200 |
| 4000 | -5% | 4000 × 0.95 | 3800 |
| 4000 | +2.3% | 4000 × 1.023 | 4092 |
| 4000 | -1.7% | 4000 × 0.983 | 3932 |
| 6000 | +5% | 6000 × 1.05 | 6300 |
| 6000 | -5% | 6000 × 0.95 | 5700 |
| 8000 | +3.0% | 8000 × 1.03 | 8240 |
| 8000 | -2.5% | 8000 × 0.975 | 7800 |

### Rango de Ajuste por Frecuencia Base:

| Base (Hz) | -5% (Hz) | +5% (Hz) | Rango Total (Hz) |
|-----------|----------|----------|------------------|
| 2000 | 1900 | 2100 | 200 |
| 4000 | 3800 | 4200 | 400 |
| 6000 | 5700 | 6300 | 600 |
| 8000 | 7600 | 8400 | 800 |
| 10000 | 9500 | 10500 | 1000 |

**Nota:** El rango absoluto (en Hz) aumenta con la frecuencia base, pero el rango relativo es siempre ±5%.

---

## 🎯 Casos de Uso

### 1. Búsqueda del Tono Exacto

**Problema:** Usuario no está seguro de la frecuencia exacta de su tinnitus

**Solución:**
```
1. Empieza con frecuencia aproximada (ej: 4000 Hz)
2. Inicia sesión con Notched Sound
3. Ajusta lentamente el slider mientras escucha
4. Cuando el tono generado "desaparece" = ¡coincide con tinnitus!
5. Ese es el tono exacto
```

### 2. Tinnitus Variable

**Problema:** El tinnitus cambia de tono durante el día

**Solución:**
```
1. Mañana: Tinnitus a ~4200 Hz
   - Ajusta a +5% desde base 4000 Hz

2. Tarde: Tinnitus a ~3950 Hz
   - Ajusta a -1.3% desde base 4000 Hz

3. Noche: Tinnitus vuelve a ~4000 Hz
   - Ajusta a 0%
```

### 3. Validación de Frecuencia Detectada

**Problema:** No está seguro si la detección automática fue precisa

**Solución:**
```
1. Audiometría detectó: 4000 Hz
2. En tratamiento, prueba ajustes:
   - +2%: suena diferente
   - +1%: se acerca
   - +0.5%: ¡perfecto!
3. Frecuencia real: 4020 Hz
4. Puede actualizar frecuencia base para próximas sesiones
```

### 4. CR Neuromodulation Preciso

**Problema:** CR Neuromodulation requiere frecuencia exacta

**Solución:**
```
1. Inicia CR con frecuencia estimada
2. Ajusta hasta encontrar el punto donde:
   - Los 4 tonos suenan "en sintonía" con el tinnitus
   - Máximo efecto de inhibición
3. Esa es la frecuencia óptima para tratamiento
```

---

## 🧪 Testing

### Test 1: UI Rendering

**Pasos:**
```
1. http://localhost:8000/treatment.html
2. Ingresar frecuencia: 4000 Hz
3. Seleccionar cualquier terapia
4. ✅ Verificar control "🎯 Ajuste Fino de Frecuencia" visible
5. ✅ Verificar slider centrado en 0%
6. ✅ Verificar displays muestran:
   - Frecuencia Base: 4000 Hz
   - Ajuste: 0%
   - Frecuencia Actual: 4000 Hz
7. ✅ Verificar labels: -5%, 0%, +5%
```

### Test 2: Ajuste Antes de Iniciar

**Pasos:**
```
1. Mover slider a +3.0%
2. ✅ Verificar ajuste display: "+3.0%" (verde)
3. ✅ Verificar frecuencia actual: "4120 Hz"
4. ✅ Verificar animación scale en número
5. Mover slider a -2.5%
6. ✅ Verificar ajuste display: "-2.5%" (naranja)
7. ✅ Verificar frecuencia actual: "3900 Hz"
8. Mover slider a 0%
9. ✅ Verificar ajuste display: "0%" (azul)
10. ✅ Verificar frecuencia actual: "4000 Hz"
```

### Test 3: Ajuste Durante Sesión

**Pasos:**
```
1. Iniciar sesión de 5 min con "Ruido Blanco"
2. Esperar 1 minuto (20% progreso)
3. Mover slider a +4.0%
4. ✅ Verificar: Audio cambia de tono
5. ✅ Verificar: NO aparece popup
6. ✅ Verificar: Progreso continúa (21%, 22%...)
7. ✅ Verificar console logs:
   - "🎯 Actualizando frecuencia: 4000 Hz → 4160 Hz"
   - "Reiniciando terapia masking con nueva frecuencia"
   - "✅ Frecuencia actualizada y terapia reiniciada"
8. Mover slider a -3.0%
9. ✅ Verificar: Audio cambia nuevamente
10. ✅ Verificar: Sesión sigue sin interrupciones
11. Completar sesión
12. ✅ Verificar: Popup solo al final
```

### Test 4: Con Diferentes Terapias

**Para cada terapia:**
```
1. Notched Sound:
   - Ajustar a +2%
   - ✅ Notch se mueve con la frecuencia

2. CR Neuromodulation:
   - Ajustar a -1.5%
   - ✅ Los 4 tonos se recalculan alrededor de nueva frecuencia

3. Sound Masking (Banda Estrecha):
   - Ajustar a +3%
   - ✅ Banda estrecha se centra en nueva frecuencia

4. Sonidos Ambientales:
   - Ajustar no afecta mucho (base es ruido)
   - ✅ Pero funciona sin errores
```

### Test 5: Valores Extremos

**Pasos:**
```
1. Mover slider a -5% (mínimo)
   - Base: 4000 Hz
   - ✅ Resultado: 3800 Hz
   - ✅ Display: "-5.0%" (naranja)

2. Mover slider a +5% (máximo)
   - ✅ Resultado: 4200 Hz
   - ✅ Display: "+5.0%" (verde)

3. Probar con diferentes bases:
   - Base 2000 Hz: 1900-2100 Hz ✅
   - Base 6000 Hz: 5700-6300 Hz ✅
   - Base 8000 Hz: 7600-8400 Hz ✅
```

### Test 6: Precisión del Slider

**Pasos:**
```
1. Mover slider muy lentamente
2. ✅ Verificar cambios de 0.1%:
   - 0.0% → 0.1% → 0.2% ... → 5.0%
3. ✅ Verificar frecuencias cambian:
   - 4000 → 4004 → 4008 ... → 4200
4. ✅ 100 pasos totales (-50 a +50)
```

---

## 📊 Beneficios

### 1. Precisión
- ✅ Encuentra el tono EXACTO del tinnitus
- ✅ 0.1% de precisión = muy fino
- ✅ 100 puntos de ajuste en rango ±5%

### 2. Flexibilidad
- ✅ Ajusta antes o durante sesión
- ✅ Múltiples ajustes permitidos
- ✅ Funciona con todas las terapias

### 3. Feedback Visual
- ✅ Colores codificados (verde/naranja/azul)
- ✅ Animaciones al cambiar
- ✅ 3 displays informativos

### 4. No Interrumpe
- ✅ Usa `stopAudioOnly()` no `stopTherapy()`
- ✅ Sesión continúa sin cortes
- ✅ Progreso se mantiene

### 5. Facilidad de Uso
- ✅ Slider intuitivo
- ✅ Feedback inmediato
- ✅ Información clara

---

## 🎓 Casos Clínicos

### Caso 1: Tinnitus Estable

**Paciente:** Frecuencia estable ~4050 Hz

**Proceso:**
1. Matching detecta: 4000 Hz (cercano pero no exacto)
2. Inicia tratamiento, ajusta a +1.3%
3. Encuentra coincidencia perfecta a 4052 Hz
4. Usa ese ajuste para todas las sesiones

**Resultado:** Mejor efectividad del tratamiento

### Caso 2: Tinnitus Variable

**Paciente:** Frecuencia varía 3900-4200 Hz

**Proceso:**
1. Frecuencia base: 4050 Hz (promedio)
2. Cada sesión ajusta según día:
   - Día 1: -3.7% (3900 Hz)
   - Día 2: +1.2% (4100 Hz)
   - Día 3: +3.7% (4200 Hz)

**Resultado:** Tratamiento efectivo a pesar de variabilidad

### Caso 3: Validación de Matching

**Paciente:** Duda de resultado de matching

**Proceso:**
1. Matching: 4000 Hz
2. Tratamiento: Prueba +2%, +1%, 0%, -1%
3. Encuentra que -0.5% (3980 Hz) es más preciso
4. Actualiza frecuencia base para próximas sesiones

**Resultado:** Confianza en la frecuencia correcta

---

## 🔬 Consideraciones Técnicas

### Limitación ±5%

**Razón:** Balance entre flexibilidad y seguridad clínica

**Justificación:**
- Rango típico de variación percibida: 2-5%
- Más allá de ±5% probablemente indica:
  - Frecuencia base incorrecta
  - Necesita re-hacer matching
- Previene ajustes excesivos

### Precisión 0.1%

**Para 4000 Hz:**
- 0.1% = 4 Hz
- Límite de discriminación humana: ~1-10 Hz (dependiendo de frecuencia)
- 0.1% es adecuado para ajuste fino

### Redondeo a Enteros

**Código:** `Math.round(baseFrequency * (1 + adjustment / 100))`

**Razón:**
- Osciladores Web Audio usan valores flotantes
- Pero display muestra enteros
- Diferencia imperceptible para usuario

---

## ✅ Checklist de Verificación

### UI
- [x] Control visible en pantalla de sesión
- [x] Slider con rango -5% a +5%
- [x] Paso de 0.1%
- [x] Labels: -5%, 0%, +5%
- [x] 3 displays informativos
- [x] Colores codificados

### Funcionalidad
- [x] Ajuste antes de iniciar funciona
- [x] Ajuste durante sesión funciona
- [x] NO corta la sesión
- [x] Cálculo correcto de frecuencia
- [x] Actualiza engine en tiempo real

### Visual
- [x] Animación scale en frecuencia actual
- [x] Color verde para ajustes positivos
- [x] Color naranja para ajustes negativos
- [x] Color azul para 0%
- [x] Display destacado para frecuencia actual

### Terapias
- [x] Funciona con Notched Sound
- [x] Funciona con CR Neuromodulation
- [x] Funciona con Sound Masking
- [x] Funciona con Sonidos Ambientales
- [x] Preserva subtipo al ajustar

### Logging
- [x] Log de ajustes en UI
- [x] Log de actualización en engine
- [x] Log de reinicio de terapia
- [x] Sin errores en console

---

## 📝 Archivos Modificados

### 1. `js/treatment/treatment-ui.js`
- **Líneas 352-385:** HTML del control de ajuste fino
- **Líneas 612-660:** Método `updateFrequencyAdjustment()`

### 2. `js/treatment/treatment-engine.js`
- **Líneas 763-803:** Método `updateFrequency()`

### 3. `treatment.html`
- **Líneas 226-256:** Estilos CSS para control de frecuencia

### Total:
- ~130 líneas de código agregadas
- 1 nuevo control UI
- 2 nuevos métodos
- Estilos CSS personalizados

---

## 🚀 Estado Final

### Antes:
- ❌ No había manera de ajustar frecuencia durante sesión
- ❌ Si la detección era imprecisa, mala suerte
- ❌ Tinnitus variable = tratamiento subóptimo

### Ahora:
- ✅ Ajuste fino ±5% en tiempo real
- ✅ 0.1% de precisión (100 pasos)
- ✅ Feedback visual completo
- ✅ Sin interrumpir sesión
- ✅ Funciona con todas las terapias
- ✅ Colores codificados intuitivos
- ✅ Animaciones suaves

---

## 🎉 Beneficio para el Usuario

**Permite encontrar el "punto dulce" exacto del tono del tinnitus, maximizando la efectividad del tratamiento.**

- Usuarios pueden experimentar libremente
- Adaptación a variabilidad del tinnitus
- Validación de frecuencia detectada
- Mejor experiencia de tratamiento
- Mayor probabilidad de alivio

---

*Fin del documento de feature*
