/**
 * Tinnitus Matching Engine - Multi-Stage Search
 * Tinnitus MVP - Sprint 4
 */

class TinnitusMatchingEngine {
  constructor() {
    // Search stages
    this.currentStage = 'range-selection'; // 'range-selection', 'coarse', 'refinement', 'fine-tuning', 'validation', 'mml'
    this.stages = ['range-selection', 'coarse', 'refinement', 'fine-tuning', 'validation', 'mml'];

    // State
    this.selectedRange = null; // { min, max, center }
    this.coarseMatches = []; // Frequencies rated by user
    this.currentFrequency = null;
    this.matchedFrequency = null;
    this.confidence = 0;
    this.volume = 0.3;
    this.waveType = 'sine'; // 'sine', 'square', 'sawtooth', 'triangle'

    // Audiometry integration
    this.audiometryResults = null;
    this.problemFrequencies = [];
    this.suggestedRanges = [];

    // Results
    this.finalMatch = null;
    this.validationScore = 0;
    this.validationTests = [];

    // MML (Minimum Masking Level) configuration
    this.config = {
      enableMML: true,           // Enable MML testing
      mmlStartLevel: -20,        // Start at -20 dB (quiet)
      mmlStepSize: 5,            // Increase by 5 dB per step
      mmlMaxLevel: 40,           // Maximum 40 dB above threshold
      mmlNoiseType: 'narrow-band', // 'narrow-band' or 'white'
      mmlBandwidth: 500          // Hz - bandwidth for narrow-band noise
    };

    // MML state
    this.mmlLevel = this.config.mmlStartLevel; // Current MML test level (dB)
    this.mmlResult = null;     // Final MML result
    this.mmlAttempts = [];     // History of MML attempts

    // Callbacks
    this.onStageChange = null;
    this.onFrequencyTest = null;
    this.onMatchFound = null;
    this.onComplete = null;

    // Status
    this.isRunning = false;
  }

  /**
   * Initialize with audiometry results
   */
  async initialize(audiometryData) {
    Logger.info('matching', '🎯 Inicializando búsqueda de tinnitus');
    Logger.debug('matching', 'Datos de audiometría recibidos:', audiometryData);

    if (audiometryData) {
      this.audiometryResults = audiometryData;
      this.problemFrequencies = audiometryData.problemFrequencies || [];
      Logger.info('matching', `Frecuencias problema encontradas: ${this.problemFrequencies.length}`);

      // Generate suggested ranges based on audiometry
      this.suggestedRanges = this.generateSuggestedRanges();
      Logger.success('matching', `Rangos sugeridos generados: ${this.suggestedRanges.length}`, this.suggestedRanges);
    }

    // If no audiometry data, provide default ranges
    if (this.suggestedRanges.length === 0) {
      Logger.warn('matching', 'Sin datos de audiometría, usando rangos por defecto');
      this.suggestedRanges = [
        { min: 3000, max: 5000, center: 4000, reason: 'Rango común de tinnitus', priority: 'medium' },
        { min: 5000, max: 8000, center: 6000, reason: 'Rango de alta frecuencia', priority: 'medium' },
        { min: 8000, max: 12000, center: 10000, reason: 'Rango muy alto', priority: 'low' }
      ];
    }

    this.isRunning = true;
    this.currentStage = 'range-selection';
    Logger.step('matching', 1, 5, 'Etapa de selección de rango iniciada');

    if (this.onStageChange) {
      this.onStageChange(this.currentStage, 0);
    }
  }

  /**
   * Generate suggested frequency ranges from audiometry results
   */
  generateSuggestedRanges() {
    Logger.debug('matching', 'Generando rangos sugeridos de frecuencias');
    const ranges = [];

    if (!this.problemFrequencies || this.problemFrequencies.length === 0) {
      Logger.warn('matching', 'No hay frecuencias problema para generar rangos');
      return ranges;
    }

    // For each problem frequency, create a search range
    this.problemFrequencies.forEach(problem => {
      const center = problem.centerFrequency;
      const rangeSize = 2000; // ±1000 Hz

      const range = {
        min: Math.max(20, center - rangeSize / 2),
        max: Math.min(20000, center + rangeSize / 2),
        center: center,
        reason: `Pérdida auditiva detectada (${problem.drop} dB)`,
        priority: problem.priority === 'high' ? 'high' : 'medium',
        ear: problem.ear
      };

      ranges.push(range);
      Logger.debug('matching', `Rango creado: ${range.min}-${range.max} Hz (centro: ${range.center} Hz)`, range);
    });

    // Sort by priority
    ranges.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    Logger.debug('matching', 'Rangos ordenados por prioridad');

    // If in 4000-7000 Hz range but no problems detected, add default
    const hasMidRange = ranges.some(r => r.center >= 4000 && r.center <= 7000);
    if (!hasMidRange) {
      Logger.info('matching', 'Agregando rango por defecto 4000-7000 Hz');
      ranges.unshift({
        min: 4000,
        max: 7000,
        center: 5500,
        reason: 'Rango más común de tinnitus',
        priority: 'high'
      });
    }

    Logger.success('matching', `Rangos sugeridos generados: ${ranges.length} rangos`);
    return ranges;
  }

  /**
   * Select a frequency range to search
   */
  selectRange(range) {
    this.selectedRange = range;
    Logger.info('matching', `📍 Rango seleccionado: ${range.min}-${range.max} Hz (centro: ${range.center} Hz)`);
    Logger.debug('matching', 'Detalles del rango:', range);

    // Generate coarse search frequencies (5-7 points)
    const step = (range.max - range.min) / 6;
    const frequencies = [];

    for (let i = 0; i <= 6; i++) {
      const freq = Math.round(range.min + step * i);
      frequencies.push(freq);
    }

    Logger.debug('matching', `Generando ${frequencies.length} frecuencias para búsqueda gruesa:`, frequencies);

    this.coarseMatches = frequencies.map(freq => ({
      frequency: freq,
      rating: 0,
      tested: false
    }));

    // Move to coarse stage
    this.currentStage = 'coarse';
    Logger.step('matching', 2, 5, 'Búsqueda gruesa iniciada');

    if (this.onStageChange) {
      this.onStageChange(this.currentStage, 1);
    }
  }

  /**
   * Test a frequency in coarse search
   */
  async testFrequency(frequency, duration = 2) {
    this.currentFrequency = frequency;
    Logger.debug('matching', `🔊 Reproduciendo tono de prueba: ${frequency} Hz (${duration}s, vol: ${this.volume})`);

    if (this.onFrequencyTest) {
      this.onFrequencyTest(frequency);
    }

    // Play tone
    const timer = Logger.timeStart('matching', `play-${frequency}`);
    await AudioContextManager.playTone(frequency, duration, this.volume, this.waveType);
    Logger.timeEnd('matching', `play-${frequency}`);
  }

  /**
   * Rate a frequency (0-5 stars)
   */
  rateFrequency(frequency, rating) {
    const match = this.coarseMatches.find(m => m.frequency === frequency);
    if (match) {
      match.rating = rating;
      match.tested = true;
      Logger.info('matching', `⭐ Calificación registrada: ${frequency} Hz → ${rating}/5 estrellas`);

      const testedCount = this.coarseMatches.filter(m => m.tested).length;
      const totalCount = this.coarseMatches.length;
      Logger.debug('matching', `Progreso de pruebas: ${testedCount}/${totalCount} frecuencias evaluadas`);
    } else {
      Logger.warn('matching', `Frecuencia no encontrada en búsqueda gruesa: ${frequency} Hz`);
    }
  }

  /**
   * Complete coarse search and move to refinement
   */
  completeCoarseSearch() {
    Logger.info('matching', 'Finalizando búsqueda gruesa...');

    // Find best match from coarse search
    const bestMatch = this.coarseMatches
      .filter(m => m.tested)
      .sort((a, b) => b.rating - a.rating)[0];

    if (!bestMatch || bestMatch.rating === 0) {
      Logger.error('matching', '❌ No se encontraron coincidencias en búsqueda gruesa');
      Logger.debug('matching', 'Estado de búsqueda gruesa:', this.coarseMatches);
      return false;
    }

    // Set current frequency to best match
    this.currentFrequency = bestMatch.frequency;
    Logger.success('matching', `✅ Mejor coincidencia encontrada: ${bestMatch.frequency} Hz (${bestMatch.rating}/5 ⭐)`);
    Logger.debug('matching', 'Detalles de mejor coincidencia:', bestMatch);

    // Move to refinement stage
    this.currentStage = 'refinement';
    Logger.step('matching', 3, 5, 'Refinamiento iniciado');

    if (this.onStageChange) {
      this.onStageChange(this.currentStage, 2);
    }

    return true;
  }

  /**
   * Adjust frequency with slider
   */
  setFrequency(frequency) {
    const oldFreq = this.currentFrequency;
    this.currentFrequency = Math.round(frequency);
    Logger.debug('matching', `Frecuencia ajustada: ${oldFreq} → ${this.currentFrequency} Hz`);
  }

  /**
   * Adjust frequency by steps
   */
  adjustFrequency(delta) {
    const oldFreq = this.currentFrequency;
    this.currentFrequency = Utils.clamp(
      this.currentFrequency + delta,
      20,
      20000
    );
    Logger.debug('matching', `Ajuste fino: ${delta > 0 ? '+' : ''}${delta} Hz (${oldFreq} → ${this.currentFrequency} Hz)`);
    return this.currentFrequency;
  }

  /**
   * Set volume
   */
  setVolume(volume) {
    const oldVolume = this.volume;
    this.volume = Utils.clamp(volume, 0, 1);
    Logger.debug('matching', `Volumen ajustado: ${(oldVolume * 100).toFixed(0)}% → ${(this.volume * 100).toFixed(0)}%`);
  }

  /**
   * Set wave type
   */
  setWaveType(type) {
    if (['sine', 'square', 'sawtooth', 'triangle'].includes(type)) {
      const oldType = this.waveType;
      this.waveType = type;
      Logger.info('matching', `Tipo de onda cambiado: ${oldType} → ${type}`);
    } else {
      Logger.warn('matching', `Tipo de onda inválido: ${type}`);
    }
  }

  /**
   * Confirm current frequency and move to fine tuning
   */
  confirmRefinement() {
    this.matchedFrequency = this.currentFrequency;
    this.currentStage = 'fine-tuning';

    Logger.success('matching', `✅ Refinamiento confirmado: ${this.matchedFrequency} Hz`);
    Logger.step('matching', 4, 5, 'Ajuste fino iniciado');

    if (this.onStageChange) {
      this.onStageChange(this.currentStage, 3);
    }
  }

  /**
   * Complete fine tuning and move to validation
   */
  completeFineTuning() {
    this.matchedFrequency = this.currentFrequency;
    this.currentStage = 'validation';

    Logger.success('matching', `✅ Ajuste fino completado: ${this.matchedFrequency} Hz`);
    Logger.step('matching', 5, 5, 'Validación iniciada');

    // Generate and store validation tests
    this.validationTests = this.generateValidationTests();
    Logger.info('matching', `Pruebas de validación generadas: ${this.validationTests.length} pruebas`);
    Logger.debug('matching', 'Pruebas de validación:', this.validationTests);

    if (this.onStageChange) {
      this.onStageChange(this.currentStage, 4);
    }

    return this.validationTests;
  }

  /**
   * Generate A/B validation tests
   */
  generateValidationTests() {
    const tests = [];
    const baseFreq = this.matchedFrequency;

    // Test 1: Exact match vs slightly higher
    tests.push({
      id: 'test1',
      soundA: baseFreq,
      soundB: baseFreq + 200,
      correctAnswer: 'A',
      answered: false
    });

    // Test 2: Exact match vs slightly lower
    tests.push({
      id: 'test2',
      soundA: baseFreq - 150,
      soundB: baseFreq,
      correctAnswer: 'B',
      answered: false
    });

    // Test 3: Exact match vs different
    tests.push({
      id: 'test3',
      soundA: baseFreq,
      soundB: baseFreq + 300,
      correctAnswer: 'A',
      answered: false
    });

    return tests;
  }

  /**
   * Process validation test answer
   */
  processValidationAnswer(testId, answer) {
    const test = this.validationTests.find(t => t.id === testId);
    if (!test) {
      Logger.warn('matching', `Prueba de validación no encontrada: ${testId}`);
      return;
    }

    test.answered = true;
    test.userAnswer = answer;

    // Check if correct
    const correct = answer === test.correctAnswer;

    if (correct) {
      this.validationScore++;
      Logger.success('matching', `✅ Prueba ${testId}: Correcta (${test.userAnswer} = ${test.correctAnswer})`);
    } else {
      Logger.warn('matching', `❌ Prueba ${testId}: Incorrecta (${test.userAnswer} ≠ ${test.correctAnswer})`);
    }

    // Calculate confidence
    const totalTests = this.validationTests.filter(t => t.answered).length;
    this.confidence = Math.round((this.validationScore / totalTests) * 100);

    Logger.info('matching', `Progreso de validación: ${this.validationScore}/${totalTests} correctas (${this.confidence}% confianza)`);

    return correct;
  }

  /**
   * Complete validation and move to MML (or finish if MML disabled)
   */
  complete() {
    // Check if MML is enabled
    if (this.config.enableMML) {
      Logger.info('matching', '✅ Validación completa. Iniciando MML...');
      this.startMML();
    } else {
      Logger.info('matching', '✅ Validación completa. MML deshabilitado.');
      this.finalize();
    }
  }

  /**
   * Start MML (Minimum Masking Level) testing
   */
  startMML() {
    this.currentStage = 'mml';
    this.mmlLevel = this.config.mmlStartLevel;
    this.mmlAttempts = [];

    Logger.step('matching', 6, 6, 'MML (Minimum Masking Level) iniciado');
    Logger.info('matching', `🔊 Prueba de enmascaramiento en ${this.matchedFrequency} Hz`);
    Logger.debug('matching', `Nivel inicial: ${this.mmlLevel} dB, Paso: ${this.config.mmlStepSize} dB`);

    if (this.onStageChange) {
      this.onStageChange(this.currentStage, 5);
    }
  }

  /**
   * Play masking noise at current MML level
   */
  async playMasker(duration = 3) {
    const frequency = this.matchedFrequency;
    const bandwidth = this.config.mmlBandwidth;
    const level = this.mmlLevel;

    Logger.debug('matching', `🔊 Reproduciendo ruido enmascarador: ${frequency} Hz (±${bandwidth/2} Hz) a ${level} dB por ${duration}s`);

    // Record attempt
    this.mmlAttempts.push({
      level: level,
      frequency: frequency,
      timestamp: Date.now()
    });

    // Convert dB to volume (0.0 to 1.0)
    // -20 dB = 0.1, 0 dB = 0.3, +20 dB = 0.7, +40 dB = 1.0
    const volume = Math.min(1.0, Math.max(0.05, 0.3 + (level / 100)));

    // Play narrow-band noise
    if (this.config.mmlNoiseType === 'narrow-band') {
      await AudioContextManager.playNarrowBandNoise(frequency, bandwidth, duration, volume);
    } else {
      await AudioContextManager.playWhiteNoise(duration, volume);
    }

    Logger.debug('matching', `Nivel MML probado: ${level} dB (vol: ${(volume * 100).toFixed(0)}%)`);
  }

  /**
   * Increase MML level by step size
   */
  increaseMMLLevel() {
    const oldLevel = this.mmlLevel;
    this.mmlLevel = Math.min(this.config.mmlMaxLevel, this.mmlLevel + this.config.mmlStepSize);
    Logger.info('matching', `📈 Nivel MML aumentado: ${oldLevel} dB → ${this.mmlLevel} dB`);
    return this.mmlLevel;
  }

  /**
   * Decrease MML level by step size
   */
  decreaseMMLLevel() {
    const oldLevel = this.mmlLevel;
    this.mmlLevel = Math.max(this.config.mmlStartLevel, this.mmlLevel - this.config.mmlStepSize);
    Logger.info('matching', `📉 Nivel MML disminuido: ${oldLevel} dB → ${this.mmlLevel} dB`);
    return this.mmlLevel;
  }

  /**
   * Confirm that current MML level masks the tinnitus
   */
  confirmMasking() {
    this.mmlResult = {
      level: this.mmlLevel,
      frequency: this.matchedFrequency,
      noiseType: this.config.mmlNoiseType,
      bandwidth: this.config.mmlBandwidth,
      attempts: this.mmlAttempts.length,
      timestamp: Date.now()
    };

    Logger.success('matching', `✅ MML confirmado: ${this.mmlLevel} dB enmascara el tinnitus`);
    Logger.debug('matching', `Intentos totales: ${this.mmlAttempts.length}`);

    this.finalize();
  }

  /**
   * Skip MML testing
   */
  skipMML() {
    Logger.warn('matching', '⏭️ MML omitido por el usuario');
    this.mmlResult = {
      level: null,
      skipped: true,
      reason: 'User skipped',
      timestamp: Date.now()
    };
    this.finalize();
  }

  /**
   * Finalize and save results
   */
  finalize() {
    this.isRunning = false;
    Logger.info('matching', '🏁 Finalizando búsqueda de tinnitus...');

    // Finalize results
    this.finalMatch = {
      frequency: this.matchedFrequency,
      confidence: this.confidence,
      volume: this.volume,
      waveType: this.waveType,
      validationScore: `${this.validationScore}/${this.validationTests.length}`,
      ear: this.selectedRange?.ear || 'both',
      mml: this.mmlResult,
      timestamp: new Date().toISOString()
    };

    Logger.group('matching', 'Resultados Finales');
    Logger.success('matching', `Frecuencia identificada: ${this.finalMatch.frequency} Hz`);
    Logger.info('matching', `Confianza: ${this.finalMatch.confidence}%`);
    Logger.info('matching', `Validación: ${this.finalMatch.validationScore}`);
    Logger.info('matching', `Oído: ${this.finalMatch.ear}`);
    Logger.info('matching', `Tipo de onda: ${this.finalMatch.waveType}`);

    if (this.mmlResult && !this.mmlResult.skipped) {
      Logger.success('matching', `MML (Nivel de Enmascaramiento): ${this.mmlResult.level} dB`);
    } else if (this.mmlResult && this.mmlResult.skipped) {
      Logger.warn('matching', 'MML: Omitido');
    }

    Logger.groupEnd();

    if (this.onComplete) {
      this.onComplete(this.finalMatch);
    }

    // Save to storage
    Storage.saveTinnitusMatch(this.finalMatch);
    Logger.success('matching', '💾 Resultados guardados en LocalStorage');

    return this.finalMatch;
  }

  /**
   * Get current progress
   */
  getProgress() {
    const stageIndex = this.stages.indexOf(this.currentStage);
    const percentage = Math.round((stageIndex / (this.stages.length - 1)) * 100);

    return {
      stage: this.currentStage,
      stageIndex: stageIndex,
      totalStages: this.stages.length,
      percentage: percentage,
      currentFrequency: this.currentFrequency,
      matchedFrequency: this.matchedFrequency,
      confidence: this.confidence
    };
  }

  /**
   * Go back to previous stage
   */
  goBack() {
    const currentIndex = this.stages.indexOf(this.currentStage);
    if (currentIndex > 0) {
      this.currentStage = this.stages[currentIndex - 1];

      if (this.onStageChange) {
        this.onStageChange(this.currentStage, currentIndex - 1);
      }

      return true;
    }
    return false;
  }

  /**
   * Restart matching
   */
  restart() {
    this.currentStage = 'range-selection';
    this.selectedRange = null;
    this.coarseMatches = [];
    this.currentFrequency = null;
    this.matchedFrequency = null;
    this.confidence = 0;
    this.finalMatch = null;
    this.validationScore = 0;
    this.validationTests = [];

    if (this.onStageChange) {
      this.onStageChange(this.currentStage, 0);
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TinnitusMatchingEngine;
}
