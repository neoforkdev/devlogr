'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.EmojiUtils = void 0;
/**
 * Emoji detection and handling utilities for terminal output.
 * Automatically detects terminal support and provides fallbacks.
 */
class EmojiUtils {
  /**
   * Simple and reliable emoji stripping with space handling
   */
  static stripEmojisAndFixSpaces(input) {
    return input
      .replace(this.EMOJI_REGEX, ' ') // Replace emojis with space
      .replace(/\s+/g, ' ') // Normalize multiple spaces
      .trim(); // Clean up edges
  }
  /**
   * Check if the current terminal supports emoji display.
   *
   * @returns True if emoji should be displayed, false otherwise
   */
  static supportsEmoji() {
    // Explicit disable via environment variables (check global standards first)
    if (process.env.NO_COLOR !== undefined || process.env.NO_EMOJI !== undefined) {
      return false;
    }
    // Check devlogr-specific disable flags
    if (process.env.DEVLOGR_NO_COLOR || process.env.DEVLOGR_NO_EMOJI) {
      return false;
    }
    // Explicit force enable for testing and CI environments
    if (process.env.DEVLOGR_FORCE_COLOR || process.env.FORCE_COLOR) {
      return true;
    }
    // Check terminal capabilities - simplified logic
    const termProgram = process.env.TERM_PROGRAM || '';
    const colorTerm = process.env.COLORTERM || '';
    const term = process.env.TERM || '';
    // Known emoji-supporting terminals
    const emojiTerminals = ['iTerm.app', 'Apple_Terminal', 'vscode', 'hyper', 'Windows Terminal'];
    if (emojiTerminals.includes(termProgram)) {
      return true;
    }
    // Modern terminal indicators
    if (colorTerm === 'truecolor' || term.includes('256color')) {
      return true;
    }
    // Platform defaults
    if (process.platform === 'darwin') {
      return true; // macOS generally supports emoji well
    }
    if (process.platform === 'win32' && (process.env.WT_SESSION || process.env.WSLENV)) {
      return true; // Windows Terminal or WSL
    }
    // CI environments often support emojis
    if (this.isCI()) {
      return true;
    }
    // Must be interactive to make sense
    return process.stdout.isTTY;
  }
  /**
   * Simple CI detection
   */
  static isCI() {
    return !!(
      process.env.CI ||
      process.env.GITHUB_ACTIONS ||
      process.env.GITLAB_CI ||
      process.env.CIRCLECI ||
      process.env.TRAVIS
    );
  }
  /**
   * Template literal function for conditional emoji display.
   *
   * @param strings - Template literal strings
   * @param values - Template literal values
   * @returns Text with emoji if supported, or text with emoji stripped
   */
  static emoji(strings, ...values) {
    const full = strings.reduce((acc, str, i) => acc + str + (values[i] ?? ''), '');
    return this.supportsEmoji() ? full : this.stripEmojisAndFixSpaces(full);
  }
  /**
   * Format text with conditional emoji support.
   *
   * @param text - Text that may contain emoji
   * @returns Text with emoji if supported, or text with emoji stripped
   */
  static format(text) {
    return this.supportsEmoji() ? text : this.stripEmojisAndFixSpaces(text);
  }
  /**
   * Remove emoji from text regardless of terminal support.
   *
   * @param text - Text that may contain emoji
   * @returns Text with all emoji removed
   */
  static forceStripEmojis(text) {
    return this.stripEmojisAndFixSpaces(text);
  }
}
exports.EmojiUtils = EmojiUtils;
// Improved emoji detection regex - covers more symbols while staying simple
// This covers the vast majority of emoji use cases without complex Unicode parsing
EmojiUtils.EMOJI_REGEX =
  /(?:[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E6}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]|[\u{FE0F}]|[\u{200D}]|[\u{2190}-\u{21FF}]|[\u{2000}-\u{206F}]|[\u{2070}-\u{209F}]|[\u{20A0}-\u{20CF}]|[\u{2100}-\u{214F}]|[\u{2150}-\u{218F}]|[\u{2460}-\u{24FF}]|[\u{2500}-\u{257F}]|[\u{2580}-\u{259F}]|[\u{25A0}-\u{25FF}]|[\u{2B00}-\u{2BFF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F1FF}]|[\u{1F200}-\u{1F2FF}]|[\u{1F300}-\u{1F5FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}])+/gu;
