import { LogTheme, TimestampFormat } from './types';
import { StringUtils, EmojiUtils } from './utils';
import { ChalkUtils } from './utils/chalk';
import { LogConfiguration } from './config';
import { ThemeProvider } from './themes';
import { PrefixTracker } from './tracker';

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
  showEmojis?: boolean;
  includeLevel?: boolean;
  includePrefix?: boolean;
}

/**
 * Unified message formatter for all DevLogr output scenarios.
 */
export class MessageFormatter {
  /**
   * Format message with custom symbol prefix.
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
    const shouldShowEmojis = EmojiUtils.shouldShowEmojis();

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
      showEmojis: shouldShowEmojis,
      includeLevel: config.showPrefix,
      includePrefix: config.showPrefix,
    });
  }

  /**
   * Format message using theme's default symbol.
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
   * Format spinner output with structured parts for TTY/CI rendering.
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
    const shouldShowEmojis = EmojiUtils.shouldShowEmojis();

    // Map icon types to appropriate themes and symbols
    const iconMapping = {
      running: { level: 'task', symbol: config.showIcons ? (shouldShowEmojis ? '⠋' : '...') : '' },
      success: { level: 'success', symbol: undefined }, // Use theme default
      error: { level: 'error', symbol: undefined },
      warning: { level: 'warn', symbol: undefined },
      info: { level: 'info', symbol: undefined },
    };

    const mapping = iconMapping[iconType];
    const actualLevel = mapping.level;
    const theme = ThemeProvider.getTheme(actualLevel, undefined, config.supportsUnicode);

    const iconSymbol = mapping.symbol || theme.symbol;
    const finalIcon = shouldShowEmojis ? iconSymbol : EmojiUtils.forceStripEmojis(iconSymbol);

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
      showEmojis: shouldShowEmojis,
      includeLevel: config.showPrefix,
      includePrefix: config.showPrefix,
    });

    const parts = this.parseFormattedText(fullText, finalIcon, message);

    return {
      fullText,
      prefixPart: parts.prefix,
      iconPart: finalIcon,
      messagePart: parts.message,
    };
  }

  /**
   * Format spinner output with custom animated icon.
   */
  static formatSpinnerOutputWithCustomIcon(
    message: string,
    level: string,
    prefix?: string,
    customIcon?: string
  ): string {
    const config = LogConfiguration.getConfig();
    const theme = ThemeProvider.getTheme(level, undefined, config.supportsUnicode);
    const shouldShowEmojis = EmojiUtils.shouldShowEmojis();

    // Use the custom icon if provided, otherwise fall back to theme default
    const finalIcon = customIcon || theme.symbol;
    const displayIcon = shouldShowEmojis ? finalIcon : EmojiUtils.forceStripEmojis(finalIcon);

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
      showEmojis: shouldShowEmojis,
      includeLevel: config.showPrefix,
      includePrefix: config.showPrefix,
    });
  }

  private static parseFormattedText(
    fullText: string,
    icon: string,
    originalMessage: string
  ): { prefix: string; message: string } {
    const iconIndex = fullText.indexOf(icon);
    if (iconIndex === -1) {
      // Fallback if icon not found
      return { prefix: fullText, message: originalMessage };
    }

    const prefixPart = fullText.substring(0, iconIndex).trim();
    const messageIndex = iconIndex + icon.length;
    const messagePart = fullText.substring(messageIndex).trim();

    return {
      prefix: prefixPart,
      message: messagePart || originalMessage,
    };
  }

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

  /**
   * Core formatter: [Timestamp] [Level] [Prefix] [Symbol] [Message]
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
      showEmojis = true,
      includeLevel = true,
      includePrefix = true,
    } = options;

    const parts: string[] = [];

    if (showTimestamp) {
      parts.push(this.formatTimestamp(timestampFormat, useColors));
    }

    if (includeLevel) {
      const colorFn = useColors ? theme.color : (text: string) => text;
      const levelLabel = useColors
        ? ChalkUtils.getChalkInstance(useColors).bold(colorFn(theme.label.padEnd(7)))
        : theme.label.padEnd(7);
      parts.push(levelLabel);
    }

    if (includePrefix && prefix) {
      parts.push(this.formatPrefix(prefix, maxPrefixLength, useColors));
    }

    if (theme.symbol) {
      const colorFn = useColors ? theme.color : (text: string) => text;
      parts.push(colorFn(theme.symbol));
    }
    if (message) {
      parts.push(this.formatMessageWithTheme(level, theme, message, args, useColors, showEmojis));
    }

    return parts.join(' ').trim();
  }

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
    showEmojis: boolean
  ): string {
    const colorFn = useColors ? theme.color : (text: string) => text;
    const styledMessage = this.styleMessage(level, message, colorFn, useColors);
    const finalMessage = showEmojis ? styledMessage : EmojiUtils.forceStripEmojis(styledMessage);

    // Process arguments to show/hide emojis as needed
    const processedArgs = showEmojis
      ? args
      : args.map(arg => {
          if (typeof arg === 'string') {
            return EmojiUtils.forceStripEmojis(arg);
          }
          return arg;
        });

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

  static formatSimpleMessage(
    level: string,
    theme: LogTheme,
    message: string,
    args: unknown[],
    useColors: boolean,
    showEmojis = true
  ): string {
    return this.formatMessageWithTheme(level, theme, message, args, useColors, showEmojis);
  }

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

  static formatCompleteLogMessage(
    level: string,
    theme: LogTheme,
    message: string,
    args: unknown[],
    prefix: string,
    maxPrefixLength: number,
    useColors: boolean,
    timestampFormat: TimestampFormat = TimestampFormat.TIME,
    showEmojis = true
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
      showEmojis,
      includeLevel: true,
      includePrefix: true,
    });
  }
}
