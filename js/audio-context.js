/**
 * Audio Context Manager
 * Singleton for managing Web Audio API context
 * Tinnitus MVP - Sprint 1
 */

const AudioContextManager = (() => {
  let instance = null;
  let audioContext = null;
  let masterGain = null;
  let isInitialized = false;

  /**
   * Initialize Audio Context
   * Must be called after user interaction (browser requirement)
   */
  function init() {
    if (isInitialized) {
      console.warn('AudioContext already initialized');
      return true;
    }

    try {
      // Create AudioContext (handle browser prefixes)
      const AudioContext = window.AudioContext || window.webkitAudioContext;

      if (!AudioContext) {
        console.error('Web Audio API not supported');
        return false;
      }

      audioContext = new AudioContext();

      // Create master gain node for global volume control
      masterGain = audioContext.createGain();
      masterGain.gain.value = 0.7; // Default volume
      masterGain.connect(audioContext.destination);

      isInitialized = true;
      console.log('AudioContext initialized successfully');
      console.log('Sample rate:', audioContext.sampleRate, 'Hz');
      console.log('State:', audioContext.state);

      return true;
    } catch (error) {
      console.error('Error initializing AudioContext:', error);
      return false;
    }
  }

  /**
   * Resume AudioContext if suspended
   * Browsers may suspend context to save power
   */
  async function resume() {
    if (!audioContext) {
      console.warn('AudioContext not initialized');
      return false;
    }

    if (audioContext.state === 'suspended') {
      try {
        await audioContext.resume();
        console.log('AudioContext resumed');
        return true;
      } catch (error) {
        console.error('Error resuming AudioContext:', error);
        return false;
      }
    }

    return true;
  }

  /**
   * Suspend AudioContext to save resources
   */
  async function suspend() {
    if (!audioContext) return false;

    if (audioContext.state === 'running') {
      try {
        await audioContext.suspend();
        console.log('AudioContext suspended');
        return true;
      } catch (error) {
        console.error('Error suspending AudioContext:', error);
        return false;
      }
    }

    return true;
  }

  /**
   * Close AudioContext
   * Should be called when done with audio
   */
  async function close() {
    if (!audioContext) return false;

    try {
      await audioContext.close();
      audioContext = null;
      masterGain = null;
      isInitialized = false;
      console.log('AudioContext closed');
      return true;
    } catch (error) {
      console.error('Error closing AudioContext:', error);
      return false;
    }
  }

  /**
   * Get AudioContext instance
   * @returns {AudioContext|null}
   */
  function getContext() {
    return audioContext;
  }

  /**
   * Get master gain node
   * @returns {GainNode|null}
   */
  function getMasterGain() {
    return masterGain;
  }

  /**
   * Set master volume
   * @param {number} value - Volume (0-1)
   */
  function setMasterVolume(value) {
    if (!masterGain) return false;

    const clampedValue = Math.max(0, Math.min(1, value));
    masterGain.gain.value = clampedValue;
    return true;
  }

  /**
   * Get master volume
   * @returns {number} Volume (0-1)
   */
  function getMasterVolume() {
    return masterGain ? masterGain.gain.value : 0;
  }

  /**
   * Check if AudioContext is initialized
   * @returns {boolean}
   */
  function isReady() {
    return isInitialized && audioContext && audioContext.state === 'running';
  }

  /**
   * Get current time
   * @returns {number} Current time in seconds
   */
  function getCurrentTime() {
    return audioContext ? audioContext.currentTime : 0;
  }

  /**
   * Get sample rate
   * @returns {number} Sample rate in Hz
   */
  function getSampleRate() {
    return audioContext ? audioContext.sampleRate : 0;
  }

  /**
   * Get AudioContext state
   * @returns {string} State (suspended, running, closed)
   */
  function getState() {
    return audioContext ? audioContext.state : 'closed';
  }

  /**
   * Create oscillator node
   * @param {number} frequency - Frequency in Hz
   * @param {string} type - Wave type (sine, square, sawtooth, triangle)
   * @returns {OscillatorNode|null}
   */
  function createOscillator(frequency = 440, type = 'sine') {
    if (!audioContext) return null;

    const oscillator = audioContext.createOscillator();
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    return oscillator;
  }

  /**
   * Create gain node
   * @param {number} gain - Initial gain value (0-1)
   * @returns {GainNode|null}
   */
  function createGain(gain = 1) {
    if (!audioContext) return null;

    const gainNode = audioContext.createGain();
    gainNode.gain.value = gain;
    return gainNode;
  }

  /**
   * Create biquad filter node
   * @param {string} type - Filter type (lowpass, highpass, bandpass, notch, etc.)
   * @param {number} frequency - Frequency in Hz
   * @param {number} Q - Q factor
   * @returns {BiquadFilterNode|null}
   */
  function createFilter(type = 'lowpass', frequency = 440, Q = 1) {
    if (!audioContext) return null;

    const filter = audioContext.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = Q;
    return filter;
  },

  /**
   * Create stereo panner node
   * @param {number} pan - Pan value (-1 = left, 0 = center, 1 = right)
   * @returns {StereoPannerNode|null}
   */
  function createPanner(pan = 0) {
    if (!audioContext) return null;

    const panner = audioContext.createStereoPanner();
    panner.pan.value = Math.max(-1, Math.min(1, pan));
    return panner;
  },

  /**
   * Create audio buffer from array
   * @param {Float32Array} data - Audio data
   * @param {number} channels - Number of channels (1 = mono, 2 = stereo)
   * @returns {AudioBuffer|null}
   */
  function createBuffer(data, channels = 1) {
    if (!audioContext) return null;

    const buffer = audioContext.createBuffer(
      channels,
      data.length,
      audioContext.sampleRate
    );

    for (let channel = 0; channel < channels; channel++) {
      buffer.copyToChannel(data, channel);
    }

    return buffer;
  },

  /**
   * Play a simple tone
   * Utility function for quick testing
   * @param {number} frequency - Frequency in Hz
   * @param {number} duration - Duration in seconds
   * @param {number} volume - Volume (0-1)
   * @returns {Promise}
   */
  async function playTone(frequency = 440, duration = 1, volume = 0.3) {
    if (!isReady()) {
      await resume();
    }

    return new Promise((resolve) => {
      const oscillator = createOscillator(frequency);
      const gainNode = createGain(0);

      oscillator.connect(gainNode);
      gainNode.connect(masterGain);

      const now = audioContext.currentTime;

      // Fade in
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);

      // Fade out
      gainNode.gain.linearRampToValueAtTime(volume, now + duration - 0.05);
      gainNode.gain.linearRampToValueAtTime(0, now + duration);

      oscillator.start(now);
      oscillator.stop(now + duration);

      oscillator.onended = () => {
        oscillator.disconnect();
        gainNode.disconnect();
        resolve();
      };
    });
  }

  /**
   * Convert dB to gain
   * @param {number} db - Decibels
   * @returns {number} Linear gain
   */
  function dbToGain(db) {
    return Math.pow(10, db / 20);
  }

  /**
   * Convert gain to dB
   * @param {number} gain - Linear gain
   * @returns {number} Decibels
   */
  function gainToDb(gain) {
    return 20 * Math.log10(gain);
  }

  // Return public API
  return {
    init,
    resume,
    suspend,
    close,
    getContext,
    getMasterGain,
    setMasterVolume,
    getMasterVolume,
    isReady,
    getCurrentTime,
    getSampleRate,
    getState,
    createOscillator,
    createGain,
    createFilter,
    createPanner,
    createBuffer,
    playTone,
    dbToGain,
    gainToDb
  };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioContextManager;
}
