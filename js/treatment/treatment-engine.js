/**
 * Treatment Engine - Sound Therapies for Tinnitus
 * Tinnitus MVP - Sprint 5-6
 */

class TreatmentEngine {
  constructor() {
    // Configuration
    this.tinnitusFrequency = null;
    this.currentTherapy = null;
    this.isPlaying = false;

    // Audio nodes
    this.oscillators = [];
    this.gainNodes = [];
    this.filters = [];
    this.noiseNode = null;
    this.masterGain = null;

    // Session tracking
    this.sessionStartTime = null;
    this.sessionDuration = 0;
    this.targetDuration = 30 * 60; // 30 minutes default
    this.sessions = [];

    // Volume
    this.volume = 0.3;

    // Callbacks
    this.onSessionStart = null;
    this.onSessionEnd = null;
    this.onProgress = null;
    this.onVolumeChange = null;
  }

  /**
   * Initialize with tinnitus frequency
   */
  async initialize(tinnitusFreq) {
    Logger.info('treatment', '🎵 Inicializando motor de tratamiento');
    Logger.info('treatment', `Frecuencia de tinnitus: ${tinnitusFreq} Hz`);

    this.tinnitusFrequency = tinnitusFreq;

    if (!AudioContextManager.isReady()) {
      Logger.debug('treatment', 'AudioContext no está listo, inicializando...');
      await AudioContextManager.init();
      await AudioContextManager.resume();
      Logger.success('treatment', 'AudioContext inicializado y activado');
    } else {
      Logger.debug('treatment', 'AudioContext ya está listo');
    }

    Logger.success('treatment', '✅ Motor de tratamiento inicializado correctamente');
  }

  /**
   * Start a therapy session
   */
  async startTherapy(therapyType, duration = 30) {
    Logger.info('treatment', `▶️ Iniciando terapia: ${therapyType}`);
    Logger.info('treatment', `Duración objetivo: ${duration} minutos (${duration * 60} segundos)`);

    if (this.isPlaying) {
      Logger.warn('treatment', 'Ya hay una terapia en reproducción, deteniéndola...');
      this.stopTherapy();
    }

    this.currentTherapy = therapyType;
    this.targetDuration = duration * 60; // Convert to seconds
    this.sessionStartTime = Date.now();
    this.isPlaying = true;

    Logger.debug('treatment', `Configuración: Frecuencia=${this.tinnitusFrequency} Hz, Volumen=${this.volume}`);

    if (this.onSessionStart) {
      this.onSessionStart(therapyType, duration);
    }

    // Start appropriate therapy
    Logger.debug('treatment', `Iniciando tipo de terapia: ${therapyType}`);
    const timer = Logger.timeStart('treatment', 'therapy-init');

    switch (therapyType) {
      case 'notched':
        await this.startNotchedTherapy();
        break;
      case 'cr':
        await this.startCRTherapy();
        break;
      case 'masking':
        await this.startMaskingTherapy();
        break;
      case 'ambient':
        await this.startAmbientTherapy();
        break;
    }

    Logger.timeEnd('treatment', 'therapy-init');
    Logger.success('treatment', `✅ Terapia ${therapyType} iniciada correctamente`);

    // Start progress tracking
    this.startProgressTracking();
  }

  /**
   * Notched Sound Therapy
   * White noise with a notch at tinnitus frequency
   */
  async startNotchedTherapy() {
    Logger.info('treatment', '🔇 Configurando terapia Notched Sound');
    const context = AudioContextManager.getContext();

    // Create white noise
    Logger.debug('treatment', `Generando ruido blanco (${2 * context.sampleRate} samples)`);
    const bufferSize = 2 * context.sampleRate;
    const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    // Create buffer source
    this.noiseNode = context.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;
    Logger.debug('treatment', 'Buffer de ruido creado con loop habilitado');

    // Create notch filter at tinnitus frequency
    const notchFilter = context.createBiquadFilter();
    notchFilter.type = 'notch';
    notchFilter.frequency.value = this.tinnitusFrequency;
    notchFilter.Q.value = 10; // Narrow notch
    Logger.info('treatment', `Filtro notch configurado: ${this.tinnitusFrequency} Hz (Q=${notchFilter.Q.value})`);

    // Optional: Add bandpass filters on both sides for wider notch
    const lowpass = context.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = this.tinnitusFrequency - 500;

    const highpass = context.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = this.tinnitusFrequency + 500;
    Logger.debug('treatment', `Filtros adicionales: LP=${lowpass.frequency.value} Hz, HP=${highpass.frequency.value} Hz`);

    // Create gain node
    const gainNode = context.createGain();
    gainNode.gain.value = this.volume;
    Logger.debug('treatment', `Nodo de ganancia creado: ${(this.volume * 100).toFixed(0)}%`);

    // Connect nodes
    this.noiseNode.connect(notchFilter);
    notchFilter.connect(gainNode);
    gainNode.connect(AudioContextManager.getMasterGain());
    Logger.debug('treatment', 'Nodos de audio conectados: Noise → Notch → Gain → Master');

    // Store references
    this.filters.push(notchFilter, lowpass, highpass);
    this.gainNodes.push(gainNode);

    // Start playback
    this.noiseNode.start();
    Logger.success('treatment', `✅ Terapia Notched iniciada en ${this.tinnitusFrequency} Hz`);
  }

  /**
   * CR Neuromodulation (Coordinated Reset)
   * 4 tones around tinnitus frequency
   */
  async startCRTherapy() {
    Logger.info('treatment', '🎼 Configurando terapia CR Neuromodulation');
    const context = AudioContextManager.getContext();

    // Calculate CR frequencies (based on Tass protocol)
    const f_tinnitus = this.tinnitusFrequency;
    const frequencies = [
      f_tinnitus * 0.77,  // f1
      f_tinnitus * 0.90,  // f2
      f_tinnitus * 1.11,  // f3
      f_tinnitus * 1.29   // f4
    ];

    Logger.info('treatment', 'Frecuencias CR calculadas (protocolo Tass):');
    Logger.table('treatment', 'Frecuencias CR', frequencies.map((f, i) => ({
      Tono: `f${i + 1}`,
      Frecuencia: `${f.toFixed(1)} Hz`,
      Relación: `${(frequencies[i] / f_tinnitus).toFixed(2)}x`
    })));

    // Create oscillators and gain nodes for each frequency
    frequencies.forEach((freq, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.value = freq;

      const gainNode = context.createGain();
      gainNode.gain.value = 0; // Start silent

      oscillator.connect(gainNode);
      gainNode.connect(AudioContextManager.getMasterGain());

      this.oscillators.push(oscillator);
      this.gainNodes.push(gainNode);

      oscillator.start();
      Logger.debug('treatment', `Oscilador ${index + 1} creado: ${freq.toFixed(1)} Hz`);
    });

    Logger.success('treatment', `✅ 4 osciladores CR creados y conectados`);

    // Start CR pattern (random sequence)
    Logger.info('treatment', 'Iniciando patrón de estimulación CR...');
    this.startCRPattern();
  }

  /**
   * CR Pattern generator
   * Plays tones in random order with specific timing
   */
  startCRPattern() {
    const playTone = (index) => {
      if (!this.isPlaying) return;

      const gainNode = this.gainNodes[index];
      const now = AudioContextManager.getCurrentTime();

      // Fade in
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(this.volume, now + 0.05);

      // Hold
      gainNode.gain.linearRampToValueAtTime(this.volume, now + 0.15);

      // Fade out
      gainNode.gain.linearRampToValueAtTime(0, now + 0.25);
    };

    // CR cycle: play 4 tones in random order, then repeat
    const runCycle = () => {
      if (!this.isPlaying) return;

      // Shuffle indices
      const indices = [0, 1, 2, 3];
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }

      // Play each tone with 750ms interval
      indices.forEach((index, i) => {
        setTimeout(() => {
          if (this.isPlaying) {
            playTone(index);
          }
        }, i * 750);
      });

      // Schedule next cycle after 3 seconds
      setTimeout(runCycle, 3000);
    };

    runCycle();
  }

  /**
   * Sound Masking
   * Various noise types
   */
  async startMaskingTherapy(noiseType = 'white') {
    const context = AudioContextManager.getContext();

    const bufferSize = 2 * context.sampleRate;
    const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Generate noise based on type
    switch (noiseType) {
      case 'white':
        // White noise (equal power across frequencies)
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        break;

      case 'pink':
        // Pink noise (1/f power spectrum)
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          output[i] *= 0.11;
          b6 = white * 0.115926;
        }
        break;

      case 'brown':
        // Brown noise (1/f² power spectrum)
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        }
        break;

      case 'narrowband':
        // Narrowband noise centered at tinnitus frequency
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        // Will apply bandpass filter below
        break;
    }

    // Create buffer source
    this.noiseNode = context.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    // Create gain node
    const gainNode = context.createGain();
    gainNode.gain.value = this.volume;

    // Connect nodes
    if (noiseType === 'narrowband') {
      // Add bandpass filter for narrowband
      const bandpass = context.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = this.tinnitusFrequency;
      bandpass.Q.value = 1;

      this.noiseNode.connect(bandpass);
      bandpass.connect(gainNode);
      this.filters.push(bandpass);
    } else {
      this.noiseNode.connect(gainNode);
    }

    gainNode.connect(AudioContextManager.getMasterGain());

    // Store references
    this.gainNodes.push(gainNode);

    // Start playback
    this.noiseNode.start();

    console.log(`${noiseType} noise masking started`);
  }

  /**
   * Ambient Sounds
   * Relaxing natural sounds
   */
  async startAmbientTherapy(soundType = 'rain') {
    // For MVP, we'll use synthesized ambient sounds
    // In production, these would be audio files

    const context = AudioContextManager.getContext();

    switch (soundType) {
      case 'rain':
        await this.synthesizeRain();
        break;
      case 'ocean':
        await this.synthesizeOcean();
        break;
      case 'wind':
        await this.synthesizeWind();
        break;
      case 'forest':
        await this.synthesizeForest();
        break;
    }

    console.log(`${soundType} ambient sound started`);
  }

  /**
   * Synthesize rain sound
   */
  async synthesizeRain() {
    // Rain = filtered white noise with random amplitude variations
    await this.startMaskingTherapy('white');

    // Add variation by modulating volume
    const gainNode = this.gainNodes[0];
    const lfo = AudioContextManager.getContext().createOscillator();
    lfo.frequency.value = 0.5; // Slow variation

    const lfoGain = AudioContextManager.getContext().createGain();
    lfoGain.gain.value = 0.1;

    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain);

    lfo.start();
    this.oscillators.push(lfo);
  }

  /**
   * Synthesize ocean sound
   */
  async synthesizeOcean() {
    // Ocean = low frequency noise with wave-like variations
    await this.startMaskingTherapy('brown');

    // Add wave effect with LFO
    const gainNode = this.gainNodes[0];
    const lfo = AudioContextManager.getContext().createOscillator();
    lfo.frequency.value = 0.1; // Very slow for waves

    const lfoGain = AudioContextManager.getContext().createGain();
    lfoGain.gain.value = 0.2;

    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain);

    lfo.start();
    this.oscillators.push(lfo);
  }

  /**
   * Synthesize wind sound
   */
  async synthesizeWind() {
    // Wind = filtered pink noise
    await this.startMaskingTherapy('pink');
  }

  /**
   * Synthesize forest sound
   */
  async synthesizeForest() {
    // Forest = combination of filtered noises
    await this.startMaskingTherapy('brown');
  }

  /**
   * Stop current therapy
   */
  stopTherapy() {
    if (!this.isPlaying) {
      Logger.warn('treatment', 'No hay terapia en reproducción');
      return;
    }

    Logger.info('treatment', '⏹️ Deteniendo terapia...');
    this.isPlaying = false;

    // Stop all oscillators
    Logger.debug('treatment', `Deteniendo ${this.oscillators.length} osciladores`);
    this.oscillators.forEach((osc, i) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        Logger.warn('treatment', `Error deteniendo oscilador ${i}: ${e.message}`);
      }
    });

    // Stop noise node
    if (this.noiseNode) {
      Logger.debug('treatment', 'Deteniendo nodo de ruido');
      try {
        this.noiseNode.stop();
        this.noiseNode.disconnect();
      } catch (e) {
        Logger.warn('treatment', `Error deteniendo ruido: ${e.message}`);
      }
    }

    // Disconnect all nodes
    Logger.debug('treatment', `Desconectando ${this.gainNodes.length} nodos de ganancia y ${this.filters.length} filtros`);
    this.gainNodes.forEach(node => node.disconnect());
    this.filters.forEach(filter => filter.disconnect());

    // Clear arrays
    this.oscillators = [];
    this.gainNodes = [];
    this.filters = [];
    this.noiseNode = null;

    // Save session
    if (this.sessionStartTime) {
      const duration = (Date.now() - this.sessionStartTime) / 1000;
      Logger.info('treatment', `Duración de sesión: ${duration.toFixed(0)} segundos`);
      this.saveSession(duration);
    }

    if (this.onSessionEnd) {
      this.onSessionEnd(this.currentTherapy, this.sessionDuration);
    }

    Logger.success('treatment', '✅ Terapia detenida correctamente');
  }

  /**
   * Set volume
   */
  setVolume(volume) {
    const oldVolume = this.volume;
    this.volume = Utils.clamp(volume, 0, 1);

    Logger.debug('treatment', `Volumen ajustado: ${(oldVolume * 100).toFixed(0)}% → ${(this.volume * 100).toFixed(0)}%`);

    // Update all gain nodes
    if (this.gainNodes.length > 0) {
      this.gainNodes.forEach(node => {
        node.gain.value = this.volume;
      });
      Logger.debug('treatment', `${this.gainNodes.length} nodos de ganancia actualizados`);
    }

    if (this.onVolumeChange) {
      this.onVolumeChange(this.volume);
    }
  }

  /**
   * Start progress tracking
   */
  startProgressTracking() {
    Logger.debug('treatment', 'Iniciando seguimiento de progreso');

    const updateProgress = () => {
      if (!this.isPlaying) return;

      this.sessionDuration = (Date.now() - this.sessionStartTime) / 1000;
      const percentage = Math.min(100, (this.sessionDuration / this.targetDuration) * 100);

      // Log progress every 10%
      if (percentage % 10 < 0.5) {
        Logger.debug('treatment', `Progreso: ${percentage.toFixed(0)}% (${this.sessionDuration.toFixed(0)}s / ${this.targetDuration}s)`);
      }

      if (this.onProgress) {
        this.onProgress(this.sessionDuration, this.targetDuration, percentage);
      }

      // Check if session complete
      if (this.sessionDuration >= this.targetDuration) {
        Logger.success('treatment', '🎉 Sesión completada - duración objetivo alcanzada');
        this.stopTherapy();
        return;
      }

      // Continue tracking
      setTimeout(updateProgress, 1000);
    };

    updateProgress();
  }

  /**
   * Save session to storage
   */
  saveSession(duration) {
    const session = {
      therapy: this.currentTherapy,
      duration: Math.round(duration),
      targetDuration: this.targetDuration,
      frequency: this.tinnitusFrequency,
      completed: duration >= this.targetDuration - 10, // Within 10 seconds
      timestamp: new Date().toISOString()
    };

    Logger.info('treatment', '💾 Guardando sesión de tratamiento');
    Logger.group('treatment', 'Detalles de Sesión');
    Logger.info('treatment', `Terapia: ${session.therapy}`);
    Logger.info('treatment', `Duración: ${session.duration}s / ${session.targetDuration}s`);
    Logger.info('treatment', `Completada: ${session.completed ? 'Sí ✅' : 'No ❌'}`);
    Logger.info('treatment', `Frecuencia: ${session.frequency} Hz`);
    Logger.groupEnd();

    this.sessions.push(session);
    Storage.saveTreatmentSession(session);

    Logger.success('treatment', '✅ Sesión guardada en LocalStorage');
  }

  /**
   * Get therapy info
   */
  getTherapyInfo(therapyType) {
    const info = {
      notched: {
        name: 'Notched Sound Therapy',
        description: 'Ruido blanco con muesca en tu frecuencia de tinnitus',
        duration: '30-60 min/día',
        evidence: 'Estudios de Okamoto et al. (2010)',
        effectiveness: 'Media-Alta'
      },
      cr: {
        name: 'CR Neuromodulation',
        description: '4 tonos coordinados alrededor de tu frecuencia',
        duration: '4-6 horas/día',
        evidence: 'Tass et al. (2012) - Dispositivo Desyncra',
        effectiveness: 'Alta'
      },
      masking: {
        name: 'Sound Masking',
        description: 'Enmascaramiento con diferentes tipos de ruido',
        duration: 'Según necesidad',
        evidence: 'Protocolo clínico estándar',
        effectiveness: 'Media'
      },
      ambient: {
        name: 'Sonidos Ambientales',
        description: 'Sonidos naturales relajantes',
        duration: 'Según necesidad',
        evidence: 'Terapia de relajación',
        effectiveness: 'Baja-Media'
      }
    };

    return info[therapyType];
  }

  /**
   * Change therapy sub-type (for masking and ambient)
   */
  changeSubType(subType) {
    if (this.currentTherapy === 'masking') {
      this.stopTherapy();
      this.startMaskingTherapy(subType);
    } else if (this.currentTherapy === 'ambient') {
      this.stopTherapy();
      this.synthesizeAmbient(subType);
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TreatmentEngine;
}
