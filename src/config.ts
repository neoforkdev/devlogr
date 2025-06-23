import { LogLevel, LogConfig, TimestampFormat } from './types';
import { TerminalUtils } from './utils';

// ============================================================================
// CONFIGURATION MANAGEMENT
// ============================================================================

/**
 * Manages logger configuration from environment variables and terminal detection.
 */
export class LogConfiguration {
  private static readonly ENV_LOG_LEVEL = 'DEVLOGR_LOG_LEVEL';
  private static readonly ENV_OUTPUT_JSON = 'DEVLOGR_OUTPUT_JSON';
  private static readonly ENV_NO_COLOR = 'NO_COLOR';
  private static readonly ENV_DEVLOGR_NO_COLOR = 'DEVLOGR_NO_COLOR';
  private static readonly ENV_SHOW_TIMESTAMP = 'DEVLOGR_SHOW_TIMESTAMP';

  /**
   * Get complete logger configuration from environment and terminal detection.
   * 
   * @returns Complete configuration object with all logger settings
   */
  static getConfig(): LogConfig {
    const timestampConfig = this.getTimestampConfig();

    return {
      level: this.getLogLevel(),
      useJson: this.shouldUseJson(),
      useColors: this.shouldUseColors(),
      supportsUnicode: this.supportsUnicode(),
      showTimestamp: timestampConfig.show,
      timestampFormat: timestampConfig.format,
    };
  }

  /**
   * Determines log level from environment variable
   */
  private static getLogLevel(): LogLevel {
    const level = process.env[this.ENV_LOG_LEVEL]?.toLowerCase();
    const levelMap: Record<string, LogLevel> = {
      error: LogLevel.ERROR,
      warn: LogLevel.WARNING,
      warning: LogLevel.WARNING,
      debug: LogLevel.DEBUG,
      trace: LogLevel.TRACE,
    };
    return levelMap[level || ''] || LogLevel.INFO;
  }

  /**
   * Checks if JSON logging should be used
   */
  private static shouldUseJson(): boolean {
    return process.env[this.ENV_OUTPUT_JSON] === 'true';
  }

  /**
   * Checks if colors should be used in output
   */
  private static shouldUseColors(): boolean {
    return TerminalUtils.supportsColor();
  }

  /**
   * Checks if Unicode symbols should be used
   */
  private static supportsUnicode(): boolean {
    return TerminalUtils.supportsUnicode();
  }

  /**
   * Gets timestamp configuration from environment variable
   */
  private static getTimestampConfig(): { show: boolean; format: TimestampFormat } {
    const timestampValue = process.env[this.ENV_SHOW_TIMESTAMP];

    if (!timestampValue || timestampValue === 'false') {
      return { show: false, format: TimestampFormat.TIME };
    }

    if (timestampValue === 'true') {
      return { show: true, format: TimestampFormat.TIME };
    }

    if (timestampValue === 'iso') {
      return { show: true, format: TimestampFormat.ISO };
    }

    // Default to TIME format for any other truthy value
    return { show: true, format: TimestampFormat.TIME };
  }
}
