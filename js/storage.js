/**
 * LocalStorage Manager
 * Tinnitus MVP - Sprint 1
 */

const Storage = {
  // Storage keys
  KEYS: {
    USER_PROFILE: 'tinnitus_user_profile',
    AUDIOMETRY_RESULTS: 'tinnitus_audiometry_results',
    TINNITUS_MATCH: 'tinnitus_match',
    TREATMENT_PLAN: 'tinnitus_treatment_plan',
    TREATMENT_SESSIONS: 'tinnitus_treatment_sessions',
    SETTINGS: 'tinnitus_settings',
    PROGRESS: 'tinnitus_progress'
  },

  /**
   * Check if LocalStorage is available
   * @returns {boolean}
   */
  isAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.error('LocalStorage not available:', e);
      return false;
    }
  },

  /**
   * Get item from localStorage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if not found
   * @returns {*} Parsed value or default
   */
  get(key, defaultValue = null) {
    if (!this.isAvailable()) return defaultValue;

    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (e) {
      console.error(`Error reading from localStorage (${key}):`, e);
      return defaultValue;
    }
  },

  /**
   * Set item in localStorage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @returns {boolean} Success status
   */
  set(key, value) {
    if (!this.isAvailable()) return false;

    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (e) {
      console.error(`Error writing to localStorage (${key}):`, e);
      return false;
    }
  },

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   * @returns {boolean} Success status
   */
  remove(key) {
    if (!this.isAvailable()) return false;

    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error(`Error removing from localStorage (${key}):`, e);
      return false;
    }
  },

  /**
   * Clear all tinnitus-related data
   * @returns {boolean} Success status
   */
  clearAll() {
    if (!this.isAvailable()) return false;

    try {
      Object.values(this.KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (e) {
      console.error('Error clearing localStorage:', e);
      return false;
    }
  },

  // ===== SPECIFIC DATA METHODS =====

  /**
   * Save user profile
   * @param {Object} profile - User profile data
   */
  saveUserProfile(profile) {
    return this.set(this.KEYS.USER_PROFILE, {
      ...profile,
      updatedAt: new Date().toISOString()
    });
  },

  /**
   * Get user profile
   * @returns {Object|null}
   */
  getUserProfile() {
    return this.get(this.KEYS.USER_PROFILE);
  },

  /**
   * Save audiometry results
   * @param {Object} results - Audiometry test results
   */
  saveAudiometryResults(results) {
    const existing = this.get(this.KEYS.AUDIOMETRY_RESULTS, []);
    existing.push({
      ...results,
      timestamp: new Date().toISOString()
    });
    return this.set(this.KEYS.AUDIOMETRY_RESULTS, existing);
  },

  /**
   * Get latest audiometry results
   * @returns {Object|null}
   */
  getLatestAudiometryResults() {
    const results = this.get(this.KEYS.AUDIOMETRY_RESULTS, []);
    if (results.length === 0) return null;
    return results[results.length - 1];
  },

  /**
   * Get all audiometry results
   * @returns {Array}
   */
  getAllAudiometryResults() {
    return this.get(this.KEYS.AUDIOMETRY_RESULTS, []);
  },

  /**
   * Save tinnitus match
   * @param {Object} match - Tinnitus frequency match data
   */
  saveTinnitusMatch(match) {
    return this.set(this.KEYS.TINNITUS_MATCH, {
      ...match,
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Get tinnitus match
   * @returns {Object|null}
   */
  getTinnitusMatch() {
    return this.get(this.KEYS.TINNITUS_MATCH);
  },

  /**
   * Save treatment plan
   * @param {Object} plan - Treatment plan configuration
   */
  saveTreatmentPlan(plan) {
    return this.set(this.KEYS.TREATMENT_PLAN, {
      ...plan,
      createdAt: new Date().toISOString()
    });
  },

  /**
   * Get treatment plan
   * @returns {Object|null}
   */
  getTreatmentPlan() {
    return this.get(this.KEYS.TREATMENT_PLAN);
  },

  /**
   * Save treatment session
   * @param {Object} session - Session data
   */
  saveTreatmentSession(session) {
    const sessions = this.get(this.KEYS.TREATMENT_SESSIONS, []);
    sessions.push({
      ...session,
      timestamp: new Date().toISOString()
    });
    return this.set(this.KEYS.TREATMENT_SESSIONS, sessions);
  },

  /**
   * Get all treatment sessions
   * @returns {Array}
   */
  getTreatmentSessions() {
    return this.get(this.KEYS.TREATMENT_SESSIONS, []);
  },

  /**
   * Get treatment sessions count
   * @returns {number}
   */
  getTreatmentSessionsCount() {
    return this.getTreatmentSessions().length;
  },

  /**
   * Save settings
   * @param {Object} settings - User settings
   */
  saveSettings(settings) {
    return this.set(this.KEYS.SETTINGS, settings);
  },

  /**
   * Get settings
   * @returns {Object}
   */
  getSettings() {
    return this.get(this.KEYS.SETTINGS, {
      volume: 0.5,
      theme: 'light',
      language: 'es',
      notifications: true
    });
  },

  /**
   * Update single setting
   * @param {string} key - Setting key
   * @param {*} value - Setting value
   */
  updateSetting(key, value) {
    const settings = this.getSettings();
    settings[key] = value;
    return this.saveSettings(settings);
  },

  /**
   * Save progress data
   * @param {Object} progress - Progress metrics
   */
  saveProgress(progress) {
    return this.set(this.KEYS.PROGRESS, {
      ...progress,
      updatedAt: new Date().toISOString()
    });
  },

  /**
   * Get progress data
   * @returns {Object}
   */
  getProgress() {
    return this.get(this.KEYS.PROGRESS, {
      audiometryCompleted: false,
      tinnitusMatchCompleted: false,
      treatmentStarted: false,
      currentWeek: 0,
      sessionsCompleted: 0
    });
  },

  /**
   * Update progress
   * @param {Object} updates - Progress updates
   */
  updateProgress(updates) {
    const progress = this.getProgress();
    return this.saveProgress({ ...progress, ...updates });
  },

  /**
   * Get storage usage (approximate)
   * @returns {Object} Size info
   */
  getStorageInfo() {
    if (!this.isAvailable()) return { used: 0, available: 0 };

    try {
      let totalSize = 0;
      Object.values(this.KEYS).forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += item.length + key.length;
        }
      });

      // Approximate: LocalStorage usually has ~5-10MB limit
      return {
        used: totalSize,
        usedKB: Math.round(totalSize / 1024),
        approximateLimit: 5 * 1024 * 1024 // 5MB
      };
    } catch (e) {
      console.error('Error calculating storage size:', e);
      return { used: 0, available: 0 };
    }
  },

  /**
   * Export all data as JSON
   * @returns {Object} All stored data
   */
  exportData() {
    const data = {};
    Object.entries(this.KEYS).forEach(([name, key]) => {
      data[name] = this.get(key);
    });
    return data;
  },

  /**
   * Import data from JSON
   * @param {Object} data - Data to import
   * @returns {boolean} Success status
   */
  importData(data) {
    try {
      Object.entries(this.KEYS).forEach(([name, key]) => {
        if (data[name]) {
          this.set(key, data[name]);
        }
      });
      return true;
    } catch (e) {
      console.error('Error importing data:', e);
      return false;
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Storage;
}
