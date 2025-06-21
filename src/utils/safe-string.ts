import { TerminalUtils } from './terminal';
import { EmojiUtils } from './emoji';
import chalk from 'chalk';

/**
 * Safe string utilities that respect logger conventions
 * Handles emoji, color, Unicode, and terminal capabilities automatically
 *
 * SOLID: Single responsibility - creates safe strings
 * DRY: Reuses existing utilities
 * KISS: Simple interface, complex logic hidden
 */
export class SafeStringUtils {
  private static _supportsColor: boolean | null = null;
  private static _supportsUnicode: boolean | null = null;
  private static _supportsEmoji: boolean | null = null;

  /**
   * Cached color support detection
   */
  private static get supportsColor(): boolean {
    if (this._supportsColor === null) {
      this._supportsColor = TerminalUtils.supportsColor();
    }
    return this._supportsColor;
  }

  /**
   * Cached Unicode support detection
   */
  private static get supportsUnicode(): boolean {
    if (this._supportsUnicode === null) {
      this._supportsUnicode = TerminalUtils.supportsUnicode();
    }
    return this._supportsUnicode;
  }

  /**
   * Cached emoji support detection
   */
  private static get supportsEmoji(): boolean {
    if (this._supportsEmoji === null) {
      this._supportsEmoji = EmojiUtils.supportsEmoji();
    }
    return this._supportsEmoji;
  }

  /**
   * Reset cached values (useful for testing)
   */
  static resetCache(): void {
    this._supportsColor = null;
    this._supportsUnicode = null;
    this._supportsEmoji = null;
  }

  /**
   * Creates a safe string with appropriate color styling
   * Respects NO_COLOR, DEVLOGR_NO_COLOR, and terminal color support
   */
  static color(text: string, colorFn: any): string {
    return this.supportsColor ? colorFn(text) : text;
  }

  /**
   * Creates a safe symbol that works across all terminals
   * Falls back to ASCII for non-Unicode terminals
   */
  static symbol(unicodeSymbol: string, fallback: string): string {
    return this.supportsUnicode ? unicodeSymbol : fallback;
  }

  /**
   * Creates a safe emoji string
   * Removes emojis if not supported by terminal/environment
   */
  static emoji(text: string): string {
    return this.supportsEmoji ? text : EmojiUtils.format(text);
  }

  /**
   * Creates a safe colored symbol with fallback
   * Combines color, Unicode, and emoji safety
   */
  static coloredSymbol(unicodeSymbol: string, fallback: string, colorFn: any): string {
    const safeSymbol = this.symbol(unicodeSymbol, fallback);
    const withoutEmojis = this.emoji(safeSymbol);
    return this.color(withoutEmojis, colorFn);
  }

  /**
   * Creates a safe colored text with emoji handling
   * The most comprehensive safe string creation method
   */
  static safe(text: string, colorFn?: any): string {
    const withoutEmojis = this.emoji(text);
    return colorFn ? this.color(withoutEmojis, colorFn) : withoutEmojis;
  }

  /**
   * Creates a safe formatted message with prefix, symbol, and content
   * Used for error messages that should respect logger conventions
   */
  static formatMessage(
    symbol: string,
    symbolFallback: string,
    symbolColor: any,
    prefix: string,
    prefixColor: any,
    content: string,
    contentColor?: any
  ): string {
    const safeSymbol = this.coloredSymbol(symbol, symbolFallback, symbolColor);
    const safePrefix = this.safe(prefix, prefixColor);
    const safeContent = this.safe(content, contentColor);

    return `${safeSymbol} ${safePrefix}: ${safeContent}`;
  }

  /**
   * Creates logger-style error formatting that respects all terminal capabilities
   * Matches the exact format expected by tests and error handling
   */
  static formatError(type: string, message: string, suggestion?: string): string {
    const errorLabel = this.safe('error', chalk.red.bold as any);
    const typeText = this.safe(type);
    const messageText = this.safe(message);

    let result = `${errorLabel}: ${typeText}\n${messageText}`;

    if (suggestion) {
      const helpLabel = this.safe('help', chalk.green as any);
      const suggestionText = this.safe(suggestion, chalk.green as any);
      result += `\n${helpLabel}: ${suggestionText}`;
    }

    return result;
  }

  /**
   * Creates logger-style warning formatting
   */
  static formatWarning(message: string): string {
    return this.formatMessage(
      '!',
      '!',
      chalk.yellow.bold as any,
      'WARNING',
      chalk.yellow.bold as any,
      message
    );
  }

  /**
   * Creates logger-style info formatting
   */
  static formatInfo(message: string): string {
    return this.formatMessage(
      'ℹ',
      'i',
      chalk.blue.bold as any,
      'INFO',
      chalk.blue.bold as any,
      message
    );
  }

  /**
   * Creates logger-style debug formatting
   */
  static formatDebug(message: string): string {
    return this.formatMessage(
      '?',
      '?',
      chalk.gray as any,
      'DEBUG',
      chalk.gray as any,
      message,
      chalk.gray as any
    );
  }

  /**
   * Get safe fallback symbols for different log levels
   * Useful for consistent error formatting across the system
   */
  static getLogSymbols(): Record<string, { unicode: string; fallback: string; color: any }> {
    return {
      error: { unicode: '✗', fallback: 'X', color: chalk.red.bold as any },
      warn: { unicode: '!', fallback: '!', color: chalk.yellow.bold as any },
      info: { unicode: 'ℹ', fallback: 'i', color: chalk.blue.bold as any },
      debug: { unicode: '?', fallback: '?', color: chalk.gray as any },
      trace: { unicode: '•', fallback: '.', color: chalk.gray as any },
      success: { unicode: '✓', fallback: '+', color: chalk.green.bold as any },
      help: { unicode: '💡', fallback: 'i', color: chalk.green as any },
    };
  }
}
