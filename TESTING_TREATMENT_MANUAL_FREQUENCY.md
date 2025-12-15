# 🧪 Testing: Treatment - Entrada Manual de Frecuencia

**Fecha:** 2025-12-15
**Feature:** Ingresar y editar frecuencia del tinnitus manualmente para probar tratamientos

---

## ✅ Qué se Implementó

### 1. **Input Manual de Frecuencia (Sin Matching)**
**Archivo:** `js/treatment/treatment-ui.js`

**Funcionalidad:**
- ✅ Pantalla de error ahora incluye input de frecuencia manual
- ✅ Campo numérico (20-20000 Hz)
- ✅ Valor default: 4000 Hz
- ✅ Validación de rango
- ✅ Botón "Usar Esta Frecuencia y Probar Tratamientos"
- ✅ Guarda frecuencia manual en Storage con flag `manual: true`

### 2. **Editor de Frecuencia (Desde Welcome Screen)**
**Archivo:** `js/treatment/treatment-ui.js`

**Funcionalidad:**
- ✅ Botón "✏️ Editar" en welcome screen
- ✅ Pantalla dedicada de edición
- ✅ Input numérico grande y visible
- ✅ 4 botones preset (3000, 4000, 6000, 8000 Hz)
- ✅ Información de rangos comunes
- ✅ Botones Guardar/Cancelar
- ✅ Re-inicializa engine con nueva frecuencia

### 3. **Indicador de Frecuencia Manual**
**Archivo:** `js/treatment/treatment-ui.js`

**Funcionalidad:**
- ✅ Detecta flag `manual: true` en matchData
- ✅ Muestra "⚠️ Frecuencia ingresada manualmente" en lugar de confianza
- ✅ Permite editar en cualquier momento

---

## 🧪 Cómo Probar

### Test 1: Entrada Manual desde Cero (Sin Matching)

**Objetivo:** Verificar que se puede usar treatment sin matching

1. **Limpiar datos:**
```javascript
Storage.clearAll();
```

2. **Abrir treatment:**
```
http://localhost:8000/treatment.html
```

3. **Verificar pantalla de entrada manual:**
- ✅ Título: "⚠️ Sin datos de frecuencia"
- ✅ Descripción explica las 2 opciones
- ✅ Card "🎯 Ingresar Frecuencia Manualmente" visible
- ✅ Input con valor default 4000 Hz
- ✅ Mensaje "Rango común de tinnitus: 3000-8000 Hz"
- ✅ Botón verde "✓ Usar Esta Frecuencia y Probar Tratamientos"
- ✅ Link alternativo "Ir a Búsqueda de Frecuencia →"

4. **Cambiar frecuencia:**
- Escribir 6000 en el input
- ✅ Input acepta el valor

5. **Usar frecuencia manual:**
- Clic en "✓ Usar Esta Frecuencia y Probar Tratamientos"
- ✅ Transición a welcome screen
- ✅ Muestra "Tu Frecuencia de Tinnitus: 6000 Hz"
- ✅ Muestra "⚠️ Frecuencia ingresada manualmente"
- ✅ 4 tarjetas de terapia visibles

6. **Probar terapia:**
- Seleccionar "Notched Sound Therapy"
- Iniciar sesión
- ✅ Ruido blanco con notch en 6000 Hz (tono agudo)

7. **Verificar en consola:**
```javascript
const match = Storage.getTinnitusMatch();
console.log('Frequency:', match.frequency);  // 6000
console.log('Manual:', match.manual);         // true
console.log('Confidence:', match.confidence); // 0
```

**Verificar logs:**
```
[TREATMENT-UI] 🎯 Usuario ingresó frecuencia manual: 6000 Hz
[TREATMENT] 🎵 Inicializando motor de tratamiento
[TREATMENT] Frecuencia de tinnitus: 6000 Hz
```

---

### Test 2: Validación de Rango

**Objetivo:** Verificar que valida frecuencias inválidas

1. **En pantalla de entrada manual:**

2. **Probar valores inválidos:**

**Valor muy bajo:**
- Escribir 10
- Clic "Usar Esta Frecuencia"
- ✅ Alert: "Por favor ingresa una frecuencia válida entre 20 y 20000 Hz"

**Valor muy alto:**
- Escribir 25000
- Clic "Usar Esta Frecuencia"
- ✅ Alert: "Por favor ingresa una frecuencia válida entre 20 y 20000 Hz"

**Valor vacío:**
- Borrar el input (dejar vacío)
- Clic "Usar Esta Frecuencia"
- ✅ Alert: "Por favor ingresa una frecuencia válida entre 20 y 20000 Hz"

**Valor válido en límites:**
- Escribir 20 (mínimo)
- Clic "Usar Esta Frecuencia"
- ✅ Acepta y continúa

- Volver, escribir 20000 (máximo)
- Clic "Usar Esta Frecuencia"
- ✅ Acepta y continúa

---

### Test 3: Editar Frecuencia (Desde Welcome Screen)

**Objetivo:** Verificar que se puede editar frecuencia desde welcome screen

1. **Con frecuencia ya configurada:**
- Asegurar que hay frecuencia (manual o de matching)
- Abrir http://localhost:8000/treatment.html

2. **Verificar botón de editar:**
- ✅ Botón "✏️ Editar" visible en esquina superior derecha del card de frecuencia

3. **Clic en "✏️ Editar":**
- ✅ Transición a pantalla de edición
- ✅ Título: "✏️ Editar Frecuencia del Tinnitus"
- ✅ Descripción explica que se puede probar diferentes frecuencias
- ✅ Input grande con frecuencia actual
- ✅ 4 botones preset (3000, 4000, 6000, 8000 Hz)
- ✅ Información de rangos comunes
- ✅ Botones "← Cancelar" y "✓ Guardar Frecuencia"

4. **Probar presets:**
- Clic en botón "3000 Hz"
- ✅ Input cambia a 3000
- Clic en botón "8000 Hz"
- ✅ Input cambia a 8000

5. **Escribir frecuencia personalizada:**
- Escribir 5500 en el input
- Clic "✓ Guardar Frecuencia"
- ✅ Transición de vuelta a welcome screen
- ✅ Muestra "5500 Hz"
- ✅ Muestra "⚠️ Frecuencia ingresada manualmente"

6. **Cancelar edición:**
- Clic "✏️ Editar" nuevamente
- Cambiar a 7000
- Clic "← Cancelar"
- ✅ Vuelve a welcome screen
- ✅ Frecuencia NO cambió (sigue en 5500 Hz)

7. **Verificar en consola:**
```javascript
const match = Storage.getTinnitusMatch();
console.log('Frequency:', match.frequency);  // 5500
console.log('Manual:', match.manual);         // true
```

**Verificar logs:**
```
[TREATMENT-UI] ✏️ Usuario editó frecuencia a: 5500 Hz
[TREATMENT] 🎵 Inicializando motor de tratamiento
[TREATMENT] Frecuencia de tinnitus: 5500 Hz
[TREATMENT-UI] ✅ Frecuencia actualizada a 5500 Hz
```

---

### Test 4: Editar Frecuencia con Datos de Matching

**Objetivo:** Verificar que funciona con datos reales de matching

1. **Crear datos de matching (simulando módulo 2):**
```javascript
Storage.saveTinnitusMatch({
  frequency: 4500,
  confidence: 85,
  volume: 0.3,
  waveType: 'sine',
  validationScore: '3/3',
  ear: 'left',
  mml: { level: 10 }
});
```

2. **Abrir treatment:**
```
http://localhost:8000/treatment.html
```

3. **Verificar welcome screen:**
- ✅ Muestra "4500 Hz"
- ✅ Muestra "Confianza: 85%" (NO manual)
- ✅ Botón "✏️ Editar" visible

4. **Editar a frecuencia manual:**
- Clic "✏️ Editar"
- Cambiar a 6000 Hz
- Guardar
- ✅ Ahora muestra "6000 Hz"
- ✅ Cambia a "⚠️ Frecuencia ingresada manualmente"
- ✅ Flag `manual: true` en storage

5. **Verificar que se mantienen otros datos:**
```javascript
const match = Storage.getTinnitusMatch();
console.log('Frequency:', match.frequency);      // 6000 (editado)
console.log('Manual:', match.manual);            // true (añadido)
console.log('Confidence:', match.confidence);    // 85 (mantenido)
console.log('Validation:', match.validationScore); // 3/3 (mantenido)
console.log('MML:', match.mml);                  // { level: 10 } (mantenido)
```

6. **Probar terapia con nueva frecuencia:**
- Seleccionar "CR Neuromodulation"
- Iniciar sesión
- ✅ 4 tonos calculados alrededor de 6000 Hz:
  - f1: 4620 Hz (6000 * 0.77)
  - f2: 5400 Hz (6000 * 0.90)
  - f3: 6660 Hz (6000 * 1.11)
  - f4: 7740 Hz (6000 * 1.29)

---

### Test 5: Probar Diferentes Frecuencias

**Objetivo:** Verificar que tratamientos se adaptan a la frecuencia

**Frecuencia Baja (3000 Hz):**
1. Editar frecuencia a 3000 Hz
2. Seleccionar "Notched Sound Therapy"
3. Iniciar
4. ✅ Notch audible en frecuencia media-baja

**Frecuencia Media (6000 Hz):**
1. Editar frecuencia a 6000 Hz
2. Seleccionar "Sound Masking" → "Banda Estrecha"
3. Iniciar
4. ✅ Narrow-band noise centrado en 6000 Hz (tono agudo)

**Frecuencia Alta (10000 Hz):**
1. Editar frecuencia a 10000 Hz
2. Seleccionar "Notched Sound Therapy"
3. Iniciar
4. ✅ Notch en frecuencia muy alta (casi imperceptible para algunos)

---

### Test 6: Flujo Completo sin Matching

**Objetivo:** Verificar flujo end-to-end sin módulo 2

1. **Limpiar todo:**
```javascript
Storage.clearAll();
```

2. **Ir directo a treatment:**
```
http://localhost:8000/treatment.html
```

3. **Ingresar frecuencia manual:**
- Escribir 5000 Hz
- Clic "Usar Esta Frecuencia"

4. **Seleccionar terapia:**
- Clic en "CR Neuromodulation"

5. **Configurar sesión:**
- Duración: 5 minutos
- Volumen: 50%

6. **Iniciar terapia:**
- Clic "Iniciar Sesión"
- ✅ 4 tonos reproducen (CR)
- ✅ Progreso aumenta
- Esperar 2 minutos

7. **Detener sesión:**
- Clic "Detener Sesión"
- ✅ Audio para
- ✅ Sesión guardada

8. **Verificar historial:**
```javascript
const sessions = Storage.getTreatmentSessions();
console.log('Sessions:', sessions.length);  // 1
console.log('Frequency:', sessions[0].frequency);  // 5000
console.log('Therapy:', sessions[0].therapy);  // 'cr'
console.log('Duration:', sessions[0].duration);  // ~120 segundos
```

---

### Test 7: Botones Preset

**Objetivo:** Verificar que presets funcionan correctamente

1. **Clic "✏️ Editar"**

2. **Probar todos los presets:**

**3000 Hz:**
- Clic botón "3000 Hz"
- ✅ Input muestra 3000
- Guardar
- Probar Notched → ✅ Notch en 3000 Hz

**4000 Hz:**
- Editar, clic "4000 Hz"
- ✅ Input muestra 4000
- Guardar
- Probar CR → ✅ Tonos alrededor de 4000 Hz

**6000 Hz:**
- Editar, clic "6000 Hz"
- ✅ Input muestra 6000
- Guardar
- Probar Masking narrowband → ✅ Ruido centrado en 6000 Hz

**8000 Hz:**
- Editar, clic "8000 Hz"
- ✅ Input muestra 8000
- Guardar
- Probar Notched → ✅ Notch en 8000 Hz (muy agudo)

---

## 📊 Checklist de Validación

### Pantalla de Entrada Manual (Sin Matching):
- [ ] Card de entrada manual visible
- [ ] Input con valor default 4000 Hz
- [ ] Rango 20-20000 Hz
- [ ] Botón "Usar Esta Frecuencia" funciona
- [ ] Link "Ir a Búsqueda de Frecuencia" presente
- [ ] Validación de rango (alerts en valores inválidos)
- [ ] Guarda con flag `manual: true`
- [ ] Transición a welcome screen

### Pantalla de Edición:
- [ ] Botón "✏️ Editar" visible en welcome screen
- [ ] Input muestra frecuencia actual
- [ ] 4 botones preset funcionan (3000, 4000, 6000, 8000)
- [ ] Input acepta valores personalizados
- [ ] Botón "Guardar" actualiza frecuencia
- [ ] Botón "Cancelar" no guarda cambios
- [ ] Re-inicializa engine con nueva frecuencia
- [ ] Logging correcto

### Indicador de Frecuencia Manual:
- [ ] Muestra "⚠️ Frecuencia ingresada manualmente" si manual
- [ ] Muestra "Confianza: X%" si de matching
- [ ] Flag `manual: true` en storage si editada
- [ ] Mantiene otros datos de matching al editar

### Integración con Terapias:
- [ ] Notched usa frecuencia editada para notch
- [ ] CR calcula 4 tonos según frecuencia editada
- [ ] Masking narrowband centra en frecuencia editada
- [ ] Sesiones guardan frecuencia correcta

### Logging:
- [ ] Log al ingresar frecuencia manual
- [ ] Log al editar frecuencia
- [ ] Log al guardar nueva frecuencia
- [ ] Sin errores en consola

---

## 🐛 Problemas Potenciales y Soluciones

### Problema 1: Input no acepta ciertos valores
**Síntoma:** No se puede escribir frecuencia
**Causa:** Atributos min/max/step del input
**Solución:** Verificar que step="10" permite valores intermedios

### Problema 2: Presets no actualizan input
**Síntoma:** Clic en preset no cambia input
**Causa:** ID incorrecto en `document.getElementById()`
**Solución:** Verificar que ID es "edit-frequency" (no "manual-frequency")

### Problema 3: Frecuencia no se refleja en terapia
**Síntoma:** Notch o tonos no en frecuencia esperada
**Causa:** Engine no re-inicializado
**Solución:** Verificar que se llama `await this.engine.initialize(frequency)`

### Problema 4: Flag manual sobrescribe datos de matching
**Síntoma:** Confianza y validation score se pierden
**Causa:** Se crea nuevo objeto en lugar de actualizar
**Solución:** Usa `const matchData = Storage.getTinnitusMatch() || {}`

---

## 📝 Comandos de Debug

### Ver datos de matching:
```javascript
const match = Storage.getTinnitusMatch();
console.log('Match Data:', match);
console.log('Frequency:', match.frequency);
console.log('Manual:', match.manual);
console.log('Confidence:', match.confidence);
```

### Simular entrada manual:
```javascript
Storage.saveTinnitusMatch({
  frequency: 5500,
  confidence: 0,
  volume: 0.3,
  waveType: 'sine',
  validationScore: 'N/A',
  ear: 'both',
  manual: true
});
```

### Ver frecuencia en engine:
```javascript
const engine = treatmentUI.engine;
console.log('Engine Frequency:', engine.tinnitusFrequency);
```

### Limpiar y empezar de nuevo:
```javascript
Storage.clearAll();
location.reload();
```

---

## 🎯 Criterios de Aceptación

**PASS si:**
1. ✅ Se puede ingresar frecuencia manual sin matching
2. ✅ Se puede editar frecuencia desde welcome screen
3. ✅ Validación funciona (20-20000 Hz)
4. ✅ Presets funcionan (3000, 4000, 6000, 8000)
5. ✅ Frecuencia se guarda con flag `manual: true`
6. ✅ Terapias usan frecuencia editada correctamente
7. ✅ Logging completo y sin errores
8. ✅ Botón Cancelar no guarda cambios

**FAIL si:**
1. ❌ No se puede ingresar frecuencia sin matching
2. ❌ Botón Editar no funciona
3. ❌ Validación no funciona o permite valores inválidos
4. ❌ Presets no actualizan input
5. ❌ Frecuencia no se refleja en terapias
6. ❌ Errores en consola
7. ❌ Datos de matching se pierden al editar

---

## ✅ Beneficios de Esta Feature

1. **Testing Rápido:** Probar tratamientos sin completar matching (20 min ahorrados)
2. **Flexibilidad:** Ajustar frecuencia para encontrar la más efectiva
3. **Experimentación:** Comparar efectos de diferentes frecuencias
4. **Accesibilidad:** Usuarios que conocen su frecuencia pueden empezar directo
5. **UX Mejorado:** No fuerza a usuarios a completar matching si ya conocen su frecuencia

---

*Testing Guide - Treatment Manual Frequency*
*Versión: 1.0*
*Creado: 2025-12-15*
