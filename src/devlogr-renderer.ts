import {
  ListrRenderer,
  ListrTaskObject,
  ListrEventType,
  ListrTaskEventType,
  ListrEventManager,
  Spinner,
} from 'listr2';
import { createLogUpdate } from 'log-update';
import { MessageFormatter } from './formatters';
import { TimestampFormat } from './types';
import { ChalkUtils } from './utils/chalk';
import { TerminalUtils } from './utils';

export interface DevLogrRendererOptions {
  useColors?: boolean;
  showTimestamp?: boolean;
  timestampFormat?: TimestampFormat;
  supportsUnicode?: boolean;
  prefix?: string;
  lazy?: boolean;
  level?: string;
}

export class DevLogrRenderer implements ListrRenderer {
  public static nonTTY = true; // Enable non-TTY mode for CI environments
  public static rendererOptions: DevLogrRendererOptions = {
    lazy: false,
  };
  public static rendererTaskOptions: never;

  private options: Required<DevLogrRendererOptions>;
  private spinner: any; // Will be imported dynamically
  private updater: any; // Will be imported dynamically
  private activeTasks = new Map<
    string,
    { task: ListrTaskObject<any, typeof DevLogrRenderer>; startTime: number }
  >();
  private isCI: boolean;
  private lastOutput: string[] = [];
  private lastUpdateTime: number = 0;
  private updateThrottleMs: number = 500; // Update every 500ms in CI

  constructor(
    private readonly tasks: ListrTaskObject<any, typeof DevLogrRenderer>[],
    options: DevLogrRendererOptions = {},
    private readonly events?: ListrEventManager
  ) {
    this.options = {
      useColors: options.useColors ?? true,
      showTimestamp: options.showTimestamp ?? false,
      timestampFormat: options.timestampFormat ?? TimestampFormat.TIME,
      supportsUnicode: options.supportsUnicode ?? true,
      prefix: options.prefix ?? 'listr2',
      lazy: options.lazy ?? false,
      level: options.level ?? 'task',
    };

    // Detect CI environment for different rendering strategy
    this.isCI = TerminalUtils.isCI();
  }

  public async render(): Promise<void> {
    this.spinner = new Spinner();

    // In CI environments, don't use log-update as it doesn't work properly
    if (!this.isCI) {
      this.updater = createLogUpdate(process.stdout);
    }

    this.setupTaskListeners(this.tasks);

    if (!this.options.lazy) {
      if (this.isCI) {
        // In CI, don't start timer-based updates - only event-driven updates
        this.update();
      } else {
        this.spinner.start(() => this.update());
      }
    }

    this.events?.on(ListrEventType.SHOULD_REFRESH_RENDER, () => this.update());
  }

  public update(): void {
    if (this.isCI) {
      // In CI, skip rendering - individual task completions are handled separately
      return;
    }

    // In local environments, use log-update for smooth animations
    const output = this.createOutput();
    if (this.updater) {
      this.updater(output);
    }
  }

  public end(): void {
    if (this.spinner) {
      this.spinner.stop();
    }

    if (this.isCI) {
      // In CI, output final state
      const finalOutput = this.createOutput({ done: true });
      const outputLines = finalOutput.split('\n').filter(line => line.trim());
      outputLines.forEach(line => console.log(line));
    } else {
      // In local environments, use log-update
      if (this.updater) {
        this.updater(this.createOutput({ done: true }));
        this.updater.done();
      }
    }
  }

  private setupTaskListeners(tasks: ListrTaskObject<any, typeof DevLogrRenderer>[]): void {
    for (const task of tasks) {
      task.on(ListrTaskEventType.SUBTASK, subtasks => this.setupTaskListeners(subtasks));

      if (this.isCI) {
        // In CI, only update on completion/failure state changes
        task.on(ListrTaskEventType.STATE, () => {
          if (task.isCompleted() || task.hasFailed()) {
            this.update();
          }
        });
      } else {
        // In TTY, update on all changes for smooth animations
        const triggerUpdate = () => this.update();
        task.on(ListrTaskEventType.STATE, triggerUpdate);
        task.on(ListrTaskEventType.TITLE, triggerUpdate);
        task.on(ListrTaskEventType.OUTPUT, triggerUpdate);
      }
    }
  }

  private createOutput(options: { done?: boolean } = {}): string {
    return this.renderTasks(this.tasks, 0, options.done).join('\n');
  }

  private renderTasks(
    tasks: ListrTaskObject<any, typeof DevLogrRenderer>[],
    level: number,
    done = false
  ): string[] {
    const output: string[] = [];

    for (const task of tasks) {
      if (!task.isEnabled()) {
        continue;
      }

      let symbol: string;
      let title = task.title;

      if (task.isStarted() && !task.isCompleted() && !task.hasFailed() && !done) {
        // Loading animation - blue color
        const spinnerSymbol = this.spinner ? this.spinner.fetch() : '⠋';
        symbol = ChalkUtils.getChalkInstance(this.options.useColors).blue(spinnerSymbol);
      } else if (task.isCompleted()) {
        // Success - green color
        symbol = ChalkUtils.getChalkInstance(this.options.useColors).green('✔');
      } else if (task.hasFailed()) {
        // Error - red color
        symbol = ChalkUtils.getChalkInstance(this.options.useColors).red('✖');
      } else if (task.isSkipped() && task.message.skip) {
        // Skipped - yellow/orange color
        symbol = ChalkUtils.getChalkInstance(this.options.useColors).yellow('◯');
        title = typeof task.message.skip === 'string' ? `${title} -> ${task.message.skip}` : title;
      } else if (task.isStarted() && done) {
        // Task was interrupted - gray color
        symbol = ChalkUtils.getChalkInstance(this.options.useColors).gray('❯');
      } else {
        symbol = ' ';
      }

      if (title) {
        output.push(this.formatListrMessage(title, symbol, level));
      }

      if (task.output && (task.isStarted() || task.hasFailed())) {
        task.output
          .trim()
          .split('\n')
          .forEach(line => {
            const outputSymbol = ChalkUtils.getChalkInstance(this.options.useColors).cyan('›');
            output.push(this.formatListrMessage(line, outputSymbol, level + 1));
          });
      }

      if (task.hasSubtasks() && (task.isStarted() || task.isCompleted() || task.hasFailed())) {
        if (!task.isSkipped()) {
          output.push(...this.renderTasks(task.subtasks, level + 1, done));
        }
      }
    }

    return output;
  }

  private formatListrMessage(message: string, symbol: string, level = 0): string {
    // Handle indentation for nested tasks - add spaces before the symbol only
    const indentedSymbol = level > 0 ? `${'  '.repeat(level)}${symbol}` : symbol;

    // Use centralized formatting - MessageFormatter handles proper component ordering
    // Format: [Timestamp] [Level] [Prefix] [IndentedSymbol] [Message]
    return MessageFormatter.formatWithPrefix(
      message,
      indentedSymbol,
      this.options.level,
      this.options.prefix
    );
  }
}
