# DevLogr Examples

This directory contains focused examples demonstrating different features of DevLogr. Each example showcases a specific aspect of the library.

## Available Examples

### 1. Logging Levels (`levels.ts`)
Demonstrates all available logging methods and level control.

```bash
npm run example:levels
```

**Features shown:**
- All log levels: `trace`, `debug`, `info`, `warn`, `error`, `success`
- Special formatting: `title`, `task`, `plain`
- Object logging with complex nested structures
- Message formatting with placeholders (`%s`, `%d`, `%j`)
- Runtime level changes with `Logger.setLevel()`

### 2. Single Spinner (`single-spinner.ts`)
Shows how to use individual spinners for long-running operations.

```bash
npm run example:single-spinner
```

**Features shown:**
- Basic spinner usage: `startSpinner()`, `completeSpinnerWithSuccess()`
- Text updates during spinner execution: `updateSpinnerText()`
- Different completion states: success, warning, error, info
- Manual spinner control: `stopSpinner()`

### 3. Multiple Spinners (`multiple-spinners.ts`)
Demonstrates task management with listr2 integration.

```bash
npm run example:multiple-spinners
```

**Features shown:**
- Sequential task execution: `runSequentialTasks()`
- Concurrent task execution: `runConcurrentTasks()`
- Nested tasks with subtasks: `createTaskList()`
- Task output during execution
- Different task outcomes: success, skip, failure

### 4. Environment Variables (`env-variables.ts`)
Shows how environment variables control DevLogr behavior.

```bash
npm run example:env-variables
```

**Environment variables demonstrated:**
- `LOG_LEVEL`: Set minimum log level (trace, debug, info, warn, error)
- `LOG_JSON`: Enable structured JSON output
- `LOG_COLORS`: Control colored output
- `LOG_TIMESTAMP`: Show/hide timestamps
- `LOG_UNICODE`: Enable/disable Unicode symbols
- `LOG_TIMESTAMP_FORMAT`: Choose timestamp format (time, iso)

**Try different configurations:**
```bash
# Debug level with timestamps
LOG_LEVEL=debug LOG_TIMESTAMP=true npm run example:env-variables

# JSON output mode
LOG_JSON=true npm run example:env-variables

# No colors, error level only
LOG_COLORS=false LOG_LEVEL=error npm run example:env-variables

# ISO timestamps with Unicode disabled
LOG_TIMESTAMP=true LOG_TIMESTAMP_FORMAT=iso LOG_UNICODE=false npm run example:env-variables
```

### 5. JSON Output (`json-output.ts`)
Focuses specifically on structured JSON logging.

```bash
# Standard run (shows how JSON mode should look)
npm run example:json-output

# Force JSON mode via environment variable
LOG_JSON=true npm run example:json-output
```

**Features shown:**
- Structured JSON output format
- Object merging in JSON logs
- Multiple argument handling
- Error object serialization
- Complex nested data structures
- Array logging

## Common Usage Patterns

### Basic Logger Setup
```typescript
import { Logger } from '@neofork/devlogr';

const logger = new Logger('MyApp');
logger.info('Application started');
```

### Environment-Based Configuration
```typescript
// The logger automatically reads these environment variables:
// LOG_LEVEL, LOG_JSON, LOG_COLORS, LOG_TIMESTAMP, LOG_UNICODE, LOG_TIMESTAMP_FORMAT

const logger = new Logger('MyApp');
// Behavior is controlled by environment variables
```

### Task Management
```typescript
import { ListrTask } from 'listr2';

const tasks: ListrTask[] = [
  {
    title: 'My Task',
    task: async (ctx, task) => {
      task.output = 'Processing...';
      await doWork();
    }
  }
];

await logger.runSequentialTasks('Build Process', tasks);
```

### Spinner Usage
```typescript
logger.startSpinner('Processing...');
// ... do work ...
logger.updateSpinnerText('Almost done...');
// ... finish work ...
logger.completeSpinnerWithSuccess('Done!');
```

## Running All Examples

You can run all examples in sequence to see the full feature set:

```bash
npm run example:levels
npm run example:single-spinner  
npm run example:multiple-spinners
npm run example:env-variables
LOG_JSON=true npm run example:json-output
```

## Customizing Examples

Feel free to modify these examples to test different scenarios or integrate them into your own applications. Each example is self-contained and demonstrates best practices for using DevLogr. 