import { TerminalUtils } from './terminal';
import { TimestampFormat } from '../types';

/**
 * String manipulation and formatting utilities
 */
export class StringUtils {
  /**
   * Formats current time as HH:MM:SS (default) or ISO format
   */
  static formatTime(format: TimestampFormat = TimestampFormat.TIME): string {
    const now = new Date();

    if (format === TimestampFormat.ISO) {
      return now.toISOString();
    }

    // Default TIME format: HH:MM:SS
    return now.toTimeString().slice(0, 8);
  }

  /**
   * Truncates text to specified length with ellipsis
   */
  static truncate(text: string, maxLength: number): string {
    if (!TerminalUtils.supportsUnicode()) {
      // Use ASCII ellipsis for non-Unicode terminals
      return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
    }

    return text.length > maxLength ? text.substring(0, maxLength - 1) + '…' : text;
  }

  /**
   * Pads string to specified width
   */
  static padString(str: string, width: number): string {
    return str.toString().padStart(width);
  }

  /**
   * Creates repeated character string
   */
  static repeat(char: string, count: number): string {
    return char.repeat(Math.max(0, count));
  }

  /**
   * Safely serializes an object to JSON, handling circular references
   */
  static safeJsonStringify(obj: unknown, indent: number = 2): string {
    const seen = new WeakSet();

    const replacer = (key: string, value: unknown): unknown => {
      // Handle null and primitive values
      if (value === null || typeof value !== 'object') {
        return value;
      }

      // Handle circular references
      if (seen.has(value as object)) {
        return '[Circular Reference]';
      }

      seen.add(value as object);

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
  static formatArgs(args: unknown[]): string {
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
