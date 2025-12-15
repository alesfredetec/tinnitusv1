
Al pulsar “Reproducir C7”, Chrome genera el tono C7 (~2093 Hz) usando la Web Audio API.

Si quieres, en el siguiente paso te puedo mostrar cómo conectar esto con un <select> como el de tu código para elegir varias notas (C7, D7, etc.).

y como genera ruido blanco o triangulo o cuadrados?
⁣͏͏⁣͏͏͏͏⁣͏͏͏⁣⁣⁣⁣⁣͏͏⁣⁣͏⁣͏⁣͏͏⁣͏͏͏⁣⁣͏͏⁣⁣⁣⁣͏⁣͏͏⁣͏⁣⁣͏⁣͏⁣͏͏͏͏͏⁣⁣͏͏⁣͏͏͏⁣͏͏⁣⁣͏⁣͏⁣⁣͏͏⁣⁣⁣⁣⁣⁣͏͏⁣⁣⁣͏⁣⁣͏͏⁣⁣͏⁣⁣⁣͏͏⁣⁣͏͏⁣⁣͏͏͏⁣⁣⁣⁣⁣͏͏⁣⁣⁣⁣⁢gpt-5.1
Con la misma Web Audio API, cambiando el tipo de oscilador o usando un búfer. No necesita librerías externas.

1. Onda seno / cuadrada / triángulo / sierra
Para tonos “puros” (sine, square, triangle, sawtooth) basta con cambiar osc.type:

js
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const osc = audioCtx.createOscillator();
const gain = audioCtx.createGain();

osc.frequency.value = 440;    // frecuencia en Hz
osc.type = 'sine';            // 'sine' | 'square' | 'triangle' | 'sawtooth'
gain.gain.value = 0.2;

osc.connect(gain);
gain.connect(audioCtx.destination);
osc.start();
osc.type = 'square' → onda cuadrada
osc.type = 'triangle' → onda triangular
osc.type = 'sawtooth' → onda de diente de sierra
Eso es, casi seguro, lo que hace toneGenerator.js cuando eliges “Sine / Square / Triangle / Sawtooth”.

2. Ruido blanco
Ruido blanco no se puede generar con OscillatorNode directamente; se usa un AudioBuffer lleno de valores aleatorios, y se reproduce en bucle.

Ejemplo básico de ruido blanco:

js
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// duración del buffer en segundos
const duration = 2;
const sampleRate = audioCtx.sampleRate;
const bufferSize = duration * sampleRate;

// crear buffer mono (1 canal)
const buffer = audioCtx.createBuffer(1, bufferSize, sampleRate);
const data = buffer.getChannelData(1 - 1); // canal 0

// llenarlo con valores aleatorios entre -1 y 1
for (let i = 0; i < bufferSize; i++) {
  data[i] = Math.random() * 2 - 1;
}

// crear un BufferSource para reproducirlo
const whiteNoise = audioCtx.createBufferSource();
whiteNoise.buffer = buffer;
whiteNoise.loop = true;

const gain = audioCtx.createGain();
gain.gain.value = 0.1; // bajar volumen, el ruido es fuerte

whiteNoise.connect(gain);
gain.connect(audioCtx.destination);

// comenzar
whiteNoise.start();
Para parar:

js
whiteNoise.stop();
whiteNoise.disconnect();
3. “Filtered” / ruido filtrado
Si en la página hay un modo “Filtered” o tipos de ruido (por ejemplo ruido rosa, ruido band‑pass, etc.), se consigue añadiendo un filtro:

js
const filter = audioCtx.createBiquadFilter();
filter.type = 'bandpass';     // o 'lowpass', 'highpass', etc.
filter.frequency.value = 4000; // frecuencia central del filtro, por ejemplo 4 kHz
filter.Q.value = 1;           // ancho de banda

whiteNoise.connect(filter);
filter.connect(gain);
gain.connect(audioCtx.destination);
También puede aplicar filtros a un oscilador normal para “suavizar” o colorear el tono.

4. Cómo lo usa probablemente toneGenerator.js
En tu página:

Para Sine, Square, Triangle, Sawtooth:
Cambia osc.type según la opción seleccionada.
Para Noise / Filtered:
crea un AudioBufferSourceNode con datos aleatorios (ruido blanco)
opcionalmente pasa el ruido por uno o más BiquadFilterNode para definir el color o banda
controla el volumen con GainNode.
Si quieres, puedo armarte un ejemplo pequeño con un <select>:

Sine → onda seno
Square → onda cuadrada
Triangle → onda triangular
White Noise → ruido blanco
todo en una sola página HTML.

para tinnitus que es recomendado
⁣͏͏⁣͏͏͏͏⁣͏͏͏⁣⁣⁣⁣⁣͏͏⁣⁣͏⁣͏⁣͏͏⁣͏͏͏⁣⁣͏͏⁣⁣⁣⁣͏⁣͏͏⁣͏⁣⁣͏⁣͏⁣͏͏͏͏͏⁣⁣͏͏⁣͏͏͏⁣͏͏⁣⁣͏⁣͏⁣⁣͏͏⁣⁣⁣⁣⁣⁣͏͏⁣⁣⁣͏⁣⁣͏͏⁣⁣͏⁣⁣⁣͏͏⁣⁣͏͏⁣⁣͏͏͏⁣⁣⁣⁣⁣͏͏⁣⁣⁣⁣⁢gpt-5.1
No hay un único tipo de sonido “mejor” para todos los casos de tinnitus; depende mucho de:

tipo de tinnitus (agudo / grave, puro / “chisporroteo” / tipo ventilador, unilateral/bilateral)
sensibilidad al sonido
si buscas enmascarar o tratar (habituación, notched audio, etc.)
Te resumo lo que suele recomendarse en la práctica clínica y en herramientas como la que estás viendo:

1. Para “enmascarar” o aliviar momentáneamente
Objetivo: que el tinnitus se perciba menos molesto mientras suena otro ruido.

Suelen usarse:

Ruido blanco suave

Cobertura amplia en frecuencias, “tapa” muchas clases de tinnitus.
Útil como fondo para dormir, leer, trabajar.
Volumen: siempre por debajo o igual que el tinnitus (no lo tapes del todo).
Ruido rosa / ruido marrón (si están disponibles)

Más energía en frecuencias graves, suenan “menos chillones” que el blanco.
A mucha gente le resultan más agradables / menos fatigosos.
Ruido “filtrado” cerca de la frecuencia del tinnitus

Ajustas el filtro para que el ruido tenga más energía alrededor de la frecuencia de tu tinnitus.
Da sensación de enmascaramiento más específico.
En un generador como el tuyo:
prueba primero Noise o Filtered Noise, con volumen bajo, y ve subiendo de a poco hasta que notes alivio sin que sea agresivo.

2. Para tratamientos específicos (no solo tapar)
Aquí entran cosas como:

a) Notched Audio (sonido “ahuecado”)
Se reproduce música o ruido al que se le ha quitado (notch) la banda de frecuencias donde tienes el tinnitus.
Se ha investigado como terapia para ciertos tipos de tinnitus tonal, sobre todo entre 1–10 kHz.
La idea: estimular alrededor de la frecuencia del tinnitus, pero no exactamente ahí, para favorecer cambios plásticos en el cerebro.
Para esto, primero se hace un tinnitus matching:

encuentras la frecuencia que más se parece a tu tinnitus (con tono sinusoidal)
luego se genera audio “notched” usando esa frecuencia como referencia.
b) CR Neuromodulation / neuromodulación acústica
Usa varios tonos alrededor de la frecuencia del tinnitus en un patrón específico.
Es más técnico; suele estar implementado en herramientas especializadas o estudios clínicos.
3. Tipo de onda para el tono que “imita” tu tinnitus
Para hacer matching (encontrar tu frecuencia de tinnitus):

Normalmente se usa onda seno (sine)
Es la más “pura”, sin armónicos; facilita identificar el tono dominante.
A veces, si tu tinnitus no es un pitido puro sino más “metálico” o áspero:

Puedes notar que se parece más a:
Square (más áspera, rica en armónicos impares)
Sawtooth (más “ácida”, llena de armónicos)
o incluso a Noise si es más un “ssss” que un “tiiiii”.
Pero para propósitos de terapia basada en frecuencia (notched, CR, etc.), lo habitual es:

usar sine para medir la frecuencia
luego trabajar con ruido/música procesados.
4. Recomendaciones prácticas para ti
Para uso diario (alivio, sueño, concentración)

Empieza con ruido blanco / rosa muy suave.
Ajusta el volumen para que:
No moleste
No tape al 100% el tinnitus (cuando lo tapas del todo, a veces rebota más fuerte al quitar el ruido).
Para encontrar tu frecuencia de tinnitus

Usa onda seno (sine) en el generador de tonos.
Ajusta la frecuencia lenta y cuidadosamente hasta que el tono se parezca a tu tinnitus.
Para experimentos tipo tratamiento (notched, etc.)

Una vez sepas tu frecuencia, puedes usar herramientas como:
generador de “notched noise” / “notched music”
o módulos de CR neuromodulation, si los tienes disponibles.
Siempre con sesiones limitadas (p.ej. 30–60 minutos al día) y volumen moderado.
Siempre: protege tu audición

Nunca uses volúmenes altos para “tapar” el tinnitus.
Si necesitas subir mucho, es una señal de que ese método no te está funcionando bien.
Evita auriculares muy fuertes o sesiones largas sin descanso.
Si me dices:

qué tipo de tinnitus tienes (agudo/grave, pitido/ruido, desde cuándo, si tienes hipoacusia)
y qué equipo usas (auriculares, parlantes, móvil)
puedo darte una configuración más concreta: tipo de sonido, volumen relativo y tiempos de uso recomendados para probar.

y agregar mezcla con lluvia o agua como seria
⁣͏͏⁣͏͏͏͏⁣͏͏͏⁣⁣⁣⁣⁣͏͏⁣⁣͏⁣͏⁣͏͏⁣͏͏͏⁣⁣͏͏⁣⁣⁣⁣͏⁣͏͏⁣͏⁣⁣͏⁣͏⁣͏͏͏͏͏⁣⁣͏͏⁣͏͏͏⁣͏͏⁣⁣͏⁣͏⁣⁣͏͏⁣⁣⁣⁣⁣⁣͏͏⁣⁣⁣͏⁣⁣͏͏⁣⁣͏⁣⁣⁣͏͏⁣⁣͏͏⁣⁣͏͏͏⁣⁣⁣⁣⁣͏͏⁣⁣⁣⁣⁢gpt-5.1
Se puede hacer de dos maneras:

Lo simple (recomendado): usar audios de lluvia / agua ya grabados y mezclarlos con tu ruido o tono.
Lo complejo: sintetizar lluvia por código (mucho más trabajo, no suele valer la pena).
Te explico la mezcla con Web Audio API (como el generador que estás usando).

1. Mezclar tono/ruido + lluvia con Web Audio API
La idea:

Nodo A: tu tono o ruido blanco (oscilador o buffer de ruido).
Nodo B: un audio de lluvia (archivo .mp3 / .ogg).
Cada uno con su GainNode para volumen independiente.
Ambos conectados al audioCtx.destination.
Ejemplo completo (HTML + JS)
Supongamos que tienes un archivo lluvia.mp3 en la misma carpeta:

html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Mezcla tinnitus + lluvia</title>
</head>
<body>
  <button id="play">Play mezcla</button>
  <button id="stop">Stop</button>

  <div>
    <label>Volumen tono/ruido:
      <input id="toneVol" type="range" min="0" max="1" step="0.01" value="0.2">
    </label>
  </div>
  <div>
    <label>Volumen lluvia:
      <input id="rainVol" type="range" min="0" max="1" step="0.01" value="0.3">
    </label>
  </div>

  <script>
    let audioCtx;
    let osc;              // para el tono (puede ser ruido también)
    let toneGain;
    let rainSource;
    let rainGain;
    let rainBuffer;

    async function initAudio() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        // 1) Cargar el audio de lluvia
        const resp = await fetch('lluvia.mp3');
        const arrayBuf = await resp.arrayBuffer();
        rainBuffer = await audioCtx.decodeAudioData(arrayBuf);
      }
    }

    function startMix() {
      if (!audioCtx) return;

      // --- Tono (puede ser tu tinnitus / ruido blanco) ---
      osc = audioCtx.createOscillator();
      toneGain = audioCtx.createGain();

      osc.type = 'sine';           // 'sine', 'square', 'triangle', 'sawtooth'
      osc.frequency.value = 4000;  // por ejemplo 4 kHz; ajusta según tu tinnitus
      toneGain.gain.value = parseFloat(document.getElementById('toneVol').value);

      osc.connect(toneGain);
      toneGain.connect(audioCtx.destination);
      osc.start();

      // --- Lluvia (buffer de audio) ---
      rainSource = audioCtx.createBufferSource();
      rainGain = audioCtx.createGain();

      rainSource.buffer = rainBuffer;
      rainSource.loop = true; // lluvia en bucle
      rainGain.gain.value = parseFloat(document.getElementById('rainVol').value);

      rainSource.connect(rainGain);
      rainGain.connect(audioCtx.destination);
      rainSource.start();
    }

    function stopMix() {
      if (osc) {
        osc.stop();
        osc.disconnect();
        osc = null;
      }
      if (rainSource) {
        rainSource.stop();
        rainSource.disconnect();
        rainSource = null;
      }
    }

    document.getElementById('play').addEventListener('click', async () => {
      await initAudio();
      // Algunos navegadores requieren resume() después de interacción
      if (audioCtx.state === 'suspended') await audioCtx.resume();
      startMix();
    });

    document.getElementById('stop').addEventListener('click', () => {
      stopMix();
    });

    // Controles de volumen en tiempo real
    document.getElementById('toneVol').addEventListener('input', (e) => {
      if (toneGain) toneGain.gain.value = parseFloat(e.target.value);
    });
    document.getElementById('rainVol').addEventListener('input', (e) => {
      if (rainGain) rainGain.gain.value = parseFloat(e.target.value);
    });
  </script>
</body>
</html>
Con esto puedes:

Ajustar la frecuencia del oscilador para que se parezca a tu tinnitus,
o reemplazar el oscilador por ruido blanco/rosa.
Subir/bajar independiente:
volumen del “sonido de tinnitus” (tono/ruido)
volumen de la lluvia
2. Integrarlo a tu generador actual
Si ya tienes un generador tipo toneGenerator.js (con un AudioContext y un oscillator o noiseSource):

Reutiliza el mismo audioCtx.
Añade:
un AudioBufferSourceNode para la lluvia
un GainNode para el volumen de la lluvia
Carga el archivo de lluvia una sola vez (con fetch + decodeAudioData).
En el botón “Play / Stop” de tu app:
cuando arrancas el tono, también arrancas la lluvia
cuando paras, detienes ambos.
Si me pegas la parte de JavaScript que maneja el botón Play/Stop de tu generador, te lo puedo adaptar directamente para que incluya la capa de lluvia.

3. ¿Y si quiero “agua corriente”, mar, etc.?
Es exactamente lo mismo:

Cambias lluvia.mp3 por rio.mp3, mar.wav, etc.
Puedes incluso tener un <select>:
“Solo ruido/tono”
“Ruido + lluvia”
“Ruido + mar”
“Ruido + río”
Y cargar diferentes buffers según la opción elegida.
Si me dices qué tipo de mezcla buscas (por ejemplo: “tinnitus 8 kHz + ruido blanco muy suave + lluvia fuerte de fondo”), te preparo un ejemplo aún más específico con esos parámetros.

sistema de nuromodulacion con tonos
⁣͏͏⁣͏͏͏͏⁣͏͏͏⁣⁣⁣⁣⁣͏͏⁣⁣͏⁣͏⁣͏͏⁣͏͏͏⁣⁣͏͏⁣⁣⁣⁣͏⁣͏͏⁣͏⁣⁣͏⁣͏⁣͏͏͏͏͏⁣⁣͏͏⁣͏͏͏⁣͏͏⁣⁣͏⁣͏⁣⁣͏͏⁣⁣⁣⁣⁣⁣͏͏⁣⁣⁣͏⁣⁣͏͏⁣⁣͏⁣⁣⁣͏͏⁣⁣͏͏⁣⁣͏͏͏⁣⁣⁣⁣⁣͏͏⁣⁣⁣⁣⁢gpt-5.1
Un “sistema de neuromodulación con tonos” para tinnitus suele referirse a cosas como:

CR Neuromodulation (Coordinated Reset)
Otros protocolos que usan varios tonos alrededor de la frecuencia del tinnitus para intentar modificar la actividad neuronal, no solo tapar el ruido.
Te explico el concepto básico y luego cómo podrías implementarlo a nivel técnico con la Web Audio API (similar a tu generador).

1. Idea general de la neuromodulación acústica
No es simplemente “poner un beep”:

Primero se determina la frecuencia principal del tinnitus (p.ej. 6 kHz).
Se generan varios tonos (por ejemplo 4) alrededor de esa frecuencia, NO exactamente en ella.
Ejemplo para un tinnitus en 6 kHz:
f1 ≈ 5 kHz
f2 ≈ 5.5 kHz
f3 ≈ 6.5 kHz
f4 ≈ 7 kHz
Esos tonos se reproducen en patrones temporales específicos, por ejemplo:
secuencias cortas
con pausas
cambiando el orden de los tonos
La idea de CR Neuromodulation es “resetear” el patrón de actividad sincrónica de las neuronas que están generando el tinnitus.

Importante: estos protocolos vienen de estudios científicos; si quieres algo clínicamente serio, debería aplicarlo/un supervisarlo un especialista. Lo que te muestro abajo es a nivel técnico / experimental, no como terapia médica garantizada.

2. Esquema sencillo de neuromodulación con 4 tonos
Supongamos:

Tinnitus en frecuencia fT (en Hz), por ejemplo 8000 Hz.
Definimos 4 tonos:
text
f1 = fT * 0.8    (un poco por debajo)
f2 = fT * 0.9
f3 = fT * 1.1
f4 = fT * 1.2    (un poco por encima)
Y un patrón tipo:

Reproducir f1 durante 150 ms
Pausa 50 ms
Reproducir f2 durante 150 ms
Pausa 50 ms
Reproducir f3 durante 150 ms
Pausa 50 ms
Reproducir f4 durante 150 ms
Pausa 200 ms
Repetir
Todo a volumen moderado, por debajo del umbral molesto.

3. Ejemplo técnico con Web Audio API (muy básico)
Este ejemplo:

Pide una frecuencia de tinnitus (en Hz)
Calcula 4 tonos alrededor
Los reproduce en un bucle tipo “pattern”
html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Neuromodulación simple con tonos</title>
</head>
<body>
  <label>
    Frecuencia tinnitus (Hz):
    <input id="tinnitusFreq" type="number" value="8000" min="500" max="12000" step="100">
  </label>
  <br>
  <label>
    Volumen:
    <input id="volume" type="range" min="0" max="1" step="0.01" value="0.2">
  </label>
  <br><br>
  <button id="start">Iniciar neuromodulación</button>
  <button id="stop">Detener</button>

  <script>
    let audioCtx = null;
    let gainNode = null;
    let running = false;
    let patternTimeout = null;

    function createBeep(freq, durationMs) {
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(gainNode);
      osc.start();

      // parar el beep luego de durationMs
      setTimeout(() => {
        osc.stop();
        osc.disconnect();
      }, durationMs);
    }

    function runPattern() {
      if (!running) return;

      const tFreq = parseFloat(document.getElementById('tinnitusFreq').value) || 8000;

      // 4 tonos alrededor de la frecuencia de tinnitus
      const f1 = tFreq * 0.8;
      const f2 = tFreq * 0.9;
      const f3 = tFreq * 1.1;
      const f4 = tFreq * 1.2;

      const beepDuration = 150; // ms
      let t = 0;

      // secuencia: f1, f2, f3, f4 con pausas cortas
      setTimeout(() => createBeep(f1, beepDuration), t); t += beepDuration + 50;
      setTimeout(() => createBeep(f2, beepDuration), t); t += beepDuration + 50;
      setTimeout(() => createBeep(f3, beepDuration), t); t += beepDuration + 50;
      setTimeout(() => createBeep(f4, beepDuration), t); t += beepDuration;

      // pausa más larga entre bloques
      t += 200;

      // volver a ejecutar el patrón
      patternTimeout = setTimeout(runPattern, t);
    }

    document.getElementById('start').addEventListener('click', async () => {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        gainNode = audioCtx.createGain();
        gainNode.connect(audioCtx.destination);
      }
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      gainNode.gain.value = parseFloat(document.getElementById('volume').value);

      running = true;
      runPattern();
    });

    document.getElementById('stop').addEventListener('click', () => {
      running = false;
      if (patternTimeout) {
        clearTimeout(patternTimeout);
        patternTimeout = null;
      }
    });

    document.getElementById('volume').addEventListener('input', (e) => {
      if (gainNode) gainNode.gain.value = parseFloat(e.target.value);
    });
  </script>
</body>
</html>
Esto es un prototipo muy simple:

No es exactamente el protocolo clínico CR.
Te muestra la lógica: calcular tonos alrededor de la frecuencia de tinnitus + patrón rítmico.
4. Puntos importantes (seguridad / práctica)
Volumen siempre moderado
Nunca subas el volumen para “tapar” por fuerza. Si molesta o fatiga, baja o detén.

Duración de las sesiones
En estudios, las sesiones suelen ser de decenas de minutos al día, no horas sin pausa.
Si pruebas por tu cuenta, haz:

10–15 min
descansa
observa cómo te sientes durante el día y al día siguiente.
Supervisión profesional
Si el tinnitus es severo o reciente, o hay pérdida de audición notable, lo ideal es:

consulta con un otorrino / audiólogo
si quieres usar neuromodulación como tratamiento, mejor que sea parte de un plan (audiometría, evaluación del tinnitus, etc.).
5. Cómo integrarlo a tu sistema actual
Si ya tienes:

un tinnitus matching (deslizadores para frecuencia)
un AudioContext / Oscillator funcionando
puedes:

Tomar la frecuencia que tu usuario ha ajustado como fT.
Calcular f1–f4 como arriba (o con otros factores que prefieras).
Crear una función tipo startNeuromodulation(fT) que:
programa los tonos en secuencia
los repite mientras “Start” esté activo.
Si me muestras la parte de tu código donde guardas la frecuencia del tinnitus (en Hz), puedo escribirte una función startNeuromodulation(fT) y stopNeuromodulation() adaptadas exactamente a tu estructura.

sistema basico apra determinar determina la frecuencia principal
⁣͏͏⁣͏͏͏͏⁣͏͏͏⁣⁣⁣⁣⁣͏͏⁣⁣͏⁣͏⁣͏͏⁣͏͏͏⁣⁣͏͏⁣⁣⁣⁣͏⁣͏͏⁣͏⁣⁣͏⁣͏⁣͏͏͏͏͏⁣⁣͏͏⁣͏͏͏⁣͏͏⁣⁣͏⁣͏⁣⁣͏͏⁣⁣⁣⁣⁣⁣͏͏⁣⁣⁣͏⁣⁣͏͏⁣⁣͏⁣⁣⁣͏͏⁣⁣͏͏⁣⁣͏͏͏⁣⁣⁣⁣⁣͏͏⁣⁣⁣⁣⁢gpt-5.1
Para un sistema básico que ayude a una persona a encontrar la frecuencia principal de su tinnitus, puedes hacer algo muy simple con Web Audio API:

Un slider de frecuencia (o botones +/–)
Un botón Play/Stop
Mostrar en texto la frecuencia actual (Hz)
El usuario ajusta hasta que el tono se parezca a su tinnitus.
Abajo tienes un ejemplo completo y sencillo en HTML + JS.

Ejemplo básico: “Tinnitus matcher” con un solo tono
Copia esto en un archivo tinnitus-matcher.html y ábrelo en Chrome:

html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Tinnitus Matcher Básico</title>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    label { display: block; margin: 10px 0; }
  </style>
</head>
<body>
  <h1>Tinnitus Matcher Básico</h1>

  <!-- Control de frecuencia -->
  <label>
    Frecuencia (Hz):
    <input id="freqSlider" type="range" min="100" max="12000" step="10" value="6000">
    <span id="freqLabel">6000 Hz</span>
  </label>

  <!-- Botones para subir/bajar un poco -->
  <button id="freqDown">- 50 Hz</button>
  <button id="freqUp">+ 50 Hz</button>

  <!-- Tipo de onda (opcional) -->
  <label>
    Tipo de onda:
    <select id="waveType">
      <option value="sine">Sine (senoidal)</option>
      <option value="square">Cuadrada</option>
      <option value="triangle">Triangular</option>
      <option value="sawtooth">Sierra</option>
    </select>
  </label>

  <!-- Botón Play/Stop -->
  <button id="playStop">Reproducir</button>

  <!-- Resultado -->
  <p>
    Cuando sientas que el tono se parece a tu tinnitus, anota la frecuencia que aparece arriba.
  </p>

  <script>
    let audioCtx = null;
    let osc = null;
    let gainNode = null;
    let isPlaying = false;

    const freqSlider = document.getElementById('freqSlider');
    const freqLabel  = document.getElementById('freqLabel');
    const playStopBtn = document.getElementById('playStop');
    const waveTypeSel = document.getElementById('waveType');
    const freqUpBtn   = document.getElementById('freqUp');
    const freqDownBtn = document.getElementById('freqDown');

    // Actualiza la etiqueta de Hz
    function updateFreqLabel() {
      freqLabel.textContent = freqSlider.value + ' Hz';
    }
    updateFreqLabel();

    // Crear (si hace falta) el contexto de audio y el oscilador
    function startTone() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const freq = parseFloat(freqSlider.value);

      osc = audioCtx.createOscillator();
      gainNode = audioCtx.createGain();

      osc.type = waveTypeSel.value;    // sine, square, triangle, sawtooth
      osc.frequency.value = freq;

      // Volumen moderado
      gainNode.gain.value = 0.15;

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();

      isPlaying = true;
      playStopBtn.textContent = 'Detener';
    }

    function stopTone() {
      if (osc) {
        osc.stop();
        osc.disconnect();
        osc = null;
      }
      if (gainNode) {
        gainNode.disconnect();
        gainNode = null;
      }
      isPlaying = false;
      playStopBtn.textContent = 'Reproducir';
    }

    // Cambiar frecuencia en tiempo real mientras suena
    function updateToneFrequency() {
      updateFreqLabel();
      if (osc) {
        osc.frequency.value = parseFloat(freqSlider.value);
      }
    }

    // Eventos
    playStopBtn.addEventListener('click', () => {
      if (!isPlaying) {
        startTone();
      } else {
        stopTone();
      }
    });

    freqSlider.addEventListener('input', () => {
      updateToneFrequency();
    });

    waveTypeSel.addEventListener('change', () => {
      if (osc) {
        osc.type = waveTypeSel.value;
      }
    });

    freqUpBtn.addEventListener('click', () => {
      let val = parseFloat(freqSlider.value);
      val = Math.min(val + 50, parseFloat(freqSlider.max));
      freqSlider.value = val;
      updateToneFrequency();
    });

    freqDownBtn.addEventListener('click', () => {
      let val = parseFloat(freqSlider.value);
      val = Math.max(val - 50, parseFloat(freqSlider.min));
      freqSlider.value = val;
      updateToneFrequency();
    });
  </script>
</body>
</html>
Cómo usarlo (desde el punto de vista del paciente/usuario)
Pulsa Reproducir.
Ajusta la frecuencia con el slider y los botones ± hasta que el tono se parezca a tu tinnitus:
Si tu tinnitus es muy agudo, ve hacia 6000–10000 Hz.
Si es más grave, baja hacia 500–3000 Hz.
Opcional: cambia el tipo de onda si notas que tu tinnitus es más áspero (square, sawtooth) o más puro (sine).
Cuando sientas que se parece, anota la frecuencia que aparece (por ejemplo “7300 Hz”).
Esa frecuencia (aproximada) es tu frecuencia principal de tinnitus, y la puedes usar luego para:

generar ruido filtrado alrededor
hacer notched audio
montar un patrón de neuromodulación (los 4 tonos alrededor, etc.)
Si quieres, el siguiente paso puede ser:

guardar esa frecuencia en una variable y
usarla directamente en una función de neuromodulación simple como la que te mostré antes.

