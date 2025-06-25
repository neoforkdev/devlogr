'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.StringUtils = void 0;
const terminal_1 = require('./terminal');
const types_1 = require('../types');
/**
 * String manipulation and formatting utilities
 */
class StringUtils {
  /**
   * Formats current time as HH:MM:SS (default) or ISO format
   */
  static formatTime(format = types_1.TimestampFormat.TIME) {
    const now = new Date();
    if (format === types_1.TimestampFormat.ISO) {
      return now.toISOString();
    }
    // Default TIME format: HH:MM:SS
    return now.toTimeString().slice(0, 8);
  }
  /**
   * Truncates text to specified length with ellipsis
   */
  static truncate(text, maxLength) {
    if (!terminal_1.TerminalUtils.supportsUnicode()) {
      // Use ASCII ellipsis for non-Unicode terminals
      return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
    }
    return text.length > maxLength ? text.substring(0, maxLength - 1) + '…' : text;
  }
  /**
   * Pads string to specified width
   */
  static padString(str, width) {
    return str.toString().padStart(width);
  }
  /**
   * Creates repeated character string
   */
  static repeat(char, count) {
    return char.repeat(Math.max(0, count));
  }
  /**
   * Safely serializes an object to JSON, handling circular references
   */
  static safeJsonStringify(obj, indent = 2) {
    const seen = new WeakSet();
    const replacer = (key, value) => {
      // Handle null and primitive values
      if (value === null || typeof value !== 'object') {
        return value;
      }
      // Handle circular references
      if (seen.has(value)) {
        return '[Circular Reference]';
      }
      seen.add(value);
      // Handle Error objects specially
      if (value instanceof Error) {
        return {
          name: value.name,
          message: value.message,
          stack: value.stack,
        };
      }
      // Handle Date objects
      if (value instanceof Date) {
        return value.toISOString();
      }
      // Handle other objects
      return value;
    };
    try {
      return JSON.stringify(obj, replacer, indent);
    } catch (_error) {
      // Final fallback
      return `[Object: ${Object.prototype.toString.call(obj)}]`;
    }
  }
  /**
   * Formats arguments for logging with proper object serialization
   */
  static formatArgs(args) {
    if (args.length === 0) return '';
    return args
      .map(arg => {
        if (typeof arg === 'object' && arg !== null) {
          // Handle Error objects specially to show their message
          if (arg instanceof Error) {
            return `\n${arg.message}`;
          }
          // Use safe JSON stringify for all other objects
          return `\n${this.safeJsonStringify(arg)}`;
        }
        return ` ${String(arg)}`;
      })
      .join('');
  }
}
exports.StringUtils = StringUtils;
