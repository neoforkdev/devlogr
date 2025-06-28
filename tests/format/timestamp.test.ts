import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLogger, Logger } from '../../src/logger';
import { TimestampFormat } from '../../src/types';
import { LogConfiguration } from '../../src/config';

describe('Logger Timestamp Behavior', () => {
  let logger: Logger;
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };

    // Set up console spies
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});

    // Reset logger level
    Logger.resetLevel();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
    Logger.resetLevel();
  });

  describe('DEVLOGR_SHOW_TIMESTAMP Environment Variable', () => {
    it('should show timestamps when DEVLOGR_SHOW_TIMESTAMP=true', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'true';
      // Enable prefix to test both together
      process.env.DEVLOGR_SHOW_PREFIX = 'true';

      const logger = new Logger('TIMESTAMP_TEST');
      const consoleSpy = vi.spyOn(console, 'log');

      logger.info('Info message with timestamp');

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const output = String(consoleSpy.mock.calls[0][0]);

      // Should contain timestamp in HH:MM:SS format
      expect(output).toMatch(/\[\d{2}:\d{2}:\d{2}\]/);
      // Should contain level
      expect(output).toMatch(/INFO/);
      // Should contain prefix
      expect(output).toMatch(/\[TIMESTAMP_TEST\]/);
      // Should contain the message
      expect(output).toContain('Info message with timestamp');
    });

    it('should not show timestamps when DEVLOGR_SHOW_TIMESTAMP is not set', () => {
      const logger = new Logger('NO_TIMESTAMP_TEST');

      logger.info('Info message without timestamp');

      const output = consoleSpy.mock.calls[0][0] as string;

      // Should NOT contain timestamp
      expect(output).not.toMatch(/\[\d{2}:\d{2}:\d{2}\]/);
      // Should NOT contain level text (since prefix is disabled by default)
      expect(output).not.toMatch(/INFO/);
      // Should NOT contain prefix (default behavior)
      expect(output).not.toMatch(/\[NO_TIMESTAMP_TEST\]/);
      // Should contain the message
      expect(output).toContain('Info message without timestamp');
    });

    it('should not show timestamps when DEVLOGR_SHOW_TIMESTAMP=false', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'false';

      const logger = new Logger('FALSE_TIMESTAMP_TEST');

      logger.info('Info message with timestamp false');

      const output = consoleSpy.mock.calls[0][0] as string;

      // Should NOT contain timestamp
      expect(output).not.toMatch(/\[\d{2}:\d{2}:\d{2}\]/);
      // Should NOT contain level text (since prefix is disabled by default)
      expect(output).not.toMatch(/INFO/);
      // Should contain the message
      expect(output).toContain('Info message with timestamp false');
    });

    it('should show timestamps for all log levels when DEVLOGR_SHOW_TIMESTAMP=true', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'true';
      // Enable prefix to test both together
      process.env.DEVLOGR_SHOW_PREFIX = 'true';

      const logger = new Logger('ALL_LEVELS');
      const consoleLogSpy = vi.spyOn(console, 'log');
      const consoleErrorSpy = vi.spyOn(console, 'error');
      const consoleWarnSpy = vi.spyOn(console, 'warn');

      logger.info('Info with timestamp');
      logger.success('Success with timestamp');
      logger.error('Error with timestamp');
      logger.warning('Warning with timestamp');

      // Check info output
      expect(consoleLogSpy).toHaveBeenCalled();
      const infoOutput = consoleLogSpy.mock.calls[0][0];
      expect(infoOutput).toMatch(/\[\d{2}:\d{2}:\d{2}\].*\[ALL_LEVELS\].*Info with timestamp/);

      // Check error output
      expect(consoleErrorSpy).toHaveBeenCalled();
      const errorOutput = consoleErrorSpy.mock.calls[0][0];
      expect(errorOutput).toMatch(/\[\d{2}:\d{2}:\d{2}\].*\[ALL_LEVELS\].*Error with timestamp/);

      // Check warning output
      expect(consoleWarnSpy).toHaveBeenCalled();
      const warningOutput = consoleWarnSpy.mock.calls[0][0];
      expect(warningOutput).toMatch(
        /\[\d{2}:\d{2}:\d{2}\].*\[ALL_LEVELS\].*Warning with timestamp/
      );
    });

    it('should not show timestamps for any level when DEVLOGR_SHOW_TIMESTAMP is not set', () => {
      // Default behavior - no timestamp
      const logger = new Logger('NO_TIMESTAMP_LEVELS');
      const consoleLogSpy = vi.spyOn(console, 'log');
      const consoleErrorSpy = vi.spyOn(console, 'error');
      const consoleWarnSpy = vi.spyOn(console, 'warn');

      logger.info('Info without timestamp');
      logger.success('Success without timestamp');
      logger.error('Error without timestamp');
      logger.warning('Warning without timestamp');

      // All outputs should NOT contain timestamps
      const allCalls = [
        ...consoleLogSpy.mock.calls,
        ...consoleErrorSpy.mock.calls,
        ...consoleWarnSpy.mock.calls,
      ];

      allCalls.forEach(call => {
        const output = String(call[0]);
        expect(output).not.toMatch(/\[\d{2}:\d{2}:\d{2}\]/);
      });
    });

    it('should show proper trace formatting with timestamps', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'true';
      // Enable prefix to test both together
      process.env.DEVLOGR_SHOW_PREFIX = 'true';
      // Set log level to trace so trace messages aren't filtered out
      process.env.DEVLOGR_LOG_LEVEL = 'trace';

      const logger = new Logger('DIM_TEST');
      const consoleSpy = vi.spyOn(console, 'debug'); // Trace uses debug, not log

      logger.trace('This should be dimmed');

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const output = String(consoleSpy.mock.calls[0][0]);

      // Verify trace message has proper formatting structure
      expect(output).toContain('TRACE');
      expect(output).toContain('DIM_TEST');
      expect(output).toContain('This should be dimmed');
      expect(output).toMatch(/\[\d{2}:\d{2}:\d{2}\]/); // Has timestamp
    });

    it('should work correctly with log level filtering', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'true';
      process.env.DEVLOGR_LOG_LEVEL = 'warn';
      // Enable prefix to test both together
      process.env.DEVLOGR_SHOW_PREFIX = 'true';

      const logger = new Logger('FILTERED');
      const consoleLogSpy = vi.spyOn(console, 'log');
      const consoleWarnSpy = vi.spyOn(console, 'warn');
      const consoleErrorSpy = vi.spyOn(console, 'error');

      logger.info('This should not appear');
      logger.warning('This should appear with timestamp');
      logger.error('This should also appear with timestamp');

      // Info should not be called due to log level filtering
      expect(consoleLogSpy).not.toHaveBeenCalled();

      // Warning and error should be called
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

      // Both should have timestamps
      const warningOutput = consoleWarnSpy.mock.calls[0][0];
      expect(warningOutput).toMatch(
        /\[\d{2}:\d{2}:\d{2}\].*\[FILTERED\].*This should appear with timestamp/
      );

      const errorOutput = consoleErrorSpy.mock.calls[0][0];
      expect(errorOutput).toMatch(
        /\[\d{2}:\d{2}:\d{2}\].*\[FILTERED\].*This should also appear with timestamp/
      );
    });

    it('should use valid HH:MM:SS timestamp format', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'true';

      const logger = new Logger('FORMAT_TEST');
      const consoleSpy = vi.spyOn(console, 'log');

      logger.info('Format test message');

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const output = String(consoleSpy.mock.calls[0][0]);

      // Should match strict HH:MM:SS format
      const timestampMatch = output.match(/\[(\d{2}:\d{2}:\d{2})\]/);
      expect(timestampMatch).toBeTruthy();

      if (timestampMatch) {
        const timestamp = timestampMatch[1];
        const parts = timestamp.split(':');
        expect(parts).toHaveLength(3);

        const [hours, minutes, seconds] = parts.map(Number);
        expect(hours).toBeGreaterThanOrEqual(0);
        expect(hours).toBeLessThan(24);
        expect(minutes).toBeGreaterThanOrEqual(0);
        expect(minutes).toBeLessThan(60);
        expect(seconds).toBeGreaterThanOrEqual(0);
        expect(seconds).toBeLessThan(60);
      }
    });
  });

  describe('ISO Timestamp Format', () => {
    beforeEach(() => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'iso';
      logger = createLogger('test-iso');
    });

    afterEach(() => {
      delete process.env.DEVLOGR_SHOW_TIMESTAMP;
    });

    it('should use ISO timestamp format when DEVLOGR_SHOW_TIMESTAMP=iso', () => {
      logger.info('Test message');

      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls[0][0];

      expect(output).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
      expect(output).toContain('Test message');
    });

    it('should format ISO timestamps in spinners', () => {
      // In test environment, spinners fall back to regular logging
      // We just need to verify the logger was created with the right config
      const config = LogConfiguration.getConfig();
      expect(config.timestampFormat).toBe(TimestampFormat.ISO);

      logger.startSpinner('Processing...');

      // Verify the output uses ISO format
      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls[0][0] as string;
      expect(output).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
    });

    it('should maintain ISO format in spinner completion messages', () => {
      logger.startSpinner('Processing...');
      logger.succeedSpinner('Done!');

      expect(consoleSpy).toHaveBeenCalled();
      // In test environment, spinner falls back to task logging, then success logging
      // Check if any call contains the success message with ISO timestamp
      const calls = consoleSpy.mock.calls;
      const successCall = calls.find(
        (call: unknown[]) => call[0] && typeof call[0] === 'string' && call[0].includes('Done!')
      );

      expect(successCall).toBeDefined();
      const output = successCall[0] as string;
      expect(output).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
      expect(output).toContain('Done!');
    });

    it('should use ISO format in JSON mode timestamps', () => {
      process.env.DEVLOGR_OUTPUT_JSON = 'true';
      logger = createLogger('test-iso-json');

      logger.info('Test message');

      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls[0][0];
      expect(output).toMatch(/"timestamp"\s*:\s*"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z"/);

      delete process.env.DEVLOGR_OUTPUT_JSON;
    });
  });

  describe('TimestampFormat Configuration', () => {
    it('should default to TIME format when DEVLOGR_SHOW_TIMESTAMP=true', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'true';

      const config = LogConfiguration.getConfig();

      expect(config.showTimestamp).toBe(true);
      expect(config.timestampFormat).toBe(TimestampFormat.TIME);
    });

    it('should use ISO format when DEVLOGR_SHOW_TIMESTAMP=iso', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'iso';

      const config = LogConfiguration.getConfig();

      expect(config.showTimestamp).toBe(true);
      expect(config.timestampFormat).toBe(TimestampFormat.ISO);
    });

    it('should disable timestamps when DEVLOGR_SHOW_TIMESTAMP=false', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'false';

      const config = LogConfiguration.getConfig();

      expect(config.showTimestamp).toBe(false);
      expect(config.timestampFormat).toBe(TimestampFormat.TIME);
    });

    it('should default to disabled with TIME format for unknown timestamp values', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'invalid_value';

      const config = LogConfiguration.getConfig();

      expect(config.showTimestamp).toBe(false);
      expect(config.timestampFormat).toBe(TimestampFormat.TIME);
    });
  });
});
