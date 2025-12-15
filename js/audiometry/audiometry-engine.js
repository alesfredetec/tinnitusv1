/**
 * Audiometry Engine - Adaptive Staircase Algorithm
 * Tinnitus MVP - Sprint 2
 */

class AudiometryEngine {
  constructor() {
    // Frequencies to test (Hz) - Stage 1: Standard Audiometry
    this.frequencies = [125, 250, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, 8000, 10000, 12000];

    // Randomized sequencer for intelligent test ordering
    this.sequencer = new RandomizedSequencer();

    // Test configuration - Optimized for speed (Hughson-Westlake modified)
    this.config = {
      minLevel: -10,        // dB HL
      maxLevel: 90,         // dB HL
      startLevel: 40,       // dB HL - Start higher for faster detection

      // Hughson-Westlake algorithm steps
      descendStep: 10,      // dB - Decrease after response (faster descent)
      ascendStep: 5,        // dB - Increase after no response (standard)
      fastTrackStep: 20,    // dB - Large jumps when clearly inaudible

      // Timing optimizations (faster than clinical standard)
      toneDuration: 1.0,    // seconds (will vary 0.8-1.2s)
      toneGap: 1.5,         // seconds (will vary 1.0-2.0s)
      responseTimeout: 2500, // ms - Slightly faster response window
      catchTrialProbability: 0.1, // 10% catch trials

      // Threshold detection (2 of 3 ascending - faster than previous)
      thresholdCriterion: 'hughson-westlake', // 'hughson-westlake' or 'legacy'
      requiredResponses: 2,  // 2 out of 3 ascending presentations
      maxTrialsPerFreq: 15,  // Safety limit (down from 20)

      // Micro-audiometry configuration
      microStep: 100,       // Hz step for micro-audiometry
      microRange: 500,      // Hz range around problem frequency (±500 Hz)
      tinnitusRangeMin: 4000, // Hz - Focus range start
      tinnitusRangeMax: 7000, // Hz - Focus range end
      problemThreshold: 15,   // dB drop to trigger micro-audiometry (15 dB = professional standard)
      enableMicroAudiometry: true, // Enable automatic micro-audiometry

      // Test-retest configuration
      enableTestRetest: true,  // Enable automatic test-retest validation
      retestThreshold: 10,     // dB variability threshold for retest
      retestInTinnitusRange: true  // Always retest frequencies in 4-7 kHz
    };

    // State
    this.currentFrequency = null;
    this.currentEar = null; // 'left' or 'right'
    this.currentLevel = this.config.startLevel;
    this.lastDirection = null; // 'up' or 'down'
    this.responses = [];  // All responses for current frequency
    this.ascendingResponses = [];  // Responses during ascending phase (for Hughson-Westlake)
    this.descendingPhase = true;  // Start with descending to find approximate threshold
    this.lowestHeard = null;  // Track lowest level heard
    this.highestNotHeard = null;  // Track highest level not heard

    // Results storage
    this.results = {}; // { frequency: { left: threshold, right: threshold } }
    this.microResults = {}; // { frequency: { left: threshold, right: threshold } } for micro-audiometry
    this.testQueue = [];
    this.completedTests = [];

    // Testing stages
    this.currentStage = 'standard'; // 'standard' or 'micro'
    this.problemFrequencies = []; // Frequencies identified for micro-audiometry

    // Catch trials tracking (reliability assessment)
    this.catchTrials = [];  // Array of all catch trials and their results
    this.falsePositives = 0;  // Count of false positives detected

    // Status
    this.isRunning = false;
    this.isPaused = false;
    this.currentTest = null;
    this.startTime = null;

    // Debug mode
    this.debugMode = false;

    // Callbacks
    this.onTonePresented = null;
    this.onResponseRequired = null;
    this.onThresholdFound = null;
    this.onTestComplete = null;
    this.onProgress = null;
    this.onStageChange = null; // New callback for stage transitions
  }

  /**
   * Initialize test queue with intelligent randomization
   */
  initialize() {
    Logger.info('audiometry', '🎲 Inicializando secuencia randomizada inteligente');

    // Generate randomized sequence with constraints
    const sequence = this.sequencer.generateSequence(
      this.frequencies,
      ['left', 'right'],
      {
        catchTrialFrequency: 0.12,  // 12% catch trials
        minCatchTrialInterval: 6,
        maxCatchTrialInterval: 12,
        avoidAdjacentFreqs: true,
        maxConsecutiveSameEar: 2
      }
    );

    // Display sequence statistics
    const stats = this.sequencer.getStatistics();
    Logger.info('audiometry', `Tests generados: ${stats.standardTests} estándar + ${stats.catchTrials} catch trials = ${stats.totalTests} total`);
    Logger.debug('audiometry', 'Estadísticas de secuencia:', stats);

    console.log('Audiometry initialized with randomized sequence:', stats.totalTests, 'tests');
  }

  /**
   * Start audiometry test
   */
  async start() {
    if (this.isRunning) {
      console.warn('Audiometry already running');
      return;
    }

    if (!AudioContextManager.isReady()) {
      await AudioContextManager.init();
      await AudioContextManager.resume();
    }

    this.isRunning = true;
    this.startTime = Date.now();
    this.currentStage = 'standard';
    this.initialize();

    console.log('Starting Standard Audiometry (Stage 1)...');
    if (this.onStageChange) {
      this.onStageChange('standard', 0, 0);
    }

    await this.runNextTest();
  }

  /**
   * Run next test in queue
   */
  async runNextTest() {
    // Check if sequence is complete
    if (this.sequencer.isComplete()) {
      Logger.info('audiometry', '✅ Secuencia de tests completada');
      this.finish();
      return;
    }

    // Get next test from sequencer
    this.currentTest = this.sequencer.getNext();

    if (!this.currentTest) {
      Logger.error('audiometry', 'No se pudo obtener siguiente test');
      this.finish();
      return;
    }

    // Check if it's a catch trial
    if (this.currentTest.type === 'catch') {
      Logger.info('audiometry', '🎯 CATCH TRIAL - Presentando silencio');
      await this.presentCatchTrial();
      this.sequencer.markCompleted(this.currentTest);
      this.completedTests.push({
        frequency: null,
        ear: null,
        type: 'catch',
        timestamp: Date.now()
      });
      await this.runNextTest();
      return;
    }

    // Standard test
    this.currentFrequency = this.currentTest.frequency;
    this.currentEar = this.currentTest.ear;

    // Reset state for new frequency/ear (Hughson-Westlake)
    this.currentLevel = this.config.startLevel;
    this.lastDirection = null;
    this.responses = [];
    this.ascendingResponses = [];
    this.descendingPhase = true;  // Start with descending
    this.lowestHeard = null;
    this.highestNotHeard = null;

    console.log(`Testing ${this.currentFrequency} Hz - ${this.currentEar} ear`);

    // Update progress using sequencer
    if (this.onProgress) {
      const progress = this.sequencer.getProgress();
      this.onProgress(progress.completed, progress.total, this.currentFrequency, this.currentEar);
    }

    // Wait a bit before starting
    await Utils.sleep(500);

    // Start adaptive procedure
    await this.runAdaptiveProcedure();
  }

  /**
   * Run adaptive staircase procedure for current frequency/ear
   */
  async runAdaptiveProcedure() {
    while (this.isRunning && !this.thresholdFound()) {
      if (this.isPaused) {
        await Utils.sleep(100);
        continue;
      }

      // Random delay between tones (optimized for speed)
      const delay = Utils.randomBetween(1000, 2000);
      await Utils.sleep(delay);

      // Note: Catch trials are now handled by the sequencer, not randomly here
      // This ensures strategic placement and proper tracking

      // Present tone and wait for response
      await this.presentTone();
    }

    // Threshold found for this frequency/ear
    if (this.thresholdFound()) {
      this.saveThreshold();
      this.completedTests.push(this.currentTest);

      // Mark test as completed in sequencer
      this.sequencer.markCompleted(this.currentTest);
      Logger.success('audiometry', `✅ Umbral encontrado: ${this.currentFrequency} Hz (${this.currentEar}) = ${this.calculateThreshold()} dB HL`);

      if (this.onThresholdFound) {
        const threshold = this.calculateThreshold();
        this.onThresholdFound(this.currentFrequency, this.currentEar, threshold);
      }

      // Continue with next test
      await this.runNextTest();
    }
  }

  /**
   * Present tone at current frequency, ear, and level
   */
  async presentTone() {
    // Optimized shorter duration for faster testing
    const duration = Utils.randomBetween(0.8, 1.2); // 0.8-1.2 seconds

    if (this.onTonePresented) {
      this.onTonePresented(this.currentFrequency, this.currentEar, this.currentLevel);
    }

    // Create and play tone
    const oscillator = AudioContextManager.createOscillator(this.currentFrequency, 'sine');
    const gainNode = AudioContextManager.createGain(0);
    const panner = AudioContextManager.createPanner(this.currentEar === 'left' ? -1 : 1);

    // Calculate gain from dB HL
    const gain = this.dbHLToGain(this.currentLevel);

    oscillator.connect(gainNode);
    gainNode.connect(panner);
    panner.connect(AudioContextManager.getMasterGain());

    const now = AudioContextManager.getCurrentTime();

    // Fade in/out envelope
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(gain, now + 0.01);
    gainNode.gain.linearRampToValueAtTime(gain, now + duration - 0.05);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);

    // Wait for response
    const responsePromise = this.waitForResponse();
    const timeoutPromise = Utils.sleep(this.config.responseTimeout);

    const response = await Promise.race([responsePromise, timeoutPromise]);

    // Process response - now supports explicit "not_heard"
    const heard = response === 'heard';
    const explicitNo = response === 'not_heard';

    this.processResponse(heard, explicitNo);
  }

  /**
   * Present catch trial (silence)
   * Used to detect false positives and assess reliability
   */
  async presentCatchTrial() {
    Logger.info('audiometry', '🎯 CATCH TRIAL - Presentando silencio (no debería escucharse nada)');

    if (this.onResponseRequired) {
      this.onResponseRequired('catch');
    }

    const catchTrialStartTime = Date.now();

    // Wait for response (should be NO response for catch trial)
    const responsePromise = this.waitForResponse();
    const timeoutPromise = Utils.sleep(this.config.responseTimeout);

    const response = await Promise.race([responsePromise, timeoutPromise]);

    // Evaluate catch trial result
    const passed = !response || response === 'not_heard';  // Correct = no response or explicit "no"
    const falsePositive = response === 'heard';  // Incorrect = user clicked "yes" to silence

    // Track catch trial
    const catchTrialResult = {
      timestamp: catchTrialStartTime,
      response: response,
      passed: passed,
      falsePositive: falsePositive,
      reactionTime: Date.now() - catchTrialStartTime
    };

    this.catchTrials.push(catchTrialResult);

    if (falsePositive) {
      this.falsePositives++;
      Logger.warn('audiometry', `❌ FALSO POSITIVO detectado (${this.falsePositives} total) - Usuario respondió "Sí" a silencio`);
      console.warn(`⚠️ False positive detected on catch trial (${this.falsePositives} total)`);
    } else {
      Logger.success('audiometry', '✅ Catch trial correcto - Usuario no respondió a silencio');
    }

    // Log reliability stats
    const reliabilityScore = this.calculateReliabilityScore();
    Logger.debug('audiometry', `Reliability score actual: ${reliabilityScore}% (${this.catchTrials.length} catch trials completados)`);
  }

  /**
   * Wait for user response
   * @returns {Promise<string>} 'heard' or null (timeout)
   */
  waitForResponse() {
    return new Promise((resolve) => {
      this._responseResolver = resolve;

      if (this.onResponseRequired) {
        this.onResponseRequired('tone');
      }
    });
  }

  /**
   * User pressed "I heard it" button
   */
  userHeard() {
    if (this._responseResolver) {
      Logger.debug('audiometry', '✅ Usuario respondió: ESCUCHÉ');
      this._responseResolver('heard');
      this._responseResolver = null;
    }
  }

  /**
   * User pressed "I didn't hear it" button
   */
  userNotHeard() {
    if (this._responseResolver) {
      Logger.debug('audiometry', '❌ Usuario respondió: NO ESCUCHÉ');
      this._responseResolver('not_heard');
      this._responseResolver = null;
    }
  }

  /**
   * Timeout or user didn't respond
   */
  noResponse() {
    if (this._responseResolver) {
      Logger.warn('audiometry', '⏱️ Timeout: no hubo respuesta');
      this._responseResolver(null);
      this._responseResolver = null;
    }
  }

  /**
   * Process user response and adjust level (Hughson-Westlake algorithm)
   */
  processResponse(heard, explicitNo = false) {
    // Record response
    const response = {
      level: this.currentLevel,
      heard: heard,
      explicitNo: explicitNo,
      timestamp: Date.now(),
      phase: this.descendingPhase ? 'descending' : 'ascending'
    };
    this.responses.push(response);

    Logger.debug('audiometry',
      `[${response.phase.toUpperCase()}] ${heard ? 'ESCUCHÓ' : (explicitNo ? 'NO ESCUCHÓ' : 'TIMEOUT')} a ${this.currentLevel} dB HL`
    );

    // Track lowest heard and highest not heard
    if (heard) {
      if (this.lowestHeard === null || this.currentLevel < this.lowestHeard) {
        this.lowestHeard = this.currentLevel;
      }
    } else {
      if (this.highestNotHeard === null || this.currentLevel > this.highestNotHeard) {
        this.highestNotHeard = this.currentLevel;
      }
    }

    // Hughson-Westlake algorithm
    if (this.descendingPhase) {
      // === DESCENDING PHASE: Find approximate threshold ===
      if (heard) {
        // Still hearing → go down by 10 dB
        this.currentLevel -= this.config.descendStep;
        Logger.debug('audiometry', `Descendiendo: ${this.currentLevel} dB (escuchó)`);
      } else {
        // First miss → switch to ascending phase
        this.descendingPhase = false;
        this.currentLevel += this.config.ascendStep;
        Logger.info('audiometry', `🔄 Cambiando a fase ASCENDENTE en ${this.currentLevel} dB`);
      }
    } else {
      // === ASCENDING PHASE: Find precise threshold (2 of 3) ===
      if (heard) {
        // Heard it → record for threshold detection
        this.ascendingResponses.push({
          level: this.currentLevel,
          heard: true
        });
        // Go down slightly to test again
        this.currentLevel -= this.config.ascendStep;
        Logger.debug('audiometry', `Ascendente: Escuchó en ${this.currentLevel + this.config.ascendStep} dB, bajando a ${this.currentLevel} dB`);
      } else {
        // Didn't hear → go up by 5 dB
        // Fast tracking: if way too quiet, jump by 20 dB
        if (this.highestNotHeard !== null && this.currentLevel > this.highestNotHeard + 20) {
          this.currentLevel += this.config.fastTrackStep;
          Logger.debug('audiometry', `Fast track: Saltando 20 dB a ${this.currentLevel} dB`);
        } else {
          this.currentLevel += this.config.ascendStep;
          Logger.debug('audiometry', `Ascendente: No escuchó, subiendo a ${this.currentLevel} dB`);
        }
      }
    }

    // Clamp level to valid range
    this.currentLevel = Utils.clamp(this.currentLevel, this.config.minLevel, this.config.maxLevel);

    console.log(`[${response.phase.toUpperCase()}] ${heard ? 'HEARD' : 'NOT HEARD'} at ${response.level} dB | Next: ${this.currentLevel} dB`);
  }

  /**
   * Check if threshold has been found (Hughson-Westlake: 2 of 3 ascending)
   * @returns {boolean}
   */
  thresholdFound() {
    // Must be in ascending phase
    if (this.descendingPhase) return false;

    // Safety limit: too many trials
    if (this.responses.length > this.config.maxTrialsPerFreq) {
      Logger.warn('audiometry', '⚠️ Max trials reached, forcing threshold calculation');
      return true;
    }

    // Hughson-Westlake criterion: 2 out of 3 responses at same level (ascending)
    // Group ascending responses by level
    const responsesByLevel = {};
    this.ascendingResponses.forEach(r => {
      if (!responsesByLevel[r.level]) {
        responsesByLevel[r.level] = [];
      }
      responsesByLevel[r.level].push(r);
    });

    // Check each level for 2 out of 3 criterion
    for (const [level, responses] of Object.entries(responsesByLevel)) {
      if (responses.length >= 3) {
        const heardCount = responses.filter(r => r.heard).length;
        if (heardCount >= this.config.requiredResponses) {
          Logger.info('audiometry', `✅ Threshold found: ${heardCount}/${responses.length} responses at ${level} dB HL`);
          return true;
        }
      }
    }

    // Alternative: If we have multiple levels close together with positive responses
    const positiveResponses = this.ascendingResponses.filter(r => r.heard);
    if (positiveResponses.length >= 3) {
      const levels = positiveResponses.map(r => r.level);
      const minLevel = Math.min(...levels);
      const maxLevel = Math.max(...levels);

      // If all within 5 dB range and we have at least 2 at similar level
      if (maxLevel - minLevel <= 5) {
        const levelCounts = {};
        positiveResponses.forEach(r => {
          levelCounts[r.level] = (levelCounts[r.level] || 0) + 1;
        });

        const maxCount = Math.max(...Object.values(levelCounts));
        if (maxCount >= 2) {
          Logger.info('audiometry', `✅ Threshold found: ${maxCount} responses within 5 dB range`);
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Calculate threshold from responses (Hughson-Westlake: lowest level with 2/3)
   * @returns {number} Threshold in dB HL
   */
  calculateThreshold() {
    // Group ascending responses by level
    const responsesByLevel = {};
    this.ascendingResponses.forEach(r => {
      if (!responsesByLevel[r.level]) {
        responsesByLevel[r.level] = { total: 0, heard: 0 };
      }
      responsesByLevel[r.level].total++;
      if (r.heard) responsesByLevel[r.level].heard++;
    });

    // Find lowest level with at least 2 out of 3 responses
    let thresholdLevel = null;
    const levels = Object.keys(responsesByLevel).map(Number).sort((a, b) => a - b);

    for (const level of levels) {
      const stats = responsesByLevel[level];
      if (stats.total >= 3 && stats.heard >= this.config.requiredResponses) {
        thresholdLevel = level;
        break;  // Return lowest level meeting criterion
      }
    }

    // Fallback: use lowest heard level
    if (thresholdLevel === null) {
      const positiveResponses = this.ascendingResponses.filter(r => r.heard);
      if (positiveResponses.length > 0) {
        const levels = positiveResponses.map(r => r.level);
        thresholdLevel = Math.min(...levels);
        Logger.warn('audiometry', `Using fallback threshold: ${thresholdLevel} dB (lowest heard)`);
      } else {
        // No responses - use highest not heard + 5
        thresholdLevel = this.highestNotHeard !== null
          ? this.highestNotHeard + 5
          : this.config.maxLevel;
        Logger.warn('audiometry', `No positive responses, using fallback: ${thresholdLevel} dB`);
      }
    }

    return Math.round(thresholdLevel);
  }

  /**
   * Save threshold for current frequency/ear
   */
  saveThreshold() {
    const threshold = this.calculateThreshold();

    // Save to appropriate results object based on current stage
    const resultsObj = this.currentStage === 'micro' ? this.microResults : this.results;

    if (!resultsObj[this.currentFrequency]) {
      resultsObj[this.currentFrequency] = {};
    }

    resultsObj[this.currentFrequency][this.currentEar] = threshold;

    const stageLabel = this.currentStage === 'micro' ? '[MICRO]' : '[STD]';
    console.log(`✓ ${stageLabel} Threshold found: ${this.currentFrequency} Hz (${this.currentEar}) = ${threshold} dB HL`);
  }

  /**
   * Finish current stage and transition to micro-audiometry if needed
   */
  async finish() {
    // Stage 1 (Standard) complete - check if we need micro-audiometry
    if (this.currentStage === 'standard' && this.config.enableMicroAudiometry) {
      console.log('Standard Audiometry (Stage 1) complete!');
      console.log('Results:', this.results);

      // Identify problem frequencies
      this.problemFrequencies = this.identifyProblemFrequencies();

      if (this.problemFrequencies.length > 0) {
        console.log(`Found ${this.problemFrequencies.length} problem areas. Starting Micro-Audiometry (Stage 2)...`);
        console.log('Problem frequencies:', this.problemFrequencies);

        // Transition to micro-audiometry stage
        this.currentStage = 'micro';
        if (this.onStageChange) {
          this.onStageChange('micro', this.problemFrequencies.length, 0);
        }

        // Initialize micro-audiometry tests
        this.initializeMicroAudiometry();

        // Continue testing
        await this.runNextTest();
        return;
      } else {
        console.log('No problem frequencies identified. Test complete.');
      }
    }

    // Complete test (Stage 2 done or micro-audiometry disabled)
    this.isRunning = false;

    console.log('Complete Audiometry Test Finished!');
    console.log('Standard Results:', this.results);
    if (Object.keys(this.microResults).length > 0) {
      console.log('Micro-Audiometry Results:', this.microResults);
    }

    // Analyze results
    const analysis = this.analyzeResults();

    if (this.onTestComplete) {
      this.onTestComplete({
        standard: this.results,
        micro: this.microResults,
        problemFrequencies: this.problemFrequencies
      }, analysis);
    }

    // Save to storage
    Storage.saveAudiometryResults({
      results: this.results,
      microResults: this.microResults,
      problemFrequencies: this.problemFrequencies,
      analysis: analysis,
      testDate: new Date().toISOString(),
      duration: Date.now() - this.startTime
    });
  }

  /**
   * Identify problem frequencies for micro-audiometry
   * Focus on 4000-7000 Hz range and significant drops
   * @returns {Array} Problem frequency objects { frequency, ear, threshold, drop }
   */
  identifyProblemFrequencies() {
    const problems = [];
    const sortedFreqs = Object.keys(this.results).map(Number).sort((a, b) => a - b);

    // Check for drops between adjacent frequencies
    for (let i = 1; i < sortedFreqs.length; i++) {
      const prevFreq = sortedFreqs[i - 1];
      const currFreq = sortedFreqs[i];

      ['left', 'right'].forEach(ear => {
        const prevLevel = this.results[prevFreq]?.[ear];
        const currLevel = this.results[currFreq]?.[ear];

        if (prevLevel !== undefined && currLevel !== undefined) {
          const drop = currLevel - prevLevel;

          // Trigger micro-audiometry if:
          // 1. Drop > threshold (20 dB default)
          // 2. OR frequency is in tinnitus range (4000-7000 Hz) with any significant change (>15 dB)
          const inTinnitusRange = currFreq >= this.config.tinnitusRangeMin &&
                                   currFreq <= this.config.tinnitusRangeMax;
          const shouldTest = drop > this.config.problemThreshold ||
                            (inTinnitusRange && drop > 15);

          if (shouldTest) {
            problems.push({
              centerFrequency: currFreq,
              ear: ear,
              threshold: currLevel,
              drop: drop,
              priority: inTinnitusRange ? 'high' : 'normal'
            });
          }
        }
      });
    }

    // Also check for elevated thresholds in tinnitus range (>30 dB)
    sortedFreqs.forEach(freq => {
      if (freq >= this.config.tinnitusRangeMin && freq <= this.config.tinnitusRangeMax) {
        ['left', 'right'].forEach(ear => {
          const level = this.results[freq]?.[ear];
          if (level !== undefined && level > 30) {
            // Check if not already added
            const exists = problems.some(p =>
              Math.abs(p.centerFrequency - freq) < 100 && p.ear === ear
            );
            if (!exists) {
              problems.push({
                centerFrequency: freq,
                ear: ear,
                threshold: level,
                drop: 0,
                priority: 'high'
              });
            }
          }
        });
      }
    });

    return problems;
  }

  /**
   * Initialize micro-audiometry test queue for problem frequencies
   * Generates tests with ±500 Hz range at 100 Hz steps
   */
  initializeMicroAudiometry() {
    this.testQueue = [];

    this.problemFrequencies.forEach(problem => {
      const centerFreq = problem.centerFrequency;
      const ear = problem.ear;

      // Generate frequencies: center ± range with microStep
      const frequencies = [];
      const start = centerFreq - this.config.microRange;
      const end = centerFreq + this.config.microRange;

      for (let freq = start; freq <= end; freq += this.config.microStep) {
        // Skip if already tested in standard audiometry
        if (!this.frequencies.includes(freq) && freq > 20 && freq < 20000) {
          frequencies.push(freq);
        }
      }

      // Add tests to queue
      frequencies.forEach(freq => {
        this.testQueue.push({
          frequency: freq,
          ear: ear,
          type: 'micro',
          centerFrequency: centerFreq
        });
      });
    });

    // Shuffle for randomization
    this.testQueue = Utils.shuffle(this.testQueue);

    console.log(`Micro-audiometry initialized: ${this.testQueue.length} tests`);
  }

  /**
   * Calculate reliability score based on catch trial performance
   * @returns {number} Percentage (0-100)
   */
  calculateReliabilityScore() {
    if (this.catchTrials.length === 0) return 100;

    const passed = this.catchTrials.filter(ct => ct.passed).length;
    const score = Math.round((passed / this.catchTrials.length) * 100);

    return score;
  }

  /**
   * Get reliability assessment based on score
   * @returns {Object} { level: string, color: string, message: string }
   */
  getReliabilityAssessment() {
    const score = this.calculateReliabilityScore();
    const totalCatchTrials = this.catchTrials.length;
    const falsePositiveRate = totalCatchTrials > 0
      ? Math.round((this.falsePositives / totalCatchTrials) * 100)
      : 0;

    if (score >= 90) {
      return {
        level: 'Excelente',
        color: '#10b981',
        score: score,
        message: `Alta confiabilidad. ${this.falsePositives} falsos positivos de ${totalCatchTrials} catch trials.`,
        icon: '✅'
      };
    } else if (score >= 75) {
      return {
        level: 'Buena',
        color: '#3b82f6',
        score: score,
        message: `Confiabilidad aceptable. ${this.falsePositives} falsos positivos de ${totalCatchTrials} catch trials.`,
        icon: '✓'
      };
    } else if (score >= 50) {
      return {
        level: 'Moderada',
        color: '#f59e0b',
        score: score,
        message: `Confiabilidad moderada. ${this.falsePositives} falsos positivos de ${totalCatchTrials} catch trials. Considere repetir la prueba.`,
        icon: '⚠️'
      };
    } else {
      return {
        level: 'Baja',
        color: '#ef4444',
        score: score,
        message: `Confiabilidad baja (${falsePositiveRate}% falsos positivos). Se recomienda repetir la prueba con mayor atención.`,
        icon: '❌'
      };
    }
  }

  /**
   * Analyze audiometry results
   * @returns {Object} Analysis data
   */
  analyzeResults() {
    const analysis = {
      averageThreshold: { left: 0, right: 0 },
      problemFrequencies: [],
      hearingLoss: { left: 'normal', right: 'normal' },
      asymmetry: [],
      reliability: this.getReliabilityAssessment(),
      catchTrials: {
        total: this.catchTrials.length,
        passed: this.catchTrials.filter(ct => ct.passed).length,
        falsePositives: this.falsePositives,
        score: this.calculateReliabilityScore()
      }
    };

    // Calculate average thresholds per ear
    const leftThresholds = [];
    const rightThresholds = [];

    Object.entries(this.results).forEach(([freq, ears]) => {
      if (ears.left !== undefined) leftThresholds.push(ears.left);
      if (ears.right !== undefined) rightThresholds.push(ears.right);
    });

    analysis.averageThreshold.left = Math.round(Utils.average(leftThresholds));
    analysis.averageThreshold.right = Math.round(Utils.average(rightThresholds));

    // Classify hearing loss
    analysis.hearingLoss.left = this.classifyHearingLoss(analysis.averageThreshold.left);
    analysis.hearingLoss.right = this.classifyHearingLoss(analysis.averageThreshold.right);

    // Identify problem frequencies (drops > 20 dB between adjacent frequencies)
    const sortedFreqs = Object.keys(this.results).map(Number).sort((a, b) => a - b);

    for (let i = 1; i < sortedFreqs.length; i++) {
      const prevFreq = sortedFreqs[i - 1];
      const currFreq = sortedFreqs[i];

      ['left', 'right'].forEach(ear => {
        const prevLevel = this.results[prevFreq]?.[ear];
        const currLevel = this.results[currFreq]?.[ear];

        if (prevLevel !== undefined && currLevel !== undefined) {
          const drop = currLevel - prevLevel;

          if (drop > 20) {
            analysis.problemFrequencies.push({
              frequency: currFreq,
              ear: ear,
              threshold: currLevel,
              drop: drop,
              severity: drop > 40 ? 'severe' : drop > 30 ? 'moderate-severe' : 'moderate'
            });
          }
        }
      });
    }

    // Check for asymmetry between ears
    sortedFreqs.forEach(freq => {
      const left = this.results[freq]?.left;
      const right = this.results[freq]?.right;

      if (left !== undefined && right !== undefined) {
        const diff = Math.abs(left - right);
        if (diff > 15) {
          analysis.asymmetry.push({
            frequency: freq,
            leftThreshold: left,
            rightThreshold: right,
            difference: diff
          });
        }
      }
    });

    return analysis;
  }

  /**
   * Classify hearing loss severity
   * @param {number} threshold - Average threshold in dB HL
   * @returns {string} Classification
   */
  classifyHearingLoss(threshold) {
    if (threshold <= 25) return 'normal';
    if (threshold <= 40) return 'mild';
    if (threshold <= 55) return 'moderate';
    if (threshold <= 70) return 'moderate-severe';
    if (threshold <= 90) return 'severe';
    return 'profound';
  }

  /**
   * Convert dB HL to linear gain
   * Simplified conversion for Web Audio API
   * @param {number} dbHL - Hearing level in dB
   * @returns {number} Linear gain (0-1)
   */
  dbHLToGain(dbHL) {
    // Reference: 0 dB HL ≈ -10 dB SPL for most frequencies
    // Simplified: map dB HL to gain with reference point
    const referenceGain = 0.3; // Comfortable listening level
    const dbSPL = dbHL - 10; // Convert HL to approximate SPL
    return referenceGain * Math.pow(10, dbSPL / 20);
  }

  /**
   * Pause test
   */
  pause() {
    this.isPaused = true;
  }

  /**
   * Resume test
   */
  resume() {
    this.isPaused = false;
  }

  /**
   * Stop test
   */
  stop() {
    this.isRunning = false;
    this.isPaused = false;
  }

  /**
   * Get current progress
   * @returns {Object} Progress data
   */
  getProgress() {
    let totalTests, completed, percentage;

    if (this.currentStage === 'standard') {
      totalTests = this.frequencies.length * 2;
      completed = this.completedTests.length;
      percentage = (completed / totalTests) * 100;
    } else {
      // Micro stage - calculate based on problem frequencies
      const standardTests = this.frequencies.length * 2;
      const microTests = this.testQueue.length + this.completedTests.length;
      totalTests = standardTests + microTests;
      completed = standardTests + this.completedTests.length;
      percentage = (completed / totalTests) * 100;
    }

    return {
      stage: this.currentStage,
      completed,
      total: totalTests,
      percentage: Math.round(percentage),
      currentFrequency: this.currentFrequency,
      currentEar: this.currentEar,
      remainingTests: this.testQueue.length,
      problemFrequenciesFound: this.problemFrequencies.length
    };
  }

  /**
   * 🧪 DEBUG MODE: Generate test data for development
   * Simulates audiometry with problem at 4050 Hz (left ear)
   */
  generateTestData() {
    console.log('🧪 DEBUG MODE: Generating test data with problem at 4050 Hz (left ear)');

    this.debugMode = true;
    this.results = {};
    this.microResults = {};
    this.problemFrequencies = [];

    // Standard audiometry results
    const leftEar = {
      125: 10, 250: 10, 500: 15, 750: 15, 1000: 10, 1500: 15, 2000: 10,
      3000: 15, 4000: 30, 6000: 15, 8000: 20, 10000: 25, 12000: 30
    };

    const rightEar = {
      125: 10, 250: 10, 500: 10, 750: 10, 1000: 10, 1500: 10, 2000: 10,
      3000: 10, 4000: 10, 6000: 10, 8000: 15, 10000: 20, 12000: 25
    };

    // Populate standard results
    this.frequencies.forEach(freq => {
      this.results[freq] = { left: leftEar[freq], right: rightEar[freq] };
    });

    // Simulate micro-audiometry around 4050 Hz (±500 Hz = 3500-4500 Hz)
    const microFreqs = [3500, 3600, 3700, 3800, 3900, 4000, 4050, 4100, 4200, 4300, 4400, 4500];
    microFreqs.forEach(freq => {
      const distanceFrom4050 = Math.abs(freq - 4050);
      const leftThreshold = 15 + Math.max(0, 20 - distanceFrom4050 * 0.05);
      this.microResults[freq] = {
        left: Math.round(leftThreshold),
        right: 10
      };
    });

    // Add problem frequency
    this.problemFrequencies.push({
      frequency: 4000,
      centerFrequency: 4050,
      drop: 20,
      ear: 'left',
      priority: 'high',
      reason: 'Pérdida auditiva significativa en rango de tinnitus (TEST DATA)'
    });

    console.log('✅ Test data generated successfully');
    return { results: this.results, microResults: this.microResults, problemFrequencies: this.problemFrequencies };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudiometryEngine;
}
