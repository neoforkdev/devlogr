import { Listr, ListrTask } from 'listr2';
import { TerminalUtils } from './terminal';
import { LogTheme, TimestampFormat } from '../types';
import { DevLogrRenderer } from '../devlogr-renderer.js';

// ============================================================================
// SPINNER UTILITY - LISTR2 TASK MANAGEMENT
// ============================================================================

/**
 * Configuration options for customizing spinner appearance and behavior.
 */
export interface SpinnerOptions {
  /** Text to display with the spinner */
  text?: string;
  
  /** Symbol to use for the spinner animation */
  symbol?: string;
  
  /** Color for the spinner and text */
  color?: string;
  
  /** Additional text to prefix before the spinner */
  prefixText?: string;
  
  /** Indentation level for nested display */
  indent?: number;
  
  /** Unique prefix identifier for the spinner */
  prefix?: string;
  
  /** Whether to show timestamps */
  showTimestamp?: boolean;
  
  /** Whether to use colors in output */
  useColors?: boolean;
  
  /** Log level for the spinner message */
  level?: string;
  
  /** Theme configuration for styling */
  theme?: LogTheme;
  
  /** Format for timestamp display */
  timestampFormat?: TimestampFormat;
}

interface TaskInfo {
  listr: Listr;
  resolver?: () => void;
  rejecter?: (error: Error) => void;
  title: string;
  spinner?: any;
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
export class SpinnerUtils {
  private static tasks = new Map<string, TaskInfo>();

  /**
   * Start a named spinner with the specified options.
   * 
   * @param key - Unique identifier for this spinner
   * @param options - Spinner configuration options
   * @returns Listr instance for the spinner
   */
  static start(key: string, options: SpinnerOptions = {}): Listr {
    // Stop existing task with same key
    SpinnerUtils.stop(key);

    const title = options.text || 'Processing...';

    if (!SpinnerUtils.supportsSpinners()) {
      // Fallback: just store the task info without actually showing spinner
      const mockListr = { run: () => Promise.resolve() } as any;
      SpinnerUtils.tasks.set(key, { listr: mockListr, title });
      return mockListr;
    }

    // Create the actual spinner instance for tracking
    const spinnerInstance = SpinnerUtils.create(options);

    if (spinnerInstance?.start) {
      spinnerInstance.start();
    }

    const listr = new Listr(
      [
        {
          title,
          task: () => {
            return new Promise<void>((resolve, reject) => {
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
        renderer: DevLogrRenderer,
        rendererOptions: {
          prefix: options.prefix || key,
          showTimestamp: options.showTimestamp ?? true,
          useColors: options.useColors ?? true,
          timestampFormat: options.timestampFormat || TimestampFormat.TIME,
          supportsUnicode: options.theme?.symbol ? true : false,
        },
      }
    ) as any;

    SpinnerUtils.tasks.set(key, { listr, title, spinner: spinnerInstance });

    // Start the task and handle cleanup
    listr.run().finally(() => {
      SpinnerUtils.tasks.delete(key);
    });

    return listr;
  }

  /**
   * Stop a named spinner without completion message.
   * 
   * @param key - Unique identifier of the spinner to stop
   */
  static stop(key: string): void {
    const taskInfo = SpinnerUtils.tasks.get(key);
    if (taskInfo) {
      if (taskInfo.spinner?.stop) taskInfo.spinner.stop();
      if (taskInfo.spinner?.clear) taskInfo.spinner.clear();
      if (taskInfo.resolver) taskInfo.resolver();
    }
    SpinnerUtils.tasks.delete(key);
  }

  /**
   * Update the display text of an active spinner.
   * 
   * @param key - Unique identifier of the spinner
   * @param text - New text to display
   */
  static updateText(key: string, text: string): void {
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
  static succeed(key: string, text?: string): string | undefined {
    const taskInfo = SpinnerUtils.tasks.get(key);
    if (taskInfo) {
      if (text && taskInfo.listr?.tasks?.[0]) {
        taskInfo.listr.tasks[0].title = text;
      }

      if (taskInfo.spinner?.stop) taskInfo.spinner.stop();
      if (taskInfo.spinner?.clear) taskInfo.spinner.clear();
      if (taskInfo.resolver) taskInfo.resolver();
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
  static fail(key: string, text?: string): string | undefined {
    const taskInfo = SpinnerUtils.tasks.get(key);
    if (taskInfo) {
      if (text && taskInfo.listr?.tasks?.[0]) {
        taskInfo.listr.tasks[0].title = text;
      }

      if (taskInfo.spinner?.stop) taskInfo.spinner.stop();
      if (taskInfo.spinner?.clear) taskInfo.spinner.clear();
      if (taskInfo.rejecter) {
        taskInfo.rejecter(new Error(text || 'Task failed'));
      }
      return text;
    }
    return undefined;
  }

  /**
   * Complete task with info (alias for succeed)
   */
  static info(key: string, text?: string): string | undefined {
    return SpinnerUtils.succeed(key, text);
  }

  /**
   * Create a mock spinner for testing
   */
  static create(options: SpinnerOptions = {}): any {
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
  static getSpinner(key: string): { text?: string; listr?: any } | undefined {
    const taskInfo = SpinnerUtils.tasks.get(key);
    return taskInfo ? { text: taskInfo.title, listr: taskInfo.listr } : undefined;
  }

  /**
   * Stop all active tasks
   */
  static stopAllSpinners(): void {
    for (const [key, taskInfo] of SpinnerUtils.tasks.entries()) {
      if (taskInfo.spinner?.stop) taskInfo.spinner.stop();
      if (taskInfo.spinner?.clear) taskInfo.spinner.clear();
      if (taskInfo.resolver) taskInfo.resolver();
    }
    SpinnerUtils.tasks.clear();
  }

  /**
   * Get all active task keys
   */
  static getActiveSpinnerKeys(): string[] {
    return Array.from(SpinnerUtils.tasks.keys());
  }

  /**
   * Get currently active spinner (first one)
   */
  static getCurrentActiveSpinner(): string | null {
    return SpinnerUtils.getActiveSpinnerKeys()[0] || null;
  }

  /**
   * Check if spinners are supported in the current environment.
   * 
   * @returns True if spinners can be displayed, false otherwise
   */
  static supportsSpinners(): boolean {
    return (
      TerminalUtils.supportsColor() && process.stdout.isTTY && !process.env.DEVLOGR_OUTPUT_JSON
    );
  }

  /**
   * Get task statistics for debugging/testing
   */
  static getSpinnerStats(): {
    totalSpinners: number;
    activeSpinner: string | null;
    hasRotationCycle: boolean;
    isSpinnerPaused: boolean;
  } {
    return {
      totalSpinners: SpinnerUtils.tasks.size,
      activeSpinner: SpinnerUtils.getCurrentActiveSpinner(),
      hasRotationCycle: false, // Removed rotation complexity
      isSpinnerPaused: false,
    };
  }

  /**
   * Pause/Resume methods (listr2 handles this automatically)
   */
  static pauseSpinners(): void {
    // listr2 handles pausing automatically
  }

  static resumeSpinners(): void {
    // listr2 handles resuming automatically
  }
}
