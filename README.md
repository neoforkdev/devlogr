# devlogr

> Logs that look great in your terminal—and make sense in your CI.

<p align="center">
  <img src="https://raw.githubusercontent.com/neoforkdev/devlogr/refs/heads/main/.github/demo.gif" alt="devlogr demo animation" width="100%" style="max-width: 800px; border: 2px solid #e1e4e8; border-radius: 8px; padding: 20px; margin: 20px auto;">
</p>

<div align="center"><strong>⚡ The UX-first logger for modern CLI & deployment tools ⚡</strong><br/>CLI-native, CI-compliant, beautifully minimal. No setup. All signal.</div>

---

## 🎯 Built for real CLI tools

Most loggers are backend-first or just sad `console.log()` clones. `devlogr` isn’t.

This is structured logging with style—built for dev tools, task runners, release scripts, and CLI utilities that actually run in terminals—either locally or in CI pipelines.

No brittle hacks. No bland output. Just focused feedback, clean visuals, useful context, and a pinch of personality.

---

## 🚀 Quickstart

```bash
npm install @neofork/devlogr
```

```ts
import { createLogger } from '@neofork/devlogr';

const log = createLogger('my-cli');

log.title('🔧 Setup');
log.info('Starting process');
log.success('Complete!');

log.startSpinner('Working...');
log.updateSpinnerText('Still going...');
log.completeSpinnerWithSuccess('All done!');
```

---

## ✨ Features That Make DevOps Swoon

- 🎨 **Looks Amazing** – Styled output with color, emoji, and Unicode where supported
- 🧠 **Made for Humans** – Clear, scannable messages designed for quick readability
- 🌀 **Animated Spinners** – Interactive, with fallback for CI environments
- ⚙️ **Zero Config** – Sensible defaults; fully customizable if desired
- 🧱 **CLI-Native Design** – Terminal-aware and CI-friendly
- 📄 **JSON Mode** – Structured output when machines are watching
- 🔐 **Safe Logging** – Handles circular references and edge cases
- 🧪 **Fully Tested** – Over 200 real-world scenario tests
- 🙅 **No Visual Junk** – Automatically disables icons, emojis, and colors on unsupported terminals

---

## 🧩 Logging Methods

```ts
log.error('Something broke');
log.warning('This might be an issue');
log.info('FYI');
log.debug('Debugging info');
log.success('It worked!');
log.task('Running something...');
log.title('🚀 Deployment Phase');
log.plain('No formatting here.');
```

---

## 🌀 Advanced Spinner System

DevLogr provides a powerful spinner system that works seamlessly with both single tasks and complex multi-step operations.

### Basic Spinner Control

```ts
log.startSpinner('Loading...');
log.updateSpinnerText('Still loading...');
log.succeedSpinner('Loaded');
log.failSpinner('Failed');
log.completeSpinnerWithSuccess('Mission accomplished');
```

### Complex Task Management with Listr2

DevLogr integrates beautifully with Listr2 for sophisticated task orchestration:

```ts
import { Logger } from '@neofork/devlogr';
import { ListrTask } from 'listr2';

const logger = new Logger('Deploy');

// Sequential tasks with progress updates
const buildTasks: ListrTask[] = [
  {
    title: 'Installing dependencies',
    task: async (ctx, task) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      task.output = 'Downloading packages...';
      await new Promise(resolve => setTimeout(resolve, 1000));
      task.output = 'Resolving dependencies...';
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
  },
  {
    title: 'Building project',
    task: async (ctx, task) => {
      task.output = 'Compiling TypeScript...';
      await new Promise(resolve => setTimeout(resolve, 800));
      task.output = 'Bundling assets...';
      await new Promise(resolve => setTimeout(resolve, 800));
    },
  },
];

await logger.runTasks('Build Process', buildTasks);
```

### Concurrent Task Execution

Run multiple tasks simultaneously with visual feedback:

```ts
// Concurrent quality checks
const qualityTasks: ListrTask[] = [
  {
    title: 'Linting code',
    task: async (ctx, task) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      task.output = 'ESLint completed with 0 errors';
    },
  },
  {
    title: 'Type checking',
    task: async (ctx, task) => {
      await new Promise(resolve => setTimeout(resolve, 1800));
      task.output = 'TypeScript compilation successful';
    },
  },
  {
    title: 'Running unit tests',
    task: async (ctx, task) => {
      await new Promise(resolve => setTimeout(resolve, 2200));
      task.output = 'All 42 tests passed';
    },
  },
];

await logger.runTasks('Quality Checks', qualityTasks, { concurrent: true });
```

### Nested Task Hierarchies

Create complex nested task structures for sophisticated workflows:

```ts
const deploymentTasks: ListrTask[] = [
  {
    title: 'Database operations',
    task: () =>
      logger.createTaskList([
        {
          title: 'Creating tables',
          task: async () => await new Promise(resolve => setTimeout(resolve, 1000)),
        },
        {
          title: 'Seeding data',
          task: async (ctx, task) => {
            task.output = 'Inserting user records...';
            await new Promise(resolve => setTimeout(resolve, 800));
            task.output = 'Inserting product records...';
            await new Promise(resolve => setTimeout(resolve, 800));
          },
        },
        {
          title: 'Creating indexes',
          task: async () => await new Promise(resolve => setTimeout(resolve, 600)),
        },
      ]),
  },
  {
    title: 'Cache operations',
    task: () =>
      logger.createTaskList([
        {
          title: 'Warming Redis cache',
          task: async () => await new Promise(resolve => setTimeout(resolve, 1200)),
        },
        {
          title: 'Precomputing queries',
          task: async () => await new Promise(resolve => setTimeout(resolve, 900)),
        },
      ]),
  },
];

await logger.runTasks('System Initialization', deploymentTasks);
```

### Handling Different Task Outcomes

DevLogr gracefully handles success, failure, and skip scenarios:

```ts
const mixedTasks: ListrTask[] = [
  {
    title: 'Task that succeeds',
    task: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
  },
  {
    title: 'Task that gets skipped',
    task: (ctx, task) => task.skip('Feature disabled in development mode'),
  },
  {
    title: 'Task that fails',
    task: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      throw new Error('Simulated failure for demo purposes');
    },
  },
];

try {
  await logger.runTasks('Mixed Outcome Demo', mixedTasks);
} catch (error) {
  logger.error('Some tasks failed, but we can continue');
}
```

### CI/Non-TTY Fallback

Spinners automatically fall back to simple log messages in CI environments or when TTY is not available, ensuring your output remains clean and readable everywhere.

---

## 📚 Examples Directory

Want to see DevLogr in action? Check out:

- All logging methods
- Task sequencing & spinner chaining
- JSON mode
- Env var configurations
- Integration with `listr2`

Run with:

```bash
npm run example:<name>
```

See [examples/README.md](./examples/README.md) for full list.

---

## 📖 API Documentation

Auto-generated docs available at: **https://neoforkdev.github.io/devlogr/**

- **Latest** → `/latest/`
- **Versioned** → tags like `/v0.0.1/`

Generate locally:

```bash
npm run docs        # generate docs
npm run docs:serve  # serve locally
```

---

## ⚙️ Environment Variables

Configure behavior via env vars:

| Variable                             | Description                       | Example       |
| ------------------------------------ | --------------------------------- | ------------- |
| `DEVLOGR_LOG_LEVEL`                  | Minimum log level (`debug`, etc.) | `debug`       |
| `DEVLOGR_OUTPUT_JSON`                | Structured JSON logs              | `true`        |
| `DEVLOGR_SHOW_TIMESTAMP`             | Enables timestamps                | `true`/`iso`  |
| `DEVLOGR_SHOW_PREFIX`                | Show level prefixes & logger name | `true`        |
| `DEVLOGR_NO_COLOR`                   | Disable colors                    | `true`        |
| `DEVLOGR_FORCE_COLOR`                | Force colors                      | `true`        |
| `DEVLOGR_NO_EMOJI`                   | Disable emojis                    | `true`        |
| `DEVLOGR_NO_UNICODE`                 | ASCII-only mode                   | `true`        |
| `DEVLOGR_UNICODE`                    | Force Unicode support             | `true`/`auto` |
| `DEVLOGR_NO_ICONS`                   | Hide all icons                    | `true`        |
| `NO_COLOR`, `NO_EMOJI`, `NO_UNICODE` | Global disable standards          | `1`           |

---

## 🛠 Development Scripts

```bash
npm run format         # Check formatting
npm run format:fix     # Apply formatting fixes
npm run lint           # Lint code
npm run lint:fix       # Auto-lint fixes
npm run check          # Run all validations
npm run fix            # Runs both format:fix & lint:fix
```

---

## 🧠 Smart Defaults & Adaptive Behavior

- Auto-detects terminal capabilities (color, Unicode, TTY)
- CI-aware – adapts output for non-interactive shells
- JSON mode suppresses visual frills
- Optional timestamps and prefixes

---

## 📜 License

MIT — Do whatever, just don’t sue. 😉

---

## 🤝 Contribute

Pull requests welcome! Tests required, style friendly, opinions optional.
