/**
 * Terminal capability detection utilities
 * Handles Unicode, color, and other terminal feature detection
 */
export class TerminalUtils {
  /**
   * Checks if the current terminal supports Unicode characters
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
    if (process.env.DEVLOGR_UNICODE === 'true') {
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
      'ghostty'
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
      'kitty'
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
    
    // Default to false for maximum compatibility
    return false;
  }

  /**
   * Checks if the current terminal supports colors
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
    
    // Check if explicitly enabled (global standards first)
    if (process.env.FORCE_COLOR || process.env.DEVLOGR_FORCE_COLOR) {
      return true;
    }
    
    // Check if we're in a TTY
    if (!process.stdout.isTTY) {
      return false;
    }
    
    const term = process.env.TERM || '';
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
      'ghostty'
    ];
    
    if (colorTerminals.includes(termProgram)) {
      return true;
    }
    
    // Check TERM variable for color support
    if (term === 'dumb') {
      return false;
    }
    
    const colorTerms = [
      'color',
      '256color',
      'truecolor',
      'xterm',
      'screen',
      'tmux',
      'ansi'
    ];
    
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
    
    // Default to true for most modern terminals
    return true;
  }

  /**
   * Gets the appropriate fallback symbols for non-Unicode terminals
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