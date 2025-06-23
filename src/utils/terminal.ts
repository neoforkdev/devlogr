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
  private static isCI(): boolean {
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
      process.env.DRONE
    );
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
      plain: '',
    };
  }
}
