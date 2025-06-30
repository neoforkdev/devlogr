import { Listr, ListrTask } from 'listr2';
import { LogLevel, LogConfig } from './types';
import { LogConfiguration } from './config';
import { ThemeProvider } from './themes';
import { MessageFormatter } from './formatters';
import { PrefixTracker } from './tracker';
import { EmojiUtils, StringUtils, SpinnerUtils, SpinnerOptions } from './utils';
import { DevLogrRenderer } from './devlogr-renderer';
import { ChalkUtils } from './utils/chalk';
import { ISpinner } from './types/spinner';
import { OraSpinner } from './adapters/ora-spinner';

// ============================================================================
// COMPLETION DEFAULTS - SHARED UTILITY
// ============================================================================

const COMPLETION_DEFAULTS = {
  success: 'Done',
  error: 'Failed',
  warning: 'Warning',
  info: 'Info',
} as const;

function getDefaultCompletionText(type: 'success' | 'error' | 'warning' | 'info'): string {
  return COMPLETION_DEFAULTS[type];
}

// ============================================================================
// SPINNER MANAGER - EXTRACTED FROM LOGGER FOR SINGLE RESPONSIBILITY
// ============================================================================

class SpinnerManager {
  private singleSpinner: ISpinner;

  constructor(
    private readonly logger: Logger,
    singleSpinnerFactory: () => ISpinner = () => new OraSpinner()
  ) {
    this.singleSpinner = singleSpinnerFactory();
    // Configure the spinner with the logger's prefix for consistent formatting
    if (this.singleSpinner.setPrefix) {
      this.singleSpinner.setPrefix(this.logger.getPrefix());
    }
  }

  // Clear all spinner state
  clearAll(): void {
    this.singleSpinner.stop();
  }

  start(text: string): void {
    if (this.singleSpinner.isActive()) {
      throw new Error(
        `A single spinner is already active. Ora only supports one spinner at a time. ` +
          `Complete it first with succeedSpinner(), failSpinner(), etc.`
      );
    }
    this.singleSpinner.start(text);
  }

  updateText(text: string): void {
    this.singleSpinner.updateText(text);
  }

  stop(): void {
    this.singleSpinner.stop();
  }

  isActive(): boolean {
    return this.singleSpinner.isActive();
  }

  complete(type: 'success' | 'error' | 'warning' | 'info', text?: string): void {
    const completionText = text || getDefaultCompletionText(type);

    if (!this.singleSpinner.isActive()) {
      // Fallback to regular logging if no spinner is active
      this.logger[type](completionText);
      return;
    }

    // Complete using Ora
    const completionMethods = {
      success: () => this.singleSpinner.succeed(completionText),
      error: () => this.singleSpinner.fail(completionText),
      warning: () => this.singleSpinner.warn(completionText),
      info: () => this.singleSpinner.info(completionText),
    };
    completionMethods[type]();
  }
}

// ============================================================================
// JSON LOGGER - EXTRACTED FOR SINGLE RESPONSIBILITY
// ============================================================================

class JsonLogger {
  constructor(private readonly prefix: string) {}

  log(level: LogLevel, message: string, args: unknown[]): void {
    const logData = this.buildLogData(level, message, args);
    const output = StringUtils.safeJsonStringify(logData, 0);
    this.outputToConsole(level, output);
  }

  private buildLogData(level: LogLevel, message: string, args: unknown[]): Record<string, unknown> {
    const shouldStripEmojis = true; // Always strip emojis in JSON mode
    const finalMessage = shouldStripEmojis ? EmojiUtils.forceStripEmojis(message) : message;

    const logData: Record<string, unknown> = {
      level,
      message: finalMessage,
      prefix: this.prefix,
      timestamp: new Date().toISOString(),
    };

    // Add arguments to log data
    args.forEach((arg, index) => {
      if (this.isPlainObject(arg) && !this.hasCircularReferences(arg)) {
        this.mergeObjectArg(logData, arg as Record<string, unknown>, index, shouldStripEmojis);
      } else {
        let processedArg = arg;
        if (shouldStripEmojis && typeof arg === 'string') {
          processedArg = EmojiUtils.forceStripEmojis(arg);
        }
        this.addSimpleArg(logData, processedArg, index);
      }
    });

    return logData;
  }

  private isPlainObject(arg: unknown): arg is Record<string, unknown> {
    return arg !== null && typeof arg === 'object' && arg.constructor === Object;
  }

  private hasCircularReferences(obj: unknown): boolean {
    try {
      JSON.stringify(obj);
      return false;
    } catch (error) {
      return error instanceof TypeError && error.message.includes('circular');
    }
  }

  private mergeObjectArg(
    logData: Record<string, unknown>,
    arg: Record<string, unknown>,
    index: number,
    shouldStripEmojis: boolean
  ): void {
    Object.keys(arg).forEach(key => {
      const safeKey = key in logData ? `arg${index}_${key}` : key;
      let value = arg[key];
      if (shouldStripEmojis && typeof value === 'string') {
        value = EmojiUtils.forceStripEmojis(value);
      }
      logData[safeKey] = value;
    });
  }

  private addSimpleArg(logData: Record<string, unknown>, arg: unknown, index: number): void {
    logData[`arg${index}`] = arg;
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
// TASK RUNNER - EXTRACTED FOR SINGLE RESPONSIBILITY
// ============================================================================

class TaskRunner {
  constructor(private readonly logger: Logger) {}

  async runTasks<T = Record<string, unknown>>(
    title: string,
    tasks: ListrTask<T>[],
    options: {
      concurrent?: boolean;
      exitOnError?: boolean;
      context?: T;
      rendererOptions?: Record<string, unknown>;
    } = {}
  ): Promise<T> {
    const {
      concurrent = false,
      exitOnError = true,
      context,
      rendererOptions: _rendererOptions,
    } = options;

    const listr = this.createTaskList(tasks, {
      concurrent,
      exitOnError,
      context,
      level: 'task',
    });

    try {
      const result = await listr.run(context);
      this.logger.outputDevLogrFormattedTask(`${title} completed successfully`, '✔');
      return result;
    } catch (error) {
      this.logger.outputDevLogrFormattedTask(`${title} failed`, '✖');
      throw error;
    }
  }

  createTaskList<T = Record<string, unknown>>(
    tasks: ListrTask<T>[],
    options: {
      concurrent?: boolean;
      exitOnError?: boolean;
      context?: T;
      level?: string;
    } = {}
  ): Listr<T, typeof DevLogrRenderer> {
    const { concurrent = false, exitOnError = true, context: _context, level = 'task' } = options;

    return new Listr(tasks, {
      concurrent,
      exitOnError,
      renderer: DevLogrRenderer,
      rendererOptions: {
        prefix: this.logger.getPrefix(),
        showTimestamp: this.logger.getConfig().showTimestamp,
        useColors: this.logger.getConfig().useColors,
        timestampFormat: this.logger.getConfig().timestampFormat,
        supportsUnicode: this.logger.getConfig().supportsUnicode,
        level,
      },
    }) as Listr<T, typeof DevLogrRenderer>;
  }
}

// ============================================================================
// LOGGER IMPLEMENTATION - SIMPLIFIED AND FOCUSED
// ============================================================================

/**
 * Main DevLogr Logger class providing structured logging with visual enhancements.
 * Now simplified with extracted responsibilities for better maintainability.
 */
export class Logger {
  private readonly prefix: string;
  private readonly config: LogConfig;
  private static globalLevel?: LogLevel;
  private readonly spinnerManager: SpinnerManager;
  private readonly jsonLogger: JsonLogger;
  private readonly taskRunner: TaskRunner;

  constructor(prefix: string) {
    this.prefix = prefix;
    this.config = LogConfiguration.getConfig();
    this.spinnerManager = new SpinnerManager(this);
    this.jsonLogger = new JsonLogger(prefix);
    this.taskRunner = new TaskRunner(this);
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
  // CORE LOGGING METHODS - SIMPLIFIED WITH DELEGATION
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
  // SPINNER METHODS - DELEGATED TO SPINNER MANAGER
  // ============================================================================

  // Single-spinner API (uses Ora)
  startSpinner(text?: string, _options?: Omit<SpinnerOptions, 'text'>): void {
    if (this.config.useJson || !SpinnerUtils.supportsSpinners()) {
      this.task(text || 'Loading...');
      return;
    }
    this.spinnerManager.start(text || 'Loading...');
  }

  updateSpinnerText(text: string): void {
    if (this.config.useJson || !SpinnerUtils.supportsSpinners()) {
      return;
    }
    this.spinnerManager.updateText(text);
  }

  stopSpinner(): void {
    if (this.config.useJson || !SpinnerUtils.supportsSpinners()) {
      return;
    }
    this.spinnerManager.stop();
  }

  // Simplified completion methods using delegation
  completeSpinner(type: 'success' | 'error' | 'warning' | 'info', text?: string): void {
    // Use fallback logging for environments that don't support spinners properly
    if (this.config.useJson || !SpinnerUtils.supportsSpinners()) {
      const completionText = text || getDefaultCompletionText(type);
      switch (type) {
        case 'success':
          this.success(completionText);
          break;
        case 'error':
          this.error(completionText);
          break;
        case 'warning':
          this.warning(completionText);
          break;
        case 'info':
          this.info(completionText);
          break;
      }
      return;
    }
    // Delegate to spinner manager for TTY environments that support spinners
    this.spinnerManager.complete(type, text);
  }

  // Convenience methods - simplified
  completeSpinnerWithSuccess(text?: string): void {
    this.completeSpinner('success', text);
  }
  completeSpinnerWithError(text?: string): void {
    this.completeSpinner('error', text);
  }
  completeSpinnerWithWarning(text?: string): void {
    this.completeSpinner('warning', text);
  }
  completeSpinnerWithInfo(text?: string): void {
    this.completeSpinner('info', text);
  }
  succeedSpinner(text?: string): void {
    this.completeSpinner('success', text);
  }
  failSpinner(text?: string): void {
    this.completeSpinner('error', text);
  }
  warnSpinner(text?: string): void {
    this.completeSpinner('warning', text);
  }
  infoSpinner(text?: string): void {
    this.completeSpinner('info', text);
  }

  // ============================================================================
  // NAMED SPINNER METHODS - DELEGATED TO SPINNERUTILS FOR MULTI-SPINNER SUPPORT
  // ============================================================================

  /**
   * Start a named spinner that can run concurrently with other named spinners.
   * Uses SpinnerUtils for multi-spinner management.
   *
   * @param key - Unique identifier for this spinner
   * @param text - Text to display with the spinner
   */
  startNamedSpinner(key: string, text: string): void {
    if (this.config.useJson || !SpinnerUtils.supportsSpinners()) {
      this.task(text);
      return;
    }

    const fullKey = `${this.prefix}:${key}`;

    // Check if spinner already exists to provide proper error message
    if (SpinnerUtils.getSpinner(fullKey)) {
      throw new Error(
        `Spinner with key '${key}' is already active. Complete it first with succeedSpinner/failSpinner/etc.`
      );
    }

    const options = this.buildSpinnerOptions(text, 'task');
    SpinnerUtils.start(fullKey, options);
  }

  /**
   * Update the text of a named spinner.
   *
   * @param key - Unique identifier of the spinner
   * @param text - New text to display
   */
  updateNamedSpinnerText(key: string, text: string): void {
    if (this.config.useJson || !SpinnerUtils.supportsSpinners()) {
      return;
    }

    const fullKey = `${this.prefix}:${key}`;
    SpinnerUtils.updateText(fullKey, text);
  }

  /**
   * Stop a named spinner without completion message.
   *
   * @param key - Unique identifier of the spinner
   */
  stopNamedSpinner(key: string): void {
    if (this.config.useJson || !SpinnerUtils.supportsSpinners()) {
      return;
    }

    const fullKey = `${this.prefix}:${key}`;
    SpinnerUtils.stop(fullKey);
  }

  /**
   * Complete a named spinner with success status.
   *
   * @param key - Unique identifier of the spinner
   * @param text - Optional success message
   */
  succeedNamedSpinner(key: string, text?: string): void {
    if (this.config.useJson || !SpinnerUtils.supportsSpinners()) {
      this.success(text || getDefaultCompletionText('success'));
      return;
    }

    const fullKey = `${this.prefix}:${key}`;
    SpinnerUtils.succeed(fullKey, text);

    // Explicitly stop to ensure cleanup
    SpinnerUtils.stop(fullKey);

    return;
  }

  /**
   * Complete a named spinner with failure status.
   *
   * @param key - Unique identifier of the spinner
   * @param text - Optional failure message
   */
  failNamedSpinner(key: string, text?: string): void {
    if (this.config.useJson || !SpinnerUtils.supportsSpinners()) {
      this.error(text || getDefaultCompletionText('error'));
      return;
    }

    const fullKey = `${this.prefix}:${key}`;
    SpinnerUtils.fail(fullKey, text);

    // Explicitly stop to ensure cleanup
    SpinnerUtils.stop(fullKey);
  }

  /**
   * Complete a named spinner with warning status.
   *
   * @param key - Unique identifier of the spinner
   * @param text - Optional warning message
   */
  warnNamedSpinner(key: string, text?: string): void {
    if (this.config.useJson || !SpinnerUtils.supportsSpinners()) {
      this.warning(text || getDefaultCompletionText('warning'));
      return;
    }

    const fullKey = `${this.prefix}:${key}`;
    SpinnerUtils.succeed(fullKey, text); // SpinnerUtils doesn't have warn, use succeed

    // Explicitly stop to ensure cleanup
    SpinnerUtils.stop(fullKey);
  }

  /**
   * Complete a named spinner with info status.
   *
   * @param key - Unique identifier of the spinner
   * @param text - Optional info message
   */
  infoNamedSpinner(key: string, text?: string): void {
    if (this.config.useJson || !SpinnerUtils.supportsSpinners()) {
      this.info(text || getDefaultCompletionText('info'));
      return;
    }

    const fullKey = `${this.prefix}:${key}`;
    SpinnerUtils.info(fullKey, text);

    // Explicitly stop to ensure cleanup
    SpinnerUtils.stop(fullKey);
  }

  /**
   * Check if a named spinner is currently active.
   *
   * @param key - Unique identifier of the spinner
   * @returns True if the spinner is active, false otherwise
   */
  isNamedSpinnerActive(key: string): boolean {
    if (this.config.useJson || !SpinnerUtils.supportsSpinners()) {
      return false;
    }

    const fullKey = `${this.prefix}:${key}`;
    const spinner = SpinnerUtils.getSpinner(fullKey);
    return !!spinner;
  }

  // ============================================================================
  // TASK METHODS - DELEGATED TO TASK RUNNER
  // ============================================================================

  async runTasks<T = Record<string, unknown>>(
    title: string,
    tasks: ListrTask<T>[],
    options?: {
      concurrent?: boolean;
      exitOnError?: boolean;
      context?: T;
      rendererOptions?: Record<string, unknown>;
    }
  ): Promise<T> {
    return this.taskRunner.runTasks(title, tasks, options);
  }

  createTaskList<T = Record<string, unknown>>(
    tasks: ListrTask<T>[],
    options?: {
      concurrent?: boolean;
      exitOnError?: boolean;
      context?: T;
      level?: string;
    }
  ): Listr<T, typeof DevLogrRenderer> {
    return this.taskRunner.createTaskList(tasks, options);
  }

  // Simplified task methods using the base runTasks
  async runConcurrentTasks<T = Record<string, unknown>>(
    title: string,
    tasks: ListrTask<T>[],
    contextOrOptions?: T | { context?: T; level?: string }
  ): Promise<T> {
    const options = this.normalizeTaskOptions(contextOrOptions, true);
    return this.runTasks(title, tasks, options);
  }

  async runSequentialTasks<T = Record<string, unknown>>(
    title: string,
    tasks: ListrTask<T>[],
    contextOrOptions?: T | { context?: T; level?: string }
  ): Promise<T> {
    const options = this.normalizeTaskOptions(contextOrOptions, false);
    return this.runTasks(title, tasks, options);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  spacer(): void {
    if (!this.config.useJson) {
      console.log();
    }
  }

  separator(title?: string): void {
    if (this.config.useJson) {
      return;
    }

    const SEPARATOR_LENGTH = 60; // Fixed total length
    const dashChar = this.config.supportsUnicode ? '─' : '-';

    if (title) {
      // Format: "-- Title ------------------" (fixed total length)
      const prefix = `${dashChar}${dashChar} ${title} `;
      const remainingLength = Math.max(0, SEPARATOR_LENGTH - prefix.length);
      const suffix = StringUtils.repeat(dashChar, remainingLength);
      const fullSeparator = `${prefix}${suffix}`;

      // Apply gray color
      const grayedSeparator = ChalkUtils.colorize(fullSeparator, 'dim', this.config.useColors);
      console.log(grayedSeparator);
    } else {
      // Plain separator line (fixed length)
      const separator = StringUtils.repeat(dashChar, SEPARATOR_LENGTH);
      const grayedSeparator = ChalkUtils.colorize(separator, 'dim', this.config.useColors);
      console.log(grayedSeparator);
    }
  }

  // ============================================================================
  // CORE PRIVATE METHODS - SIMPLIFIED
  // ============================================================================

  private getEffectiveLevel(): LogLevel {
    return Logger.globalLevel ?? this.config.level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [
      LogLevel.ERROR,
      LogLevel.WARNING,
      LogLevel.INFO,
      LogLevel.DEBUG,
      LogLevel.TRACE,
    ];
    const effectiveLevel = this.getEffectiveLevel();
    const currentIndex = levels.indexOf(level);
    const effectiveIndex = levels.indexOf(effectiveLevel);
    return currentIndex <= effectiveIndex;
  }

  log(level: LogLevel, logLevel: string, message: string, ...args: unknown[]): void {
    if (!this.shouldLog(level)) {
      return;
    }

    if (this.config.useJson) {
      this.jsonLogger.log(level, message, args);
    } else {
      this.logFormatted(level, logLevel, message, args);
    }
  }

  private logFormatted(level: LogLevel, logLevel: string, message: string, args: unknown[]): void {
    const formattedMessage = this.formatMessage(logLevel, message, args);
    this.outputToConsole(level, formattedMessage);
  }

  private formatMessage(level: string, message: string, args: unknown[]): string {
    // Use centralized formatting - MessageFormatter handles all configuration internally
    return MessageFormatter.formatMessage(message, level, this.prefix, args);
  }

  private outputToConsole(level: LogLevel, message: string): void {
    const outputMethods: Record<string, (message: string) => void> = {
      [LogLevel.ERROR]: console.error,
      [LogLevel.WARNING]: console.warn,
      [LogLevel.DEBUG]: console.debug,
      [LogLevel.TRACE]: console.debug,
    };

    const outputMethod = outputMethods[level] || console.log;
    outputMethod(message);
  }

  // Helper methods for extracted classes
  buildSpinnerOptions(
    text: string,
    level: string,
    options: Record<string, unknown> = {}
  ): SpinnerOptions {
    const _rendererOptions = {
      collapseSubtasks: false,
      showSubtasks: true,
      clearOutput: false,
      collapse: false,
      showErrorMessage: true,
      removeEmptyLines: false,
      formatOutput: 'wrap',
      timer: {
        condition: false,
      },
      ...((options.rendererOptions as Record<string, unknown>) || {}),
    };

    const theme = ThemeProvider.getTheme(level, undefined, this.config.supportsUnicode);

    return {
      text,
      level,
      prefix: this.prefix,
      useColors: this.config.useColors,
      theme,
      ...options,
    };
  }

  outputDevLogrFormattedTask(message: string, symbol?: string): void {
    // Use centralized formatting with the provided symbol or default task symbol
    const theme = ThemeProvider.getTheme('task', undefined, this.config.supportsUnicode);
    const taskSymbol = symbol || theme.symbol;

    const formattedMessage = MessageFormatter.formatWithPrefix(
      message,
      taskSymbol,
      'task',
      this.prefix
    );

    console.log(formattedMessage);
  }

  private normalizeTaskOptions<T>(
    contextOrOptions?: T | { context?: T; level?: string },
    concurrent = false
  ): { concurrent: boolean; context?: T } {
    if (!contextOrOptions) {
      return { concurrent };
    }

    if (
      typeof contextOrOptions === 'object' &&
      contextOrOptions !== null &&
      'context' in contextOrOptions
    ) {
      return { concurrent, context: (contextOrOptions as { context?: T }).context };
    }

    return { concurrent, context: contextOrOptions as T };
  }

  // Public getters for extracted classes
  getConfig(): LogConfig {
    return this.config;
  }

  getPrefix(): string {
    return this.prefix;
  }

  // Getter for tests to check spinner state
  get singleSpinnerListr(): Listr | null {
    // For backward compatibility with tests - return null since we don't track Listr directly
    return null;
  }

  // Check if a spinner is currently active
  isSpinnerActive(): boolean {
    return this.spinnerManager.isActive();
  }

  // Clear all spinner state (for testing purposes)
  clearSpinnerState(): void {
    this.spinnerManager.clearAll();
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================
}

/**
 * Factory function to create a new Logger instance with the specified prefix.
 */
export function createLogger(prefix: string): Logger {
  return new Logger(prefix);
}
