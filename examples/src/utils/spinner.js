'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.SpinnerUtils = void 0;
const listr2_1 = require('listr2');
const terminal_1 = require('./terminal');
const types_1 = require('../types');
const devlogr_renderer_js_1 = require('../devlogr-renderer.js');
// Helper function to safely access Listr renderer
function getListrRenderer(listr) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderer = listr.renderer;
    return renderer && typeof renderer.end === 'function' ? renderer : null;
  } catch {
    return null;
  }
}
/**
 * Low-level spinner management utilities using listr2.
 *
 * Provides direct control over spinners for advanced use cases.
 * Most users should use the Logger class spinner methods instead.
 *
 * @example Basic Usage
 * ```typescript
 * import { SpinnerUtils } from '@neofork/devlogr';
 *
 * SpinnerUtils.start('deploy', { text: 'Deploying...' });
 * // ... do work ...
 * SpinnerUtils.succeed('deploy', 'Deployed successfully!');
 * ```
 *
 * @example Multiple Spinners
 * ```typescript
 * SpinnerUtils.start('build', { text: 'Building...' });
 * SpinnerUtils.start('test', { text: 'Testing...' });
 *
 * SpinnerUtils.succeed('build', 'Build complete');
 * SpinnerUtils.fail('test', 'Tests failed');
 * ```
 */
class SpinnerUtils {
  /**
   * Start a named spinner with the specified options.
   *
   * @param key - Unique identifier for this spinner
   * @param options - Spinner configuration options
   * @returns Listr instance for the spinner
   */
  static start(key, options = {}) {
    // Stop existing task with same key
    SpinnerUtils.stop(key);
    const title = options.text || 'Processing...';
    if (!SpinnerUtils.supportsSpinners()) {
      // Fallback: just store the task info without actually showing spinner
      const mockListr = { run: () => Promise.resolve() };
      SpinnerUtils.tasks.set(key, { listr: mockListr, title });
      return mockListr;
    }
    // Create the actual spinner instance for tracking
    const spinnerInstance = SpinnerUtils.create(options);
    if (spinnerInstance?.start) {
      spinnerInstance.start();
    }
    const listr = new listr2_1.Listr(
      [
        {
          title,
          task: () => {
            return new Promise((resolve, reject) => {
              const taskInfo = SpinnerUtils.tasks.get(key);
              if (taskInfo) {
                taskInfo.resolver = resolve;
                taskInfo.rejecter = reject;
              }
            });
          },
        },
      ],
      {
        concurrent: false,
        exitOnError: false,
        renderer: devlogr_renderer_js_1.DevLogrRenderer,
        rendererOptions: {
          prefix: options.prefix || key,
          showTimestamp: options.showTimestamp ?? true,
          useColors: options.useColors ?? true,
          timestampFormat: options.timestampFormat || types_1.TimestampFormat.TIME,
          supportsUnicode: options.theme?.symbol ? true : false,
        },
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    );
    SpinnerUtils.tasks.set(key, { listr, title, spinner: spinnerInstance });
    // Start rotation if we have multiple spinners
    if (SpinnerUtils.tasks.size > 1) {
      SpinnerUtils.startRotation();
    }
    // Start the task and handle cleanup
    listr.run().finally(() => {
      SpinnerUtils.tasks.delete(key);
      // Stop rotation if we have 1 or fewer spinners
      if (SpinnerUtils.tasks.size <= 1) {
        SpinnerUtils.stopRotation();
      }
    });
    return listr;
  }
  /**
   * Stop a named spinner without completion message.
   *
   * @param key - Unique identifier of the spinner to stop
   */
  static stop(key) {
    const taskInfo = SpinnerUtils.tasks.get(key);
    if (taskInfo) {
      // First, stop the listr2 renderer to prevent further updates
      const renderer = getListrRenderer(taskInfo.listr);
      if (renderer?.end) {
        renderer.end();
      }
      // Clear the spinner display to prevent artifacts
      if (taskInfo.spinner?.clear) taskInfo.spinner.clear();
      if (taskInfo.spinner?.stop) taskInfo.spinner.stop();
      // Resolve the promise to complete the task
      if (taskInfo.resolver) taskInfo.resolver();
      // Clear the display and ensure clean state
      if (process.stdout.isTTY) {
        process.stdout.write('\u001b[2K\r'); // Clear current line and move cursor to beginning
      }
    }
    SpinnerUtils.tasks.delete(key);
    // Stop rotation if we have 1 or fewer spinners
    if (SpinnerUtils.tasks.size <= 1) {
      SpinnerUtils.stopRotation();
    }
  }
  /**
   * Update the display text of an active spinner.
   *
   * @param key - Unique identifier of the spinner
   * @param text - New text to display
   */
  static updateText(key, text) {
    const taskInfo = SpinnerUtils.tasks.get(key);
    if (taskInfo) {
      taskInfo.title = text;
      if (taskInfo.listr?.tasks?.[0]) {
        taskInfo.listr.tasks[0].title = text;
      }
    }
  }
  /**
   * Complete a spinner with success status.
   *
   * @param key - Unique identifier of the spinner
   * @param text - Optional success message
   * @returns The completion text or undefined
   */
  static succeed(key, text) {
    const taskInfo = SpinnerUtils.tasks.get(key);
    if (taskInfo) {
      if (text && taskInfo.listr?.tasks?.[0]) {
        taskInfo.listr.tasks[0].title = text;
      }
      // First, stop the listr2 renderer to prevent further updates
      const renderer = getListrRenderer(taskInfo.listr);
      if (renderer?.end) {
        renderer.end();
      }
      // Clear the spinner display to prevent artifacts
      if (taskInfo.spinner?.clear) taskInfo.spinner.clear();
      if (taskInfo.spinner?.stop) taskInfo.spinner.stop();
      if (taskInfo.resolver) taskInfo.resolver();
      // Clear the display to ensure clean state
      if (process.stdout.isTTY) {
        process.stdout.write('\u001b[2K\r'); // Clear current line and move cursor to beginning
      }
      return text;
    }
    return undefined;
  }
  /**
   * Complete a spinner with failure status.
   *
   * @param key - Unique identifier of the spinner
   * @param text - Optional failure message
   * @returns The completion text or undefined
   */
  static fail(key, text) {
    const taskInfo = SpinnerUtils.tasks.get(key);
    if (taskInfo) {
      if (text && taskInfo.listr?.tasks?.[0]) {
        taskInfo.listr.tasks[0].title = text;
      }
      // First, stop the listr2 renderer to prevent further updates
      const renderer = getListrRenderer(taskInfo.listr);
      if (renderer?.end) {
        renderer.end();
      }
      // Clear the spinner display to prevent artifacts
      if (taskInfo.spinner?.clear) taskInfo.spinner.clear();
      if (taskInfo.spinner?.stop) taskInfo.spinner.stop();
      if (taskInfo.rejecter) {
        taskInfo.rejecter(new Error(text || 'Task failed'));
      }
      // Clear the display to ensure clean state
      if (process.stdout.isTTY) {
        process.stdout.write('\u001b[2K\r'); // Clear current line and move cursor to beginning
      }
      return text;
    }
    return undefined;
  }
  /**
   * Complete task with info (alias for succeed)
   */
  static info(key, text) {
    return SpinnerUtils.succeed(key, text);
  }
  /**
   * Create a mock spinner for testing
   */
  static create(options = {}) {
    return {
      text: options.text || '',
      start: () => {},
      stop: () => {},
      succeed: () => {},
      fail: () => {},
      warn: () => {},
      info: () => {},
      clear: () => {},
      render: () => {},
    };
  }
  /**
   * Get a named task runner by key
   */
  static getSpinner(key) {
    const taskInfo = SpinnerUtils.tasks.get(key);
    return taskInfo ? { text: taskInfo.title, listr: taskInfo.listr } : undefined;
  }
  /**
   * Stop all active tasks
   */
  static stopAllSpinners() {
    for (const [, taskInfo] of SpinnerUtils.tasks.entries()) {
      // First, stop the listr2 renderer to prevent further updates
      const renderer = getListrRenderer(taskInfo.listr);
      if (renderer?.end) {
        renderer.end();
      }
      // Clear the spinner display to prevent artifacts
      if (taskInfo.spinner?.clear) taskInfo.spinner.clear();
      if (taskInfo.spinner?.stop) taskInfo.spinner.stop();
      if (taskInfo.resolver) taskInfo.resolver();
    }
    // Clear the display to ensure clean state
    if (process.stdout.isTTY) {
      process.stdout.write('\u001b[2K\r'); // Clear current line and move cursor to beginning
    }
    SpinnerUtils.tasks.clear();
    SpinnerUtils.stopRotation();
    SpinnerUtils.currentActiveIndex = 0; // Reset rotation index
  }
  /**
   * Get all active task keys
   */
  static getActiveSpinnerKeys() {
    return Array.from(SpinnerUtils.tasks.keys());
  }
  /**
   * Get currently active spinner (rotates automatically)
   */
  static getCurrentActiveSpinner() {
    const keys = SpinnerUtils.getActiveSpinnerKeys();
    if (keys.length === 0) return null;
    if (keys.length === 1) return keys[0];
    // Return the current active spinner based on rotation index
    return keys[SpinnerUtils.currentActiveIndex % keys.length];
  }
  /**
   * Start automatic rotation between spinners
   */
  static startRotation() {
    if (SpinnerUtils.rotationTimer) return; // Already running
    SpinnerUtils.rotationTimer = setInterval(() => {
      const keys = SpinnerUtils.getActiveSpinnerKeys();
      if (keys.length > 1) {
        SpinnerUtils.currentActiveIndex = (SpinnerUtils.currentActiveIndex + 1) % keys.length;
      }
    }, 2000); // Rotate every 2 seconds
  }
  /**
   * Stop automatic rotation
   */
  static stopRotation() {
    if (SpinnerUtils.rotationTimer) {
      clearInterval(SpinnerUtils.rotationTimer);
      SpinnerUtils.rotationTimer = null;
    }
  }
  /**
   * Check if spinners are supported in the current environment.
   *
   * @returns True if spinners can be displayed, false otherwise
   */
  static supportsSpinners() {
    return (
      terminal_1.TerminalUtils.supportsColor() &&
      process.stdout.isTTY &&
      !process.env.DEVLOGR_OUTPUT_JSON
    );
  }
  /**
   * Get task statistics for debugging/testing
   */
  static getSpinnerStats() {
    const totalSpinners = SpinnerUtils.tasks.size;
    return {
      totalSpinners,
      activeSpinner: SpinnerUtils.getCurrentActiveSpinner(),
      hasRotationCycle: totalSpinners > 1, // True when multiple spinners are active
      isSpinnerPaused: false,
    };
  }
  /**
   * Pause/Resume methods (listr2 handles this automatically)
   */
  static pauseSpinners() {
    // listr2 handles pausing automatically
  }
  static resumeSpinners() {
    // listr2 handles resuming automatically
  }
}
exports.SpinnerUtils = SpinnerUtils;
SpinnerUtils.tasks = new Map();
SpinnerUtils.rotationTimer = null;
SpinnerUtils.currentActiveIndex = 0;
