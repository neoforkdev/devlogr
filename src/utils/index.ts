/**
 * @fileoverview Utility modules for advanced DevLogr functionality
 * 
 * These utilities provide low-level access to DevLogr's internal functionality.
 * Most users will not need to use these directly - they are primarily for
 * power users and advanced integration scenarios.
 */

// ============================================================================
// UTILITY MODULES - Advanced Functionality
// ============================================================================

/** Emoji detection and fallback utilities */
export { EmojiUtils } from './emoji';

/** Terminal capability detection and ANSI escape code utilities */
export { TerminalUtils } from './terminal';

/** String manipulation and formatting utilities */
export { StringUtils } from './string';

/** Safe string conversion with circular reference handling */
export { SafeStringUtils } from './safe-string';

/** Spinner management for custom spinner implementations */
export { SpinnerUtils } from './spinner';

/** Configuration options for customizing spinner appearance and behavior */
export type { SpinnerOptions } from './spinner';
