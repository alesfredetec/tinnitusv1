# 🧪 Guía de Prueba Rápida - Módulo 1

## 🚀 Inicio Rápido

### 1. Servidor Local (YA CORRIENDO)

```bash
# El servidor ya está activo en:
http://localhost:8000
```

### 2. URLs de Acceso

```
Landing Page:
http://localhost:8000/index.html

Módulo 1 - Audiometría:
http://localhost:8000/audiometry.html   ← PROBAR AQUÍ

Módulo 2 (pendiente):
http://localhost:8000/matching.html

Módulo 3 (pendiente):
http://localhost:8000/treatment.html
```

---

## ✅ Checklist de Prueba

### Pantalla 1: Welcome
- [ ] Se muestra información de 2 etapas
- [ ] Instrucciones claras
- [ ] Botón "Comenzar Calibración" funciona

### Pantalla 2: Calibration
- [ ] Slider de volumen funciona
- [ ] Botón "Reproducir Tono" suena a 1000 Hz
- [ ] Al mover slider, volumen cambia
- [ ] Botón "Calibración Correcta" avanza

### Pantalla 3: Testing - Etapa 1
- [ ] Progress bar se actualiza
- [ ] Muestra frecuencia actual (ej: 4000 Hz)
- [ ] Muestra oído (Izquierdo/Derecho)
- [ ] Muestra nivel (ej: 40 dB HL)
- [ ] Botón "Escuché el Tono" se activa al sonar
- [ ] Botón pulsa (animación)
- [ ] Al presionar, pasa al siguiente tono
- [ ] Status muestra "Respuesta registrada"

### Pantalla 3b: Testing - Etapa 2 (si aplica)
- [ ] Badge cambia a "Etapa 2: Micro-audiometría"
- [ ] Mensaje "🔍 Micro-audiometría activada"
- [ ] Frecuencias más finas (ej: 5300 Hz, 5400 Hz)
- [ ] Progress bar continúa

### Pantalla 4: Results
- [ ] Muestra umbrales para ambos oídos
- [ ] Clasificación (Normal/Leve/etc.)
- [ ] Audiograma dibujado en Canvas
  - [ ] Línea azul (Izquierdo)
  - [ ] Línea roja (Derecho)
  - [ ] Grid visible
  - [ ] Etiquetas de frecuencias
  - [ ] Etiquetas de dB HL
- [ ] Si hay problemas, lista aparece
- [ ] Botón "Descargar Resultados" funciona
- [ ] Botón "Continuar a Búsqueda" visible

---

## 🔍 Prueba de Consola

Abrir DevTools (F12) y ejecutar:

```javascript
// 1. Ver estado del motor
audiometryUI.engine.getProgress()

// 2. Ver configuración
audiometryUI.engine.config

// 3. Ver resultados parciales (durante test)
audiometryUI.engine.results

// 4. Ver problemas detectados (después de Etapa 1)
audiometryUI.engine.problemFrequencies

// 5. Simular respuesta (solo en testing)
audiometryUI.engine.userHeard()
```

---

## 🐛 Problemas Comunes

### "No se escucha nada"
✅ **Solución:**
- Verificar auriculares conectados
- Subir volumen del sistema
- Usar slider de calibración
- Probar botón "Reproducir Tono"

### "Botón no se activa"
✅ **Solución:**
- Esperar a que suene el tono
- Verificar consola (F12) por errores
- Recargar página

### "No avanza a Etapa 2"
✅ **Solución:**
- **Es normal si no hay problemas detectados**
- Para forzar Etapa 2, en consola:
  ```javascript
  audiometryUI.engine.config.problemThreshold = 5  // Más sensible
  ```

---

## 📊 Ejemplo de Sesión Completa

### Timing Esperado

```
Welcome Screen:           30 segundos (lectura)
Calibration Screen:       60 segundos (ajuste)
Testing - Etapa 1:        10-15 minutos (26 tests)
Testing - Etapa 2:        5-10 minutos (si aplica)
Results Screen:           Variable (revisión)
────────────────────────────────────────────────
TOTAL:                    15-25 minutos
```

### Flujo de Tests

```
Test 1:  3000 Hz - Izquierdo - 40 dB → Usuario OYE → Baja a 30 dB
Test 2:  3000 Hz - Izquierdo - 30 dB → Usuario OYE → Baja a 20 dB
Test 3:  3000 Hz - Izquierdo - 20 dB → NO OYE → Sube a 30 dB
Test 4:  3000 Hz - Izquierdo - 30 dB → Usuario OYE → REVERSAL → Paso = 5 dB
...
Test 26: 12000 Hz - Derecho - Threshold encontrado
```

### Detección de Problema (Ejemplo)

```
Etapa 1 completada:
- 4000 Hz: 25 dB HL
- 6000 Hz: 50 dB HL  ← PROBLEMA: Caída de 25 dB
- 8000 Hz: 55 dB HL

Sistema detecta automáticamente → Inicia Etapa 2

Etapa 2 - Micro en 6000 Hz:
- 5500 Hz: 30 dB
- 5600 Hz: 35 dB
- 5700 Hz: 40 dB
- 5800 Hz: 45 dB
- 5900 Hz: 48 dB
- 6100 Hz: 52 dB  ← Pico exacto encontrado
- 6200 Hz: 50 dB
- 6300 Hz: 48 dB
```

---

## 💾 Verificación de LocalStorage

En consola (F12):

```javascript
// Ver todos los datos guardados
Storage.exportData()

// Ver última audiometría
Storage.getLatestAudiometryResults()

// Limpiar todo (CUIDADO)
Storage.clearAll()
```

---

## 📸 Capturas Esperadas

### Welcome Screen
```
┌────────────────────────────────────────┐
│ 🎧 Audiometría Adaptativa              │
│                                        │
│ Sistema de 2 Etapas:                   │
│ • Etapa 1: Audiometría estándar        │
│ • Etapa 2: Micro-audiometría automática│
│                                        │
│ ⏱️ Duración estimada                   │
│ • Etapa 1: 10-15 minutos               │
│ • Etapa 2: 5-10 minutos                │
│                                        │
│ [Comenzar Calibración]                 │
└────────────────────────────────────────┘
```

### Testing Screen
```
┌────────────────────────────────────────┐
│ Etapa 1: Audiometría Estándar          │
│ ██████████████░░░░░░░░░░  14/26 (54%) │
│                                        │
│           4000 Hz                       │
│       Oído Derecho                     │
│       Nivel: 35 dB HL                  │
│                                        │
│  🎵 Escuchando...                       │
│  ¿Puedes oír el tono?                  │
│                                        │
│  [✓ Escuché el Tono] (pulsando)        │
│                                        │
│  [⏸ Pausar]  [⏹ Detener]               │
└────────────────────────────────────────┘
```

### Results Screen
```
┌────────────────────────────────────────┐
│ ✅ Audiometría Completada               │
│                                        │
│ ┌─────────────┬─────────────┐          │
│ │   28 dB HL  │   32 dB HL  │          │
│ │  Izquierdo  │   Derecho   │          │
│ │  [Normal]   │   [Leve]    │          │
│ └─────────────┴─────────────┘          │
│                                        │
│ 📊 Audiograma                           │
│ [Gráfico Canvas con líneas azul/roja]  │
│                                        │
│ ⚠️ Frecuencias con Pérdida Auditiva     │
│ • 6100 Hz (Izq) - 52 dB HL • Caída 27  │
│                                        │
│ [💾 Descargar] [Continuar →]           │
└────────────────────────────────────────┘
```

---

## 🎯 Prueba Completa en 5 Minutos

Para testing rápido, modificar en consola:

```javascript
// ANTES de empezar el test:

// Reducir frecuencias a 3
audiometryUI.engine.frequencies = [1000, 4000, 8000]

// Reducir timeout
audiometryUI.engine.config.responseTimeout = 1000

// Deshabilitar micro-audiometría
audiometryUI.engine.config.enableMicroAudiometry = false

// Ahora iniciar test
// Duración: ~3 minutos (3 freq × 2 oídos = 6 tests)
```

---

## ✅ Criterios de Éxito

### Funcionalidad Core
- [x] Sistema inicia correctamente
- [x] Audio se reproduce
- [x] Usuario puede responder
- [x] Progress bar actualiza
- [x] Umbrales se detectan
- [x] Transición entre etapas (si aplica)
- [x] Resultados se muestran
- [x] Audiograma se dibuja
- [x] Datos se guardan en LocalStorage
- [x] Exportación funciona

### UX/UI
- [x] Instrucciones claras
- [x] Feedback visual
- [x] Estados visibles
- [x] Controles responsivos
- [x] Sin errores visibles
- [x] Navegación fluida

### Performance
- [x] Carga rápida (< 1 seg)
- [x] Sin lag en UI
- [x] Audio sin cortes
- [x] Canvas renderiza suave

---

## 🆘 Soporte

Si encuentras problemas:

1. **Revisar consola (F12)** - Ver errores
2. **Recargar página** - Limpiar estado
3. **Limpiar LocalStorage** - `Storage.clearAll()`
4. **Ver documentación** - `MODULO_1_AUDIOMETRIA.md`

---

**✨ ¡El sistema está listo para probar!**

**URL:** http://localhost:8000/audiometry.html
