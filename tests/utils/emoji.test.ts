import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLogger, Logger } from '../../src/logger';
import { LogLevel } from '../../src/types';
import { SafeStringUtils } from '../../src/utils/safe-string';

describe('Logger Emoji Handling', () => {
  let originalEnv: Record<string, string | undefined>;

  beforeEach(() => {
    // Store original environment variables
    originalEnv = {
      NO_COLOR: process.env.NO_COLOR,
      DEVLOGR_NO_COLOR: process.env.DEVLOGR_NO_COLOR,
      NO_EMOJI: process.env.NO_EMOJI,
      DEVLOGR_NO_EMOJI: process.env.DEVLOGR_NO_EMOJI,
      DEVLOGR_OUTPUT_JSON: process.env.DEVLOGR_OUTPUT_JSON,
      DEVLOGR_FORCE_COLOR: process.env.DEVLOGR_FORCE_COLOR,
    };

    // Clear environment variables for clean slate
    Object.keys(originalEnv).forEach(key => {
      delete process.env[key];
    });

    // Reset caches to ensure clean test state
    SafeStringUtils.resetCache();

    // Reset logger level
    Logger.resetLevel();
  });

  afterEach(() => {
    // Restore original environment variables
    Object.entries(originalEnv).forEach(([key, value]) => {
      if (value !== undefined) {
        process.env[key] = value;
      } else {
        delete process.env[key];
      }
    });

    // Reset caches to ensure clean test state
    SafeStringUtils.resetCache();

    // Reset logger level
    Logger.resetLevel();
  });

  describe('Normal Mode (Emojis Enabled)', () => {
    it('should preserve emojis in normal mode', () => {
      process.env.DEVLOGR_FORCE_COLOR = '1'; // Ensure colors are enabled
      const logger = createLogger('TEST');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.info('Message with emoji 🚀 and flag 🇺🇸');

      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls[0][0];

      // Should contain emojis
      expect(output).toContain('🚀');
      expect(output).toContain('🇺🇸');
      expect(output).toContain('Message with emoji 🚀 and flag 🇺🇸');

      consoleSpy.mockRestore();
    });

    it('should preserve complex emoji sequences', () => {
      process.env.DEVLOGR_FORCE_COLOR = '1';
      const logger = createLogger('TEST');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.info('Complex emoji: 👨‍💻 and keycap: 1️⃣');

      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls[0][0];

      // Should contain complex emojis
      expect(output).toContain('👨‍💻');
      expect(output).toContain('1️⃣');

      consoleSpy.mockRestore();
    });
  });

  describe('NO_COLOR Mode (Emojis Disabled)', () => {
    it('should strip emojis when NO_COLOR=1', () => {
      process.env.NO_COLOR = '1';
      const logger = createLogger('TEST');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.info('Message with emoji 🚀 and flag 🇺🇸');

      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls[0][0];

      // Should NOT contain emojis
      expect(output).not.toContain('🚀');
      expect(output).not.toContain('🇺🇸');
      // Should contain the text without emojis
      expect(output).toContain('Message with emoji');
      expect(output).toContain('and flag');

      consoleSpy.mockRestore();
    });

    it('should strip emojis when DEVLOGR_NO_COLOR=true', () => {
      process.env.DEVLOGR_NO_COLOR = 'true';
      const logger = createLogger('TEST');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.info('Complex emoji: 👨‍💻 and keycap: 1️⃣');

      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls[0][0];

      // Should NOT contain complex emojis
      expect(output).not.toContain('👨‍💻');
      expect(output).not.toContain('1️⃣');
      expect(output).toContain('Complex emoji:');
      expect(output).toContain('and keycap:');

      consoleSpy.mockRestore();
    });

    it('should strip emojis when NO_EMOJI=1', () => {
      process.env.NO_EMOJI = '1';
      const logger = createLogger('TEST');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.info('Multiple emojis: 🔥🎯✅ here');

      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls[0][0];

      // Should NOT contain any emojis
      expect(output).not.toContain('🔥');
      expect(output).not.toContain('🎯');
      expect(output).not.toContain('✅');
      expect(output).toContain('Multiple emojis:');
      expect(output).toContain('here');

      consoleSpy.mockRestore();
    });

    it('should strip emojis when DEVLOGR_NO_EMOJI=1', () => {
      process.env.DEVLOGR_NO_EMOJI = '1';
      const logger = createLogger('TEST');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.info('Emoji test: 🌟⭐💫');

      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls[0][0];

      expect(output).not.toContain('🌟');
      expect(output).not.toContain('⭐');
      expect(output).not.toContain('💫');
      expect(output).toContain('Emoji test:');

      consoleSpy.mockRestore();
    });
  });

  describe('JSON Mode (Emojis Always Disabled)', () => {
    it('should strip emojis in JSON mode regardless of color settings', () => {
      process.env.DEVLOGR_OUTPUT_JSON = 'true';
      process.env.DEVLOGR_FORCE_COLOR = '1'; // Force colors but should still strip emojis
      const logger = createLogger('TEST');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.info('JSON message with emoji 🚀 and flag 🇺🇸');

      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls[0][0];

      // Should be valid JSON
      expect(() => JSON.parse(output)).not.toThrow();

      const parsed = JSON.parse(output);
      expect(parsed).toMatchObject({
        level: 'info',
        prefix: 'TEST',
        timestamp: expect.any(String),
      });

      // Message should NOT contain emojis
      expect(parsed.message).not.toContain('🚀');
      expect(parsed.message).not.toContain('🇺🇸');
      expect(parsed.message).toContain('JSON message with emoji');
      expect(parsed.message).toContain('and flag');

      consoleSpy.mockRestore();
    });

    it('should strip emojis from arguments in JSON mode', () => {
      process.env.DEVLOGR_OUTPUT_JSON = 'true';
      const logger = createLogger('TEST');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.info('Test message', 'arg with emoji 🎯', { key: 'value' });

      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls[0][0];

      const parsed = JSON.parse(output);

      // String argument should have emoji stripped
      expect(parsed.arg0).not.toContain('🎯');
      expect(parsed.arg0).toContain('arg with emoji');

      // Object should be preserved
      expect(parsed.key).toBe('value');

      consoleSpy.mockRestore();
    });

    it('should handle complex emojis in JSON mode', () => {
      process.env.DEVLOGR_OUTPUT_JSON = 'true';
      const logger = createLogger('TEST');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.info('Complex: 👨‍💻 keycap: 1️⃣ flag: 🇺🇸');

      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls[0][0];

      const parsed = JSON.parse(output);

      // Should strip all types of emojis
      expect(parsed.message).not.toContain('👨‍💻');
      expect(parsed.message).not.toContain('1️⃣');
      expect(parsed.message).not.toContain('🇺🇸');
      expect(parsed.message).toContain('Complex:');
      expect(parsed.message).toContain('keycap:');
      expect(parsed.message).toContain('flag:');

      consoleSpy.mockRestore();
    });
  });

  describe('Combined Environment Variables', () => {
    it('should strip emojis when both NO_COLOR and JSON mode are set', () => {
      process.env.NO_COLOR = '1';
      process.env.DEVLOGR_OUTPUT_JSON = 'true';
      const logger = createLogger('TEST');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.info('Combined test 🚀🎯');

      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls[0][0];

      const parsed = JSON.parse(output);
      expect(parsed.message).not.toContain('🚀');
      expect(parsed.message).not.toContain('🎯');
      expect(parsed.message).toContain('Combined test');

      consoleSpy.mockRestore();
    });

    it('should prioritize JSON mode emoji stripping over color settings', () => {
      process.env.DEVLOGR_OUTPUT_JSON = 'true';
      process.env.DEVLOGR_FORCE_COLOR = '1';
      // NO emoji disable flags set, but JSON mode should still strip
      const logger = createLogger('TEST');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.info('Priority test 🌟⭐');

      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls[0][0];

      const parsed = JSON.parse(output);
      expect(parsed.message).not.toContain('🌟');
      expect(parsed.message).not.toContain('⭐');

      consoleSpy.mockRestore();
    });
  });
});
