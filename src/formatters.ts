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

  /**
   * Format spinner output using DevLogr's unified formatting system.
   * Returns structured parts for flexible rendering (TTY animation vs CI static).
   * Follows DRY principle by reusing existing format() method.
   *
   * @param message - The spinner text
   * @param level - The log level (e.g., "task", "success", "error")
   * @param prefix - Optional logger prefix
   * @param iconType - Type of icon to show
   */
  static formatSpinnerOutput(
    message: string,
    level: string,
    prefix?: string,
    iconType: 'running' | 'success' | 'error' | 'warning' | 'info' = 'running'
  ): {
    fullText: string; // Complete formatted output
    prefixPart: string; // "[timestamp] LEVEL [prefix]"
    iconPart: string; // "⠋" or "✓" or "✗"
    messagePart: string; // "message text"
  } {
    const config = LogConfiguration.getConfig();
    const shouldStripEmojis = !EmojiUtils.supportsEmoji();

    // Map icon types to appropriate themes and symbols
    const iconMapping = {
      running: { level: 'task', symbol: shouldStripEmojis ? '...' : '⠋' },
      success: { level: 'success', symbol: undefined }, // Use theme default
      error: { level: 'error', symbol: undefined },
      warning: { level: 'warn', symbol: undefined },
      info: { level: 'info', symbol: undefined },
    };

    const mapping = iconMapping[iconType];
    const actualLevel = mapping.level;
    const theme = ThemeProvider.getTheme(actualLevel, undefined, config.supportsUnicode);

    // Use custom symbol for running spinner, theme default for completion
    const iconSymbol = mapping.symbol || theme.symbol;
    const finalIcon = shouldStripEmojis ? EmojiUtils.forceStripEmojis(iconSymbol) : iconSymbol;

    // Generate the complete formatted text using existing format method (DRY)
    const fullText = this.format({
      level: actualLevel,
      theme: { symbol: finalIcon, label: theme.label, color: theme.color },
      prefix,
      maxPrefixLength: PrefixTracker.getMaxLength(),
      message,
      args: [],
      showTimestamp: config.showTimestamp,
      useColors: config.useColors,
      timestampFormat: config.timestampFormat,
      stripEmojis: shouldStripEmojis,
      includeLevel: config.showPrefix,
      includePrefix: config.showPrefix,
    });

    // Break down into parts for flexible rendering
    const parts = this.parseFormattedText(fullText, finalIcon, message);

    return {
      fullText,
      prefixPart: parts.prefix,
      iconPart: finalIcon,
      messagePart: parts.message,
    };
  }

  /**
   * Format spinner output with a custom icon (for animated frames).
   * Used by SpinnerRenderer to generate properly colored animated frames.
   *
   * @param message - The spinner text
   * @param level - The log level
   * @param prefix - Optional logger prefix
   * @param customIcon - Custom icon to use (e.g., animated frame)
   */
  static formatSpinnerOutputWithCustomIcon(
    message: string,
    level: string,
    prefix?: string,
    customIcon?: string
  ): string {
    const config = LogConfiguration.getConfig();
    const theme = ThemeProvider.getTheme(level, undefined, config.supportsUnicode);
    const shouldStripEmojis = !EmojiUtils.supportsEmoji();

    // Use the custom icon if provided, otherwise fall back to theme default
    const finalIcon = customIcon || theme.symbol;
    const displayIcon = shouldStripEmojis ? EmojiUtils.forceStripEmojis(finalIcon) : finalIcon;

    // Apply blue color specifically to animated spinner icons
    const blueIcon = config.useColors
      ? ChalkUtils.colorize(displayIcon, 'blue', config.useColors)
      : displayIcon;

    // Use a custom theme with the blue-colored icon but no color for message
    const customTheme = {
      symbol: blueIcon,
      label: theme.label,
      color: (text: string) => text, // No color for message
    };

    // Generate the complete formatted text using existing format method (DRY)
    return this.format({
      level,
      theme: customTheme,
      prefix,
      maxPrefixLength: PrefixTracker.getMaxLength(),
      message,
      args: [],
      showTimestamp: config.showTimestamp,
      useColors: config.useColors,
      timestampFormat: config.timestampFormat,
      stripEmojis: shouldStripEmojis,
      includeLevel: config.showPrefix,
      includePrefix: config.showPrefix,
    });
  }

  /**
   * Parse formatted text into prefix and message parts.
   * Used by formatSpinnerOutput for structured output.
   */
  private static parseFormattedText(
    fullText: string,
    icon: string,
    originalMessage: string
  ): { prefix: string; message: string } {
    // Find where the icon appears in the formatted text
    const iconIndex = fullText.indexOf(icon);
    if (iconIndex === -1) {
      // Fallback if icon not found
      return { prefix: fullText, message: originalMessage };
    }

    // Split at icon position
    const prefixPart = fullText.substring(0, iconIndex).trim();
    const messageIndex = iconIndex + icon.length;
    const messagePart = fullText.substring(messageIndex).trim();

    return {
      prefix: prefixPart,
      message: messagePart || originalMessage,
    };
  }

  /**
   * @deprecated Use formatSpinnerOutput() instead for better structure and DRY compliance
   */
  static formatForOra(
    message: string,
    level: string = 'task',
    prefix?: string,
    type: 'start' | 'succeed' | 'fail' | 'warn' | 'info' = 'start'
  ): { text: string; symbol?: string } {
    // Delegate to new method for consistency
    const iconTypeMap = {
      start: 'running' as const,
      succeed: 'success' as const,
      fail: 'error' as const,
      warn: 'warning' as const,
      info: 'info' as const,
    };

    const result = this.formatSpinnerOutput(message, level, prefix, iconTypeMap[type]);
    return {
      text: result.fullText,
      symbol: result.iconPart,
    };
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
