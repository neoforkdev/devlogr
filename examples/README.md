# DevLogr Examples

This folder contains examples showing how to use DevLogr features.

## Running Examples

```bash
npm run example:levels          # Different log levels
npm run example:single-spinner  # Basic spinner usage
npm run example:multiple-spinners # Task management
npm run example:env-variables   # Environment control
npm run example:json-output     # Structured logging
```

## What Each Example Shows

### `levels.ts` - Log Levels
- Basic logging: `info()`, `error()`, `success()`, etc.
- Object logging with nested data
- Setting minimum log level

### `single-spinner.ts` - Spinners
- Start and stop spinners for long tasks
- Update spinner text while running
- Complete with success/error

### `multiple-spinners.ts` - Task Management
- Run multiple tasks sequentially or concurrently
- Built-in task progress tracking
- Handle task failures gracefully

### `env-variables.ts` - Environment Control
Control logging behavior with environment variables:

```bash
# Show debug messages with timestamps
LOG_LEVEL=debug LOG_TIMESTAMP=true npm run example:env-variables

# JSON output mode
LOG_JSON=true npm run example:env-variables

# No colors
LOG_COLORS=false npm run example:env-variables
```

### `json-output.ts` - Structured Logging
- JSON format for log analysis
- Object merging and arrays
- Error serialization

## Quick Usage

```typescript
import { Logger } from '@neofork/devlogr';

const log = new Logger('my-app');

// Basic logging
log.info('Starting process');
log.success('Task completed');

// Spinners
log.startSpinner('Working...');
log.completeSpinnerWithSuccess('Done!');

// Tasks
const tasks = [{
  title: 'Build',
  task: async () => {
    // your work here
  }
}];
await log.runSequentialTasks('Build Process', tasks);
```
