import { TerminalUtils } from './terminal';
import { EmojiUtils } from './emoji';
import { ChalkUtils } from './chalk';

// Simple type for color functions
type ColorFunction = (text: string) => string;

/**
 * Safe string formatting utilities with automatic fallbacks for terminal compatibility.
 * Handles color, Unicode, and emoji formatting with appropriate fallbacks.
 */
export class SafeStringUtils {
  /**
   * Apply color styling to text with automatic fallback for unsupported terminals.
   *
   * @param text - Text to colorize
   * @param colorFn - Color function (e.g., chalk.red)
   * @returns Colored text or plain text if colors not supported
   */
  static color(text: string, colorFn: ColorFunction): string {
    return TerminalUtils.supportsColor() ? colorFn(text) : text;
  }

  /**
   * Reset cached values (no-op - kept for test compatibility)
   */
  static resetCache(): void {
    // No-op for test compatibility
  }

  /**
   * Display Unicode symbol with ASCII fallback for unsupported terminals.
   *
   * @param unicodeSymbol - Preferred Unicode symbol
   * @param fallback - ASCII fallback character
   * @returns Unicode symbol or fallback based on terminal support
   */
  static symbol(unicodeSymbol: string, fallback: string): string {
    return TerminalUtils.supportsUnicode() ? unicodeSymbol : fallback;
  }

  /**
   * Creates a safe emoji string
   */
  static emoji(text: string): string {
    return EmojiUtils.shouldShowEmojis() ? text : EmojiUtils.format(text);
  }

  /**
   * Creates a safe colored symbol with fallback
   */
  static coloredSymbol(unicodeSymbol: string, fallback: string, colorFn: ColorFunction): string {
    const safeSymbol = this.symbol(unicodeSymbol, fallback);
    const withoutEmojis = this.emoji(safeSymbol);
    return this.color(withoutEmojis, colorFn);
  }

  /**
   * Creates a safe colored text with emoji handling
   */
  static safe(text: string, colorFn?: ColorFunction): string {
    const withoutEmojis = this.emoji(text);
    return colorFn ? this.color(withoutEmojis, colorFn) : withoutEmojis;
  }

  /**
   * Creates a safe formatted message with prefix, symbol, and content
   */
  static formatMessage(
    symbol: string,
    symbolFallback: string,
    symbolColor: ColorFunction,
    prefix: string,
    prefixColor: ColorFunction,
    content: string,
    contentColor?: ColorFunction
  ): string {
    const safeSymbol = this.coloredSymbol(symbol, symbolFallback, symbolColor);
    const safePrefix = this.safe(prefix, prefixColor);
    const safeContent = this.safe(content, contentColor);

    return `${safeSymbol} ${safePrefix}: ${safeContent}`;
  }

  /**
   * Creates logger-style error formatting
   */
  static formatError(type: string, message: string, suggestion?: string): string {
    const chalkInstance = ChalkUtils.getChalkInstance();
    const errorLabel = this.safe('error', chalkInstance.red.bold);
    const typeText = this.safe(type);
    const messageText = this.safe(message);

    let result = `${errorLabel}: ${typeText}\n${messageText}`;

    if (suggestion) {
      const helpLabel = this.safe('help', chalkInstance.green);
      const suggestionText = this.safe(suggestion, chalkInstance.green);
      result += `\n${helpLabel}: ${suggestionText}`;
    }

    return result;
  }

  /**
   * Creates logger-style warning formatting
   */
  static formatWarning(message: string): string {
    const chalkInstance = ChalkUtils.getChalkInstance();
    return this.formatMessage(
      '!',
      '!',
      chalkInstance.yellow.bold,
      'WARNING',
      chalkInstance.yellow.bold,
      message
    );
  }

  /**
   * Creates logger-style info formatting
   */
  static formatInfo(message: string): string {
    const chalkInstance = ChalkUtils.getChalkInstance();
    return this.formatMessage(
      'ℹ',
      'i',
      chalkInstance.blue.bold,
      'INFO',
      chalkInstance.blue.bold,
      message
    );
  }

  /**
   * Creates logger-style debug formatting
   */
  static formatDebug(message: string): string {
    const chalkInstance = ChalkUtils.getChalkInstance();
    return this.formatMessage(
      '?',
      '?',
      chalkInstance.gray,
      'DEBUG',
      chalkInstance.gray,
      message,
      chalkInstance.gray
    );
  }

  /**
   * Get safe fallback symbols for different log levels
   */
  static getLogSymbols(): Record<
    string,
    { unicode: string; fallback: string; color: ColorFunction }
  > {
    const chalkInstance = ChalkUtils.getChalkInstance();
    return {
      error: { unicode: '✗', fallback: 'X', color: chalkInstance.red.bold },
      warn: { unicode: '!', fallback: '!', color: chalkInstance.yellow.bold },
      info: { unicode: 'ℹ', fallback: 'i', color: chalkInstance.blue.bold },
      debug: { unicode: '?', fallback: '?', color: chalkInstance.gray },
      trace: { unicode: '•', fallback: '.', color: chalkInstance.gray },
      success: { unicode: '✓', fallback: '+', color: chalkInstance.green.bold },
      help: { unicode: '💡', fallback: 'i', color: chalkInstance.green },
    };
  }
}
