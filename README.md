# 🎧 Tinnitus Care - Sistema de Diagnóstico y Tratamiento

Sistema web progresivo para evaluación audiométrica, identificación de frecuencia de tinnitus y tratamientos basados en evidencia científica.

## ✨ Características

### ✅ Implementado (Sprint 1)
- Interfaz moderna y responsive
- AudioContext Manager
- LocalStorage Manager  
- Sistema de diseño CSS completo
- Sin dependencias externas (0 KB)

### 🚧 En Desarrollo
- Módulo 1: Audiometría Fina (Sprint 2-3)
- Módulo 2: Búsqueda de Tinnitus (Sprint 4)
- Módulo 3: Tratamiento (Sprint 5-6)

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

### 1. Audiometría Fina
- Algoritmo adaptativo (Staircase Method)
- 13 frecuencias: 125 Hz - 12 kHz
- Visualización de audiograma
- **Estado**: 🚧 Sprint 2-3

### 2. Búsqueda de Tinnitus
- Búsqueda multi-etapa
- Slider 20-20,000 Hz
- Validación A/B
- **Estado**: 🚧 Sprint 4

### 3. Tratamiento
- Terapia Notched Sound
- Neuromodulación CR
- Enmascaramiento sonoro
- Sonidos ambientales
- **Estado**: 🚧 Sprint 5-6

## 🛠️ Tecnologías

| Tecnología | Uso |
|------------|-----|
| HTML5 | Estructura semántica |
| CSS3 | Grid, Flexbox, Variables |
| JavaScript ES6+ | Lógica de aplicación |
| Web Audio API | Generación de audio |
| LocalStorage | Persistencia |

**Tamaño**: ~75 KB | **Dependencias**: 0 📦

## 📊 Progreso

```
Sprint 1 ████████████████████ 100% ✅
Sprint 2 ░░░░░░░░░░░░░░░░░░░░  0%  🚧
Sprint 3-6 ░░░░░░░░░░░░░░░░░░  0%  📅

Total:   ███░░░░░░░░░░░░░░░░░ 16.7%
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
│   └── audio-context.js
└── 📚 Docs/
    ├── README.md
    ├── VISION_GENERAL_SISTEMA_COMPLETO.md
    └── PLAN_MVP_BASICO.md
```

## 📚 Documentación

- **[README.md](README.md)** - Este archivo
- **[VISION_GENERAL_SISTEMA_COMPLETO.md](VISION_GENERAL_SISTEMA_COMPLETO.md)** - Visión estratégica completa
- **[PLAN_MVP_BASICO.md](PLAN_MVP_BASICO.md)** - Plan detallado del MVP

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
