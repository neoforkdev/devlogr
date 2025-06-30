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
import { LogConfiguration } from './config';
import { StringUtils, EmojiUtils } from './utils';

export interface DevLogrRendererOptions {
  useColors?: boolean;
  showTimestamp?: boolean;
  timestampFormat?: TimestampFormat;
  supportsUnicode?: boolean;
  prefix?: string;
  lazy?: boolean;
  level?: string;
  useJson?: boolean;
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
  private useJson: boolean;
  private lastOutput: string[] = [];
  private isStopped = false;

  constructor(
    private readonly tasks: ListrTaskObject<any, typeof DevLogrRenderer>[],
    options: DevLogrRendererOptions = {},
    private readonly events?: ListrEventManager
  ) {
    const config = LogConfiguration.getConfig();
    this.useJson = options.useJson ?? config.useJson;
    this.isCI = TerminalUtils.isCI();

    this.options = {
      useColors: options.useColors ?? config.useColors,
      showTimestamp: options.showTimestamp ?? config.showTimestamp,
      timestampFormat: options.timestampFormat ?? config.timestampFormat,
      supportsUnicode: options.supportsUnicode ?? config.supportsUnicode,
      prefix: options.prefix ?? 'listr2',
      lazy: options.lazy ?? false,
      level: options.level ?? 'task',
      useJson: this.useJson,
    };
  }

  public async render(): Promise<void> {
    if (this.useJson) {
      this.setupTaskListeners(this.tasks);
      return;
    }

    this.spinner = new Spinner();

    if (!this.isCI) {
      this.updater = createLogUpdate(process.stdout);
    }

    this.setupTaskListeners(this.tasks);

    if (!this.options.lazy) {
      if (this.isCI) {
        this.update();
      } else {
        this.spinner.start(() => this.update());
      }
    }

    this.events?.on(ListrEventType.SHOULD_REFRESH_RENDER, () => this.update());
  }

  public update(): void {
    if (this.useJson || this.isCI || this.isStopped) {
      return;
    }

    const allTasksComplete = this.tasks.every(
      task => task.isCompleted() || task.hasFailed() || task.isSkipped()
    );

    if (allTasksComplete && this.spinner) {
      this.isStopped = true;
      this.spinner.stop();
      // Don't clear updater here - let end() handle final output and cleanup
      return;
    }

    // In local environments, use log-update for smooth animations
    const output = this.createOutput();
    if (this.updater) {
      this.updater(output);
    }
  }

  public end(): void {
    if (this.useJson) {
      return;
    }

    if (this.spinner) {
      this.spinner.stop();
    }

    if (this.isCI) {
      // In CI, tasks are output immediately on completion
    } else {
      if (this.updater) {
        this.updater(this.createOutput({ done: true }));
        this.updater.done();
      }
    }
  }

  private setupTaskListeners(tasks: ListrTaskObject<any, typeof DevLogrRenderer>[]): void {
    for (const task of tasks) {
      // Set up subtask listeners recursively
      task.on(ListrTaskEventType.SUBTASK, subtasks => this.setupTaskListeners(subtasks));

      // Set up event listeners based on environment
      this.setupTaskEventListeners(task);
    }
  }

  private setupTaskEventListeners(task: ListrTaskObject<any, typeof DevLogrRenderer>): void {
    if (this.useJson) {
      task.on(ListrTaskEventType.STATE, () => {
        const taskKey = task.id ?? task.title;
        if (task.isStarted() && !this.activeTasks.has(taskKey)) {
          this.activeTasks.set(taskKey, { task, startTime: Date.now() });
          this.outputTaskAsJson(task);
        } else if (task.isCompleted() || task.hasFailed() || task.isSkipped()) {
          this.outputTaskAsJson(task);
        }
      });
    } else if (this.isCI) {
      task.on(ListrTaskEventType.STATE, () => {
        if (task.isCompleted() || task.hasFailed()) {
          this.outputTaskCompletion(task);
        }
      });
    } else {
      const triggerUpdate = () => this.update();
      task.on(ListrTaskEventType.STATE, triggerUpdate);
      task.on(ListrTaskEventType.TITLE, triggerUpdate);
      task.on(ListrTaskEventType.OUTPUT, triggerUpdate);
    }
  }

  private outputTaskCompletion(task: ListrTaskObject<any, typeof DevLogrRenderer>): void {
    // In CI, output the completed task immediately to avoid duplicates
    const taskOutput = this.renderSingleTask(task, 0, true);
    if (taskOutput.trim()) {
      console.log(taskOutput);
    }
  }

  private renderSingleTask(
    task: ListrTaskObject<any, typeof DevLogrRenderer>,
    level: number,
    done = false
  ): string {
    if (!task.isEnabled()) {
      return '';
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

    return title ? this.formatListrMessage(title, symbol, level) : '';
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

    // Strip emojis from message if user preference is disabled
    const processedMessage = EmojiUtils.shouldShowEmojis() ? message : EmojiUtils.format(message);

    // Use centralized formatting - MessageFormatter handles proper component ordering
    // Format: [Timestamp] [Level] [Prefix] [IndentedSymbol] [Message]
    return MessageFormatter.formatWithPrefix(
      processedMessage,
      indentedSymbol,
      this.options.level,
      this.options.prefix
    );
  }

  private outputTaskAsJson(task: ListrTaskObject<any, typeof DevLogrRenderer>, level = 0): void {
    const taskData = this.createTaskJson(task, level);
    const output = StringUtils.safeJsonStringify(taskData, 0);
    console.log(output);
  }

  private createTaskJson(
    task: ListrTaskObject<any, typeof DevLogrRenderer>,
    level = 0
  ): Record<string, unknown> {
    const status = this.getTaskStatus(task);
    const now = new Date().toISOString();

    // Strip emojis from task data if user preference is disabled
    const processedTitle = EmojiUtils.shouldShowEmojis()
      ? task.title
      : EmojiUtils.format(task.title);
    const processedOutput = task.output
      ? EmojiUtils.shouldShowEmojis()
        ? task.output
        : EmojiUtils.format(task.output)
      : undefined;

    return {
      level: status === 'failed' ? 'error' : 'info',
      message: `Task ${status}`,
      task: {
        title: processedTitle,
        status,
        level,
        ...(processedOutput && { output: processedOutput }),
        ...(status === 'completed' && { duration: this.getTaskDuration(task) }),
      },
      prefix: this.options.prefix,
      timestamp: now,
    };
  }

  private getTaskStatus(task: ListrTaskObject<any, typeof DevLogrRenderer>): string {
    if (task.isCompleted()) return 'completed';
    if (task.hasFailed()) return 'failed';
    if (task.isSkipped()) return 'skipped';
    if (task.isStarted()) return 'started';
    return 'pending';
  }

  private getTaskDuration(task: ListrTaskObject<any, typeof DevLogrRenderer>): number | undefined {
    const taskKey = task.id ?? task.title;
    const taskInfo = this.activeTasks.get(taskKey);
    if (taskInfo && task.isCompleted()) {
      return Date.now() - taskInfo.startTime;
    }
    return undefined;
  }
}
