/**
 * Treatment Engine - Sound Therapies for Tinnitus
 * Tinnitus MVP - Sprint 5-6
 */

class TreatmentEngine {
  constructor() {
    // Configuration
    this.tinnitusFrequency = null;
    this.currentTherapy = null;
    this.currentSubType = null;
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

    // Hybrid therapy controls
    this.hybridBalance = 0.5; // 0 = all therapy, 1 = all ambient (0.5 = 50/50)
    this.therapyGain = null; // Gain node for therapy stream
    this.ambientGain = null; // Gain node for ambient stream

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
  async startTherapy(therapyType, duration = 30, subType = null) {
    Logger.info('treatment', `▶️ Iniciando terapia: ${therapyType}`);
    Logger.info('treatment', `Duración objetivo: ${duration} minutos (${duration * 60} segundos)`);

    if (this.isPlaying) {
      Logger.warn('treatment', 'Ya hay una terapia en reproducción, deteniéndola...');
      this.stopTherapy();
    }

    this.currentTherapy = therapyType;
    this.currentSubType = subType;
    this.targetDuration = duration * 60; // Convert to seconds
    this.sessionStartTime = Date.now();
    this.isPlaying = true;

    Logger.debug('treatment', `Configuración: Frecuencia=${this.tinnitusFrequency} Hz, Volumen=${this.volume}`);

    if (this.onSessionStart) {
      this.onSessionStart(therapyType, duration);
    }

    // Start appropriate therapy
    Logger.debug('treatment', `Iniciando tipo de terapia: ${therapyType}${subType ? ' (' + subType + ')' : ''}`);
    const timer = Logger.timeStart('treatment', 'therapy-init');

    switch (therapyType) {
      case 'notched':
        await this.startNotchedTherapy();
        break;
      case 'cr':
        await this.startCRTherapy();
        break;
      case 'masking':
        await this.startMaskingTherapy(subType || 'white');
        break;
      case 'ambient':
        await this.startAmbientTherapy(subType || 'rain');
        break;
      case 'hybrid-notched-ambient':
        await this.startHybridNotchedAmbient(subType || 'rain');
        break;
      case 'hybrid-cr-ambient':
        await this.startHybridCRAmbient(subType || 'rain');
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
    Logger.info('treatment', `🌊 Configurando terapia de enmascaramiento: ${noiseType} noise`);

    // Save current subtype
    this.currentSubType = noiseType;

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
      case 'red':
        // Brown/Red noise (1/f² power spectrum)
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        }
        break;

      case 'blue':
        // Blue noise (power increases with frequency)
        let lastBlue = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = white - lastBlue;
          lastBlue = white;
          output[i] *= 0.5;
        }
        break;

      case 'violet':
        // Violet noise (steep high frequency emphasis)
        let lastViolet1 = 0;
        let lastViolet2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          const diff = white - lastViolet1;
          output[i] = diff - lastViolet2;
          lastViolet2 = lastViolet1;
          lastViolet1 = white;
          output[i] *= 0.3;
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

    Logger.success('treatment', `✅ Enmascaramiento ${noiseType} noise iniciado correctamente`);
  }

  /**
   * Ambient Sounds
   * Relaxing natural sounds
   */
  async startAmbientTherapy(soundType = 'rain') {
    Logger.info('treatment', `🌲 Configurando sonidos ambientales: ${soundType}`);

    // Save current subtype
    this.currentSubType = soundType;

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
      case 'river':
        await this.synthesizeRiver();
        break;
      case 'waterfall':
        await this.synthesizeWaterfall();
        break;
      case 'birds':
        await this.synthesizeBirds();
        break;
      case 'thunder':
        await this.synthesizeThunder();
        break;
      case 'crickets':
        await this.synthesizeCrickets();
        break;
      case 'stream':
        await this.synthesizeStream();
        break;
    }

    Logger.success('treatment', `✅ Sonido ambiental ${soundType} iniciado correctamente`);
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
   * Synthesize river sound
   */
  async synthesizeRiver() {
    // River = brown noise with medium variation
    await this.startMaskingTherapy('brown');

    const gainNode = this.gainNodes[0];
    const lfo = AudioContextManager.getContext().createOscillator();
    lfo.frequency.value = 0.3;

    const lfoGain = AudioContextManager.getContext().createGain();
    lfoGain.gain.value = 0.15;

    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain);
    lfo.start();
    this.oscillators.push(lfo);
  }

  /**
   * Synthesize waterfall sound
   */
  async synthesizeWaterfall() {
    // Waterfall = white noise with rapid variation
    await this.startMaskingTherapy('white');

    const gainNode = this.gainNodes[0];
    const lfo = AudioContextManager.getContext().createOscillator();
    lfo.frequency.value = 1.5;

    const lfoGain = AudioContextManager.getContext().createGain();
    lfoGain.gain.value = 0.2;

    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain);
    lfo.start();
    this.oscillators.push(lfo);
  }

  /**
   * Synthesize birds sound
   */
  async synthesizeBirds() {
    // Birds = pink noise base + random chirps
    await this.startMaskingTherapy('pink');

    const context = AudioContextManager.getContext();

    // Create periodic chirps
    const chirp = () => {
      if (!this.isPlaying) return;

      const freq = 2000 + Math.random() * 3000;
      const osc = context.createOscillator();
      osc.frequency.value = freq;
      osc.type = 'sine';

      const gain = context.createGain();
      gain.gain.value = 0;

      osc.connect(gain);
      gain.connect(AudioContextManager.getMasterGain());

      const now = context.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.01);
      gain.gain.linearRampToValueAtTime(0, now + 0.1);

      osc.start(now);
      osc.stop(now + 0.1);

      setTimeout(chirp, 2000 + Math.random() * 3000);
    };

    chirp();
  }

  /**
   * Synthesize thunder sound
   */
  async synthesizeThunder() {
    // Thunder = brown noise with occasional rumbles
    await this.startMaskingTherapy('brown');

    const context = AudioContextManager.getContext();

    // Create periodic thunder rumbles
    const rumble = () => {
      if (!this.isPlaying) return;

      const osc = context.createOscillator();
      osc.frequency.value = 40;
      osc.type = 'sine';

      const gain = context.createGain();
      gain.gain.value = 0;

      osc.connect(gain);
      gain.connect(AudioContextManager.getMasterGain());

      const now = context.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 3);

      osc.start(now);
      osc.stop(now + 3);

      setTimeout(rumble, 8000 + Math.random() * 12000);
    };

    rumble();
  }

  /**
   * Synthesize crickets sound
   */
  async synthesizeCrickets() {
    // Crickets = high frequency chirps
    const context = AudioContextManager.getContext();

    const chirp = () => {
      if (!this.isPlaying) return;

      const freq = 3000 + Math.random() * 2000;
      const osc = context.createOscillator();
      osc.frequency.value = freq;
      osc.type = 'square';

      const gain = context.createGain();
      gain.gain.value = 0;

      osc.connect(gain);
      gain.connect(AudioContextManager.getMasterGain());

      const now = context.currentTime;

      // Rapid chirp pattern
      for (let i = 0; i < 5; i++) {
        const t = now + i * 0.05;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.03, t + 0.02);
        gain.gain.linearRampToValueAtTime(0, t + 0.04);
      }

      osc.start(now);
      osc.stop(now + 0.3);

      setTimeout(chirp, 500 + Math.random() * 1000);
    };

    // Start multiple cricket chirpers
    for (let i = 0; i < 3; i++) {
      setTimeout(() => chirp(), i * 300);
    }
  }

  /**
   * Synthesize stream sound
   */
  async synthesizeStream() {
    // Stream = pink noise with gentle flow
    await this.startMaskingTherapy('pink');

    const gainNode = this.gainNodes[0];
    const lfo = AudioContextManager.getContext().createOscillator();
    lfo.frequency.value = 0.2;

    const lfoGain = AudioContextManager.getContext().createGain();
    lfoGain.gain.value = 0.1;

    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain);
    lfo.start();
    this.oscillators.push(lfo);
  }

  /**
   * Stop only the audio nodes without ending the session
   * Used for changing sounds during an active session
   */
  stopAudioOnly() {
    Logger.debug('treatment', '🔄 Deteniendo audio para cambio de sonido...');

    // Stop all oscillators
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
      try {
        this.noiseNode.stop();
        this.noiseNode.disconnect();
      } catch (e) {
        Logger.warn('treatment', `Error deteniendo ruido: ${e.message}`);
      }
    }

    // Disconnect all nodes
    this.gainNodes.forEach(node => node.disconnect());
    this.filters.forEach(filter => filter.disconnect());

    // Clear arrays
    this.oscillators = [];
    this.gainNodes = [];
    this.filters = [];
    this.noiseNode = null;

    Logger.debug('treatment', '✅ Audio detenido, sesión continúa');
  }

  /**
   * Stop current therapy
   */
  async stopTherapy() {
    if (!this.isPlaying) {
      Logger.warn('treatment', 'No hay terapia en reproducción');
      return;
    }

    Logger.info('treatment', '⏹️ Deteniendo terapia...');
    this.isPlaying = false;

    // Fade out hybrid therapies before stopping
    if ((this.currentTherapy === 'hybrid-notched-ambient' ||
         this.currentTherapy === 'hybrid-cr-ambient') &&
        this.therapyGain && this.ambientGain) {
      await this.fadeOutHybridTherapy();
    }

    // Stop audio
    this.stopAudioOnly();

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
   * Update frequency in real-time (fine-tuning during session)
   */
  async updateFrequency(newFrequency) {
    const oldFrequency = this.tinnitusFrequency;
    this.tinnitusFrequency = newFrequency;

    Logger.info('treatment', `🎯 Actualizando frecuencia en tiempo real: ${oldFrequency} Hz → ${newFrequency} Hz`);

    // If a therapy is playing, restart it with the new frequency
    if (this.isPlaying && this.currentTherapy) {
      Logger.debug('treatment', `Reiniciando terapia ${this.currentTherapy} con nueva frecuencia`);

      // Store current state
      const currentSubType = this.currentSubType;
      const wasPlaying = this.isPlaying;

      // Stop audio only (not the session)
      this.stopAudioOnly();

      // Restart therapy with new frequency
      switch (this.currentTherapy) {
        case 'notched':
          await this.startNotchedTherapy();
          break;
        case 'cr':
          await this.startCRTherapy();
          break;
        case 'masking':
          await this.startMaskingTherapy(currentSubType || 'white');
          break;
        case 'ambient':
          await this.startAmbientTherapy(currentSubType || 'rain');
          break;
      }

      Logger.success('treatment', `✅ Frecuencia actualizada y terapia reiniciada`);
    } else {
      Logger.info('treatment', 'Frecuencia actualizada (se aplicará al iniciar terapia)');
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
        description: 'Ruido blanco con muesca precisa en tu frecuencia de tinnitus',
        duration: '30-60 min/día',
        evidence: 'Estudios de Okamoto et al. (2010)',
        effectiveness: 'Alta',
        variants: ['Muesca estrecha', 'Muesca amplia', 'Doble muesca']
      },
      cr: {
        name: 'CR Neuromodulation',
        description: '4 tonos coordinados alrededor de tu frecuencia (Protocolo Tass)',
        duration: '4-6 horas/día',
        evidence: 'Tass et al. (2012) - Dispositivo Desyncra',
        effectiveness: 'Muy Alta',
        variants: ['Estándar', 'Rápido', 'Lento']
      },
      masking: {
        name: 'Sound Masking',
        description: 'Enmascaramiento con 7 tipos diferentes de ruido especializado',
        duration: 'Según necesidad',
        evidence: 'Protocolo clínico estándar',
        effectiveness: 'Media-Alta',
        variants: ['White', 'Pink', 'Brown', 'Blue', 'Violet', 'Narrowband', 'Red']
      },
      ambient: {
        name: 'Sonidos Ambientales',
        description: '10 sonidos naturales relajantes para enmascaramiento suave',
        duration: 'Según necesidad',
        evidence: 'Terapia de relajación y habituación',
        effectiveness: 'Media',
        variants: ['Rain', 'Ocean', 'River', 'Waterfall', 'Wind', 'Forest', 'Birds', 'Thunder', 'Crickets', 'Stream']
      },
      'hybrid-notched-ambient': {
        name: 'Notched + Ambiental',
        description: 'Ruido blanco con muesca + sonidos naturales relajantes',
        duration: '30-60 min/día',
        evidence: 'Okamoto et al. (2010) + mejora adherencia',
        effectiveness: 'Alta',
        variants: ['Rain', 'Ocean', 'Forest', 'River', 'Waterfall', 'Wind', 'Birds', 'Cafe', 'Fan', 'Library']
      },
      'hybrid-cr-ambient': {
        name: 'CR + Ambiental',
        description: 'Tonos CR coordinados + sonidos naturales de fondo',
        duration: '4-6 horas/día',
        evidence: 'Protocolo Heidelberg + Tass et al. (2012)',
        effectiveness: 'Muy Alta',
        variants: ['Rain', 'Ocean', 'Forest', 'River', 'Waterfall', 'Wind', 'Birds', 'Cafe', 'Fan', 'Library']
      }
    };

    return info[therapyType];
  }

  /**
   * Change therapy sub-type (for masking and ambient)
   */
  async changeSubType(subType) {
    Logger.info('treatment', `🔄 Cambiando subtipo a: ${subType}`);

    const wasPlaying = this.isPlaying;

    if (this.currentTherapy === 'masking') {
      if (wasPlaying) {
        // Solo detener audio, NO la sesión completa
        this.stopAudioOnly();
      }
      await this.startMaskingTherapy(subType);
      // No necesitamos restaurar isPlaying porque nunca lo cambiamos
    } else if (this.currentTherapy === 'ambient') {
      if (wasPlaying) {
        // Solo detener audio, NO la sesión completa
        this.stopAudioOnly();
      }
      await this.startAmbientTherapy(subType);
      // No necesitamos restaurar isPlaying porque nunca lo cambiamos
    } else if (this.currentTherapy === 'hybrid-notched-ambient') {
      if (wasPlaying) {
        this.stopAudioOnly();
      }
      await this.startHybridNotchedAmbient(subType);
    } else if (this.currentTherapy === 'hybrid-cr-ambient') {
      if (wasPlaying) {
        this.stopAudioOnly();
      }
      await this.startHybridCRAmbient(subType);
    }

    Logger.success('treatment', `✅ Subtipo cambiado a: ${subType}`);
  }

  /**
   * HYBRID THERAPIES
   * Combinations of therapeutic and ambient sounds
   */

  /**
   * Hybrid: Notched + Ambient
   * Combines notched therapy with relaxing ambient sounds
   */
  async startHybridNotchedAmbient(ambientType = 'rain') {
    Logger.info('treatment', `🎭 Iniciando terapia híbrida: Notched + ${ambientType}`);

    // Save current subtype
    this.currentSubType = ambientType;

    const context = AudioContextManager.getContext();

    // Create separate gain nodes for therapy and ambient
    this.therapyGain = context.createGain();
    this.ambientGain = context.createGain();

    // Set gains based on balance (default 60% therapy, 40% ambient)
    const therapyVolume = this.volume * (1 - this.hybridBalance * 0.4);
    const ambientVolume = this.volume * (this.hybridBalance * 0.4 + 0.4);

    // Start at 0 for fade in
    this.therapyGain.gain.value = 0;
    this.ambientGain.gain.value = 0;

    // Fade in over 2 seconds
    const currentTime = context.currentTime;
    this.therapyGain.gain.linearRampToValueAtTime(therapyVolume, currentTime + 2);
    this.ambientGain.gain.linearRampToValueAtTime(ambientVolume, currentTime + 2);

    // Connect to master
    const masterGain = AudioContextManager.getMasterGain();
    this.therapyGain.connect(masterGain);
    this.ambientGain.connect(masterGain);

    // Start notched therapy (white noise with notch)
    const bufferSize = 2 * context.sampleRate;
    const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.noiseNode = context.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    // Create notch filter
    const notchFilter = context.createBiquadFilter();
    notchFilter.type = 'notch';
    notchFilter.frequency.value = this.tinnitusFrequency;
    notchFilter.Q.value = 10;

    // Connect therapy chain
    this.noiseNode.connect(notchFilter);
    notchFilter.connect(this.therapyGain);
    this.filters.push(notchFilter);

    // Start notched noise
    this.noiseNode.start();

    // Add ambient sound
    await this.addAmbientSound(ambientType, this.ambientGain);

    Logger.success('treatment', `✅ Terapia híbrida Notched + ${ambientType} iniciada`);
  }

  /**
   * Hybrid: CR + Ambient
   * Combines CR neuromodulation with relaxing ambient sounds
   */
  async startHybridCRAmbient(ambientType = 'rain') {
    Logger.info('treatment', `🎭 Iniciando terapia híbrida: CR + ${ambientType}`);

    // Save current subtype
    this.currentSubType = ambientType;

    const context = AudioContextManager.getContext();

    // Create separate gain nodes for therapy and ambient
    this.therapyGain = context.createGain();
    this.ambientGain = context.createGain();

    // Set gains based on balance (default 60% CR, 40% ambient)
    const therapyVolume = this.volume * (1 - this.hybridBalance * 0.4);
    const ambientVolume = this.volume * (this.hybridBalance * 0.4 + 0.4);

    // Start at 0 for fade in
    this.therapyGain.gain.value = 0;
    this.ambientGain.gain.value = 0;

    // Fade in over 2 seconds
    const currentTime = context.currentTime;
    this.therapyGain.gain.linearRampToValueAtTime(therapyVolume, currentTime + 2);
    this.ambientGain.gain.linearRampToValueAtTime(ambientVolume, currentTime + 2);

    // Connect to master
    const masterGain = AudioContextManager.getMasterGain();
    this.therapyGain.connect(masterGain);
    this.ambientGain.connect(masterGain);

    // Start CR therapy (4 tones)
    const f = this.tinnitusFrequency;
    const frequencies = [
      f * 0.75,  // f1: 25% below
      f * 0.87,  // f2: 13% below
      f * 1.13,  // f3: 13% above
      f * 1.25   // f4: 25% above
    ];

    // Create pulsing pattern for each frequency
    frequencies.forEach((freq, i) => {
      const osc = context.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = context.createGain();
      gain.gain.value = 0;

      // Pulsing pattern: 250ms on, 750ms off, staggered
      const onDuration = 0.25;
      const offDuration = 0.75;
      const cycleDuration = onDuration + offDuration;
      const startOffset = i * onDuration; // Stagger start times

      // Schedule pulses
      let time = context.currentTime + startOffset;
      for (let j = 0; j < 1000; j++) { // Schedule many cycles
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.setValueAtTime(0, time + onDuration);
        time += cycleDuration;
      }

      osc.connect(gain);
      gain.connect(this.therapyGain);

      osc.start();
      this.oscillators.push(osc);
      this.gainNodes.push(gain);
    });

    // Add ambient sound
    await this.addAmbientSound(ambientType, this.ambientGain);

    Logger.success('treatment', `✅ Terapia híbrida CR + ${ambientType} iniciada`);
  }

  /**
   * Helper: Add ambient sound to a specific gain node
   */
  async addAmbientSound(soundType, targetGain) {
    const context = AudioContextManager.getContext();

    switch (soundType) {
      case 'rain':
      case 'ocean':
      case 'river':
      case 'waterfall':
        await this.synthesizeRainToGain(targetGain);
        break;

      case 'forest':
      case 'birds':
      case 'wind':
        await this.synthesizeForestToGain(targetGain);
        break;

      case 'cafe':
      case 'library':
      case 'fan':
      case 'train':
        await this.synthesizeCafeToGain(targetGain);
        break;

      default:
        // Default to rain
        await this.synthesizeRainToGain(targetGain);
    }
  }

  /**
   * Synthesize rain sound to specific gain node
   */
  async synthesizeRainToGain(targetGain) {
    const context = AudioContextManager.getContext();
    const bufferSize = 2 * context.sampleRate;
    const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const source = context.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    // Bandpass filter for rain-like sound
    const bandpass = context.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 2000;
    bandpass.Q.value = 0.5;

    // Lowpass for smoothness
    const lowpass = context.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 4000;

    source.connect(bandpass);
    bandpass.connect(lowpass);
    lowpass.connect(targetGain);

    source.start();

    // Store references
    this.oscillators.push(source); // Reusing array for all sources
    this.filters.push(bandpass, lowpass);
  }

  /**
   * Synthesize forest sound to specific gain node
   */
  async synthesizeForestToGain(targetGain) {
    const context = AudioContextManager.getContext();
    const bufferSize = 2 * context.sampleRate;
    const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const source = context.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    // Multiple bandpass filters for complex nature sound
    const bp1 = context.createBiquadFilter();
    bp1.type = 'bandpass';
    bp1.frequency.value = 1000;
    bp1.Q.value = 1;

    const bp2 = context.createBiquadFilter();
    bp2.type = 'bandpass';
    bp2.frequency.value = 3000;
    bp2.Q.value = 2;

    source.connect(bp1);
    bp1.connect(bp2);
    bp2.connect(targetGain);

    source.start();

    // Store references
    this.oscillators.push(source);
    this.filters.push(bp1, bp2);
  }

  /**
   * Synthesize cafe/ambient sound to specific gain node
   */
  async synthesizeCafeToGain(targetGain) {
    const context = AudioContextManager.getContext();
    const bufferSize = 2 * context.sampleRate;
    const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Generate brown noise
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 2.5;
    }

    const source = context.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const lowpass = context.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 500;

    source.connect(lowpass);
    lowpass.connect(targetGain);

    source.start();

    // Store references
    this.oscillators.push(source);
    this.filters.push(lowpass);
  }

  /**
   * Set hybrid balance (0 = all therapy, 1 = all ambient)
   */
  setHybridBalance(balance) {
    this.hybridBalance = Math.max(0, Math.min(1, balance)); // Clamp 0-1

    if (this.therapyGain && this.ambientGain) {
      const therapyVolume = this.volume * (1 - this.hybridBalance * 0.4);
      const ambientVolume = this.volume * (this.hybridBalance * 0.4 + 0.4);

      this.therapyGain.gain.value = therapyVolume;
      this.ambientGain.gain.value = ambientVolume;

      Logger.info('treatment', `🎚️ Balance híbrido ajustado: ${Math.round(this.hybridBalance * 100)}% (Terapia: ${Math.round(therapyVolume * 100)}%, Ambient: ${Math.round(ambientVolume * 100)}%)`);
    }
  }

  /**
   * Generate audio offline for download
   * Creates audio file with current settings
   * @param {number} durationMinutes - Duration in minutes (5-30)
   * @param {string} quality - 'high' (44100 Hz) or 'low' (22050 Hz)
   */
  async generateOfflineAudio(durationMinutes = 5, quality = 'high') {
    Logger.info('treatment', `🎙️ Generando audio offline: ${durationMinutes} minutos (calidad: ${quality})`);
    Logger.info('treatment', `Configuración: ${this.currentTherapy}${this.currentSubType ? ' (' + this.currentSubType + ')' : ''}, ${this.tinnitusFrequency} Hz, volumen ${Math.round(this.volume * 100)}%`);

    const sampleRate = quality === 'high' ? 44100 : 22050;
    const durationSeconds = durationMinutes * 60;
    const offlineContext = new OfflineAudioContext(2, sampleRate * durationSeconds, sampleRate);

    // Create master gain for volume control
    const masterGain = offlineContext.createGain();
    masterGain.gain.value = this.volume;
    masterGain.connect(offlineContext.destination);

    // Generate therapy based on current type
    switch (this.currentTherapy) {
      case 'notched':
        await this.generateNotchedOffline(offlineContext, masterGain);
        break;
      case 'cr':
        await this.generateCROffline(offlineContext, masterGain);
        break;
      case 'masking':
        await this.generateMaskingOffline(offlineContext, masterGain, this.currentSubType || 'white');
        break;
      case 'ambient':
        await this.generateAmbientOffline(offlineContext, masterGain, this.currentSubType || 'rain');
        break;
      case 'hybrid-notched-ambient':
        await this.generateHybridNotchedOffline(offlineContext, masterGain, this.currentSubType || 'rain');
        break;
      case 'hybrid-cr-ambient':
        await this.generateHybridCROffline(offlineContext, masterGain, this.currentSubType || 'rain');
        break;
      default:
        throw new Error(`Tipo de terapia no soportado: ${this.currentTherapy}`);
    }

    Logger.info('treatment', '⏳ Renderizando audio... (esto puede tomar unos segundos)');
    const audioBuffer = await offlineContext.startRendering();
    Logger.success('treatment', '✅ Audio generado correctamente');

    return audioBuffer;
  }

  /**
   * Generate Notched Therapy offline
   */
  async generateNotchedOffline(context, destination) {
    Logger.debug('treatment', '🎵 Generando Notched Therapy offline');

    // Create white noise
    const bufferSize = context.length;
    const noiseBuffer = context.createBuffer(2, bufferSize, context.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const output = noiseBuffer.getChannelData(channel);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    }

    const noiseSource = context.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    // Create notch filter
    const notchFilter = context.createBiquadFilter();
    notchFilter.type = 'notch';
    notchFilter.frequency.value = this.tinnitusFrequency;
    notchFilter.Q.value = 10;

    // Connect nodes
    noiseSource.connect(notchFilter);
    notchFilter.connect(destination);
    noiseSource.start(0);
  }

  /**
   * Generate CR Neuromodulation offline
   */
  async generateCROffline(context, destination) {
    Logger.debug('treatment', '🎵 Generando CR Neuromodulation offline');

    const f = this.tinnitusFrequency;
    const frequencies = [
      f * 0.75,  // f1: 25% below
      f * 0.87,  // f2: 13% below
      f * 1.13,  // f3: 13% above
      f * 1.25   // f4: 25% above
    ];

    // Create 4 oscillators
    frequencies.forEach((freq, i) => {
      const osc = context.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = context.createGain();
      gain.gain.value = 0.15; // Lower volume for each tone

      // Create pulsing pattern (250ms on, 750ms off)
      const duration = context.length / context.sampleRate;
      let time = i * 0.25; // Stagger start times

      while (time < duration) {
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.setValueAtTime(0, time + 0.25);
        time += 1; // 1 second cycle
      }

      osc.connect(gain);
      gain.connect(destination);
      osc.start(0);
    });
  }

  /**
   * Generate Masking Therapy offline
   */
  async generateMaskingOffline(context, destination, noiseType) {
    Logger.debug('treatment', `🎵 Generando Masking (${noiseType}) offline`);

    const bufferSize = context.length;
    const noiseBuffer = context.createBuffer(2, bufferSize, context.sampleRate);

    // Generate noise for both channels
    for (let channel = 0; channel < 2; channel++) {
      const output = noiseBuffer.getChannelData(channel);

      switch (noiseType) {
        case 'white':
          for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
          }
          break;

        case 'pink':
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
        case 'red':
          let lastOut = 0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5;
          }
          break;

        case 'blue':
          let lastBlue = 0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = white - lastBlue;
            lastBlue = white;
          }
          break;

        case 'violet':
          let lastViolet = 0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            const current = white - lastViolet;
            output[i] = current - lastViolet;
            lastViolet = current;
          }
          break;

        case 'narrowband':
          // White noise that will be filtered
          for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
          }
          break;
      }
    }

    const noiseSource = context.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    if (noiseType === 'narrowband') {
      const bandpass = context.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = this.tinnitusFrequency;
      bandpass.Q.value = 1;
      noiseSource.connect(bandpass);
      bandpass.connect(destination);
    } else {
      noiseSource.connect(destination);
    }

    noiseSource.start(0);
  }

  /**
   * Generate Ambient Therapy offline
   */
  async generateAmbientOffline(context, destination, soundType) {
    Logger.debug('treatment', `🎵 Generando Ambient (${soundType}) offline`);

    // For ambient sounds, we'll use synthesized versions
    // In a production app, you would load actual audio files

    switch (soundType) {
      case 'rain':
      case 'ocean':
      case 'river':
      case 'waterfall':
        // Water sounds: filtered white noise with modulation
        await this.generateWaterSoundOffline(context, destination);
        break;

      case 'forest':
      case 'birds':
      case 'wind':
        // Nature sounds: bandpass filtered noise
        await this.generateNatureSoundOffline(context, destination);
        break;

      case 'cafe':
      case 'library':
      case 'fan':
      case 'train':
        // Ambient background: brown noise with slight modulation
        await this.generateAmbientNoiseOffline(context, destination);
        break;
    }
  }

  /**
   * Helper: Generate water-like sounds
   */
  async generateWaterSoundOffline(context, destination) {
    const bufferSize = context.length;
    const noiseBuffer = context.createBuffer(2, bufferSize, context.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const output = noiseBuffer.getChannelData(channel);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    }

    const noiseSource = context.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    // Bandpass filter for water-like sound
    const bandpass = context.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 2000;
    bandpass.Q.value = 0.5;

    // Lowpass for smoothness
    const lowpass = context.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 4000;

    noiseSource.connect(bandpass);
    bandpass.connect(lowpass);
    lowpass.connect(destination);
    noiseSource.start(0);
  }

  /**
   * Helper: Generate nature sounds
   */
  async generateNatureSoundOffline(context, destination) {
    const bufferSize = context.length;
    const noiseBuffer = context.createBuffer(2, bufferSize, context.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const output = noiseBuffer.getChannelData(channel);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    }

    const noiseSource = context.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    // Multiple bandpass filters for complex nature sound
    const bp1 = context.createBiquadFilter();
    bp1.type = 'bandpass';
    bp1.frequency.value = 1000;
    bp1.Q.value = 1;

    const bp2 = context.createBiquadFilter();
    bp2.type = 'bandpass';
    bp2.frequency.value = 3000;
    bp2.Q.value = 2;

    noiseSource.connect(bp1);
    bp1.connect(bp2);
    bp2.connect(destination);
    noiseSource.start(0);
  }

  /**
   * Helper: Generate ambient background noise
   */
  async generateAmbientNoiseOffline(context, destination) {
    const bufferSize = context.length;
    const noiseBuffer = context.createBuffer(2, bufferSize, context.sampleRate);

    // Generate brown noise
    for (let channel = 0; channel < 2; channel++) {
      const output = noiseBuffer.getChannelData(channel);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 2.5;
      }
    }

    const noiseSource = context.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const lowpass = context.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 500;

    noiseSource.connect(lowpass);
    lowpass.connect(destination);
    noiseSource.start(0);
  }

  /**
   * Generate Hybrid Notched + Ambient offline
   */
  async generateHybridNotchedOffline(context, destination, ambientType) {
    Logger.debug('treatment', `🎵 Generando Hybrid Notched + ${ambientType} offline`);

    // Create separate gain nodes for therapy and ambient
    const therapyGain = context.createGain();
    const ambientGain = context.createGain();

    // Apply balance
    const therapyVolume = 1 - this.hybridBalance * 0.4;
    const ambientVolume = this.hybridBalance * 0.4 + 0.4;
    therapyGain.gain.value = therapyVolume;
    ambientGain.gain.value = ambientVolume;

    // Connect to destination
    therapyGain.connect(destination);
    ambientGain.connect(destination);

    // Generate notched white noise
    const bufferSize = context.length;
    const noiseBuffer = context.createBuffer(2, bufferSize, context.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const output = noiseBuffer.getChannelData(channel);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    }

    const noiseSource = context.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    // Create notch filter
    const notchFilter = context.createBiquadFilter();
    notchFilter.type = 'notch';
    notchFilter.frequency.value = this.tinnitusFrequency;
    notchFilter.Q.value = 10;

    noiseSource.connect(notchFilter);
    notchFilter.connect(therapyGain);
    noiseSource.start(0);

    // Generate ambient sound
    await this.generateAmbientOffline(context, ambientGain, ambientType);
  }

  /**
   * Generate Hybrid CR + Ambient offline
   */
  async generateHybridCROffline(context, destination, ambientType) {
    Logger.debug('treatment', `🎵 Generando Hybrid CR + ${ambientType} offline`);

    // Create separate gain nodes
    const therapyGain = context.createGain();
    const ambientGain = context.createGain();

    // Apply balance
    const therapyVolume = 1 - this.hybridBalance * 0.4;
    const ambientVolume = this.hybridBalance * 0.4 + 0.4;
    therapyGain.gain.value = therapyVolume;
    ambientGain.gain.value = ambientVolume;

    // Connect to destination
    therapyGain.connect(destination);
    ambientGain.connect(destination);

    // Generate CR tones
    const f = this.tinnitusFrequency;
    const frequencies = [
      f * 0.75,  // f1: 25% below
      f * 0.87,  // f2: 13% below
      f * 1.13,  // f3: 13% above
      f * 1.25   // f4: 25% above
    ];

    const duration = context.length / context.sampleRate;

    frequencies.forEach((freq, i) => {
      const osc = context.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = context.createGain();
      gain.gain.value = 0.15;

      // Create pulsing pattern (250ms on, 750ms off)
      let time = i * 0.25;
      while (time < duration) {
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.setValueAtTime(0, time + 0.25);
        time += 1;
      }

      osc.connect(gain);
      gain.connect(therapyGain);
      osc.start(0);
    });

    // Generate ambient sound
    await this.generateAmbientOffline(context, ambientGain, ambientType);
  }

  /**
   * Export audio buffer to WAV format (PCM 16-bit)
   */
  exportToWAV(audioBuffer) {
    Logger.info('treatment', '💾 Exportando a formato WAV');

    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const numSamples = audioBuffer.length;
    const dataSize = numSamples * numChannels * 2; // 16-bit = 2 bytes per sample
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // Helper to write string
    const writeString = (offset, str) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    // WAV Header (44 bytes)
    writeString(0, 'RIFF');                                   // ChunkID
    view.setUint32(4, 36 + dataSize, true);                   // ChunkSize
    writeString(8, 'WAVE');                                   // Format
    writeString(12, 'fmt ');                                  // Subchunk1ID
    view.setUint32(16, 16, true);                             // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true);                              // AudioFormat (1 = PCM)
    view.setUint16(22, numChannels, true);                    // NumChannels
    view.setUint32(24, sampleRate, true);                     // SampleRate
    view.setUint32(28, sampleRate * numChannels * 2, true);   // ByteRate
    view.setUint16(32, numChannels * 2, true);                // BlockAlign
    view.setUint16(34, 16, true);                             // BitsPerSample
    writeString(36, 'data');                                  // Subchunk2ID
    view.setUint32(40, dataSize, true);                       // Subchunk2Size

    // Write interleaved audio data
    const channels = Array.from({ length: numChannels }, (_, i) => audioBuffer.getChannelData(i));
    let offset = 44;

    for (let i = 0; i < numSamples; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        // Clamp to [-1, 1] and convert to 16-bit PCM
        const sample = Math.max(-1, Math.min(1, channels[ch][i]));
        const pcm = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(offset, pcm, true);
        offset += 2;
      }
    }

    Logger.success('treatment', '✅ WAV exportado correctamente');
    return new Blob([buffer], { type: 'audio/wav' });
  }

  /**
   * Download audio as file
   */
  downloadAudio(blob, filename) {
    Logger.info('treatment', `📥 Descargando archivo: ${filename}`);

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    Logger.success('treatment', '✅ Descarga iniciada');
  }

  /**
   * Generate and download therapy audio
   * @param {string} format - 'wav' or 'mp3' (currently only WAV supported)
   * @param {number} durationMinutes - Duration in minutes (5-30)
   * @param {string} quality - 'high' (44100 Hz) or 'low' (22050 Hz)
   */
  async generateAndDownload(format = 'wav', durationMinutes = 5, quality = 'high') {
    try {
      Logger.info('treatment', `🎬 Iniciando generación de audio para descarga`);

      // Validate duration
      if (durationMinutes < 5 || durationMinutes > 30) {
        throw new Error('La duración debe estar entre 5 y 30 minutos');
      }

      // Generate offline audio
      const audioBuffer = await this.generateOfflineAudio(durationMinutes, quality);

      // Export based on format
      let blob;
      let extension;

      if (format === 'wav') {
        blob = this.exportToWAV(audioBuffer);
        extension = 'wav';
      } else {
        // For now, only WAV is supported
        // MP3 would require additional encoder library
        Logger.warn('treatment', 'Solo WAV está soportado actualmente, exportando como WAV');
        blob = this.exportToWAV(audioBuffer);
        extension = 'wav';
      }

      // Create filename with therapy details
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const therapyName = this.currentTherapy;
      const subType = this.currentSubType ? `_${this.currentSubType}` : '';
      const freq = `_${this.tinnitusFrequency}Hz`;
      const qualityLabel = quality === 'high' ? 'HQ' : 'LQ';
      const filename = `tinnitus_${therapyName}${subType}${freq}_${durationMinutes}min_${qualityLabel}_${timestamp}.${extension}`;

      // Download
      this.downloadAudio(blob, filename);

      return true;
    } catch (error) {
      Logger.error('treatment', `Error generando audio: ${error.message}`);
      throw error;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TreatmentEngine;
}
