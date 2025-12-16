# Debug: Visualizaciones en Terapias Híbridas

## Problema Reportado

**Síntoma:** Las visualizaciones no se ven cuando se inician sesiones de terapias híbridas:
- Notched + Ambiental
- CR + Ambiental

## Cambios Aplicados para Debug

### 1. Logging Detallado en `treatment-ui.js` (startSession)

**Archivo:** `js/treatment/treatment-ui.js` líneas 1006-1048

**Logs agregados:**
```javascript
Logger.info('treatment-ui', `▶️ Iniciando sesión - Terapia: ${this.currentTherapy}, SubTipo: ${this.currentSubType}, Duración: ${duration}min`);
Logger.debug('treatment-ui', `Visualization container encontrado: ${visualizationContainer ? 'SI' : 'NO'}`);
Logger.debug('treatment-ui', `Mostrando visualization container...`);
Logger.debug('treatment-ui', `Inicializando visualization engine...`);
Logger.debug('treatment-ui', `Visualization inicializado: ${initSuccess ? 'EXITO' : 'FALLO'}`);
Logger.debug('treatment-ui', `Iniciando visualization tipo: ${visualizationType}`);
Logger.success('treatment-ui', `✅ Visualization debería estar visible ahora`);
```

**Objetivo:** Identificar si el container existe en el DOM y si la inicialización es exitosa.

---

### 2. Logging de Estilos CSS en `visualization-engine.js` (start)

**Archivo:** `js/treatment/visualization-engine.js` líneas 131-169

**Logs agregados:**
```javascript
// Check canvas visibility
const computedStyle = window.getComputedStyle(this.canvas);
const parentStyle = window.getComputedStyle(this.canvas.parentElement);
Logger.debug('visualization', `Canvas display: ${computedStyle.display}, visibility: ${computedStyle.visibility}, opacity: ${computedStyle.opacity}`);
Logger.debug('visualization', `Parent (canvas-wrapper) display: ${parentStyle.display}, visibility: ${parentStyle.visibility}`);

const container = document.getElementById('visualization-container');
if (container) {
  const containerStyle = window.getComputedStyle(container);
  Logger.debug('visualization', `Container display: ${containerStyle.display}, visibility: ${containerStyle.visibility}`);
}
```

**Objetivo:** Verificar si hay estilos CSS que estén ocultando el canvas o sus contenedores.

---

## Instrucciones de Testing

### Paso 1: Abrir Consola del Navegador

1. Abrir la aplicación en el navegador
2. Presionar **F12** para abrir DevTools
3. Ir a la pestaña **Console**

### Paso 2: Probar Terapia Híbrida

1. Completar el proceso de matching hasta obtener frecuencia
2. Seleccionar terapia: **Notched + Ambiental** o **CR + Ambiental**
3. Seleccionar un sonido ambiental (ej: Lluvia)
4. Click en **"Iniciar Sesión"**

### Paso 3: Revisar Logs

**Buscar estos logs en la consola:**

#### ✅ Logs Esperados (CORRECTO)

```
[treatment-ui] ▶️ Iniciando sesión - Terapia: hybrid-notched-ambient, SubTipo: rain, Duración: 30min
[treatment-ui] Visualization container encontrado: SI
[treatment-ui] Mostrando visualization container...
[treatment-ui] Inicializando visualization engine...
[visualization] ✅ Motor de visualización inicializado
[visualization] Canvas resized to 800x400
[treatment-ui] Visualization inicializado: EXITO
[treatment-ui] Iniciando visualization tipo: fractal
[visualization] 🎨 Iniciando visualización: fractal
[visualization] Canvas dimensiones: 800x400
[visualization] Canvas display: block, visibility: visible, opacity: 1
[visualization] Parent (canvas-wrapper) display: block, visibility: visible
[visualization] Container display: block, visibility: visible
[visualization] ✅ Visualización fractal iniciada correctamente
[treatment-ui] ✅ Visualization debería estar visible ahora
[treatment-ui] ✅ Sesión iniciada completamente
```

#### ❌ Logs de Error Posibles

**Escenario 1: Container NO encontrado**
```
[treatment-ui] Visualization container encontrado: NO
[treatment-ui] ❌ NO SE ENCONTRÓ visualization-container en el DOM
```
➡️ **Problema:** El HTML no se está renderizando correctamente para híbridos

**Escenario 2: Inicialización FALLA**
```
[treatment-ui] Visualization inicializado: FALLO
[visualization] ❌ Canvas con id 'visualization-canvas' no encontrado
```
➡️ **Problema:** El canvas no existe en el DOM cuando intentamos inicializarlo

**Escenario 3: Dimensiones Inválidas**
```
[visualization] ⚠️ Canvas tiene dimensiones inválidas: 0x0
[visualization] Dimensiones forzadas a: 800x400
```
➡️ **Problema:** El canvas se crea pero no tiene tamaño (posible problema de CSS)

**Escenario 4: Estilos CSS Ocultan Canvas**
```
[visualization] Canvas display: none, visibility: hidden, opacity: 0
[visualization] Parent (canvas-wrapper) display: none, visibility: visible
[visualization] Container display: none, visibility: visible
```
➡️ **Problema:** CSS está ocultando los elementos

---

## Análisis del Código

### Estructura HTML (CORRECTA para todos los tipos)

El container de visualización se renderiza en `showSessionScreen()` **IGUAL para todas las terapias**:

```html
<div class="visualization-container" id="visualization-container" style="display: none;">
  <div class="visualization-header">
    <h4 class="font-bold">🎨 Visualización Relajante</h4>
    <div class="visualization-controls">
      <select id="visualization-type">...</select>
      <button id="fullscreen-btn">...</button>
    </div>
  </div>
  <div class="canvas-wrapper">
    <canvas id="visualization-canvas"></canvas>
  </div>
</div>
```

**Ubicación:** `treatment-ui.js` líneas 487-506

**Estado inicial:** `display: none;` (se muestra en `startSession()`)

### Flujo de Inicialización (CORRECTO)

1. **showSessionScreen()** → Renderiza HTML con `visualization-container` (oculto)
2. **togglePlay()** → Llama a `startSession()`
3. **startSession()** →
   - Busca `visualization-container` en DOM
   - Cambia su `display` a `block`
   - Inicializa `visualization.initialize('visualization-canvas')`
   - Inicia animación con `visualization.start(tipo)`

**Código relevante:** `treatment-ui.js` líneas 1006-1048

### Hipótesis Principales

#### Hipótesis 1: Problema de Timing (DOM)
- El canvas se crea DESPUÉS de intentar inicializarlo
- Posible si hay renderizado asíncrono diferente para híbridos

#### Hipótesis 2: CSS Específico Oculta Elementos
- Alguna regla CSS específica para híbridos oculta el canvas
- Overflow hidden, z-index, position, etc.

#### Hipótesis 3: Elemento Se Destruye Después
- Se inicializa correctamente pero algo lo elimina/oculta después
- Posible en el código de audio híbrido

#### Hipótesis 4: Canvas Sin Dimensiones
- El canvas se crea pero el padre no tiene altura/ancho
- Canvas con 0x0 no muestra nada (aunque el fix en línea 68-74 debería corregir esto)

---

## Próximos Pasos Según Resultados

### Si logs muestran "Container encontrado: NO"
➡️ **Acción:** Verificar que `showSessionScreen()` se llama correctamente para híbridos

### Si logs muestran "Inicializado: FALLO"
➡️ **Acción:** Agregar delay antes de inicializar (dar tiempo al DOM)

### Si logs muestran estilos CSS incorrectos
➡️ **Acción:** Revisar CSS global y reglas específicas de `.canvas-wrapper`

### Si todo parece correcto pero no se ve
➡️ **Acción:** Verificar en DevTools > Elements si canvas tiene:
- Ancho/alto real (no 0x0)
- No está detrás de otro elemento (z-index)
- Parent tiene dimensiones válidas

---

## Archivos Modificados

### js/treatment/treatment-ui.js
- **Líneas 1006-1048:** Método `startSession()` con logging detallado
- Agrega verificación de existencia de container
- Agrega verificación de éxito de inicialización
- Logs de cada paso del proceso

### js/treatment/visualization-engine.js
- **Líneas 131-169:** Método `start()` con logging de estilos CSS
- Verifica estilos computados del canvas
- Verifica estilos del parent (canvas-wrapper)
- Verifica estilos del container

---

## Testing Comparativo

### Probar Ambos Escenarios

**Escenario A: Terapia NO híbrida (control)**
1. Seleccionar "Notched Sound Therapy" (sin ambiental)
2. Iniciar sesión
3. Copiar todos los logs de la consola
4. Verificar que la visualización SÍ se ve

**Escenario B: Terapia híbrida (problema)**
1. Seleccionar "Notched + Ambiental"
2. Seleccionar sonido ambiental
3. Iniciar sesión
4. Copiar todos los logs de la consola
5. Verificar que la visualización NO se ve

**Comparar logs:** Buscar diferencias entre A y B

---

## Estado Actual

⚠️ **Debugging en progreso**

**Completado:**
- ✅ Análisis exhaustivo del código (no hay ocultamiento intencional)
- ✅ Logging detallado agregado
- ✅ Verificación de estilos CSS agregada

**Pendiente:**
- ⏳ Testing en navegador con logs habilitados
- ⏳ Identificación de problema específico según logs
- ⏳ Implementación de fix específico

---

## Logs Completos Esperados

### Secuencia Completa para Híbrido Exitoso

```
[treatment-ui] ▶️ Iniciando sesión - Terapia: hybrid-notched-ambient, SubTipo: rain, Duración: 30min
[treatment-ui] Visualization container encontrado: SI
[treatment-ui] Mostrando visualization container...
[treatment-ui] Inicializando visualization engine...
[visualization] ✅ Motor de visualización inicializado
[visualization] Canvas resized to 800x400
[treatment-ui] Visualization inicializado: EXITO
[treatment-ui] Visualization ya estaba inicializado (canvas existe)  [si ya estaba init]
[treatment-ui] Iniciando visualization tipo: fractal
[visualization] 🎨 Iniciando visualización: fractal
[visualization] Canvas dimensiones: 800x400
[visualization] Canvas display: block, visibility: visible, opacity: 1
[visualization] Parent (canvas-wrapper) display: block, visibility: visible
[visualization] Container display: block, visibility: visible
[visualization] ✅ Visualización fractal iniciada correctamente
[treatment-ui] ✅ Visualization debería estar visible ahora
[treatment-ui] Llamando engine.startTherapy()...
[treatment] 🎵 Iniciando terapia: hybrid-notched-ambient (duración: 30 min)
[treatment] 🔊 Iniciando terapia Notched + Ambiental...
[treatment] Frecuencia de tinnitus: XXXX Hz
[treatment] Sonido ambiental: rain
[treatment] ✅ Terapia Notched + Ambiental iniciada
[treatment-ui] ✅ Sesión iniciada completamente
```

---

**Última actualización:** 2025-12-16
**Archivos modificados:** 2
**Estado:** Esperando testing para identificar problema específico
