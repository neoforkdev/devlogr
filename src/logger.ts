import chalk from 'chalk';
import { LogLevel, LogTheme, LogConfig } from './types';
import { LogConfiguration } from './config';
import { ThemeProvider } from './themes';
import { MessageFormatter } from './formatters';
import { PrefixTracker } from './tracker';
import { EmojiUtils } from './utils';
import { StringUtils } from './utils';
import { SpinnerUtils, SpinnerOptions } from './utils';

// ============================================================================
// CONSOLE LOGGER IMPLEMENTATION
// ============================================================================

/**
 * Simple, maintainable logger using console methods
 */
export class Logger {
  private readonly prefix: string;
  private readonly config: LogConfig;
  private static globalLevel?: LogLevel;

  constructor(prefix: string) {
    this.prefix = prefix;
    this.config = LogConfiguration.getConfig();
    
    PrefixTracker.register(prefix);
  }

  // ============================================================================
  // STATIC LEVEL MANAGEMENT
  // ============================================================================

  static setLevel(level: LogLevel): void {
    Logger.globalLevel = level;
  }

  static resetLevel(): void {
    Logger.globalLevel = undefined;
  }

  // ============================================================================
  // CORE LOGGING METHODS
  // ============================================================================

  info(message: string, ...args: unknown[]): void {
    this.log(LogLevel.INFO, 'info', message, ...args);
  }

  error(message: string, error?: unknown, ...args: unknown[]): void {
    const allArgs = error ? [error, ...args] : args;
    this.log(LogLevel.ERROR, 'error', message, ...allArgs);
  }

  warning(message: string, ...args: unknown[]): void {
    this.log(LogLevel.WARNING, 'warn', message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.warning(message, ...args);
  }

  debug(message: string, ...args: unknown[]): void {
    this.log(LogLevel.DEBUG, 'debug', message, ...args);
  }

  trace(message: string, ...args: unknown[]): void {
    this.log(LogLevel.TRACE, 'trace', message, ...args);
  }

  success(message: string, ...args: unknown[]): void {
    this.log(LogLevel.INFO, 'success', message, ...args);
  }

  title(message: string, ...args: unknown[]): void {
    this.log(LogLevel.INFO, 'title', message, ...args);
  }

  task(message: string, ...args: unknown[]): void {
    this.log(LogLevel.INFO, 'task', message, ...args);
  }

  plain(message: string, ...args: unknown[]): void {
    this.log(LogLevel.INFO, 'plain', message, ...args);
  }

  // ============================================================================
  // SPINNER METHODS
  // ============================================================================

  /**
   * Start a spinner with optional text
   */
  startSpinner(text?: string, options?: Omit<SpinnerOptions, 'text'>): void {
    // In JSON mode or non-TTY, just log the task
    if (this.config.useJson || !SpinnerUtils.supportsSpinners()) {
      this.task(text || 'Processing...');
      return;
    }
    
    const theme = ThemeProvider.getTheme('task', undefined, this.config.supportsUnicode);
    const spinnerOptions: SpinnerOptions = {
      text: text || 'Processing...',
      prefix: this.prefix,
      showTimestamp: this.config.showTimestamp,
      useColors: this.config.useColors,
      timestampFormat: this.config.timestampFormat,
      level: 'task',
      theme: theme,
      ...options
    };
    
    SpinnerUtils.start(this.prefix, spinnerOptions);
  }

  /**
   * Update the text of the current spinner
   */
  updateSpinnerText(text: string): void {
    if (this.config.useJson || !SpinnerUtils.supportsSpinners()) {
      return;
    }
    
    SpinnerUtils.updateText(this.prefix, text);
  }

  /**
   * Stop the current spinner without completion message
   */
  stopSpinner(): void {
    if (this.config.useJson || !SpinnerUtils.supportsSpinners()) {
      return;
    }
    
    SpinnerUtils.stop(this.prefix);
  }

  /**
   * Complete spinner with success message
   */
  completeSpinnerWithSuccess(text?: string): void {
    if (this.config.useJson || !SpinnerUtils.supportsSpinners()) {
      this.success(text || 'Done');
      return;
    }
    
    const message = SpinnerUtils.succeed(this.prefix, text);
    if (message !== undefined) {
      this.success(message);
    } else {
      this.success('Done');
    }
  }

  /**
   * Complete spinner with error message
   */
  completeSpinnerWithError(text?: string): void {
    if (this.config.useJson || !SpinnerUtils.supportsSpinners()) {
      this.error(text || 'Failed');
      return;
    }
    
    const message = SpinnerUtils.fail(this.prefix, text);
    if (message !== undefined) {
      this.error(message);
    } else {
      this.error('Failed');
    }
  }

  /**
   * Complete spinner with warning message
   */
  completeSpinnerWithWarning(text?: string): void {
    if (this.config.useJson || !SpinnerUtils.supportsSpinners()) {
      this.warning(text || 'Warning');
      return;
    }
    
    const message = SpinnerUtils.warn(this.prefix, text);
    if (message !== undefined) {
      this.warning(message);
    } else {
      this.warning('Warning');
    }
  }

  /**
   * Complete spinner with info message
   */
  completeSpinnerWithInfo(text?: string): void {
    if (this.config.useJson || !SpinnerUtils.supportsSpinners()) {
      this.info(text || 'Info');
      return;
    }
    
    const message = SpinnerUtils.info(this.prefix, text);
    if (message !== undefined) {
      this.info(message);
    } else {
      this.info('Info');
    }
  }

  // ============================================================================
  // LEGACY SPINNER METHODS (DEPRECATED - for backward compatibility)
  // ============================================================================

  /**
   * @deprecated Use updateSpinnerText() instead
   */
  updateSpinner(text: string): void {
    this.updateSpinnerText(text);
  }

  /**
   * @deprecated Use completeSpinnerWithSuccess() instead
   */
  succeedSpinner(text?: string): void {
    this.completeSpinnerWithSuccess(text);
  }

  /**
   * @deprecated Use completeSpinnerWithError() instead
   */
  failSpinner(text?: string): void {
    this.completeSpinnerWithError(text);
  }

  /**
   * @deprecated Use completeSpinnerWithWarning() instead
   */
  warnSpinner(text?: string): void {
    this.completeSpinnerWithWarning(text);
  }

  /**
   * @deprecated Use completeSpinnerWithInfo() instead
   */
  infoSpinner(text?: string): void {
    this.completeSpinnerWithInfo(text);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  spacer(): void {
    if (this.config.useJson) {
      return;
    }
    console.log();
  }

  separator(title?: string): void {
    if (this.config.useJson) {
      return;
    }
    
    const width = 50;
    
    if (title) {
      const sideLength = Math.max(1, Math.floor((width - title.length - 2) / 2));
      const leftSide = '-'.repeat(sideLength);
      const rightSide = '-'.repeat(width - title.length - 2 - sideLength);
      const line = `${leftSide} ${title} ${rightSide}`;
      console.log(this.config.useColors ? chalk.dim(line) : line);
    } else {
      const line = '-'.repeat(width);
      console.log(this.config.useColors ? chalk.dim(line) : line);
    }
  }

  // ============================================================================
  // PRIVATE IMPLEMENTATION
  // ============================================================================

  private getEffectiveLevel(): LogLevel {
    return Logger.globalLevel ?? this.config.level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARNING, LogLevel.INFO, LogLevel.DEBUG, LogLevel.TRACE];
    const currentLevelIndex = levels.indexOf(this.getEffectiveLevel());
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  private supportsEmoji(): boolean {
    // In JSON mode, never use emojis
    if (this.config.useJson) {
      return false;
    }
    
    // Use centralized emoji support detection
    return EmojiUtils.supportsEmoji();
  }

  private stripEmojis(text: string): string {
    // Force strip emojis regardless of environment detection
    return EmojiUtils.forceStripEmojis(text);
  }

  private log(level: LogLevel, logLevel: string, message: string, ...args: unknown[]): void {
    if (!this.shouldLog(level)) {
      return;
    }
    
    if (this.config.useJson) {
      this.logJson(level, message, args);
    } else {
      this.logFormatted(level, logLevel, message, args);
    }
  }

  private logJson(level: LogLevel, message: string, args: unknown[]): void {
    const logData: Record<string, unknown> = { 
      level, 
      prefix: this.prefix,
      message: this.stripEmojis(message), // Strip emojis from message
      timestamp: new Date().toISOString()
    };
    
    args.forEach((arg, index) => {
      if (typeof arg === 'object' && arg !== null) {
        // For objects, try to merge properties, but handle circular references
        try {
          // Use a simple check to see if we can safely merge
          const testStringify = JSON.stringify(arg);
          Object.assign(logData, arg);
        } catch {
          // If circular or other serialization issues, store as a separate property
          logData[`arg${index}`] = arg;
        }
      } else {
        // Strip emojis from string arguments too
        const argValue = typeof arg === 'string' ? this.stripEmojis(arg) : arg;
        logData[`arg${index}`] = argValue;
      }
    });
    
    // Use safe JSON stringify to handle circular references
    const safeJson = StringUtils.safeJsonStringify(logData, 0); // No indentation for logs
    this.outputToConsole(level, safeJson);
  }

  private logFormatted(level: LogLevel, logLevel: string, message: string, args: unknown[]): void {
    const formattedMessage = this.formatMessage(logLevel, message, args);
    this.outputToConsole(level, formattedMessage);
  }

  private formatMessage(level: string, message: string, args: unknown[]): string {
    const theme = ThemeProvider.getTheme(level, undefined, this.config.supportsUnicode);
    const shouldStripEmojis = !this.supportsEmoji();
    
    return this.config.showTimestamp ?
      MessageFormatter.formatCompleteLogMessage(level, theme, message, args, this.prefix, PrefixTracker.getMaxLength(), this.config.useColors, this.config.timestampFormat, shouldStripEmojis) :
      MessageFormatter.formatSimpleMessage(level, theme, message, args, this.config.useColors, shouldStripEmojis);
  }

  private outputToConsole(level: LogLevel, message: string): void {
    switch (level) {
      case LogLevel.ERROR:
        console.error(message);
        break;
      case LogLevel.WARNING:
        console.warn(message);
        break;
      case LogLevel.DEBUG:
      case LogLevel.TRACE:
        console.debug(message);
        break;
      default:
        console.log(message);
        break;
    }
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createLogger(prefix: string): Logger {
  return new Logger(prefix);
}
