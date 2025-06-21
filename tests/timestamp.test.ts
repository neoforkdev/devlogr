import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLogger, Logger } from '../src/logger';
import { LogLevel, TimestampFormat } from '../src/types';
import { SpinnerUtils } from '../src/utils';
import { LogConfiguration } from '../src/config';

describe('Logger Timestamp Behavior', () => {
  let logger: Logger;
  let consoleSpy: any;
  let consoleErrorSpy: any;
  let consoleWarnSpy: any;
  let consoleDebugSpy: any;
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };

    // Set up console spies
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

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
      logger = createLogger('TIMESTAMP_TEST');

      logger.info('Info message with timestamp');

      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls[0][0];

      // Should contain timestamp pattern [HH:MM:SS]
      expect(output).toMatch(/\[\d{2}:\d{2}:\d{2}\]/);
      // Should contain info symbol and label
      expect(output).toMatch(/INFO/);
      // Should contain prefix
      expect(output).toMatch(/\[TIMESTAMP_TEST\]/);
      // Should contain the message
      expect(output).toContain('Info message with timestamp');
    });

    it('should not show timestamps when DEVLOGR_SHOW_TIMESTAMP is not set', () => {
      logger = createLogger('NO_TIMESTAMP');

      logger.info('Info message without timestamp');

      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls[0][0];

      // Should NOT contain timestamp pattern
      expect(output).not.toMatch(/\[\d{2}:\d{2}:\d{2}\]/);
      // Should contain symbol and message in simple format
      expect(output).toMatch(/Info message without timestamp/);
    });

    it('should not show timestamps when DEVLOGR_SHOW_TIMESTAMP=false', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'false';
      logger = createLogger('FALSE_TIMESTAMP');

      logger.info('Info message without timestamp');

      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls[0][0];

      expect(output).not.toMatch(/\[\d{2}:\d{2}:\d{2}\]/);
      expect(output).toMatch(/Info message without timestamp/);
    });

    it('should show timestamps for all log levels when DEVLOGR_SHOW_TIMESTAMP=true', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'true';
      Logger.setLevel(LogLevel.TRACE);
      logger = createLogger('ALL_LEVELS');

      logger.error('Error with timestamp');
      logger.warning('Warning with timestamp');
      logger.info('Info with timestamp');
      logger.debug('Debug with timestamp');
      logger.trace('Trace with timestamp');

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

      // Check info output
      expect(consoleSpy).toHaveBeenCalled();
      const infoOutput = consoleSpy.mock.calls[0][0];
      expect(infoOutput).toMatch(/\[\d{2}:\d{2}:\d{2}\].*\[ALL_LEVELS\].*Info with timestamp/);

      // Check debug output
      expect(consoleDebugSpy).toHaveBeenCalled();
      const debugOutput = consoleDebugSpy.mock.calls[0][0];
      expect(debugOutput).toMatch(/\[\d{2}:\d{2}:\d{2}\].*\[ALL_LEVELS\].*Debug with timestamp/);

      // Check trace output
      const traceOutput = consoleDebugSpy.mock.calls[1][0];
      expect(traceOutput).toMatch(/\[\d{2}:\d{2}:\d{2}\].*\[ALL_LEVELS\].*Trace with timestamp/);
    });

    it('should not show timestamps for any level when DEVLOGR_SHOW_TIMESTAMP is not set', () => {
      Logger.setLevel(LogLevel.TRACE);
      logger = createLogger('NO_TIMESTAMPS');

      logger.error('Error without timestamp');
      logger.warning('Warning without timestamp');
      logger.info('Info without timestamp');
      logger.debug('Debug without timestamp');
      logger.trace('Trace without timestamp');

      // Check all outputs should NOT have timestamps
      const errorOutput = consoleErrorSpy.mock.calls[0][0];
      expect(errorOutput).not.toMatch(/\[\d{2}:\d{2}:\d{2}\]/);
      expect(errorOutput).toMatch(/Error without timestamp/);

      const warningOutput = consoleWarnSpy.mock.calls[0][0];
      expect(warningOutput).not.toMatch(/\[\d{2}:\d{2}:\d{2}\]/);
      expect(warningOutput).toMatch(/Warning without timestamp/);

      const infoOutput = consoleSpy.mock.calls[0][0];
      expect(infoOutput).not.toMatch(/\[\d{2}:\d{2}:\d{2}\]/);
      expect(infoOutput).toMatch(/Info without timestamp/);

      const debugOutput = consoleDebugSpy.mock.calls[0][0];
      expect(debugOutput).not.toMatch(/\[\d{2}:\d{2}:\d{2}\]/);
      expect(debugOutput).toMatch(/Debug without timestamp/);

      const traceOutput = consoleDebugSpy.mock.calls[1][0];
      expect(traceOutput).not.toMatch(/\[\d{2}:\d{2}:\d{2}\]/);
      expect(traceOutput).toMatch(/Trace without timestamp/);
    });

    it('should show proper trace formatting with timestamps', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'true';
      Logger.setLevel(LogLevel.TRACE);
      logger = createLogger('DIM_TEST');

      logger.trace('This should be dimmed');

      expect(consoleDebugSpy).toHaveBeenCalled();
      const output = consoleDebugSpy.mock.calls[0][0];

      // Verify trace message has proper formatting structure
      expect(output).toContain('TRACE');
      expect(output).toContain('DIM_TEST');
      expect(output).toContain('This should be dimmed');
      expect(output).toMatch(/\[\d{2}:\d{2}:\d{2}\]/); // Has timestamp
      expect(output).toMatch(/\[DIM_TEST\].*This should be dimmed/); // Proper structure
    });

    it('should work correctly with log level filtering', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'true';
      Logger.setLevel(LogLevel.WARNING);
      logger = createLogger('FILTERED');

      logger.trace('This should not appear');
      logger.debug('This should not appear');
      logger.info('This should not appear');
      logger.warning('This should appear with timestamp');
      logger.error('This should appear with timestamp');

      // Only warning and error should be called
      expect(consoleDebugSpy).not.toHaveBeenCalled();
      expect(consoleSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

      // Both should have timestamps
      const warningOutput = consoleWarnSpy.mock.calls[0][0];
      expect(warningOutput).toMatch(
        /\[\d{2}:\d{2}:\d{2}\].*\[FILTERED\].*This should appear with timestamp/
      );

      const errorOutput = consoleErrorSpy.mock.calls[0][0];
      expect(errorOutput).toMatch(
        /\[\d{2}:\d{2}:\d{2}\].*\[FILTERED\].*This should appear with timestamp/
      );
    });

    it('should use valid HH:MM:SS timestamp format', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'true';
      logger = createLogger('FORMAT_TEST');

      logger.info('Test timestamp format');

      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls[0][0];
      const timestampMatch = output.match(/\[(\d{2}:\d{2}:\d{2})\]/);

      expect(timestampMatch).toBeTruthy();
      const timestamp = timestampMatch![1];

      // Validate format
      expect(timestamp).toMatch(/^\d{2}:\d{2}:\d{2}$/);

      // Validate ranges
      const [hours, minutes, seconds] = timestamp.split(':').map(Number);
      expect(hours).toBeGreaterThanOrEqual(0);
      expect(hours).toBeLessThan(24);
      expect(minutes).toBeGreaterThanOrEqual(0);
      expect(minutes).toBeLessThan(60);
      expect(seconds).toBeGreaterThanOrEqual(0);
      expect(seconds).toBeLessThan(60);
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
      logger.completeSpinnerWithSuccess('Done!');

      expect(consoleSpy).toHaveBeenCalled();
      // In test environment, spinner falls back to task logging, then success logging
      // Check if any call contains the success message with ISO timestamp
      const calls = consoleSpy.mock.calls;
      const successCall = calls.find(
        (call: any[]) => call[0] && typeof call[0] === 'string' && call[0].includes('Done!')
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
      expect(output).toMatch(/"timestamp":"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z"/);

      delete process.env.DEVLOGR_OUTPUT_JSON;
    });
  });

  describe('TimestampFormat Configuration', () => {
    it('should default to TIME format when DEVLOGR_SHOW_TIMESTAMP=true', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'true';
      const config = LogConfiguration.getConfig();

      expect(config.showTimestamp).toBe(true);
      expect(config.timestampFormat).toBe(TimestampFormat.TIME);

      delete process.env.DEVLOGR_SHOW_TIMESTAMP;
    });

    it('should use ISO format when DEVLOGR_SHOW_TIMESTAMP=iso', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'iso';
      const config = LogConfiguration.getConfig();

      expect(config.showTimestamp).toBe(true);
      expect(config.timestampFormat).toBe(TimestampFormat.ISO);

      delete process.env.DEVLOGR_SHOW_TIMESTAMP;
    });

    it('should disable timestamps when DEVLOGR_SHOW_TIMESTAMP=false', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'false';
      const config = LogConfiguration.getConfig();

      expect(config.showTimestamp).toBe(false);
      expect(config.timestampFormat).toBe(TimestampFormat.TIME);

      delete process.env.DEVLOGR_SHOW_TIMESTAMP;
    });

    it('should default to TIME format for unknown timestamp values', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'unknown';
      const config = LogConfiguration.getConfig();

      expect(config.showTimestamp).toBe(true);
      expect(config.timestampFormat).toBe(TimestampFormat.TIME);

      delete process.env.DEVLOGR_SHOW_TIMESTAMP;
    });
  });
});
