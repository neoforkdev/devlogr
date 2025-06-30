/**
 * Terminal capability detection utilities for cross-platform compatibility.
 * Automatically detects color, Unicode, and other terminal features.
 */
export class TerminalUtils {
  /**
   * Check if the current terminal supports Unicode characters.
   *
   * @returns True if Unicode symbols can be displayed, false otherwise
   */
  static supportsUnicode(): boolean {
    // Check environment variables that indicate Unicode support
    const locale = process.env.LC_ALL || process.env.LC_CTYPE || process.env.LANG || '';
    const term = process.env.TERM || '';
    const termProgram = process.env.TERM_PROGRAM || '';

    // Check for global NO_UNICODE (not an official standard but some tools use it)
    // or explicit devlogr-specific disable
    if (process.env.NO_UNICODE !== undefined || process.env.DEVLOGR_NO_UNICODE === 'true') {
      return false;
    }

    // If explicitly enabled
    if (
      process.env.DEVLOGR_UNICODE === 'true' ||
      process.env.DEVLOGR_FORCE_COLOR ||
      process.env.FORCE_COLOR
    ) {
      return true;
    }

    // Check for UTF-8 in locale
    if (locale.toLowerCase().includes('utf-8') || locale.toLowerCase().includes('utf8')) {
      return true;
    }

    // Known Unicode-supporting terminals
    const unicodeTerminals = [
      'iTerm.app',
      'Apple_Terminal',
      'vscode',
      'hyper',
      'terminus',
      'warp',
      'alacritty',
      'kitty',
      'ghostty',
    ];

    if (unicodeTerminals.includes(termProgram)) {
      return true;
    }

    // Known Unicode-supporting TERM values
    const unicodeTerms = [
      'xterm-256color',
      'screen-256color',
      'tmux-256color',
      'alacritty',
      'kitty',
    ];

    if (unicodeTerms.some(t => term.includes(t))) {
      return true;
    }

    // Windows Terminal and PowerShell
    if (process.platform === 'win32') {
      if (termProgram === 'Windows Terminal' || process.env.WT_SESSION) {
        return true;
      }
      // PowerShell 7+ generally supports Unicode
      if (process.env.PSModulePath && !process.env.PROCESSOR_ARCHITEW6432) {
        return true;
      }
    }

    // CI environments often support Unicode
    if (this.isCI()) {
      return true;
    }

    // Default to false for maximum compatibility
    return false;
  }

  /**
   * Check if the current terminal supports ANSI color codes.
   *
   * @returns True if colors can be displayed, false otherwise
   */
  static supportsColor(): boolean {
    // Check global standards first (NO_COLOR is the established standard)
    // According to NO_COLOR standard, any value (including empty string) should disable
    if (process.env.NO_COLOR !== undefined) {
      return false;
    }

    // Check devlogr-specific disable flag
    if (process.env.DEVLOGR_NO_COLOR) {
      return false;
    }

    const term = process.env.TERM || '';

    // Check TERM variable for dumb terminal (always disables colors, even if forced)
    if (term === 'dumb') {
      return false;
    }

    // Check if explicitly enabled (global standards first)
    if (process.env.FORCE_COLOR || process.env.DEVLOGR_FORCE_COLOR) {
      return true;
    }

    const termProgram = process.env.TERM_PROGRAM || '';

    // Known color-supporting terminals
    const colorTerminals = [
      'iTerm.app',
      'Apple_Terminal',
      'vscode',
      'hyper',
      'terminus',
      'warp',
      'alacritty',
      'kitty',
      'ghostty',
    ];

    if (colorTerminals.includes(termProgram)) {
      return true;
    }

    const colorTerms = ['color', '256color', 'truecolor', 'xterm', 'screen', 'tmux', 'ansi'];

    if (colorTerms.some(t => term.includes(t))) {
      return true;
    }

    // Windows-specific checks
    if (process.platform === 'win32') {
      // Windows Terminal
      if (termProgram === 'Windows Terminal' || process.env.WT_SESSION) {
        return true;
      }
      // ConEmu
      if (process.env.ConEmuANSI === 'ON') {
        return true;
      }
      // Windows 10+ with ANSI support (check via release info)
      const release = process.platform === 'win32' ? process.env.OS : '';
      if (release && process.env.PROCESSOR_ARCHITEW6432 !== undefined) {
        return true; // Modern Windows likely supports colors
      }
    }

    // CI environments often support colors even without TTY (but respect dumb terminal)
    if (this.isCI() && term !== 'dumb') {
      return true;
    }

    // Check if we're in a TTY
    if (!process.stdout.isTTY) {
      return false;
    }

    // Default to true for most modern terminals
    return true;
  }

  /**
   * Detects if we're running in a CI environment
   */
  static isCI(): boolean {
    return !!(
      process.env.CI ||
      process.env.CONTINUOUS_INTEGRATION ||
      process.env.BUILD_NUMBER ||
      process.env.GITHUB_ACTIONS ||
      process.env.GITLAB_CI ||
      process.env.CIRCLECI ||
      process.env.TRAVIS ||
      process.env.JENKINS_URL ||
      process.env.BUILDKITE ||
      process.env.DRONE ||
      process.env.TEAMCITY_VERSION ||
      process.env.TF_BUILD ||
      process.env.APPVEYOR ||
      process.env.CODEBUILD_BUILD_ID ||
      process.env.NETLIFY ||
      process.env.VERCEL
    );
  }

  /**
   * Get CI-optimized configuration for better log readability in CI environments.
   *
   * CI environments benefit from:
   * - Prefixes for better log identification
   * - Timestamps for debugging and correlation
   * - No icons to avoid Unicode issues in some CI systems
   * - Dynamic color/emoji support based on CI capabilities
   *
   * Can be disabled via DEVLOGR_DISABLE_CI_DETECTION environment variable.
   *
   * @returns CI-specific configuration overrides
   */
  static getCIConfig(): {
    showPrefix: boolean;
    showTimestamp: boolean;
    showIcons: boolean;
    showEmojis: boolean;
    useColors: boolean;
    supportsEmoji: boolean;
  } {
    // Check if CI detection is disabled
    if (process.env.DEVLOGR_DISABLE_CI_DETECTION === 'true') {
      // Return default (non-CI) behavior when disabled
      return {
        showPrefix: false,
        showTimestamp: false,
        showIcons: true,
        showEmojis: true, // Default to showing emojis when not in CI
        useColors: this.supportsColor(), // Keep dynamic color detection
        supportsEmoji: this.supportsEmoji(), // Keep dynamic emoji detection
      };
    }

    const isCI = this.isCI();

    return {
      showPrefix: isCI,
      showTimestamp: isCI,
      showIcons: !isCI, // Disable icons in CI for better compatibility
      showEmojis: !isCI, // Disable emojis in CI for better compatibility
      useColors: this.supportsColor(), // Keep dynamic color detection
      supportsEmoji: this.supportsEmoji(), // Keep dynamic emoji detection
    };
  }

  /**
   * Detects if the current environment supports emoji characters.
   *
   * @returns True if emoji can be displayed, false otherwise
   */
  static supportsEmoji(): boolean {
    // Check for explicit disable flags
    if (process.env.NO_EMOJI !== undefined || process.env.DEVLOGR_NO_EMOJI === 'true') {
      return false;
    }

    // If explicitly enabled
    if (process.env.DEVLOGR_EMOJI === 'true') {
      return true;
    }

    // CI environments: let dynamic detection decide
    if (this.isCI()) {
      // Most modern CI systems support emoji, but let Unicode detection decide
      return this.supportsUnicode();
    }

    // For non-CI environments, check Unicode support
    return this.supportsUnicode();
  }

  /**
   * Get ASCII fallback symbols for terminals that don't support Unicode.
   *
   * @returns Object mapping log levels to ASCII symbols
   */
  static getFallbackSymbols(): Record<string, string> {
    return {
      error: 'X',
      warn: '!',
      info: 'i',
      debug: '?',
      trace: '.',
      success: '+',
      title: '*',
      task: '>',
      plain: ' ',
    };
  }
}
