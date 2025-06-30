/**
 * Emoji utilities for terminal output with automatic detection.
 */
export class EmojiUtils {
  private static readonly EMOJI_REGEX =
    /(?:[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E6}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]|[\u{FE0F}]|[\u{200D}]|[\u{2190}-\u{21FF}]|[\u{2000}-\u{206F}]|[\u{2070}-\u{209F}]|[\u{20A0}-\u{20CF}]|[\u{2100}-\u{214F}]|[\u{2150}-\u{218F}]|[\u{2460}-\u{24FF}]|[\u{2500}-\u{257F}]|[\u{2580}-\u{259F}]|[\u{25A0}-\u{25FF}]|[\u{2B00}-\u{2BFF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F1FF}]|[\u{1F200}-\u{1F2FF}]|[\u{1F300}-\u{1F5FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}])+/gu;

  private static processEmojisAndFixSpaces(input: string): string {
    return input.replace(this.EMOJI_REGEX, ' ').replace(/\s+/g, ' ').trim();
  }

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
    return this.supportsEmoji() ? full : this.processEmojisAndFixSpaces(full);
  }

  static format(text: string): string {
    return this.supportsEmoji() ? text : this.processEmojisAndFixSpaces(text);
  }

  static forceStripEmojis(text: string): string {
    return this.processEmojisAndFixSpaces(text);
  }
}
