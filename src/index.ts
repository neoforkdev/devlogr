/**
 * @fileoverview DevLogr - A UX-first logger for modern CLI tools
 *
 * DevLogr provides structured logging with personality and power, designed specifically
 * for command-line tools, deployment scripts, and development utilities.
 *
 * Features:
 * - Clean, scannable output with colors and emojis
 * - Animated spinners with fallback support
 * - JSON output mode for machine parsing
 * - Terminal-aware and CI-friendly
 * - Zero configuration required
 *
 * @example
 * ```typescript
 * import { createLogger } from '@neofork/devlogr';
 *
 * const log = createLogger('my-tool');
 *
 * log.info('Starting process...');
 * log.success('Process completed!');
 *
 * // Spinner usage
 * log.startSpinner('Working...');
 * setTimeout(() => log.succeedSpinner('Done!'), 1000);
 * ```
 */

// ============================================================================
// MAIN API - Core Logger Functionality
// ============================================================================

/** Core logger class and factory function */
export { Logger, createLogger } from './logger';

/** Log level enumeration and timestamp formatting options */
export { LogLevel, TimestampFormat } from './types';

/** Configuration interfaces for theming and logger setup */
export type { LogTheme, LogConfig } from './types';

// ============================================================================
// TASK MANAGEMENT - Listr2 Integration
// ============================================================================

/** Task management types from listr2 for advanced workflow orchestration */
export type { ListrTask, ListrTaskWrapper } from 'listr2';

// ============================================================================
// ADVANCED UTILITIES - Power User Features
// ============================================================================

/**
 * Advanced utility modules for fine-grained control over logging behavior.
 * These are primarily for power users who need direct access to internal functionality.
 */
export { SpinnerUtils, SafeStringUtils, TerminalUtils, EmojiUtils } from './utils';

/** Options for customizing spinner appearance and behavior */
export type { SpinnerOptions } from './utils';

// ============================================================================
// CONFIGURATION - Environment and Runtime Settings
// ============================================================================

/** Global configuration management for environment-based logger customization */
export { LogConfiguration } from './internal';
