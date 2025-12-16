/**
 * Treatment UI Manager
 * User interface for tinnitus therapies
 * Tinnitus MVP - Sprint 5-6
 */

class TreatmentUI {
  constructor() {
    this.engine = new TreatmentEngine();
    this.visualization = new VisualizationEngine();
    this.currentScreen = 'welcome';
    this.isPlaying = false;
    this.progressInterval = null;

    // Download settings
    this.downloadDuration = 5; // minutes
    this.downloadQuality = 'high'; // 'high' or 'low'

    // UI Elements
    this.container = null;
    this.progressBar = null;
    this.timeDisplay = null;

    // Setup callbacks
    this.setupEngineCallbacks();
  }

  /**
   * Initialize UI
   */
  async initialize() {
    this.container = document.getElementById('treatment-container');

    // Load tinnitus match data
    const matchData = Storage.getTinnitusMatch();

    if (!matchData) {
      this.showNoMatchError();
      return;
    }

    // Initialize engine with tinnitus frequency
    await this.engine.initialize(matchData.frequency);

    // Show welcome screen
    this.showWelcomeScreen();

    console.log('Treatment UI initialized');
  }

  /**
   * Setup engine callbacks
   */
  setupEngineCallbacks() {
    this.engine.onSessionStart = (therapy, duration) => {
      this.isPlaying = true;
      this.updatePlayButton();
      this.startProgressDisplay();
      console.log(`Session started: ${therapy} for ${duration} min`);
    };

    this.engine.onSessionEnd = (therapy, duration) => {
      this.isPlaying = false;
      this.updatePlayButton();
      this.stopProgressDisplay();
      this.showSessionComplete(therapy, duration);
      console.log(`Session ended: ${therapy}, ${Math.round(duration)}s`);
    };

    this.engine.onProgress = (current, target, percentage) => {
      this.updateProgress(current, target, percentage);
    };

    this.engine.onVolumeChange = (volume) => {
      this.updateVolumeDisplay(volume);
    };
  }

  /**
   * Show error when no match data - WITH MANUAL INPUT OPTION
   */
  showNoMatchError() {
    this.container.innerHTML = `
      <div class="screen active">
        <div class="card">
          <h2 class="mb-4">⚠️ Sin datos de frecuencia</h2>
          <p class="mb-6">
            No se encontró información sobre tu frecuencia de tinnitus.
            Puedes completar el módulo de búsqueda o ingresar manualmente la frecuencia para probar tratamientos.
          </p>

          <!-- Manual Frequency Input -->
          <div class="card bg-light mb-6">
            <h3 class="font-bold mb-4">🎯 Ingresar Frecuencia Manualmente</h3>
            <p class="text-sm text-gray-600 mb-4">
              Ingresa la frecuencia aproximada de tu tinnitus (en Hz) para probar los tratamientos:
            </p>

            <div class="mb-4">
              <label class="label">Frecuencia (Hz)</label>
              <input type="number"
                     id="manual-frequency"
                     class="input"
                     min="20"
                     max="20000"
                     value="4000"
                     step="10"
                     style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-color); border-radius: 6px; font-size: 1rem;">
              <div class="text-sm text-gray-600 mt-2">
                Rango común de tinnitus: 3000-8000 Hz
              </div>
            </div>

            <button class="btn btn-success w-full" onclick="treatmentUI.startWithManualFrequency()">
              ✓ Usar Esta Frecuencia y Probar Tratamientos
            </button>
          </div>

          <!-- Or go to matching -->
          <div class="text-center">
            <p class="text-sm text-gray-600 mb-3">O completa la búsqueda precisa:</p>
            <a href="matching.html" class="btn btn-primary">
              Ir a Búsqueda de Frecuencia →
            </a>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Start with manual frequency
   */
  async startWithManualFrequency() {
    const input = document.getElementById('manual-frequency');
    const frequency = parseInt(input.value);

    if (!frequency || frequency < 20 || frequency > 20000) {
      alert('Por favor ingresa una frecuencia válida entre 20 y 20000 Hz');
      return;
    }

    Logger.info('treatment-ui', `🎯 Usuario ingresó frecuencia manual: ${frequency} Hz`);

    // Create temporary match data
    const manualMatchData = {
      frequency: frequency,
      confidence: 0,
      volume: 0.3,
      waveType: 'sine',
      validationScore: 'N/A',
      ear: 'both',
      manual: true,
      timestamp: new Date().toISOString()
    };

    // Save to storage (optional)
    Storage.saveTinnitusMatch(manualMatchData);

    // Initialize engine
    await this.engine.initialize(frequency);

    // Show welcome screen
    this.showWelcomeScreen();
  }

  /**
   * Show welcome screen with therapy selection
   */
  showWelcomeScreen() {
    const matchData = Storage.getTinnitusMatch();
    const isManual = matchData.manual || false;

    this.container.innerHTML = `
      <div class="screen active" id="welcome-screen">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold mb-4">Módulo 3: Tratamiento</h1>
          <p class="text-xl">Terapias Sonoras para Tinnitus</p>
        </div>

        <div class="card mb-6">
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-xl font-bold">Tu Frecuencia de Tinnitus</h3>
            <button class="btn btn-outline btn-sm" onclick="treatmentUI.editFrequency()">
              ✏️ Editar
            </button>
          </div>
          <div class="frequency-display">
            <div class="frequency-value">${matchData.frequency} Hz</div>
            <div class="frequency-label">
              ${isManual
                ? '⚠️ Frecuencia ingresada manualmente'
                : `Confianza: ${matchData.confidence}%`}
            </div>
          </div>
        </div>

        <div class="card mb-6">
          <h3 class="text-xl font-bold mb-4">Selecciona una Terapia</h3>
          <p class="text-sm text-gray-600 mb-4">
            Todas las terapias están personalizadas según tu frecuencia de tinnitus.
          </p>

          <div class="therapy-grid">
            ${this.renderTherapyCard('notched')}
            ${this.renderTherapyCard('cr')}
            ${this.renderTherapyCard('masking')}
            ${this.renderTherapyCard('ambient')}
          </div>

          <h3 class="font-bold text-xl mt-6 mb-4">🎭 Terapias Híbridas (Combinadas)</h3>
          <p class="text-sm text-gray-600 mb-4">
            Combinaciones de terapias científicas con sonidos relajantes para mejor adherencia.
          </p>

          <div class="therapy-grid">
            ${this.renderTherapyCard('hybrid-notched-ambient')}
            ${this.renderTherapyCard('hybrid-cr-ambient')}
          </div>
        </div>

        <div class="card bg-warning-light">
          <h4 class="font-bold mb-2">⚠️ Recomendaciones</h4>
          <ul class="list-disc list-inside text-sm">
            <li>Usa audífonos o auriculares de buena calidad</li>
            <li>Ajusta el volumen a un nivel cómodo</li>
            <li>No excedas el volumen del tinnitus</li>
            <li>Sesiones regulares (diarias) son más efectivas</li>
            <li>Consulta con un médico si experimentas molestias</li>
          </ul>
        </div>
      </div>
    `;
  }

  /**
   * Render therapy card
   */
  renderTherapyCard(therapyType) {
    const info = this.engine.getTherapyInfo(therapyType);

    const icons = {
      notched: '🔇',
      cr: '🎵',
      masking: '🌊',
      ambient: '🌲',
      'hybrid-notched-ambient': '🎭',
      'hybrid-cr-ambient': '🎼'
    };

    const effectivenessClass = {
      'Alta': 'badge-success',
      'Media-Alta': 'badge-success',
      'Media': 'badge-warning',
      'Baja-Media': 'badge-info'
    };

    return `
      <div class="therapy-card" onclick="treatmentUI.selectTherapy('${therapyType}')">
        <div class="therapy-icon">${icons[therapyType]}</div>
        <h4 class="therapy-name">${info.name}</h4>
        <p class="therapy-description">${info.description}</p>
        <div class="therapy-meta">
          <div class="therapy-duration">
            <strong>Duración:</strong> ${info.duration}
          </div>
          <div class="therapy-effectiveness">
            <span class="badge ${effectivenessClass[info.effectiveness] || 'badge-info'}">
              ${info.effectiveness}
            </span>
          </div>
        </div>
        <div class="therapy-evidence text-xs text-gray-600 mt-2">
          ${info.evidence}
        </div>
      </div>
    `;
  }

  /**
   * Select therapy and show session screen
   */
  async selectTherapy(therapyType) {
    this.currentTherapy = therapyType;
    // Initialize default duration based on therapy type
    this.sessionDuration = (therapyType === 'cr') ? 60 : 30;
    // Initialize default subtype
    if (therapyType === 'masking') {
      this.currentSubType = 'white';
    } else if (therapyType === 'ambient') {
      this.currentSubType = 'rain';
    } else if (therapyType === 'hybrid-notched-ambient' || therapyType === 'hybrid-cr-ambient') {
      this.currentSubType = 'rain';
    } else {
      this.currentSubType = null;
    }

    // IMPORTANT: Set therapy type in engine so downloads work without starting session
    this.engine.currentTherapy = therapyType;
    this.engine.currentSubType = this.currentSubType;

    this.showSessionScreen(therapyType);
  }

  /**
   * Show session control screen
   */
  showSessionScreen(therapyType) {
    const info = this.engine.getTherapyInfo(therapyType);
    const matchData = Storage.getTinnitusMatch();

    // Get default duration based on therapy
    const defaultDuration = therapyType === 'cr' ? 60 : 30;

    this.container.innerHTML = `
      <div class="screen active" id="session-screen">
        <div class="text-center mb-6">
          <h2 class="text-3xl font-bold mb-2">${info.name}</h2>
          <p class="text-gray-600">${info.description}</p>
        </div>

        <div class="card mb-6">
          <div class="session-info">
            <div class="session-info-item">
              <span class="label">Frecuencia:</span>
              <span class="value">${matchData.frequency} Hz</span>
            </div>
            <div class="session-info-item">
              <span class="label">Terapia:</span>
              <span class="value">${info.name}</span>
            </div>
            <div class="session-info-item">
              <span class="label">Duración objetivo:</span>
              <span class="value" id="duration-display">${defaultDuration} min</span>
            </div>
          </div>
        </div>

        ${this.renderSubTypeSelector(therapyType)}

        <div class="card mb-6">
          <h3 class="font-bold mb-4">Control de Sesión</h3>

          <!-- Duration Selector -->
          <div class="mb-4">
            <label class="label">Duración de sesión (minutos)</label>
            <input type="range"
                   id="duration-slider"
                   class="slider"
                   min="5"
                   max="120"
                   value="${defaultDuration}"
                   step="5"
                   oninput="treatmentUI.updateDuration(this.value)">
            <div class="slider-labels">
              <span>5 min</span>
              <span>30 min</span>
              <span>60 min</span>
              <span>120 min</span>
            </div>
          </div>

          <!-- Volume Control -->
          <div class="mb-6">
            <label class="label">Volumen</label>
            <input type="range"
                   id="volume-slider"
                   class="slider"
                   min="0"
                   max="100"
                   value="30"
                   oninput="treatmentUI.updateVolume(this.value)">
            <div class="volume-display" id="volume-display">30%</div>
          </div>

          <!-- Stereo Balance Control -->
          <div class="mb-6">
            <label class="label">🎧 Balance Estéreo (Izquierda ↔ Derecha)</label>
            <p class="text-xs text-gray-600 mb-2">
              Ajusta el balance entre oído izquierdo y derecho. Útil para tinnitus unilateral o asimétrico.
            </p>
            <input type="range"
                   id="stereo-balance-slider"
                   class="slider"
                   min="-100"
                   max="100"
                   value="0"
                   step="5"
                   oninput="treatmentUI.updateStereoBalance(this.value)">
            <div class="slider-labels mt-2">
              <span>100% Izq</span>
              <span>Centro</span>
              <span>100% Der</span>
            </div>
            <div class="text-center mt-2">
              <span class="font-bold text-lg text-primary-blue" id="stereo-balance-display">Centro (0)</span>
            </div>
          </div>

          <!-- Frequency Fine-Tuning -->
          <div class="mb-6">
            <label class="label">🎯 Ajuste Fino de Frecuencia</label>
            <p class="text-xs text-gray-600 mb-2">
              Ajusta la frecuencia en tiempo real para encontrar el tono exacto de tu tinnitus (±5%)
            </p>
            <input type="range"
                   id="frequency-slider"
                   class="slider"
                   min="-5"
                   max="5"
                   value="0"
                   step="0.1"
                   oninput="treatmentUI.updateFrequencyAdjustment(this.value)">
            <div class="frequency-adjustment-display">
              <div class="text-center mt-2">
                <span class="text-sm text-gray-600">Frecuencia Base:</span>
                <span class="font-bold text-lg" id="base-frequency-display">${matchData.frequency} Hz</span>
              </div>
              <div class="text-center mt-1">
                <span class="text-sm text-gray-600">Ajuste:</span>
                <span class="font-bold text-xl text-primary-blue" id="frequency-adjustment-display">0%</span>
              </div>
              <div class="text-center mt-1">
                <span class="text-sm text-gray-600">Frecuencia Actual:</span>
                <span class="font-bold text-2xl text-success" id="current-frequency-display">${matchData.frequency} Hz</span>
              </div>
            </div>
            <div class="slider-labels mt-2">
              <span>-5%</span>
              <span>0%</span>
              <span>+5%</span>
            </div>
          </div>

          <!-- Play/Pause Control -->
          <div class="play-control mb-4">
            <button id="play-button"
                    class="btn btn-primary btn-lg btn-play"
                    onclick="treatmentUI.togglePlay()">
              <span id="play-icon">▶</span>
              <span id="play-text">Iniciar Sesión</span>
            </button>
          </div>

          <!-- Download Audio Section -->
          <div class="download-section mt-6">
            <h4 class="font-bold mb-3">📥 Descargar Audio de Terapia</h4>
            <p class="text-xs text-gray-600 mb-3">
              Genera y descarga un archivo de audio con tu configuración actual (sonido, frecuencia, volumen)
            </p>

            <div class="download-options">
              <!-- Duration Selection -->
              <div class="mb-3">
                <label class="label text-sm">Duración</label>
                <div class="button-group-inline">
                  <button class="btn btn-outline btn-sm download-duration-btn active" data-duration="5" onclick="treatmentUI.setDownloadDuration(5)">
                    5 min
                  </button>
                  <button class="btn btn-outline btn-sm download-duration-btn" data-duration="10" onclick="treatmentUI.setDownloadDuration(10)">
                    10 min
                  </button>
                  <button class="btn btn-outline btn-sm download-duration-btn" data-duration="15" onclick="treatmentUI.setDownloadDuration(15)">
                    15 min
                  </button>
                  <button class="btn btn-outline btn-sm download-duration-btn" data-duration="30" onclick="treatmentUI.setDownloadDuration(30)">
                    30 min
                  </button>
                </div>
              </div>

              <!-- Quality Selection -->
              <div class="mb-3">
                <label class="label text-sm">Calidad</label>
                <div class="button-group-inline">
                  <button class="btn btn-outline btn-sm download-quality-btn active" data-quality="high" onclick="treatmentUI.setDownloadQuality('high')">
                    🎧 Alta (44.1 kHz)
                  </button>
                  <button class="btn btn-outline btn-sm download-quality-btn" data-quality="low" onclick="treatmentUI.setDownloadQuality('low')">
                    📱 Baja (22 kHz)
                  </button>
                </div>
              </div>

              <!-- Download Button -->
              <button id="download-button"
                      class="btn btn-success w-full"
                      onclick="treatmentUI.downloadAudio()">
                <span>💾 Descargar Audio WAV</span>
              </button>

              <p class="text-xs text-gray-500 mt-2 text-center">
                <span id="download-info">5 min • Alta calidad • Aprox. 50 MB</span>
              </p>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="progress-container" id="progress-container" style="display: none;">
            <div class="progress-info mb-2">
              <span id="time-current">0:00</span>
              <span id="time-target">30:00</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
            </div>
            <div class="progress-percentage" id="progress-percentage">0%</div>
          </div>

          <!-- Visualization Canvas -->
          <div class="visualization-container" id="visualization-container" style="display: none;">
            <div class="visualization-header">
              <h4 class="font-bold">🎨 Visualización Relajante</h4>
              <div class="visualization-controls">
                <select id="visualization-type" class="visualization-select" onchange="treatmentUI.changeVisualization(this.value)">
                  <option value="fractal">Fractal</option>
                  <option value="waves">Ondas</option>
                  <option value="particles">Partículas</option>
                  <option value="mandala">Mandala</option>
                  <option value="aurora">Aurora</option>
                </select>
                <button id="fullscreen-btn" class="btn btn-sm btn-secondary" onclick="treatmentUI.toggleVisualizationFullscreen()">
                  <span id="fullscreen-icon">⛶</span> Pantalla Completa
                </button>
              </div>
            </div>
            <div class="canvas-wrapper">
              <canvas id="visualization-canvas"></canvas>
            </div>
          </div>
        </div>

        <!-- Session History -->
        ${this.renderSessionHistory(therapyType)}

        <div class="button-group">
          <button class="btn btn-secondary" onclick="treatmentUI.goBack()">
            ← Cambiar Terapia
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Render sub-type selector for masking and ambient
   */
  renderSubTypeSelector(therapyType) {
    if (therapyType === 'masking') {
      return `
        <div class="card mb-6" id="subtype-selector">
          <h3 class="font-bold mb-3">Tipo de Ruido (7 opciones)</h3>
          <p class="text-sm text-gray-600 mb-3">
            Cada tipo de ruido tiene características espectrales únicas para enmascarar diferentes frecuencias de tinnitus.
          </p>
          <div class="alert alert-info mb-3" style="display: none;" id="change-hint">
            💡 <strong>Puedes cambiar el sonido en cualquier momento durante la sesión</strong> - el tiempo no se reinicia.
          </div>
          <div class="button-group-inline" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.5rem;">
            <button class="btn btn-outline btn-sm active" data-subtype="white" onclick="treatmentUI.selectSubType('white', this)">
              ⚪ Blanco
            </button>
            <button class="btn btn-outline btn-sm" data-subtype="pink" onclick="treatmentUI.selectSubType('pink', this)">
              🌸 Rosa
            </button>
            <button class="btn btn-outline btn-sm" data-subtype="brown" onclick="treatmentUI.selectSubType('brown', this)">
              🟤 Marrón
            </button>
            <button class="btn btn-outline btn-sm" data-subtype="blue" onclick="treatmentUI.selectSubType('blue', this)">
              🔵 Azul
            </button>
            <button class="btn btn-outline btn-sm" data-subtype="violet" onclick="treatmentUI.selectSubType('violet', this)">
              🟣 Violeta
            </button>
            <button class="btn btn-outline btn-sm" data-subtype="red" onclick="treatmentUI.selectSubType('red', this)">
              🔴 Rojo
            </button>
            <button class="btn btn-outline btn-sm" data-subtype="narrowband" onclick="treatmentUI.selectSubType('narrowband', this)">
              📊 Banda Estrecha
            </button>
          </div>
          <div class="text-xs text-gray-600 mt-3">
            <strong>Recomendaciones:</strong><br>
            • <strong>Blanco/Rosa:</strong> Enmascaramiento general<br>
            • <strong>Marrón/Rojo:</strong> Tinnitus de baja frecuencia<br>
            • <strong>Azul/Violeta:</strong> Tinnitus de alta frecuencia<br>
            • <strong>Banda Estrecha:</strong> Enmascaramiento específico centrado en tu frecuencia
          </div>
        </div>
      `;
    } else if (therapyType === 'ambient') {
      return `
        <div class="card mb-6" id="subtype-selector">
          <h3 class="font-bold mb-3">Sonido Ambiental (10 opciones)</h3>
          <p class="text-sm text-gray-600 mb-3">
            Sonidos naturales sintetizados para relajación y enmascaramiento suave del tinnitus.
          </p>
          <div class="alert alert-info mb-3" style="display: none;" id="change-hint">
            💡 <strong>Puedes cambiar el sonido en cualquier momento durante la sesión</strong> - explora y encuentra el que más te relaje.
          </div>
          <div class="button-group-inline" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.5rem;">
            <button class="btn btn-outline btn-sm active" data-subtype="rain" onclick="treatmentUI.selectSubType('rain', this)">
              🌧️ Lluvia
            </button>
            <button class="btn btn-outline btn-sm" data-subtype="ocean" onclick="treatmentUI.selectSubType('ocean', this)">
              🌊 Océano
            </button>
            <button class="btn btn-outline btn-sm" data-subtype="wind" onclick="treatmentUI.selectSubType('wind', this)">
              💨 Viento
            </button>
            <button class="btn btn-outline btn-sm" data-subtype="forest" onclick="treatmentUI.selectSubType('forest', this)">
              🌲 Bosque
            </button>
            <button class="btn btn-outline btn-sm" data-subtype="river" onclick="treatmentUI.selectSubType('river', this)">
              🏞️ Río
            </button>
            <button class="btn btn-outline btn-sm" data-subtype="waterfall" onclick="treatmentUI.selectSubType('waterfall', this)">
              💦 Cascada
            </button>
            <button class="btn btn-outline btn-sm" data-subtype="birds" onclick="treatmentUI.selectSubType('birds', this)">
              🐦 Pájaros
            </button>
            <button class="btn btn-outline btn-sm" data-subtype="thunder" onclick="treatmentUI.selectSubType('thunder', this)">
              ⛈️ Tormenta
            </button>
            <button class="btn btn-outline btn-sm" data-subtype="crickets" onclick="treatmentUI.selectSubType('crickets', this)">
              🦗 Grillos
            </button>
            <button class="btn btn-outline btn-sm" data-subtype="stream" onclick="treatmentUI.selectSubType('stream', this)">
              🏔️ Arroyo
            </button>
          </div>
          <div class="text-xs text-gray-600 mt-3">
            <strong>Características:</strong><br>
            • <strong>Agua (Lluvia, Río, Océano, Cascada, Arroyo):</strong> Ruido rosa/blanco con modulación natural<br>
            • <strong>Naturaleza (Pájaros, Grillos, Bosque):</strong> Eventos periódicos + fondo ambiental<br>
            • <strong>Elementos (Viento, Tormenta):</strong> Variaciones dinámicas para enmascaramiento activo
          </div>
        </div>
      `;
    } else if (therapyType === 'hybrid-notched-ambient' || therapyType === 'hybrid-cr-ambient') {
      const therapyName = therapyType === 'hybrid-notched-ambient' ? 'Notched' : 'CR';
      return `
        <div class="card mb-6" id="subtype-selector">
          <h3 class="font-bold mb-3">🎭 Sonido Ambiental para ${therapyName}</h3>
          <p class="text-sm text-gray-600 mb-3">
            Selecciona el sonido natural que se mezclará con la terapia ${therapyName}.
          </p>
          <div class="alert alert-info mb-3" style="display: none;" id="change-hint">
            💡 <strong>Puedes cambiar el sonido en cualquier momento</strong> - encuentra tu combinación perfecta.
          </div>
          <div class="button-group-inline" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.5rem;">
            <button class="btn btn-outline btn-sm active" data-subtype="rain" onclick="treatmentUI.selectSubType('rain', this)">
              🌧️ Lluvia
            </button>
            <button class="btn btn-outline btn-sm" data-subtype="ocean" onclick="treatmentUI.selectSubType('ocean', this)">
              🌊 Océano
            </button>
            <button class="btn btn-outline btn-sm" data-subtype="forest" onclick="treatmentUI.selectSubType('forest', this)">
              🌲 Bosque
            </button>
            <button class="btn btn-outline btn-sm" data-subtype="river" onclick="treatmentUI.selectSubType('river', this)">
              🏞️ Río
            </button>
            <button class="btn btn-outline btn-sm" data-subtype="waterfall" onclick="treatmentUI.selectSubType('waterfall', this)">
              💦 Cascada
            </button>
            <button class="btn btn-outline btn-sm" data-subtype="wind" onclick="treatmentUI.selectSubType('wind', this)">
              💨 Viento
            </button>
            <button class="btn btn-outline btn-sm" data-subtype="birds" onclick="treatmentUI.selectSubType('birds', this)">
              🐦 Pájaros
            </button>
            <button class="btn btn-outline btn-sm" data-subtype="cafe" onclick="treatmentUI.selectSubType('cafe', this)">
              ☕ Café
            </button>
            <button class="btn btn-outline btn-sm" data-subtype="fan" onclick="treatmentUI.selectSubType('fan', this)">
              🌀 Ventilador
            </button>
            <button class="btn btn-outline btn-sm" data-subtype="library" onclick="treatmentUI.selectSubType('library', this)">
              📚 Biblioteca
            </button>
          </div>

          <!-- Balance Control for Hybrid -->
          <div class="mt-6 pt-4 border-t-2 border-gray-200">
            <h4 class="font-bold mb-2">🎚️ Balance de Mezcla</h4>
            <p class="text-xs text-gray-600 mb-2">
              Ajusta la proporción entre terapia ${therapyName} y sonido ambiental
            </p>
            <input type="range"
                   id="balance-slider"
                   class="slider"
                   min="0"
                   max="100"
                   value="50"
                   step="5"
                   oninput="treatmentUI.updateHybridBalance(this.value)">
            <div class="slider-labels mt-2">
              <span>100% Terapia</span>
              <span>Balanceado</span>
              <span>100% Ambiental</span>
            </div>
            <div class="text-center mt-2">
              <span class="font-bold text-lg text-primary-blue" id="balance-display">50% Terapia / 50% Ambiental</span>
            </div>
          </div>
        </div>
      `;
    }
    return '';
  }

  /**
   * Select sub-type for therapy
   */
  async selectSubType(subType, button) {
    // Update button states
    const buttons = button.parentElement.querySelectorAll('.btn-outline');
    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // Update engine if playing
    if (this.isPlaying) {
      // Add visual feedback
      const selector = document.getElementById('subtype-selector');
      if (selector) {
        selector.style.transition = 'all 0.3s ease';
        selector.style.transform = 'scale(1.02)';
        setTimeout(() => {
          selector.style.transform = 'scale(1)';
        }, 300);
      }

      // Show temporary "Cambiando..." message
      const hint = document.getElementById('change-hint');
      if (hint) {
        const originalText = hint.innerHTML;
        hint.innerHTML = '🔄 <strong>Cambiando sonido...</strong>';
        hint.style.background = 'linear-gradient(90deg, #dbeafe, #bfdbfe)';

        await this.engine.changeSubType(subType);

        // Restore hint after change
        setTimeout(() => {
          hint.innerHTML = originalText;
          hint.style.background = '';
        }, 1000);
      } else {
        await this.engine.changeSubType(subType);
      }
    } else {
      // Not playing yet - just update engine's currentSubType for downloads
      this.engine.currentSubType = subType;
    }

    this.currentSubType = subType;
  }

  /**
   * Render session history
   */
  renderSessionHistory(therapyType) {
    const sessions = Storage.getTreatmentSessions()
      .filter(s => s.therapy === therapyType)
      .slice(-5) // Last 5 sessions
      .reverse();

    if (sessions.length === 0) {
      return '';
    }

    return `
      <div class="card">
        <h3 class="font-bold mb-3">Historial de Sesiones</h3>
        <div class="session-history">
          ${sessions.map(session => `
            <div class="session-history-item">
              <div class="session-date">${new Date(session.timestamp).toLocaleDateString()}</div>
              <div class="session-duration">${Math.round(session.duration / 60)} min</div>
              <div class="session-status">
                ${session.completed ? '<span class="badge badge-success">✓ Completada</span>' : '<span class="badge badge-warning">Parcial</span>'}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Update duration display
   */
  updateDuration(minutes) {
    document.getElementById('duration-display').textContent = `${minutes} min`;
    this.sessionDuration = parseInt(minutes);
  }

  /**
   * Update volume
   */
  updateVolume(value) {
    const volume = value / 100;
    this.engine.setVolume(volume);
  }

  /**
   * Update stereo balance (L-R)
   */
  updateStereoBalance(value) {
    const balance = parseInt(value);

    // Update display
    const display = document.getElementById('stereo-balance-display');
    if (display) {
      let text = '';
      if (balance < -10) {
        text = `Izquierda (${balance})`;
        display.style.color = 'var(--warning)';
      } else if (balance > 10) {
        text = `Derecha (+${balance})`;
        display.style.color = 'var(--success)';
      } else {
        text = `Centro (${balance})`;
        display.style.color = 'var(--primary-blue)';
      }
      display.textContent = text;
    }

    // Update engine balance
    this.engine.setStereoBalance(balance / 100); // Convert to -1.0 to 1.0 range

    Logger.info('treatment-ui', `🎧 Balance estéreo ajustado: ${balance} (${balance < 0 ? 'Izquierda' : balance > 0 ? 'Derecha' : 'Centro'})`);
  }

  /**
   * Update frequency adjustment
   */
  updateFrequencyAdjustment(adjustmentPercent) {
    const adjustment = parseFloat(adjustmentPercent);
    const sign = adjustment >= 0 ? '+' : '';

    // Get base frequency from match data
    const matchData = Storage.getTinnitusMatch();
    const baseFrequency = matchData.frequency;

    // Calculate new frequency (base + adjustment%)
    const newFrequency = Math.round(baseFrequency * (1 + adjustment / 100));

    // Update displays
    const adjustmentDisplay = document.getElementById('frequency-adjustment-display');
    const currentFreqDisplay = document.getElementById('current-frequency-display');

    if (adjustmentDisplay) {
      adjustmentDisplay.textContent = `${sign}${adjustment.toFixed(1)}%`;

      // Color code the adjustment
      if (adjustment > 0) {
        adjustmentDisplay.style.color = 'var(--success)';
      } else if (adjustment < 0) {
        adjustmentDisplay.style.color = 'var(--warning)';
      } else {
        adjustmentDisplay.style.color = 'var(--primary-blue)';
      }
    }

    if (currentFreqDisplay) {
      currentFreqDisplay.textContent = `${newFrequency} Hz`;
      currentFreqDisplay.style.transition = 'transform 0.2s ease';

      // Animate when changing
      currentFreqDisplay.style.transform = 'scale(1.1)';
      setTimeout(() => {
        currentFreqDisplay.style.transform = 'scale(1)';
      }, 200);
    }

    // Update engine frequency if playing
    if (this.isPlaying) {
      this.engine.updateFrequency(newFrequency);
    }

    Logger.info('treatment-ui', `🎯 Ajuste de frecuencia: ${baseFrequency} Hz → ${newFrequency} Hz (${sign}${adjustment.toFixed(1)}%)`);
  }

  /**
   * Update hybrid therapy balance
   */
  updateHybridBalance(value) {
    const balance = parseFloat(value) / 100; // Convert 0-100 to 0-1
    this.engine.setHybridBalance(balance);

    // Update display
    const balanceDisplay = document.getElementById('balance-display');
    if (balanceDisplay) {
      const therapyPercent = Math.round((1 - balance) * 100);
      const ambientPercent = Math.round(balance * 100);
      balanceDisplay.textContent = `${therapyPercent}% Terapia / ${ambientPercent}% Ambiental`;
    }

    Logger.info('treatment-ui', `🎚️ Balance híbrido: ${Math.round(balance * 100)}%`);
  }

  /**
   * Update volume display
   */
  updateVolumeDisplay(volume) {
    const percentage = Math.round(volume * 100);
    const display = document.getElementById('volume-display');
    if (display) {
      display.textContent = `${percentage}%`;
    }
  }

  /**
   * Set download duration
   */
  setDownloadDuration(minutes) {
    this.downloadDuration = minutes;

    // Update button states
    document.querySelectorAll('.download-duration-btn').forEach(btn => {
      btn.classList.remove('active');
      if (parseInt(btn.dataset.duration) === minutes) {
        btn.classList.add('active');
      }
    });

    this.updateDownloadInfo();
    Logger.info('treatment-ui', `📥 Duración de descarga establecida: ${minutes} minutos`);
  }

  /**
   * Set download quality
   */
  setDownloadQuality(quality) {
    this.downloadQuality = quality;

    // Update button states
    document.querySelectorAll('.download-quality-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.quality === quality) {
        btn.classList.add('active');
      }
    });

    this.updateDownloadInfo();
    Logger.info('treatment-ui', `📥 Calidad de descarga establecida: ${quality}`);
  }

  /**
   * Update download info display
   */
  updateDownloadInfo() {
    const infoDisplay = document.getElementById('download-info');
    if (!infoDisplay) return;

    const minutes = this.downloadDuration;
    const quality = this.downloadQuality;
    const qualityLabel = quality === 'high' ? 'Alta calidad' : 'Baja calidad';

    // Calculate approximate file size
    // WAV file size = sample_rate * channels * bits_per_sample / 8 * duration_seconds
    const sampleRate = quality === 'high' ? 44100 : 22050;
    const channels = 2;
    const bitsPerSample = 16;
    const durationSeconds = minutes * 60;
    const bytes = sampleRate * channels * (bitsPerSample / 8) * durationSeconds;
    const megabytes = Math.round(bytes / (1024 * 1024));

    infoDisplay.textContent = `${minutes} min • ${qualityLabel} • Aprox. ${megabytes} MB`;
  }

  /**
   * Download audio with current settings
   */
  async downloadAudio() {
    try {
      const downloadButton = document.getElementById('download-button');
      if (!downloadButton) return;

      // Disable button and show loading state
      downloadButton.disabled = true;
      downloadButton.innerHTML = '<span>⏳ Generando audio...</span>';

      Logger.info('treatment-ui', `📥 Iniciando descarga de audio: ${this.downloadDuration} min, calidad ${this.downloadQuality}`);

      // Generate and download
      await this.engine.generateAndDownload('wav', this.downloadDuration, this.downloadQuality);

      // Success feedback
      downloadButton.innerHTML = '<span>✅ Audio descargado</span>';
      setTimeout(() => {
        downloadButton.disabled = false;
        downloadButton.innerHTML = '<span>💾 Descargar Audio WAV</span>';
      }, 3000);

      Logger.success('treatment-ui', '✅ Audio descargado exitosamente');
    } catch (error) {
      Logger.error('treatment-ui', `Error descargando audio: ${error.message}`);

      const downloadButton = document.getElementById('download-button');
      if (downloadButton) {
        downloadButton.innerHTML = '<span>❌ Error al descargar</span>';
        setTimeout(() => {
          downloadButton.disabled = false;
          downloadButton.innerHTML = '<span>💾 Descargar Audio WAV</span>';
        }, 3000);
      }
    }
  }

  /**
   * Change visualization type
   */
  changeVisualization(type) {
    this.visualization.changeType(type);
    Logger.info('treatment-ui', `🎨 Tipo de visualización cambiado: ${type}`);
  }

  /**
   * Toggle visualization fullscreen
   */
  async toggleVisualizationFullscreen() {
    await this.visualization.toggleFullscreen();

    // Update button text
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const fullscreenIcon = document.getElementById('fullscreen-icon');

    if (fullscreenBtn && fullscreenIcon) {
      const textSpan = fullscreenBtn.querySelector('span:not(#fullscreen-icon)');
      if (textSpan) {
        if (this.visualization.isFullscreen) {
          fullscreenIcon.textContent = '⛶';
          textSpan.textContent = ' Salir de Pantalla Completa';
        } else {
          fullscreenIcon.textContent = '⛶';
          textSpan.textContent = ' Pantalla Completa';
        }
      }
    }
  }

  /**
   * Toggle play/pause
   */
  async togglePlay() {
    if (this.isPlaying) {
      this.stopSession();
    } else {
      await this.startSession();
    }
  }

  /**
   * Start therapy session
   */
  async startSession() {
    const duration = this.sessionDuration || 30;

    Logger.info('treatment-ui', `▶️ Iniciando sesión - Terapia: ${this.currentTherapy}, SubTipo: ${this.currentSubType || 'ninguno'}, Duración: ${duration}min`);

    // Show progress container
    document.getElementById('progress-container').style.display = 'block';

    // Initialize and show visualization
    const visualizationContainer = document.getElementById('visualization-container');
    Logger.debug('treatment-ui', `Visualization container encontrado: ${visualizationContainer ? 'SI' : 'NO'}`);

    if (visualizationContainer) {
      Logger.debug('treatment-ui', `Mostrando visualization container...`);
      visualizationContainer.style.display = 'block';

      // Initialize visualization if not already done
      if (!this.visualization.canvas) {
        Logger.debug('treatment-ui', `Inicializando visualization engine...`);
        const initSuccess = this.visualization.initialize('visualization-canvas');
        Logger.debug('treatment-ui', `Visualization inicializado: ${initSuccess ? 'EXITO' : 'FALLO'}`);
      } else {
        Logger.debug('treatment-ui', `Visualization ya estaba inicializado (canvas existe)`);
      }

      // Start visualization with default type
      const visualizationType = document.getElementById('visualization-type')?.value || 'fractal';
      Logger.debug('treatment-ui', `Iniciando visualization tipo: ${visualizationType}`);
      this.visualization.start(visualizationType);
      Logger.success('treatment-ui', `✅ Visualization debería estar visible ahora`);
    } else {
      Logger.error('treatment-ui', `❌ NO SE ENCONTRÓ visualization-container en el DOM`);
    }

    // Start therapy with current subtype
    Logger.debug('treatment-ui', `Llamando engine.startTherapy()...`);
    await this.engine.startTherapy(this.currentTherapy, duration, this.currentSubType);

    this.isPlaying = true;
    this.updatePlayButton();

    Logger.success('treatment-ui', `✅ Sesión iniciada completamente`);
  }

  /**
   * Stop therapy session
   */
  stopSession() {
    this.engine.stopTherapy();
    this.isPlaying = false;
    this.updatePlayButton();

    // Stop and hide visualization
    this.visualization.stop();
    const visualizationContainer = document.getElementById('visualization-container');
    if (visualizationContainer) {
      visualizationContainer.style.display = 'none';
    }
  }

  /**
   * Update play button state
   */
  updatePlayButton() {
    const button = document.getElementById('play-button');
    const icon = document.getElementById('play-icon');
    const text = document.getElementById('play-text');

    if (!button) return;

    if (this.isPlaying) {
      button.classList.remove('btn-primary');
      button.classList.add('btn-danger');
      icon.textContent = '■';
      text.textContent = 'Detener Sesión';

      // Show hint about changing sounds during session
      const hint = document.getElementById('change-hint');
      if (hint) {
        hint.style.display = 'block';
        hint.style.animation = 'fadeIn 0.5s ease-in';
      }

      // Add glow effect to subtype selector
      const selector = document.getElementById('subtype-selector');
      if (selector) {
        selector.classList.add('playing');
      }
    } else {
      button.classList.remove('btn-danger');
      button.classList.add('btn-primary');
      icon.textContent = '▶';
      text.textContent = 'Iniciar Sesión';

      // Hide hint when not playing
      const hint = document.getElementById('change-hint');
      if (hint) {
        hint.style.display = 'none';
      }

      // Remove glow effect from subtype selector
      const selector = document.getElementById('subtype-selector');
      if (selector) {
        selector.classList.remove('playing');
      }
    }
  }

  /**
   * Start progress display updates
   */
  startProgressDisplay() {
    this.progressInterval = setInterval(() => {
      // Progress is updated via engine callback
    }, 100);
  }

  /**
   * Stop progress display updates
   */
  stopProgressDisplay() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  /**
   * Update progress display
   */
  updateProgress(current, target, percentage) {
    // Update time displays
    const currentMin = Math.floor(current / 60);
    const currentSec = Math.floor(current % 60);
    const targetMin = Math.floor(target / 60);
    const targetSec = Math.floor(target % 60);

    const currentEl = document.getElementById('time-current');
    const targetEl = document.getElementById('time-target');
    const fillEl = document.getElementById('progress-fill');
    const percentEl = document.getElementById('progress-percentage');

    if (currentEl) {
      currentEl.textContent = `${currentMin}:${currentSec.toString().padStart(2, '0')}`;
    }
    if (targetEl) {
      targetEl.textContent = `${targetMin}:${targetSec.toString().padStart(2, '0')}`;
    }
    if (fillEl) {
      fillEl.style.width = `${percentage}%`;
    }
    if (percentEl) {
      percentEl.textContent = `${Math.round(percentage)}%`;
    }
  }

  /**
   * Show session complete modal
   */
  showSessionComplete(therapy, duration) {
    // Remove any existing modals first
    const existingModal = document.querySelector('.modal');
    if (existingModal) {
      existingModal.remove();
    }

    const info = this.engine.getTherapyInfo(therapy);
    const minutes = Math.round(duration / 60);

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.opacity = '0';
    modal.innerHTML = `
      <div class="modal-content">
        <h2 class="text-2xl font-bold mb-4">✅ Sesión Completada</h2>
        <div class="card bg-success-light mb-4">
          <div class="text-center">
            <div class="text-4xl mb-2">🎉</div>
            <h3 class="text-xl font-bold mb-2">${info.name}</h3>
            <p class="text-3xl font-bold text-success">${minutes} minutos</p>
          </div>
        </div>
        <p class="mb-6 text-center">
          Has completado una sesión de ${info.name}.
          Las sesiones regulares son clave para obtener mejores resultados.
        </p>
        <div class="button-group">
          <button class="btn btn-primary" onclick="treatmentUI.restartSession();">
            Repetir Sesión
          </button>
          <button class="btn btn-secondary" onclick="treatmentUI.closeModalAndGoBack();">
            Cambiar Terapia
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Fade in animation
    setTimeout(() => {
      modal.style.transition = 'opacity 0.3s ease-in';
      modal.style.opacity = '1';
    }, 10);
  }

  /**
   * Close modal
   */
  closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
      // Add fade out animation
      modal.style.opacity = '0';
      modal.style.transition = 'opacity 0.2s ease-out';

      // Remove after animation
      setTimeout(() => {
        if (modal && modal.parentNode) {
          modal.remove();
        }
      }, 200);
    }
  }

  /**
   * Restart session
   */
  async restartSession() {
    // Close modal first
    this.closeModal();

    // Wait for modal to close
    await new Promise(resolve => setTimeout(resolve, 250));

    // Reset progress with null checks
    const progressFill = document.getElementById('progress-fill');
    const progressPercentage = document.getElementById('progress-percentage');
    const timeCurrent = document.getElementById('time-current');

    if (progressFill) {
      progressFill.style.width = '0%';
    }
    if (progressPercentage) {
      progressPercentage.textContent = '0%';
    }
    if (timeCurrent) {
      timeCurrent.textContent = '0:00';
    }

    // Start new session
    await this.startSession();
  }

  /**
   * Close modal and go back to therapy selection
   */
  async closeModalAndGoBack() {
    this.closeModal();

    // Wait for modal to close
    await new Promise(resolve => setTimeout(resolve, 250));

    this.goBack();
  }

  /**
   * Go back to therapy selection
   */
  goBack() {
    if (this.isPlaying) {
      this.stopSession();
    }
    this.showWelcomeScreen();
  }

  /**
   * Edit frequency
   */
  editFrequency() {
    const matchData = Storage.getTinnitusMatch();
    const currentFreq = matchData ? matchData.frequency : 4000;

    this.container.innerHTML = `
      <div class="screen active">
        <div class="card">
          <h2 class="mb-4">✏️ Editar Frecuencia del Tinnitus</h2>
          <p class="mb-6">
            Ajusta la frecuencia para personalizar los tratamientos. Puedes probar diferentes frecuencias para encontrar la más efectiva.
          </p>

          <div class="mb-6">
            <label class="label">Frecuencia (Hz)</label>
            <input type="number"
                   id="edit-frequency"
                   class="input"
                   min="20"
                   max="20000"
                   value="${currentFreq}"
                   step="10"
                   style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-color); border-radius: 6px; font-size: 1.5rem; text-align: center; font-weight: bold;">

            <div class="mt-4">
              <label class="label">O usa estos presets comunes:</label>
              <div class="button-group-inline">
                <button class="btn btn-outline" onclick="document.getElementById('edit-frequency').value = 3000">
                  3000 Hz
                </button>
                <button class="btn btn-outline" onclick="document.getElementById('edit-frequency').value = 4000">
                  4000 Hz
                </button>
                <button class="btn btn-outline" onclick="document.getElementById('edit-frequency').value = 6000">
                  6000 Hz
                </button>
                <button class="btn btn-outline" onclick="document.getElementById('edit-frequency').value = 8000">
                  8000 Hz
                </button>
              </div>
            </div>

            <div class="text-sm text-gray-600 mt-3">
              <strong>Rangos comunes de tinnitus:</strong><br>
              • 3000-5000 Hz: Frecuencias medias<br>
              • 5000-8000 Hz: Frecuencias altas (más común)<br>
              • 8000-12000 Hz: Frecuencias muy altas
            </div>
          </div>

          <div class="button-group">
            <button class="btn btn-secondary flex-1" onclick="treatmentUI.showWelcomeScreen()">
              ← Cancelar
            </button>
            <button class="btn btn-primary flex-1" onclick="treatmentUI.saveFrequency()">
              ✓ Guardar Frecuencia
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Save edited frequency
   */
  async saveFrequency() {
    const input = document.getElementById('edit-frequency');
    const frequency = parseInt(input.value);

    if (!frequency || frequency < 20 || frequency > 20000) {
      alert('Por favor ingresa una frecuencia válida entre 20 y 20000 Hz');
      return;
    }

    Logger.info('treatment-ui', `✏️ Usuario editó frecuencia a: ${frequency} Hz`);

    // Update match data
    const matchData = Storage.getTinnitusMatch() || {};
    matchData.frequency = frequency;
    matchData.manual = true;
    matchData.timestamp = new Date().toISOString();

    Storage.saveTinnitusMatch(matchData);

    // Re-initialize engine with new frequency
    await this.engine.initialize(frequency);

    Logger.success('treatment-ui', `✅ Frecuencia actualizada a ${frequency} Hz`);

    // Return to welcome screen
    this.showWelcomeScreen();
  }
}

// Initialize on page load
let treatmentUI;

document.addEventListener('DOMContentLoaded', async () => {
  treatmentUI = new TreatmentUI();
  await treatmentUI.initialize();
});
