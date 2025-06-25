'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.ThemeProvider = void 0;
const chalk_1 = __importDefault(require('chalk'));
const utils_1 = require('./utils');
const config_1 = require('./config');
// ============================================================================
// THEME MANAGEMENT
// ============================================================================
class ThemeProvider {
  /**
   * Gets theme for specified log level with optional customization.
   * Automatically handles icon visibility based on global configuration.
   */
  static getTheme(level, customThemes, supportsUnicode = true) {
    const defaultTheme = this.DEFAULT_THEMES[level];
    const customTheme = customThemes?.[level];
    if (!defaultTheme) {
      throw new Error(`Unknown log level: ${level}`);
    }
    // Get current configuration to determine icon visibility
    const config = config_1.LogConfiguration.getConfig();
    const showIcons = config.showIcons;
    // Get appropriate symbol based on Unicode support and icon visibility
    const symbol = this.getSymbol(level, customTheme?.symbol, supportsUnicode, showIcons);
    return {
      symbol,
      color: customTheme?.color ?? defaultTheme.color,
      label: customTheme?.label ?? defaultTheme.label,
    };
  }
  /**
   * Gets appropriate symbol based on Unicode support and icon visibility
   */
  static getSymbol(level, customSymbol, supportsUnicode = true, showIcons = true) {
    // If icons are disabled, return empty string
    if (!showIcons) {
      return '';
    }
    // If custom symbol is provided, use it as-is
    if (customSymbol !== undefined) {
      return customSymbol;
    }
    // If Unicode is not supported, use fallback symbols
    if (!supportsUnicode) {
      const fallbackSymbols = utils_1.TerminalUtils.getFallbackSymbols();
      return fallbackSymbols[level] || '';
    }
    // Use Unicode symbols
    const defaultTheme = this.DEFAULT_THEMES[level];
    return defaultTheme?.symbol || '';
  }
  /**
   * Gets all available theme names
   */
  static getAvailableThemes() {
    return Object.keys(this.DEFAULT_THEMES);
  }
  /**
   * Gets fallback theme without Unicode symbols
   */
  static getFallbackTheme(level) {
    return this.getTheme(level, undefined, false);
  }
}
exports.ThemeProvider = ThemeProvider;
ThemeProvider.DEFAULT_THEMES = {
  error: { symbol: '✗', color: chalk_1.default.red, label: 'ERROR' },
  warn: { symbol: '!', color: chalk_1.default.yellow, label: 'WARN' },
  info: { symbol: 'i', color: chalk_1.default.cyan, label: 'INFO' },
  debug: { symbol: '?', color: chalk_1.default.gray, label: 'DEBUG' },
  trace: { symbol: '•', color: chalk_1.default.gray, label: 'TRACE' },
  success: { symbol: '✓', color: chalk_1.default.green, label: 'SUCCESS' },
  title: { symbol: '●', color: chalk_1.default.magenta, label: 'TITLE' },
  task: { symbol: '→', color: chalk_1.default.white, label: 'TASK' },
  plain: { symbol: '', color: chalk_1.default.white, label: 'PLAIN' },
};
