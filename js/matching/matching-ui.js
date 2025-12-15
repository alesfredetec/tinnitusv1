/**
 * Tinnitus Matching UI Controller
 * Multi-stage frequency search interface
 * Tinnitus MVP - Sprint 4
 */

class TinnitusMatchingUI {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.engine = new TinnitusMatchingEngine();

    // UI state
    this.currentScreen = 'intro'; // 'intro', 'searching', 'complete'
    this.isPlaying = false;
    this.validationTests = [];

    // Bind engine callbacks
    this.setupEngineCallbacks();
  }

  /**
   * Setup callbacks from engine
   */
  setupEngineCallbacks() {
    this.engine.onStageChange = (stage, stageIndex) => {
      this.handleStageChange(stage, stageIndex);
    };

    this.engine.onFrequencyTest = (frequency) => {
      this.updateFrequencyDisplay(frequency);
    };

    this.engine.onComplete = (results) => {
      this.showCompletionScreen(results);
    };
  }

  /**
   * Initialize and start matching
   */
  async start() {
    Logger.info('matching-ui', '🚀 Iniciando módulo de búsqueda de tinnitus');

    // Initialize AudioContext if not ready
    if (!AudioContextManager.isReady()) {
      Logger.info('matching-ui', '🔊 Inicializando AudioContext');
      await AudioContextManager.init();
      await AudioContextManager.resume();
      Logger.success('matching-ui', '✅ AudioContext inicializado');
    }

    // Load audiometry results
    const audiometryData = Storage.getLatestAudiometryResults();

    Logger.debug('matching-ui', 'Datos de audiometría cargados:', audiometryData);

    if (!audiometryData) {
      Logger.warn('matching-ui', 'No se encontraron datos de audiometría');
      this.showNoAudiometryWarning();
      return;
    }

    Logger.success('matching-ui', 'Datos de audiometría encontrados');
    Logger.debug('matching-ui', 'Problem frequencies:', audiometryData.problemFrequencies);

    // Initialize engine
    await this.engine.initialize(audiometryData);

    // Show first stage
    this.currentScreen = 'searching';
    Logger.info('matching-ui', 'Mostrando pantalla de búsqueda');
    this.render();
  }

  /**
   * Show warning if no audiometry data
   */
  showNoAudiometryWarning() {
    Logger.warn('matching-ui', 'Mostrando advertencia: audiometría requerida');

    this.container.innerHTML = `
      <div class="card">
        <h2 class="mb-4">⚠️ Audiometría Requerida</h2>

        <div class="alert alert-warning mb-6">
          <strong>No se encontraron resultados de audiometría.</strong>
          <p class="mt-2">Para una búsqueda más precisa de tu tinnitus, primero debes completar la audiometría.</p>
        </div>

        <div class="mb-6">
          <p>La audiometría nos ayuda a:</p>
          <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
            <li>Identificar frecuencias problema</li>
            <li>Sugerir rangos de búsqueda</li>
            <li>Personalizar el tratamiento</li>
          </ul>
        </div>

        <div class="flex gap-4">
          <a href="audiometry.html" class="btn btn-primary flex-1">
            Realizar Audiometría Primero
          </a>
          <button class="btn btn-secondary flex-1" onclick="matchingUI.startWithoutAudiometry()">
            Continuar Sin Audiometría
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Start without audiometry data
   */
  async startWithoutAudiometry() {
    // Initialize AudioContext if not ready
    if (!AudioContextManager.isReady()) {
      Logger.info('matching-ui', '🔊 Inicializando AudioContext');
      await AudioContextManager.init();
      await AudioContextManager.resume();
      Logger.success('matching-ui', '✅ AudioContext inicializado');
    }

    await this.engine.initialize(null);
    this.currentScreen = 'searching';
    this.render();
  }

  /**
   * Render current screen
   */
  render() {
    if (this.currentScreen === 'searching') {
      this.renderSearchingScreen();
    }
  }

  /**
   * Render searching screen (main)
   */
  renderSearchingScreen() {
    const stage = this.engine.currentStage;

    switch (stage) {
      case 'range-selection':
        this.renderRangeSelection();
        break;
      case 'coarse':
        this.renderCoarseSearch();
        break;
      case 'refinement':
        this.renderRefinement();
        break;
      case 'fine-tuning':
        this.renderFineTuning();
        break;
      case 'validation':
        this.renderValidation();
        break;
      case 'mml':
        this.renderMML();
        break;
    }
  }

  /**
   * Stage 1: Range Selection
   */
  renderRangeSelection() {
    const ranges = this.engine.suggestedRanges;
    const progress = this.engine.getProgress();

    this.container.innerHTML = `
      <div class="matching-container">
        <!-- Progress -->
        ${this.renderProgressBar(progress)}

        <!-- Main Card -->
        <div class="card">
          <h2 class="mb-4">Etapa 1: Selección de Rango</h2>

          <div class="alert alert-info mb-6">
            Basándonos en tu audiometría, te sugerimos estos rangos de frecuencia para buscar tu tinnitus:
          </div>

          <!-- Suggested Ranges -->
          <div class="ranges-list mb-6">
            ${ranges.map((range, index) => `
              <div class="range-card ${range.priority === 'high' ? 'priority-high' : ''}"
                   onclick="matchingUI.selectRange(${index})">
                <div class="range-header">
                  <div class="range-title">
                    ${range.min} - ${range.max} Hz
                    ${range.priority === 'high' ? '<span class="badge badge-warning">Recomendado</span>' : ''}
                  </div>
                  <div class="range-center">${range.center} Hz centro</div>
                </div>
                <div class="range-reason">${range.reason}</div>
                ${range.ear ? `<div class="range-ear">Oído: ${range.ear === 'left' ? 'Izquierdo' : 'Derecho'}</div>` : ''}
              </div>
            `).join('')}
          </div>

          <div class="text-center text-sm text-secondary">
            Selecciona el rango que quieres explorar primero
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Stage 2: Coarse Search
   */
  renderCoarseSearch() {
    const progress = this.engine.getProgress();
    const matches = this.engine.coarseMatches;

    this.container.innerHTML = `
      <div class="matching-container">
        ${this.renderProgressBar(progress)}

        <div class="card">
          <h2 class="mb-4">Etapa 2: Búsqueda Gruesa</h2>

          <div class="alert alert-info mb-6">
            Escucha cada frecuencia y califica qué tan similar es a tu tinnitus usando las estrellas (⭐).
          </div>

          <!-- Frequency List -->
          <div class="frequency-list mb-6">
            ${matches.map(match => `
              <div class="frequency-item ${match.tested ? 'tested' : ''}">
                <div class="freq-label">${match.frequency} Hz</div>
                <button class="btn btn-secondary btn-sm"
                        onclick="matchingUI.playFrequency(${match.frequency})">
                  ▶ Reproducir
                </button>
                <div class="star-rating">
                  ${[1, 2, 3, 4, 5].map(star => `
                    <span class="star ${match.rating >= star ? 'filled' : ''}"
                          onclick="matchingUI.rateFrequency(${match.frequency}, ${star})">
                      ★
                    </span>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>

          <div class="alert alert-warning mb-6">
            <strong>Consejo:</strong> Reproduce cada tono varias veces y compara mentalmente con tu tinnitus.
          </div>

          <div class="flex gap-4">
            <button class="btn btn-secondary flex-1" onclick="matchingUI.goBack()">
              ← Anterior
            </button>
            <button class="btn btn-primary flex-1"
                    onclick="matchingUI.completeCoarse()"
                    ${!this.allCoarseTested() ? 'disabled' : ''}>
              Continuar →
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Stage 3: Refinement with Slider
   */
  renderRefinement() {
    const progress = this.engine.getProgress();
    const freq = this.engine.currentFrequency;
    const range = this.engine.selectedRange;

    this.container.innerHTML = `
      <div class="matching-container">
        ${this.renderProgressBar(progress)}

        <div class="card">
          <h2 class="mb-4">Etapa 3: Refinamiento</h2>

          <div class="alert alert-info mb-6">
            Usa el control deslizante para ajustar la frecuencia hasta que coincida exactamente con tu tinnitus.
          </div>

          <!-- Frequency Display -->
          <div class="frequency-display mb-6">
            <div class="frequency-value">${freq} Hz</div>
          </div>

          <!-- Main Slider -->
          <div class="slider-container mb-6">
            <div class="slider-labels mb-2">
              <span>${range.min} Hz</span>
              <span>${range.max} Hz</span>
            </div>
            <input type="range"
                   id="freq-slider"
                   class="freq-slider"
                   min="${range.min}"
                   max="${range.max}"
                   value="${freq}"
                   step="10"
                   oninput="matchingUI.updateSlider(this.value)">
          </div>

          <!-- Fine Controls -->
          <div class="fine-controls mb-6">
            <button class="btn btn-secondary" onclick="matchingUI.adjustFreq(-100)">◀◀ -100</button>
            <button class="btn btn-secondary" onclick="matchingUI.adjustFreq(-25)">◀ -25</button>
            <button class="btn btn-secondary" onclick="matchingUI.adjustFreq(-10)">◀ -10</button>
            <button class="btn btn-primary" onclick="matchingUI.playCurrentFreq()">▶ PLAY</button>
            <button class="btn btn-secondary" onclick="matchingUI.adjustFreq(10)">+10 ▶</button>
            <button class="btn btn-secondary" onclick="matchingUI.adjustFreq(25)">+25 ▶</button>
            <button class="btn btn-secondary" onclick="matchingUI.adjustFreq(100)">+100 ▶▶</button>
          </div>

          <!-- Volume Control -->
          <div class="volume-control mb-6">
            <label class="block mb-2 font-medium">Volumen</label>
            <input type="range"
                   id="volume-slider"
                   class="w-full"
                   min="0"
                   max="100"
                   value="${this.engine.volume * 100}"
                   oninput="matchingUI.updateVolume(this.value)">
          </div>

          <!-- Wave Type -->
          <div class="wave-type mb-6">
            <label class="block mb-2 font-medium">Tipo de Onda</label>
            <div class="flex gap-2">
              <button class="btn btn-sm ${this.engine.waveType === 'sine' ? 'btn-primary' : 'btn-secondary'}"
                      onclick="matchingUI.setWaveType('sine')">
                Tono Puro
              </button>
              <button class="btn btn-sm ${this.engine.waveType === 'square' ? 'btn-primary' : 'btn-secondary'}"
                      onclick="matchingUI.setWaveType('square')">
                Cuadrada
              </button>
              <button class="btn btn-sm ${this.engine.waveType === 'sawtooth' ? 'btn-primary' : 'btn-secondary'}"
                      onclick="matchingUI.setWaveType('sawtooth')">
                Sierra
              </button>
            </div>
          </div>

          <div class="flex gap-4">
            <button class="btn btn-secondary flex-1" onclick="matchingUI.goBack()">
              ← Anterior
            </button>
            <button class="btn btn-primary flex-1" onclick="matchingUI.confirmRefinement()">
              Esta es mi Frecuencia →
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Stage 4: Fine Tuning
   */
  renderFineTuning() {
    const progress = this.engine.getProgress();
    const freq = this.engine.currentFrequency;
    const min = freq - 100;
    const max = freq + 100;

    this.container.innerHTML = `
      <div class="matching-container">
        ${this.renderProgressBar(progress)}

        <div class="card">
          <h2 class="mb-4">Etapa 4: Ajuste Fino</h2>

          <div class="alert alert-info mb-6">
            Último ajuste fino. Usa los controles para ajustar en pasos de 25 Hz o 10 Hz.
          </div>

          <!-- Frequency Display -->
          <div class="frequency-display mb-6">
            <div class="frequency-value">${freq} Hz</div>
            <div class="frequency-range text-sm text-secondary">${min} - ${max} Hz</div>
          </div>

          <!-- Zoom Slider -->
          <div class="slider-container mb-6">
            <div class="slider-labels mb-2">
              <span>${min} Hz</span>
              <span>${max} Hz</span>
            </div>
            <input type="range"
                   id="fine-slider"
                   class="freq-slider"
                   min="${min}"
                   max="${max}"
                   value="${freq}"
                   step="5"
                   oninput="matchingUI.updateSlider(this.value)">
          </div>

          <!-- Fine Controls -->
          <div class="fine-controls mb-6">
            <button class="btn btn-secondary" onclick="matchingUI.adjustFreq(-25)">◀ -25</button>
            <button class="btn btn-secondary" onclick="matchingUI.adjustFreq(-10)">◀ -10</button>
            <button class="btn btn-secondary" onclick="matchingUI.adjustFreq(-5)">◀ -5</button>
            <button class="btn btn-primary" onclick="matchingUI.playCurrentFreq()">▶ PLAY</button>
            <button class="btn btn-secondary" onclick="matchingUI.adjustFreq(5)">+5 ▶</button>
            <button class="btn btn-secondary" onclick="matchingUI.adjustFreq(10)">+10 ▶</button>
            <button class="btn btn-secondary" onclick="matchingUI.adjustFreq(25)">+25 ▶</button>
          </div>

          <div class="flex gap-4">
            <button class="btn btn-secondary flex-1" onclick="matchingUI.goBack()">
              ← Anterior
            </button>
            <button class="btn btn-primary flex-1" onclick="matchingUI.completeFineTuning()">
              Confirmar Frecuencia →
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Stage 5: A/B Validation
   */
  renderValidation() {
    const progress = this.engine.getProgress();
    this.validationTests = this.engine.generateValidationTests();

    this.container.innerHTML = `
      <div class="matching-container">
        ${this.renderProgressBar(progress)}

        <div class="card">
          <h2 class="mb-4">Etapa 5: Validación</h2>

          <div class="alert alert-info mb-6">
            Prueba final. Escucha cada par de sonidos y selecciona cuál coincide mejor con tu tinnitus.
          </div>

          <!-- Validation Tests -->
          <div id="validation-tests">
            ${this.validationTests.map((test, index) => `
              <div class="validation-test mb-6" id="test-${test.id}">
                <h3 class="mb-3">Test ${index + 1} de ${this.validationTests.length}</h3>

                <div class="test-sounds flex gap-4 mb-4">
                  <div class="sound-option flex-1">
                    <button class="btn btn-secondary w-full mb-2"
                            onclick="matchingUI.playValidationSound('${test.id}', 'A', ${test.soundA})">
                      ▶ Reproducir Sonido A
                    </button>
                    <button class="btn btn-outline w-full"
                            onclick="matchingUI.selectValidationAnswer('${test.id}', 'A')">
                      Seleccionar A
                    </button>
                  </div>

                  <div class="sound-option flex-1">
                    <button class="btn btn-secondary w-full mb-2"
                            onclick="matchingUI.playValidationSound('${test.id}', 'B', ${test.soundB})">
                      ▶ Reproducir Sonido B
                    </button>
                    <button class="btn btn-outline w-full"
                            onclick="matchingUI.selectValidationAnswer('${test.id}', 'B')">
                      Seleccionar B
                    </button>
                  </div>
                </div>

                <div class="test-result" id="result-${test.id}" style="display: none;"></div>
              </div>
            `).join('')}
          </div>

          <button class="btn btn-primary w-full"
                  id="complete-btn"
                  onclick="matchingUI.completeValidation()"
                  style="display: none;">
            Completar Búsqueda ✓
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Stage 6: MML (Minimum Masking Level)
   */
  renderMML() {
    const progress = this.engine.getProgress();
    const currentLevel = this.engine.mmlLevel;
    const frequency = this.engine.matchedFrequency;

    this.container.innerHTML = `
      <div class="matching-container">
        ${this.renderProgressBar(progress)}

        <div class="card">
          <h2 class="mb-4">Etapa 6: Nivel Mínimo de Enmascaramiento (MML)</h2>

          <div class="alert alert-info mb-6">
            Ahora mediremos el nivel mínimo de ruido que enmascara (oculta) tu tinnitus.
            Este dato es importante para determinar la severidad y planificar el tratamiento.
          </div>

          <!-- Frequency Display -->
          <div class="mb-6 text-center">
            <div class="text-sm text-secondary mb-2">Frecuencia de tu tinnitus:</div>
            <div class="text-3xl font-bold text-primary">${frequency} Hz</div>
          </div>

          <!-- Current MML Level -->
          <div class="mb-6 p-4 bg-light rounded">
            <div class="text-center mb-2">
              <div class="text-sm text-secondary mb-2">Nivel actual de enmascaramiento:</div>
              <div class="text-4xl font-bold ${currentLevel >= 0 ? 'text-success' : 'text-warning'}">
                ${currentLevel > 0 ? '+' : ''}${currentLevel} dB
              </div>
            </div>
          </div>

          <!-- Instructions -->
          <div class="alert alert-warning mb-6">
            <strong>Instrucciones:</strong>
            <ol style="margin-left: 1.5rem; margin-top: 0.5rem;">
              <li>Presiona "Reproducir Enmascarador" para escuchar el ruido</li>
              <li>Si todavía escuchas tu tinnitus, aumenta el nivel</li>
              <li>Si ya no escuchas tu tinnitus, confirma el nivel</li>
              <li>Puedes ajustar el nivel hacia arriba o abajo según necesites</li>
            </ol>
          </div>

          <!-- Controls -->
          <div class="flex flex-col gap-4 mb-6">
            <!-- Play Button -->
            <button class="btn btn-primary btn-lg w-full"
                    onclick="matchingUI.playMasker()"
                    ${this.isPlaying ? 'disabled' : ''}>
              ${this.isPlaying ? '🔊 Reproduciendo...' : '▶ Reproducir Enmascarador'}
            </button>

            <!-- Level Adjustment -->
            <div class="flex gap-4">
              <button class="btn btn-secondary flex-1"
                      onclick="matchingUI.decreaseMMLLevel()"
                      ${this.isPlaying ? 'disabled' : ''}>
                ⬇ Disminuir (-5 dB)
              </button>
              <button class="btn btn-secondary flex-1"
                      onclick="matchingUI.increaseMMLLevel()"
                      ${this.isPlaying ? 'disabled' : ''}>
                ⬆ Aumentar (+5 dB)
              </button>
            </div>

            <!-- Confirm/Skip -->
            <div class="flex gap-4">
              <button class="btn btn-success flex-1"
                      onclick="matchingUI.confirmMasking()">
                ✓ Confirmar Enmascaramiento
              </button>
              <button class="btn btn-outline flex-1"
                      onclick="matchingUI.skipMML()">
                ⏭ Omitir MML
              </button>
            </div>
          </div>

          <!-- Info -->
          <div class="text-sm text-secondary text-center">
            El MML ayuda a determinar la severidad del tinnitus y personalizar el tratamiento.
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Show completion screen
   */
  showCompletionScreen(results) {
    const confidence = results.confidence;
    const confidenceClass = confidence >= 80 ? 'badge-success' : confidence >= 60 ? 'badge-info' : 'badge-warning';

    this.container.innerHTML = `
      <div class="card">
        <h2 class="mb-4">✅ Frecuencia de Tinnitus Identificada</h2>

        <div class="results-summary mb-6">
          <div class="result-main">
            <div class="result-frequency">${results.frequency} Hz</div>
            <div class="badge ${confidenceClass}">
              Confianza: ${results.confidence}%
            </div>
          </div>

          <div class="result-details mt-4">
            <div class="detail-item">
              <strong>Tipo de onda:</strong> ${this.getWaveTypeLabel(results.waveType)}
            </div>
            <div class="detail-item">
              <strong>Volumen relativo:</strong> ${Math.round(results.volume * 100)}%
            </div>
            <div class="detail-item">
              <strong>Pruebas de validación:</strong> ${results.validationScore}
            </div>
            ${results.ear !== 'both' ? `
              <div class="detail-item">
                <strong>Oído:</strong> ${results.ear === 'left' ? 'Izquierdo' : 'Derecho'}
              </div>
            ` : ''}
            ${results.mml && !results.mml.skipped ? `
              <div class="detail-item">
                <strong>MML (Nivel Mínimo de Enmascaramiento):</strong> ${results.mml.level > 0 ? '+' : ''}${results.mml.level} dB
              </div>
            ` : ''}
          </div>
        </div>

        <div class="alert alert-success mb-6">
          <strong>¡Excelente!</strong> Hemos identificado tu frecuencia de tinnitus. Ahora puedes proceder al tratamiento personalizado.
        </div>

        <!-- Test Frequency -->
        <div class="mb-6">
          <button class="btn btn-secondary w-full" onclick="matchingUI.playResultFrequency()">
            ▶ Escuchar Frecuencia Identificada
          </button>
        </div>

        <div class="flex gap-4">
          <button class="btn btn-secondary flex-1" onclick="matchingUI.restart()">
            🔄 Buscar de Nuevo
          </button>
          <a href="treatment.html" class="btn btn-primary flex-1">
            Continuar a Tratamiento →
          </a>
        </div>
      </div>
    `;
  }

  /**
   * Render progress bar
   */
  renderProgressBar(progress) {
    const stageNames = {
      'range-selection': 'Selección de Rango',
      'coarse': 'Búsqueda Gruesa',
      'refinement': 'Refinamiento',
      'fine-tuning': 'Ajuste Fino',
      'validation': 'Validación'
    };

    return `
      <div class="card mb-4">
        <div class="mb-2 text-center">
          <strong>${stageNames[progress.stage]}</strong>
          <span class="text-secondary ml-2">(Paso ${progress.stageIndex + 1} de ${progress.totalStages})</span>
        </div>
        <div class="progress-container">
          <div class="progress-bar" style="width: ${progress.percentage}%"></div>
        </div>
        <div class="flex justify-between text-sm text-secondary mt-2">
          <span>${progress.percentage}% completo</span>
          ${progress.currentFrequency ? `<span>${progress.currentFrequency} Hz</span>` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Handle stage change
   */
  handleStageChange(stage, stageIndex) {
    console.log('Stage changed:', stage);
    this.render();
  }

  /**
   * Select a range
   */
  selectRange(index) {
    const range = this.engine.suggestedRanges[index];
    this.engine.selectRange(range);
    this.render();
  }

  /**
   * Play a frequency
   */
  async playFrequency(frequency) {
    await this.engine.testFrequency(frequency, 2);
  }

  /**
   * Rate a frequency
   */
  rateFrequency(frequency, rating) {
    this.engine.rateFrequency(frequency, rating);
    this.render();
  }

  /**
   * Check if all coarse tests are done
   */
  allCoarseTested() {
    return this.engine.coarseMatches.every(m => m.tested);
  }

  /**
   * Complete coarse search
   */
  completeCoarse() {
    if (this.engine.completeCoarseSearch()) {
      this.render();
    } else {
      alert('Por favor, prueba y califica todas las frecuencias antes de continuar.');
    }
  }

  /**
   * Update slider
   */
  updateSlider(value) {
    this.engine.setFrequency(parseFloat(value));
    document.querySelector('.frequency-value').textContent = `${this.engine.currentFrequency} Hz`;
  }

  /**
   * Adjust frequency
   */
  adjustFreq(delta) {
    const newFreq = this.engine.adjustFrequency(delta);
    const slider = document.getElementById('freq-slider') || document.getElementById('fine-slider');
    if (slider) {
      slider.value = newFreq;
    }
    document.querySelector('.frequency-value').textContent = `${newFreq} Hz`;
  }

  /**
   * Play current frequency
   */
  async playCurrentFreq() {
    await this.engine.testFrequency(this.engine.currentFrequency, 2);
  }

  /**
   * Update volume
   */
  updateVolume(value) {
    this.engine.setVolume(value / 100);
  }

  /**
   * Set wave type
   */
  setWaveType(type) {
    this.engine.setWaveType(type);
    this.render();
  }

  /**
   * Confirm refinement
   */
  confirmRefinement() {
    this.engine.confirmRefinement();
    this.render();
  }

  /**
   * Complete fine tuning
   */
  completeFineTuning() {
    this.validationTests = this.engine.completeFineTuning();
    this.render();
  }

  /**
   * Play validation sound
   */
  async playValidationSound(testId, sound, frequency) {
    await this.engine.testFrequency(frequency, 2);
  }

  /**
   * Select validation answer
   */
  selectValidationAnswer(testId, answer) {
    const correct = this.engine.processValidationAnswer(testId, answer);

    const resultDiv = document.getElementById(`result-${testId}`);
    resultDiv.style.display = 'block';
    resultDiv.className = `test-result alert ${correct ? 'alert-success' : 'alert-danger'}`;
    resultDiv.textContent = correct ? '✓ Correcto' : '✗ Incorrecto';

    // Check if all tests completed
    const allCompleted = this.validationTests.every(t => t.answered);
    if (allCompleted) {
      document.getElementById('complete-btn').style.display = 'block';
    }
  }

  /**
   * Complete validation
   */
  completeValidation() {
    this.engine.complete();
  }

  /**
   * Play masker noise for MML testing
   */
  async playMasker() {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.renderMML(); // Re-render to update button state

    try {
      await this.engine.playMasker();
    } catch (error) {
      Logger.error('matching-ui', 'Error playing masker:', error);
    } finally {
      this.isPlaying = false;
      this.renderMML(); // Re-render to update button state
    }
  }

  /**
   * Increase MML level
   */
  increaseMMLLevel() {
    this.engine.increaseMMLLevel();
    this.renderMML();
  }

  /**
   * Decrease MML level
   */
  decreaseMMLLevel() {
    this.engine.decreaseMMLLevel();
    this.renderMML();
  }

  /**
   * Confirm masking level
   */
  confirmMasking() {
    Logger.info('matching-ui', '✅ Usuario confirmó nivel de enmascaramiento');
    this.engine.confirmMasking();
  }

  /**
   * Skip MML testing
   */
  skipMML() {
    Logger.info('matching-ui', '⏭️ Usuario omitió MML');
    this.engine.skipMML();
  }

  /**
   * Play result frequency
   */
  async playResultFrequency() {
    const result = this.engine.finalMatch;
    await AudioContextManager.playTone(result.frequency, 3, result.volume, result.waveType);
  }

  /**
   * Go back
   */
  goBack() {
    this.engine.goBack();
    this.render();
  }

  /**
   * Restart
   */
  restart() {
    this.engine.restart();
    this.render();
  }

  /**
   * Get wave type label
   */
  getWaveTypeLabel(type) {
    const labels = {
      'sine': 'Tono Puro',
      'square': 'Onda Cuadrada',
      'sawtooth': 'Onda Sierra',
      'triangle': 'Onda Triangular'
    };
    return labels[type] || type;
  }

  /**
   * Update frequency display
   */
  updateFrequencyDisplay(frequency) {
    const display = document.querySelector('.frequency-value');
    if (display) {
      display.textContent = `${frequency} Hz`;
    }
  }
}

// Global instance
let matchingUI = null;

// Initialize on DOM ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('matching-container');
    if (container) {
      matchingUI = new TinnitusMatchingUI('matching-container');

      // Auto-start if coming from audiometry
      const autoStart = new URLSearchParams(window.location.search).get('autostart');
      if (autoStart === 'true') {
        matchingUI.start();
      } else {
        // Show intro
        matchingUI.showNoAudiometryWarning();
      }
    }
  });
}
