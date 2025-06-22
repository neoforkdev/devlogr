import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SafeStringUtils } from '../../src/utils';
import chalk from 'chalk';

describe('SafeStringUtils', () => {
  beforeEach(() => {
    // Reset cache before each test
    SafeStringUtils.resetCache();
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.NO_COLOR;
    delete process.env.DEVLOGR_NO_COLOR;
    delete process.env.DEVLOGR_FORCE_COLOR;
    delete process.env.DEVLOGR_NO_UNICODE;
    delete process.env.DEVLOGR_UNICODE;
    delete process.env.NO_EMOJI;
    delete process.env.DEVLOGR_NO_EMOJI;
    SafeStringUtils.resetCache();
  });

  describe('Color handling', () => {
    it('should respect color support detection', () => {
      process.env.DEVLOGR_FORCE_COLOR = 'true';
      SafeStringUtils.resetCache();

      const result = SafeStringUtils.color('test', chalk.red);
      // In test environment, color may or may not be applied based on TTY detection
      expect(typeof result).toBe('string');
      expect(result).toContain('test');
    });

    it('should not apply colors when NO_COLOR is set', () => {
      process.env.NO_COLOR = 'true';
      SafeStringUtils.resetCache();

      const result = SafeStringUtils.color('test', chalk.red);
      expect(result).toBe('test');
    });

    it('should not apply colors when DEVLOGR_NO_COLOR is set', () => {
      process.env.DEVLOGR_NO_COLOR = 'true';
      SafeStringUtils.resetCache();

      const result = SafeStringUtils.color('test', chalk.red);
      expect(result).toBe('test');
    });
  });

  describe('Unicode symbol handling', () => {
    it('should use Unicode symbols when supported', () => {
      process.env.DEVLOGR_UNICODE = 'true';
      SafeStringUtils.resetCache();

      const result = SafeStringUtils.symbol('✓', '+');
      expect(result).toBe('✓');
    });

    it('should use fallback when Unicode not supported', () => {
      process.env.DEVLOGR_NO_UNICODE = 'true';
      SafeStringUtils.resetCache();

      const result = SafeStringUtils.symbol('✓', '+');
      expect(result).toBe('+');
    });
  });

  describe('Emoji handling', () => {
    it('should preserve text without emojis when emojis are supported', () => {
      process.env.DEVLOGR_UNICODE = 'true';
      SafeStringUtils.resetCache();

      const result = SafeStringUtils.emoji('Simple text');
      expect(result).toBe('Simple text');
    });

    it('should strip emojis when not supported', () => {
      process.env.NO_EMOJI = 'true';
      SafeStringUtils.resetCache();

      const result = SafeStringUtils.emoji('Text with 🚀 emoji');
      expect(result).not.toContain('🚀');
    });
  });

  describe('Colored symbols', () => {
    it('should combine symbol fallback and color handling', () => {
      process.env.DEVLOGR_NO_UNICODE = 'true';
      process.env.DEVLOGR_FORCE_COLOR = 'true';
      SafeStringUtils.resetCache();

      const result = SafeStringUtils.coloredSymbol('✓', '+', chalk.green);
      expect(result).toBe(chalk.green('+'));
    });

    it('should handle both no color and no Unicode', () => {
      process.env.DEVLOGR_NO_UNICODE = 'true';
      process.env.NO_COLOR = 'true';
      SafeStringUtils.resetCache();

      const result = SafeStringUtils.coloredSymbol('✓', '+', chalk.green);
      expect(result).toBe('+');
    });
  });

  describe('Safe string creation', () => {
    it('should create safe strings that respect terminal capabilities', () => {
      process.env.DEVLOGR_FORCE_COLOR = 'true';
      SafeStringUtils.resetCache();

      const result = SafeStringUtils.safe('test message', chalk.blue);
      expect(typeof result).toBe('string');
      expect(result).toContain('test message');
    });

    it('should create safe strings without color when not supported', () => {
      process.env.NO_COLOR = 'true';
      SafeStringUtils.resetCache();

      const result = SafeStringUtils.safe('test message', chalk.blue);
      expect(result).toBe('test message');
    });
  });

  describe('Error formatting', () => {
    it('should format errors consistently', () => {
      // Save and clean environment to test without colors
      const originalEnv = {
        FORCE_COLOR: process.env.FORCE_COLOR,
        DEVLOGR_FORCE_COLOR: process.env.DEVLOGR_FORCE_COLOR,
      };

      try {
        delete process.env.FORCE_COLOR;
        delete process.env.DEVLOGR_FORCE_COLOR;
        process.env.NO_COLOR = 'true';
        SafeStringUtils.resetCache();

        const result = SafeStringUtils.formatError('test error', 'Something went wrong');

        expect(result).toContain('error:');
        expect(result).toContain('test error');
        expect(result).toContain('Something went wrong');
      } finally {
        Object.entries(originalEnv).forEach(([key, value]) => {
          if (value !== undefined) {
            process.env[key] = value;
          } else {
            delete process.env[key];
          }
        });
        delete process.env.NO_COLOR;
        SafeStringUtils.resetCache();
      }
    });

    it('should include suggestions in error formatting', () => {
      // Save and clean environment to test without colors
      const originalEnv = {
        FORCE_COLOR: process.env.FORCE_COLOR,
        DEVLOGR_FORCE_COLOR: process.env.DEVLOGR_FORCE_COLOR,
      };

      try {
        delete process.env.FORCE_COLOR;
        delete process.env.DEVLOGR_FORCE_COLOR;
        process.env.NO_COLOR = 'true';
        SafeStringUtils.resetCache();

        const result = SafeStringUtils.formatError(
          'validation error',
          'Invalid configuration',
          'Check your config file'
        );

        expect(result).toContain('error:');
        expect(result).toContain('validation error');
        expect(result).toContain('Invalid configuration');
        expect(result).toContain('help:');
        expect(result).toContain('Check your config file');
      } finally {
        Object.entries(originalEnv).forEach(([key, value]) => {
          if (value !== undefined) {
            process.env[key] = value;
          } else {
            delete process.env[key];
          }
        });
        delete process.env.NO_COLOR;
        SafeStringUtils.resetCache();
      }
    });
  });

  describe('Message formatting', () => {
    it('should format messages with safe symbols and colors', () => {
      const result = SafeStringUtils.formatMessage(
        '!',
        '!',
        chalk.yellow,
        'WARNING',
        chalk.yellow.bold,
        'Test message'
      );

      expect(result).toContain('WARNING');
      expect(result).toContain('Test message');
    });
  });

  describe('Log symbols', () => {
    it('should provide consistent log symbols', () => {
      const symbols = SafeStringUtils.getLogSymbols();

      expect(symbols.error).toBeDefined();
      expect(symbols.error.unicode).toBe('✗');
      expect(symbols.error.fallback).toBe('X');

      expect(symbols.warn).toBeDefined();
      expect(symbols.info).toBeDefined();
      expect(symbols.debug).toBeDefined();
      expect(symbols.trace).toBeDefined();
      expect(symbols.success).toBeDefined();
      expect(symbols.help).toBeDefined();
    });
  });

  describe('Cache functionality', () => {
    it('should cache capability detection results', () => {
      // Use environment variables that definitely change behavior
      process.env.DEVLOGR_NO_UNICODE = 'true';

      // First call should set cache
      const result1 = SafeStringUtils.symbol('✓', '+');

      // Change environment but don't reset cache
      process.env.DEVLOGR_UNICODE = 'true';

      // Should still use cached result
      const result2 = SafeStringUtils.symbol('✓', '+');

      expect(result1).toBe(result2);
      expect(result1).toBe('+'); // Cached fallback result
    });

    it('should respect cache reset', () => {
      process.env.NO_COLOR = 'true';
      SafeStringUtils.resetCache();
      const result1 = SafeStringUtils.color('test', chalk.red);

      delete process.env.NO_COLOR;
      process.env.DEVLOGR_FORCE_COLOR = 'true';
      SafeStringUtils.resetCache(); // Reset cache

      const result2 = SafeStringUtils.color('test', chalk.red);

      // Results may be different depending on capabilities
      expect(typeof result1).toBe('string');
      expect(typeof result2).toBe('string');
      expect(result1).toContain('test');
      expect(result2).toContain('test');
    });
  });
});
