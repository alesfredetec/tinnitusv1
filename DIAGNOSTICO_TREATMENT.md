# 🔍 Diagnóstico: Módulo 3 - Treatment

**Fecha:** 2025-12-15
**Estado:** Revisión de funcionalidad y bugs

---

## 📋 Archivos del Módulo

1. **treatment.html** - Página principal
2. **js/treatment/treatment-engine.js** - Motor de terapias
3. **js/treatment/treatment-ui.js** - Interfaz de usuario

---

## ✅ Verificación de Dependencias

### Storage Methods Requeridos:
- ✅ `Storage.getTinnitusMatch()` - Existe (storage.js:174)
- ✅ `Storage.saveTinnitusMatch()` - Existe (storage.js:163)
- ✅ `Storage.getTreatmentSessions()` - Existe (storage.js:214)
- ✅ `Storage.saveTreatmentSession()` - Existe (storage.js:201)

### AudioContext Methods Requeridos:
- ✅ `AudioContextManager.init()` - Existe
- ✅ `AudioContextManager.resume()` - Existe
- ✅ `AudioContextManager.getContext()` - Existe
- ✅ `AudioContextManager.getMasterGain()` - Existe
- ✅ `AudioContextManager.getCurrentTime()` - Existe
- ✅ `AudioContextManager.isReady()` - Existe

### Dependencias HTML:
- ✅ logger.js
- ✅ utils.js
- ✅ storage.js
- ✅ audio-context.js
- ✅ treatment-engine.js
- ✅ treatment-ui.js

---

## 🐛 Problemas Identificados

### PROBLEMA 1: Falta método `getLatestTinnitusMatch()`

**Ubicación:** Mencionado en TESTING_PASO5_MML.md pero no existe en storage.js

**Impacto:** BAJO - El método correcto `getTinnitusMatch()` sí existe y se usa correctamente

**Fix:** N/A - No es un problema real

---

### PROBLEMA 2: Método `synthesizeAmbient()` no existe

**Ubicación:** treatment-engine.js:637

```javascript
changeSubType(subType) {
  if (this.currentTherapy === 'masking') {
    this.stopTherapy();
    this.startMaskingTherapy(subType);
  } else if (this.currentTherapy === 'ambient') {
    this.stopTherapy();
    this.synthesizeAmbient(subType);  // ❌ Este método NO EXISTE
  }
}
```

**Debería ser:**
```javascript
this.startAmbientTherapy(subType);  // ✅ Este método SÍ existe (línea 363)
```

**Impacto:** MEDIO - Cambiar subtipo de ambient no funciona

**Fix:** Cambiar `synthesizeAmbient` → `startAmbientTherapy`

---

### PROBLEMA 3: Botones de sub-tipo no tienen listener correcto

**Ubicación:** treatment-ui.js:308-320, 328-342

Los botones de sub-tipo (white/pink/brown/narrowband y rain/ocean/wind/forest) solo funcionan al hacer clic, pero no se actualiza la terapia si ya está reproduciendo.

**Código actual:**
```javascript
selectSubType(subType, button) {
  // Update button states
  const buttons = button.parentElement.querySelectorAll('.btn-outline');
  buttons.forEach(btn => btn.classList.remove('active'));
  button.classList.add('active');

  // Update engine if playing
  if (this.isPlaying) {
    this.engine.changeSubType(subType);  // ❌ Llama a método con bug
  }

  this.currentSubType = subType;
}
```

**Impacto:** MEDIO - Cambiar tipo de ruido durante reproducción falla

**Fix:** Después de arreglar Problema 2, esto funcionará

---

### PROBLEMA 4: Falta inicialización de `sessionDuration`

**Ubicación:** treatment-ui.js:437

```javascript
async startSession() {
  const duration = this.sessionDuration || 30;  // ⚠️ Si no se ajustó slider, siempre 30
  // ...
}
```

**Problema:** Si el usuario no mueve el slider, `this.sessionDuration` es `undefined`, siempre usa 30 min

**Impacto:** BAJO - Funciona con default 30 min, pero no refleja el valor inicial del slider

**Fix:** Inicializar en `selectTherapy()` o leer directamente del slider

---

### PROBLEMA 5: Posible error al cambiar sub-tipo cuando NO está reproduciendo

**Ubicación:** treatment-engine.js:632-639

```javascript
changeSubType(subType) {
  if (this.currentTherapy === 'masking') {
    this.stopTherapy();  // ⚠️ Si NO está reproduciendo, llama stopTherapy() innecesariamente
    this.startMaskingTherapy(subType);
  }
  // ...
}
```

**Problema:** Si cambias el subtipo ANTES de reproducir, llama `stopTherapy()` que muestra warning

**Impacto:** MUY BAJO - Solo warning en consola, no rompe nada

**Fix:** Opcional - Verificar `this.isPlaying` antes de `stopTherapy()`

---

### PROBLEMA 6: `startAmbientTherapy()` no acepta parámetro `soundType`

**Ubicación:** treatment-engine.js:363

```javascript
async startAmbientTherapy(soundType = 'rain') {  // ✅ SÍ acepta parámetro
  // ...
  switch (soundType) {
    case 'rain':
      await this.synthesizeRain();
      break;
    // ...
  }
}
```

**Verificación:** Este método SÍ acepta `soundType`, NO hay problema aquí

**Impacto:** N/A

---

### PROBLEMA 7: Missing logging en startMaskingTherapy

**Ubicación:** treatment-engine.js:271-357

**Problema:** `startMaskingTherapy()` no tiene logging detallado como `startNotchedTherapy()` y `startCRTherapy()`

**Impacto:** MUY BAJO - Solo afecta debugging

**Fix:** Opcional - Añadir Logger.info() calls

---

## 🎯 Plan de Fixes (Prioridad)

### FIX CRÍTICO 1: Método `synthesizeAmbient()` no existe
**Línea:** treatment-engine.js:637
**Cambio:**
```javascript
// ANTES
this.synthesizeAmbient(subType);

// DESPUÉS
this.startAmbientTherapy(subType);
```

### FIX MEDIO 1: Inicializar sessionDuration correctamente
**Línea:** treatment-ui.js:189-191
**Añadir:**
```javascript
async selectTherapy(therapyType) {
  this.currentTherapy = therapyType;
  this.sessionDuration = (therapyType === 'cr') ? 60 : 30;  // Inicializar default
  this.showSessionScreen(therapyType);
}
```

### FIX OPCIONAL 1: Verificar isPlaying antes de stopTherapy
**Línea:** treatment-engine.js:632-639
**Cambio:**
```javascript
changeSubType(subType) {
  if (this.currentTherapy === 'masking') {
    if (this.isPlaying) {  // ✅ Solo stop si está reproduciendo
      this.stopTherapy();
    }
    this.startMaskingTherapy(subType);
  } else if (this.currentTherapy === 'ambient') {
    if (this.isPlaying) {  // ✅ Solo stop si está reproduciendo
      this.stopTherapy();
    }
    this.startAmbientTherapy(subType);
  }
}
```

### FIX OPCIONAL 2: Añadir logging a startMaskingTherapy
**Línea:** treatment-engine.js:271
**Añadir al inicio:**
```javascript
async startMaskingTherapy(noiseType = 'white') {
  Logger.info('treatment', `🌊 Configurando terapia de enmascaramiento: ${noiseType}`);
  const context = AudioContextManager.getContext();
  // ...
}
```

---

## 🧪 Plan de Testing

### Test 1: Sin datos de matching
**Objetivo:** Verificar que muestra error si no hay tinnitus match

1. Abrir http://localhost:8000/treatment.html
2. Limpiar localStorage: `Storage.clearAll()`
3. Reload página
4. **Esperado:** Mensaje "⚠️ Sin datos de frecuencia"
5. **Esperado:** Botón "Ir a Búsqueda de Frecuencia"

### Test 2: Con datos de matching
**Objetivo:** Verificar que carga correctamente con datos

1. Crear datos de prueba:
```javascript
Storage.saveTinnitusMatch({
  frequency: 4500,
  confidence: 85,
  volume: 0.3,
  waveType: 'sine',
  validationScore: '3/3',
  ear: 'left'
});
```

2. Reload http://localhost:8000/treatment.html
3. **Esperado:** Muestra "Tu Frecuencia de Tinnitus: 4500 Hz"
4. **Esperado:** 4 tarjetas de terapia visibles

### Test 3: Notched Sound Therapy
**Objetivo:** Verificar que Notched funciona

1. Clic en tarjeta "Notched Sound Therapy"
2. **Esperado:** Pantalla de sesión carga
3. **Esperado:** Frecuencia: 4500 Hz visible
4. Clic "Iniciar Sesión"
5. **Esperado:** Sonido de ruido blanco con notch
6. **Esperado:** Botón cambia a "Detener Sesión"
7. **Esperado:** Barra de progreso aparece
8. Esperar 10 segundos
9. **Esperado:** Progreso aumenta
10. Clic "Detener Sesión"
11. **Esperado:** Sonido para
12. **Esperado:** Sesión guardada en localStorage

**Verificar en consola:**
```javascript
Storage.getTreatmentSessions()
// Debería mostrar array con 1 sesión
```

### Test 4: CR Neuromodulation
**Objetivo:** Verificar que CR funciona

1. Volver y seleccionar "CR Neuromodulation"
2. Clic "Iniciar Sesión"
3. **Esperado:** 4 tonos reproducen en secuencia random
4. **Esperado:** Patrón se repite cada ~3 segundos
5. **Verificar en consola:** Tabla de frecuencias CR

### Test 5: Sound Masking con cambio de subtipo
**Objetivo:** Verificar cambio de ruido durante reproducción (PROBLEMA 2)

1. Seleccionar "Sound Masking"
2. Clic "Ruido Blanco" (default activo)
3. Clic "Iniciar Sesión"
4. **Esperado:** Ruido blanco reproduce
5. Sin parar, clic "Ruido Rosa"
6. **ANTES DEL FIX:** ERROR en consola
7. **DESPUÉS DEL FIX:** Cambia a ruido rosa suavemente
8. Clic "Ruido Marrón"
9. **Esperado:** Cambia a ruido marrón
10. Clic "Banda Estrecha"
11. **Esperado:** Cambia a narrow-band noise centrado en 4500 Hz

### Test 6: Ambient Sounds con cambio de subtipo
**Objetivo:** Verificar cambio de sonido ambiental (PROBLEMA 2)

1. Seleccionar "Sonidos Ambientales"
2. Clic "🌧️ Lluvia" (default)
3. Clic "Iniciar Sesión"
4. **Esperado:** Sonido de lluvia (ruido blanco con variación)
5. Sin parar, clic "🌊 Océano"
6. **ANTES DEL FIX:** ERROR en consola
7. **DESPUÉS DEL FIX:** Cambia a sonido de océano (ruido brown con LFO lento)
8. Clic "💨 Viento"
9. **Esperado:** Cambia a viento (ruido rosa)
10. Clic "🌲 Bosque"
11. **Esperado:** Cambia a bosque (ruido brown)

### Test 7: Volumen y duración
**Objetivo:** Verificar controles de volumen y duración

1. Seleccionar cualquier terapia
2. Ajustar slider de duración a 10 min
3. **Esperado:** Display muestra "10 min"
4. Ajustar slider de volumen a 50%
5. **Esperado:** Display muestra "50%"
6. Clic "Iniciar Sesión"
7. **Esperado:** Volumen perceptualmente medio
8. Mientras reproduce, ajustar volumen a 80%
9. **Esperado:** Volumen aumenta en tiempo real

### Test 8: Sesión completa
**Objetivo:** Verificar que sesión completa muestra modal

1. Seleccionar cualquier terapia
2. Ajustar duración a 1 minuto (para test rápido)
3. Iniciar sesión
4. Esperar 1 minuto completo
5. **Esperado:** Sesión para automáticamente
6. **Esperado:** Modal "✅ Sesión Completada" aparece
7. **Esperado:** Muestra duración y terapia
8. **Verificar:**
```javascript
const sessions = Storage.getTreatmentSessions();
const lastSession = sessions[sessions.length - 1];
console.log('Completed:', lastSession.completed);  // Debe ser true
```

### Test 9: Historial de sesiones
**Objetivo:** Verificar que historial muestra sesiones previas

1. Completar 3 sesiones de Notched Sound
2. Volver a seleccionar "Notched Sound Therapy"
3. **Esperado:** Card "Historial de Sesiones" visible
4. **Esperado:** Muestra últimas 3 sesiones con fechas y duraciones
5. **Esperado:** Badges "✓ Completada" o "Parcial"

### Test 10: Progreso en tiempo real
**Objetivo:** Verificar actualización de progreso

1. Iniciar sesión de 5 minutos
2. **Esperado:** Tiempo actual aumenta: 0:00 → 0:01 → 0:02...
3. **Esperado:** Tiempo objetivo muestra: 5:00
4. **Esperado:** Barra de progreso llena gradualmente
5. **Esperado:** Porcentaje aumenta: 0% → 1% → 2%...
6. Después de 2.5 minutos
7. **Esperado:** Progreso ~50%
8. **Esperado:** Tiempo: 2:30 / 5:00

---

## 📊 Checklist de Validación

### Funcionalidad Básica:
- [ ] Carga con datos de matching
- [ ] Muestra error sin datos de matching
- [ ] 4 terapias visibles y clickeables
- [ ] Pantalla de sesión carga correctamente

### Terapias:
- [ ] **Notched Sound:** Reproduce ruido con notch
- [ ] **CR Neuromodulation:** 4 tonos en patrón random
- [ ] **Sound Masking:** 4 tipos de ruido funcionan
- [ ] **Ambient Sounds:** 4 sonidos ambientales funcionan

### Controles:
- [ ] Slider de duración funciona (5-120 min)
- [ ] Slider de volumen funciona (0-100%)
- [ ] Botón Iniciar/Detener cambia estado
- [ ] Cambio de subtipo durante reproducción funciona (DESPUÉS DE FIX)

### Progreso y Sesión:
- [ ] Barra de progreso actualiza en tiempo real
- [ ] Tiempo muestra correctamente (MM:SS)
- [ ] Sesión completa muestra modal
- [ ] Sesión guardada en localStorage
- [ ] Historial muestra sesiones previas

### Logging:
- [ ] Logs de inicio de terapia
- [ ] Logs de detención de terapia
- [ ] Logs de ajuste de volumen
- [ ] Sin errores en consola (DESPUÉS DE FIX)

---

## 🔧 Comandos de Debug

### Ver datos de matching:
```javascript
const match = Storage.getTinnitusMatch();
console.log('Match:', match);
```

### Ver sesiones de tratamiento:
```javascript
const sessions = Storage.getTreatmentSessions();
console.log('Sessions:', sessions);
console.log('Total:', sessions.length);
```

### Crear datos de prueba:
```javascript
Storage.saveTinnitusMatch({
  frequency: 4500,
  confidence: 85,
  volume: 0.3,
  waveType: 'sine',
  validationScore: '3/3',
  ear: 'left',
  mml: { level: 10, frequency: 4500, noiseType: 'narrow-band', bandwidth: 500, attempts: 5 }
});
```

### Limpiar datos:
```javascript
Storage.clearAll();
```

### Ver estado del engine:
```javascript
const engine = treatmentUI.engine;
console.log('Playing:', engine.isPlaying);
console.log('Therapy:', engine.currentTherapy);
console.log('Frequency:', engine.tinnitusFrequency);
console.log('Volume:', engine.volume);
console.log('Oscillators:', engine.oscillators.length);
console.log('Gain Nodes:', engine.gainNodes.length);
```

### Forzar sesión completa (testing):
```javascript
// Reducir duración objetivo a 5 segundos
treatmentUI.engine.targetDuration = 5;
```

---

## 🎯 Resumen

### Problemas Críticos que Impiden Funcionamiento:
1. ❌ **Método `synthesizeAmbient()` no existe** - treatment-engine.js:637

### Problemas Medios:
1. ⚠️ **sessionDuration no inicializada** - treatment-ui.js:437

### Problemas Menores:
1. 📝 **stopTherapy innecesario** - treatment-engine.js:632-639
2. 📝 **Falta logging** - treatment-engine.js:271

### Total de Fixes Necesarios:
- **1 CRÍTICO** (sin esto, ambient sounds no cambia subtipo)
- **1 MEDIO** (funciona pero con bug menor)
- **2 OPCIONALES** (mejoras de UX)

---

## ✅ Siguiente Paso

1. **Aplicar FIX CRÍTICO 1** - Cambiar `synthesizeAmbient` → `startAmbientTherapy`
2. **Aplicar FIX MEDIO 1** - Inicializar `sessionDuration`
3. **Aplicar FIX OPCIONAL 1** - Verificar `isPlaying` antes de `stopTherapy`
4. **Testing completo** con checklist arriba
5. **Documentar resultados**

---

*Diagnóstico - Treatment Module*
*Versión: 1.0*
*Creado: 2025-12-15*
