/**
 * Comprehensive Unicode emoji detection and handling utilities
 * Based on Unicode 15.1 specification with support for complex sequences
 */
export class EmojiUtils {
  // Comprehensive Unicode emoji detection based on Unicode 15.1 specification
  private static readonly EMOJI_RANGES = [
    // Emoticons (U+1F600-1F64F)
    [0x1f600, 0x1f64f],
    // Miscellaneous Symbols and Pictographs (U+1F300-1F5FF)
    [0x1f300, 0x1f5ff],
    // Transport and Map Symbols (U+1F680-1F6FF)
    [0x1f680, 0x1f6ff],
    // Alchemical Symbols (U+1F700-1F77F)
    [0x1f700, 0x1f77f],
    // Geometric Shapes Extended (U+1F780-1F7FF)
    [0x1f780, 0x1f7ff],
    // Supplemental Arrows-C (U+1F800-1F8FF)
    [0x1f800, 0x1f8ff],
    // Supplemental Symbols and Pictographs (U+1F900-1F9FF)
    [0x1f900, 0x1f9ff],
    // Chess Symbols (U+1FA00-1FA6F)
    [0x1fa00, 0x1fa6f],
    // Symbols and Pictographs Extended-A (U+1FA70-1FAFF)
    [0x1fa70, 0x1faff],
    // Miscellaneous Symbols (U+2600-26FF)
    [0x2600, 0x26ff],
    // Dingbats (U+2700-27BF)
    [0x2700, 0x27bf],
    // Miscellaneous Technical (partial, contains some emoji)
    [0x2300, 0x23ff],
    // Enclosed Alphanumerics (U+2460-24FF)
    [0x2460, 0x24ff],
    // Geometric Shapes (U+25A0-25FF)
    [0x25a0, 0x25ff],
    // Miscellaneous Symbols and Arrows (U+2B00-2BFF)
    [0x2b00, 0x2bff],
    // CJK Symbols and Punctuation (partial)
    [0x3030, 0x3030], // 〰️
    [0x303d, 0x303d], // 〽️
    // Enclosed CJK Letters and Months (U+3200-32FF)
    [0x3200, 0x32ff],
    // Enclosed Ideographic Supplement (U+1F200-1F2FF)
    [0x1f200, 0x1f2ff],
    // Regional Indicator Symbols (U+1F1E6-1F1FF) - for flags
    [0x1f1e6, 0x1f1ff],
    // Tags (U+E0020-E007F) - for emoji tag sequences
    [0xe0020, 0xe007f],
  ];

  // Skin tone modifiers
  private static readonly SKIN_TONE_MODIFIERS = [
    0x1f3fb, // Light skin tone
    0x1f3fc, // Medium-light skin tone
    0x1f3fd, // Medium skin tone
    0x1f3fe, // Medium-dark skin tone
    0x1f3ff, // Dark skin tone
  ];

  // Zero Width Joiner and Variation Selectors
  private static readonly ZWJ = 0x200d; // Zero Width Joiner
  private static readonly VARIATION_SELECTOR_15 = 0xfe0e; // Text presentation
  private static readonly VARIATION_SELECTOR_16 = 0xfe0f; // Emoji presentation

  // Keycap sequence components
  private static readonly KEYCAP_COMBINING_MARK = 0x20e3;

  /**
   * Checks if a code point is in any emoji range
   */
  private static isEmojiCodePoint(codePoint: number): boolean {
    return this.EMOJI_RANGES.some(([start, end]) => codePoint >= start && codePoint <= end);
  }

  /**
   * Checks if a code point is a skin tone modifier
   */
  private static isSkinToneModifier(codePoint: number): boolean {
    return this.SKIN_TONE_MODIFIERS.includes(codePoint);
  }

  /**
   * Checks if a code point is a variation selector
   */
  private static isVariationSelector(codePoint: number): boolean {
    return codePoint === this.VARIATION_SELECTOR_15 || codePoint === this.VARIATION_SELECTOR_16;
  }

  /**
   * Comprehensive emoji detection that handles:
   * - Basic emojis
   * - Skin tone modifiers
   * - ZWJ sequences (complex emojis)
   * - Variation selectors
   * - Keycap sequences
   * - Regional indicator sequences (flags)
   */
  private static isEmojiSequence(
    text: string,
    startIndex: number
  ): { isEmoji: boolean; length: number } {
    let index = startIndex;
    let hasEmoji = false;
    let sequenceLength = 0;

    // Helper to get next code point
    const getCodePoint = (pos: number): number | null => {
      if (pos >= text.length) return null;
      return text.codePointAt(pos) || null;
    };

    // Helper to advance by code point
    const advanceByCodePoint = (pos: number): number => {
      const cp = text.codePointAt(pos);
      return pos + (cp && cp > 0xffff ? 2 : 1);
    };

    while (index < text.length) {
      const codePoint = getCodePoint(index);
      if (codePoint === null) break;

      const isCurrentEmoji = this.isEmojiCodePoint(codePoint);
      const isSkinTone = this.isSkinToneModifier(codePoint);
      const isVarSelector = this.isVariationSelector(codePoint);
      const isZWJ = codePoint === this.ZWJ;
      const isKeycap = codePoint === this.KEYCAP_COMBINING_MARK;

      // If we encounter an emoji code point
      if (isCurrentEmoji) {
        hasEmoji = true;
        const nextIndex = advanceByCodePoint(index);
        sequenceLength = nextIndex - startIndex;
        index = nextIndex;
        continue;
      }

      // If we have an emoji and encounter modifiers/joiners, continue
      if (hasEmoji && (isSkinTone || isVarSelector || isZWJ || isKeycap)) {
        const nextIndex = advanceByCodePoint(index);
        sequenceLength = nextIndex - startIndex;
        index = nextIndex;
        continue;
      }

      // Regional indicator sequences (flags)
      if (codePoint >= 0x1f1e6 && codePoint <= 0x1f1ff) {
        const nextIndex = advanceByCodePoint(index);
        const nextCodePoint = getCodePoint(nextIndex);

        // Check if this is a valid flag sequence (two regional indicators)
        if (nextCodePoint && nextCodePoint >= 0x1f1e6 && nextCodePoint <= 0x1f1ff) {
          hasEmoji = true;
          sequenceLength = advanceByCodePoint(nextIndex) - startIndex;
          break;
        }
      }

      // Keycap sequences (like 1️⃣, 2️⃣, etc.)
      if (
        (codePoint >= 0x30 && codePoint <= 0x39) || // 0-9
        codePoint === 0x23 ||
        codePoint === 0x2a
      ) {
        // # or *
        const nextIndex = advanceByCodePoint(index);
        const nextCodePoint = getCodePoint(nextIndex);

        if (nextCodePoint === this.VARIATION_SELECTOR_16) {
          const thirdIndex = advanceByCodePoint(nextIndex);
          const thirdCodePoint = getCodePoint(thirdIndex);

          if (thirdCodePoint === this.KEYCAP_COMBINING_MARK) {
            hasEmoji = true;
            sequenceLength = advanceByCodePoint(thirdIndex) - startIndex;
            break;
          }
        }
      }

      // If we don't have an emoji yet and this isn't an emoji-related character, stop
      if (!hasEmoji) {
        break;
      }

      // If we have an emoji but this character doesn't continue the sequence, stop
      break;
    }

    return { isEmoji: hasEmoji, length: Math.max(sequenceLength, hasEmoji ? 1 : 0) };
  }

  /**
   * Comprehensive emoji detection and removal
   */
  private static stripEmojisAndFixSpaces(input: string): string {
    let result = '';
    let index = 0;

    while (index < input.length) {
      const emojiCheck = this.isEmojiSequence(input, index);

      if (emojiCheck.isEmoji) {
        // Skip the entire emoji sequence
        index += emojiCheck.length;
        // Add a space to prevent word concatenation when emoji is removed
        if (result && !result.endsWith(' ')) {
          result += ' ';
        }
      } else {
        // Add the current character
        const codePoint = input.codePointAt(index);
        if (codePoint) {
          result += String.fromCodePoint(codePoint);
          index += codePoint > 0xffff ? 2 : 1;
        } else {
          result += input[index];
          index++;
        }
      }
    }

    // Clean up multiple spaces and trim
    return result.replace(/\s+/g, ' ').trim();
  }

  /**
   * Enhanced emoji support detection with terminal capability analysis
   */
  static supportsEmoji(): boolean {
    // Explicit disable via environment variables (check global standards first)
    // According to NO_COLOR standard, any value (including empty string) should disable
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

    // Check terminal capabilities
    const term = process.env.TERM || '';
    const termProgram = process.env.TERM_PROGRAM || '';
    const colorTerm = process.env.COLORTERM || '';

    // Known emoji-supporting terminals
    const emojiTerminals = [
      'iTerm.app',
      'Apple_Terminal',
      'vscode',
      'hyper',
      'terminus',
      'warp',
      'alacritty',
      'kitty',
      'ghostty',
      'Windows Terminal',
    ];

    if (emojiTerminals.includes(termProgram)) {
      return true;
    }

    // Check for modern terminal indicators
    if (colorTerm === 'truecolor' || term.includes('256color')) {
      return true;
    }

    // Platform-specific checks
    if (process.platform === 'darwin') {
      return true; // macOS generally supports emoji well
    }

    if (process.platform === 'win32') {
      // Windows Terminal or modern Windows
      if (process.env.WT_SESSION || process.env.WSLENV) {
        return true;
      }
    }

    // CI environments often support emojis even without TTY
    if (this.isCI()) {
      return true;
    }

    // Check if we're in a TTY (emoji makes sense in interactive contexts)
    if (!process.stdout.isTTY) {
      return false;
    }

    // Default to true for modern environments
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

  static emoji(strings: TemplateStringsArray, ...values: unknown[]): string {
    const full = strings.reduce((acc, str, i) => acc + str + (values[i] ?? ''), '');
    return this.supportsEmoji() ? full : this.stripEmojisAndFixSpaces(full);
  }

  static format(text: string): string {
    return this.supportsEmoji() ? text : this.stripEmojisAndFixSpaces(text);
  }

  /**
   * Force strip emojis regardless of environment/support detection
   * Used for JSON mode and explicit stripping
   */
  static forceStripEmojis(text: string): string {
    return this.stripEmojisAndFixSpaces(text);
  }
}
