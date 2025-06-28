import { LogTheme } from './types';
import { TerminalUtils } from './utils';
import { LogConfiguration } from './config';
import { ChalkUtils } from './utils/chalk';

// ============================================================================
// THEME MANAGEMENT - SIMPLIFIED
// ============================================================================

/**
 * Simplified ThemeProvider with consolidated theme and color management.
 * Reduces duplication by using centralized color and symbol mapping.
 */
export class ThemeProvider {
  // Centralized theme definitions to reduce duplication
  private static readonly THEME_DEFINITIONS = {
    error: { symbol: '✗', color: 'red', label: 'ERROR' },
    warn: { symbol: '!', color: 'yellow', label: 'WARN' },
    info: { symbol: 'i', color: 'cyan', label: 'INFO' },
    debug: { symbol: '?', color: 'gray', label: 'DEBUG' },
    trace: { symbol: '•', color: 'gray', label: 'TRACE' },
    success: { symbol: '✓', color: 'green', label: 'SUCCESS' },
    title: { symbol: '●', color: 'magenta', label: 'TITLE' },
    task: { symbol: '→', color: 'white', label: 'TASK' },
    plain: { symbol: ' ', color: 'white', label: 'PLAIN' },
  } as const;

  /**
   * Gets theme for specified log level with automatic configuration handling.
   * Simplified to use centralized theme definitions and color mapping.
   */
  static getTheme(
    level: string,
    customThemes?: Record<string, Partial<LogTheme>>,
    supportsUnicode = true
  ): LogTheme {
    const themeDefinition = this.THEME_DEFINITIONS[level as keyof typeof this.THEME_DEFINITIONS];
    if (!themeDefinition) {
      throw new Error(`Unknown log level: ${level}`);
    }

    const customTheme = customThemes?.[level];
    const config = LogConfiguration.getConfig();

    return {
      symbol: this.getSymbol(level, customTheme?.symbol, supportsUnicode, config.showIcons),
      color: this.getColorFunction(themeDefinition.color, customTheme?.color, config.useColors),
      label: customTheme?.label ?? themeDefinition.label,
    };
  }

  /**
   * Gets appropriate symbol based on configuration and Unicode support.
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

    // Use fallback symbols if Unicode is not supported
    if (!supportsUnicode) {
      const fallbackSymbols = TerminalUtils.getFallbackSymbols();
      return fallbackSymbols[level] || '';
    }

    // Use Unicode symbols from theme definitions
    const themeDefinition = this.THEME_DEFINITIONS[level as keyof typeof this.THEME_DEFINITIONS];
    return themeDefinition?.symbol || '';
  }

  /**
   * Gets color function using centralized mapping.
   * Simplified to reduce duplication between ThemeProvider and ChalkUtils.
   */
  private static getColorFunction(
    defaultColorName: string,
    customColor?: (text: string) => string,
    useColors = true
  ): (text: string) => string {
    if (customColor) {
      return customColor;
    }

    // Use ChalkUtils for consistent color handling
    return (text: string) => ChalkUtils.colorize(text, defaultColorName, useColors);
  }

  /**
   * Gets all available theme names.
   */
  static getAvailableThemes(): string[] {
    return Object.keys(this.THEME_DEFINITIONS);
  }

  /**
   * Gets fallback theme without Unicode symbols.
   */
  static getFallbackTheme(level: string): LogTheme {
    return this.getTheme(level, undefined, false);
  }

  private static applyColorToTheme(
    theme: LogTheme,
    colorName: string,
    useColors: boolean
  ): LogTheme {
    const colorFunction = (ChalkUtils as any)[colorName] || ((text: string) => text);
    return {
      ...theme,
      color: useColors ? colorFunction : (text: string) => text,
    };
  }
}
