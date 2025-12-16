# Troubleshooting: Balance Estéreo L-R

## Error Reportado

```
Uncaught TypeError: this.engine.setStereoBalance is not a function
```

## Causa

El navegador está usando una versión cacheada (antigua) de `treatment-engine.js` que no tiene el método `setStereoBalance`.

## Solución

### Paso 1: Hard Refresh (Limpiar Caché)

**Chrome/Edge:**
- Windows: `Ctrl + Shift + R` o `Ctrl + F5`
- Mac: `Cmd + Shift + R`

**Firefox:**
- Windows: `Ctrl + Shift + R` o `Ctrl + F5`
- Mac: `Cmd + Shift + R`

**Safari:**
- Mac: `Cmd + Option + R`

### Paso 2: Verificar Carga de Archivos

1. Abrir DevTools (F12)
2. Ir a pestaña **Network**
3. Recargar página con `Ctrl + Shift + R`
4. Verificar que `treatment-engine.js` se carga (debe aparecer en la lista)
5. Click en el archivo
6. Ver tamaño - debe ser ~70-80 KB (con los cambios nuevos)

### Paso 3: Verificar Método en Consola

En la consola del navegador, ejecutar:

```javascript
// Verificar que el engine existe
console.log(treatmentUI.engine);

// Verificar que el método existe
console.log(typeof treatmentUI.engine.setStereoBalance);
// Debe mostrar: "function"
```

Si muestra `"undefined"`, entonces el archivo no se ha cargado correctamente.

---

## Testing del Balance L-R

Una vez que el método se carga correctamente:

### Test 1: Verificar Soporte del Navegador

**Abrir consola y ejecutar:**
```javascript
const ctx = new (window.AudioContext || window.webkitAudioContext)();
console.log('StereoPannerNode soportado:', typeof ctx.createStereoPanner === 'function');
```

**Resultado esperado:**
```
StereoPannerNode soportado: true
```

Si es `false`, tu navegador no soporta StereoPannerNode. Actualizar a última versión de Chrome/Firefox/Edge.

### Test 2: Logs Durante Inicialización

Cuando inicies una sesión, deberías ver en consola:

```
[treatment] ✅ StereoPannerNode creado exitosamente
[treatment]    Balance inicial: 0 (0%)
[treatment]    Pan value: 0
[treatment]    Conectado a: MasterGain
[treatment] Nodos conectados: Noise → Notch → Gain → StereoPanner → Master
```

Si ves:
```
[treatment] ❌ StereoPannerNode NO está soportado en este navegador
```
Tu navegador no soporta la característica.

### Test 3: Ajustar Balance y Ver Logs

1. Iniciar cualquier terapia
2. Mover slider de balance a la izquierda (-80)
3. Ver logs en consola:

```
[treatment-ui] 🎧 Balance estéreo ajustado: -80 (Izquierda)
[treatment] 🎧 Balance estéreo: 0% → -80% (Izquierda)
[treatment]    Pan actual: 0.00 → Pan objetivo: -0.80
[treatment]    ✓ Pan aplicado: -0.80
```

4. Verificar que el audio se escucha **solo en oído izquierdo**

### Test 4: Verificar con Audífonos

**Importante:** El balance solo funciona con **audífonos estéreo** o **auriculares**.

NO funciona correctamente con:
- ❌ Speakers de laptop (mono o estéreo mezclado)
- ❌ Speakers externos en modo mono
- ❌ Bluetooth con alta latencia
- ❌ Conexión de audio incorrecta

**Verifica tu conexión:**
1. Conecta audífonos
2. Prueba con un video de YouTube de "Test de Audio Estéreo L-R"
3. Confirma que escuchas L solo en izquierda, R solo en derecha
4. Si no funciona, el problema es tu conexión de audio, no el código

---

## Diagnóstico Avanzado

### Test Manual del StereoPannerNode

Ejecuta este código en la consola del navegador:

```javascript
// Test simple de StereoPanner
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Crear oscilador de prueba
const oscillator = audioContext.createOscillator();
oscillator.frequency.value = 440; // La nota (440 Hz)

// Crear stereo panner
const panner = audioContext.createStereoPanner();
panner.pan.value = -1; // -1 = totalmente a la izquierda

// Conectar: Oscillator → StereoPanner → Destination
oscillator.connect(panner);
panner.connect(audioContext.destination);

// Reproducir
oscillator.start();

// Detener después de 2 segundos
setTimeout(() => oscillator.stop(), 2000);

console.log('Deberías escuchar un tono de 440 Hz SOLO en el oído IZQUIERDO');
```

**Cambiar balance a derecha:**
```javascript
panner.pan.value = 1; // 1 = totalmente a la derecha
```

**Si esto funciona:** El problema está en el código de integración.
**Si esto NO funciona:** El problema es tu hardware/navegador/SO.

---

## Problemas Comunes

### 1. "Se escucha en ambos oídos con balance extremo"

**Posibles causas:**
- **Audio mono**: El audio source es mono, no estéreo
- **Sistema en modo mono**: Windows/Mac configurado en modo mono
- **Crossfeed activo**: Algunos DACs/amplificadores mezclan canales
- **Auriculares con crossfeed**: Algunos auriculares high-end mezclan L-R intencionalmente

**Solución:**
1. Verificar configuración de audio del sistema:
   - Windows: Configuración → Sistema → Sonido → Propiedades del dispositivo
   - Mac: Preferencias → Sonido → Salida
2. Desactivar cualquier "Mezcla Mono" o "Mono Audio"
3. Probar con auriculares diferentes

### 2. "Balance funciona pero muy sutil"

**Posibles causas:**
- **Fuente mono**: Si la fuente de audio es mono, el panning no funciona
- **Valores incorrectos**: Pan values entre -0.2 y 0.2 son sutiles

**Solución:**
- El código genera ruido MONO (1 canal), que se distribuye a estéreo
- El StereoPannerNode debería funcionar con mono input
- Verificar que pan values sean -1.0 o +1.0 para test extremos

### 3. "Error: StereoPannerNode not supported"

**Causa:** Navegador antiguo

**Solución:**
- Actualizar Chrome a versión 42+
- Actualizar Firefox a versión 37+
- Actualizar Edge a versión 79+ (Chromium-based)
- Safari 14.1+

**Alternativa (no implementada):**
Usar `PannerNode` con posicionamiento 3D:
```javascript
const panner = audioContext.createPanner();
panner.panningModel = 'equalpower';
panner.positionX.value = balance; // -1 to 1
panner.positionY.value = 0;
panner.positionZ.value = 1 - Math.abs(balance);
```

### 4. "Método setStereoBalance no existe"

**Causa:** Archivo cacheado

**Solución:**
1. Hard refresh: `Ctrl + Shift + R`
2. Limpiar caché completamente:
   - Chrome: Settings → Privacy → Clear browsing data → Cached images and files
   - Firefox: Settings → Privacy → Clear Data → Cached Web Content
3. Forzar recarga de script:
   ```html
   <!-- Agregar version query -->
   <script src="js/treatment/treatment-engine.js?v=2"></script>
   ```

---

## Verificación de Stereo vs Mono

### ¿El audio es estéreo o mono?

En nuestro código, el ruido se genera como **mono** (1 canal):

```javascript
// MONO (1 canal)
const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
```

Sin embargo, **StereoPannerNode funciona con input mono**:
- Input mono → StereoPanner → Output estéreo
- El panner duplica el mono signal y lo distribuye según pan value

### Test: Generar Ruido Estéreo

Si el problema persiste, podemos cambiar a generación de ruido **estéreo** (2 canales):

```javascript
// STEREO (2 canales)
const noiseBuffer = context.createBuffer(2, bufferSize, context.sampleRate);
const outputL = noiseBuffer.getChannelData(0); // Left channel
const outputR = noiseBuffer.getChannelData(1); // Right channel

// Generar ruido para ambos canales
for (let i = 0; i < bufferSize; i++) {
  outputL[i] = Math.random() * 2 - 1;
  outputR[i] = Math.random() * 2 - 1;
}
```

Pero esto **no debería ser necesario** - StereoPanner funciona con mono input.

---

## Logs Esperados vs Logs de Error

### ✅ Logs Correctos

```
[treatment] ✅ StereoPannerNode creado exitosamente
[treatment]    Balance inicial: 0 (0%)
[treatment]    Pan value: 0
[treatment-ui] 🎧 Balance estéreo ajustado: -80 (Izquierda)
[treatment] 🎧 Balance estéreo: 0% → -80% (Izquierda)
[treatment]    Pan actual: 0.00 → Pan objetivo: -0.80
[treatment]    ✓ Pan aplicado: -0.80
```

### ❌ Logs de Error

```
[treatment] ❌ StereoPannerNode NO está soportado en este navegador
[treatment] Nodos conectados: Noise → Notch → Gain → Master (sin stereo panner)
```
→ **Problema:** Navegador no soporta StereoPannerNode

```
[treatment] ⚠️ StereoPannerNode no existe - balance no se puede aplicar aún
```
→ **Problema:** Se ajustó balance antes de iniciar sesión (normal, se aplicará al iniciar)

```
Uncaught TypeError: this.engine.setStereoBalance is not a function
```
→ **Problema:** Archivo cacheado, hacer hard refresh

---

## Siguiente Paso

1. **Hard refresh:** `Ctrl + Shift + R`
2. **Abrir consola:** F12
3. **Iniciar sesión** de cualquier terapia
4. **Buscar logs** que digan "StereoPannerNode"
5. **Ajustar balance** a -100 o +100
6. **Ver logs** de aplicación
7. **Reportar:**
   - ¿Qué logs aparecen?
   - ¿Se escucha en un solo oído o ambos?
   - ¿Qué navegador y versión?
   - ¿Qué tipo de audífonos?

---

**Última actualización:** 2025-12-16
**Versión:** 1.6.1
