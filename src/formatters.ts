import { LogTheme, TimestampFormat } from './types';
import { StringUtils, EmojiUtils } from './utils';
import { ChalkUtils } from './utils/chalk';
import { LogConfiguration } from './config';
import { ThemeProvider } from './themes';
import { PrefixTracker } from './tracker';

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
  // ============================================================================
  // CENTRALIZED PUBLIC API - SINGLE SOURCE OF TRUTH FOR ALL FORMATTING
  // ============================================================================

  /**
   * Centralized formatting method that all APIs should use.
   * Reads environment configuration internally for consistency.
   *
   * @param message - The message to format
   * @param messagePrefix - The symbol/prefix (e.g., "✓", "✖", "→")
   * @param level - The log level (e.g., "info", "error", "task")
   * @param prefix - Optional prefix for the logger instance
   * @param args - Optional additional arguments
   */
  static formatWithPrefix(
    message: string,
    messagePrefix: string,
    level: string,
    prefix?: string,
    args: unknown[] = []
  ): string {
    const config = LogConfiguration.getConfig();
    const theme = ThemeProvider.getTheme(level, undefined, config.supportsUnicode);
    const maxPrefixLength = PrefixTracker.getMaxLength();
    const shouldStripEmojis = !EmojiUtils.supportsEmoji();

    // Create a custom theme with the provided messagePrefix
    const customTheme: LogTheme = {
      symbol: messagePrefix,
      label: theme.label,
      color: theme.color,
    };

    return this.format({
      level,
      theme: customTheme,
      prefix,
      maxPrefixLength,
      message,
      args,
      showTimestamp: config.showTimestamp,
      useColors: config.useColors,
      timestampFormat: config.timestampFormat,
      stripEmojis: shouldStripEmojis,
      includeLevel: config.showPrefix,
      includePrefix: config.showPrefix,
    });
  }

  /**
   * Simplified method for basic message formatting without custom prefix.
   * Uses the theme's default symbol.
   */
  static formatMessage(
    message: string,
    level: string,
    prefix?: string,
    args: unknown[] = []
  ): string {
    const config = LogConfiguration.getConfig();
    const theme = ThemeProvider.getTheme(level, undefined, config.supportsUnicode);

    return this.formatWithPrefix(message, theme.symbol, level, prefix, args);
  }

  // ============================================================================
  // CORE FORMATTING METHOD - USED INTERNALLY BY PUBLIC API
  // ============================================================================

  /**
   * Universal formatter - handles all formatting scenarios with proper component ordering.
   *
   * Creates the standard DevLogr format: [Timestamp] [Level] [Prefix] [Symbol] [Message]
   * This ensures consistent structure across all logging APIs (logger, spinner, listr2).
   *
   * @param options - Formatting configuration options
   * @returns Properly formatted log message with correct component positioning
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

    // 1. Timestamp: [12:34:56] or [2024-01-01 12:34:56]
    if (showTimestamp) {
      parts.push(this.formatTimestamp(timestampFormat, useColors));
    }

    // 2. Level: INFO    ERROR   WARNING (padded to 7 chars for alignment)
    if (includeLevel) {
      const colorFn = useColors ? theme.color : (text: string) => text;
      const levelLabel = useColors
        ? ChalkUtils.getChalkInstance(useColors).bold(colorFn(theme.label.padEnd(7)))
        : theme.label.padEnd(7);
      parts.push(levelLabel);
    }

    // 3. Prefix: [logger-name] (with consistent spacing based on max prefix length)
    if (includePrefix && prefix) {
      parts.push(this.formatPrefix(prefix, maxPrefixLength, useColors));
    }

    // 4. Symbol: ✓ ✖ ⠋ → (spinner icons, status symbols, etc.)
    if (theme.symbol) {
      const colorFn = useColors ? theme.color : (text: string) => text;
      parts.push(colorFn(theme.symbol));
    }

    // 5. Message: Actual log content with proper styling and args
    if (message) {
      parts.push(this.formatMessageWithTheme(level, theme, message, args, useColors, stripEmojis));
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

  private static formatPrefix(prefix: string, maxPrefixLength: number, useColors: boolean): string {
    const prefixFormatted = ChalkUtils.colorize(`[${prefix}]`, 'dim', useColors);
    const prefixTotalLength = prefix.length + 2; // +2 for brackets
    const spacing = StringUtils.repeat(
      ' ',
      Math.max(1, maxPrefixLength + 2 - prefixTotalLength + 1)
    );
    return `${spacing}${prefixFormatted}`;
  }

  private static formatMessageWithTheme(
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
    return this.formatMessageWithTheme(level, theme, message, args, useColors, stripEmojis);
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
