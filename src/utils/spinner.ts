import { Listr, ListrTask } from 'listr2';
import { TerminalUtils } from './terminal';
import { LogTheme, TimestampFormat } from '../types';
import { DevLogrRenderer } from '../devlogr-renderer.js';

// ============================================================================
// SPINNER UTILITY - LISTR2 TASK MANAGEMENT
// ============================================================================

export interface SpinnerOptions {
  text?: string;
  symbol?: string;
  color?: string;
  prefixText?: string;
  indent?: number;
  prefix?: string;
  showTimestamp?: boolean;
  useColors?: boolean;
  level?: string;
  theme?: LogTheme;
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
 * Spinner utility using listr2 for reliable task management
 * Supports multiple concurrent spinners with automatic cleanup
 */
export class SpinnerUtils {
  private static tasks = new Map<string, TaskInfo>();

  /**
   * Start a named task/spinner
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
   * Stop a named task
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
   * Update text of a named task
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
   * Complete task with success
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
   * Complete task with failure
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
   * Check if spinners are supported in current environment
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
