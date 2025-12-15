/**
 * Treatment UI Manager
 * User interface for tinnitus therapies
 * Tinnitus MVP - Sprint 5-6
 */

class TreatmentUI {
  constructor() {
    this.engine = new TreatmentEngine();
    this.currentScreen = 'welcome';
    this.isPlaying = false;
    this.progressInterval = null;

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
   * Show error when no match data
   */
  showNoMatchError() {
    this.container.innerHTML = `
      <div class="screen active">
        <div class="card error-card">
          <h2>⚠️ Sin datos de frecuencia</h2>
          <p class="mb-6">
            No se encontró información sobre tu frecuencia de tinnitus.
            Por favor, completa primero el módulo de búsqueda de frecuencia.
          </p>
          <a href="matching.html" class="btn btn-primary">
            Ir a Búsqueda de Frecuencia
          </a>
        </div>
      </div>
    `;
  }

  /**
   * Show welcome screen with therapy selection
   */
  showWelcomeScreen() {
    const matchData = Storage.getTinnitusMatch();

    this.container.innerHTML = `
      <div class="screen active" id="welcome-screen">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold mb-4">Módulo 3: Tratamiento</h1>
          <p class="text-xl">Terapias Sonoras para Tinnitus</p>
        </div>

        <div class="card mb-6">
          <h3 class="text-xl font-bold mb-3">Tu Frecuencia de Tinnitus</h3>
          <div class="frequency-display">
            <div class="frequency-value">${matchData.frequency} Hz</div>
            <div class="frequency-label">Confianza: ${matchData.confidence}%</div>
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
      ambient: '🌲'
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

          <!-- Play/Pause Control -->
          <div class="play-control mb-4">
            <button id="play-button"
                    class="btn btn-primary btn-lg btn-play"
                    onclick="treatmentUI.togglePlay()">
              <span id="play-icon">▶</span>
              <span id="play-text">Iniciar Sesión</span>
            </button>
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
        <div class="card mb-6">
          <h3 class="font-bold mb-3">Tipo de Ruido</h3>
          <div class="button-group-inline">
            <button class="btn btn-outline active" data-subtype="white" onclick="treatmentUI.selectSubType('white', this)">
              Ruido Blanco
            </button>
            <button class="btn btn-outline" data-subtype="pink" onclick="treatmentUI.selectSubType('pink', this)">
              Ruido Rosa
            </button>
            <button class="btn btn-outline" data-subtype="brown" onclick="treatmentUI.selectSubType('brown', this)">
              Ruido Marrón
            </button>
            <button class="btn btn-outline" data-subtype="narrowband" onclick="treatmentUI.selectSubType('narrowband', this)">
              Banda Estrecha
            </button>
          </div>
        </div>
      `;
    } else if (therapyType === 'ambient') {
      return `
        <div class="card mb-6">
          <h3 class="font-bold mb-3">Sonido Ambiental</h3>
          <div class="button-group-inline">
            <button class="btn btn-outline active" data-subtype="rain" onclick="treatmentUI.selectSubType('rain', this)">
              🌧️ Lluvia
            </button>
            <button class="btn btn-outline" data-subtype="ocean" onclick="treatmentUI.selectSubType('ocean', this)">
              🌊 Océano
            </button>
            <button class="btn btn-outline" data-subtype="wind" onclick="treatmentUI.selectSubType('wind', this)">
              💨 Viento
            </button>
            <button class="btn btn-outline" data-subtype="forest" onclick="treatmentUI.selectSubType('forest', this)">
              🌲 Bosque
            </button>
          </div>
        </div>
      `;
    }
    return '';
  }

  /**
   * Select sub-type for therapy
   */
  selectSubType(subType, button) {
    // Update button states
    const buttons = button.parentElement.querySelectorAll('.btn-outline');
    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // Update engine if playing
    if (this.isPlaying) {
      this.engine.changeSubType(subType);
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

    // Show progress container
    document.getElementById('progress-container').style.display = 'block';

    // Start therapy
    await this.engine.startTherapy(this.currentTherapy, duration);

    this.isPlaying = true;
    this.updatePlayButton();
  }

  /**
   * Stop therapy session
   */
  stopSession() {
    this.engine.stopTherapy();
    this.isPlaying = false;
    this.updatePlayButton();
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
    } else {
      button.classList.remove('btn-danger');
      button.classList.add('btn-primary');
      icon.textContent = '▶';
      text.textContent = 'Iniciar Sesión';
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
    const info = this.engine.getTherapyInfo(therapy);
    const minutes = Math.round(duration / 60);

    const modal = document.createElement('div');
    modal.className = 'modal active';
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
          <button class="btn btn-primary" onclick="treatmentUI.closeModal(); treatmentUI.restartSession();">
            Repetir Sesión
          </button>
          <button class="btn btn-secondary" onclick="treatmentUI.closeModal(); treatmentUI.goBack();">
            Cambiar Terapia
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  /**
   * Close modal
   */
  closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
      modal.remove();
    }
  }

  /**
   * Restart session
   */
  async restartSession() {
    // Reset progress
    document.getElementById('progress-fill').style.width = '0%';
    document.getElementById('progress-percentage').textContent = '0%';
    document.getElementById('time-current').textContent = '0:00';

    // Start new session
    await this.startSession();
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
}

// Initialize on page load
let treatmentUI;

document.addEventListener('DOMContentLoaded', async () => {
  treatmentUI = new TreatmentUI();
  await treatmentUI.initialize();
});
