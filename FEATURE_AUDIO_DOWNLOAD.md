# Feature: Descarga de Audio de Terapia

## Descripción General

Sistema completo para generar y descargar archivos de audio WAV con la configuración actual de terapia (sonido, frecuencia ajustada, volumen).

## Implementación

### 1. Backend - treatment-engine.js

#### Métodos Principales

**`generateOfflineAudio(durationMinutes, quality)`**
- Genera audio usando `OfflineAudioContext` (no requiere reproducción en tiempo real)
- **Parámetros:**
  - `durationMinutes` (5-30): Duración del audio en minutos
  - `quality` ('high'|'low'): Calidad del audio
    - 'high': 44100 Hz (alta calidad)
    - 'low': 22050 Hz (menor tamaño)
- **Retorna:** AudioBuffer con el audio generado

**`generateNotchedOffline(context, destination)`**
- Genera terapia Notched offline: ruido blanco con filtro notch en frecuencia de tinnitus

**`generateCROffline(context, destination)`**
- Genera CR Neuromodulation offline: 4 tonos coordinados con patrón de pulsos

**`generateMaskingOffline(context, destination, noiseType)`**
- Genera terapia de enmascaramiento offline
- Soporta 7 tipos de ruido: white, pink, brown/red, blue, violet, narrowband

**`generateAmbientOffline(context, destination, soundType)`**
- Genera sonidos ambientales offline
- Agrupa en categorías: water sounds, nature sounds, ambient noise

**`exportToWAV(audioBuffer)`**
- Convierte AudioBuffer a formato WAV
- Genera header WAV completo (PCM 16-bit, stereo)
- **Retorna:** Blob con archivo WAV

**`downloadAudio(blob, filename)`**
- Descarga el blob como archivo
- Nombre de archivo incluye: terapia, subtipo, frecuencia, duración, calidad, timestamp
- Formato: `tinnitus_masking_pink_5000Hz_10min_HQ_2025-12-15T17-30-00.wav`

**`generateAndDownload(format, durationMinutes, quality)`**
- Método principal que orquesta todo el proceso
- Valida duración (5-30 min)
- Genera audio offline → Exporta a WAV → Descarga archivo

### 2. Frontend - treatment-ui.js

#### Variables de Estado
```javascript
this.downloadDuration = 5; // minutes (default)
this.downloadQuality = 'high'; // 'high' or 'low' (default)
```

#### Métodos de UI

**`setDownloadDuration(minutes)`**
- Establece duración de descarga
- Actualiza estados visuales de botones
- Actualiza información de tamaño estimado

**`setDownloadQuality(quality)`**
- Establece calidad de descarga
- Actualiza estados visuales de botones
- Actualiza información de tamaño estimado

**`updateDownloadInfo()`**
- Calcula tamaño aproximado del archivo
- Fórmula: `sampleRate * channels * (bitsPerSample/8) * durationSeconds`
- Actualiza display: "X min • Calidad • Aprox. Y MB"

**`downloadAudio()`**
- Maneja el proceso de descarga desde UI
- Estados del botón:
  - Normal: "💾 Descargar Audio WAV"
  - Generando: "⏳ Generando audio..."
  - Éxito: "✅ Audio descargado" (3 segundos)
  - Error: "❌ Error al descargar" (3 segundos)

### 3. UI Components - treatment-ui.js (líneas 397-448)

```html
<div class="download-section mt-6">
  <h4>📥 Descargar Audio de Terapia</h4>

  <!-- Opciones de Duración: 5, 10, 15, 30 min -->
  <div class="download-duration-btn">...</div>

  <!-- Opciones de Calidad: Alta (44.1 kHz), Baja (22 kHz) -->
  <div class="download-quality-btn">...</div>

  <!-- Botón de Descarga -->
  <button id="download-button">💾 Descargar Audio WAV</button>

  <!-- Información de tamaño -->
  <span id="download-info">5 min • Alta calidad • Aprox. 50 MB</span>
</div>
```

### 4. CSS Styles - treatment.html (líneas 454-509)

**Estilos principales:**
- `.download-section`: Container con fondo terciario y bordes
- `.download-duration-btn.active`, `.download-quality-btn.active`: Estado activo con color azul y elevación
- `#download-button`: Botón principal con transiciones y hover effects
- `#download-button:disabled`: Estado deshabilitado durante generación

## Especificaciones Técnicas

### Tamaños de Archivo Aproximados

| Duración | Alta Calidad (44.1 kHz) | Baja Calidad (22 kHz) |
|----------|------------------------|----------------------|
| 5 min    | ~50 MB                 | ~25 MB               |
| 10 min   | ~100 MB                | ~50 MB               |
| 15 min   | ~150 MB                | ~75 MB               |
| 30 min   | ~300 MB                | ~150 MB              |

### Formato WAV

- **Canales:** 2 (Stereo)
- **Bits por muestra:** 16-bit PCM
- **Sample Rate:** 44100 Hz (high) / 22050 Hz (low)
- **Encoding:** Little-endian

### Performance

**Tiempo de generación aproximado:**
- 5 min: 2-5 segundos
- 10 min: 5-10 segundos
- 15 min: 8-15 segundos
- 30 min: 15-30 segundos

*Nota: Depende del hardware del usuario. OfflineAudioContext renderiza más rápido que tiempo real.*

## Flujo de Usuario

1. Usuario configura terapia (tipo, subtipo, frecuencia, volumen)
2. Usuario selecciona duración de descarga (5-30 min)
3. Usuario selecciona calidad (Alta/Baja)
4. Usuario ve tamaño estimado del archivo
5. Usuario hace clic en "Descargar Audio WAV"
6. Sistema genera audio offline (muestra "Generando audio...")
7. Sistema descarga automáticamente el archivo
8. Botón muestra "Audio descargado" brevemente
9. Archivo guardado con nombre descriptivo

## Ventajas

✅ **No requiere reproducción en tiempo real** - Usa OfflineAudioContext
✅ **Configuración personalizada** - Respeta todos los ajustes del usuario
✅ **Nombres descriptivos** - Archivos incluyen toda la información relevante
✅ **Feedback visual claro** - Estados del botón indican progreso
✅ **Cálculo de tamaño** - Usuario sabe el tamaño antes de descargar
✅ **Rápido** - Genera más rápido que tiempo real
✅ **Compatible** - WAV funciona en todos los reproductores

## Limitaciones Actuales

⚠️ **Solo WAV soportado** - MP3 requeriría librería encoder adicional
⚠️ **Sonidos ambientales sintetizados** - En producción, usar archivos reales
⚠️ **Sin preview** - No se puede escuchar antes de descargar
⚠️ **Duración máxima 30 min** - Limitado para evitar archivos muy grandes

## Mejoras Futuras

- [ ] Soporte para formato MP3 (usando lamejs o similar)
- [ ] Preview de audio antes de descargar
- [ ] Opción de duración personalizada (slider)
- [ ] Batch download (múltiples configuraciones)
- [ ] Audio files reales para sonidos ambientales
- [ ] Metadata ID3 tags en archivos
- [ ] Opción de loop seamless
- [ ] Compresión/normalización de audio

## Testing

**Casos de prueba:**
1. ✅ Generar audio de 5 minutos, calidad alta
2. ✅ Generar audio de 30 minutos, calidad baja
3. ✅ Cambiar configuraciones y verificar que se aplican
4. ✅ Verificar nombre de archivo incluye todos los datos
5. ✅ Verificar tamaño estimado vs real
6. ✅ Verificar que funciona con todas las terapias
7. ✅ Verificar que respeta ajuste fino de frecuencia
8. ✅ Verificar que respeta volumen configurado

## Archivos Modificados

- `js/treatment/treatment-engine.js` - Backend de generación (líneas 945-1403)
- `js/treatment/treatment-ui.js` - Frontend y UI (líneas 14-16, 397-448, 730-826)
- `treatment.html` - Estilos CSS (líneas 454-509)
- `FEATURE_AUDIO_DOWNLOAD.md` - Esta documentación

## Uso

```javascript
// Desde la consola del navegador (para testing)
await treatmentUI.engine.generateAndDownload('wav', 10, 'high');
// Genera y descarga 10 minutos de audio en alta calidad

// O usar la UI:
// 1. Seleccionar duración (5/10/15/30 min)
// 2. Seleccionar calidad (Alta/Baja)
// 3. Click en "Descargar Audio WAV"
```

## Logs

El sistema genera logs detallados:
- `🎬 Iniciando generación de audio para descarga`
- `🎙️ Generando audio offline: X minutos (calidad: Y)`
- `⏳ Renderizando audio... (esto puede tomar unos segundos)`
- `💾 Exportando a formato WAV`
- `📥 Descargando archivo: [filename]`
- `✅ Audio generado correctamente`

Usar `logger.summary()` en consola para ver todos los logs.
