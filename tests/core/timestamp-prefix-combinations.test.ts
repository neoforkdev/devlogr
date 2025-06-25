/**
 * @fileoverview Tests for timestamp and prefix combinations
 *
 * This module tests the independent control of timestamps and prefixes through
 * DEVLOGR_SHOW_TIMESTAMP and DEVLOGR_SHOW_PREFIX environment variables.
 * Both are disabled by default and can be enabled independently.
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

describe('Timestamp and Prefix Combinations', () => {
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

  describe('Default Behavior (Both Disabled)', () => {
    it('should have no timestamp and no prefix by default', () => {
      const logger = new Logger('DEFAULT_TEST');

      logger.info('Default message');

      const logCalls = consoleMethods.log.mock.calls.map(call => String(call[0]));

      logCalls.forEach(message => {
        expect(message).not.toContain('[DEFAULT_TEST]'); // No prefix
        expect(message).not.toMatch(/\d{2}:\d{2}:\d{2}/); // No timestamp
        expect(message).not.toContain('INFO'); // No level text when prefix disabled
        expect(message).toMatch(/i|ℹ/); // Should contain icon (with or without color codes)
        expect(message).toContain('Default message'); // Message should be present
      });
    });
  });

  describe('Timestamp Only (Prefix Disabled)', () => {
    it('should show timestamp but no prefix when DEVLOGR_SHOW_TIMESTAMP=true', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'true';

      const logger = new Logger('TIMESTAMP_ONLY');

      logger.info('Message with timestamp only');

      const logCalls = consoleMethods.log.mock.calls.map(call => String(call[0]));

      logCalls.forEach(message => {
        expect(message).not.toContain('[TIMESTAMP_ONLY]'); // No prefix
        expect(message).toMatch(/\d{2}:\d{2}:\d{2}/); // Has timestamp
        expect(message).not.toContain('INFO'); // No level text when prefix disabled
        expect(message).toMatch(/i|ℹ/); // Should contain icon
        expect(message).toContain('Message with timestamp only');
      });
    });

    it('should show ISO timestamp but no prefix when DEVLOGR_SHOW_TIMESTAMP=iso', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'iso';

      const logger = new Logger('ISO_TIMESTAMP_ONLY');

      logger.info('Message with ISO timestamp only');

      const logCalls = consoleMethods.log.mock.calls.map(call => String(call[0]));

      logCalls.forEach(message => {
        expect(message).not.toContain('[ISO_TIMESTAMP_ONLY]'); // No prefix
        expect(message).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // Has ISO timestamp
        expect(message).not.toContain('INFO'); // No level text when prefix disabled
        expect(message).toMatch(/i|ℹ/); // Should contain icon
        expect(message).toContain('Message with ISO timestamp only');
      });
    });
  });

  describe('Prefix Only (Timestamp Disabled)', () => {
    it('should show prefix but no timestamp when DEVLOGR_SHOW_PREFIX=true', () => {
      process.env.DEVLOGR_SHOW_PREFIX = 'true';

      const logger = new Logger('PREFIX_ONLY');

      logger.info('Message with prefix only');

      const logCalls = consoleMethods.log.mock.calls.map(call => String(call[0]));

      logCalls.forEach(message => {
        expect(message).toContain('[PREFIX_ONLY]'); // Has prefix
        expect(message).not.toMatch(/\d{2}:\d{2}:\d{2}/); // No timestamp
        expect(message).toContain('INFO'); // Level text shown when prefix enabled
        expect(message).toMatch(/i|ℹ/); // Should contain icon
        expect(message).toContain('Message with prefix only');
      });
    });

    it('should show prefix but no timestamp when DEVLOGR_SHOW_PREFIX=1', () => {
      process.env.DEVLOGR_SHOW_PREFIX = '1';

      const logger = new Logger('PREFIX_NUMERIC');

      logger.info('Message with numeric prefix setting');

      const logCalls = consoleMethods.log.mock.calls.map(call => String(call[0]));

      logCalls.forEach(message => {
        expect(message).toContain('[PREFIX_NUMERIC]'); // Has prefix
        expect(message).not.toMatch(/\d{2}:\d{2}:\d{2}/); // No timestamp
        expect(message).toContain('INFO'); // Level text shown when prefix enabled
        expect(message).toMatch(/i|ℹ/); // Should contain icon
        expect(message).toContain('Message with numeric prefix setting');
      });
    });
  });

  describe('Both Timestamp and Prefix Enabled', () => {
    it('should show both timestamp and prefix when both are enabled', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'true';
      process.env.DEVLOGR_SHOW_PREFIX = 'true';

      const logger = new Logger('BOTH_ENABLED');

      logger.info('Message with both timestamp and prefix');

      const logCalls = consoleMethods.log.mock.calls.map(call => String(call[0]));

      logCalls.forEach(message => {
        expect(message).toContain('[BOTH_ENABLED]'); // Has prefix
        expect(message).toMatch(/\d{2}:\d{2}:\d{2}/); // Has timestamp
        expect(message).toContain('INFO');
        expect(message).toContain('Message with both timestamp and prefix');
      });
    });

    it('should show both ISO timestamp and prefix when both are configured', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'iso';
      process.env.DEVLOGR_SHOW_PREFIX = '1';

      const logger = new Logger('BOTH_ISO');

      logger.info('Message with ISO timestamp and prefix');

      const logCalls = consoleMethods.log.mock.calls.map(call => String(call[0]));

      logCalls.forEach(message => {
        expect(message).toContain('[BOTH_ISO]'); // Has prefix
        expect(message).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // Has ISO timestamp
        expect(message).toContain('INFO');
        expect(message).toContain('Message with ISO timestamp and prefix');
      });
    });
  });

  describe('Independent Control Verification', () => {
    it('should disable timestamp while keeping prefix enabled', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'false';
      process.env.DEVLOGR_SHOW_PREFIX = 'true';

      const logger = new Logger('NO_TIME_WITH_PREFIX');

      logger.warn('Warning with prefix but no timestamp');

      const logCalls = consoleMethods.warn.mock.calls.map(call => String(call[0]));

      logCalls.forEach(message => {
        expect(message).toContain('[NO_TIME_WITH_PREFIX]'); // Has prefix
        expect(message).not.toMatch(/\d{2}:\d{2}:\d{2}/); // No timestamp
        expect(message).toContain('WARN'); // Level text shown when prefix enabled
      });
    });

    it('should disable prefix while keeping timestamp enabled', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'true';
      process.env.DEVLOGR_SHOW_PREFIX = 'false';

      const logger = new Logger('TIME_NO_PREFIX');

      logger.error('Error with timestamp but no prefix');

      const logCalls = consoleMethods.error.mock.calls.map(call => String(call[0]));

      logCalls.forEach(message => {
        expect(message).not.toContain('[TIME_NO_PREFIX]'); // No prefix
        expect(message).toMatch(/\d{2}:\d{2}:\d{2}/); // Has timestamp
        expect(message).not.toContain('ERROR'); // No level text when prefix disabled
      });
    });

    it('should handle mixed truthy/falsy values correctly', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = '1';
      process.env.DEVLOGR_SHOW_PREFIX = '0';

      const logger = new Logger('MIXED_VALUES');

      logger.success('Success with mixed settings');

      const logCalls = consoleMethods.log.mock.calls.map(call => String(call[0]));

      logCalls.forEach(message => {
        expect(message).not.toContain('[MIXED_VALUES]'); // No prefix (0 is falsy)
        expect(message).toMatch(/\d{2}:\d{2}:\d{2}/); // Has timestamp (1 is truthy)
        expect(message).not.toContain('SUCCESS'); // No level text when prefix disabled
      });
    });
  });

  describe('Edge Cases and Invalid Values', () => {
    it('should handle invalid timestamp values gracefully', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'invalid_value';
      process.env.DEVLOGR_SHOW_PREFIX = 'true';

      const logger = new Logger('INVALID_TIME');

      logger.info('Message with invalid timestamp value');

      const logCalls = consoleMethods.log.mock.calls.map(call => String(call[0]));

      logCalls.forEach(message => {
        expect(message).toContain('[INVALID_TIME]'); // Prefix should work
        expect(message).not.toMatch(/\d{2}:\d{2}:\d{2}/); // No timestamp for invalid value
        expect(message).toContain('INFO');
      });
    });

    it('should handle empty string values', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = '';
      process.env.DEVLOGR_SHOW_PREFIX = '';

      const logger = new Logger('EMPTY_STRINGS');

      logger.info('Message with empty string values');

      const logCalls = consoleMethods.log.mock.calls.map(call => String(call[0]));

      logCalls.forEach(message => {
        expect(message).not.toContain('[EMPTY_STRINGS]'); // No prefix for empty string
        expect(message).not.toMatch(/\d{2}:\d{2}:\d{2}/); // No timestamp for empty string
        expect(message).not.toContain('INFO'); // No level text when prefix disabled
      });
    });

    it('should handle all log levels with custom settings', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'iso';
      process.env.DEVLOGR_SHOW_PREFIX = 'true';

      const logger = new Logger('ALL_LEVELS');

      logger.debug('Debug message');
      logger.info('Info message');
      logger.success('Success message');
      logger.warning('Warning message');
      logger.error('Error message');

      // Collect all messages
      const allCalls = [
        ...consoleMethods.debug.mock.calls.map(call => String(call[0])),
        ...consoleMethods.log.mock.calls.map(call => String(call[0])),
        ...consoleMethods.warn.mock.calls.map(call => String(call[0])),
        ...consoleMethods.error.mock.calls.map(call => String(call[0])),
      ];

      // Each message should have both ISO timestamp and prefix
      allCalls.forEach(message => {
        expect(message).toContain('[ALL_LEVELS]'); // Has prefix
        expect(message).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // Has ISO timestamp
        expect(message).toMatch(/(DEBUG|INFO|SUCCESS|WARN|ERROR)/); // Has level
      });
    });
  });

  describe('Multiple Logger Instances', () => {
    it('should apply global settings to all logger instances consistently', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'true';
      process.env.DEVLOGR_SHOW_PREFIX = 'false';

      const apiLogger = new Logger('API');
      const dbLogger = new Logger('DATABASE');

      apiLogger.info('API call made');
      dbLogger.error('Database connection failed');

      const logCalls = consoleMethods.log.mock.calls.map(call => String(call[0]));
      const errorCalls = consoleMethods.error.mock.calls.map(call => String(call[0]));

      // Both loggers should respect global settings
      [...logCalls, ...errorCalls].forEach(message => {
        expect(message).not.toMatch(/\[(API|DATABASE)\]/); // No prefix
        expect(message).toMatch(/\d{2}:\d{2}:\d{2}/); // Has timestamp
      });
    });

    it('should handle different logger names with enabled settings', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'false';
      process.env.DEVLOGR_SHOW_PREFIX = 'true';

      const authLogger = new Logger('AUTH');
      const cacheLogger = new Logger('CACHE');

      authLogger.success('User authenticated');
      cacheLogger.warning('Cache miss');

      const logCalls = consoleMethods.log.mock.calls.map(call => String(call[0]));
      const warnCalls = consoleMethods.warn.mock.calls.map(call => String(call[0]));

      // Verify correct prefixes are shown
      logCalls.forEach(message => {
        expect(message).toContain('[AUTH]'); // Has correct prefix
        expect(message).not.toMatch(/\d{2}:\d{2}:\d{2}/); // No timestamp
      });

      warnCalls.forEach(message => {
        expect(message).toContain('[CACHE]'); // Has correct prefix
        expect(message).not.toMatch(/\d{2}:\d{2}:\d{2}/); // No timestamp
      });
    });
  });
});
