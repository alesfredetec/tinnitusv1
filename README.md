# 🎧 Tinnitus Care - Sistema de Diagnóstico y Tratamiento

Sistema web progresivo para evaluación audiométrica, identificación de frecuencia de tinnitus y tratamientos basados en evidencia científica.

## ✨ Características

### ✅ Implementado (Sprint 1)
- Interfaz moderna y responsive
- AudioContext Manager
- LocalStorage Manager  
- Sistema de diseño CSS completo
- Sin dependencias externas (0 KB)

### ✅ Módulos Completados
- **Módulo 1: Audiometría Adaptativa** (Sprint 2-3) ✅
- **Módulo 2: Búsqueda de Tinnitus** (Sprint 4) ✅
- **Módulo 3: Tratamiento** (Sprint 5-6) ✅

## 🎉 MVP Completo
**Estado: 100% FUNCIONAL Y LISTO PARA PRODUCCIÓN**

## 🚀 Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/tinnitus-care.git
cd tinnitus-care

# Abrir con servidor local
python -m http.server 8000
# O: npx serve

# Abrir: http://localhost:8000
```

## 💻 Uso

### Flujo Completo
1. **Audiometría** (15-20 min) → Evalúa umbrales auditivos
2. **Búsqueda** (5-10 min) → Identifica frecuencia de tinnitus  
3. **Tratamiento** (30 min/sesión) → Terapias sonoras

### Tests Rápidos
```javascript
// Abrir consola (F12)
AudioContextManager.init();
AudioContextManager.playTone(440, 1, 0.5);

Storage.saveUserProfile({ name: 'Test' });
console.log(Storage.getUserProfile());
```

## 📦 Módulos

### 1. Audiometría Adaptativa de 2 Etapas ✅
- **Etapa 1 - Audiometría Estándar:**
  - Algoritmo adaptativo (Staircase Method)
  - 13 frecuencias: 125 Hz - 12 kHz
  - Randomización de frecuencias y oídos
  - Catch trials para detectar falsos positivos

- **Etapa 2 - Micro-audiometría Automática:**
  - Detección inteligente de frecuencias problema
  - Escaneo fino con pasos de 100 Hz
  - Foco especial en rango 4000-7000 Hz (tinnitus)
  - Rango dinámico: ±500 Hz alrededor del problema

- **Análisis y Visualización:**
  - Audiograma interactivo en Canvas
  - Clasificación de pérdida auditiva
  - Identificación de frecuencias problema
  - Detección de asimetría entre oídos
  - Exportación de resultados

- **Duración**: 15-25 minutos
- **Estado**: ✅ Completado (Sprint 2-3)

### 2. Búsqueda de Tinnitus - Sistema Multi-Etapa ✅
- **Etapa 1 - Selección de Rango:**
  - Rangos sugeridos basados en audiometría
  - Priorización inteligente (4000-7000 Hz)
  - Integración con frecuencias problema

- **Etapa 2 - Búsqueda Gruesa:**
  - 5-7 frecuencias por rango
  - Sistema de calificación por estrellas (1-5)
  - Identificación de mejor coincidencia

- **Etapa 3 - Refinamiento con Slider:**
  - Slider continuo de frecuencias
  - Controles de ajuste rápido (±10, ±25, ±100 Hz)
  - Ajuste de volumen en tiempo real
  - Selección de tipo de onda (sine, square, sawtooth)

- **Etapa 4 - Ajuste Fino:**
  - Zoom en rango de ±100 Hz
  - Pasos finos (5-25 Hz)
  - Confirmación precisa

- **Etapa 5 - Validación A/B:**
  - 3 pruebas ciegas
  - Frecuencia objetivo vs. distractor
  - Cálculo de confianza automático

- **Duración**: 10-15 minutos
- **Estado**: ✅ Completado (Sprint 4)

### 3. Tratamiento ✅
- **Notched Sound Therapy:**
  - Ruido blanco con filtro notch en frecuencia de tinnitus
  - Q factor ajustable para notch preciso
  - Basado en estudios de Okamoto et al. (2010)

- **CR Neuromodulation:**
  - 4 tonos coordinados (protocolo Tass)
  - Patrón aleatorio con timing preciso
  - Basado en dispositivo Desyncra

- **Sound Masking:**
  - White Noise (poder igual)
  - Pink Noise (1/f spectrum)
  - Brown Noise (1/f² spectrum)
  - Narrowband (centrado en tinnitus)

- **Ambient Sounds:**
  - Rain (lluvia sintetizada)
  - Ocean (océano con olas)
  - Wind (viento)
  - Forest (bosque)

- **Control de Sesiones:**
  - Duración configurable (5-120 min)
  - Control de volumen
  - Progress tracking en tiempo real
  - Historial de sesiones
  - Auto-stop al completar

- **Duración**: Variable según terapia
- **Estado**: ✅ Completado (Sprint 5-6)

## 🛠️ Tecnologías

| Tecnología | Uso |
|------------|-----|
| HTML5 | Estructura semántica |
| CSS3 | Grid, Flexbox, Variables |
| JavaScript ES6+ | Lógica de aplicación |
| Web Audio API | Generación de audio |
| LocalStorage | Persistencia |

**Tamaño**: ~100 KB | **Dependencias**: 0 📦 | **Líneas**: ~4,000

## 📊 Progreso

```
Sprint 1   ████████████████████ 100% ✅  Fundación
Sprint 2   ████████████████████ 100% ✅  Audiometría - Motor
Sprint 3   ████████████████████ 100% ✅  Audiometría - UI
Sprint 4   ████████████████████ 100% ✅  Búsqueda Tinnitus
Sprint 5-6 ████████████████████ 100% ✅  Tratamiento

Total:     ████████████████████ 100% 🎉
```

## 📁 Estructura

```
tinnitus-care/
├── index.html                 # Landing page
├── audiometry.html            # Módulo 1
├── matching.html              # Módulo 2
├── treatment.html             # Módulo 3
├── css/                       # Estilos
│   ├── reset.css
│   ├── variables.css
│   └── global.css
├── js/                        # JavaScript
│   ├── utils.js
│   ├── storage.js
│   ├── audio-context.js
│   ├── audiometry/            # Módulo 1
│   │   ├── audiometry-engine.js
│   │   └── audiometry-ui.js
│   ├── matching/              # Módulo 2
│   │   ├── matching-engine.js
│   │   └── matching-ui.js
│   └── treatment/             # Módulo 3
│       ├── treatment-engine.js
│       └── treatment-ui.js
└── 📚 Docs/
    ├── README.md
    ├── VISION_GENERAL_SISTEMA_COMPLETO.md
    ├── PLAN_MVP_BASICO.md
    ├── REVISION_COMPLETA_MVP.md
    ├── SPRINT_4_COMPLETADO.md
    └── SPRINT_5-6_COMPLETADO.md
```

## 📚 Documentación

- **[README.md](README.md)** - Este archivo
- **[VISION_GENERAL_SISTEMA_COMPLETO.md](VISION_GENERAL_SISTEMA_COMPLETO.md)** - Visión estratégica completa
- **[PLAN_MVP_BASICO.md](PLAN_MVP_BASICO.md)** - Plan detallado del MVP
- **[REVISION_COMPLETA_MVP.md](REVISION_COMPLETA_MVP.md)** - Revisión completa del sistema
- **[SPRINT_4_COMPLETADO.md](SPRINT_4_COMPLETADO.md)** - Sprint 4: Módulo 2 completado
- **[SPRINT_5-6_COMPLETADO.md](SPRINT_5-6_COMPLETADO.md)** - Sprint 5-6: Módulo 3 completado

## ⚠️ Disclaimer Médico

**IMPORTANTE**: Esta herramienta **NO sustituye** consulta médica profesional.

### Consulta a un médico si experimentas:
- 🚨 Tinnitus súbito
- 🚨 Tinnitus pulsátil  
- 🚨 Pérdida auditiva
- 🚨 Mareos o vértigo
- 🚨 Dolor de oído

## 👥 Créditos

### Investigación Científica
- TENT-A2 Study (Conlon et al., 2019)
- Lenire Device (Neuromod Devices)
- Notched Sound Therapy
- CR Neuromodulation (Tass et al.)

### Referencias
- [Lenire®](https://www.lenire.com/)
- [SONIC Lab](https://med.umn.edu/ent/news/sonic-lab)
- [Nature Study 2025](https://www.nature.com/articles/s43856-025-00837-3)

## 📄 Licencia

MIT License

---

<div align="center">

**Hecho con ❤️ para la comunidad de tinnitus**

⭐ Si este proyecto te ayuda, considera darle una estrella

</div>
