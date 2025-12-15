/**
 * Audiometry UI Controller
 * Manages the user interface for audiometry testing
 * Tinnitus MVP - Sprint 2
 */

class AudiometryUI {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.engine = new AudiometryEngine();

    // UI state
    this.currentScreen = 'welcome'; // 'welcome', 'calibration', 'testing', 'results'
    this.isCalibrated = false;

    // Bind engine callbacks
    this.setupEngineCallbacks();

    // Render initial screen
    this.render();
  }

  /**
   * Setup callbacks from engine
   */
  setupEngineCallbacks() {
    this.engine.onTonePresented = (frequency, ear, level) => {
      this.updateTestingDisplay(frequency, ear, level, 'listening');
    };

    this.engine.onResponseRequired = (type) => {
      if (type === 'tone') {
        this.enableResponseButton();
      } else if (type === 'catch') {
        // Catch trial - button should be enabled but no tone played
        this.enableResponseButton();
      }
    };

    this.engine.onThresholdFound = (frequency, ear, threshold) => {
      this.showThresholdFeedback(frequency, ear, threshold);
    };

    this.engine.onProgress = (completed, total, currentFreq, currentEar) => {
      this.updateProgress(completed, total, currentFreq, currentEar);
    };

    this.engine.onStageChange = (stage, problemCount, completed) => {
      this.showStageTransition(stage, problemCount);
    };

    this.engine.onTestComplete = (results, analysis) => {
      this.showResults(results, analysis);
    };
  }

  /**
   * Render current screen
   */
  render() {
    switch (this.currentScreen) {
      case 'welcome':
        this.renderWelcomeScreen();
        break;
      case 'calibration':
        this.renderCalibrationScreen();
        break;
      case 'testing':
        this.renderTestingScreen();
        break;
      case 'results':
        this.renderResultsScreen();
        break;
    }
  }

  /**
   * Welcome screen
   */
  renderWelcomeScreen() {
    this.container.innerHTML = `
      <div class="audiometry-welcome card">
        <h2 class="mb-4">🎧 Audiometría Adaptativa</h2>

        <div class="alert alert-info mb-6">
          <strong>Sistema de 2 Etapas:</strong>
          <ul class="mt-2" style="margin-left: 1.5rem;">
            <li><strong>Etapa 1:</strong> Audiometría estándar (13 frecuencias)</li>
            <li><strong>Etapa 2:</strong> Micro-audiometría automática en áreas problema (4000-7000 Hz)</li>
          </ul>
        </div>

        <div class="mb-6">
          <h3 class="mb-3">⏱️ Duración estimada</h3>
          <ul style="margin-left: 1.5rem;">
            <li>Etapa 1: 10-15 minutos</li>
            <li>Etapa 2: 5-10 minutos (si se detectan problemas)</li>
          </ul>
        </div>

        <div class="mb-6">
          <h3 class="mb-3">📋 Instrucciones</h3>
          <ol style="margin-left: 1.5rem;">
            <li>Encuentra un lugar tranquilo sin ruido ambiente</li>
            <li>Usa <strong>auriculares de buena calidad</strong></li>
            <li>Ajusta el volumen a un nivel cómodo (calibración)</li>
            <li>Presiona el botón cuando escuches un tono</li>
            <li>NO presiones si no escuchas nada</li>
          </ol>
        </div>

        <div class="alert alert-warning mb-6">
          <strong>⚠️ Importante:</strong> Esta prueba NO sustituye una evaluación médica profesional.
        </div>

        <div class="button-group">
          <button class="btn btn-primary btn-lg" onclick="audiometryUI.startCalibration()">
            Comenzar Calibración
          </button>

          <button class="btn btn-warning btn-lg" onclick="audiometryUI.loadTestData()">
            🧪 Modo Test/Debug
          </button>
        </div>

        <div class="alert alert-info mt-4" style="background: #e7f3ff; border-color: #2196F3;">
          <strong>🔧 Modo Test:</strong> Genera datos simulados con problema en <strong>4050 Hz (oído izquierdo)</strong> para evaluar el sistema sin realizar audiometría real.
        </div>
      </div>
    `;
  }

  /**
   * Calibration screen
   */
  renderCalibrationScreen() {
    this.container.innerHTML = `
      <div class="audiometry-calibration card">
        <h2 class="mb-4">🔊 Calibración de Volumen</h2>

        <div class="alert alert-info mb-6">
          Escucharás un tono de prueba a 1000 Hz. Ajusta el volumen hasta que sea:
          <ul class="mt-2" style="margin-left: 1.5rem;">
            <li>✓ Claramente audible</li>
            <li>✓ Cómodo (no muy alto ni muy bajo)</li>
            <li>✗ No debe causar molestia</li>
          </ul>
        </div>

        <div class="mb-6 text-center">
          <div class="mb-4">
            <label class="block mb-2 font-medium">Volumen del Sistema</label>
            <input type="range" id="calibration-volume" min="0" max="100" value="50"
                   class="w-full" style="max-width: 400px;">
            <div id="volume-display" class="mt-2 text-lg font-bold">50%</div>
          </div>

          <button class="btn btn-secondary mb-2" onclick="audiometryUI.playCalibrationTone()">
            🔊 Reproducir Tono de Prueba
          </button>

          <div class="text-sm text-secondary mt-2">
            Tono: 1000 Hz • Duración: 2 segundos
          </div>
        </div>

        <div class="alert alert-warning mb-6">
          <strong>Consejo:</strong> Empieza con volumen bajo y súbelo gradualmente hasta que sea cómodo.
        </div>

        <div class="flex gap-4">
          <button class="btn btn-secondary flex-1" onclick="audiometryUI.showWelcome()">
            ← Volver
          </button>
          <button class="btn btn-primary flex-1" onclick="audiometryUI.confirmCalibration()">
            Calibración Correcta →
          </button>
        </div>
      </div>
    `;

    // Setup volume slider
    const volumeSlider = document.getElementById('calibration-volume');
    const volumeDisplay = document.getElementById('volume-display');

    volumeSlider.addEventListener('input', (e) => {
      const value = e.target.value;
      volumeDisplay.textContent = `${value}%`;
      AudioContextManager.setMasterVolume(value / 100);
    });
  }

  /**
   * Testing screen
   */
  renderTestingScreen() {
    this.container.innerHTML = `
      <div class="audiometry-testing">
        <!-- Progress Bar -->
        <div class="card mb-4">
          <div id="stage-indicator" class="mb-3 text-center">
            <span class="badge badge-primary">Etapa 1: Audiometría Estándar</span>
          </div>

          <div class="progress-container mb-2">
            <div id="progress-bar" class="progress-bar" style="width: 0%"></div>
          </div>

          <div class="flex justify-between text-sm text-secondary">
            <span id="progress-text">0 / 26 tests</span>
            <span id="progress-percentage">0%</span>
          </div>
        </div>

        <!-- Testing Display -->
        <div class="card mb-4">
          <div class="text-center mb-4">
            <div id="frequency-display" class="text-4xl font-bold mb-2">
              ----
            </div>
            <div id="ear-display" class="text-lg text-secondary mb-4">
              Preparando...
            </div>
            <div id="level-display" class="text-sm text-secondary">
              --
            </div>
          </div>

          <div id="status-display" class="text-center mb-4 p-4 bg-gray-100 rounded">
            <div class="text-lg">🎧 Coloca tus auriculares</div>
            <div class="text-sm text-secondary mt-2">La prueba comenzará en breve...</div>
          </div>

          <!-- Response Buttons -->
          <div id="response-buttons" class="grid grid-cols-2 gap-4">
            <button
              id="response-yes-btn"
              class="btn btn-success btn-lg"
              style="min-height: 80px; font-size: 1.1rem;"
              disabled
              onclick="audiometryUI.handleResponseYes()">
              ✓ SÍ<br>
              <span style="font-size: 0.8rem; opacity: 0.9;">Escuché</span>
            </button>
            <button
              id="response-no-btn"
              class="btn btn-warning btn-lg"
              style="min-height: 80px; font-size: 1.1rem;"
              disabled
              onclick="audiometryUI.handleResponseNo()">
              ✗ NO<br>
              <span style="font-size: 0.8rem; opacity: 0.9;">No escuché</span>
            </button>
          </div>

          <div class="text-center text-sm text-secondary mt-3">
            <strong>Teclado:</strong> <kbd style="background: #e5e7eb; padding: 0.25rem 0.5rem; border-radius: 4px;">ESPACIO</kbd> = SÍ |
            <kbd style="background: #e5e7eb; padding: 0.25rem 0.5rem; border-radius: 4px;">N</kbd> = NO
          </div>
        </div>

        <!-- Controls -->
        <div class="card">
          <div class="flex gap-3">
            <button class="btn btn-secondary flex-1" onclick="audiometryUI.pauseTest()">
              ⏸ Pausar
            </button>
            <button class="btn btn-secondary flex-1" onclick="audiometryUI.stopTest()">
              ⏹ Detener
            </button>
          </div>
        </div>

        <!-- Micro-audiometry indicator -->
        <div id="micro-indicator" class="card mt-4" style="display: none;">
          <div class="alert alert-info">
            <strong>🔍 Micro-audiometría activada</strong>
            <p class="mt-2 text-sm">Se detectaron frecuencias problema. Realizando escaneo fino con pasos de 100 Hz...</p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Results screen
   */
  renderResultsScreen() {
    this.container.innerHTML = `
      <div class="audiometry-results">
        <div class="card mb-4">
          <h2 class="mb-4">✅ Audiometría Completada</h2>

          <!-- Test Mode Indicator -->
          <div id="test-mode-indicator"></div>

          <div id="results-summary" class="mb-6">
            <!-- Will be populated with results -->
          </div>

          <!-- Interactive Audiogram with Plotly.js -->
          <div class="mb-6">
            <div class="flex justify-between items-center mb-3">
              <h3>📊 Audiograma Interactivo</h3>
            </div>
            <div class="bg-white p-4 rounded border">
              <!-- Plotly div (replaced canvas) -->
              <div id="audiogram-canvas" style="width: 100%; height: 500px;"></div>
            </div>

            <!-- Interactive Instructions -->
            <div class="alert alert-info mt-3" style="font-size: 0.9rem;">
              <strong>💡 Controles Interactivos:</strong>
              <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                <li><strong>Zoom:</strong> Arrastra un rectángulo sobre el gráfico para hacer zoom en esa zona</li>
                <li><strong>Pan:</strong> Después de zoom, arrastra para mover el gráfico</li>
                <li><strong>Reset:</strong> Doble-click o botón "Reset axes" (arriba derecha) para vista completa</li>
                <li><strong>Valores:</strong> Pasa el mouse sobre puntos para ver valores exactos</li>
                <li><strong>Descargar:</strong> Usa botón de cámara 📷 para exportar como PNG</li>
              </ul>
            </div>
          </div>

          <!-- Detailed Report -->
          <div id="detailed-report" class="mb-6"></div>

          <!-- Problem Frequencies -->
          <div id="problem-frequencies-section" style="display: none;">
            <h3 class="mb-3">⚠️ Frecuencias con Pérdida Auditiva</h3>
            <div id="problem-frequencies-list"></div>
          </div>

          <!-- Recommendations -->
          <div id="recommendations-section"></div>

          <div class="flex gap-3 mt-6">
            <button class="btn btn-secondary flex-1" onclick="audiometryUI.downloadResults()">
              💾 Descargar Resultados
            </button>
            <a href="matching.html" class="btn btn-primary flex-1" style="text-align: center; line-height: 2.5;">
              Continuar a Búsqueda de Tinnitus →
            </a>
          </div>

          <button class="btn btn-secondary w-full mt-3" onclick="audiometryUI.restart()">
            🔄 Realizar Nueva Audiometría
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Start calibration
   */
  async startCalibration() {
    if (!AudioContextManager.isReady()) {
      await AudioContextManager.init();
    }
    this.currentScreen = 'calibration';
    this.render();
  }

  /**
   * Play calibration tone
   */
  async playCalibrationTone() {
    await AudioContextManager.playTone(1000, 2, 0.3);
  }

  /**
   * Confirm calibration and start test
   */
  async confirmCalibration() {
    this.isCalibrated = true;
    this.currentScreen = 'testing';
    this.render();

    // Setup keyboard shortcuts for responses
    this.setupKeyboardShortcuts();
    Logger.info('audiometry-ui', '⌨️ Atajos de teclado activados');

    // Wait a bit then start
    await Utils.sleep(1000);
    this.engine.start();
  }

  /**
   * Update testing display
   */
  updateTestingDisplay(frequency, ear, level, state) {
    const freqDisplay = document.getElementById('frequency-display');
    const earDisplay = document.getElementById('ear-display');
    const levelDisplay = document.getElementById('level-display');
    const statusDisplay = document.getElementById('status-display');

    if (freqDisplay) {
      freqDisplay.textContent = `${frequency} Hz`;
      earDisplay.textContent = `Oído ${ear === 'left' ? 'Izquierdo' : 'Derecho'}`;
      levelDisplay.textContent = `Nivel: ${level} dB HL`;

      if (state === 'listening') {
        statusDisplay.innerHTML = `
          <div class="text-lg">🎵 Escuchando...</div>
          <div class="text-sm text-secondary mt-2">¿Puedes oír el tono?</div>
        `;
      }
    }
  }

  /**
   * Enable response buttons
   */
  enableResponseButton() {
    const yesBtn = document.getElementById('response-yes-btn');
    const noBtn = document.getElementById('response-no-btn');

    if (yesBtn) {
      yesBtn.disabled = false;
      yesBtn.classList.add('pulse');
    }
    if (noBtn) {
      noBtn.disabled = false;
      noBtn.classList.add('pulse');
    }

    Logger.debug('audiometry-ui', 'Botones de respuesta habilitados');
  }

  /**
   * Disable response buttons
   */
  disableResponseButtons() {
    const yesBtn = document.getElementById('response-yes-btn');
    const noBtn = document.getElementById('response-no-btn');

    if (yesBtn) {
      yesBtn.disabled = true;
      yesBtn.classList.remove('pulse');
    }
    if (noBtn) {
      noBtn.disabled = true;
      noBtn.classList.remove('pulse');
    }
  }

  /**
   * Handle user response: YES (heard)
   */
  handleResponseYes() {
    Logger.info('audiometry-ui', '✅ Usuario presionó: SÍ ESCUCHÉ');
    this.disableResponseButtons();

    // Notify engine
    this.engine.userHeard();

    // Update status
    const statusDisplay = document.getElementById('status-display');
    if (statusDisplay) {
      statusDisplay.innerHTML = `
        <div class="text-lg text-success">✓ Sí, escuché</div>
        <div class="text-sm text-secondary mt-2">Preparando siguiente tono...</div>
      `;
    }
  }

  /**
   * Handle user response: NO (not heard)
   */
  handleResponseNo() {
    Logger.info('audiometry-ui', '❌ Usuario presionó: NO ESCUCHÉ');
    this.disableResponseButtons();

    // Notify engine
    this.engine.userNotHeard();

    // Update status
    const statusDisplay = document.getElementById('status-display');
    if (statusDisplay) {
      statusDisplay.innerHTML = `
        <div class="text-lg text-warning">✗ No escuché</div>
        <div class="text-sm text-secondary mt-2">Preparando siguiente tono...</div>
      `;
    }
  }

  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    // Remove any existing listener
    if (this.keyboardHandler) {
      document.removeEventListener('keydown', this.keyboardHandler);
    }

    // Create new handler
    this.keyboardHandler = (e) => {
      // Only handle if buttons are enabled
      const yesBtn = document.getElementById('response-yes-btn');
      const noBtn = document.getElementById('response-no-btn');

      if (!yesBtn || !noBtn) return;

      // Don't handle if buttons are disabled
      if (yesBtn.disabled && noBtn.disabled) return;

      // Space or Enter = YES
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (!yesBtn.disabled) {
          this.handleResponseYes();
        }
      }
      // N = NO
      else if (e.code === 'KeyN') {
        e.preventDefault();
        if (!noBtn.disabled) {
          this.handleResponseNo();
        }
      }
    };

    // Add listener
    document.addEventListener('keydown', this.keyboardHandler);
    Logger.debug('audiometry-ui', 'Atajos de teclado configurados: ESPACIO/ENTER = SÍ, N = NO');
  }

  /**
   * Update progress bar
   */
  updateProgress(completed, total, currentFreq, currentEar) {
    const percentage = Math.round((completed / total) * 100);

    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const progressPercentage = document.getElementById('progress-percentage');

    if (progressBar) progressBar.style.width = `${percentage}%`;
    if (progressText) progressText.textContent = `${completed} / ${total} tests`;
    if (progressPercentage) progressPercentage.textContent = `${percentage}%`;
  }

  /**
   * Show stage transition
   */
  showStageTransition(stage, problemCount) {
    const stageIndicator = document.getElementById('stage-indicator');
    const microIndicator = document.getElementById('micro-indicator');

    if (stage === 'micro') {
      if (stageIndicator) {
        stageIndicator.innerHTML = `
          <span class="badge badge-warning">Etapa 2: Micro-audiometría (${problemCount} áreas)</span>
        `;
      }
      if (microIndicator) {
        microIndicator.style.display = 'block';
      }
    }
  }

  /**
   * Show threshold feedback
   */
  showThresholdFeedback(frequency, ear, threshold) {
    console.log(`Threshold found: ${frequency} Hz (${ear}) = ${threshold} dB HL`);
    // Could show a small notification here
  }

  /**
   * Show results
   */
  showResults(results, analysis) {
    this.currentScreen = 'results';
    this.render();

    // Populate results summary
    this.populateResultsSummary(results, analysis);

    // Draw audiogram
    this.drawAudiogram(results);

    // Show problem frequencies
    if (results.problemFrequencies && results.problemFrequencies.length > 0) {
      this.showProblemFrequencies(results.problemFrequencies);
    }
  }

  /**
   * Populate results summary
   */
  populateResultsSummary(results, analysis) {
    const summaryDiv = document.getElementById('results-summary');
    if (!summaryDiv) return;

    const leftAvg = analysis.averageThreshold.left;
    const rightAvg = analysis.averageThreshold.right;

    // Reliability indicator
    const reliability = analysis.reliability || { level: 'N/A', score: 100, message: 'Sin datos', icon: '—', color: '#999' };

    summaryDiv.innerHTML = `
      <!-- Reliability Score -->
      <div class="alert mb-4" style="background: linear-gradient(135deg, ${reliability.color}15, ${reliability.color}08); border-left: 4px solid ${reliability.color};">
        <div class="flex items-center justify-between">
          <div>
            <strong style="color: ${reliability.color};">${reliability.icon} Confiabilidad: ${reliability.level} (${reliability.score}%)</strong>
            <p class="text-sm mt-1" style="color: #666;">${reliability.message}</p>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold" style="color: ${reliability.color};">${reliability.score}%</div>
            <div class="text-xs text-secondary">Reliability Score</div>
          </div>
        </div>
        ${analysis.catchTrials ? `
          <div class="text-xs mt-3 text-secondary">
            Catch trials: ${analysis.catchTrials.passed}/${analysis.catchTrials.total} correctos
            ${analysis.catchTrials.falsePositives > 0 ? `• ${analysis.catchTrials.falsePositives} falsos positivos` : ''}
          </div>
        ` : ''}
      </div>

      <!-- Hearing Thresholds -->
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="text-center p-4 bg-blue-50 rounded">
          <div class="text-2xl font-bold">${leftAvg} dB HL</div>
          <div class="text-sm text-secondary">Oído Izquierdo</div>
          <div class="badge ${this.getHearingLossBadgeClass(analysis.hearingLoss.left)} mt-2">
            ${this.getHearingLossLabel(analysis.hearingLoss.left)}
          </div>
        </div>
        <div class="text-center p-4 bg-red-50 rounded">
          <div class="text-2xl font-bold">${rightAvg} dB HL</div>
          <div class="text-sm text-secondary">Oído Derecho</div>
          <div class="badge ${this.getHearingLossBadgeClass(analysis.hearingLoss.right)} mt-2">
            ${this.getHearingLossLabel(analysis.hearingLoss.right)}
          </div>
        </div>
      </div>

      ${results.micro && Object.keys(results.micro).length > 0 ? `
        <div class="alert alert-info">
          <strong>🔍 Micro-audiometría completada</strong>
          <p class="mt-2 text-sm">Se realizaron ${Object.keys(results.micro).length} mediciones adicionales en frecuencias problema.</p>
        </div>
      ` : ''}
    `;
  }

  /**
   * Draw audiogram using Plotly.js (interactive with zoom/pan)
   */
  drawAudiogram(results) {
    const plotDiv = document.getElementById('audiogram-canvas');
    if (!plotDiv) {
      Logger.error('audiometry-ui', 'No se encontró div para audiograma');
      return;
    }

    Logger.info('audiometry-ui', '📊 Dibujando audiograma con Plotly.js');

    // Prepare traces (data series)
    const traces = [];

    // === STANDARD AUDIOMETRY - Left Ear (Blue) ===
    if (results.standard) {
      const leftFreqs = [];
      const leftThresholds = [];

      Object.keys(results.standard)
        .map(Number)
        .sort((a, b) => a - b)
        .forEach(freq => {
          if (results.standard[freq].left !== undefined) {
            leftFreqs.push(freq);
            leftThresholds.push(results.standard[freq].left);
          }
        });

      if (leftFreqs.length > 0) {
        traces.push({
          x: leftFreqs,
          y: leftThresholds,
          mode: 'lines+markers',
          name: 'Oído Izquierdo',
          line: {
            color: '#3B82F6',
            width: 3
          },
          marker: {
            size: 10,
            color: '#3B82F6',
            symbol: 'circle'
          },
          hovertemplate: '<b>%{x} Hz</b><br>Oído Izquierdo<br>%{y} dB HL<extra></extra>'
        });
      }

      // === STANDARD AUDIOMETRY - Right Ear (Red) ===
      const rightFreqs = [];
      const rightThresholds = [];

      Object.keys(results.standard)
        .map(Number)
        .sort((a, b) => a - b)
        .forEach(freq => {
          if (results.standard[freq].right !== undefined) {
            rightFreqs.push(freq);
            rightThresholds.push(results.standard[freq].right);
          }
        });

      if (rightFreqs.length > 0) {
        traces.push({
          x: rightFreqs,
          y: rightThresholds,
          mode: 'lines+markers',
          name: 'Oído Derecho',
          line: {
            color: '#EF4444',
            width: 3
          },
          marker: {
            size: 10,
            color: '#EF4444',
            symbol: 'x',
            line: { width: 2 }
          },
          hovertemplate: '<b>%{x} Hz</b><br>Oído Derecho<br>%{y} dB HL<extra></extra>'
        });
      }
    }

    // === MICRO-AUDIOMETRY (if available) ===
    if (results.micro && Object.keys(results.micro).length > 0) {
      const microLeftFreqs = [];
      const microLeftThresholds = [];
      const microRightFreqs = [];
      const microRightThresholds = [];

      Object.keys(results.micro)
        .map(Number)
        .sort((a, b) => a - b)
        .forEach(freq => {
          if (results.micro[freq].left !== undefined) {
            microLeftFreqs.push(freq);
            microLeftThresholds.push(results.micro[freq].left);
          }
          if (results.micro[freq].right !== undefined) {
            microRightFreqs.push(freq);
            microRightThresholds.push(results.micro[freq].right);
          }
        });

      if (microLeftFreqs.length > 0) {
        traces.push({
          x: microLeftFreqs,
          y: microLeftThresholds,
          mode: 'lines+markers',
          name: 'Micro-audio (Izq)',
          line: {
            color: '#6699FF',
            width: 2,
            dash: 'dot'
          },
          marker: {
            size: 5,
            color: '#6699FF',
            symbol: 'circle'
          },
          hovertemplate: '<b>%{x} Hz</b><br>Micro Izq<br>%{y} dB HL<extra></extra>'
        });
      }

      if (microRightFreqs.length > 0) {
        traces.push({
          x: microRightFreqs,
          y: microRightThresholds,
          mode: 'lines+markers',
          name: 'Micro-audio (Der)',
          line: {
            color: '#FF9999',
            width: 2,
            dash: 'dot'
          },
          marker: {
            size: 5,
            color: '#FF9999',
            symbol: 'x'
          },
          hovertemplate: '<b>%{x} Hz</b><br>Micro Der<br>%{y} dB HL<extra></extra>'
        });
      }
    }

    // === LAYOUT CONFIGURATION ===
    const layout = {
      title: {
        text: 'Audiograma Interactivo',
        font: { size: 18, color: '#333' }
      },
      xaxis: {
        title: 'Frecuencia (Hz)',
        type: 'log',
        tickmode: 'array',
        tickvals: [125, 250, 500, 1000, 2000, 4000, 8000],
        ticktext: ['125', '250', '500', '1000', '2000', '4000', '8000'],
        range: [Math.log10(100), Math.log10(10000)],
        gridcolor: '#e5e7eb',
        showgrid: true
      },
      yaxis: {
        title: 'Umbral de Audición (dB HL)',
        autorange: 'reversed',  // Invertir eje Y (-10 arriba, 90 abajo)
        range: [-10, 90],
        gridcolor: '#e5e7eb',
        showgrid: true,
        zeroline: true,
        zerolinecolor: '#10b981',
        zerolinewidth: 2
      },
      hovermode: 'closest',
      showlegend: true,
      legend: {
        x: 0.02,
        y: 0.98,
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        bordercolor: '#ccc',
        borderwidth: 1
      },
      plot_bgcolor: '#ffffff',
      paper_bgcolor: '#f9fafb',
      margin: { l: 60, r: 40, t: 60, b: 60 },
      // Zona normal (0-25 dB) shape
      shapes: [{
        type: 'rect',
        xref: 'paper',
        yref: 'y',
        x0: 0,
        x1: 1,
        y0: -10,
        y1: 25,
        fillcolor: 'rgba(16, 185, 129, 0.1)',
        line: { width: 0 },
        layer: 'below'
      }],
      annotations: [{
        text: 'Audición Normal',
        xref: 'paper',
        yref: 'y',
        x: 0.98,
        y: 10,
        showarrow: false,
        font: { size: 10, color: '#10b981' },
        xanchor: 'right'
      }]
    };

    // === CONFIG (Interactive features) ===
    const config = {
      responsive: true,
      displayModeBar: true,
      modeBarButtonsToAdd: [],
      modeBarButtonsToRemove: ['lasso2d', 'select2d'],
      toImageButtonOptions: {
        format: 'png',
        filename: 'audiograma',
        height: 600,
        width: 1000,
        scale: 2
      },
      displaylogo: false,
      scrollZoom: false  // Evitar zoom accidental con rueda
    };

    // === RENDER PLOT ===
    Plotly.newPlot(plotDiv, traces, layout, config)
      .then(() => {
        Logger.success('audiometry-ui', '✅ Audiograma renderizado con Plotly');
      })
      .catch(err => {
        Logger.error('audiometry-ui', 'Error al renderizar audiograma:', err);
      });
  }

  // OLD Canvas methods removed - now using Plotly.js for interactive audiogram

  /**
   * Show problem frequencies
   */
  showProblemFrequencies(problemFreqs) {
    const section = document.getElementById('problem-frequencies-section');
    const list = document.getElementById('problem-frequencies-list');

    if (!section || !list) return;

    section.style.display = 'block';
    list.innerHTML = problemFreqs.map(pf => `
      <div class="alert alert-warning mb-2">
        <strong>${pf.centerFrequency} Hz (${pf.ear === 'left' ? 'Izquierdo' : 'Derecho'})</strong>
        - Umbral: ${pf.threshold} dB HL
        ${pf.drop > 0 ? `• Caída: ${pf.drop} dB` : ''}
      </div>
    `).join('');
  }

  /**
   * Get hearing loss label
   */
  getHearingLossLabel(type) {
    const labels = {
      'normal': 'Normal',
      'mild': 'Leve',
      'moderate': 'Moderada',
      'moderate-severe': 'Moderada-Severa',
      'severe': 'Severa',
      'profound': 'Profunda'
    };
    return labels[type] || type;
  }

  /**
   * Get badge class for hearing loss
   */
  getHearingLossBadgeClass(type) {
    const classes = {
      'normal': 'badge-success',
      'mild': 'badge-info',
      'moderate': 'badge-warning',
      'moderate-severe': 'badge-warning',
      'severe': 'badge-danger',
      'profound': 'badge-danger'
    };
    return classes[type] || 'badge-secondary';
  }

  /**
   * Pause test
   */
  pauseTest() {
    this.engine.pause();
    alert('Prueba pausada. Presiona Reanudar cuando estés listo.');
  }

  /**
   * Resume test
   */
  resumeTest() {
    this.engine.resume();
  }

  /**
   * Stop test
   */
  stopTest() {
    if (confirm('¿Estás seguro de que quieres detener la prueba? Se perderá el progreso.')) {
      this.engine.stop();
      this.showWelcome();
    }
  }

  /**
   * Download results
   */
  downloadResults() {
    const data = Storage.getLatestAudiometryResults();
    if (!data) return;

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audiometria-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  }

  /**
   * Restart audiometry
   */
  restart() {
    this.showWelcome();
  }

  /**
   * Show welcome screen
   */
  showWelcome() {
    this.currentScreen = 'welcome';
    this.render();
  }

  /**
   * 🧪 Load test data (debug mode)
   */
  loadTestData() {
    const confirmed = confirm(
      '🧪 MODO TEST/DEBUG\n\n' +
      'Se generarán datos simulados con:\n' +
      '• Problema en 4050 Hz (oído izquierdo)\n' +
      '• Pérdida de ~20 dB en esa frecuencia\n' +
      '• Micro-audiometría automática activada\n\n' +
      'Esto permite evaluar el flujo completo del sistema.\n\n' +
      '¿Continuar con datos de prueba?'
    );

    if (!confirmed) return;

    console.log('🧪 Loading test data...');

    // Generate test data from engine
    const testData = this.engine.generateTestData();

    // Analyze the generated results
    const analysis = this.engine.analyzeResults();

    // Format results for display (showResults expects this structure)
    const formattedResults = {
      standard: this.engine.results,
      micro: this.engine.microResults,
      problemFrequencies: this.engine.problemFrequencies
    };

    // Prepare data to save
    const dataToSave = {
      leftEar: {
        frequencies: Object.keys(this.engine.results).map(f => parseInt(f)),
        thresholds: Object.keys(this.engine.results).map(f => this.engine.results[f].left)
      },
      rightEar: {
        frequencies: Object.keys(this.engine.results).map(f => parseInt(f)),
        thresholds: Object.keys(this.engine.results).map(f => this.engine.results[f].right)
      },
      microAudiometry: {
        leftEar: {
          frequencies: Object.keys(this.engine.microResults).map(f => parseInt(f)),
          thresholds: Object.keys(this.engine.microResults).map(f => this.engine.microResults[f].left)
        },
        rightEar: {
          frequencies: Object.keys(this.engine.microResults).map(f => parseInt(f)),
          thresholds: Object.keys(this.engine.microResults).map(f => this.engine.microResults[f].right)
        }
      },
      problemFrequencies: this.engine.problemFrequencies,
      classification: {
        left: analysis.hearingLoss.left,
        right: analysis.hearingLoss.right
      },
      timestamp: new Date().toISOString(),
      testMode: true
    };

    Logger.info('audiometry', '💾 Guardando datos de test en LocalStorage');
    Logger.debug('audiometry', 'Datos a guardar:', dataToSave);
    Logger.info('audiometry', `Problem frequencies a guardar: ${dataToSave.problemFrequencies?.length || 0} frecuencias`);

    // Save to storage
    Storage.saveAudiometryResults(dataToSave);

    // Verify it was saved
    const saved = Storage.getLatestAudiometryResults();
    Logger.success('audiometry', '✅ Datos guardados correctamente');
    Logger.debug('audiometry', 'Datos guardados verificados:', saved);
    Logger.info('audiometry', `Problem frequencies guardadas: ${saved?.problemFrequencies?.length || 0}`);

    console.log('✅ Test data loaded and saved to LocalStorage');
    console.log('Standard results:', this.engine.results);
    console.log('Micro results:', this.engine.microResults);
    console.log('Problem frequencies:', this.engine.problemFrequencies);
    console.log('Analysis:', analysis);
    console.log('Formatted results for display:', formattedResults);

    // Show results with formatted data
    this.showResults(formattedResults, analysis);

    // Small delay to ensure DOM is ready, then redraw audiogram
    setTimeout(() => {
      const canvas = document.getElementById('audiogram-canvas');
      if (canvas) {
        console.log('Canvas found, redrawing audiogram...');
        this.drawAudiogram(formattedResults);
      } else {
        console.error('Canvas not found!');
      }
    }, 100);
  }

  /**
   * Zoom audiogram - Now handled by Plotly.js native controls
   * This method is kept for backwards compatibility but Plotly handles zoom natively
   */
  zoomAudiogram(action) {
    Logger.info('audiometry-ui', `Zoom solicitado (legacy): ${action}`);

    const plotDiv = document.getElementById('audiogram-canvas');
    if (!plotDiv || !plotDiv.layout) {
      Logger.warn('audiometry-ui', 'No se encontró gráfico de Plotly');
      return;
    }

    // Use Plotly's native reset functionality for 'reset' action
    if (action === 'reset') {
      Plotly.relayout(plotDiv, {
        'xaxis.autorange': true,
        'yaxis.autorange': 'reversed'
      });
      Logger.info('audiometry-ui', 'Zoom reseteado usando Plotly.relayout()');
    } else {
      // For zoom in/out, user should use native Plotly box select
      Logger.info('audiometry-ui', 'Use controles nativos de Plotly para zoom (box select)');
    }
  }

  /**
   * Download results as PDF/image (placeholder)
   */
  downloadResults() {
    Logger.info('audiometry', 'Descarga de resultados solicitada');

    // For now, just download the data as JSON
    const results = Storage.getAudiometryResults();
    const dataStr = JSON.stringify(results, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audiometria-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    Logger.success('audiometry', 'Resultados descargados como JSON');
  }
}

// Global instance
let audiometryUI = null;

// Initialize on DOM ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('audiometry-container');
    if (container) {
      audiometryUI = new AudiometryUI('audiometry-container');
    }
  });
}
