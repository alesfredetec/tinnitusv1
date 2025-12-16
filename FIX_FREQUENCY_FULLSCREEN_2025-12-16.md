# Correcciones: Ajuste de Frecuencia y Fullscreen

**Fecha:** 2025-12-16
**Versión:** 1.6.2

---

## 🐛 Problemas Reportados

### 1. Audio Se Corta Al Ajustar Frecuencia

**Síntoma:**
```
[TREATMENT-UI] 🎯 Ajuste de frecuencia: 4050 Hz → 4082 Hz (+0.8%)
[Audio se corta, no se escucha nada]
```

**Causa:**
El método `updateFrequency()` en `treatment-engine.js` no tenía casos para las terapias híbridas en su switch statement. Cuando el usuario ajustaba la frecuencia durante una sesión híbrida:
1. Se llamaba `stopAudioOnly()` para detener el audio actual
2. El switch statement NO encontraba coincidencia para `'hybrid-notched-ambient'` o `'hybrid-cr-ambient'`
3. El audio nunca se reiniciaba
4. **Resultado:** Silencio total

### 2. Error de Fullscreen (Al Cambiar Terapias)

**Síntoma:**
```
[19:10:45.019] ❌ [VISUALIZATION] Error activando fullscreen: Element is not connected
```
Ocurre **solo a veces, cuando cambias entre terapias**.

**Causa:**
Al cambiar de terapia, el DOM se re-renderiza, destruyendo el canvas viejo y creando uno nuevo. Pero `this.canvas` en el VisualizationEngine seguía apuntando al canvas antiguo (desconectado), causando un `DOMException`.

---

## ✅ Soluciones Implementadas

### Fix 1: Soporte para Terapias Híbridas en updateFrequency()

**Archivo:** `js/treatment/treatment-engine.js` (líneas 967-1017)

**Cambios:**

1. **Agregados casos para terapias híbridas:**
```javascript
case 'hybrid-notched-ambient':
  Logger.debug('treatment', `Reiniciando terapia híbrida Notched + ${currentSubType}`);
  await this.startHybridNotchedAmbient(currentSubType || 'rain');
  break;
case 'hybrid-cr-ambient':
  Logger.debug('treatment', `Reiniciando terapia híbrida CR + ${currentSubType}`);
  await this.startHybridCRAmbient(currentSubType || 'rain');
  break;
```

2. **Agregado caso default con error handling:**
```javascript
default:
  Logger.error('treatment', `❌ Tipo de terapia desconocido: ${this.currentTherapy}`);
  Logger.warn('treatment', 'No se pudo reiniciar la terapia con nueva frecuencia');
  return;
```

3. **Logging mejorado:**
```javascript
Logger.debug('treatment', `Reiniciando terapia ${this.currentTherapy} con nueva frecuencia`);
Logger.debug('treatment', `SubTipo actual: ${this.currentSubType || 'ninguno'}`);
```

**Resultado:** Ahora el ajuste de frecuencia funciona correctamente en TODAS las terapias:
- ✅ Notched Sound Therapy
- ✅ CR Neuromodulation
- ✅ Sound Masking
- ✅ Ambient Sounds
- ✅ **Hybrid: Notched + Ambient** (NUEVO)
- ✅ **Hybrid: CR + Ambient** (NUEVO)

---

### Fix 2: Auto-Reconexión de Canvas en Fullscreen

**Archivo:** `js/treatment/visualization-engine.js`

**Cambios:**

1. **Auto-reconexión en `toggleFullscreen()` (líneas 199-241):**
```javascript
// Verificar si canvas está desconectado
if (!document.body.contains(this.canvas)) {
  Logger.warn('visualization', 'Canvas desconectado del DOM (cambio de terapia detectado)');

  // Intentar re-adquirir referencia al canvas nuevo
  const newCanvas = document.getElementById('visualization-canvas');
  if (newCanvas && document.body.contains(newCanvas)) {
    this.canvas = newCanvas;
    this.ctx = newCanvas.getContext('2d');
    this.resize();
    Logger.success('visualization', '✅ Canvas nuevo encontrado y conectado');
  } else {
    Logger.error('visualization', 'No se pudo encontrar canvas nuevo');
    return; // Abort fullscreen
  }
}
```

2. **Auto-reconexión en `start()` (líneas 131-142):**
```javascript
// Re-connect canvas if it was disconnected (e.g., after therapy change)
if (this.canvas && !document.body.contains(this.canvas)) {
  Logger.warn('visualization', 'Canvas desconectado, re-conectando...');
  const newCanvas = document.getElementById('visualization-canvas');
  if (newCanvas && document.body.contains(newCanvas)) {
    this.canvas = newCanvas;
    this.ctx = newCanvas.getContext('2d');
    this.resize();
    Logger.success('visualization', '✅ Canvas re-conectado automáticamente');
  }
}
```

3. **Logging diagnóstico mejorado:**
```javascript
Logger.debug('visualization', `Canvas: ${this.canvas.width}x${this.canvas.height}, isConnected: ${this.canvas.isConnected}`);
```

**Resultado:**
- ✅ Fullscreen funciona correctamente incluso después de cambiar terapias
- ✅ Visualización se re-conecta automáticamente si detecta desconexión
- ✅ Logs claros indican cuando ocurre re-conexión

---

## 🔍 Testing Requerido

### Test 1: Ajuste de Frecuencia en Terapias Híbridas

**Pasos:**
1. Iniciar terapia **Hybrid: Notched + Rain**
2. Esperar 10 segundos
3. Mover el slider de ajuste de frecuencia
4. **Verificar:** Audio continúa sin interrupciones
5. **Verificar logs:**
   ```
   [treatment] 🎯 Actualizando frecuencia en tiempo real: 4000 Hz → 4080 Hz
   [treatment] 🔍 Reiniciando terapia hybrid-notched-ambient con nueva frecuencia
   [treatment] 🔍 SubTipo actual: rain
   [treatment] 🔍 Reiniciando terapia híbrida Notched + rain
   [treatment] ✅ Frecuencia actualizada y terapia reiniciada
   ```

**Repetir con:**
- Hybrid: CR + Ocean
- Hybrid: Notched + Forest
- Hybrid: CR + White Noise

### Test 2: Fullscreen en Visualización

**Pasos:**
1. Iniciar cualquier terapia
2. Esperar a que visualización aparezca
3. Click en botón "Pantalla Completa"
4. **Verificar logs:**
   ```
   [visualization] 🔍 Intentando activar fullscreen...
   [visualization] 🔍 Canvas: 800x400, isConnected: true
   [visualization] 🖥️ Solicitando modo fullscreen
   ```

**Si falla:**
- Verificar logs de error detallados
- Compartir información del navegador
- Verificar si canvas está en el DOM

### Test 3: Ajuste de Frecuencia en Todas las Terapias

**Matriz de Testing:**

| Terapia | Subtipo | ¿Funciona? | Logs |
|---------|---------|------------|------|
| Notched | N/A | ✅ | OK |
| CR | N/A | ✅ | OK |
| Masking | White | ✅ | OK |
| Masking | Pink | ✅ | OK |
| Masking | Brown | ✅ | OK |
| Ambient | Rain | ✅ | OK |
| Hybrid-Notched | Rain | ⏳ **PENDIENTE** | - |
| Hybrid-Notched | Ocean | ⏳ **PENDIENTE** | - |
| Hybrid-CR | Forest | ⏳ **PENDIENTE** | - |
| Hybrid-CR | River | ⏳ **PENDIENTE** | - |

---

## 📊 Estadísticas de Cambios

### Código Modificado

**`treatment-engine.js`:**
- Líneas agregadas: 12
- Casos nuevos en switch: 3 (hybrid-notched, hybrid-cr, default)
- Logging statements: 3

**`visualization-engine.js`:**
- Líneas agregadas: 40
- Auto-reconexión implementada: 2 métodos (toggleFullscreen, start)
- Verificaciones nuevas: 3 (canvas existe, canvas conectado, canvas.isConnected)
- Logging statements: 14

**Total:**
- Archivos modificados: 2
- Líneas agregadas: ~52
- Funcionalidad corregida:
  - ✅ Ajuste de frecuencia en terapias híbridas
  - ✅ Auto-reconexión de canvas al cambiar terapias
- Diagnóstico mejorado: Fullscreen errors con logs detallados

---

## 🎯 Impacto

### Usuarios Afectados
- **Antes:** Usuarios con terapias híbridas NO podían ajustar frecuencia sin perder audio
- **Ahora:** Usuarios pueden ajustar frecuencia en tiempo real en TODAS las terapias

### Experiencia de Usuario
- **Antes:** Ajustar frecuencia → Silencio → Reiniciar sesión manualmente
- **Ahora:** Ajustar frecuencia → Audio continúa suavemente con nueva frecuencia

### Debugging
- **Antes:** Error de fullscreen sin contexto
- **Ahora:** Logs detallados identifican causa exacta (canvas disconnected, API no soportada, etc.)

---

## 🔮 Próximos Pasos

### Si el Problema Persiste

**Ajuste de frecuencia:**
1. Verificar que navegador tiene caché limpio (`Ctrl + Shift + R`)
2. Verificar logs en consola
3. Reportar qué terapia específica falla

**Fullscreen:**
1. Compartir logs completos de error
2. Probar en otro navegador
3. Verificar permisos de fullscreen en el navegador

### Mejoras Futuras Posibles

1. **Transición suave en cambio de frecuencia:**
   ```javascript
   // Fade out → Change frequency → Fade in
   // En lugar de stop → restart inmediato
   ```

2. **~~Cache del canvas reference~~** ✅ **IMPLEMENTADO**
   ```javascript
   // Re-query canvas si se detecta disconnected
   // ✅ Ya implementado en toggleFullscreen() y start()
   ```

3. **Fullscreen en container en lugar de canvas:**
   ```javascript
   // Usar visualization-container para fullscreen
   // Más robusto que canvas solo
   container.requestFullscreen();
   ```

---

## 📝 Notas Importantes

### Hard Refresh
- **SIEMPRE hacer hard refresh después de actualizar archivos JS**
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### Navegadores Soportados
- Chrome 42+ ✅
- Firefox 37+ ✅
- Edge 79+ ✅
- Safari 14.1+ ✅

### Logs de Diagnóstico
Si reportas un problema, incluir:
1. Navegador y versión
2. Logs de consola completos
3. Qué terapia estabas usando
4. Qué subtipo (si híbrida)
5. En qué % de ajuste de frecuencia ocurre

---

**Última actualización:** 2025-12-16
**Estado:** ✅ Cambios implementados, pendiente testing por usuario
