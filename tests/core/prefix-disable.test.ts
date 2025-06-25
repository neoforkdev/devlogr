/**
 * @fileoverview Tests for DEVLOGR_SHOW_PREFIX environment variable functionality
 *
 * This module tests the ability to control prefix display through the DEVLOGR_SHOW_PREFIX
 * environment variable. By default, prefixes are disabled and only show when explicitly enabled.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Logger } from '../../src/logger';

// Mock console methods
const consoleMethods = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
};

// Store original environment
const originalEnv: Record<string, string | undefined> = {};
const ENV_KEYS = ['DEVLOGR_SHOW_PREFIX', 'DEVLOGR_SHOW_TIMESTAMP'];

describe('DEVLOGR_SHOW_PREFIX Environment Variable', () => {
  beforeEach(() => {
    // Store original environment variables
    ENV_KEYS.forEach(key => {
      originalEnv[key] = process.env[key];
      delete process.env[key];
    });

    // Mock console methods
    Object.keys(consoleMethods).forEach(method => {
      vi.spyOn(console, method as keyof typeof console).mockImplementation(
        consoleMethods[method as keyof typeof consoleMethods]
      );
    });

    // Clear all mock call history
    Object.values(consoleMethods).forEach(mock => mock.mockClear());
  });

  afterEach(() => {
    // Restore original environment
    ENV_KEYS.forEach(key => {
      if (originalEnv[key] !== undefined) {
        process.env[key] = originalEnv[key];
      } else {
        delete process.env[key];
      }
    });

    // Restore console methods
    vi.restoreAllMocks();
  });

  describe('Default Behavior (Prefix Disabled)', () => {
    it('should hide prefix by default when DEVLOGR_SHOW_PREFIX is not set', () => {
      const logger = new Logger('TEST_PREFIX');

      logger.info('Test message without prefix');
      logger.success('Success message without prefix');

      // Get all console output
      const logCalls = [...consoleMethods.log.mock.calls.map(call => String(call[0]))];

      logCalls.forEach(message => {
        expect(message).not.toContain('[TEST_PREFIX]');
        expect(message).not.toMatch(/(INFO|SUCCESS)/); // Level text hidden when prefix disabled
      });

      expect(logCalls.length).toBeGreaterThan(0);
    });
  });

  describe('Prefix Enabled with DEVLOGR_SHOW_PREFIX=true', () => {
    it('should show prefix when DEVLOGR_SHOW_PREFIX=true', () => {
      process.env.DEVLOGR_SHOW_PREFIX = 'true';

      const logger = new Logger('SHOWN_PREFIX');

      logger.info('Test message with prefix');
      logger.success('Success message with prefix');
      logger.warning('Warning message with prefix');
      logger.error('Error message with prefix');

      // Verify messages contain the prefix when enabled
      const logCalls = consoleMethods.log.mock.calls.map(call => String(call[0]));
      const errorCalls = consoleMethods.error.mock.calls.map(call => String(call[0]));
      const warnCalls = consoleMethods.warn.mock.calls.map(call => String(call[0]));

      // Check that calls contain the prefix
      logCalls.forEach(message => {
        expect(message).toContain('[SHOWN_PREFIX]');
        expect(message).toMatch(/(INFO|SUCCESS)/); // Should contain level
      });

      warnCalls.forEach(message => {
        expect(message).toContain('[SHOWN_PREFIX]');
        expect(message).toContain('WARN'); // Should contain level
      });

      errorCalls.forEach(message => {
        expect(message).toContain('[SHOWN_PREFIX]');
        expect(message).toContain('ERROR'); // Should contain level
      });
    });
  });

  describe('Prefix Enabled with DEVLOGR_SHOW_PREFIX=1', () => {
    it('should show prefix when DEVLOGR_SHOW_PREFIX=1', () => {
      process.env.DEVLOGR_SHOW_PREFIX = '1';

      const logger = new Logger('NUMERIC_PREFIX');

      logger.info('Test with numeric flag');
      logger.error('Error with numeric flag');

      const logCalls = consoleMethods.log.mock.calls.map(call => String(call[0]));
      const errorCalls = consoleMethods.error.mock.calls.map(call => String(call[0]));

      // Verify prefix is shown with numeric flag
      logCalls.forEach(message => {
        expect(message).toContain('[NUMERIC_PREFIX]');
        expect(message).toContain('INFO');
      });

      errorCalls.forEach(message => {
        expect(message).toContain('[NUMERIC_PREFIX]');
        expect(message).toContain('ERROR');
      });
    });
  });

  describe('Prefix Disabled with false values', () => {
    it('should hide prefix when DEVLOGR_SHOW_PREFIX is set to false', () => {
      process.env.DEVLOGR_SHOW_PREFIX = 'false';

      const logger = new Logger('HIDDEN_AGAIN');

      logger.info('Prefix should be hidden');
      logger.success('Success should be hidden');

      const logCalls = consoleMethods.log.mock.calls.map(call => String(call[0]));

      logCalls.forEach(message => {
        expect(message).not.toContain('[HIDDEN_AGAIN]');
        expect(message).not.toMatch(/(INFO|SUCCESS)/); // Level text hidden when prefix disabled
      });
    });

    it('should hide prefix when DEVLOGR_SHOW_PREFIX is set to any other value', () => {
      process.env.DEVLOGR_SHOW_PREFIX = 'some_other_value';

      const logger = new Logger('ALSO_HIDDEN');

      logger.info('Should hide prefix with other value');

      const logCalls = consoleMethods.log.mock.calls.map(call => String(call[0]));

      logCalls.forEach(message => {
        expect(message).not.toContain('[ALSO_HIDDEN]');
        expect(message).not.toContain('INFO'); // Level text hidden when prefix disabled
      });
    });
  });

  describe('Multiple Loggers with Global Prefix Settings', () => {
    it('should respect global prefix setting for all logger instances when disabled', () => {
      process.env.DEVLOGR_SHOW_PREFIX = 'false';

      const loggerOne = new Logger('LOGGER_ONE');
      const loggerTwo = new Logger('LOGGER_TWO');

      loggerOne.info('Message from logger one');
      loggerTwo.success('Message from logger two');

      const logCalls = consoleMethods.log.mock.calls.map(call => String(call[0]));

      logCalls.forEach(message => {
        expect(message).not.toContain('[LOGGER_ONE]');
        expect(message).not.toContain('[LOGGER_TWO]');
        expect(message).not.toMatch(/(INFO|SUCCESS)/); // Level text hidden when prefix disabled
      });
    });

    it('should respect global prefix setting for all logger instances when enabled', () => {
      process.env.DEVLOGR_SHOW_PREFIX = 'true';

      const logger1 = new Logger('LOGGER_THREE');
      const logger2 = new Logger('LOGGER_FOUR');

      logger1.info('Message from logger three');
      logger2.success('Message from logger four');

      const logCalls = consoleMethods.log.mock.calls.map(call => String(call[0]));

      // Both loggers should show prefixes when enabled
      logCalls.forEach(message => {
        expect(message).toMatch(/\[(LOGGER_THREE|LOGGER_FOUR)\]/);
        expect(message).toMatch(/(INFO|SUCCESS)/);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string DEVLOGR_SHOW_PREFIX (should hide prefix)', () => {
      process.env.DEVLOGR_SHOW_PREFIX = '';

      const logger = new Logger('EMPTY_TEST');
      logger.info('Empty string test');

      const logCalls = consoleMethods.log.mock.calls.map(call => String(call[0]));

      logCalls.forEach(message => {
        expect(message).not.toContain('[EMPTY_TEST]'); // Should hide prefix for empty string
      });
    });

    it('should handle whitespace-only DEVLOGR_SHOW_PREFIX (should hide prefix)', () => {
      process.env.DEVLOGR_SHOW_PREFIX = '   ';

      const logger = new Logger('WHITESPACE_TEST');
      logger.info('Whitespace test');

      const logCalls = consoleMethods.log.mock.calls.map(call => String(call[0]));

      logCalls.forEach(message => {
        expect(message).not.toContain('[WHITESPACE_TEST]'); // Should hide prefix for whitespace
      });
    });

    it('should preserve message structure without prefix', () => {
      const logger = new Logger('STRUCTURE_TEST');

      logger.info('Message with', { key: 'value' }, 'multiple args');

      const logCalls = consoleMethods.log.mock.calls.map(call => String(call[0]));

      logCalls.forEach(message => {
        expect(message).not.toContain('[STRUCTURE_TEST]');
        expect(message).not.toContain('INFO'); // Level text hidden when prefix disabled
        expect(message).toContain('Message with'); // Should have message content
        // Arguments should be preserved in the output
        expect(message).toContain('key'); // Object should be formatted
        expect(message).toContain('value');
        expect(message).toContain('multiple args');
      });
    });
  });
});
