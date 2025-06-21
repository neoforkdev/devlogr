/**
 * Comprehensive Unicode emoji detection and handling utilities
 * Based on Unicode 15.1 specification with support for complex sequences
 */
export class EmojiUtils {
  // Comprehensive Unicode emoji detection based on Unicode 15.1 specification
  private static readonly EMOJI_RANGES = [
    // Emoticons (U+1F600-1F64F)
    [0x1F600, 0x1F64F],
    // Miscellaneous Symbols and Pictographs (U+1F300-1F5FF)
    [0x1F300, 0x1F5FF],
    // Transport and Map Symbols (U+1F680-1F6FF)
    [0x1F680, 0x1F6FF],
    // Alchemical Symbols (U+1F700-1F77F)
    [0x1F700, 0x1F77F],
    // Geometric Shapes Extended (U+1F780-1F7FF)
    [0x1F780, 0x1F7FF],
    // Supplemental Arrows-C (U+1F800-1F8FF)
    [0x1F800, 0x1F8FF],
    // Supplemental Symbols and Pictographs (U+1F900-1F9FF)
    [0x1F900, 0x1F9FF],
    // Chess Symbols (U+1FA00-1FA6F)
    [0x1FA00, 0x1FA6F],
    // Symbols and Pictographs Extended-A (U+1FA70-1FAFF)
    [0x1FA70, 0x1FAFF],
    // Miscellaneous Symbols (U+2600-26FF)
    [0x2600, 0x26FF],
    // Dingbats (U+2700-27BF)
    [0x2700, 0x27BF],
    // Miscellaneous Technical (partial, contains some emoji)
    [0x2300, 0x23FF],
    // Enclosed Alphanumerics (U+2460-24FF)
    [0x2460, 0x24FF],
    // Geometric Shapes (U+25A0-25FF)
    [0x25A0, 0x25FF],
    // Miscellaneous Symbols and Arrows (U+2B00-2BFF)
    [0x2B00, 0x2BFF],
    // CJK Symbols and Punctuation (partial)
    [0x3030, 0x3030], // 〰️
    [0x303D, 0x303D], // 〽️
    // Enclosed CJK Letters and Months (U+3200-32FF)
    [0x3200, 0x32FF],
    // Enclosed Ideographic Supplement (U+1F200-1F2FF)
    [0x1F200, 0x1F2FF],
    // Regional Indicator Symbols (U+1F1E6-1F1FF) - for flags
    [0x1F1E6, 0x1F1FF],
    // Tags (U+E0020-E007F) - for emoji tag sequences
    [0xE0020, 0xE007F],
  ];

  // Skin tone modifiers
  private static readonly SKIN_TONE_MODIFIERS = [
    0x1F3FB, // Light skin tone
    0x1F3FC, // Medium-light skin tone
    0x1F3FD, // Medium skin tone
    0x1F3FE, // Medium-dark skin tone
    0x1F3FF, // Dark skin tone
  ];

  // Zero Width Joiner and Variation Selectors
  private static readonly ZWJ = 0x200D; // Zero Width Joiner
  private static readonly VARIATION_SELECTOR_15 = 0xFE0E; // Text presentation
  private static readonly VARIATION_SELECTOR_16 = 0xFE0F; // Emoji presentation
  
  // Keycap sequence components
  private static readonly KEYCAP_COMBINING_MARK = 0x20E3;

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
  private static isEmojiSequence(text: string, startIndex: number): { isEmoji: boolean; length: number } {
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
      return pos + (cp && cp > 0xFFFF ? 2 : 1);
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
      if (codePoint >= 0x1F1E6 && codePoint <= 0x1F1FF) {
        const nextIndex = advanceByCodePoint(index);
        const nextCodePoint = getCodePoint(nextIndex);
        
        // Check if this is a valid flag sequence (two regional indicators)
        if (nextCodePoint && nextCodePoint >= 0x1F1E6 && nextCodePoint <= 0x1F1FF) {
          hasEmoji = true;
          sequenceLength = advanceByCodePoint(nextIndex) - startIndex;
          break;
        }
      }

      // Keycap sequences (like 1️⃣, 2️⃣, etc.)
      if ((codePoint >= 0x30 && codePoint <= 0x39) || // 0-9
          codePoint === 0x23 || codePoint === 0x2A) { // # or *
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
          index += codePoint > 0xFFFF ? 2 : 1;
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
      'Windows Terminal'
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

    // Check if we're in a TTY (emoji makes sense in interactive contexts)
    if (!process.stdout.isTTY) {
      return false;
    }

    // Default to true for modern environments
    return true;
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