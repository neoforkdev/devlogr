import { LogTheme } from './types';
import { TerminalUtils } from './utils';
import { LogConfiguration } from './config';
import { ChalkUtils } from './utils/chalk';

// ============================================================================
// THEME MANAGEMENT
// ============================================================================

export class ThemeProvider {
  /**
   * Gets the default themes with proper chalk instance
   */
  private static getDefaultThemes(): Record<string, LogTheme> {
    const chalkInstance = ChalkUtils.getChalkInstance();
    return {
      error: { symbol: '✗', color: chalkInstance.red, label: 'ERROR' },
      warn: { symbol: '!', color: chalkInstance.yellow, label: 'WARN' },
      info: { symbol: 'i', color: chalkInstance.cyan, label: 'INFO' },
      debug: { symbol: '?', color: chalkInstance.gray, label: 'DEBUG' },
      trace: { symbol: '•', color: chalkInstance.gray, label: 'TRACE' },
      success: { symbol: '✓', color: chalkInstance.green, label: 'SUCCESS' },
      title: { symbol: '●', color: chalkInstance.magenta, label: 'TITLE' },
      task: { symbol: '→', color: chalkInstance.white, label: 'TASK' },
      plain: { symbol: ' ', color: chalkInstance.white, label: 'PLAIN' },
    };
  }

  /**
   * Gets theme for specified log level with optional customization.
   * Automatically handles icon visibility based on global configuration.
   */
  static getTheme(
    level: string,
    customThemes?: Record<string, Partial<LogTheme>>,
    supportsUnicode = true
  ): LogTheme {
    const defaultThemes = this.getDefaultThemes();
    const defaultTheme = defaultThemes[level];
    const customTheme = customThemes?.[level];

    if (!defaultTheme) {
      throw new Error(`Unknown log level: ${level}`);
    }

    // Get current configuration to determine icon visibility and color support
    const config = LogConfiguration.getConfig();
    const showIcons = config.showIcons;
    const useColors = config.useColors;

    // Get appropriate symbol based on Unicode support and icon visibility
    const symbol = this.getSymbol(level, customTheme?.symbol, supportsUnicode, showIcons);

    // Get color function using centralized chalk utility
    const colorFn = this.getColorFunction(level, customTheme?.color, useColors);

    return {
      symbol,
      color: colorFn,
      label: customTheme?.label ?? defaultTheme.label,
    };
  }

  /**
   * Gets the color function for a specific level using centralized chalk utility
   */
  private static getColorFunction(level: string, customColor?: any, useColors?: boolean) {
    if (customColor) {
      return customColor;
    }

    const chalkInstance = ChalkUtils.getChalkInstance(useColors);

    // Map level to color function using the centralized chalk instance
    switch (level) {
      case 'error':
        return chalkInstance.red;
      case 'warn':
        return chalkInstance.yellow;
      case 'info':
        return chalkInstance.cyan;
      case 'debug':
        return chalkInstance.gray;
      case 'trace':
        return chalkInstance.gray;
      case 'success':
        return chalkInstance.green;
      case 'title':
        return chalkInstance.magenta;
      case 'task':
        return chalkInstance.white;
      case 'plain':
        return chalkInstance.white;
      default:
        return chalkInstance.white;
    }
  }

  /**
   * Gets appropriate symbol based on Unicode support and icon visibility
   */
  private static getSymbol(
    level: string,
    customSymbol?: string,
    supportsUnicode = true,
    showIcons = true
  ): string {
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
      const fallbackSymbols = TerminalUtils.getFallbackSymbols();
      return fallbackSymbols[level] || '';
    }

    // Use Unicode symbols
    const defaultThemes = this.getDefaultThemes();
    const defaultTheme = defaultThemes[level];
    return defaultTheme?.symbol || '';
  }

  /**
   * Gets all available theme names
   */
  static getAvailableThemes(): string[] {
    return Object.keys(this.getDefaultThemes());
  }

  /**
   * Gets fallback theme without Unicode symbols
   */
  static getFallbackTheme(level: string): LogTheme {
    return this.getTheme(level, undefined, false);
  }
}
