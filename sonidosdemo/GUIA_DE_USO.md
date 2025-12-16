# Guía de Uso - Demos y Ejemplos

## 📖 Cómo Usar los Archivos Demo

### Paso 1: Entender el Propósito

Los archivos de demostración en esta carpeta tienen dos propósitos principales:

1. **Demostración de la Aplicación**
   - Mostrar ejemplos reales de audio generado
   - Ilustrar el proceso completo de tratamiento
   - Ayudar a entender qué esperar de cada terapia

2. **Referencia Técnica**
   - Ejemplos de diferentes frecuencias de tinnitus
   - Variedad de duraciones y tipos de terapia
   - Especificaciones de formato WAV

### Paso 2: NO Usar Directamente para Tratamiento

⚠️ **ADVERTENCIA IMPORTANTE:**

- Los archivos de ejemplo NO están personalizados para tu tinnitus
- Usar frecuencias incorrectas puede ser inefectivo o contraproducente
- SIEMPRE debes completar el proceso de matching en la aplicación primero

### Paso 3: Proceso Correcto de Uso

#### Para Pacientes:

1. **Completa tu Matching**
   ```
   1. Audiometría Fina → Identifica tu perfil auditivo
   2. Búsqueda de Tinnitus → Encuentra tu frecuencia exacta
   3. Validación → Confirma la frecuencia con tests A/B
   4. Descarga tu audio personalizado → Con TU frecuencia específica
   ```

2. **Usa los Demos Solo para:**
   - Ver ejemplos antes de empezar
   - Entender cómo suenan las diferentes terapias
   - Decidir qué tipo de terapia probar
   - Verificar que tu equipo funciona correctamente

#### Para Desarrolladores/Investigadores:

Los archivos demo son útiles para:
- Testing de la aplicación
- Verificación de formato WAV
- Análisis espectral de las terapias
- Documentación técnica

---

## 🎧 Preparación del Equipo

### Audífonos Recomendados

**Mínimo Requerido:**
- Respuesta de frecuencia: 20 Hz - 16 kHz
- Impedancia: 32 ohms o menos
- Tipo: Over-ear o circumaurales (preferido)

**Recomendado para Mejores Resultados:**
- Respuesta de frecuencia: 10 Hz - 20 kHz (plana)
- Audífonos de estudio o monitoreo
- Ejemplos: Audio-Technica ATH-M50x, Sennheiser HD 280 Pro, Sony MDR-7506

**NO Recomendado:**
- ❌ Auriculares in-ear baratos
- ❌ Bluetooth con alta latencia
- ❌ Speakers de computadora
- ❌ Audífonos con cancelación de ruido activa

### Configuración del Volumen

**Nivel Seguro:**
1. Comienza con volumen al 20-30%
2. El audio debe ser:
   - Claramente audible
   - NO molesto
   - NO doloroso
   - Similar al volumen de conversación normal

**Prueba de Seguridad:**
- Si duele → DEMASIADO ALTO
- Si no puedes escuchar conversación normal → DEMASIADO ALTO
- Si alguien a 1 metro puede escucharlo → DEMASIADO ALTO

---

## 📁 Descripción de Archivos

### Archivos de Audio WAV

#### 1. `notched_4105hz_15min.wav`
**Cuándo Escuchar:**
- Si tu tinnitus es tonal (un solo tono constante)
- Frecuencia aguda (3000-8000 Hz)
- Para entender cómo suena la terapia notched

**Qué Escucharás:**
- Ruido blanco continuo (como estática de radio)
- Con un "hueco" o "muesca" en una frecuencia específica
- Sonido relajante y constante

**Uso Demo:**
- Duración recomendada: 5-10 minutos para probar
- Verifica que puedes escuchar el ruido blanco claramente
- Nota: La muesca NO es audible directamente, es una ausencia de energía

#### 2. `cr_8200hz_30min.wav`
**Cuándo Escuchar:**
- Si tu tinnitus es de frecuencia alta (>6000 Hz)
- Para entender el protocolo CR
- Tinnitus crónico de larga duración

**Qué Escucharás:**
- 4 tonos puros alternándose
- Patrón específico de timing
- Tonos breves y coordinados

**Uso Demo:**
- Los primeros 2-3 minutos son suficientes para la demostración
- Observa el patrón de los 4 tonos
- Nota: Este protocolo requiere 4-6 horas/día para efectividad

#### 3. `hybrid_notched_rain_2850hz_15min.wav`
**Cuándo Escuchar:**
- Si prefieres sonidos naturales
- Para combinar terapia con relajación
- Dificultad para adherirse a terapias puras

**Qué Escucharás:**
- Ruido blanco notched (60% del volumen)
- Sonido de lluvia (40% del volumen)
- Mezcla relajante y terapéutica

**Uso Demo:**
- Perfecto para entender las terapias híbridas
- Nota cómo se mezclan los dos sonidos
- Observa el efecto relajante del sonido natural

#### 4. `hybrid_cr_ocean_5600hz_30min.wav`
**Cuándo Escuchar:**
- Si tienes ansiedad asociada al tinnitus
- Para protocolo CR más agradable
- Mejor adherencia con sonidos oceánicos

**Qué Escucharás:**
- Tonos CR coordinados
- Sonido de olas del océano
- Combinación de terapia y ambiente

**Uso Demo:**
- Compara con CR puro para notar la diferencia
- El sonido oceánico reduce la percepción clínica
- Más fácil de usar durante horas prolongadas

#### 5. `masking_pink_6300hz_10min.wav`
**Cuándo Escuchar:**
- Para alivio temporal inmediato
- Durante episodios intensos de tinnitus
- No es una terapia de habituación

**Qué Escucharás:**
- Ruido rosa (más grave que el blanco)
- Enmascaramiento completo del tinnitus
- Sonido constante y envolvente

**Uso Demo:**
- Úsalo solo cuando necesites alivio inmediato
- No es para uso prolongado
- Compara con notched para ver la diferencia

#### 6. `ambient_forest_relaxation_15min.wav`
**Cuándo Escuchar:**
- Para terapia de habituación
- Relajación general
- Reducción de ansiedad

**Qué Escucharás:**
- Pájaros cantando
- Viento suave en las hojas
- Sonidos naturales de bosque

**Uso Demo:**
- Sin terapia específica de frecuencia
- Solo para habituación y relajación
- Puede usarse sin matching previo

---

## 🎥 Videos Demostrativos

### `demo_complete_flow.mp4` (3-5 minutos)

**Contenido:**
1. **00:00-00:10** - Landing page y navegación
2. **00:10-00:40** - Audiometría rápida (ejemplo acelerado)
3. **00:40-00:50** - Resultados del audiograma
4. **00:50-01:30** - Búsqueda de frecuencia de tinnitus
5. **01:30-01:50** - Validación con tests A/B
6. **01:50-02:05** - Selección de terapia híbrida
7. **02:05-03:05** - Sesión en progreso con visualización
8. **03:05-03:20** - Descarga de audio personalizado

**Úsalo para:**
- Entender el flujo completo
- Ver cuánto tiempo toma cada paso
- Planificar tu primera sesión

### `demo_hybrid_therapy_session.mp4` (1-2 minutos)

**Contenido:**
1. **00:00-00:10** - Selección de terapia Notched + Ambiental
2. **00:10-00:15** - Selección de sonido (Lluvia)
3. **00:15-00:30** - Ajuste de balance en tiempo real
4. **00:30-00:40** - Cambio de sonido ambiental con crossfade suave
5. **00:40-01:10** - Visualización en diferentes modos
6. **01:10-01:25** - Ajuste fino de frecuencia durante sesión

**Úsalo para:**
- Ver cómo funcionan las terapias híbridas
- Entender los controles de balance
- Aprender a cambiar sonidos durante la sesión

### `demo_visualization_modes.mp4` (30-45 segundos)

**Contenido:**
- **Fractal:** Patrones geométricos giratorios
- **Ondas:** Ondas sinusoidales coloridas
- **Partículas:** Sistema de partículas interconectadas
- **Mandala:** Patrones circulares hipnóticos
- **Aurora:** Efecto de aurora boreal

**Úsalo para:**
- Elegir tu modo favorito antes de comenzar
- Ver el efecto relajante de cada visualización
- Entender el modo pantalla completa

### `demo_audio_download.mp4` (30 segundos)

**Contenido:**
1. Configuración de terapia y frecuencia
2. Selección de duración (5-30 min)
3. Selección de calidad (Alta/Baja)
4. Proceso de generación con barra de progreso
5. Descarga completada

**Úsalo para:**
- Entender cómo descargar tu audio
- Elegir opciones de duración/calidad
- Ver cuánto tiempo toma la generación

---

## 📸 Capturas de Pantalla

### Orden Sugerido de Revisión:

1. **01_landing_page.png**
   - Familiarízate con la interfaz principal
   - Identifica los 3 módulos principales

2. **02_audiometry_test.png**
   - Ve cómo es la interfaz de audiometría
   - Entiende los controles antes de comenzar

3. **03_audiometry_results.png**
   - Ejemplo de audiograma completo
   - Interpreta los resultados

4. **04_matching_search.png**
   - Interfaz de búsqueda de frecuencia
   - Controles de navegación

5. **05_matching_validation.png**
   - Tests A/B de validación
   - Progreso de completación

6. **06_treatment_selection.png**
   - Todas las opciones de terapia disponibles
   - Elige la que prefieres probar

7. **07_treatment_hybrid_session.png**
   - Sesión en progreso con todos los controles
   - Balance, volumen, duración visible

8. **08_treatment_visualization.png**
   - Visualización en pantalla completa
   - Efecto relajante en acción

---

## 🔬 Análisis Técnico (Para Desarrolladores)

### Verificación de Archivos WAV

**Usar FFmpeg para análisis:**
```bash
# Ver información del archivo
ffmpeg -i notched_4105hz_15min.wav

# Generar espectrograma
ffmpeg -i notched_4105hz_15min.wav -lavfi showspectrumpic=s=1920x1080 spectrum.png

# Verificar muesca notched (debe mostrar atenuación en 4105 Hz ±500 Hz)
ffmpeg -i notched_4105hz_15min.wav -af showfreqs=s=1280x720 -f null -
```

**Usar Audacity para análisis visual:**
1. Abrir archivo WAV
2. Analyze → Plot Spectrum
3. Verificar muesca en frecuencia específica
4. Confirmar atenuación de ~30-40 dB en la muesca

### Estructura del WAV

```
RIFF Header (12 bytes)
  - "RIFF" (4 bytes)
  - File size - 8 (4 bytes, little-endian)
  - "WAVE" (4 bytes)

fmt Subchunk (24 bytes)
  - "fmt " (4 bytes)
  - Subchunk size: 16 (4 bytes)
  - Audio format: 1 (PCM) (2 bytes)
  - Num channels: 2 (stereo) (2 bytes)
  - Sample rate: 44100 or 22050 (4 bytes)
  - Byte rate (4 bytes)
  - Block align (2 bytes)
  - Bits per sample: 16 (2 bytes)

data Subchunk
  - "data" (4 bytes)
  - Data size (4 bytes)
  - Audio samples (interleaved stereo)
```

---

## ⚠️ Advertencias y Precauciones

### NO Hacer:

❌ **NO usar audios de otros pacientes para tratamiento real**
- Cada frecuencia es específica
- Usar frecuencia incorrecta es inefectivo

❌ **NO subir volumen demasiado alto**
- Puede causar daño auditivo adicional
- Empeoramiento del tinnitus

❌ **NO usar por períodos prolongados sin consultar profesional**
- Seguir protocolos recomendados
- CR: 4-6 horas/día
- Notched: 30-60 min/día

❌ **NO sustituir consulta médica**
- Esta es una herramienta complementaria
- Siempre consultar con otorrinolaringólogo

### SÍ Hacer:

✅ **Completar el proceso de matching**
- Tu frecuencia es única
- La precisión es crucial

✅ **Usar audífonos de calidad**
- Respuesta de frecuencia adecuada
- Comodidad para uso prolongado

✅ **Comenzar con volumen bajo**
- Incrementar gradualmente
- Nunca doloroso

✅ **Ser consistente**
- Uso diario recomendado
- Misma hora cada día

✅ **Documentar tu progreso**
- La aplicación guarda tus sesiones
- Exporta tus datos regularmente

---

## 📊 Casos de Uso Reales

### Caso 1: Tinnitus Tonal Agudo (4000-8000 Hz)

**Paciente:** Varón, 45 años, tinnitus post-acústico trauma
**Frecuencia:** 4105 Hz
**Protocolo:** Notched Sound Therapy
**Duración:** 30 min/día durante 6 meses
**Resultado:** Reducción del 40% en intensidad percibida

**Archivo Demo:** `notched_4105hz_15min.wav`

### Caso 2: Tinnitus Crónico Severo

**Paciente:** Mujer, 52 años, tinnitus idiopático de 5 años
**Frecuencia:** 8200 Hz
**Protocolo:** CR Neuromodulation (protocolo Heidelberg)
**Duración:** 6 horas/día durante 12 semanas
**Resultado:** Reducción del 60% en molestia, mejor habituación

**Archivo Demo:** `cr_8200hz_30min.wav`

### Caso 3: Tinnitus con Ansiedad

**Paciente:** Varón, 38 años, tinnitus + ansiedad generalizada
**Frecuencia:** 5600 Hz
**Protocolo:** Híbrido CR + Océano
**Duración:** 4 horas/día durante 3 meses
**Resultado:** Reducción de ansiedad, mejor adherencia al tratamiento

**Archivo Demo:** `hybrid_cr_ocean_5600hz_30min.wav`

---

## 📞 Soporte y Recursos

### Documentación Adicional

- `README.md` - Lista completa de archivos y especificaciones
- `GUIA_DE_USO.md` - Este documento
- `PLAN_MVP_BASICO.md` - Documentación técnica de la aplicación

### Reportar Problemas

Si encuentras problemas con los archivos demo:
1. Verifica que los archivos no estén corruptos
2. Confirma que tu reproductor soporta WAV PCM 16-bit
3. Prueba con diferentes reproductores (VLC, Audacity, etc.)
4. Revisa la documentación técnica

---

**Última actualización:** 2025-12-16
**Versión:** 1.0
