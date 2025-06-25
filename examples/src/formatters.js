'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.MessageFormatter = void 0;
const chalk_1 = __importDefault(require('chalk'));
const types_1 = require('./types');
const utils_1 = require('./utils');
class MessageFormatter {
  /**
   * Universal formatter - handles all formatting scenarios
   * Single method for consistent message formatting across all log types
   */
  static format(options) {
    const {
      level = '',
      theme = { symbol: '', label: '', color: text => text },
      prefix = '',
      maxPrefixLength = 0,
      message = '',
      args = [],
      showTimestamp = false,
      useColors = false,
      timestampFormat = types_1.TimestampFormat.TIME,
      stripEmojis = false,
      includeLevel = true,
      includePrefix = true,
    } = options;
    const parts = [];
    // 1. Timestamp
    if (showTimestamp) {
      const timestamp = this.formatTimestamp(timestampFormat, useColors);
      parts.push(timestamp);
    }
    // 2. Symbol and Level
    if (theme.symbol || includeLevel) {
      const formatted = this.formatSymbolAndLevel(theme, level, includeLevel, useColors);
      if (formatted) parts.push(formatted);
    }
    // 3. Prefix with proper spacing
    if (includePrefix && prefix) {
      const formatted = this.formatPrefix(prefix, maxPrefixLength, useColors);
      parts.push(formatted);
    }
    // 4. Message with styling
    if (message) {
      const formatted = this.formatMessage(level, theme, message, args, useColors, stripEmojis);
      parts.push(formatted);
    }
    return parts.join(' ').trim();
  }
  // ============================================================================
  // PRIVATE HELPERS - EXTRACTED FOR CLARITY
  // ============================================================================
  static formatTimestamp(timestampFormat, useColors) {
    const timestamp = utils_1.StringUtils.formatTime(timestampFormat);
    return useColors ? chalk_1.default.dim(`[${timestamp}]`) : `[${timestamp}]`;
  }
  static formatSymbolAndLevel(theme, level, includeLevel, useColors) {
    const colorFn = useColors ? theme.color : text => text;
    const symbol = theme.symbol ? colorFn(theme.symbol) : '';
    const levelLabel = includeLevel
      ? useColors
        ? chalk_1.default.bold(colorFn(theme.label.padEnd(7)))
        : theme.label.padEnd(7)
      : '';
    if (symbol && levelLabel) {
      return `${symbol} ${levelLabel}`;
    } else if (symbol) {
      return symbol;
    } else if (levelLabel) {
      return levelLabel;
    }
    return '';
  }
  static formatPrefix(prefix, maxPrefixLength, useColors) {
    const prefixFormatted = useColors ? chalk_1.default.dim(`[${prefix}]`) : `[${prefix}]`;
    const prefixTotalLength = prefix.length + 2; // +2 for brackets
    const spacing = utils_1.StringUtils.repeat(
      ' ',
      Math.max(1, maxPrefixLength + 2 - prefixTotalLength + 1)
    );
    return `${spacing}${prefixFormatted}`;
  }
  static formatMessage(level, theme, message, args, useColors, stripEmojis) {
    const colorFn = useColors ? theme.color : text => text;
    const styledMessage = this.styleMessage(level, message, colorFn, useColors);
    const finalMessage = stripEmojis
      ? utils_1.EmojiUtils.forceStripEmojis(styledMessage)
      : styledMessage;
    // Process arguments to strip emojis if needed
    const processedArgs = stripEmojis
      ? args.map(arg => {
          if (typeof arg === 'string') {
            return utils_1.EmojiUtils.forceStripEmojis(arg);
          }
          return arg;
        })
      : args;
    const formattedArgs = utils_1.StringUtils.formatArgs(processedArgs);
    return `${finalMessage}${formattedArgs}`;
  }
  static styleMessage(level, message, colorFn, useColors) {
    if (!useColors) return message;
    // Bold levels for important messages
    if (['error', 'success'].includes(level)) {
      return chalk_1.default.bold(colorFn(message));
    }
    // Colored levels for contextual messages
    if (['warn', 'title', 'task', 'plain'].includes(level)) {
      return colorFn(message);
    }
    // Dimmed for debug/trace
    if (level === 'trace') {
      return chalk_1.default.dim(message);
    }
    return message;
  }
  /**
   * Format basic prefix with timestamp and spacing
   */
  static formatBasicPrefix(
    prefix,
    maxPrefixLength,
    showTimestamp,
    useColors,
    timestampFormat = types_1.TimestampFormat.TIME
  ) {
    if (!showTimestamp) return '';
    const timestamp = this.formatTimestamp(timestampFormat, useColors);
    const prefixFormatted = this.formatPrefix(prefix, maxPrefixLength, useColors);
    return `${timestamp}        ${prefixFormatted} `;
  }
  /**
   * Format message with theme and emoji handling
   */
  static formatSimpleMessage(level, theme, message, args, useColors, stripEmojis = false) {
    return this.format({
      level,
      theme,
      message,
      args,
      useColors,
      stripEmojis,
      includeLevel: false,
      includePrefix: false,
      showTimestamp: false,
    });
  }
  /**
   * Format spinner prefix with level symbol and timestamp
   */
  static formatSpinnerPrefixWithLevel(
    level,
    theme,
    prefix,
    maxPrefixLength,
    showTimestamp,
    useColors,
    timestampFormat = types_1.TimestampFormat.TIME
  ) {
    if (!showTimestamp) return '';
    return this.format({
      level,
      theme,
      prefix,
      maxPrefixLength,
      showTimestamp,
      useColors,
      timestampFormat,
      includeLevel: true,
    });
  }
  /**
   * Format complete log message with all elements
   */
  static formatCompleteLogMessage(
    level,
    theme,
    message,
    args,
    prefix,
    maxPrefixLength,
    useColors,
    timestampFormat = types_1.TimestampFormat.TIME,
    stripEmojis = false
  ) {
    return this.format({
      level,
      theme,
      message,
      args,
      prefix,
      maxPrefixLength,
      showTimestamp: true,
      useColors,
      timestampFormat,
      stripEmojis,
    });
  }
}
exports.MessageFormatter = MessageFormatter;
