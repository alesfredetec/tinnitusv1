# 🧪 Testing: Paso 2 - Plotly.js Audiograma Interactivo

**Fecha:** 2025-12-15
**Feature:** Audiograma interactivo con zoom, pan y valores visibles usando Plotly.js

---

## ✅ Qué se Implementó

### 1. **Integración de Plotly.js**
Archivo: `audiometry.html`

**Cambios:**
- ✅ CDN de Plotly.js agregado al HTML
- ✅ Div para audiograma en lugar de canvas
- ✅ Configuración de layout responsive

### 2. **Reescritura de drawAudiogram()**
Archivo: `js/audiometry/audiometry-ui.js`

**Features:**
- ✅ Gráfico interactivo con Plotly
- ✅ Escala logarítmica para frecuencias (125-8000 Hz)
- ✅ Escala lineal invertida para dB HL (-10 a 90)
- ✅ Trazos para oído izquierdo (azul) y derecho (rojo)
- ✅ Líneas punteadas para micro-audiometría
- ✅ Hover muestra frecuencia y umbral exactos

### 3. **Controles Interactivos**
**Zoom:**
- ✅ Box select con mouse (arrastrar rectángulo)
- ✅ Botón "Reset Zoom" para volver a vista completa
- ✅ Doble-click para reset zoom
- ✅ Zoom con rueda del mouse

**Pan:**
- ✅ Clic y arrastrar para mover gráfico
- ✅ Funciona después de hacer zoom

**Hover:**
- ✅ Muestra frecuencia, oído y umbral al pasar mouse
- ✅ Tooltip con formato personalizado

### 4. **Export de Imagen**
- ✅ Botón "💾 Descargar PNG" integrado en modebar
- ✅ Export a PNG de alta calidad
- ✅ Logo de Plotly removible (config)

---

## 🧪 Cómo Probar

### Test 1: Verificar Plotly Cargado

1. **Abrir:** http://localhost:8000/audiometry.html
2. **Abrir Consola** (F12)
3. **Verificar en consola:**
   ```javascript
   typeof Plotly
   ```
   Debe mostrar: `"object"`

**Verificar:**
- ✅ Plotly está cargado
- ✅ No hay errores de carga en consola

### Test 2: Audiograma Interactivo

1. **Ejecutar test con datos debug:**
   - Clic en "🧪 Modo Test/Debug"

2. **Verificar audiograma aparece:**
   - ✅ Gráfico con ejes correctos
   - ✅ Línea azul (oído izquierdo)
   - ✅ Línea roja (oído derecho)
   - ✅ Puntos en cada frecuencia
   - ✅ Grid visible

**Verificar escala:**
- ✅ Eje X: 125, 250, 500, 1000, 2000, 4000, 8000 Hz
- ✅ Eje Y: -10 a 90 dB HL (invertido, -10 arriba)

### Test 3: Zoom con Box Select

1. **En el audiograma, hacer zoom en zona de interés:**
   - Clic y mantener en una esquina
   - Arrastrar para dibujar rectángulo sobre zona (ej: 3000-6000 Hz)
   - Soltar mouse

2. **Verificar:**
   - ✅ Gráfico hace zoom a la zona seleccionada
   - ✅ Ejes se ajustan a nuevo rango
   - ✅ Puntos más grandes y visibles
   - ✅ Líneas más detalladas

3. **Hacer zoom adicional:**
   - Repetir para hacer zoom más profundo

**Verificar:**
- ✅ Zoom múltiple funciona
- ✅ Rangos de ejes se actualizan correctamente

### Test 4: Reset Zoom

**Método 1: Botón Reset**
1. Después de hacer zoom, buscar botón "↻ Reset" (arriba derecha del gráfico)
2. Clic en botón

**Método 2: Doble-click**
1. Después de hacer zoom
2. Doble-click en cualquier parte del gráfico

**Verificar ambos métodos:**
- ✅ Gráfico vuelve a vista completa original
- ✅ Ejes vuelven a rangos completos
- ✅ Todas las frecuencias visibles

### Test 5: Pan (Mover gráfico)

1. **Primero hacer zoom** en alguna zona
2. **Mover gráfico:**
   - Clic y mantener en área del gráfico
   - Arrastrar en cualquier dirección
   - Soltar

**Verificar:**
- ✅ Gráfico se mueve en dirección del arrastre
- ✅ Se pueden ver áreas fuera de zoom inicial
- ✅ Pan funciona horizontal y verticalmente

### Test 6: Hover con Valores

1. **Pasar mouse sobre puntos del audiograma**

**Verificar tooltip muestra:**
- ✅ Frecuencia exacta (ej: "4000 Hz")
- ✅ Oído (Izquierdo/Derecho)
- ✅ Umbral (ej: "30 dB HL")
- ✅ Tooltip sigue el mouse
- ✅ Tooltip desaparece al salir

2. **Probar con diferentes puntos**
   - ✅ Cada punto muestra sus valores correctos

### Test 7: Micro-audiometría Visible

Si hay datos de micro-audiometría (modo debug tiene):

1. **Buscar líneas punteadas** en el gráfico
2. **Verificar:**
   - ✅ Líneas punteadas en zona de problema (3500-4500 Hz)
   - ✅ Color celeste (#6699FF) para izquierdo
   - ✅ Color rosa (#FF9999) para derecho
   - ✅ Puntos más pequeños que estándar

3. **Hacer zoom en esa zona:**
   - ✅ Micro-audiometría se ve con más detalle
   - ✅ Muestra variaciones finas de umbral

### Test 8: Export PNG

1. **Buscar botón 📷 en barra de herramientas** (arriba derecha)
2. **Clic en botón camera icon**
3. **Verificar:**
   - ✅ Se descarga archivo PNG
   - ✅ Nombre: "audiogram.png" o similar
   - ✅ Imagen contiene el gráfico completo
   - ✅ Resolución es buena (legible)

4. **Hacer zoom primero, luego exportar:**
   - ✅ Exporta el zoom actual (no vista completa)

### Test 9: Responsive y Mobile

1. **Cambiar tamaño de ventana del browser**
2. **Verificar:**
   - ✅ Gráfico se adapta al ancho
   - ✅ Proporciones se mantienen
   - ✅ Botones siguen accesibles

3. **Modo móvil (F12 → Toggle device toolbar):**
   - ✅ Gráfico visible completo
   - ✅ Zoom con pinch funciona (si tiene touch)
   - ✅ Pan con un dedo

### Test 10: Controles de Zoom Legacy Removidos

1. **En pantalla de resultados, buscar controles de zoom antiguos:**
   ```
   🔍 Zoom +  |  🔍 Zoom −  |  ↻ Reset
   ```

2. **Verificar:**
   - ✅ Controles antiguos removidos o escondidos
   - ✅ Solo usa controles nativos de Plotly
   - ✅ No hay conflictos entre controles

---

## 📊 Comportamiento Esperado

### Modebar de Plotly (arriba derecha del gráfico)

Botones visibles:
- 📷 **Download plot as PNG** - Descargar gráfico
- 🔍 **Zoom** - Activar zoom box select
- ⤡ **Pan** - Activar pan/mover
- 📦 **Box Select** - Seleccionar área para zoom
- 🔲 **Reset axes** - Reset zoom
- 🏠 **Reset to default** - Vista inicial

### Interacciones del Mouse

| Acción | Resultado |
|--------|-----------|
| **Clic + Arrastrar** | Dibuja rectángulo para zoom |
| **Doble-click** | Reset zoom a vista completa |
| **Hover sobre punto** | Muestra tooltip con valores |
| **Rueda del mouse** | Zoom in/out (si habilitado) |
| **Clic + Arrastrar (después de zoom)** | Pan para mover gráfico |

---

## ✅ Checklist de Validación

### Funcionalidad Básica:
- [ ] Audiograma se renderiza correctamente
- [ ] Líneas de oído izquierdo (azul) y derecho (rojo)
- [ ] Puntos visibles en cada frecuencia
- [ ] Ejes con escala correcta
- [ ] Grid visible

### Interactividad:
- [ ] Box select zoom funciona
- [ ] Zoom múltiple (zoom sobre zoom)
- [ ] Reset zoom con botón
- [ ] Reset zoom con doble-click
- [ ] Pan funciona después de zoom

### Hover y Tooltips:
- [ ] Hover muestra frecuencia correcta
- [ ] Hover muestra oído correcto
- [ ] Hover muestra umbral correcto (dB HL)
- [ ] Tooltip se actualiza al mover mouse
- [ ] Tooltip desaparece al salir

### Micro-audiometría:
- [ ] Líneas punteadas para micro-audio
- [ ] Puntos más pequeños que estándar
- [ ] Colores diferenciados (celeste/rosa)
- [ ] Visible al hacer zoom

### Export y Download:
- [ ] Botón de descarga visible en modebar
- [ ] PNG se descarga correctamente
- [ ] Calidad de imagen es buena
- [ ] Exporta zoom actual (no siempre vista completa)

### Responsive:
- [ ] Se adapta a ventana pequeña
- [ ] Funciona en móvil/tablet
- [ ] Botones accesibles en todas las resoluciones

### Performance:
- [ ] Gráfico carga rápidamente (<2s)
- [ ] Zoom es suave, sin lag
- [ ] Pan es fluido
- [ ] No hay errores en consola

---

## 🐛 Problemas Conocidos y Soluciones

### Problema 1: "Plotly is not defined"
**Síntoma:** Error en consola al cargar resultados
**Causa:** CDN no cargado o bloqueado
**Solución:**
1. Verificar conexión a internet
2. Verificar en Network tab que plotly.js se descargó
3. Usar versión local de Plotly si CDN falla

### Problema 2: Gráfico no aparece (div vacío)
**Síntoma:** Espacio vacío donde debería estar el gráfico
**Causa:** Error en datos o en llamada a Plotly.newPlot()
**Solución:**
1. Abrir consola para ver error específico
2. Verificar que `results.standard` tiene datos
3. Verificar que div "audiogram-canvas" existe

### Problema 3: Zoom no funciona
**Síntoma:** Clic y arrastrar no hace nada
**Causa:** Config de Plotly no incluye dragmode
**Solución:** Verificar config tiene `dragmode: 'zoom'` en layout

### Problema 4: Hover no muestra valores
**Síntoma:** Tooltip vacío o no aparece
**Causa:** hovertemplate mal configurado
**Solución:** Verificar hovertemplate en cada trace

### Problema 5: Escala de dB invertida incorrecta
**Síntoma:** -10 dB está abajo en lugar de arriba
**Causa:** autorange no está en 'reversed'
**Solución:** Verificar `yaxis: { autorange: 'reversed' }` en layout

### Problema 6: Export PNG no descarga
**Síntoma:** Clic en botón camera no hace nada
**Causa:** Popup blocker o configuración de modebar
**Solución:**
1. Permitir descargas en browser
2. Verificar `modeBarButtonsToAdd` incluye 'toImage'

---

## 📝 Comandos de Debug

### Verificar Plotly cargado:
```javascript
typeof Plotly
// Debe ser "object"
```

### Ver datos del último plot:
```javascript
const plotDiv = document.getElementById('audiogram-canvas');
plotDiv.data  // Array de traces
plotDiv.layout  // Layout config
```

### Verificar dimensiones:
```javascript
const plotDiv = document.getElementById('audiogram-canvas');
console.log('Width:', plotDiv.offsetWidth, 'Height:', plotDiv.offsetHeight);
```

### Redibuja r gráfico manualmente:
```javascript
const results = Storage.getLatestAudiometryResults();
if (results && audiometryUI) {
  audiometryUI.drawAudiogram({
    standard: audiometryUI.engine.results,
    micro: audiometryUI.engine.microResults
  });
}
```

### Forzar resize:
```javascript
const plotDiv = document.getElementById('audiogram-canvas');
if (plotDiv) Plotly.Plots.resize(plotDiv);
```

---

## 🎯 Criterios de Aceptación

**PASS si:**
1. ✅ Audiograma se renderiza con Plotly.js
2. ✅ Box select zoom funciona correctamente
3. ✅ Pan funciona después de zoom
4. ✅ Hover muestra valores exactos
5. ✅ Reset zoom funciona (botón y doble-click)
6. ✅ Export PNG funciona
7. ✅ Micro-audiometría se visualiza diferenciado
8. ✅ Responsive en desktop y móvil
9. ✅ Sin errores en consola

**FAIL si:**
1. ❌ Plotly no carga o error en consola
2. ❌ Gráfico no aparece o está en blanco
3. ❌ Zoom no funciona o se comporta erróneamente
4. ❌ Hover no muestra valores o muestra incorrectos
5. ❌ Export no descarga PNG
6. ❌ Layout roto en mobile
7. ❌ Performance pobre (lag, lentitud)

---

## 📊 Comparación: Canvas vs Plotly

### Antes (Canvas 2D):
- ❌ Zoom manual, no interactivo
- ❌ No pan
- ❌ Hover custom complejo
- ❌ Export requiere código adicional
- ❌ Difícil de mantener
- ✅ Más control pixel-perfect

### Ahora (Plotly.js):
- ✅ Zoom interactivo box select nativo
- ✅ Pan nativo
- ✅ Hover con tooltips automáticos
- ✅ Export PNG integrado
- ✅ Fácil de mantener y extender
- ✅ Responsive out-of-the-box
- ✅ Más features (autoscale, etc.)

---

## ✅ Próximo Paso

Si este paso PASA:
→ **Continuar con Paso 3: Catch Trials Enhancement**

Si este paso FALLA:
→ **Debuggear y corregir antes de continuar**

---

## 📋 Mejoras Futuras (No para este paso)

Posibles extensiones:
- [ ] Annotations para marcar zonas problema
- [ ] Color zones (0-25 dB = verde, >25 = amarillo/rojo)
- [ ] Subplots para comparar oídos lado a lado
- [ ] Animation al actualizar gráfico
- [ ] 3D plot para tiempo/frecuencia/umbral
- [ ] Comparación con audiogramas anteriores (overlay)

---

*Testing Guide - Paso 2*
*Versión: 1.0*
*Creado: 2025-12-15*
