import { LogTheme, TimestampFormat } from './types';
import { StringUtils, EmojiUtils } from './utils';
import { ChalkUtils } from './utils/chalk';

// ============================================================================
// MESSAGE FORMATTING - SIMPLIFIED UNIFIED FORMATTER
// ============================================================================

interface FormatOptions {
  level?: string;
  theme?: LogTheme;
  prefix?: string;
  maxPrefixLength?: number;
  message?: string;
  args?: unknown[];
  showTimestamp?: boolean;
  useColors?: boolean;
  timestampFormat?: TimestampFormat;
  stripEmojis?: boolean;
  includeLevel?: boolean;
  includePrefix?: boolean;
}

/**
 * Simplified MessageFormatter with consolidated formatting logic.
 * Follows DRY principle by using a single format method for all scenarios.
 */
export class MessageFormatter {
  /**
   * Universal formatter - handles all formatting scenarios with a single method.
   * This eliminates the need for multiple specialized formatting methods.
   */
  static format(options: FormatOptions): string {
    const {
      level = '',
      theme = { symbol: '', label: '', color: (text: string) => text },
      prefix = '',
      maxPrefixLength = 0,
      message = '',
      args = [],
      showTimestamp = false,
      useColors = false,
      timestampFormat = TimestampFormat.TIME,
      stripEmojis = false,
      includeLevel = true,
      includePrefix = true,
    } = options;

    const parts: string[] = [];

    // 1. Timestamp
    if (showTimestamp) {
      parts.push(this.formatTimestamp(timestampFormat, useColors));
    }

    // 2. Symbol and Level
    if (theme.symbol || includeLevel) {
      const formatted = this.formatSymbolAndLevel(theme, level, includeLevel, useColors);
      if (formatted) parts.push(formatted);
    }

    // 3. Prefix with proper spacing
    if (includePrefix && prefix) {
      parts.push(this.formatPrefix(prefix, maxPrefixLength, useColors));
    }

    // 4. Message with styling
    if (message) {
      parts.push(this.formatMessage(level, theme, message, args, useColors, stripEmojis));
    }

    return parts.join(' ').trim();
  }

  // ============================================================================
  // PRIVATE HELPERS - CONSOLIDATED AND SIMPLIFIED
  // ============================================================================

  private static formatTimestamp(timestampFormat: TimestampFormat, useColors: boolean): string {
    const timestamp = StringUtils.formatTime(timestampFormat);
    return ChalkUtils.colorize(`[${timestamp}]`, 'dim', useColors);
  }

  private static formatSymbolAndLevel(
    theme: LogTheme,
    level: string,
    includeLevel: boolean,
    useColors: boolean
  ): string {
    const colorFn = useColors ? theme.color : (text: string) => text;
    const symbol = theme.symbol ? colorFn(theme.symbol) : '';
    const levelLabel = includeLevel
      ? useColors
        ? ChalkUtils.getChalkInstance(useColors).bold(colorFn(theme.label.padEnd(7)))
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

  private static formatPrefix(prefix: string, maxPrefixLength: number, useColors: boolean): string {
    const prefixFormatted = ChalkUtils.colorize(`[${prefix}]`, 'dim', useColors);
    const prefixTotalLength = prefix.length + 2; // +2 for brackets
    const spacing = StringUtils.repeat(
      ' ',
      Math.max(1, maxPrefixLength + 2 - prefixTotalLength + 1)
    );
    return `${spacing}${prefixFormatted}`;
  }

  private static formatMessage(
    level: string,
    theme: LogTheme,
    message: string,
    args: unknown[],
    useColors: boolean,
    stripEmojis: boolean
  ): string {
    const colorFn = useColors ? theme.color : (text: string) => text;
    const styledMessage = this.styleMessage(level, message, colorFn, useColors);
    const finalMessage = stripEmojis ? EmojiUtils.forceStripEmojis(styledMessage) : styledMessage;

    // Process arguments to strip emojis if needed
    const processedArgs = stripEmojis
      ? args.map(arg => {
          if (typeof arg === 'string') {
            return EmojiUtils.forceStripEmojis(arg);
          }
          return arg;
        })
      : args;

    const formattedArgs = StringUtils.formatArgs(processedArgs);
    return `${finalMessage}${formattedArgs}`;
  }

  private static styleMessage(
    level: string,
    message: string,
    colorFn: (text: string) => string,
    useColors: boolean
  ): string {
    if (!useColors) return message;

    const chalkInstance = ChalkUtils.getChalkInstance(useColors);

    // Use a mapping approach for cleaner code
    const styleRules = {
      bold: ['error', 'success'],
      colored: ['warn', 'title', 'task', 'plain'],
      dimmed: ['trace'],
    };

    if (styleRules.bold.includes(level)) {
      return chalkInstance.bold(colorFn(message));
    }

    if (styleRules.colored.includes(level)) {
      return colorFn(message);
    }

    if (styleRules.dimmed.includes(level)) {
      return chalkInstance.dim(message);
    }

    return message;
  }

  // ============================================================================
  // BACKWARD COMPATIBILITY METHODS - SIMPLIFIED WRAPPERS
  // ============================================================================

  /**
   * Format basic prefix with timestamp and spacing
   * @deprecated Use format() method directly for better flexibility
   */
  static formatBasicPrefix(
    prefix: string,
    maxPrefixLength: number,
    showTimestamp: boolean,
    useColors: boolean,
    timestampFormat: TimestampFormat = TimestampFormat.TIME
  ): string {
    if (!showTimestamp) return '';

    const timestamp = this.formatTimestamp(timestampFormat, useColors);
    const prefixFormatted = this.formatPrefix(prefix, maxPrefixLength, useColors);

    return `${timestamp}        ${prefixFormatted} `;
  }

  /**
   * Format message with theme and emoji handling
   * @deprecated Use format() method directly for better flexibility
   */
  static formatSimpleMessage(
    level: string,
    theme: LogTheme,
    message: string,
    args: unknown[],
    useColors: boolean,
    stripEmojis = false
  ): string {
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
   * @deprecated Use format() method directly for better flexibility
   */
  static formatSpinnerPrefixWithLevel(
    level: string,
    theme: LogTheme,
    prefix: string,
    maxPrefixLength: number,
    showTimestamp: boolean,
    useColors: boolean,
    timestampFormat: TimestampFormat = TimestampFormat.TIME
  ): string {
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
      includePrefix: true,
    });
  }

  /**
   * Format complete log message with all elements
   * @deprecated Use format() method directly for better flexibility
   */
  static formatCompleteLogMessage(
    level: string,
    theme: LogTheme,
    message: string,
    args: unknown[],
    prefix: string,
    maxPrefixLength: number,
    useColors: boolean,
    timestampFormat: TimestampFormat = TimestampFormat.TIME,
    stripEmojis = false
  ): string {
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
      includeLevel: true,
      includePrefix: true,
    });
  }
}
