import {
  ListrRenderer,
  ListrTaskObject,
  ListrEventType,
  ListrTaskEventType,
  ListrTaskState,
  ListrEventManager,
  Spinner,
} from 'listr2';
import chalk from 'chalk';
import { createLogUpdate } from 'log-update';
import { MessageFormatter } from './formatters';
import { ThemeProvider } from './themes';
import { PrefixTracker } from './tracker';
import { TimestampFormat } from './types';

export interface DevLogrRendererOptions {
  useColors?: boolean;
  showTimestamp?: boolean;
  timestampFormat?: TimestampFormat;
  supportsUnicode?: boolean;
  prefix?: string;
  lazy?: boolean;
}

export class DevLogrRenderer implements ListrRenderer {
  public static nonTTY = false; // Enable TTY mode for animations
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
    };
  }

  public async render(): Promise<void> {
    this.spinner = new Spinner();
    this.updater = createLogUpdate(process.stdout);

    this.setupTaskListeners(this.tasks);

    if (!this.options.lazy) {
      this.spinner.start(() => this.update());
    }

    this.events?.on(ListrEventType.SHOULD_REFRESH_RENDER, () => this.update());
  }

  public update(): void {
    if (this.updater) {
      this.updater(this.createOutput());
    }
  }

  public end(): void {
    if (this.spinner) {
      this.spinner.stop();
    }

    if (this.updater) {
      this.updater(this.createOutput({ done: true }));
      this.updater.done();
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
        symbol = this.options.useColors ? chalk.blue(spinnerSymbol) : spinnerSymbol;
      } else if (task.isCompleted()) {
        // Success - green color
        symbol = this.options.useColors ? chalk.green('✔') : '✔';
      } else if (task.hasFailed()) {
        // Error - red color
        symbol = this.options.useColors ? chalk.red('✖') : '✖';
      } else if (task.isSkipped() && task.message.skip) {
        // Skipped - yellow/orange color
        symbol = this.options.useColors ? chalk.yellow('◯') : '◯';
        title = typeof task.message.skip === 'string' ? `${title} -> ${task.message.skip}` : title;
      } else if (task.isStarted() && done) {
        // Task was interrupted - gray color
        symbol = this.options.useColors ? chalk.gray('❯') : '❯';
      } else {
        symbol = ' ';
      }

      if (title) {
        output.push(this.formatTaskMessage(title, symbol, level));
      }

      if (task.output && (task.isStarted() || task.hasFailed())) {
        task.output
          .trim()
          .split('\n')
          .forEach(line => {
            const outputSymbol = this.options.useColors ? chalk.cyan('›') : '›';
            output.push(this.formatTaskMessage(line, outputSymbol, level + 1));
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

  private formatTaskMessage(message: string, symbol: string, level = 0): string {
    const theme = ThemeProvider.getTheme('task', undefined, this.options.supportsUnicode);
    const maxPrefixLength = PrefixTracker.getMaxLength();

    const formattedMessage = MessageFormatter.format({
      level: 'task',
      theme,
      prefix: this.options.prefix,
      maxPrefixLength,
      message: '',
      args: [],
      showTimestamp: this.options.showTimestamp,
      useColors: this.options.useColors,
      timestampFormat: this.options.timestampFormat,
      stripEmojis: !this.options.supportsUnicode,
      includeLevel: true,
      includePrefix: true,
    });

    const prefix = formattedMessage.replace(/\s+$/, '');
    const indentation = '  '.repeat(level);
    return `${prefix} ${indentation}${symbol} ${message}`;
  }
}
