'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.SafeStringUtils = void 0;
const terminal_1 = require('./terminal');
const emoji_1 = require('./emoji');
const chalk_1 = __importDefault(require('chalk'));
/**
 * Safe string formatting utilities with automatic fallbacks for terminal compatibility.
 * Handles color, Unicode, and emoji formatting with appropriate fallbacks.
 */
class SafeStringUtils {
  /**
   * Apply color styling to text with automatic fallback for unsupported terminals.
   *
   * @param text - Text to colorize
   * @param colorFn - Color function (e.g., chalk.red)
   * @returns Colored text or plain text if colors not supported
   */
  static color(text, colorFn) {
    return terminal_1.TerminalUtils.supportsColor() ? colorFn(text) : text;
  }
  /**
   * Reset cached values (no-op - kept for test compatibility)
   */
  static resetCache() {
    // No-op for test compatibility
  }
  /**
   * Display Unicode symbol with ASCII fallback for unsupported terminals.
   *
   * @param unicodeSymbol - Preferred Unicode symbol
   * @param fallback - ASCII fallback character
   * @returns Unicode symbol or fallback based on terminal support
   */
  static symbol(unicodeSymbol, fallback) {
    return terminal_1.TerminalUtils.supportsUnicode() ? unicodeSymbol : fallback;
  }
  /**
   * Creates a safe emoji string
   */
  static emoji(text) {
    return emoji_1.EmojiUtils.supportsEmoji() ? text : emoji_1.EmojiUtils.format(text);
  }
  /**
   * Creates a safe colored symbol with fallback
   */
  static coloredSymbol(unicodeSymbol, fallback, colorFn) {
    const safeSymbol = this.symbol(unicodeSymbol, fallback);
    const withoutEmojis = this.emoji(safeSymbol);
    return this.color(withoutEmojis, colorFn);
  }
  /**
   * Creates a safe colored text with emoji handling
   */
  static safe(text, colorFn) {
    const withoutEmojis = this.emoji(text);
    return colorFn ? this.color(withoutEmojis, colorFn) : withoutEmojis;
  }
  /**
   * Creates a safe formatted message with prefix, symbol, and content
   */
  static formatMessage(
    symbol,
    symbolFallback,
    symbolColor,
    prefix,
    prefixColor,
    content,
    contentColor
  ) {
    const safeSymbol = this.coloredSymbol(symbol, symbolFallback, symbolColor);
    const safePrefix = this.safe(prefix, prefixColor);
    const safeContent = this.safe(content, contentColor);
    return `${safeSymbol} ${safePrefix}: ${safeContent}`;
  }
  /**
   * Creates logger-style error formatting
   */
  static formatError(type, message, suggestion) {
    const errorLabel = this.safe('error', chalk_1.default.red.bold);
    const typeText = this.safe(type);
    const messageText = this.safe(message);
    let result = `${errorLabel}: ${typeText}\n${messageText}`;
    if (suggestion) {
      const helpLabel = this.safe('help', chalk_1.default.green);
      const suggestionText = this.safe(suggestion, chalk_1.default.green);
      result += `\n${helpLabel}: ${suggestionText}`;
    }
    return result;
  }
  /**
   * Creates logger-style warning formatting
   */
  static formatWarning(message) {
    return this.formatMessage(
      '!',
      '!',
      chalk_1.default.yellow.bold,
      'WARNING',
      chalk_1.default.yellow.bold,
      message
    );
  }
  /**
   * Creates logger-style info formatting
   */
  static formatInfo(message) {
    return this.formatMessage(
      'ℹ',
      'i',
      chalk_1.default.blue.bold,
      'INFO',
      chalk_1.default.blue.bold,
      message
    );
  }
  /**
   * Creates logger-style debug formatting
   */
  static formatDebug(message) {
    return this.formatMessage(
      '?',
      '?',
      chalk_1.default.gray,
      'DEBUG',
      chalk_1.default.gray,
      message,
      chalk_1.default.gray
    );
  }
  /**
   * Get safe fallback symbols for different log levels
   */
  static getLogSymbols() {
    return {
      error: { unicode: '✗', fallback: 'X', color: chalk_1.default.red.bold },
      warn: { unicode: '!', fallback: '!', color: chalk_1.default.yellow.bold },
      info: { unicode: 'ℹ', fallback: 'i', color: chalk_1.default.blue.bold },
      debug: { unicode: '?', fallback: '?', color: chalk_1.default.gray },
      trace: { unicode: '•', fallback: '.', color: chalk_1.default.gray },
      success: { unicode: '✓', fallback: '+', color: chalk_1.default.green.bold },
      help: { unicode: '💡', fallback: 'i', color: chalk_1.default.green },
    };
  }
}
exports.SafeStringUtils = SafeStringUtils;
