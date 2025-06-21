import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TerminalUtils } from '../src/utils/terminal';
import { EmojiUtils } from '../src/utils/emoji';
import { createLogger } from '../src/logger';

describe('Global Environment Variable Standards', () => {
  // Store original environment variables
  const originalEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    // Save current environment variables
    [
      'NO_COLOR',
      'NO_EMOJI',
      'NO_UNICODE',
      'FORCE_COLOR',
      'DEVLOGR_NO_COLOR',
      'DEVLOGR_NO_EMOJI',
      'DEVLOGR_NO_UNICODE',
      'DEVLOGR_FORCE_COLOR',
      'DEVLOGR_UNICODE',
    ].forEach(key => {
      originalEnv[key] = process.env[key];
      delete process.env[key];
    });
  });

  afterEach(() => {
    // Restore original environment variables
    Object.keys(originalEnv).forEach(key => {
      if (originalEnv[key] !== undefined) {
        process.env[key] = originalEnv[key];
      } else {
        delete process.env[key];
      }
    });
  });

  describe('NO_COLOR Global Standard', () => {
    it('should disable colors when NO_COLOR is set to any value', () => {
      process.env.NO_COLOR = '1';
      expect(TerminalUtils.supportsColor()).toBe(false);

      process.env.NO_COLOR = 'true';
      expect(TerminalUtils.supportsColor()).toBe(false);

      process.env.NO_COLOR = 'anything';
      expect(TerminalUtils.supportsColor()).toBe(false);
    });

    it('should disable colors even when DEVLOGR_FORCE_COLOR is set', () => {
      process.env.NO_COLOR = '1';
      process.env.DEVLOGR_FORCE_COLOR = 'true';
      expect(TerminalUtils.supportsColor()).toBe(false);
    });

    it('should disable emojis when NO_COLOR is set (colors affect emoji display)', () => {
      process.env.NO_COLOR = '1';
      expect(EmojiUtils.supportsEmoji()).toBe(false);
    });

    it('should take precedence over devlogr-specific color settings', () => {
      process.env.NO_COLOR = '1';
      process.env.DEVLOGR_NO_COLOR = 'false'; // This shouldn't matter
      expect(TerminalUtils.supportsColor()).toBe(false);
    });
  });

  describe('NO_EMOJI Global Standard', () => {
    it('should disable emojis when NO_EMOJI is set', () => {
      process.env.NO_EMOJI = '1';
      expect(EmojiUtils.supportsEmoji()).toBe(false);

      process.env.NO_EMOJI = 'true';
      expect(EmojiUtils.supportsEmoji()).toBe(false);

      process.env.NO_EMOJI = 'anything';
      expect(EmojiUtils.supportsEmoji()).toBe(false);
    });

    it('should take precedence over devlogr-specific emoji settings', () => {
      process.env.NO_EMOJI = '1';
      process.env.DEVLOGR_NO_EMOJI = 'false'; // This shouldn't matter
      expect(EmojiUtils.supportsEmoji()).toBe(false);
    });

    it('should work independently of color settings', () => {
      // Enable colors but disable emojis
      process.env.DEVLOGR_FORCE_COLOR = 'true';
      process.env.NO_EMOJI = '1';
      expect(TerminalUtils.supportsColor()).toBe(true);
      expect(EmojiUtils.supportsEmoji()).toBe(false);
    });
  });

  describe('NO_UNICODE Convenience Standard', () => {
    it('should disable Unicode when NO_UNICODE is set', () => {
      process.env.NO_UNICODE = '1';
      expect(TerminalUtils.supportsUnicode()).toBe(false);

      process.env.NO_UNICODE = 'true';
      expect(TerminalUtils.supportsUnicode()).toBe(false);

      process.env.NO_UNICODE = 'anything';
      expect(TerminalUtils.supportsUnicode()).toBe(false);
    });

    it('should take precedence over devlogr-specific Unicode settings', () => {
      process.env.NO_UNICODE = '1';
      process.env.DEVLOGR_UNICODE = 'true'; // This shouldn't matter
      expect(TerminalUtils.supportsUnicode()).toBe(false);
    });

    it('should work independently of other settings', () => {
      // Enable colors and emojis but disable Unicode
      process.env.DEVLOGR_FORCE_COLOR = 'true';
      process.env.NO_UNICODE = '1';
      expect(TerminalUtils.supportsColor()).toBe(true);
      expect(EmojiUtils.supportsEmoji()).toBe(true);
      expect(TerminalUtils.supportsUnicode()).toBe(false);
    });
  });

  describe('FORCE_COLOR Convenience Standard', () => {
    it('should enable colors when FORCE_COLOR is set', () => {
      process.env.FORCE_COLOR = '1';
      expect(TerminalUtils.supportsColor()).toBe(true);

      process.env.FORCE_COLOR = 'true';
      expect(TerminalUtils.supportsColor()).toBe(true);
    });

    it('should be overridden by NO_COLOR (global standard takes precedence)', () => {
      process.env.FORCE_COLOR = '1';
      process.env.NO_COLOR = '1';
      expect(TerminalUtils.supportsColor()).toBe(false);
    });

    it('should work alongside devlogr-specific settings', () => {
      process.env.FORCE_COLOR = '1';
      expect(TerminalUtils.supportsColor()).toBe(true);

      // Should also work with DEVLOGR_FORCE_COLOR
      delete process.env.FORCE_COLOR;
      process.env.DEVLOGR_FORCE_COLOR = 'true';
      expect(TerminalUtils.supportsColor()).toBe(true);
    });
  });

  describe('Precedence and Interaction Tests', () => {
    it('should respect correct precedence: global standards > devlogr-specific > defaults', () => {
      // Test NO_COLOR precedence
      process.env.DEVLOGR_FORCE_COLOR = 'true';
      process.env.NO_COLOR = '1';
      expect(TerminalUtils.supportsColor()).toBe(false);

      // Test NO_EMOJI precedence
      process.env.DEVLOGR_NO_EMOJI = 'false';
      process.env.NO_EMOJI = '1';
      expect(EmojiUtils.supportsEmoji()).toBe(false);

      // Test NO_UNICODE precedence
      process.env.DEVLOGR_UNICODE = 'true';
      process.env.NO_UNICODE = '1';
      expect(TerminalUtils.supportsUnicode()).toBe(false);
    });

    it('should handle multiple global standards simultaneously', () => {
      process.env.NO_COLOR = '1';
      process.env.NO_EMOJI = '1';
      process.env.NO_UNICODE = '1';

      expect(TerminalUtils.supportsColor()).toBe(false);
      expect(EmojiUtils.supportsEmoji()).toBe(false);
      expect(TerminalUtils.supportsUnicode()).toBe(false);
    });

    it('should work correctly with mixed global and devlogr settings', () => {
      // Global disables color, devlogr enables emoji
      process.env.NO_COLOR = '1';
      process.env.DEVLOGR_NO_EMOJI = 'false';

      expect(TerminalUtils.supportsColor()).toBe(false);
      expect(EmojiUtils.supportsEmoji()).toBe(false); // Should be false due to NO_COLOR
    });

    it('should handle empty string values correctly', () => {
      // Empty strings should still trigger the disable behavior
      process.env.NO_COLOR = '';
      process.env.NO_EMOJI = '';
      process.env.NO_UNICODE = '';

      expect(TerminalUtils.supportsColor()).toBe(false);
      expect(EmojiUtils.supportsEmoji()).toBe(false);
      expect(TerminalUtils.supportsUnicode()).toBe(false);
    });
  });

  describe('Integration with Logger', () => {
    it('should respect global standards in actual logging', () => {
      process.env.NO_COLOR = '1';
      process.env.NO_EMOJI = '1';

      const logger = createLogger('test');

      // Mock console to capture output
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.info('Test message 🚀');

      // Should have been called (message should be logged)
      expect(consoleSpy).toHaveBeenCalled();

      // The actual formatting would strip colors and emojis
      // but we can't easily test the exact output here without more complex mocking

      consoleSpy.mockRestore();
    });

    it('should work correctly in JSON mode with global standards', () => {
      process.env.NO_COLOR = '1';
      process.env.NO_EMOJI = '1';
      process.env.DEVLOGR_OUTPUT_JSON = 'true';

      const logger = createLogger('test');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.info('Test message 🚀');

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Default Behavior Without Global Standards', () => {
    it('should use reasonable defaults when no global standards are set', () => {
      // No environment variables set - should use terminal detection
      const supportsColor = TerminalUtils.supportsColor();
      const supportsEmoji = EmojiUtils.supportsEmoji();
      const supportsUnicode = TerminalUtils.supportsUnicode();

      // These should be boolean values (not undefined/null)
      expect(typeof supportsColor).toBe('boolean');
      expect(typeof supportsEmoji).toBe('boolean');
      expect(typeof supportsUnicode).toBe('boolean');
    });

    it('should allow devlogr-specific overrides when no global standards are set', () => {
      process.env.DEVLOGR_NO_COLOR = 'true';
      expect(TerminalUtils.supportsColor()).toBe(false);

      delete process.env.DEVLOGR_NO_COLOR;
      process.env.DEVLOGR_FORCE_COLOR = 'true';
      expect(TerminalUtils.supportsColor()).toBe(true);
    });
  });
});
