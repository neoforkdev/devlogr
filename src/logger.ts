import { Listr, ListrTask } from 'listr2';
import { LogLevel, LogConfig } from './types';
import { LogConfiguration } from './config';
import { ThemeProvider } from './themes';
import { MessageFormatter } from './formatters';
import { PrefixTracker } from './tracker';
import { EmojiUtils, StringUtils, SpinnerUtils, SpinnerOptions } from './utils';
import { DevLogrRenderer } from './devlogr-renderer';
import { ChalkUtils } from './utils/chalk';

// ============================================================================
// SPINNER MANAGER - EXTRACTED FROM LOGGER FOR SINGLE RESPONSIBILITY
// ============================================================================

class SpinnerManager {
  private singleSpinnerListr: Listr | null = null;
  private singleSpinnerTask: { resolver?: () => void; rejecter?: (error: Error) => void } | null =
    null;

  constructor(private readonly logger: Logger) {}

  start(text?: string, _options?: Omit<SpinnerOptions, 'text'>): void {
    const spinnerText = text || 'Loading...';

    if (this.singleSpinnerListr) {
      this.stop();
    }

    this.singleSpinnerListr = SpinnerUtils.start(
      'single',
      this.logger.buildSpinnerOptions(spinnerText, 'task', _options)
    );
    this.singleSpinnerTask = this.singleSpinnerListr?.tasks[0] as any;
  }

  updateText(text: string): void {
    if (this.singleSpinnerListr) {
      SpinnerUtils.updateText('single', text);
    }
  }

  stop(): void {
    if (this.singleSpinnerListr) {
      SpinnerUtils.stop('single');
      this.singleSpinnerListr = null;
      this.singleSpinnerTask = null;
    }
  }

  complete(type: 'success' | 'error' | 'warning' | 'info', text?: string): void {
    if (!this.singleSpinnerListr) {
      // No active spinner, nothing to complete
      return;
    }

    const completionText = text || this.getDefaultCompletionText(type);
    const completionMethods = {
      success: () => SpinnerUtils.succeed('single', completionText),
      error: () => SpinnerUtils.fail('single', completionText),
      warning: () => SpinnerUtils.fail('single', completionText),
      info: () => SpinnerUtils.info('single', completionText),
    };

    completionMethods[type]();
    this.singleSpinnerListr = null;
    this.singleSpinnerTask = null;
  }

  private getDefaultCompletionText(type: 'success' | 'error' | 'warning' | 'info'): string {
    const defaults = {
      success: 'Done',
      error: 'Failed',
      warning: 'Warning',
      info: 'Info',
    };
    return defaults[type];
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

  startSpinner(text?: string, options?: Omit<SpinnerOptions, 'text'>): void {
    if (this.config.useJson || !SpinnerUtils.supportsSpinners()) {
      this.task(text || 'Loading...');
      return;
    }
    this.spinnerManager.start(text, options);
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
    if (this.config.useJson) {
      // Only handle JSON mode fallback here
      const completionText = text || this.getDefaultCompletionText(type);
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
    // Always delegate to spinner manager - it handles CI/TTY differences properly
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
    return (this.spinnerManager as any).singleSpinnerListr;
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private getDefaultCompletionText(type: 'success' | 'error' | 'warning' | 'info'): string {
    const defaults = {
      success: 'Done',
      error: 'Failed',
      warning: 'Warning',
      info: 'Info',
    };
    return defaults[type];
  }
}

/**
 * Factory function to create a new Logger instance with the specified prefix.
 */
export function createLogger(prefix: string): Logger {
  return new Logger(prefix);
}
