import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Logger, createLogger } from '../../src/logger';
import { LogConfiguration } from '../../src/config';

import { setupTestEnvironment } from '../helpers/test-environment';

describe('Logger Environment Variables', () => {
  let originalEnv: Record<string, string | undefined>;

  beforeEach(() => {
    // Store original environment variables
    originalEnv = {
      DEVLOGR_LOG_LEVEL: process.env.DEVLOGR_LOG_LEVEL,
      DEVLOGR_OUTPUT_JSON: process.env.DEVLOGR_OUTPUT_JSON,
      NO_COLOR: process.env.NO_COLOR,
      DEVLOGR_NO_COLOR: process.env.DEVLOGR_NO_COLOR,
      DEVLOGR_FORCE_COLOR: process.env.DEVLOGR_FORCE_COLOR,
      DEVLOGR_NO_UNICODE: process.env.DEVLOGR_NO_UNICODE,
      DEVLOGR_UNICODE: process.env.DEVLOGR_UNICODE,
      NO_EMOJI: process.env.NO_EMOJI,
      DEVLOGR_NO_EMOJI: process.env.DEVLOGR_NO_EMOJI,
      DEVLOGR_SHOW_TIMESTAMP: process.env.DEVLOGR_SHOW_TIMESTAMP,
      DEVLOGR_SHOW_ICONS: process.env.DEVLOGR_SHOW_ICONS,
    };

    // Setup secure test environment with default non-CI behavior
    setupTestEnvironment();

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

    // Reset logger level
    Logger.resetLevel();
  });

  describe('DEVLOGR_LOG_LEVEL Environment Variable', () => {
    it('should respect DEVLOGR_LOG_LEVEL=error', () => {
      process.env.DEVLOGR_LOG_LEVEL = 'error';
      const logger = createLogger('TEST');

      const consoleSpy = {
        log: vi.spyOn(console, 'log').mockImplementation(() => {}),
        error: vi.spyOn(console, 'error').mockImplementation(() => {}),
        warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
        debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      };

      logger.trace('Should not appear');
      logger.debug('Should not appear');
      logger.info('Should not appear');
      logger.warning('Should not appear');
      logger.error('Should appear');

      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalled();

      Object.values(consoleSpy).forEach(spy => spy.mockRestore());
    });

    it('should respect DEVLOGR_LOG_LEVEL=warning', () => {
      process.env.DEVLOGR_LOG_LEVEL = 'warning';
      const logger = createLogger('TEST');

      const consoleSpy = {
        log: vi.spyOn(console, 'log').mockImplementation(() => {}),
        error: vi.spyOn(console, 'error').mockImplementation(() => {}),
        warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
        debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      };

      logger.trace('Should not appear');
      logger.debug('Should not appear');
      logger.info('Should not appear');
      logger.warning('Should appear');
      logger.error('Should appear');

      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.warn).toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalled();

      Object.values(consoleSpy).forEach(spy => spy.mockRestore());
    });

    it('should respect DEVLOGR_LOG_LEVEL=trace', () => {
      process.env.DEVLOGR_LOG_LEVEL = 'trace';
      const logger = createLogger('TEST');

      const consoleSpy = {
        log: vi.spyOn(console, 'log').mockImplementation(() => {}),
        error: vi.spyOn(console, 'error').mockImplementation(() => {}),
        warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
        debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      };

      logger.trace('Should appear');
      logger.debug('Should appear');
      logger.info('Should appear');
      logger.warning('Should appear');
      logger.error('Should appear');

      expect(consoleSpy.log).toHaveBeenCalled();
      expect(consoleSpy.warn).toHaveBeenCalled();
      expect(consoleSpy.debug).toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalled();

      Object.values(consoleSpy).forEach(spy => spy.mockRestore());
    });

    it('should handle invalid log levels gracefully', () => {
      process.env.DEVLOGR_LOG_LEVEL = 'invalid';
      const logger = createLogger('TEST');

      const consoleSpy = {
        log: vi.spyOn(console, 'log').mockImplementation(() => {}),
        error: vi.spyOn(console, 'error').mockImplementation(() => {}),
        warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
        debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      };

      // Should default to INFO level
      logger.trace('Should not appear');
      logger.debug('Should not appear');
      logger.info('Should appear');
      logger.warning('Should appear');
      logger.error('Should appear');

      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.log).toHaveBeenCalled();
      expect(consoleSpy.warn).toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalled();

      Object.values(consoleSpy).forEach(spy => spy.mockRestore());
    });
  });

  describe('DEVLOGR_OUTPUT_JSON Environment Variable', () => {
    it('should enable JSON logging when DEVLOGR_OUTPUT_JSON=true', () => {
      process.env.DEVLOGR_OUTPUT_JSON = 'true';
      const logger = createLogger('TEST');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.info('Test message', { key: 'value' });

      expect(consoleSpy).toHaveBeenCalled();
      const loggedMessage = consoleSpy.mock.calls[0][0];

      // Should be valid JSON
      expect(() => JSON.parse(loggedMessage)).not.toThrow();

      const parsed = JSON.parse(loggedMessage);
      expect(parsed).toMatchObject({
        level: 'info',
        prefix: 'TEST',
        message: 'Test message',
        key: 'value',
      });
      expect(parsed.timestamp).toBeDefined();

      consoleSpy.mockRestore();
    });

    it('should use correct console methods for JSON logging', () => {
      process.env.DEVLOGR_OUTPUT_JSON = 'true';
      process.env.DEVLOGR_LOG_LEVEL = 'trace'; // Enable all levels
      const logger = createLogger('TEST');

      const consoleSpy = {
        log: vi.spyOn(console, 'log').mockImplementation(() => {}),
        error: vi.spyOn(console, 'error').mockImplementation(() => {}),
        warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
        debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      };

      logger.info('Info message');
      logger.error('Error message');
      logger.warning('Warning message');
      logger.debug('Debug message');
      logger.trace('Trace message');

      // Verify correct console methods were used
      expect(consoleSpy.log).toHaveBeenCalledTimes(1); // info
      expect(consoleSpy.error).toHaveBeenCalledTimes(1); // error
      expect(consoleSpy.warn).toHaveBeenCalledTimes(1); // warning
      expect(consoleSpy.debug).toHaveBeenCalledTimes(2); // debug + trace

      // Verify all outputs are valid JSON
      [consoleSpy.log, consoleSpy.error, consoleSpy.warn, consoleSpy.debug].forEach(spy => {
        spy.mock.calls.forEach(call => {
          expect(() => JSON.parse(call[0])).not.toThrow();
        });
      });

      Object.values(consoleSpy).forEach(spy => spy.mockRestore());
    });

    it('should disable JSON logging when DEVLOGR_OUTPUT_JSON is not set', () => {
      // DEVLOGR_OUTPUT_JSON not set (should default to false)
      const logger = createLogger('TEST');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.info('Test message');

      expect(consoleSpy).toHaveBeenCalled();
      const loggedMessage = consoleSpy.mock.calls[0][0];

      // Should NOT be JSON (should be formatted text)
      expect(loggedMessage).not.toMatch(/^\{.*\}$/);
      expect(loggedMessage).toContain('Test message');

      consoleSpy.mockRestore();
    });

    it('should not output spacers and separators in JSON mode', () => {
      process.env.DEVLOGR_OUTPUT_JSON = 'true';
      const logger = createLogger('TEST');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.spacer();
      logger.separator();
      logger.separator('Title');

      // No console.log calls should have been made for spacers/separators
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should output spacers and separators in non-JSON mode', () => {
      // Save and clean environment to test without colors
      const originalEnv = {
        FORCE_COLOR: process.env.FORCE_COLOR,
        DEVLOGR_FORCE_COLOR: process.env.DEVLOGR_FORCE_COLOR,
      };

      try {
        delete process.env.FORCE_COLOR;
        delete process.env.DEVLOGR_FORCE_COLOR;
        process.env.NO_COLOR = 'true';
        process.env.DEVLOGR_OUTPUT_JSON = 'false';

        const logger = createLogger('TEST');

        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        logger.spacer();
        logger.separator();
        logger.separator('Title');

        // Should have made 3 console.log calls
        expect(consoleSpy).toHaveBeenCalledTimes(3);

        // Check calls: spacer (no args), separator (fixed length), separator with title (fixed format)
        expect(consoleSpy.mock.calls[0]).toEqual([]); // spacer() calls console.log() with no args
        expect(consoleSpy.mock.calls[1][0]).toMatch(/^[─-]{60}$/); // Fixed length separator
        expect(consoleSpy.mock.calls[2][0]).toMatch(/^[─-]{2} Title [─-]+$/); // Fixed format with title

        consoleSpy.mockRestore();
      } finally {
        Object.entries(originalEnv).forEach(([key, value]) => {
          if (value !== undefined) {
            process.env[key] = value;
          } else {
            delete process.env[key];
          }
        });
        delete process.env.NO_COLOR;
        delete process.env.DEVLOGR_OUTPUT_JSON;
      }
    });
  });

  describe('Color Environment Variables', () => {
    it('should respect NO_COLOR environment variable', () => {
      process.env.NO_COLOR = '1';
      const config = LogConfiguration.getConfig();
      expect(config.useColors).toBe(false);
    });

    it('should respect DEVLOGR_NO_COLOR environment variable', () => {
      process.env.DEVLOGR_NO_COLOR = 'true';
      const config = LogConfiguration.getConfig();
      expect(config.useColors).toBe(false);
    });

    it('should respect DEVLOGR_FORCE_COLOR environment variable', () => {
      process.env.DEVLOGR_FORCE_COLOR = '1';
      const config = LogConfiguration.getConfig();
      expect(config.useColors).toBe(true);
    });
  });

  describe('Unicode Environment Variables', () => {
    it('should respect DEVLOGR_NO_UNICODE environment variable', () => {
      process.env.DEVLOGR_NO_UNICODE = 'true';
      const config = LogConfiguration.getConfig();
      expect(config.supportsUnicode).toBe(false);
    });

    it('should respect DEVLOGR_UNICODE environment variable', () => {
      process.env.DEVLOGR_UNICODE = 'true';
      const config = LogConfiguration.getConfig();
      expect(config.supportsUnicode).toBe(true);
    });
  });

  describe('Icon Environment Variables', () => {
    it('should respect DEVLOGR_SHOW_ICONS=false environment variable', () => {
      process.env.DEVLOGR_SHOW_ICONS = 'false';
      const config = LogConfiguration.getConfig();
      expect(config.showIcons).toBe(false);
    });

    it('should respect DEVLOGR_SHOW_ICONS=true environment variable', () => {
      process.env.DEVLOGR_SHOW_ICONS = 'true';
      const config = LogConfiguration.getConfig();
      expect(config.showIcons).toBe(true);
    });

    it('should respect DEVLOGR_SHOW_ICONS=1 environment variable', () => {
      process.env.DEVLOGR_SHOW_ICONS = '1';
      const config = LogConfiguration.getConfig();
      expect(config.showIcons).toBe(true);
    });

    it('should show icons by default when DEVLOGR_SHOW_ICONS is not set', () => {
      delete process.env.DEVLOGR_SHOW_ICONS;
      const config = LogConfiguration.getConfig();
      expect(config.showIcons).toBe(true);
    });

    it('should hide icons in log output when DEVLOGR_SHOW_ICONS=false', () => {
      process.env.DEVLOGR_SHOW_ICONS = 'false';
      const logger = createLogger('TEST');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.info('Test message');
      logger.success('Success message');
      logger.error('Error message');

      expect(consoleSpy).toHaveBeenCalled();

      // Check that no Unicode symbols appear in the output
      const loggedMessages = consoleSpy.mock.calls.map(call => call[0] as string);
      loggedMessages.forEach(message => {
        expect(message).not.toMatch(/[✓✗!?•→●]/); // Common log symbols
      });

      consoleSpy.mockRestore();
    });

    it('should remove icon padding when DEVLOGR_SHOW_ICONS=false and DEVLOGR_SHOW_PREFIX=true', () => {
      process.env.DEVLOGR_SHOW_ICONS = 'false';
      process.env.DEVLOGR_SHOW_PREFIX = 'true';
      const logger = createLogger('TEST');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.info('Test message');

      expect(consoleSpy).toHaveBeenCalled();

      const loggedMessage = consoleSpy.mock.calls[0][0] as string;
      // Strip ANSI color codes for testing
      // eslint-disable-next-line no-control-regex
      const cleanMessage = loggedMessage.replace(/\u001b\[[0-9;]*m/g, '');

      // When icons are disabled, there should be no extra spacing before the log level
      // The message should start with the level label directly (no leading spaces for icon alignment)
      expect(cleanMessage).toMatch(/^INFO\s+\[TEST\]/);
      // Should NOT have the typical 2-space icon padding
      expect(cleanMessage).not.toMatch(/^\s{2}INFO/);

      consoleSpy.mockRestore();
    });
  });

  describe('Emoji Environment Variables', () => {
    it('should respect NO_EMOJI environment variable', () => {
      process.env.NO_EMOJI = '1';
      const logger = createLogger('TEST');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.info('Test with emoji 🚀');

      expect(consoleSpy).toHaveBeenCalled();
      const loggedMessage = consoleSpy.mock.calls[0][0];

      // Should not contain emoji
      expect(loggedMessage).not.toContain('🚀');
      expect(loggedMessage).toContain('Test with emoji');

      consoleSpy.mockRestore();
    });

    it('should respect DEVLOGR_SHOW_EMOJI=false environment variable', () => {
      process.env.DEVLOGR_SHOW_EMOJI = 'false';
      const logger = createLogger('TEST');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.info('Test with emoji 🚀');

      expect(consoleSpy).toHaveBeenCalled();
      const loggedMessage = consoleSpy.mock.calls[0][0];

      // Should not contain emoji
      expect(loggedMessage).not.toContain('🚀');
      expect(loggedMessage).toContain('Test with emoji');

      consoleSpy.mockRestore();
    });
  });

  describe('DEVLOGR_SHOW_TIMESTAMP Environment Variable', () => {
    it('should show timestamps when DEVLOGR_SHOW_TIMESTAMP=true', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'true';
      const logger = createLogger('TEST');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.info('Test message');

      expect(consoleSpy).toHaveBeenCalled();
      const loggedMessage = consoleSpy.mock.calls[0][0];

      // Should contain timestamp pattern [HH:MM:SS]
      expect(loggedMessage).toMatch(/\[\d{2}:\d{2}:\d{2}\]/);
      expect(loggedMessage).toContain('Test message');

      consoleSpy.mockRestore();
    });

    it('should not show timestamps when DEVLOGR_SHOW_TIMESTAMP is not set', () => {
      const logger = createLogger('TEST');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.info('Test message');

      expect(consoleSpy).toHaveBeenCalled();
      const loggedMessage = consoleSpy.mock.calls[0][0];

      // Should NOT contain timestamp pattern
      expect(loggedMessage).not.toMatch(/\[\d{2}:\d{2}:\d{2}\]/);
      expect(loggedMessage).toContain('Test message');

      consoleSpy.mockRestore();
    });

    it('should not show timestamps when DEVLOGR_SHOW_TIMESTAMP=false', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'false';
      const logger = createLogger('TEST');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.info('Test message');

      expect(consoleSpy).toHaveBeenCalled();
      const loggedMessage = consoleSpy.mock.calls[0][0];

      // Should NOT contain timestamp pattern
      expect(loggedMessage).not.toMatch(/\[\d{2}:\d{2}:\d{2}\]/);
      expect(loggedMessage).toContain('Test message');

      consoleSpy.mockRestore();
    });
  });

  describe('Combined Environment Variables', () => {
    it('should handle multiple environment variables together', () => {
      process.env.DEVLOGR_LOG_LEVEL = 'debug';
      process.env.DEVLOGR_OUTPUT_JSON = 'true';
      process.env.NO_COLOR = '1';

      const logger = createLogger('TEST');
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {}); // debug uses console.debug

      logger.debug('Debug message');

      expect(consoleSpy).toHaveBeenCalled();
      const loggedMessage = consoleSpy.mock.calls[0][0];

      // Should be JSON
      const parsed = JSON.parse(loggedMessage);
      expect(parsed).toMatchObject({
        level: 'debug',
        prefix: 'TEST',
        message: 'Debug message',
      });

      consoleSpy.mockRestore();
    });

    it('should handle DEVLOGR_SHOW_TIMESTAMP with other variables', () => {
      process.env.DEVLOGR_LOG_LEVEL = 'info';
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'true';
      process.env.DEVLOGR_FORCE_COLOR = '1';

      const logger = createLogger('TEST');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.info('Test message with timestamp');

      expect(consoleSpy).toHaveBeenCalled();
      const loggedMessage = consoleSpy.mock.calls[0][0];

      // Should contain timestamp and message
      expect(loggedMessage).toMatch(/\[\d{2}:\d{2}:\d{2}\]/);
      expect(loggedMessage).toContain('Test message with timestamp');

      consoleSpy.mockRestore();
    });
  });

  describe('Global Environment Variable Standards', () => {
    it('should respect NO_COLOR global standard', () => {
      process.env.NO_COLOR = '1';

      const logger = createLogger('test');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.info('Test message');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should respect NO_EMOJI global standard', () => {
      process.env.NO_EMOJI = '1';

      const logger = createLogger('test');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.info('Test message 🚀');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should respect NO_UNICODE global standard', () => {
      process.env.NO_UNICODE = '1';

      const logger = createLogger('test');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.info('Test message ℹ');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should prioritize global standards over devlogr-specific settings', () => {
      process.env.NO_COLOR = '1';
      process.env.DEVLOGR_FORCE_COLOR = 'true';

      const logger = createLogger('test');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.info('Test message');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle multiple global standards together', () => {
      process.env.NO_COLOR = '1';
      process.env.NO_EMOJI = '1';
      process.env.NO_UNICODE = '1';

      const logger = createLogger('test');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.info('Test message 🚀 ℹ');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
