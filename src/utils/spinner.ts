import { Listr, ListrTask } from 'listr2';
import { TerminalUtils } from './terminal';
import { LogTheme, TimestampFormat } from '../types';
import { DevLogrRenderer } from '../devlogr-renderer.js';

// ============================================================================
// LISTR2-BASED SPINNER UTILITY - SIMPLE & RELIABLE
// ============================================================================

export interface SpinnerOptions {
  text?: string;
  symbol?: string;
  color?: string;
  prefixText?: string;
  indent?: number;
  discardStdin?: boolean;
  hideCursor?: boolean;
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
}

/**
 * Simple spinner utility using listr2 for reliable task management
 * Fallback to console output when spinners aren't supported
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

    const listr = new Listr([
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
    ], {
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
    }) as any; // Type assertion to handle complex listr2 typing

    SpinnerUtils.tasks.set(key, { listr, title });

    // Start the task and properly handle completion to clean up the renderer
    listr.run()
      .then(() => {
        // Task completed successfully - renderer should have cleaned up
      })
      .catch(() => {
        // Task failed - renderer should have cleaned up
      })
      .finally(() => {
        // Ensure task is removed from our tracking
        SpinnerUtils.tasks.delete(key);
      });

    return listr;
  }

  /**
   * Stop a named task
   */
  static stop(key: string): void {
    const taskInfo = SpinnerUtils.tasks.get(key);
    if (taskInfo && taskInfo.resolver) {
      taskInfo.resolver();
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
      // Update the actual listr task title if possible
      if (taskInfo.listr && taskInfo.listr.tasks && taskInfo.listr.tasks[0]) {
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
      if (text && taskInfo.listr.tasks && taskInfo.listr.tasks[0]) {
        taskInfo.listr.tasks[0].title = text;
      }
      if (taskInfo.resolver) {
        taskInfo.resolver();
      }
      // Don't delete here - let listr.run().finally() handle cleanup
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
      if (text && taskInfo.listr.tasks && taskInfo.listr.tasks[0]) {
        taskInfo.listr.tasks[0].title = text;
      }
      if (taskInfo.rejecter) {
        taskInfo.rejecter(new Error(text || 'Task failed'));
      }
      // Don't delete here - let listr.run().finally() handle cleanup
      return text;
    }
    return undefined;
  }

  /**
   * Complete task with warning
   */
  static warn(key: string, text?: string): string | undefined {
    return SpinnerUtils.succeed(key, text); // Treat warnings as success
  }

  /**
   * Complete task with info
   */
  static info(key: string, text?: string): string | undefined {
    return SpinnerUtils.succeed(key, text); // Treat info as success
  }

  /**
   * Get a named task runner by key
   */
  static getSpinner(key: string): Listr | undefined {
    const taskInfo = SpinnerUtils.tasks.get(key);
    return taskInfo?.listr;
  }

  /**
   * Stop all active tasks
   */
  static stopAllSpinners(): void {
    for (const [key, taskInfo] of SpinnerUtils.tasks.entries()) {
      if (taskInfo.resolver) {
        taskInfo.resolver();
      }
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
   * Get currently active task key (first one for simplicity)
   */
  static getCurrentActiveSpinner(): string | null {
    const keys = SpinnerUtils.getActiveSpinnerKeys();
    return keys.length > 0 ? keys[0] : null;
  }

  /**
   * Check if spinners are supported in current environment
   */
  static supportsSpinners(): boolean {
    return TerminalUtils.supportsColor() && process.stdout.isTTY && !process.env.DEVLOGR_OUTPUT_JSON;
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
      hasRotationCycle: false, // listr2 handles this
      isSpinnerPaused: false, // listr2 handles this
    };
  }

  /**
   * Pause tasks (listr2 handles this automatically)
   */
  static pauseSpinners(): void {
    // listr2 handles pausing automatically when console.log is called
  }

  /**
   * Resume tasks (listr2 handles this automatically)
   */
  static resumeSpinners(): void {
    // listr2 handles resuming automatically
  }
}
