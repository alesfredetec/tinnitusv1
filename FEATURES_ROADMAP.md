# Tinnitus Care - Roadmap de Features

## 🎯 Implementadas (Sprint Actual)

### ✅ Módulo 1: Audiometría
- Prueba de umbrales auditivos por frecuencia
- Curva audiométrica visual
- Almacenamiento de resultados

### ✅ Módulo 2: Matching de Frecuencia
- Identificación de frecuencia de tinnitus
- Método de bisección para búsqueda eficiente
- Confirmación de match

### ✅ Módulo 3: Tratamientos Base
- **Notched Sound Therapy**: Ruido blanco con muesca
- **CR Neuromodulation**: 4 tonos coordinados (Protocolo Tass)
- **Sound Masking**: 7 tipos de ruido (white, pink, brown, blue, violet, narrowband, red)
- **Ambient Sounds**: 10 sonidos ambientales naturales

### ✅ Features Recientes
- **Ajuste fino de frecuencia**: ±5% en tiempo real
- **Descarga de audio**: WAV, 5-30 min, calidad alta/baja
- **Visualizaciones hipnóticas**: 5 tipos (fractal, ondas, partículas, mandala, aurora)
- **Modo fullscreen**: Para visualizaciones inmersivas
- **Cambio de sonido sin interrupción**: Durante sesión activa

---

## 🚀 En Desarrollo (Sprint Actual)

### 1. Terapias Combinadas (Alta Prioridad)

#### ✨ Notched + Ambiental
**Descripción:** Ruido blanco con muesca + sonidos naturales de fondo
**Beneficio:**
- Enmascaramiento placentero
- Terapia neuroplástica activa
- Mejor adherencia (más agradable que ruido solo)

**Implementación:**
- Mezclar dos audio streams simultáneos
- Control de volumen independiente para cada stream
- Balance configurable (60% notched / 40% ambiental default)
- Selector de sonido ambiental (rain, ocean, forest, etc.)

**Base científica:** Okamoto et al. (2010) + mejora de adherencia

#### ✨ CR + Música/Ambiental
**Descripción:** Tonos CR sobre música relajante o sonidos naturales
**Beneficio:**
- Protocolo terapéutico completo
- Experiencia más agradable que tonos puros
- Mejor adherencia a sesiones largas (4-6 horas)

**Implementación:**
- CR neuromodulation base
- Layer de música/ambiental de fondo
- Control de volumen independiente
- Opciones: música sintetizada relajante o sonidos naturales

**Base científica:** Protocolo Heidelberg, Tass et al. (2012)

---

## 📋 Backlog - Prioridad Alta

### 2. Perfiles de Sonido Guardados
**Descripción:** Guardar configuraciones favoritas del usuario
**Features:**
- Guardar perfil con nombre (ej: "Noche", "Trabajo", "Relajación")
- Incluye: terapia, subtipo, frecuencia ajustada, volumen, visualización
- Lista de perfiles guardados
- Carga rápida con 1 click
- Editar/eliminar perfiles

**Implementación:**
- LocalStorage para persistencia
- UI: botón "Guardar perfil actual"
- Dropdown de perfiles en pantalla principal

**Prioridad:** Alta - Mejora UX significativamente

### 3. Timers y Programación
**Descripción:** Control avanzado de sesiones
**Features:**
- Fade in suave (0-30 segundos)
- Fade out automático antes de finalizar
- Programar sesiones futuras (con notificación)
- Auto-pausa después de inactividad
- Temporizador de sueño (fade out gradual)

**Implementación:**
- Envelope de ganancia para fades
- Notifications API para recordatorios
- Sleep timer con fade de 5-15 minutos

**Prioridad:** Alta - Feature muy solicitada

### 4. Terapia Secuencial Adaptativa
**Descripción:** Cambio automático entre terapias en una sesión
**Features:**
- Secuencia configurable (ej: Notched 10min → CR 10min → Ambient 10min)
- Transiciones suaves entre terapias
- Templates pre-configurados
- Editor de secuencias personalizado

**Implementación:**
- Queue de terapias con duraciones
- Crossfade entre cambios (3-5 segundos)
- Progress bar muestra segmentos

**Base científica:** Evita habituación, múltiples mecanismos terapéuticos

**Prioridad:** Media-Alta

---

## 📊 Backlog - Features con IA/ML

### 5. Matching Automático Mejorado
**Descripción:** ML para predecir frecuencia exacta
**Features:**
- Análisis de patrón de respuestas del usuario
- Detección de dudas (clicks erráticos, reversiones)
- Sugerencia de frecuencia más probable
- Reducción de tiempo de matching

**Implementación:**
- Modelo simple de regresión
- Training con datos de sesiones
- Fallback a método bisección actual

**Prioridad:** Media

### 6. Recomendación Personalizada
**Descripción:** Sistema de recomendación de terapia óptima
**Input:**
- Frecuencia de tinnitus
- Perfil audiométrico
- Historial de sesiones completadas
- Feedback subjetivo (rating post-sesión)

**Output:**
- Terapia recomendada
- Duración sugerida
- Momento del día óptimo

**Implementación:**
- Reglas simples inicial (if/else)
- ML colaborativo después (similar users)

**Prioridad:** Media

### 7. Adaptación Dinámica en Tiempo Real
**Descripción:** Ajuste automático durante sesión
**Features:**
- Volumen adaptativo (curva de habituación)
- Micro-ajustes de frecuencia (buscar "sweet spot")
- Complejidad creciente (prevenir habituación)

**Implementación:**
- PID controller para volumen
- Random walk para frecuencia (±0.5%)
- Gradual increase de layers/complexity

**Prioridad:** Baja (requiere más investigación)

### 8. Análisis de Efectividad
**Descripción:** Dashboard de insights personalizados
**Métricas tracked:**
- Tiempo de uso por terapia
- Sesiones completadas vs abandonadas
- Rating subjetivo post-sesión
- Correlación temporal (hora, duración)
- Progreso a largo plazo

**Visualizaciones:**
- Gráfico de uso semanal/mensual
- Heatmap de efectividad
- Tendencias de mejora
- Recomendaciones basadas en datos

**Prioridad:** Media

---

## 🎨 Backlog - UX/UI

### 9. Ejercicios de Mindfulness Integrados
**Descripción:** Combinar terapia sonora con mindfulness
**Features:**
- Ejercicios de respiración guiados
- Meditaciones para tinnitus (audio guiado)
- Sincronización visual (respiración + visualización)
- Body scan con audio terapéutico

**Implementación:**
- Visualización sincronizada con tempo de respiración
- Audio prompts para meditación
- Timer de respiración configurable (4-7-8, box breathing)

**Prioridad:** Media

### 10. Modo Noche / Dark Mode Plus
**Descripción:** Optimización para uso nocturno
**Features:**
- Pantalla ultra-dim
- Filtro de luz azul
- Visualizaciones más suaves
- Sleep timer integrado
- Desactivación automática de notificaciones

**Prioridad:** Media-Alta

### 11. Modo Biblioteca de Sonidos
**Descripción:** Explorar y pre-escuchar sonidos
**Features:**
- Preview de todos los tipos de sonido
- Favoritos
- Tags (relaxing, energizing, focus)
- Búsqueda

**Prioridad:** Baja

---

## 🔬 Backlog - Features Avanzadas

### 12. Combinación Narrowband + Banda Ancha
**Descripción:** Target específico + enmascaramiento general
**Features:**
- Narrowband centrado en frecuencia tinnitus
- Ruido rosa de fondo
- Balance configurable

**Prioridad:** Media

### 13. Biofeedback (Requiere Hardware)
**Descripción:** Ajuste basado en métricas fisiológicas
**Features:**
- Integración con smartwatch (heart rate)
- Detección de nivel de estrés
- Ajuste automático de audio según estado
- Gamificación de relajación

**Prioridad:** Baja (requiere hardware)

### 14. Export/Import de Perfiles
**Descripción:** Compartir configuraciones
**Features:**
- Export a JSON
- Import desde archivo
- Compartir via URL/QR
- Biblioteca comunitaria de perfiles

**Prioridad:** Baja

### 15. Modo PWA / Offline
**Descripción:** Progressive Web App
**Features:**
- Instalable como app
- Funciona offline
- Service worker para caching
- Notificaciones push

**Prioridad:** Media

---

## 🎵 Backlog - Mejoras de Audio

### 16. Audio Files Reales para Ambientales
**Descripción:** Reemplazar síntesis con grabaciones reales
**Beneficio:** Mejor calidad, más natural
**Implementación:**
- Audio files en assets/sounds/
- Lazy loading
- Compression para web

**Prioridad:** Media

### 17. Generación de Música Procedural
**Descripción:** Música relajante generada algorítmicamente
**Features:**
- Acordes ambient evolutivos
- Melodías aleatorias en escala pentatónica
- Sin repetición (infinito)

**Implementación:**
- Web Audio API synthesis
- Markov chains para progresión

**Prioridad:** Baja

### 18. Binaurales (Requiere Investigación)
**Descripción:** Tonos binaurales para relajación
**Features:**
- Frecuencias binaurales (alpha, theta, delta)
- Combinable con terapias
- Warning sobre evidencia científica limitada

**Prioridad:** Baja (evidencia mixta)

---

## 📱 Backlog - Multiplataforma

### 19. App Móvil Nativa
**Descripción:** iOS/Android app
**Beneficios:**
- Mejor performance
- Background audio
- Integración con sistema
- App store presence

**Tecnología:** React Native / Flutter

**Prioridad:** Futura

### 20. Integración con Asistentes de Voz
**Descripción:** Control por voz
**Features:**
- "Hey Google, iniciar sesión de tinnitus"
- "Alexa, toca sonido de lluvia para tinnitus"

**Prioridad:** Futura

---

## 📈 Métricas de Éxito

Para cada feature, mediremos:
- **Adopción:** % usuarios que usan la feature
- **Retención:** Uso recurrente
- **Satisfacción:** Rating/feedback
- **Adherencia:** Aumento en sesiones completadas
- **Efectividad:** Mejora reportada en síntomas

---

## 🔄 Proceso de Desarrollo

1. **Research:** Revisar literatura científica
2. **Design:** Mockups y flujos de usuario
3. **MVP:** Implementación mínima viable
4. **Test:** User testing con grupo pequeño
5. **Iterate:** Mejoras basadas en feedback
6. **Launch:** Release a todos los usuarios
7. **Monitor:** Analytics y feedback continuo

---

## 📚 Referencias Científicas

- **Okamoto et al. (2010):** Notched music training
- **Tass et al. (2012):** Coordinated Reset Neuromodulation
- **Henry et al. (2008):** Sound therapy effectiveness
- **Hobson et al. (2012):** Sound therapy guidelines
- **Tyler et al. (2007):** Tinnitus activities treatment

---

*Última actualización: 2025-12-15*
*Version: MVP + Sprint 1*
