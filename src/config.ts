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
  private static readonly ENV_SHOW_PREFIX = 'DEVLOGR_SHOW_PREFIX';
  private static readonly ENV_NO_ICONS = 'DEVLOGR_NO_ICONS';
  private static readonly ENV_DISABLE_CI_DETECTION = 'DEVLOGR_DISABLE_CI_DETECTION';

  /**
   * Get complete logger configuration from environment and terminal detection.
   * Automatically applies CI-optimized settings when running in CI environments.
   * CI detection can be disabled via DEVLOGR_DISABLE_CI_DETECTION=true.
   *
   * @returns Complete configuration object with all logger settings
   */
  static getConfig(): LogConfig {
    const timestampConfig = this.getTimestampConfig();
    const ciConfig = TerminalUtils.getCIConfig();

    return {
      level: this.getLogLevel(),
      useJson: this.shouldUseJson(),
      useColors: this.shouldUseColors(),
      supportsUnicode: this.supportsUnicode(),
      supportsEmoji: this.supportsEmoji(),
      showTimestamp: this.shouldShowTimestamp(timestampConfig.show, ciConfig.showTimestamp),
      timestampFormat: timestampConfig.format,
      showPrefix: this.shouldShowPrefix(ciConfig.showPrefix),
      showIcons: this.shouldShowIcons(ciConfig.showIcons),
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
   * Checks if emoji characters should be used
   */
  private static supportsEmoji(): boolean {
    return TerminalUtils.supportsEmoji();
  }

  /**
   * Gets timestamp configuration from environment variable
   */
  private static getTimestampConfig(): { show: boolean; format: TimestampFormat } {
    const timestampValue = process.env[this.ENV_SHOW_TIMESTAMP];

    if (timestampValue === 'true') {
      return { show: true, format: TimestampFormat.TIME };
    }

    if (timestampValue === 'iso') {
      return { show: true, format: TimestampFormat.ISO };
    }

    if (timestampValue === '1') {
      return { show: true, format: TimestampFormat.TIME };
    }

    // Default to disabled (false) for any other value or no value
    return { show: false, format: TimestampFormat.TIME };
  }

  /**
   * Determines if timestamps should be shown, considering both environment variables and CI detection
   */
  private static shouldShowTimestamp(envTimestamp: boolean, ciTimestamp: boolean): boolean {
    // Environment variable takes precedence
    if (process.env[this.ENV_SHOW_TIMESTAMP] !== undefined) {
      return envTimestamp;
    }

    // Fall back to CI detection
    return ciTimestamp;
  }

  /**
   * Checks if prefix should be shown in output, considering both environment variables and CI detection
   */
  private static shouldShowPrefix(ciPrefix: boolean): boolean {
    const showPrefixValue = process.env[this.ENV_SHOW_PREFIX];

    // Environment variable takes precedence
    if (showPrefixValue !== undefined) {
      return showPrefixValue === 'true' || showPrefixValue === '1';
    }

    // Fall back to CI detection
    return ciPrefix;
  }

  /**
   * Checks if icons should be shown in output, considering both environment variables and CI detection
   */
  private static shouldShowIcons(ciIcons: boolean): boolean {
    const showIconsValue = process.env[this.ENV_NO_ICONS];

    // Environment variable takes precedence
    if (showIconsValue !== undefined) {
      return !(showIconsValue === 'true' || showIconsValue === '1');
    }

    // Fall back to CI detection
    return ciIcons;
  }
}
