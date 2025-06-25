# DevLogr

A UX-first logger for modern CLI tools with personality and power.

## Features

- 🎨 **Clean, scannable output** with colors and emojis
- ⚡ **Animated spinners** with fallback support
- 📊 **JSON output mode** for machine parsing
- 🖥️ **Terminal-aware** and CI-friendly
- ⚙️ **Zero configuration** required
- 🚀 **Multi-spinner support** for concurrent operations

## Quick Start

```typescript
import { createLogger } from '@neofork/devlogr';

const log = createLogger('my-tool');

log.info('Starting process...');
log.success('Process completed!');

// Spinner usage
log.startSpinner('Working...');
setTimeout(() => log.succeedSpinner('Done!'), 1000);
```

## Environment Variables

DevLogr can be configured using environment variables to customize its behavior for different environments and use cases.

### Quick Reference

```bash
# Most commonly used variables
DEVLOGR_LOG_LEVEL=debug          # Show debug messages
DEVLOGR_OUTPUT_JSON=true         # JSON output for CI/CD
DEVLOGR_SHOW_PREFIX=true         # Show log levels and prefixes
DEVLOGR_SHOW_TIMESTAMP=true      # Add timestamps
DEVLOGR_NO_ICONS=true            # Hide icons for accessibility
NO_COLOR=1                       # Disable colors (global standard)
```

### Core Configuration

| Variable              | Values                                    | Default | Description                                    |
| --------------------- | ----------------------------------------- | ------- | ---------------------------------------------- |
| `DEVLOGR_LOG_LEVEL`   | `error`, `warn`, `info`, `debug`, `trace` | `info`  | Sets the minimum log level to display          |
| `DEVLOGR_OUTPUT_JSON` | `true`, `false`                           | `false` | Enables JSON output format for machine parsing |

### Display Options

| Variable                 | Values                      | Default | Description                                                  |
| ------------------------ | --------------------------- | ------- | ------------------------------------------------------------ |
| `DEVLOGR_SHOW_PREFIX`    | `true`, `1`, `false`        | `false` | Shows/hides log level prefixes and logger names              |
| `DEVLOGR_SHOW_TIMESTAMP` | `true`, `1`, `iso`, `false` | `false` | Shows timestamps (`true`/`1` = HH:MM:SS, `iso` = ISO format) |

### Color Control

| Variable              | Values          | Default | Description                               |
| --------------------- | --------------- | ------- | ----------------------------------------- |
| `NO_COLOR`            | Any value       | -       | Disables all colors (standard convention) |
| `DEVLOGR_NO_COLOR`    | `true`, `false` | `false` | DevLogr-specific color disable            |
| `FORCE_COLOR`         | Any value       | -       | Forces color output (standard convention) |
| `DEVLOGR_FORCE_COLOR` | Any value       | -       | DevLogr-specific color forcing            |

### Unicode and Emoji Control

| Variable             | Values               | Default | Description                                |
| -------------------- | -------------------- | ------- | ------------------------------------------ |
| `NO_EMOJI`           | Any value            | -       | Disables emoji output (global standard)    |
| `DEVLOGR_NO_EMOJI`   | Any value            | -       | DevLogr-specific emoji disable             |
| `NO_UNICODE`         | Any value            | -       | Disables Unicode symbols (global standard) |
| `DEVLOGR_NO_UNICODE` | `true`, `false`      | `false` | DevLogr-specific Unicode disable           |
| `DEVLOGR_UNICODE`    | `true`, `false`      | `auto`  | Forces Unicode support                     |
| `DEVLOGR_NO_ICONS`   | `true`, `1`, `false` | `false` | Hides all icons/symbols in log output      |

## Configuration Examples

### Minimal Clean Output

```bash
# Hide all prefixes and timestamps for clean output
export DEVLOGR_SHOW_PREFIX=false
export DEVLOGR_SHOW_TIMESTAMP=false
```

### Full Structured Logging

```bash
# Show all information with timestamps
export DEVLOGR_SHOW_PREFIX=true
export DEVLOGR_SHOW_TIMESTAMP=iso
export DEVLOGR_LOG_LEVEL=debug
```

### CI/CD Environment

```bash
# JSON output for log processing
export DEVLOGR_OUTPUT_JSON=true
export DEVLOGR_LOG_LEVEL=info
export NO_COLOR=1
```

### Development Environment

```bash
# Full debug output with colors and emojis
export DEVLOGR_LOG_LEVEL=debug
export DEVLOGR_SHOW_PREFIX=true
export DEVLOGR_SHOW_TIMESTAMP=true
export DEVLOGR_FORCE_COLOR=1
```

### Accessibility Mode

```bash
# Disable colors, emojis, and icons for better accessibility
export NO_COLOR=1
export DEVLOGR_NO_EMOJI=1
export DEVLOGR_NO_UNICODE=1
export DEVLOGR_NO_ICONS=1
```

## Live Demo

See all environment variables in action with our interactive demo:

```bash
# Run the interactive demo
npm run example:env-variables

# Or test specific configurations
DEVLOGR_NO_ICONS=true npm run example:env-variables
DEVLOGR_OUTPUT_JSON=true npm run example:env-variables
DEVLOGR_LOG_LEVEL=error npm run example:env-variables
NO_COLOR=1 npm run example:env-variables
```

The demo shows real-time effects of each environment variable, making it easy to understand how they change the output.

### Output Examples

**Default output:**

```
i Starting process...
✓ Process completed!
```

**With `DEVLOGR_NO_ICONS=true`:**

```
Starting process...
Process completed!
```

**With `DEVLOGR_SHOW_PREFIX=true`:**

```
i INFO     [my-tool] Starting process...
✓ SUCCESS  [my-tool] Process completed!
```

**With `DEVLOGR_SHOW_TIMESTAMP=true DEVLOGR_SHOW_PREFIX=true`:**

```
[14:32:15] i INFO     [my-tool] Starting process...
[14:32:16] ✓ SUCCESS  [my-tool] Process completed!
```

**With `DEVLOGR_OUTPUT_JSON=true`:**

```json
{"level":"info","message":"Starting process...","prefix":"my-tool","timestamp":"2025-01-01T14:32:15.123Z"}
{"level":"info","message":"Process completed!","prefix":"my-tool","timestamp":"2025-01-01T14:32:16.456Z"}
```

## Multi-Spinner Usage

DevLogr supports concurrent operations with proper multi-spinner management:

```typescript
import { createLogger, ListrTask } from '@neofork/devlogr';

const logger = createLogger('deploy');

const tasks: ListrTask[] = [
  {
    title: 'Database migration',
    task: async (ctx, task) => {
      task.output = 'Running migrations...';
      await migrateDatabase();
    },
  },
  {
    title: 'API deployment',
    task: async () => {
      await deployAPI();
    },
  },
  {
    title: 'Cache warming',
    task: async () => {
      await warmCache();
    },
  },
];

await logger.runConcurrentTasks('Deployment', tasks);
```

## Default Behavior

By default, DevLogr provides **clean, minimal output**:

- ✅ **No prefixes** or log level labels
- ✅ **No timestamps**
- ✅ **Colors and emojis** enabled (when supported)
- ✅ **Unicode symbols** for better visual hierarchy
- ✅ **Info level** logging and above

This ensures excellent readability for end users while allowing full customization for development and CI environments.

## Terminal Detection

DevLogr automatically detects terminal capabilities:

- **Color support** detection across different terminals
- **Unicode support** based on locale and terminal type
- **TTY detection** for appropriate output formatting
- **CI environment** detection for optimal defaults

## License

MIT License - see LICENSE file for details.
