import chalk, { ChalkInstance } from 'chalk';

/**
 * Centralized chalk utility that handles color override logic
 */
export class ChalkUtils {
  private static cachedChalk: ChalkInstance;
  private static lastColorSetting: boolean | undefined;

  /**
   * Gets a chalk instance with appropriate color override logic
   */
  static getChalkInstance(useColors?: boolean): ChalkInstance {
    // Get current color setting, with fallback if LogConfiguration is not available
    let currentUseColors: boolean;
    try {
      const { LogConfiguration } = require('../config');
      currentUseColors = useColors ?? LogConfiguration.getConfig().useColors;
    } catch {
      // Fallback if LogConfiguration is not available during initialization
      currentUseColors = useColors ?? true;
    }

    // Return cached instance if settings haven't changed
    if (this.cachedChalk && this.lastColorSetting === currentUseColors) {
      return this.cachedChalk;
    }

    // Store new settings
    this.lastColorSetting = currentUseColors;

    // If colors are explicitly disabled, return chalk with no color support
    if (!currentUseColors) {
      this.cachedChalk = new chalk.Instance({ level: 0 });
      return this.cachedChalk;
    }

    // If chalk is being conservative (level 0) but we want colors, override it
    if (chalk.level === 0 && currentUseColors) {
      // Force basic color support (level 1) to override chalk's conservative behavior
      this.cachedChalk = new chalk.Instance({ level: 1 });
      return this.cachedChalk;
    }

    // Use default chalk instance
    this.cachedChalk = chalk;
    return this.cachedChalk;
  }

  /**
   * Convenience method to colorize text with a specific style
   */
  static colorize(text: string, style: string, useColors?: boolean): string {
    const chalkInstance = this.getChalkInstance(useColors);

    // Handle common styles
    switch (style) {
      case 'dim':
        return chalkInstance.dim(text);
      case 'bold':
        return chalkInstance.bold(text);
      case 'red':
        return chalkInstance.red(text);
      case 'green':
        return chalkInstance.green(text);
      case 'yellow':
        return chalkInstance.yellow(text);
      case 'blue':
        return chalkInstance.blue(text);
      case 'magenta':
        return chalkInstance.magenta(text);
      case 'cyan':
        return chalkInstance.cyan(text);
      case 'white':
        return chalkInstance.white(text);
      case 'gray':
        return chalkInstance.gray(text);
      default:
        return text;
    }
  }
}
