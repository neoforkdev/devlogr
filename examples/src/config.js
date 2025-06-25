'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.LogConfiguration = void 0;
const types_1 = require('./types');
const utils_1 = require('./utils');
// ============================================================================
// CONFIGURATION MANAGEMENT
// ============================================================================
/**
 * Manages logger configuration from environment variables and terminal detection.
 */
class LogConfiguration {
  /**
   * Get complete logger configuration from environment and terminal detection.
   *
   * @returns Complete configuration object with all logger settings
   */
  static getConfig() {
    const timestampConfig = this.getTimestampConfig();
    return {
      level: this.getLogLevel(),
      useJson: this.shouldUseJson(),
      useColors: this.shouldUseColors(),
      supportsUnicode: this.supportsUnicode(),
      showTimestamp: timestampConfig.show,
      timestampFormat: timestampConfig.format,
      showPrefix: this.shouldShowPrefix(),
      showIcons: this.shouldShowIcons(),
    };
  }
  /**
   * Determines log level from environment variable
   */
  static getLogLevel() {
    const level = process.env[this.ENV_LOG_LEVEL]?.toLowerCase();
    const levelMap = {
      error: types_1.LogLevel.ERROR,
      warn: types_1.LogLevel.WARNING,
      warning: types_1.LogLevel.WARNING,
      debug: types_1.LogLevel.DEBUG,
      trace: types_1.LogLevel.TRACE,
    };
    return levelMap[level || ''] || types_1.LogLevel.INFO;
  }
  /**
   * Checks if JSON logging should be used
   */
  static shouldUseJson() {
    return process.env[this.ENV_OUTPUT_JSON] === 'true';
  }
  /**
   * Checks if colors should be used in output
   */
  static shouldUseColors() {
    return utils_1.TerminalUtils.supportsColor();
  }
  /**
   * Checks if Unicode symbols should be used
   */
  static supportsUnicode() {
    return utils_1.TerminalUtils.supportsUnicode();
  }
  /**
   * Gets timestamp configuration from environment variable
   */
  static getTimestampConfig() {
    const timestampValue = process.env[this.ENV_SHOW_TIMESTAMP];
    if (timestampValue === 'true') {
      return { show: true, format: types_1.TimestampFormat.TIME };
    }
    if (timestampValue === 'iso') {
      return { show: true, format: types_1.TimestampFormat.ISO };
    }
    if (timestampValue === '1') {
      return { show: true, format: types_1.TimestampFormat.TIME };
    }
    // Default to disabled (false) for any other value or no value
    return { show: false, format: types_1.TimestampFormat.TIME };
  }
  /**
   * Checks if prefix should be shown in output
   */
  static shouldShowPrefix() {
    const showPrefixValue = process.env[this.ENV_SHOW_PREFIX];
    return showPrefixValue === 'true' || showPrefixValue === '1';
  }
  /**
   * Checks if icons should be shown in output
   */
  static shouldShowIcons() {
    const noIconsValue = process.env[this.ENV_NO_ICONS];
    return !(noIconsValue === 'true' || noIconsValue === '1');
  }
}
exports.LogConfiguration = LogConfiguration;
LogConfiguration.ENV_LOG_LEVEL = 'DEVLOGR_LOG_LEVEL';
LogConfiguration.ENV_OUTPUT_JSON = 'DEVLOGR_OUTPUT_JSON';
LogConfiguration.ENV_NO_COLOR = 'NO_COLOR';
LogConfiguration.ENV_DEVLOGR_NO_COLOR = 'DEVLOGR_NO_COLOR';
LogConfiguration.ENV_SHOW_TIMESTAMP = 'DEVLOGR_SHOW_TIMESTAMP';
LogConfiguration.ENV_SHOW_PREFIX = 'DEVLOGR_SHOW_PREFIX';
LogConfiguration.ENV_NO_ICONS = 'DEVLOGR_NO_ICONS';
