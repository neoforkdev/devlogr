'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.DevLogrRenderer = void 0;
const listr2_1 = require('listr2');
const chalk_1 = __importDefault(require('chalk'));
const log_update_1 = require('log-update');
const formatters_1 = require('./formatters');
const themes_1 = require('./themes');
const tracker_1 = require('./tracker');
const types_1 = require('./types');
const config_1 = require('./config');
class DevLogrRenderer {
  constructor(tasks, options = {}, events) {
    this.tasks = tasks;
    this.events = events;
    this.activeTasks = new Map();
    this.options = {
      useColors: options.useColors ?? true,
      showTimestamp: options.showTimestamp ?? false,
      timestampFormat: options.timestampFormat ?? types_1.TimestampFormat.TIME,
      supportsUnicode: options.supportsUnicode ?? true,
      prefix: options.prefix ?? 'listr2',
      lazy: options.lazy ?? false,
      taskLevel: options.taskLevel ?? 'plain',
    };
  }
  async render() {
    this.spinner = new listr2_1.Spinner();
    this.updater = (0, log_update_1.createLogUpdate)(process.stdout);
    this.setupTaskListeners(this.tasks);
    if (!this.options.lazy) {
      this.spinner.start(() => this.update());
    }
    this.events?.on(listr2_1.ListrEventType.SHOULD_REFRESH_RENDER, () => this.update());
  }
  update() {
    if (this.updater) {
      this.updater(this.createOutput());
    }
  }
  end() {
    if (this.spinner) {
      this.spinner.stop();
    }
    if (this.updater) {
      this.updater(this.createOutput({ done: true }));
      this.updater.done();
    }
  }
  setupTaskListeners(tasks) {
    for (const task of tasks) {
      task.on(listr2_1.ListrTaskEventType.SUBTASK, subtasks => this.setupTaskListeners(subtasks));
      const triggerUpdate = () => this.update();
      task.on(listr2_1.ListrTaskEventType.STATE, triggerUpdate);
      task.on(listr2_1.ListrTaskEventType.TITLE, triggerUpdate);
      task.on(listr2_1.ListrTaskEventType.OUTPUT, triggerUpdate);
    }
  }
  createOutput(options = {}) {
    return this.renderTasks(this.tasks, 0, options.done).join('\n');
  }
  renderTasks(tasks, level, done = false) {
    const output = [];
    for (const task of tasks) {
      if (!task.isEnabled()) {
        continue;
      }
      let symbol;
      let title = task.title;
      if (task.isStarted() && !task.isCompleted() && !task.hasFailed() && !done) {
        // Loading animation - blue color
        const spinnerSymbol = this.spinner ? this.spinner.fetch() : '⠋';
        symbol = this.options.useColors ? chalk_1.default.blue(spinnerSymbol) : spinnerSymbol;
      } else if (task.isCompleted()) {
        // Success - green color
        symbol = this.options.useColors ? chalk_1.default.green('✔') : '✔';
      } else if (task.hasFailed()) {
        // Error - red color
        symbol = this.options.useColors ? chalk_1.default.red('✖') : '✖';
      } else if (task.isSkipped() && task.message.skip) {
        // Skipped - yellow/orange color
        symbol = this.options.useColors ? chalk_1.default.yellow('◯') : '◯';
        title = typeof task.message.skip === 'string' ? `${title} -> ${task.message.skip}` : title;
      } else if (task.isStarted() && done) {
        // Task was interrupted - gray color
        symbol = this.options.useColors ? chalk_1.default.gray('❯') : '❯';
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
            const outputSymbol = this.options.useColors ? chalk_1.default.cyan('›') : '›';
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
  formatTaskMessage(message, symbol, level = 0) {
    const config = config_1.LogConfiguration.getConfig();
    const theme = themes_1.ThemeProvider.getTheme(
      this.options.taskLevel,
      undefined,
      this.options.supportsUnicode
    );
    const maxPrefixLength = tracker_1.PrefixTracker.getMaxLength();
    // Special handling for plain level when prefix is disabled
    if (this.options.taskLevel === 'plain' && !config.showPrefix) {
      const indentation = '  '.repeat(level);
      return `${indentation}${symbol} ${message}`;
    }
    const formattedMessage = formatters_1.MessageFormatter.format({
      level: this.options.taskLevel,
      theme,
      prefix: this.options.prefix,
      maxPrefixLength,
      message: '',
      args: [],
      showTimestamp: this.options.showTimestamp,
      useColors: this.options.useColors,
      timestampFormat: this.options.timestampFormat,
      stripEmojis: !this.options.supportsUnicode,
      includeLevel: config.showPrefix,
      includePrefix: config.showPrefix,
    });
    let prefix = formattedMessage.replace(/\s+$/, '');
    // Add 2 spaces for proper alignment when prefix is enabled but timestamp is disabled
    if (config.showPrefix && !this.options.showTimestamp) {
      prefix = '  ' + prefix; // 2 spaces for alignment
    }
    const indentation = '  '.repeat(level);
    return `${prefix} ${indentation}${symbol} ${message}`;
  }
}
exports.DevLogrRenderer = DevLogrRenderer;
DevLogrRenderer.nonTTY = false; // Enable TTY mode for animations
DevLogrRenderer.rendererOptions = {
  lazy: false,
};
