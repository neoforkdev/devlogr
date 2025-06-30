import { LogConfiguration } from '../config';

/**
 * Emoji utilities for terminal output with automatic detection.
 */
export class EmojiUtils {
  // More precise emoji regex that excludes useful Unicode symbols like ✓, ✗, ℹ, →, etc.
  private static readonly EMOJI_REGEX =
    /(?:[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E6}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{2640}-\u{2642}]|[\u{2695}]|[\u{26A0}]|[\u{26BD}]|[\u{26BE}]|[\u{26C4}]|[\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}]|[\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2705}]|[\u{270A}]|[\u{270B}]|[\u{2728}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2795}-\u{2797}]|[\u{27B0}]|[\u{27BF}]|[\u{2B1B}]|[\u{2B1C}]|[\u{2B50}]|[\u{2B55}]|🚀|🎉|🌟|💡|⚡|🔥|❤️|💙|💚|💛|💜|🧡|🖤|🤍|🤎|💯|✨)+/gu;

  // Preserve useful Unicode symbols while removing emojis and fixing spaces
  private static processEmojisAndFixSpaces(input: string): string {
    return input
      .replace(this.EMOJI_REGEX, '') // Remove emojis completely
      .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
      .trim(); // Remove leading/trailing spaces
  }

  /**
   * Check if emojis should be shown based on user configuration
   */
  static shouldShowEmojis(): boolean {
    const config = LogConfiguration.getConfig();
    return config.showEmojis;
  }

  /**
   * Check if the terminal supports emoji characters (capability detection)
   * Keeps all the existing CI adaptation and terminal detection logic
   */
  static supportsEmoji(): boolean {
    if (process.env.NO_COLOR !== undefined || process.env.NO_EMOJI !== undefined) {
      return false;
    }

    if (process.env.DEVLOGR_NO_COLOR || process.env.DEVLOGR_NO_EMOJI) {
      return false;
    }

    if (process.env.DEVLOGR_FORCE_COLOR || process.env.FORCE_COLOR) {
      return true;
    }

    const termProgram = process.env.TERM_PROGRAM || '';
    const colorTerm = process.env.COLORTERM || '';
    const term = process.env.TERM || '';

    const emojiTerminals = ['iTerm.app', 'Apple_Terminal', 'vscode', 'hyper', 'Windows Terminal'];

    if (emojiTerminals.includes(termProgram)) {
      return true;
    }

    if (colorTerm === 'truecolor' || term.includes('256color')) {
      return true;
    }

    if (process.platform === 'darwin') {
      return true;
    }

    if (process.platform === 'win32' && (process.env.WT_SESSION || process.env.WSLENV)) {
      return true;
    }

    if (this.isCI()) {
      return true;
    }

    return process.stdout.isTTY;
  }

  private static isCI(): boolean {
    return !!(
      process.env.CI ||
      process.env.GITHUB_ACTIONS ||
      process.env.GITLAB_CI ||
      process.env.CIRCLECI ||
      process.env.TRAVIS
    );
  }

  static emoji(strings: TemplateStringsArray, ...values: unknown[]): string {
    const full = strings.reduce((acc, str, i) => acc + str + (values[i] ?? ''), '');
    return this.shouldShowEmojis() ? full : this.processEmojisAndFixSpaces(full);
  }

  static format(text: string): string {
    return this.shouldShowEmojis() ? text : this.processEmojisAndFixSpaces(text);
  }

  static forceStripEmojis(text: string): string {
    return this.processEmojisAndFixSpaces(text);
  }
}
