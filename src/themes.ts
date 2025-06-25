import chalk from 'chalk';
import { LogTheme } from './types';
import { TerminalUtils } from './utils';
import { LogConfiguration } from './config';

// ============================================================================
// THEME MANAGEMENT
// ============================================================================

export class ThemeProvider {
  private static readonly DEFAULT_THEMES: Record<string, LogTheme> = {
    error: { symbol: '✗', color: chalk.red, label: 'ERROR' },
    warn: { symbol: '!', color: chalk.yellow, label: 'WARN' },
    info: { symbol: 'i', color: chalk.cyan, label: 'INFO' },
    debug: { symbol: '?', color: chalk.gray, label: 'DEBUG' },
    trace: { symbol: '•', color: chalk.gray, label: 'TRACE' },
    success: { symbol: '✓', color: chalk.green, label: 'SUCCESS' },
    title: { symbol: '●', color: chalk.magenta, label: 'TITLE' },
    task: { symbol: '→', color: chalk.white, label: 'TASK' },
    plain: { symbol: ' ', color: chalk.white, label: 'PLAIN' },
  };

  /**
   * Gets theme for specified log level with optional customization.
   * Automatically handles icon visibility based on global configuration.
   */
  static getTheme(
    level: string,
    customThemes?: Record<string, Partial<LogTheme>>,
    supportsUnicode = true
  ): LogTheme {
    const defaultTheme = this.DEFAULT_THEMES[level];
    const customTheme = customThemes?.[level];

    if (!defaultTheme) {
      throw new Error(`Unknown log level: ${level}`);
    }

    // Get current configuration to determine icon visibility and color support
    const config = LogConfiguration.getConfig();
    const showIcons = config.showIcons;
    const useColors = config.useColors;

    // Override chalk's color detection if DevLogR says we should use colors
    // This handles cases where chalk is too conservative (e.g., in CI environments)
    const chalkInstance = this.getChalkInstance(useColors);

    // Get appropriate symbol based on Unicode support and icon visibility
    const symbol = this.getSymbol(level, customTheme?.symbol, supportsUnicode, showIcons);

    // Get color function from the appropriate chalk instance
    const colorFn = this.getColorFunction(chalkInstance, level, customTheme?.color);

    return {
      symbol,
      color: colorFn,
      label: customTheme?.label ?? defaultTheme.label,
    };
  }

  /**
   * Gets the appropriate chalk instance based on color configuration
   */
  private static getChalkInstance(useColors: boolean) {
    if (!useColors) {
      // Return a chalk instance with colors disabled
      return new chalk.Instance({ level: 0 });
    }

    // If colors should be used but chalk doesn't detect support, force it
    if (chalk.level === 0 && useColors) {
      // Force basic color support (level 1)
      return new chalk.Instance({ level: 1 });
    }

    // Use default chalk instance
    return chalk;
  }

  /**
   * Gets the color function for a specific level
   */
  private static getColorFunction(chalkInstance: any, level: string, customColor?: any) {
    if (customColor) {
      return customColor;
    }

    // Map level to color function using the appropriate chalk instance
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
    const defaultTheme = this.DEFAULT_THEMES[level];
    return defaultTheme?.symbol || '';
  }

  /**
   * Gets all available theme names
   */
  static getAvailableThemes(): string[] {
    return Object.keys(this.DEFAULT_THEMES);
  }

  /**
   * Gets fallback theme without Unicode symbols
   */
  static getFallbackTheme(level: string): LogTheme {
    return this.getTheme(level, undefined, false);
  }
}
