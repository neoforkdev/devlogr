import chalk from 'chalk';
import { LogTheme, TimestampFormat } from './types';
import { StringUtils, EmojiUtils } from './utils';

// ============================================================================
// MESSAGE FORMATTING
// ============================================================================

interface FormatComponents {
  timestamp: string;
  symbol: string;
  levelLabel: string;
  prefix: string;
  spacing: string;
}

export class MessageFormatter {
  /**
   * Creates core formatting components - SINGLE SOURCE OF TRUTH
   */
  private static buildFormatComponents(
    level: string,
    theme: LogTheme,
    prefix: string,
    maxPrefixLength: number,
    showTimestamp: boolean,
    useColors: boolean,
    timestampFormat: TimestampFormat = TimestampFormat.TIME,
    includeLevel: boolean = true
  ): FormatComponents {
    const colorFn = useColors ? theme.color : (text: string) => text;
    
    // Timestamp
    const timestamp = showTimestamp 
      ? (useColors ? chalk.dim(`[${StringUtils.formatTime(timestampFormat)}]`) : `[${StringUtils.formatTime(timestampFormat)}]`)
      : '';
    
    // Symbol
    const symbol = theme.symbol ? colorFn(theme.symbol) : '';
    
    // Level label (only if requested)
    const levelLabel = includeLevel 
      ? (useColors ? chalk.bold(colorFn(theme.label.padEnd(7))) : theme.label.padEnd(7))
      : '';
    
    // Prefix formatting
    const prefixFormatted = useColors ? chalk.dim(`[${prefix}]`) : `[${prefix}]`;
    const prefixTotalLength = prefix.length + 2; // +2 for the brackets []
    const spacingBeforePrefix = StringUtils.repeat(' ', Math.max(1, maxPrefixLength + 2 - prefixTotalLength + 1));
    
    return {
      timestamp,
      symbol,
      levelLabel,
      prefix: prefixFormatted,
      spacing: spacingBeforePrefix
    };
  }

  /**
   * Creates a basic formatted prefix without log level (for simple logs)
   */
  static formatBasicPrefix(prefix: string, maxPrefixLength: number, showTimestamp: boolean, useColors: boolean, timestampFormat: TimestampFormat = TimestampFormat.TIME): string {
    if (!showTimestamp) {
      return '';
    }
    
    // Use dummy theme for basic formatting
    const dummyTheme = { symbol: '', label: '', color: (text: string) => text };
    const components = this.buildFormatComponents('', dummyTheme, prefix, maxPrefixLength, showTimestamp, useColors, timestampFormat, false);
    
    return `${components.timestamp}        ${components.spacing}${components.prefix} `;
  }

  /**
   * Creates a formatted prefix for spinners with log level and theme
   */
  static formatSpinnerPrefixWithLevel(level: string, theme: LogTheme, prefix: string, maxPrefixLength: number, showTimestamp: boolean, useColors: boolean, timestampFormat: TimestampFormat = TimestampFormat.TIME): string {
    if (!showTimestamp) {
      return '';
    }
    
    const components = this.buildFormatComponents(level, theme, prefix, maxPrefixLength, showTimestamp, useColors, timestampFormat, true);
    const symbolPart = components.symbol ? `${components.symbol} ` : '  ';
    
    return `${components.timestamp} ${symbolPart}${components.levelLabel}${components.spacing}${components.prefix} `;
  }

  /**
   * Formats a simple log message with symbol and colors (no timestamp/prefix)
   */
  static formatSimpleMessage(level: string, theme: LogTheme, message: string, args: unknown[], useColors: boolean, stripEmojis = false): string {
    const colorFn = useColors ? theme.color : (text: string) => text;
    const symbol = theme.symbol ? colorFn(theme.symbol) : '';
    const styledMessage = this.applyMessageStyling(level, message, colorFn, useColors);
    const formattedMessage = stripEmojis ? EmojiUtils.format(styledMessage) : styledMessage;
    const formattedArgs = StringUtils.formatArgs(args);
    
    return symbol ? `${symbol} ${formattedMessage}${formattedArgs}` : `${formattedMessage}${formattedArgs}`;
  }

  /**
   * Formats a complete debug log message with timestamp, level, and prefix
   */
  static formatCompleteLogMessage(level: string, theme: LogTheme, message: string, args: unknown[], prefix: string, maxPrefixLength: number, useColors: boolean, timestampFormat: TimestampFormat = TimestampFormat.TIME, stripEmojis = false): string {
    const components = this.buildFormatComponents(level, theme, prefix, maxPrefixLength, true, useColors, timestampFormat, true);
    const symbolPart = components.symbol ? `${components.symbol} ` : '  ';
    
    const styledMessage = this.applyMessageStyling(level, message, (useColors ? theme.color : (text: string) => text), useColors);
    const finalMessage = stripEmojis ? EmojiUtils.format(styledMessage) : styledMessage;
    const formattedArgs = StringUtils.formatArgs(args);
    
    return `${components.timestamp} ${symbolPart}${components.levelLabel}${components.spacing}${components.prefix} ${finalMessage}${formattedArgs}`;
  }

  /**
   * Applies appropriate styling to message text based on log level
   */
  private static applyMessageStyling(level: string, message: string, colorFn: (text: string) => string, useColors: boolean): string {
    const boldLevels = ['error', 'success'];
    const coloredLevels = ['warn', 'title', 'task', 'plain'];
    const dimLevels = ['trace'];
    
    if (boldLevels.includes(level)) {
      return useColors && colorFn === chalk.white ? chalk.bold.white(message) : 
             useColors ? chalk.bold(colorFn(message)) : message;
    }
    
    if (coloredLevels.includes(level) || level === 'title' || level === 'task' || level === 'plain') {
      return useColors && colorFn === chalk.white ? chalk.white(message) : 
             useColors ? colorFn(message) : message;
    }
    
    if (dimLevels.includes(level)) {
      return useColors ? chalk.dim(message) : message;
    }
    
    return message;
  }

  // ============================================================================
  // LEGACY METHODS (DEPRECATED - for backward compatibility)
  // ============================================================================

  /**
   * @deprecated Use formatBasicPrefix() instead
   */
  static formatPrefix(prefix: string, maxPrefixLength: number, showTimestamp: boolean, useColors: boolean): string {
    return this.formatBasicPrefix(prefix, maxPrefixLength, showTimestamp, useColors);
  }

  /**
   * @deprecated Use formatSpinnerPrefixWithLevel() instead
   */
  static formatSpinnerPrefix(level: string, theme: LogTheme, prefix: string, maxPrefixLength: number, showTimestamp: boolean, useColors: boolean): string {
    return this.formatSpinnerPrefixWithLevel(level, theme, prefix, maxPrefixLength, showTimestamp, useColors);
  }

  /**
   * @deprecated Use formatSimpleMessage() instead
   */
  static formatSimple(level: string, theme: LogTheme, message: string, args: unknown[], useColors: boolean, stripEmojis = false): string {
    return this.formatSimpleMessage(level, theme, message, args, useColors, stripEmojis);
  }

  /**
   * @deprecated Use formatCompleteLogMessage() instead
   */
  static formatDebug(level: string, theme: LogTheme, message: string, args: unknown[], prefix: string, maxPrefixLength: number, useColors: boolean, stripEmojis = false): string {
    return this.formatCompleteLogMessage(level, theme, message, args, prefix, maxPrefixLength, useColors, TimestampFormat.TIME, stripEmojis);
  }

  /**
   * @deprecated Use applyMessageStyling() instead (method is now private)
   */
  private static styleMessage(level: string, message: string, colorFn: (text: string) => string, useColors: boolean): string {
    return this.applyMessageStyling(level, message, colorFn, useColors);
  }
} 