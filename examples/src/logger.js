'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.Logger = void 0;
exports.createLogger = createLogger;
const chalk_1 = __importDefault(require('chalk'));
const listr2_1 = require('listr2');
const types_1 = require('./types');
const devlogr_renderer_js_1 = require('./devlogr-renderer.js');
const config_1 = require('./config');
const themes_1 = require('./themes');
const formatters_1 = require('./formatters');
const tracker_1 = require('./tracker');
const utils_1 = require('./utils');
const utils_2 = require('./utils');
const utils_3 = require('./utils');
// ============================================================================
// LOGGER IMPLEMENTATION - CORE FUNCTIONALITY
// ============================================================================
/**
 * Main DevLogr Logger class providing structured logging with visual enhancements.
 *
 * The Logger class is the heart of DevLogr, offering:
 * - Multiple log levels (error, warning, info, debug, trace, success)
 * - Animated spinners with automatic fallbacks
 * - Task management integration with listr2
 * - JSON output mode for machine parsing
 * - Terminal-aware formatting with color and emoji support
 * - Zero-configuration setup with environment variable overrides
 *
 * @example Basic Usage
 * ```typescript
 * import { createLogger } from '@neofork/devlogr';
 *
 * const log = createLogger('my-app');
 *
 * log.info('Application starting...');
 * log.success('Setup complete!');
 * log.error('Something went wrong', error);
 * ```
 *
 * @example Spinner Usage
 * ```typescript
 * const log = createLogger('deploy');
 *
 * log.startSpinner('Deploying application...');
 * // ... do work ...
 * log.succeedSpinner('Deployment successful!');
 * ```
 *
 * @example Task Management
 * ```typescript
 * const log = createLogger('build');
 *
 * await log.runTasks('Build Process', [
 *   { title: 'Compile TypeScript', task: () => compileTS() },
 *   { title: 'Bundle Assets', task: () => bundleAssets() },
 *   { title: 'Generate Documentation', task: () => generateDocs() }
 * ]);
 * ```
 */
class Logger {
  constructor(prefix) {
    // Single spinner state - wraps around multi-spinner API
    this.singleSpinnerListr = null;
    this.singleSpinnerTask = null;
    this.prefix = prefix;
    this.config = config_1.LogConfiguration.getConfig();
    tracker_1.PrefixTracker.register(prefix);
  }
  // ============================================================================
  // STATIC LEVEL MANAGEMENT
  // ============================================================================
  /**
   * Set the global log level for all Logger instances.
   * Overrides environment variable configuration.
   *
   * @param level - The minimum log level to display
   */
  static setLevel(level) {
    Logger.globalLevel = level;
  }
  /**
   * Reset the global log level to use environment-based configuration.
   */
  static resetLevel() {
    Logger.globalLevel = undefined;
  }
  // ============================================================================
  // CORE LOGGING METHODS
  // ============================================================================
  /**
   * Log an informational message.
   *
   * @param message - The main message to log
   * @param args - Additional arguments to include in the log output
   */
  info(message, ...args) {
    this.log(types_1.LogLevel.INFO, 'info', message, ...args);
  }
  /**
   * Log an error message with optional error object.
   *
   * @param message - The error message to log
   * @param error - Optional error object or additional data
   * @param args - Additional arguments to include in the log output
   */
  error(message, error, ...args) {
    const allArgs = error ? [error, ...args] : args;
    this.log(types_1.LogLevel.ERROR, 'error', message, ...allArgs);
  }
  /**
   * Log a warning message.
   *
   * @param message - The warning message to log
   * @param args - Additional arguments to include in the log output
   */
  warning(message, ...args) {
    this.log(types_1.LogLevel.WARNING, 'warn', message, ...args);
  }
  /**
   * Alias for warning() method.
   *
   * @param message - The warning message to log
   * @param args - Additional arguments to include in the log output
   */
  warn(message, ...args) {
    this.warning(message, ...args);
  }
  /**
   * Log a debug message (only shown when debug level is enabled).
   *
   * @param message - The debug message to log
   * @param args - Additional arguments to include in the log output
   */
  debug(message, ...args) {
    this.log(types_1.LogLevel.DEBUG, 'debug', message, ...args);
  }
  /**
   * Log a trace message (only shown when trace level is enabled).
   *
   * @param message - The trace message to log
   * @param args - Additional arguments to include in the log output
   */
  trace(message, ...args) {
    this.log(types_1.LogLevel.TRACE, 'trace', message, ...args);
  }
  /**
   * Log a success message with positive visual styling.
   *
   * @param message - The success message to log
   * @param args - Additional arguments to include in the log output
   */
  success(message, ...args) {
    this.log(types_1.LogLevel.INFO, 'success', message, ...args);
  }
  /**
   * Log a title message with prominent visual styling.
   *
   * @param message - The title message to log
   * @param args - Additional arguments to include in the log output
   */
  title(message, ...args) {
    this.log(types_1.LogLevel.INFO, 'title', message, ...args);
  }
  /**
   * Log a task message indicating work in progress.
   *
   * @param message - The task message to log
   * @param args - Additional arguments to include in the log output
   */
  task(message, ...args) {
    this.log(types_1.LogLevel.INFO, 'task', message, ...args);
  }
  /**
   * Log a plain message without any visual styling or symbols.
   *
   * @param message - The plain message to log
   * @param args - Additional arguments to include in the log output
   */
  plain(message, ...args) {
    this.log(types_1.LogLevel.INFO, 'plain', message, ...args);
  }
  // ============================================================================
  // SPINNER MANAGEMENT METHODS
  // ============================================================================
  /**
   * Start an animated spinner with optional text and styling options.
   *
   * Spinners provide visual feedback for long-running operations. They automatically
   * fall back to simple task messages in JSON mode or when the terminal doesn't
   * support ANSI escape sequences.
   *
   * @param text - Text to display alongside the spinner (defaults to "Processing...")
   * @param options - Optional spinner configuration (color, style, etc.)
   *
   * @example
   * ```typescript
   * log.startSpinner('Installing dependencies...');
   * // ... perform work ...
   * log.succeedSpinner('Dependencies installed!');
   * ```
   *
   * @example With custom options
   * ```typescript
   * log.startSpinner('Deploying...', { color: 'yellow' });
   * ```
   */
  startSpinner(text, options) {
    if (this.config.useJson || !utils_3.SpinnerUtils.supportsSpinners()) {
      this.task(text || 'Processing...');
      return;
    }
    // Stop any existing single spinner
    this.stopSpinner();
    const spinnerText = text || 'Processing...';
    // Create a single task that will be managed as a multi-spinner with one item
    const singleTask = {
      title: spinnerText,
      task: () => {
        return new Promise((resolve, reject) => {
          this.singleSpinnerTask = { resolver: resolve, rejecter: reject };
        });
      },
    };
    // Create listr instance using the multi-spinner infrastructure
    this.singleSpinnerListr = new listr2_1.Listr([singleTask], {
      concurrent: false,
      exitOnError: false,
      renderer: devlogr_renderer_js_1.DevLogrRenderer,
      rendererOptions: {
        prefix: this.prefix,
        showTimestamp: this.config.showTimestamp,
        useColors: this.config.useColors,
        timestampFormat: this.config.timestampFormat,
        supportsUnicode: this.config.supportsUnicode,
      },
    });
    // Start the spinner task (don't await, let it run in background)
    this.singleSpinnerListr.run().catch(() => {
      // Handle errors silently, as they're expected when we complete with error
    });
  }
  /**
   * Update the text of the currently active spinner.
   *
   * @param text - New text to display with the spinner
   */
  updateSpinnerText(text) {
    if (this.config.useJson || !utils_3.SpinnerUtils.supportsSpinners()) {
      return;
    }
    // Update the task title in the single spinner listr instance
    if (this.singleSpinnerListr && this.singleSpinnerListr.tasks?.[0]) {
      this.singleSpinnerListr.tasks[0].title = text;
    }
  }
  /**
   * Stop the current spinner without displaying any completion message.
   */
  stopSpinner() {
    if (this.config.useJson || !utils_3.SpinnerUtils.supportsSpinners()) {
      return;
    }
    // For manual stops, we don't want to show any completion symbol
    // Instead of resolving, we'll clean up the state without resolving the Promise
    // This should make the spinner disappear without showing success/failure
    if (this.singleSpinnerListr) {
      // Try to stop the listr renderer directly
      try {
        if (this.singleSpinnerListr.renderer?.end) {
          this.singleSpinnerListr.renderer.end();
        }
      } catch (error) {
        // Ignore errors during cleanup
      }
    }
    // Clean up state without resolving the Promise
    this.singleSpinnerListr = null;
    this.singleSpinnerTask = null;
  }
  /**
   * Complete the current spinner with a specific completion type and message.
   *
   * @param type - Type of completion (success, error, warning, info)
   * @param text - Optional completion message (uses default if not provided)
   */
  completeSpinner(type, text) {
    const completionText = text || this.getDefaultCompletionText(type);
    if (this.config.useJson || !utils_3.SpinnerUtils.supportsSpinners()) {
      // In JSON mode or when spinners aren't supported, just log the message
      this[type](completionText);
      return;
    }
    // If no spinner is active, fall back to regular logging
    if (!this.singleSpinnerListr || !this.singleSpinnerTask) {
      this[type](completionText);
      return;
    }
    // Update the task title with completion text and complete the spinner
    if (this.singleSpinnerListr.tasks?.[0]) {
      this.singleSpinnerListr.tasks[0].title = completionText;
    }
    // Complete the task based on type
    if (type === 'error') {
      if (this.singleSpinnerTask.rejecter) {
        this.singleSpinnerTask.rejecter(new Error(completionText));
      }
    } else {
      if (this.singleSpinnerTask.resolver) {
        this.singleSpinnerTask.resolver();
      }
    }
    // Clean up state
    this.singleSpinnerListr = null;
    this.singleSpinnerTask = null;
    // No additional logging needed - the task title update handles the visual completion
  }
  /**
   * Complete the current spinner with a success message.
   *
   * @param text - Optional success message
   */
  completeSpinnerWithSuccess(text) {
    this.completeSpinner('success', text);
  }
  /**
   * Complete the current spinner with an error message.
   *
   * @param text - Optional error message
   */
  completeSpinnerWithError(text) {
    this.completeSpinner('error', text);
  }
  /**
   * Complete the current spinner with a warning message.
   *
   * @param text - Optional warning message
   */
  completeSpinnerWithWarning(text) {
    this.completeSpinner('warning', text);
  }
  /**
   * Complete the current spinner with an info message.
   *
   * @param text - Optional info message
   */
  completeSpinnerWithInfo(text) {
    this.completeSpinner('info', text);
  }
  /**
   * Complete the current spinner with a success message (short alias).
   *
   * @param text - Optional success message
   *
   * @example
   * ```typescript
   * log.startSpinner('Uploading files...');
   * log.succeedSpinner('Upload complete!');
   * ```
   */
  succeedSpinner(text) {
    this.completeSpinner('success', text);
  }
  /**
   * Complete the current spinner with an error message (short alias).
   *
   * @param text - Optional error message
   */
  failSpinner(text) {
    this.completeSpinner('error', text);
  }
  /**
   * Complete the current spinner with a warning message (short alias).
   *
   * @param text - Optional warning message
   */
  warnSpinner(text) {
    this.completeSpinner('warning', text);
  }
  /**
   * Complete the current spinner with an info message (short alias).
   *
   * @param text - Optional info message
   */
  infoSpinner(text) {
    this.completeSpinner('info', text);
  }
  // ============================================================================
  // LISTR2 INTEGRATION METHODS
  // ============================================================================
  /**
   * Execute a listr2 task list with proper logger integration
   */
  async runTasks(title, tasks, options) {
    // Show title with logger prefix
    this.info(`${title}`);
    if (this.config.useJson) {
      // In JSON mode, just log task execution
      this.debug('Executing tasks:', { title, taskCount: tasks.length });
      // Execute tasks sequentially in JSON mode for consistent output
      const context = options?.context || {};
      for (const task of tasks) {
        if (typeof task.task === 'function') {
          try {
            this.debug(`Starting task: ${task.title}`);
            await task.task(context, {});
            this.info(`✓ ${task.title}`);
          } catch (error) {
            this.error(`✗ ${task.title}`, error);
            if (options?.exitOnError !== false) {
              throw error;
            }
          }
        }
      }
      return context;
    }
    // Create listr2 instance with DevLogr renderer
    const listr = new listr2_1.Listr(tasks, {
      concurrent: options?.concurrent ?? false,
      exitOnError: options?.exitOnError ?? true,
      ctx: options?.context,
      renderer: devlogr_renderer_js_1.DevLogrRenderer,
      rendererOptions: {
        prefix: this.prefix,
        showTimestamp: this.config.showTimestamp,
        useColors: this.config.useColors,
        timestampFormat: this.config.timestampFormat,
        supportsUnicode: this.config.supportsUnicode,
        ...options?.rendererOptions,
      },
    });
    try {
      const result = await listr.run();
      this.success(`${title} completed successfully`);
      return result;
    } catch (error) {
      this.error(`${title} failed`, error);
      throw error;
    }
  }
  /**
   * Create a task list with the logger's prefix integration
   */
  createTaskList(tasks, options) {
    return new listr2_1.Listr(tasks, {
      concurrent: options?.concurrent ?? false,
      exitOnError: options?.exitOnError ?? true,
      ctx: options?.context,
      renderer: devlogr_renderer_js_1.DevLogrRenderer,
      rendererOptions: {
        prefix: this.prefix,
        showTimestamp: this.config.showTimestamp,
        useColors: this.config.useColors,
        timestampFormat: this.config.timestampFormat,
        supportsUnicode: this.config.supportsUnicode,
        taskLevel: options?.taskLevel,
      },
    });
  }
  /**
   * Execute concurrent tasks with proper logging
   */
  async runConcurrentTasks(title, tasks, contextOrOptions) {
    // Handle both signatures for backward compatibility
    let context;
    let taskLevel;
    // Check if it's an options object by looking for known option properties
    if (
      contextOrOptions &&
      typeof contextOrOptions === 'object' &&
      ('context' in contextOrOptions || 'taskLevel' in contextOrOptions)
    ) {
      const options = contextOrOptions;
      context = options.context;
      taskLevel = options.taskLevel;
    } else {
      context = contextOrOptions;
    }
    return this.runTasks(title, tasks, {
      concurrent: true,
      exitOnError: false,
      context,
      rendererOptions: taskLevel ? { taskLevel } : undefined,
    });
  }
  /**
   * Execute sequential tasks with proper logging
   */
  async runSequentialTasks(title, tasks, contextOrOptions) {
    // Handle both signatures for backward compatibility
    let context;
    let taskLevel;
    // Check if it's an options object by looking for known option properties
    if (
      contextOrOptions &&
      typeof contextOrOptions === 'object' &&
      ('context' in contextOrOptions || 'taskLevel' in contextOrOptions)
    ) {
      const options = contextOrOptions;
      context = options.context;
      taskLevel = options.taskLevel;
    } else {
      context = contextOrOptions;
    }
    return this.runTasks(title, tasks, {
      concurrent: false,
      exitOnError: true,
      context,
      rendererOptions: taskLevel ? { taskLevel } : undefined,
    });
  }
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  spacer() {
    if (!this.config.useJson) {
      console.log();
    }
  }
  separator(title) {
    if (this.config.useJson) {
      return;
    }
    const width = 50;
    const line = title
      ? `--- ${title} ${'-'.repeat(Math.max(0, width - title.length - 8))}`
      : '-'.repeat(width);
    console.log(this.config.useColors ? chalk_1.default.dim(line) : line);
  }
  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================
  getEffectiveLevel() {
    return Logger.globalLevel ?? this.config.level;
  }
  shouldLog(level) {
    const levels = [
      types_1.LogLevel.ERROR,
      types_1.LogLevel.WARNING,
      types_1.LogLevel.INFO,
      types_1.LogLevel.DEBUG,
      types_1.LogLevel.TRACE,
    ];
    const effectiveLevel = this.getEffectiveLevel();
    const currentIndex = levels.indexOf(level);
    const effectiveIndex = levels.indexOf(effectiveLevel);
    return currentIndex <= effectiveIndex;
  }
  log(level, logLevel, message, ...args) {
    if (!this.shouldLog(level)) {
      return;
    }
    if (this.config.useJson) {
      this.logJson(level, message, args);
    } else {
      this.logFormatted(level, logLevel, message, args);
    }
  }
  logJson(level, message, args) {
    const logData = this.buildJsonLogData(level, message, args);
    this.outputToConsole(level, utils_2.StringUtils.safeJsonStringify(logData));
  }
  buildJsonLogData(level, message, args) {
    // In JSON mode, always strip emojis for clean machine-readable output
    const shouldStripEmojis = true;
    const finalMessage = shouldStripEmojis ? utils_1.EmojiUtils.forceStripEmojis(message) : message;
    const logData = {
      level,
      message: finalMessage,
      prefix: this.prefix,
      timestamp: new Date().toISOString(),
    };
    // Add arguments to log data with emoji stripping
    args.forEach((arg, index) => {
      if (this.isPlainObject(arg) && !this.hasCircularReferences(arg)) {
        this.mergeObjectArg(logData, arg, index, shouldStripEmojis);
      } else {
        let processedArg = arg;
        if (shouldStripEmojis && typeof arg === 'string') {
          processedArg = utils_1.EmojiUtils.forceStripEmojis(arg);
        }
        this.addSimpleArg(logData, processedArg, index);
      }
    });
    return logData;
  }
  isPlainObject(arg) {
    return arg !== null && typeof arg === 'object' && arg.constructor === Object;
  }
  hasCircularReferences(obj) {
    try {
      JSON.stringify(obj);
      return false;
    } catch (error) {
      return error instanceof TypeError && error.message.includes('circular');
    }
  }
  mergeObjectArg(logData, arg, index, shouldStripEmojis) {
    Object.keys(arg).forEach(key => {
      const safeKey = key in logData ? `arg${index}_${key}` : key;
      let value = arg[key];
      if (shouldStripEmojis && typeof value === 'string') {
        value = utils_1.EmojiUtils.forceStripEmojis(value);
      }
      logData[safeKey] = value;
    });
  }
  addSimpleArg(logData, arg, index) {
    logData[`arg${index}`] = arg;
  }
  logFormatted(level, logLevel, message, args) {
    const formattedMessage = this.formatMessage(logLevel, message, args);
    this.outputToConsole(level, formattedMessage);
  }
  formatMessage(level, message, args) {
    const theme = themes_1.ThemeProvider.getTheme(level, undefined, this.config.supportsUnicode);
    const maxPrefixLength = tracker_1.PrefixTracker.getMaxLength();
    const shouldStripEmojis = !utils_1.EmojiUtils.supportsEmoji();
    let finalMessage = message;
    if (shouldStripEmojis) {
      finalMessage = utils_1.EmojiUtils.forceStripEmojis(message);
    }
    return formatters_1.MessageFormatter.format({
      level,
      theme,
      prefix: this.prefix,
      maxPrefixLength,
      message: finalMessage,
      args,
      showTimestamp: this.config.showTimestamp,
      useColors: this.config.useColors,
      timestampFormat: this.config.timestampFormat,
      stripEmojis: shouldStripEmojis,
      includeLevel: this.config.showPrefix,
      includePrefix: this.config.showPrefix,
    });
  }
  outputToConsole(level, message) {
    switch (level) {
      case types_1.LogLevel.ERROR:
        console.error(message);
        break;
      case types_1.LogLevel.WARNING:
        console.warn(message);
        break;
      case types_1.LogLevel.DEBUG:
      case types_1.LogLevel.TRACE:
        console.debug(message);
        break;
      default:
        console.log(message);
        break;
    }
  }
  buildSpinnerOptions(text, level, options) {
    const theme = themes_1.ThemeProvider.getTheme(level, undefined, this.config.supportsUnicode);
    return {
      text,
      color: 'cyan',
      prefix: this.prefix,
      showTimestamp: this.config.showTimestamp,
      useColors: this.config.useColors,
      level,
      theme,
      timestampFormat: this.config.timestampFormat,
      ...options,
    };
  }
  getDefaultCompletionText(type) {
    const defaults = {
      success: 'Done',
      error: 'Failed',
      warning: 'Warning',
      info: 'Info',
    };
    return defaults[type];
  }
  buildListrPrefix() {
    // Build a prefix that matches the logger's format for listr2 tasks
    // Use 'task' level theme for listr2 items as they represent ongoing operations
    const theme = themes_1.ThemeProvider.getTheme('task', undefined, this.config.supportsUnicode);
    const maxPrefixLength = tracker_1.PrefixTracker.getMaxLength();
    return formatters_1.MessageFormatter.format({
      level: 'task',
      theme,
      prefix: this.prefix,
      maxPrefixLength,
      showTimestamp: this.config.showTimestamp,
      useColors: this.config.useColors,
      timestampFormat: this.config.timestampFormat,
      stripEmojis: !this.config.supportsUnicode,
      includeLevel: this.config.showPrefix,
      includePrefix: this.config.showPrefix,
    });
  }
  outputDevLogrFormattedTask(message, symbol) {
    const prefix = this.buildListrPrefix();
    // Remove the trailing space from prefix and add symbol after it
    const cleanPrefix = prefix.replace(/\s+$/, '');
    const formattedMessage = symbol
      ? `${cleanPrefix} ${symbol} ${message}`
      : `${cleanPrefix} ${message}`;
    console.log(formattedMessage);
  }
}
exports.Logger = Logger;
/**
 * Factory function to create a new Logger instance with the specified prefix.
 *
 * This is the recommended way to create logger instances. The prefix helps
 * identify log messages from different parts of your application and is used
 * for spinner management.
 *
 * @param prefix - Unique identifier for this logger instance (e.g., 'api', 'deploy', 'build')
 * @returns A new Logger instance configured with the specified prefix
 *
 * @example
 * ```typescript
 * import { createLogger } from '@neofork/devlogr';
 *
 * const log = createLogger('my-app');
 * log.info('Application starting...');
 * ```
 *
 * @example Multiple loggers
 * ```typescript
 * const apiLog = createLogger('api');
 * const dbLog = createLogger('database');
 *
 * apiLog.info('Server started on port 3000');
 * dbLog.info('Connected to database');
 * ```
 */
function createLogger(prefix) {
  return new Logger(prefix);
}
