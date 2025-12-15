# 🧪 Testing: Paso 1 - Randomización Inteligente

**Fecha:** 2025-12-15
**Feature:** Randomización inteligente con catch trials estratégicos

---

## ✅ Qué se Implementó

### 1. **RandomizedSequencer Class**
Archivo: `js/audiometry/randomized-sequencer.js`

**Features:**
- ✅ Randomización con constraints inteligentes
- ✅ No más de 2 tests consecutivos mismo oído
- ✅ Evita frecuencias adyacentes (<0.5 octavas)
- ✅ Catch trials estratégicos (12% de tests)
- ✅ Intervalo entre catch trials: 6-12 tests
- ✅ Tracking de progreso y estadísticas

### 2. **Integración en AudiometryEngine**
Archivo: `js/audiometry/audiometry-engine.js`

**Cambios:**
- ✅ Sequencer inicializado en constructor
- ✅ Método `initialize()` usa sequencer
- ✅ `runNextTest()` obtiene tests del sequencer
- ✅ Detecta y ejecuta catch trials
- ✅ Marca tests como completados en sequencer
- ✅ Progreso basado en sequencer
- ✅ Logging comprehensivo

### 3. **Eliminación de Randomización Antigua**
- ❌ Eliminado: shuffle simple de Utils
- ❌ Eliminado: catch trials aleatorios inline
- ✅ Reemplazado: sequencer inteligente

---

## 🧪 Cómo Probar

### Test 1: Verificar Randomización

1. **Abrir:** http://localhost:8000/audiometry.html
2. **Abrir Consola** (F12)
3. **Buscar en logs:**
   ```
   [SEQUENCER] 🎲 Generando secuencia randomizada para 13 frecuencias x 2 oídos
   [SEQUENCER] Tests generados: X estándar + Y catch trials = Z total
   [SEQUENCER] Primeros 10 tests: [...]
   ```

**Verificar:**
- ✅ Total tests = 26 estándar + ~3 catch trials = ~29 tests
- ✅ Orden NO es secuencial (125-L, 125-R, 250-L...)
- ✅ No hay más de 2 consecutivos mismo oído

### Test 2: Catch Trials

1. **Durante la prueba**, cuando veas en consola:
   ```
   [AUDIOMETRY] 🎯 CATCH TRIAL - Presentando silencio
   ```

2. **Comportamiento correcto:**
   - 🔇 No deberías escuchar NADA
   - ⏱️ Espera 3 segundos sin presionar nada
   - ✅ Si no presionas = CORRECTO (no falso positivo)
   - ❌ Si presionas "SÍ" = FALSO POSITIVO detectado

**Verificar:**
- ✅ Aparecen ~3 catch trials durante la prueba
- ✅ No están consecutivos
- ✅ Sistema detecta si presionas erróneamente

### Test 3: Orden No Predecible

**Ejecuta 2 veces el test y compara:**

1. **Primera ejecución:**
   ```javascript
   // En consola, al iniciar test:
   logger.getModuleLogs('sequencer')
   // Copia los "Primeros 10 tests"
   ```

2. **Segunda ejecución (reload página):**
   ```javascript
   logger.getModuleLogs('sequencer')
   // Copia los "Primeros 10 tests"
   ```

**Verificar:**
- ✅ Los órdenes son DIFERENTES
- ✅ Ambos cumplen constraints (no >2 mismo oído, etc.)

### Test 4: Progreso Correcto

Durante la prueba, observa la barra de progreso:

**Verificar:**
- ✅ Progreso aumenta correctamente (0% → 100%)
- ✅ Muestra "X / Y tests" correctamente
- ✅ Incluye catch trials en el conteo total
- ✅ Mensajes como "Testing XXXX Hz - left ear" aparecen

### Test 5: Logging Detallado

**En consola, ejecuta:**
```javascript
logger.summary()
```

**Buscar logs de:**
- `[SEQUENCER]` - Generación de secuencia
- `[AUDIOMETRY]` - Tests y catch trials
- `[AUDIOMETRY-UI]` - Respuestas del usuario

**Verificar:**
- ✅ Cada test tiene log de inicio
- ✅ Cada umbral encontrado tiene log
- ✅ Catch trials tienen log especial
- ✅ Respuestas (SÍ/NO) tienen log

---

## 📊 Estadísticas Esperadas

Para una sesión típica (13 frecuencias × 2 oídos):

| Métrica | Valor Esperado |
|---------|----------------|
| **Tests estándar** | 26 |
| **Catch trials** | 3-4 |
| **Total tests** | 29-30 |
| **Duración** | 12-15 min |
| **Catch trial spacing** | 6-12 tests entre cada uno |
| **Max consecutivos mismo oído** | 2 |

---

## ✅ Checklist de Validación

### Funcionalidad Básica:
- [ ] La prueba inicia correctamente
- [ ] Los tests aparecen en orden randomizado
- [ ] Puedo responder con botones SÍ/NO
- [ ] Puedo responder con teclado (ESPACIO/N)
- [ ] El progreso se actualiza
- [ ] La prueba termina correctamente

### Randomización:
- [ ] Orden es diferente en cada ejecución
- [ ] No hay más de 2 consecutivos mismo oído
- [ ] Frecuencias adyacentes no son consecutivas
- [ ] El orden se ve "natural" (no predecible)

### Catch Trials:
- [ ] Aparecen 3-4 catch trials
- [ ] Hay silencio durante catch trials
- [ ] Sistema detecta falsos positivos
- [ ] Spacing entre catch trials es apropiado

### Logging:
- [ ] Logs de sequencer aparecen al inicio
- [ ] Logs de cada test aparecen
- [ ] Logs de catch trials son claros
- [ ] Logs de respuestas son detallados
- [ ] `logger.summary()` funciona

### Performance:
- [ ] No hay lag/delays extraños
- [ ] Transiciones son suaves
- [ ] Consola no muestra errores
- [ ] Memoria no crece excesivamente

---

## 🐛 Problemas Conocidos y Soluciones

### Problema 1: "sequencer is not defined"
**Síntoma:** Error en consola al iniciar
**Causa:** Archivo no cargado
**Solución:** Verificar que `randomized-sequencer.js` esté antes de `audiometry-engine.js` en HTML

### Problema 2: Tests en orden secuencial
**Síntoma:** Siempre aparece 125-L, 125-R, 250-L...
**Causa:** Sequencer no se está usando
**Solución:** Verificar que `initialize()` llame a `sequencer.generateSequence()`

### Problema 3: No aparecen catch trials
**Síntoma:** Solo tests normales, nunca silencio
**Causa:** Catch trials no insertados o no detectados
**Solución:** Verificar `catchTrialFrequency` en config y que `presentCatchTrial()` se ejecute

### Problema 4: Progreso incorrecto
**Síntoma:** Barra de progreso no avanza o salta
**Causa:** Sequencer no marca tests como completados
**Solución:** Verificar que `sequencer.markCompleted()` se llame después de cada test

---

## 📝 Comandos de Debug

### Ver secuencia generada:
```javascript
audiometryUI.engine.sequencer.exportSequence()
```

### Ver estadísticas:
```javascript
audiometryUI.engine.sequencer.getStatistics()
```

### Ver progreso actual:
```javascript
audiometryUI.engine.sequencer.getProgress()
```

### Ver tests completados:
```javascript
audiometryUI.engine.sequencer.completedTests
```

### Ver logs del sequencer:
```javascript
logger.getModuleLogs('sequencer')
```

---

## 🎯 Criterios de Aceptación

**PASS si:**
1. ✅ Tests aparecen randomizados (diferente cada vez)
2. ✅ Constraints se respetan (no >2 mismo oído, no adyacentes)
3. ✅ Catch trials aparecen estratégicamente
4. ✅ Sistema detecta falsos positivos
5. ✅ Progreso es correcto
6. ✅ Logging es comprehensivo
7. ✅ Sin errores en consola

**FAIL si:**
1. ❌ Tests siempre en mismo orden
2. ❌ Más de 2 consecutivos mismo oído
3. ❌ Sin catch trials
4. ❌ Progreso incorrecto
5. ❌ Errores JavaScript en consola

---

## 📊 Reporte de Testing

Después de probar, completa:

**Fecha:** __________
**Testeado por:** __________
**Resultado:** ☐ PASS | ☐ FAIL

**Notas:**
```
___________________________________________
___________________________________________
___________________________________________
```

**Issues encontrados:**
```
1. ________________________________
2. ________________________________
3. ________________________________
```

**Screenshots/Logs adjuntos:**
☐ Sí | ☐ No

---

## ✅ Próximo Paso

Si este paso PASA:
→ **Continuar con Paso 2: Plotly.js Audiograma Interactivo**

Si este paso FALLA:
→ **Debuggear y corregir antes de continuar**

---

*Testing Guide - Paso 1*
*Versión: 1.0*
*Creado: 2025-12-15*
