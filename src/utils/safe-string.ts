import { TerminalUtils } from './terminal';
import { EmojiUtils } from './emoji';
import chalk from 'chalk';

// Simple type for color functions
type ColorFunction = (text: string) => string;

/**
 * Safe string utilities that respect logger conventions
 * Simplified approach following KISS principle - removed premature optimization
 */
export class SafeStringUtils {
  /**
   * Reset cached values (no-op for compatibility with tests)
   */
  static resetCache(): void {
    // No-op since we removed caching for simplicity
  }

  /**
   * Creates a safe string with appropriate color styling
   */
  static color(text: string, colorFn: ColorFunction): string {
    return TerminalUtils.supportsColor() ? colorFn(text) : text;
  }

  /**
   * Creates a safe symbol that works across all terminals
   */
  static symbol(unicodeSymbol: string, fallback: string): string {
    return TerminalUtils.supportsUnicode() ? unicodeSymbol : fallback;
  }

  /**
   * Creates a safe emoji string
   */
  static emoji(text: string): string {
    return EmojiUtils.supportsEmoji() ? text : EmojiUtils.format(text);
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
    const errorLabel = this.safe('error', chalk.red.bold);
    const typeText = this.safe(type);
    const messageText = this.safe(message);

    let result = `${errorLabel}: ${typeText}\n${messageText}`;

    if (suggestion) {
      const helpLabel = this.safe('help', chalk.green);
      const suggestionText = this.safe(suggestion, chalk.green);
      result += `\n${helpLabel}: ${suggestionText}`;
    }

    return result;
  }

  /**
   * Creates logger-style warning formatting
   */
  static formatWarning(message: string): string {
    return this.formatMessage('!', '!', chalk.yellow.bold, 'WARNING', chalk.yellow.bold, message);
  }

  /**
   * Creates logger-style info formatting
   */
  static formatInfo(message: string): string {
    return this.formatMessage('ℹ', 'i', chalk.blue.bold, 'INFO', chalk.blue.bold, message);
  }

  /**
   * Creates logger-style debug formatting
   */
  static formatDebug(message: string): string {
    return this.formatMessage('?', '?', chalk.gray, 'DEBUG', chalk.gray, message, chalk.gray);
  }

  /**
   * Get safe fallback symbols for different log levels
   */
  static getLogSymbols(): Record<
    string,
    { unicode: string; fallback: string; color: ColorFunction }
  > {
    return {
      error: { unicode: '✗', fallback: 'X', color: chalk.red.bold },
      warn: { unicode: '!', fallback: '!', color: chalk.yellow.bold },
      info: { unicode: 'ℹ', fallback: 'i', color: chalk.blue.bold },
      debug: { unicode: '?', fallback: '?', color: chalk.gray },
      trace: { unicode: '•', fallback: '.', color: chalk.gray },
      success: { unicode: '✓', fallback: '+', color: chalk.green.bold },
      help: { unicode: '💡', fallback: 'i', color: chalk.green },
    };
  }
}
