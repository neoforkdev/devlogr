import chalk from 'chalk';
import { LogConfiguration } from '../config';

/**
 * Centralized chalk utility that handles DevLogR's smart color detection.
 * This ensures consistent color behavior across all components by overriding
 * chalk's conservative CI detection with DevLogR's intelligent logic.
 */
export class ChalkUtils {
  private static cachedInstance: any = null;
  private static lastUseColors: boolean | null = null;

  /**
   * Gets the appropriate chalk instance based on DevLogR's color configuration.
   * This method caches the instance and only recreates it when color settings change.
   *
   * @param useColors - Optional override for color usage. If not provided, uses current config.
   * @returns Chalk instance with proper color detection
   */
  static getChalkInstance(useColors?: boolean): any {
    // Get current color setting
    const currentUseColors = useColors ?? LogConfiguration.getConfig().useColors;

    // Return cached instance if settings haven't changed
    if (this.cachedInstance && this.lastUseColors === currentUseColors) {
      return this.cachedInstance;
    }

    // Create new instance based on color settings
    this.cachedInstance = this.createChalkInstance(currentUseColors);
    this.lastUseColors = currentUseColors;

    return this.cachedInstance;
  }

  /**
   * Creates a new chalk instance with proper color detection override.
   *
   * @param useColors - Whether colors should be enabled
   * @returns Chalk instance with appropriate color level
   */
  private static createChalkInstance(useColors: boolean): any {
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
   * Convenience method to get a colored string using DevLogR's color detection.
   *
   * @param text - Text to colorize
   * @param colorName - Name of the color function (e.g., 'red', 'green', 'blue')
   * @param useColors - Optional override for color usage
   * @returns Colored or plain text based on color detection
   */
  static colorize(text: string, colorName: string, useColors?: boolean): string {
    const chalkInstance = this.getChalkInstance(useColors);
    const colorFn = chalkInstance[colorName];

    if (typeof colorFn === 'function') {
      return colorFn(text);
    }

    // Fallback to plain text if color function doesn't exist
    return text;
  }

  /**
   * Clear the cached chalk instance. Useful for testing or when configuration changes.
   */
  static clearCache(): void {
    this.cachedInstance = null;
    this.lastUseColors = null;
  }
}
