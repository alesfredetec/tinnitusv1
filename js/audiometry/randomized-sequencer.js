/**
 * Randomized Sequencer for Audiometry
 * Eliminates anticipation bias and improves reliability
 */

class RandomizedSequencer {
  constructor() {
    this.testQueue = [];
    this.completedTests = [];
    this.catchTrialPositions = [];
  }

  /**
   * Generate randomized test sequence
   * @param {Array} frequencies - List of frequencies to test
   * @param {Array} ears - ['left', 'right']
   * @param {Object} options - Configuration options
   */
  generateSequence(frequencies, ears = ['left', 'right'], options = {}) {
    Logger.info('sequencer', `🎲 Generando secuencia randomizada para ${frequencies.length} frecuencias x ${ears.length} oídos`);

    const defaults = {
      catchTrialFrequency: 0.15,  // 15% de tests serán catch trials
      minCatchTrialInterval: 5,    // Mínimo 5 tests entre catch trials
      maxCatchTrialInterval: 10,   // Máximo 10 tests entre catch trials
      avoidAdjacentFreqs: true,    // Evitar frecuencias adyacentes consecutivas
      maxConsecutiveSameEar: 2     // Máximo 2 tests consecutivos mismo oído
    };

    const config = { ...defaults, ...options };

    // Crear todos los pares (frecuencia, oído)
    let testPairs = [];
    frequencies.forEach(freq => {
      ears.forEach(ear => {
        testPairs.push({
          frequency: freq,
          ear: ear,
          type: 'standard',
          tested: false
        });
      });
    });

    Logger.debug('sequencer', `Total de tests a realizar: ${testPairs.length}`);

    // Randomizar con constraints
    this.testQueue = this.shuffleWithConstraints(testPairs, config);

    // Insertar catch trials
    this.insertCatchTrials(config);

    Logger.success('sequencer', `✅ Secuencia generada: ${this.testQueue.length} tests totales (${this.catchTrialPositions.length} catch trials)`);
    Logger.debug('sequencer', 'Primeros 10 tests:', this.testQueue.slice(0, 10).map(t => `${t.frequency}Hz-${t.ear}${t.type === 'catch' ? '-CATCH' : ''}`));

    return this.testQueue;
  }

  /**
   * Shuffle with intelligent constraints
   */
  shuffleWithConstraints(testPairs, config) {
    let shuffled = [];
    let remaining = [...testPairs];
    let lastEar = null;
    let lastFreq = null;
    let consecutiveEarCount = 0;

    while (remaining.length > 0) {
      // Find valid candidates
      let candidates = remaining.filter(test => {
        // Constraint 1: No más de N consecutivos del mismo oído
        if (test.ear === lastEar && consecutiveEarCount >= config.maxConsecutiveSameEar) {
          return false;
        }

        // Constraint 2: Evitar frecuencias adyacentes
        if (config.avoidAdjacentFreqs && lastFreq) {
          const freqDiff = Math.abs(Math.log2(test.frequency / lastFreq));
          // Si la diferencia es menos de media octava, evitar
          if (freqDiff < 0.5) {
            return false;
          }
        }

        return true;
      });

      // Si no hay candidatos válidos, relajar constraints
      if (candidates.length === 0) {
        Logger.debug('sequencer', 'Relajando constraints - no hay candidatos válidos');
        candidates = remaining;
      }

      // Seleccionar uno aleatoriamente de los candidatos válidos
      const randomIndex = Math.floor(Math.random() * candidates.length);
      const selected = candidates[randomIndex];

      // Agregar a secuencia
      shuffled.push(selected);

      // Remover de remaining
      const originalIndex = remaining.indexOf(selected);
      remaining.splice(originalIndex, 1);

      // Actualizar estado
      if (selected.ear === lastEar) {
        consecutiveEarCount++;
      } else {
        consecutiveEarCount = 1;
      }

      lastEar = selected.ear;
      lastFreq = selected.frequency;
    }

    return shuffled;
  }

  /**
   * Insert catch trials strategically
   */
  insertCatchTrials(config) {
    const standardTests = this.testQueue.filter(t => t.type === 'standard');
    const numCatchTrials = Math.floor(standardTests.length * config.catchTrialFrequency);

    Logger.info('sequencer', `Insertando ${numCatchTrials} catch trials`);

    // Generar posiciones para catch trials
    const positions = [];
    let lastPosition = config.minCatchTrialInterval;

    for (let i = 0; i < numCatchTrials; i++) {
      // Siguiente posición: entre min y max interval desde la última
      const interval = config.minCatchTrialInterval +
                       Math.floor(Math.random() * (config.maxCatchTrialInterval - config.minCatchTrialInterval));

      lastPosition += interval;

      // No exceder longitud total
      if (lastPosition < this.testQueue.length) {
        positions.push(lastPosition);
      }
    }

    // Insertar catch trials en las posiciones seleccionadas
    // Insertar de atrás hacia adelante para no afectar índices
    positions.reverse().forEach(pos => {
      this.testQueue.splice(pos, 0, {
        frequency: null,
        ear: null,
        type: 'catch',
        tested: false
      });
      this.catchTrialPositions.push(pos);
    });

    Logger.success('sequencer', `✅ ${positions.length} catch trials insertados en posiciones: ${positions.join(', ')}`);
  }

  /**
   * Get next test in sequence
   */
  getNext() {
    const next = this.testQueue.find(t => !t.tested);

    if (next) {
      Logger.debug('sequencer', `Siguiente test: ${next.type === 'catch' ? 'CATCH TRIAL' : `${next.frequency} Hz - ${next.ear}`}`);
    } else {
      Logger.info('sequencer', 'No hay más tests en la secuencia');
    }

    return next;
  }

  /**
   * Mark test as completed
   */
  markCompleted(test) {
    test.tested = true;
    this.completedTests.push({
      ...test,
      completedAt: Date.now()
    });

    const remaining = this.testQueue.filter(t => !t.tested).length;
    Logger.debug('sequencer', `Test completado. Restantes: ${remaining}`);
  }

  /**
   * Get progress
   */
  getProgress() {
    const total = this.testQueue.length;
    const completed = this.testQueue.filter(t => t.tested).length;
    const percentage = Math.round((completed / total) * 100);

    return {
      total,
      completed,
      remaining: total - completed,
      percentage
    };
  }

  /**
   * Check if sequence is complete
   */
  isComplete() {
    return this.testQueue.every(t => t.tested);
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const progress = this.getProgress();
    const catchTrials = this.testQueue.filter(t => t.type === 'catch');
    const standardTests = this.testQueue.filter(t => t.type === 'standard');

    return {
      totalTests: this.testQueue.length,
      standardTests: standardTests.length,
      catchTrials: catchTrials.length,
      completed: progress.completed,
      remaining: progress.remaining,
      percentage: progress.percentage,
      completedTests: this.completedTests
    };
  }

  /**
   * Export sequence for analysis
   */
  exportSequence() {
    return {
      sequence: this.testQueue.map((test, index) => ({
        index,
        frequency: test.frequency,
        ear: test.ear,
        type: test.type,
        tested: test.tested
      })),
      statistics: this.getStatistics()
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RandomizedSequencer;
}
