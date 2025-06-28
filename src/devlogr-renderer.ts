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
        // In CI, start with initial output
        this.update();
        this.spinner.start(() => this.update());
      } else {
        this.spinner.start(() => this.update());
      }
    }

    this.events?.on(ListrEventType.SHOULD_REFRESH_RENDER, () => this.update());
  }

  public update(): void {
    const output = this.createOutput();

    if (this.isCI) {
      // In CI environments, throttle updates and only show significant changes
      const now = Date.now();
      const outputLines = output.split('\n').filter(line => line.trim());

      // Check if there are significant changes (completion, new tasks, or throttle time passed)
      const hasCompletionChanges = outputLines.some(
        line => line.includes('✔') || line.includes('✖')
      );
      const hasNewTasks = outputLines.length !== this.lastOutput.length;
      const shouldThrottleUpdate = now - this.lastUpdateTime > this.updateThrottleMs;

      if (hasCompletionChanges || hasNewTasks || shouldThrottleUpdate) {
        // Only output new or changed lines to reduce spam
        for (let i = 0; i < outputLines.length; i++) {
          if (!this.lastOutput[i] || this.lastOutput[i] !== outputLines[i]) {
            // Skip repeated spinner animations unless it's a completion or new task
            const line = outputLines[i];
            const isSpinnerLine = /[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]/.test(line);
            const isCompletionLine = line.includes('✔') || line.includes('✖');
            const isNewTask = !this.lastOutput[i];

            if (!isSpinnerLine || isCompletionLine || isNewTask || shouldThrottleUpdate) {
              console.log(line);
            }
          }
        }
        this.lastOutput = outputLines;
        this.lastUpdateTime = now;
      }
    } else {
      // In local environments, use log-update for smooth animations
      if (this.updater) {
        this.updater(output);
      }
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

      const triggerUpdate = () => this.update();
      task.on(ListrTaskEventType.STATE, triggerUpdate);
      task.on(ListrTaskEventType.TITLE, triggerUpdate);
      task.on(ListrTaskEventType.OUTPUT, triggerUpdate);
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
    // Use centralized formatting - MessageFormatter handles proper component ordering
    // Format: [Timestamp] [Level] [Prefix] [Symbol] [Message]
    const formattedMessage = MessageFormatter.formatWithPrefix(
      message,
      symbol,
      this.options.level,
      this.options.prefix
    );

    // Handle indentation for nested tasks by prepending spaces
    if (level > 0) {
      const indentation = '  '.repeat(level);
      return `${indentation}${formattedMessage}`;
    }

    return formattedMessage;
  }
}
