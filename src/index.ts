// Main logger exports - Core API
export { Logger, createLogger } from './logger';
export { LogLevel, TimestampFormat } from './types';
export type { LogTheme, LogConfig } from './types';

// Listr2 integration types
export type { ListrTask, ListrTaskWrapper } from 'listr2';

// Advanced utilities (for power users only)
export { SpinnerUtils } from './utils';
export type { SpinnerOptions } from './utils';

// Internal utilities - available but not encouraged for direct use
// Most users should use the Logger methods instead
export {
  LogConfiguration,
  ThemeProvider,
  MessageFormatter,
  PrefixTracker,
  StringUtils,
  TerminalUtils,
  EmojiUtils,
  SafeStringUtils,
} from './internal';
