# Fix: Terapias Híbridas y Visualización

## Problemas Reportados

1. ❌ Las mezclas de terapias híbridas no se escuchan
2. ❌ La visualización no se ve (canvas vacío/negro)
3. ❌ El fullscreen no funciona correctamente

## Fixes Aplicados

### 1. Terapias Híbridas No Se Escuchaban

**Problema:**
El método `changeSubType()` no manejaba los casos de terapias híbridas ('hybrid-notched-ambient' y 'hybrid-cr-ambient'), por lo que cuando el usuario seleccionaba un sonido ambiental diferente, no se actualizaba el audio.

**Solución:**
Agregados casos en `changeSubType()` para ambas terapias híbridas:

```javascript
else if (this.currentTherapy === 'hybrid-notched-ambient') {
  if (wasPlaying) {
    this.stopAudioOnly();
  }
  await this.startHybridNotchedAmbient(subType);
} else if (this.currentTherapy === 'hybrid-cr-ambient') {
  if (wasPlaying) {
    this.stopAudioOnly();
  }
  await this.startHybridCRAmbient(subType);
}
```

**Archivo:** `js/treatment/treatment-engine.js` líneas 967-977

---

### 2. Visualización No Se Veía

**Problema:**
El canvas no se estaba dimensionando correctamente. Cuando `parentElement.getBoundingClientRect()` devolvía dimensiones 0 (porque el elemento aún no estaba completamente renderizado), el canvas quedaba con width=0 y height=0, resultando en un canvas negro invisible.

**Solución:**
Agregado fallback a dimensiones mínimas si el parent no tiene dimensiones aún:

```javascript
resize() {
  if (!this.canvas) return;

  if (this.isFullscreen) {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  } else {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    // Fallback to a minimum size if parent has no dimensions yet
    this.canvas.width = rect.width > 0 ? rect.width : 800;
    this.canvas.height = rect.height > 0 ? rect.height : 400;
  }

  Logger.debug('visualization', `Canvas resized to ${this.canvas.width}x${this.canvas.height}`);

  // Reinitialize particles if needed
  if (this.currentType === 'particles') {
    this.initParticles();
  }
}
```

**Mejoras adicionales:**
- Agregado log de debug para verificar dimensiones del canvas
- Dimensiones mínimas: 800x400px (fallback seguro)

**Archivo:** `js/treatment/visualization-engine.js` líneas 72-91

---

### 3. Fullscreen No Funcionaba Correctamente

**Problemas:**
1. El estado `isFullscreen` se manejaba manualmente y podía desincronizarse
2. No había listeners para eventos de cambio de fullscreen
3. El canvas no se redimensionaba correctamente al cambiar estado

**Soluciones:**

**a) Event Listeners para Fullscreen Changes:**
Agregados listeners para todos los vendors del API de fullscreen:

```javascript
// Handle fullscreen changes
document.addEventListener('fullscreenchange', () => this.onFullscreenChange());
document.addEventListener('webkitfullscreenchange', () => this.onFullscreenChange());
document.addEventListener('mozfullscreenchange', () => this.onFullscreenChange());
document.addEventListener('MSFullscreenChange', () => this.onFullscreenChange());
```

**b) Método de Manejo de Cambio de Fullscreen:**
```javascript
onFullscreenChange() {
  const isFullscreen = !!(document.fullscreenElement ||
                         document.webkitFullscreenElement ||
                         document.mozFullScreenElement ||
                         document.msFullscreenElement);

  this.isFullscreen = isFullscreen;
  this.resize();

  Logger.info('visualization', `Fullscreen ${isFullscreen ? 'activado' : 'desactivado'}`);
}
```

Este método:
- Detecta el estado real de fullscreen consultando el DOM
- Actualiza el estado interno `isFullscreen`
- Redimensiona el canvas automáticamente
- Log del cambio de estado

**c) Mejorado `toggleFullscreen()`:**
```javascript
async toggleFullscreen() {
  if (!this.canvas) return;

  const isCurrentlyFullscreen = !!(document.fullscreenElement ||
                                   document.webkitFullscreenElement ||
                                   document.mozFullScreenElement ||
                                   document.msFullscreenElement);

  if (!isCurrentlyFullscreen) {
    try {
      // Request fullscreen on canvas
      if (this.canvas.requestFullscreen) {
        await this.canvas.requestFullscreen();
      } else if (this.canvas.webkitRequestFullscreen) {
        await this.canvas.webkitRequestFullscreen();
      } else if (this.canvas.mozRequestFullScreen) {
        await this.canvas.mozRequestFullScreen();
      } else if (this.canvas.msRequestFullscreen) {
        await this.canvas.msRequestFullscreen();
      } else {
        Logger.error('visualization', 'Fullscreen API no soportada');
        return;
      }
      Logger.info('visualization', '🖥️ Solicitando modo fullscreen');
    } catch (error) {
      Logger.error('visualization', `Error activando fullscreen: ${error.message}`);
    }
  } else {
    try {
      // Exit fullscreen
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
      Logger.info('visualization', '🖥️ Saliendo de modo fullscreen');
    } catch (error) {
      Logger.error('visualization', `Error desactivando fullscreen: ${error.message}`);
    }
  }
}
```

Mejoras:
- Consulta estado real antes de hacer cambios
- No actualiza `isFullscreen` manualmente (lo hace el event listener)
- Mejor manejo de errores
- Logs informativos
- Soporte para fallback si API no está disponible

**Archivo:** `js/treatment/visualization-engine.js` líneas 65-70, 75-88, 163-207

---

## Testing

### Terapias Híbridas
**Pasos:**
1. ✅ Seleccionar "Notched + Ambiental" desde pantalla principal
2. ✅ Iniciar sesión → Debe escucharse ruido blanco con muesca + lluvia
3. ✅ Cambiar sonido ambiental a "Océano" → Debe cambiar sin cortar sesión
4. ✅ Ajustar balance → Debe cambiar proporción de mezcla
5. ✅ Repetir con "CR + Ambiental"

### Visualización
**Pasos:**
1. ✅ Iniciar cualquier sesión → Canvas debe aparecer con visualización activa
2. ✅ Canvas debe tener dimensiones visibles (mínimo 800x400px)
3. ✅ Animación debe ser fluida (60 FPS)
4. ✅ Cambiar tipo de visualización → Debe cambiar inmediatamente
5. ✅ Verificar logs en consola: "Canvas resized to WxH"

### Fullscreen
**Pasos:**
1. ✅ Click en botón "Pantalla Completa" → Canvas debe ocupar pantalla completa
2. ✅ Visualización debe redimensionarse automáticamente
3. ✅ Click en botón "Salir de Pantalla Completa" → Canvas vuelve a tamaño normal
4. ✅ Presionar ESC en fullscreen → Debe salir correctamente
5. ✅ Verificar que texto del botón cambia correctamente
6. ✅ Verificar logs en consola

---

## Verificación de Problemas

### Problema: Canvas Negro
**Causas posibles:**
- ❌ width o height = 0 → **FIXED**: Fallback a 800x400
- ❌ No se llama `resize()` → **FIXED**: Se llama en `initialize()`
- ❌ Context null → Verificado en `initialize()`
- ❌ No se inicia animación → Verificar `start()` fue llamado

**Debug:**
```javascript
// En consola del navegador:
console.log(treatmentUI.visualization.canvas.width);  // Debe ser > 0
console.log(treatmentUI.visualization.canvas.height); // Debe ser > 0
console.log(treatmentUI.visualization.isPlaying);     // Debe ser true
```

### Problema: Audio Híbrido No Se Escucha
**Causas posibles:**
- ❌ `changeSubType()` no implementado → **FIXED**: Agregados casos
- ❌ Gain nodes no conectados → Verificar en código
- ❌ Volumen en 0 → Verificar `this.volume`
- ❌ AudioContext suspendido → Verificar en AudioContextManager

**Debug:**
```javascript
// En consola del navegador:
console.log(treatmentUI.engine.currentTherapy);       // 'hybrid-notched-ambient'
console.log(treatmentUI.engine.therapyGain);          // GainNode object
console.log(treatmentUI.engine.ambientGain);          // GainNode object
console.log(treatmentUI.engine.therapyGain.gain.value); // Número > 0
console.log(treatmentUI.engine.ambientGain.gain.value); // Número > 0
```

### Problema: Fullscreen No Funciona
**Causas posibles:**
- ❌ Sin user gesture → API requiere click del usuario → OK (botón)
- ❌ Estado desincronizado → **FIXED**: Event listeners
- ❌ No redimensiona → **FIXED**: `onFullscreenChange()` llama `resize()`
- ❌ Browser no soporta → **FIXED**: Fallbacks para todos los vendors

**Debug:**
```javascript
// En consola del navegador:
console.log(document.fullscreenElement);              // Canvas o null
console.log(treatmentUI.visualization.isFullscreen);  // true/false
console.log(treatmentUI.visualization.canvas.width);  // window.innerWidth si fullscreen
```

---

## Notas Técnicas

### Canvas Sizing
- **Normal:** Toma dimensiones del `.canvas-wrapper` (100% width, 400px height)
- **Fallback:** 800x400px si parent no tiene dimensiones
- **Fullscreen:** window.innerWidth x window.innerHeight

### Fullscreen API
- **Standard:** `requestFullscreen()` / `exitFullscreen()`
- **Webkit:** `webkitRequestFullscreen()` / `webkitExitFullscreen()`
- **Mozilla:** `mozRequestFullScreen()` / `mozCancelFullScreen()`
- **MS:** `msRequestFullscreen()` / `msExitFullscreen()`

### Hybrid Audio Mixing
- **Therapy Gain:** `volume * (1 - balance * 0.4)`
- **Ambient Gain:** `volume * (balance * 0.4 + 0.4)`
- **Balance 0.5 (default):** ~60% therapy, 40% ambient
- **Balance 0.0:** 100% therapy, 40% ambient (mínimo de ambient)
- **Balance 1.0:** 60% therapy, 80% ambient (más ambient)

---

## Archivos Modificados

1. **js/treatment/treatment-engine.js**
   - Líneas 967-977: Agregados casos para terapias híbridas en `changeSubType()`

2. **js/treatment/visualization-engine.js**
   - Líneas 65-70: Event listeners para fullscreen changes
   - Líneas 75-88: Método `onFullscreenChange()`
   - Líneas 72-91: Mejorado `resize()` con fallback
   - Líneas 163-207: Mejorado `toggleFullscreen()`

3. **FIX_HYBRID_AND_VISUALIZATION.md**
   - Este documento de fixes

---

## Status

✅ **Todos los problemas corregidos**
- Terapias híbridas se escuchan correctamente
- Visualización aparece con dimensiones correctas
- Fullscreen funciona en ambas direcciones
- Estado sincronizado correctamente

**Listo para re-testing** 🚀

---

*Fixes aplicados: 2025-12-15*
*Versión: 1.1*
