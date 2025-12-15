/**
 * Logger Utility - Debug and Analysis Tool
 * Tinnitus MVP - System-wide logging
 */

const Logger = (() => {
  let enabled = true;
  let logLevel = 'debug'; // 'debug', 'info', 'warn', 'error'
  let logs = [];
  const maxLogs = 1000;

  const levels = {
    debug: { priority: 0, color: '#6B7280', icon: '🔍' },
    info: { priority: 1, color: '#3B82F6', icon: 'ℹ️' },
    warn: { priority: 2, color: '#F59E0B', icon: '⚠️' },
    error: { priority: 3, color: '#EF4444', icon: '❌' },
    success: { priority: 1, color: '#10B981', icon: '✅' },
    test: { priority: 1, color: '#8B5CF6', icon: '🧪' }
  };

  /**
   * Get timestamp
   */
  function getTimestamp() {
    const now = new Date();
    return now.toISOString().substr(11, 12); // HH:MM:SS.mmm
  }

  /**
   * Format message
   */
  function formatMessage(level, module, message, data) {
    return {
      timestamp: getTimestamp(),
      level,
      module,
      message,
      data,
      fullTimestamp: new Date().toISOString()
    };
  }

  /**
   * Check if should log
   */
  function shouldLog(level) {
    if (!enabled) return false;
    const currentLevel = levels[logLevel]?.priority || 0;
    const messageLevel = levels[level]?.priority || 0;
    return messageLevel >= currentLevel;
  }

  /**
   * Store log
   */
  function storeLog(logEntry) {
    logs.push(logEntry);
    if (logs.length > maxLogs) {
      logs.shift();
    }
  }

  /**
   * Output to console
   */
  function output(level, module, message, data) {
    const logEntry = formatMessage(level, module, message, data);
    storeLog(logEntry);

    if (!shouldLog(level)) return;

    const { icon, color } = levels[level] || levels.info;
    const prefix = `[${logEntry.timestamp}] ${icon} [${module.toUpperCase()}]`;

    const style = `color: ${color}; font-weight: bold;`;

    if (data !== undefined) {
      console.log(`%c${prefix}`, style, message, data);
    } else {
      console.log(`%c${prefix}`, style, message);
    }
  }

  /**
   * Public API
   */
  return {
    /**
     * Debug log
     */
    debug(module, message, data) {
      output('debug', module, message, data);
    },

    /**
     * Info log
     */
    info(module, message, data) {
      output('info', module, message, data);
    },

    /**
     * Warning log
     */
    warn(module, message, data) {
      output('warn', module, message, data);
    },

    /**
     * Error log
     */
    error(module, message, data) {
      output('error', module, message, data);
    },

    /**
     * Success log
     */
    success(module, message, data) {
      output('success', module, message, data);
    },

    /**
     * Test/Debug log
     */
    test(module, message, data) {
      output('test', module, message, data);
    },

    /**
     * Log step in a process
     */
    step(module, step, total, message, data) {
      const stepMessage = `[${step}/${total}] ${message}`;
      output('info', module, stepMessage, data);
    },

    /**
     * Log timing (start)
     */
    timeStart(module, label) {
      const key = `${module}_${label}`;
      console.time(key);
      this.debug(module, `⏱️ Timer started: ${label}`);
      return key;
    },

    /**
     * Log timing (end)
     */
    timeEnd(module, label) {
      const key = `${module}_${label}`;
      console.timeEnd(key);
      this.debug(module, `⏱️ Timer ended: ${label}`);
    },

    /**
     * Log group start
     */
    group(module, title) {
      console.group(`🗂️ ${module.toUpperCase()}: ${title}`);
    },

    /**
     * Log group end
     */
    groupEnd() {
      console.groupEnd();
    },

    /**
     * Log table
     */
    table(module, title, data) {
      this.info(module, `📊 ${title}`);
      console.table(data);
    },

    /**
     * Enable/disable logging
     */
    setEnabled(value) {
      enabled = value;
      console.log(`Logger ${enabled ? 'enabled' : 'disabled'}`);
    },

    /**
     * Set log level
     */
    setLevel(level) {
      if (levels[level]) {
        logLevel = level;
        console.log(`Log level set to: ${level}`);
      }
    },

    /**
     * Get all logs
     */
    getLogs() {
      return logs;
    },

    /**
     * Get logs by module
     */
    getModuleLogs(module) {
      return logs.filter(log => log.module === module);
    },

    /**
     * Get logs by level
     */
    getLevelLogs(level) {
      return logs.filter(log => log.level === level);
    },

    /**
     * Clear logs
     */
    clear() {
      logs = [];
      console.clear();
      this.info('logger', 'Logs cleared');
    },

    /**
     * Export logs to JSON
     */
    export() {
      const data = {
        exportDate: new Date().toISOString(),
        totalLogs: logs.length,
        logs: logs
      };
      return JSON.stringify(data, null, 2);
    },

    /**
     * Download logs as file
     */
    download() {
      const data = this.export();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tinnitus-logs-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.success('logger', 'Logs downloaded');
    },

    /**
     * Print summary
     */
    summary() {
      console.group('📊 Logger Summary');
      console.log('Total logs:', logs.length);
      console.log('By level:', {
        debug: logs.filter(l => l.level === 'debug').length,
        info: logs.filter(l => l.level === 'info').length,
        warn: logs.filter(l => l.level === 'warn').length,
        error: logs.filter(l => l.level === 'error').length
      });
      console.log('By module:',
        [...new Set(logs.map(l => l.module))].reduce((acc, mod) => {
          acc[mod] = logs.filter(l => l.module === mod).length;
          return acc;
        }, {})
      );
      console.groupEnd();
    }
  };
})();

// Global shortcuts for console
if (typeof window !== 'undefined') {
  window.logger = Logger;
  window.logSummary = () => Logger.summary();
  window.logDownload = () => Logger.download();
  window.logClear = () => Logger.clear();
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Logger;
}
