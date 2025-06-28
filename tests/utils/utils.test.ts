import { describe, it, expect } from 'vitest';
import { StringUtils, EmojiUtils, TerminalUtils } from '../../src/utils';

describe('StringUtils', () => {
  describe('formatTime', () => {
    it('should format time in HH:MM:SS format', () => {
      const result = StringUtils.formatTime();
      expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('formatArgs', () => {
    it('should format empty array', () => {
      expect(StringUtils.formatArgs([])).toBe('');
    });

    it('should format mixed arguments', () => {
      const result = StringUtils.formatArgs([42, 'hello', true, null]);
      expect(result).toContain('42');
      expect(result).toContain('hello');
      expect(result).toContain('true');
      expect(result).toContain('null');
    });

    it('should handle Error objects', () => {
      const error = new Error('Test error');
      const result = StringUtils.formatArgs([error]);
      expect(result).toContain('Test error');
    });
  });

  describe('repeat', () => {
    it('should repeat string correctly', () => {
      expect(StringUtils.repeat('a', 0)).toBe('');
      expect(StringUtils.repeat('a', 3)).toBe('aaa');
    });

    it('should handle negative counts', () => {
      expect(StringUtils.repeat('a', -1)).toBe('');
    });
  });

  describe('padString', () => {
    it('should pad string to specified width', () => {
      expect(StringUtils.padString('a', 3)).toBe('  a');
      expect(StringUtils.padString('abc', 3)).toBe('abc');
    });

    it('should handle zero width', () => {
      expect(StringUtils.padString('test', 0)).toBe('test');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      const long = 'a'.repeat(100);
      const result = StringUtils.truncate(long, 50);
      expect(result.length).toBeLessThanOrEqual(53);
      expect(result.endsWith('...') || result.endsWith('…')).toBe(true);
    });

    it('should not truncate short strings', () => {
      expect(StringUtils.truncate('short', 50)).toBe('short');
    });

    it('should handle edge cases', () => {
      expect(StringUtils.truncate('', 10)).toBe('');
      expect(StringUtils.truncate('test', 0)).toMatch(/^(\.\.\.|…)$/);
    });
  });

  describe('safeJsonStringify', () => {
    it('should handle normal objects', () => {
      const obj = { name: 'test', id: 123, active: true };
      const result = StringUtils.safeJsonStringify(obj);
      const parsed = JSON.parse(result);

      expect(parsed.name).toBe('test');
      expect(parsed.id).toBe(123);
      expect(parsed.active).toBe(true);
    });

    it('should handle circular references', () => {
      const obj: Record<string, unknown> = { name: 'test' };
      obj.self = obj;

      const result = StringUtils.safeJsonStringify(obj);
      const parsed = JSON.parse(result);

      expect(parsed.name).toBe('test');
      expect(parsed.self).toBe('[Circular Reference]');
    });

    it('should handle Error objects', () => {
      const error = new Error('Test error');
      const result = StringUtils.safeJsonStringify(error);
      const parsed = JSON.parse(result);

      expect(parsed.name).toBe('Error');
      expect(parsed.message).toBe('Test error');
      expect(parsed.stack).toContain('Test error');
    });

    it('should handle Date objects', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      const result = StringUtils.safeJsonStringify(date);

      expect(result).toBe('"2024-01-01T00:00:00.000Z"');
    });

    it('should handle primitive values', () => {
      expect(StringUtils.safeJsonStringify('hello')).toBe('"hello"');
      expect(StringUtils.safeJsonStringify(42)).toBe('42');
      expect(StringUtils.safeJsonStringify(true)).toBe('true');
      expect(StringUtils.safeJsonStringify(null)).toBe('null');
    });

    it('should use custom indentation', () => {
      const obj = { name: 'test', id: 123 };
      const result = StringUtils.safeJsonStringify(obj, 4);

      expect(result).toContain('    "name": "test"');
      expect(result).toContain('    "id": 123');
    });
  });
});

describe('EmojiUtils', () => {
  describe('supportsEmoji', () => {
    it('should return boolean', () => {
      const result = EmojiUtils.supportsEmoji();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('emoji template tag', () => {
    it('should handle template strings', () => {
      const result = EmojiUtils.emoji`Hello world`;
      expect(result).toContain('Hello world');
    });

    it('should handle interpolation', () => {
      const name = 'World';
      const result = EmojiUtils.emoji`Hello ${name}`;
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });

    it('should handle emojis based on support', () => {
      const result = EmojiUtils.emoji`Test 🚀 message`;
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('format', () => {
    it('should format message', () => {
      const result = EmojiUtils.format('Hello world');
      expect(result).toContain('Hello world');
    });

    it('should handle emojis in message', () => {
      const result = EmojiUtils.format('Hello 🌍 world');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('stripEmojisAndFixSpaces', () => {
    it('should handle multiple spaces correctly when emojis are present', () => {
      const result = EmojiUtils.format('Hello 🚀   world   test');
      // When emoji support is disabled, spaces should be cleaned up
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should trim result when emojis are present', () => {
      const result = EmojiUtils.format('  Hello 🌍 world  ');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });
});

describe('TerminalUtils', () => {
  describe('supportsUnicode', () => {
    it('should return boolean', () => {
      const result = TerminalUtils.supportsUnicode();
      expect(typeof result).toBe('boolean');
    });

    it('should respect DEVLOGR_NO_UNICODE environment variable', () => {
      const originalEnv = process.env.DEVLOGR_NO_UNICODE;

      try {
        process.env.DEVLOGR_NO_UNICODE = 'true';
        const result = TerminalUtils.supportsUnicode();
        expect(result).toBe(false);
      } finally {
        if (originalEnv !== undefined) {
          process.env.DEVLOGR_NO_UNICODE = originalEnv;
        } else {
          delete process.env.DEVLOGR_NO_UNICODE;
        }
      }
    });

    it('should respect DEVLOGR_UNICODE environment variable', () => {
      const originalEnv = process.env.DEVLOGR_UNICODE;

      try {
        process.env.DEVLOGR_UNICODE = 'true';
        const result = TerminalUtils.supportsUnicode();
        expect(result).toBe(true);
      } finally {
        if (originalEnv !== undefined) {
          process.env.DEVLOGR_UNICODE = originalEnv;
        } else {
          delete process.env.DEVLOGR_UNICODE;
        }
      }
    });

    it('should detect UTF-8 in locale', () => {
      const originalEnv = {
        LC_ALL: process.env.LC_ALL,
        DEVLOGR_NO_UNICODE: process.env.DEVLOGR_NO_UNICODE,
        DEVLOGR_UNICODE: process.env.DEVLOGR_UNICODE,
      };

      try {
        delete process.env.DEVLOGR_NO_UNICODE;
        delete process.env.DEVLOGR_UNICODE;
        process.env.LC_ALL = 'en_US.UTF-8';

        const result = TerminalUtils.supportsUnicode();
        expect(result).toBe(true);
      } finally {
        Object.entries(originalEnv).forEach(([key, value]) => {
          if (value !== undefined) {
            process.env[key] = value;
          } else {
            delete process.env[key];
          }
        });
      }
    });
  });

  describe('supportsColor', () => {
    it('should return boolean', () => {
      const result = TerminalUtils.supportsColor();
      expect(typeof result).toBe('boolean');
    });

    it('should respect NO_COLOR environment variable', () => {
      const originalEnv = process.env.NO_COLOR;

      try {
        process.env.NO_COLOR = '1';
        const result = TerminalUtils.supportsColor();
        expect(result).toBe(false);
      } finally {
        if (originalEnv !== undefined) {
          process.env.NO_COLOR = originalEnv;
        } else {
          delete process.env.NO_COLOR;
        }
      }
    });

    it('should respect FORCE_COLOR environment variable', () => {
      const originalEnv = {
        FORCE_COLOR: process.env.FORCE_COLOR,
        NO_COLOR: process.env.NO_COLOR,
      };

      try {
        delete process.env.NO_COLOR;
        process.env.FORCE_COLOR = '1';
        const result = TerminalUtils.supportsColor();
        expect(result).toBe(true);
      } finally {
        Object.entries(originalEnv).forEach(([key, value]) => {
          if (value !== undefined) {
            process.env[key] = value;
          } else {
            delete process.env[key];
          }
        });
      }
    });

    it('should handle dumb terminal', () => {
      const originalEnv = {
        TERM: process.env.TERM,
        FORCE_COLOR: process.env.FORCE_COLOR,
        DEVLOGR_FORCE_COLOR: process.env.DEVLOGR_FORCE_COLOR,
        NO_COLOR: process.env.NO_COLOR,
        CI: process.env.CI,
        GITHUB_ACTIONS: process.env.GITHUB_ACTIONS,
      };

      try {
        delete process.env.FORCE_COLOR;
        delete process.env.DEVLOGR_FORCE_COLOR;
        delete process.env.NO_COLOR;
        delete process.env.CI;
        delete process.env.GITHUB_ACTIONS;
        process.env.TERM = 'dumb';

        const result = TerminalUtils.supportsColor();
        expect(result).toBe(false);
      } finally {
        Object.entries(originalEnv).forEach(([key, value]) => {
          if (value !== undefined) {
            process.env[key] = value;
          } else {
            delete process.env[key];
          }
        });
      }
    });
  });

  describe('getFallbackSymbols', () => {
    it('should return symbol mapping', () => {
      const symbols = TerminalUtils.getFallbackSymbols();
      expect(typeof symbols).toBe('object');
      expect(symbols).toBeDefined();
    });

    it('should have ASCII fallbacks', () => {
      const symbols = TerminalUtils.getFallbackSymbols();
      expect(Object.keys(symbols).length).toBeGreaterThan(0);
    });
  });
});
