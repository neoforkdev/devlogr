'use strict';
/**
 * @fileoverview Utility modules for advanced DevLogr functionality
 *
 * These utilities provide low-level access to DevLogr's internal functionality.
 * Most users will not need to use these directly - they are primarily for
 * power users and advanced integration scenarios.
 */
Object.defineProperty(exports, '__esModule', { value: true });
exports.SpinnerUtils =
  exports.SafeStringUtils =
  exports.StringUtils =
  exports.TerminalUtils =
  exports.EmojiUtils =
    void 0;
// ============================================================================
// UTILITY MODULES - Advanced Functionality
// ============================================================================
/** Emoji detection and fallback utilities */
var emoji_1 = require('./emoji');
Object.defineProperty(exports, 'EmojiUtils', {
  enumerable: true,
  get: function () {
    return emoji_1.EmojiUtils;
  },
});
/** Terminal capability detection and ANSI escape code utilities */
var terminal_1 = require('./terminal');
Object.defineProperty(exports, 'TerminalUtils', {
  enumerable: true,
  get: function () {
    return terminal_1.TerminalUtils;
  },
});
/** String manipulation and formatting utilities */
var string_1 = require('./string');
Object.defineProperty(exports, 'StringUtils', {
  enumerable: true,
  get: function () {
    return string_1.StringUtils;
  },
});
/** Safe string conversion with circular reference handling */
var safe_string_1 = require('./safe-string');
Object.defineProperty(exports, 'SafeStringUtils', {
  enumerable: true,
  get: function () {
    return safe_string_1.SafeStringUtils;
  },
});
/** Spinner management for custom spinner implementations */
var spinner_1 = require('./spinner');
Object.defineProperty(exports, 'SpinnerUtils', {
  enumerable: true,
  get: function () {
    return spinner_1.SpinnerUtils;
  },
});
