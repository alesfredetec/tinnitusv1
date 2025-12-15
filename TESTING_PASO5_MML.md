# 🧪 Testing: Paso 5 - MML (Minimum Masking Level)

**Fecha:** 2025-12-15
**Feature:** MML básico para medir nivel mínimo de enmascaramiento del tinnitus

---

## ✅ Qué se Implementó

### 1. **MML Configuration**
Archivo: `js/matching/matching-engine.js`

**Configuración añadida:**
```javascript
this.config = {
  enableMML: true,           // Enable MML testing
  mmlStartLevel: -20,        // Start at -20 dB (quiet)
  mmlStepSize: 5,            // Increase by 5 dB per step
  mmlMaxLevel: 40,           // Maximum 40 dB above threshold
  mmlNoiseType: 'narrow-band', // 'narrow-band' or 'white'
  mmlBandwidth: 500          // Hz - bandwidth for narrow-band noise
};
```

### 2. **Nueva Etapa 'MML' en Engine**
Archivo: `js/matching/matching-engine.js`

**Cambios:**
- ✅ Añadida etapa 'mml' al array de stages
- ✅ State variables: `mmlLevel`, `mmlResult`, `mmlAttempts`
- ✅ Método `startMML()` - Inicia testing de MML
- ✅ Método `playMasker()` - Reproduce ruido enmascarador
- ✅ Método `increaseMMLLevel()` - Aumenta nivel en 5 dB
- ✅ Método `decreaseMMLLevel()` - Disminuye nivel en 5 dB
- ✅ Método `confirmMasking()` - Usuario confirma enmascaramiento
- ✅ Método `skipMML()` - Usuario omite MML
- ✅ Método `finalize()` - Guarda resultados con MML incluido
- ✅ Modified `complete()` - Lanza MML después de validation

### 3. **Generación de Ruido**
Archivo: `js/audio-context.js`

**Nuevos métodos:**
- ✅ `playNarrowBandNoise(centerFreq, bandwidth, duration, volume)` - Genera ruido de banda estrecha
- ✅ `playWhiteNoise(duration, volume)` - Genera ruido blanco
- ✅ Usa filtros bandpass para narrow-band noise
- ✅ Fade in/out de 50ms para evitar clicks

### 4. **UI para MML**
Archivo: `js/matching/matching-ui.js`

**Features UI:**
- ✅ `renderMML()` - Pantalla completa de MML
- ✅ Muestra frecuencia del tinnitus
- ✅ Display de nivel actual de enmascaramiento (grande, color-coded)
- ✅ Botón "Reproducir Enmascarador"
- ✅ Botones "+/-" para ajustar nivel
- ✅ Botón "Confirmar Enmascaramiento"
- ✅ Botón "Omitir MML"
- ✅ Instrucciones detalladas
- ✅ Deshabilita controles durante reproducción

### 5. **Integración en Resultados**
Archivo: `js/matching/matching-ui.js`

**Cambios:**
- ✅ `showCompletionScreen()` muestra MML si está disponible
- ✅ Format: "+X dB" o "-X dB"
- ✅ Solo muestra si no fue omitido

---

## 🧪 Cómo Probar

### Test 1: Flujo Completo de MML

**Objetivo:** Verificar que MML se ejecuta después de validation

1. **Completar búsqueda de tinnitus:**
   - http://localhost:8000/matching.html?autostart=true
   - Pasar por todas las etapas: range → coarse → refinement → fine-tuning → validation

2. **Verificar transición a MML:**
   - ✅ Después de completar validation, debe iniciar automáticamente MML
   - ✅ En consola: `[MATCHING] ✅ Validación completa. Iniciando MML...`
   - ✅ En consola: `[MATCHING] [6/6] MML (Minimum Masking Level) iniciado`

3. **Pantalla de MML debe mostrar:**
   - ✅ Título: "Etapa 6: Nivel Mínimo de Enmascaramiento (MML)"
   - ✅ Frecuencia del tinnitus (ej: "4500 Hz")
   - ✅ Nivel actual: "-20 dB" (inicial)
   - ✅ Instrucciones claras
   - ✅ Botón grande "▶ Reproducir Enmascarador"
   - ✅ Botones de ajuste (↑ Aumentar, ↓ Disminuir)
   - ✅ Botones de finalización (✓ Confirmar, ⏭ Omitir)

### Test 2: Reproducción de Ruido Enmascarador

**Objetivo:** Verificar que el ruido narrow-band se reproduce correctamente

1. **Reproducir enmascarador:**
   - Clic en "▶ Reproducir Enmascarador"

2. **Verificar:**
   - ✅ Se reproduce ruido (sonido como "shhhhh" centrado en la frecuencia)
   - ✅ Duración: ~3 segundos
   - ✅ Botón cambia a "🔊 Reproduciendo..." y se deshabilita
   - ✅ Controles deshabilitados durante reproducción
   - ✅ En consola: `[MATCHING] 🔊 Reproduciendo ruido enmascarador: X Hz (±250 Hz) a -20 dB por 3s`

3. **Después de reproducción:**
   - ✅ Botón vuelve a "▶ Reproducir Enmascarador"
   - ✅ Controles se habilitan

### Test 3: Ajuste de Nivel MML

**Objetivo:** Verificar aumento/disminución de nivel

1. **Aumentar nivel:**
   - Clic en "⬆ Aumentar (+5 dB)" varias veces
   - ✅ Nivel aumenta: -20 → -15 → -10 → -5 → 0 → +5 → +10...
   - ✅ Display se actualiza instantáneamente
   - ✅ En consola: `[MATCHING] 📈 Nivel MML aumentado: -20 dB → -15 dB`

2. **Disminuir nivel:**
   - Clic en "⬇ Disminuir (-5 dB)"
   - ✅ Nivel disminuye en pasos de 5 dB
   - ✅ En consola: `[MATCHING] 📉 Nivel MML disminuido: -15 dB → -20 dB`

3. **Límites:**
   - ✅ No baja de -20 dB (mmlStartLevel)
   - ✅ No sube de +40 dB (mmlMaxLevel)

4. **Reproducir en diferentes niveles:**
   - Ajustar a +10 dB
   - Reproducir
   - ✅ Volumen notablemente más alto que a -20 dB

### Test 4: Confirmar Enmascaramiento

**Objetivo:** Verificar que se guarda el nivel MML

1. **Ajustar nivel:**
   - Ej: Aumentar a +5 dB
   - Reproducir para verificar

2. **Confirmar:**
   - Clic en "✓ Confirmar Enmascaramiento"

3. **Verificar:**
   - ✅ Transición a pantalla de resultados
   - ✅ En consola: `[MATCHING-UI] ✅ Usuario confirmó nivel de enmascaramiento`
   - ✅ En consola: `[MATCHING] ✅ MML confirmado: +5 dB enmascara el tinnitus`
   - ✅ En consola: `[MATCHING] 💾 Resultados guardados en LocalStorage`

4. **Pantalla de resultados debe mostrar:**
   - ✅ Frecuencia identificada
   - ✅ Línea adicional: "MML (Nivel Mínimo de Enmascaramiento): +5 dB"

### Test 5: Omitir MML

**Objetivo:** Verificar que se puede saltar MML

1. **En pantalla de MML:**
   - Clic en "⏭ Omitir MML" (sin reproducir ni ajustar)

2. **Verificar:**
   - ✅ Transición directa a resultados
   - ✅ En consola: `[MATCHING-UI] ⏭️ Usuario omitió MML`
   - ✅ En consola: `[MATCHING] ⚠️ MML omitido por el usuario`

3. **Pantalla de resultados:**
   - ✅ NO muestra línea de MML
   - ✅ Resto de resultados normales

### Test 6: Narrow-Band Noise Quality

**Objetivo:** Verificar que el ruido suena correcto

1. **Para tinnitus de 4000 Hz:**
   - Reproducir enmascarador
   - ✅ Sonido centrado en ~4000 Hz (tono medio-alto)
   - ✅ Ruido de banda estrecha (no full white noise)
   - ✅ Bandwidth: ~500 Hz (±250 Hz)

2. **Para tinnitus de 8000 Hz:**
   - Si tienes un match de 8000 Hz
   - ✅ Sonido mucho más agudo
   - ✅ Mantiene carácter de narrow-band

3. **Comparar con white noise:**
   - En engine config, cambiar `mmlNoiseType: 'white'`
   - Reproducir
   - ✅ White noise cubre todo el espectro (más "ssshhhh" completo)

### Test 7: Integración con LocalStorage

**Objetivo:** Verificar que MML se guarda correctamente

1. **Completar matching con MML:**
   - Confirmar MML a +10 dB

2. **En consola del navegador:**
   ```javascript
   const match = Storage.getLatestTinnitusMatch();
   console.log('MML:', match.mml);
   ```

3. **Verificar estructura:**
   ```javascript
   {
     level: 10,
     frequency: 4500,
     noiseType: 'narrow-band',
     bandwidth: 500,
     attempts: 5,
     timestamp: 1734296400000
   }
   ```

### Test 8: Conversión dB a Volumen

**Objetivo:** Verificar que la conversión dB → volume funciona

**Tabla de conversión esperada:**

| dB Level | Volume (0-1) | Perceptual |
|----------|--------------|------------|
| -20 dB   | 0.10         | Muy bajo   |
| -10 dB   | 0.20         | Bajo       |
| 0 dB     | 0.30         | Medio      |
| +10 dB   | 0.40         | Medio-alto |
| +20 dB   | 0.50         | Alto       |
| +30 dB   | 0.60         | Muy alto   |
| +40 dB   | 0.70         | Máximo     |

**Testing:**
1. Reproducir a -20 dB → debe sonar muy bajo
2. Aumentar a 0 dB → volumen medio
3. Aumentar a +20 dB → claramente más alto
4. Verificar en consola: `Nivel MML probado: X dB (vol: Y%)`

---

## 📊 Algoritmo MML Detallado

### **Procedimiento:**

```
1. Usuario completa validation
2. Engine llama complete()
3. Si enableMML = true:
   - Llamar startMML()
   - Set stage = 'mml'
   - Set mmlLevel = -20 dB

4. UI renderiza pantalla MML

5. Usuario ajusta nivel:
   - Reproduce masker a nivel actual
   - Si escucha tinnitus: Aumentar +5 dB
   - Si no escucha tinnitus: Confirmar nivel
   - Puede disminuir si pasó de largo

6. Confirmar:
   - Guardar mmlResult con nivel final
   - Llamar finalize()
   - Guardar en Storage con mml incluido

7. Skip:
   - Guardar mmlResult con skipped = true
   - Llamar finalize()
```

### **Generación de Narrow-Band Noise:**

```
1. Crear buffer de white noise
   - Samples aleatorios entre -1 y 1
   - Duración * sampleRate samples

2. Aplicar filtro bandpass
   - Centro: frecuencia del tinnitus
   - Q factor: frequency / bandwidth
   - Ej: 4000 Hz / 500 Hz = Q = 8

3. Conectar: source → filter → gain → master

4. Fade in/out (50ms) para evitar clicks

5. Reproducir por 3 segundos
```

---

## ✅ Checklist de Validación

### Engine:
- [ ] Etapa 'mml' se inicia después de validation
- [ ] `playMasker()` reproduce narrow-band noise
- [ ] Nivel aumenta/disminuye en pasos de 5 dB
- [ ] Límites respetados (-20 a +40 dB)
- [ ] `confirmMasking()` guarda MML result
- [ ] `skipMML()` marca como skipped
- [ ] MML incluido en finalMatch

### Audio:
- [ ] Narrow-band noise centrado en frecuencia correcta
- [ ] Bandwidth ~500 Hz (sonido focused, no full white noise)
- [ ] Volume aumenta con nivel dB
- [ ] Fade in/out suave (sin clicks)
- [ ] Duración ~3 segundos

### UI:
- [ ] Pantalla MML renderiza correctamente
- [ ] Frecuencia mostrada es correcta
- [ ] Nivel actual se actualiza en tiempo real
- [ ] Botón "Reproducir" se deshabilita durante playback
- [ ] Controles deshabilitados durante playback
- [ ] Botones +/- funcionan
- [ ] Botón Confirmar transiciona a resultados
- [ ] Botón Omitir transiciona a resultados

### Resultados:
- [ ] MML mostrado si fue confirmado
- [ ] MML NO mostrado si fue omitido
- [ ] Format: "+X dB" correcto
- [ ] Guardado en Storage correctamente

### Logging:
- [ ] Logs de inicio MML
- [ ] Logs de nivel aumentado/disminuido
- [ ] Logs de reproducción con parámetros
- [ ] Logs de confirmación
- [ ] Sin errores en consola

---

## 🐛 Problemas Conocidos y Soluciones

### Problema 1: Ruido suena como white noise full spectrum
**Síntoma:** No se escucha diferencia entre frecuencias
**Causa:** Filtro bandpass no aplicado correctamente
**Solución:** Verificar Q factor = frequency / bandwidth en createFilter()

### Problema 2: Volume no cambia con nivel dB
**Síntoma:** Todos los niveles suenan igual
**Causa:** Conversión dB → volume incorrecta
**Solución:** Revisar fórmula en playMasker(): `0.3 + (level / 100)`

### Problema 3: Clicks al inicio/fin del ruido
**Síntoma:** "Pop" audible al empezar/terminar
**Causa:** Fade in/out demasiado corto o ausente
**Solución:** Aumentar fade a 50ms en playNarrowBandNoise()

### Problema 4: MML no se guarda en Storage
**Síntoma:** Después de reload, MML no aparece
**Causa:** finalize() no incluye mml en finalMatch
**Solución:** Verificar que `mml: this.mmlResult` está en finalMatch object

### Problema 5: Botones no se deshabilitan
**Síntoma:** Usuario puede clicar múltiples veces
**Causa:** `isPlaying` no se actualiza o renderMML() no se llama
**Solución:** Asegurar `this.isPlaying = true` y `renderMML()` en playMasker()

---

## 📝 Comandos de Debug

### Ver estado MML actual:
```javascript
const engine = matchingUI.engine;
console.log('MML Level:', engine.mmlLevel);
console.log('MML Attempts:', engine.mmlAttempts);
console.log('MML Result:', engine.mmlResult);
```

### Ver config:
```javascript
console.log('MML Config:', engine.config);
```

### Ver resultado final:
```javascript
const match = Storage.getLatestTinnitusMatch();
console.log('Final Match:', match);
console.log('MML:', match.mml);
```

### Probar ruido manualmente:
```javascript
// Narrow-band noise a 4000 Hz
await AudioContextManager.playNarrowBandNoise(4000, 500, 3, 0.5);

// White noise
await AudioContextManager.playWhiteNoise(3, 0.5);
```

### Cambiar config MML:
```javascript
matchingUI.engine.config.mmlStartLevel = -30;
matchingUI.engine.config.mmlStepSize = 2;
matchingUI.engine.config.mmlMaxLevel = 60;
```

---

## 🎯 Criterios de Aceptación

**PASS si:**
1. ✅ MML se inicia automáticamente después de validation
2. ✅ Narrow-band noise se reproduce centrado en frecuencia correcta
3. ✅ Nivel aumenta/disminuye en pasos de 5 dB
4. ✅ Volume aumenta perceptualmente con nivel dB
5. ✅ Confirmar guarda MML correctamente
6. ✅ Omitir salta MML sin guardar nivel
7. ✅ MML aparece en resultados si fue confirmado
8. ✅ MML se guarda en Storage
9. ✅ Sin errores en consola
10. ✅ Fade in/out suave (sin clicks)

**FAIL si:**
1. ❌ MML no se inicia o se salta automáticamente
2. ❌ Ruido suena como full white noise (no narrow-band)
3. ❌ Nivel no cambia o límites no se respetan
4. ❌ Volume no aumenta con dB
5. ❌ MML no se guarda o estructura incorrecta
6. ❌ Errores JavaScript en consola
7. ❌ Clicks audibles (fade in/out ausente)
8. ❌ UI no se actualiza correctamente

---

## 📈 Mejoras Implementadas

### **Feature MML Básico:**
- Medición de nivel mínimo de enmascaramiento ✅
- Narrow-band noise centrado en frecuencia del tinnitus ✅
- Control manual de nivel (+/- 5 dB) ✅
- Rango -20 a +40 dB ✅
- Guardado en resultados y Storage ✅
- UI intuitiva con instrucciones claras ✅

### **Calidad de Audio:**
- Narrow-band noise (no full white noise) ✅
- Fade in/out para evitar clicks ✅
- Bandwidth configurable (500 Hz default) ✅
- Conversión dB → volume perceptual ✅

---

## ✅ Próximo Paso

Si este paso PASA:
→ **Testing Completo de las 3 Features (Paso 6)**

Si este paso FALLA:
→ **Debuggear y ajustar parámetros de MML**

---

*Testing Guide - Paso 5*
*Versión: 1.0*
*Creado: 2025-12-15*
