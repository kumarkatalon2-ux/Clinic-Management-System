/**
 * Logger Utility
 * Centralized logging for debugging and monitoring
 */

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const LOG_COLORS = {
  error: '\x1b[31m', // Red
  warn: '\x1b[33m', // Yellow
  info: '\x1b[36m', // Cyan
  debug: '\x1b[35m', // Magenta
  reset: '\x1b[0m',
};

class Logger {
  constructor(name = 'App', level = process.env.LOG_LEVEL || 'info') {
    this.name = name;
    this.level = level;
    this.minLevel = LOG_LEVELS[level] || LOG_LEVELS.info;
  }

  /**
   * Format log message with timestamp and level
   */
  formatMessage(logLevel, message, data) {
    const timestamp = new Date().toISOString();
    const color = LOG_COLORS[logLevel];
    const reset = LOG_COLORS.reset;

    let output = `${color}[${timestamp}] [${this.name}] ${logLevel.toUpperCase()}: ${message}${reset}`;

    if (data && Object.keys(data).length > 0) {
      output += `\n${JSON.stringify(data, null, 2)}`;
    }

    return output;
  }

  /**
   * Log error level
   */
  error(message, data = {}) {
    if (LOG_LEVELS.error <= this.minLevel) {
      console.error(this.formatMessage('error', message, data));
    }
  }

  /**
   * Log warning level
   */
  warn(message, data = {}) {
    if (LOG_LEVELS.warn <= this.minLevel) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  /**
   * Log info level
   */
  info(message, data = {}) {
    if (LOG_LEVELS.info <= this.minLevel) {
      console.log(this.formatMessage('info', message, data));
    }
  }

  /**
   * Log debug level
   */
  debug(message, data = {}) {
    if (LOG_LEVELS.debug <= this.minLevel) {
      console.log(this.formatMessage('debug', message, data));
    }
  }

  /**
   * Log successful operation
   */
  success(message, data = {}) {
    const timestamp = new Date().toISOString();
    const color = '\x1b[32m'; // Green
    const reset = LOG_COLORS.reset;

    let output = `${color}[${timestamp}] [${this.name}] SUCCESS: ${message}${reset}`;

    if (data && Object.keys(data).length > 0) {
      output += `\n${JSON.stringify(data, null, 2)}`;
    }

    console.log(output);
  }

  /**
   * Create child logger with context
   */
  child(name) {
    const childLogger = new Logger(`${this.name}:${name}`, this.level);
    return childLogger;
  }
}

// Create global logger instance
const logger = new Logger('ClinicalApp', process.env.LOG_LEVEL || 'info');

module.exports = { Logger, logger };
