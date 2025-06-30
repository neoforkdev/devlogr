import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Logger } from '../../src/logger';
import { LogConfiguration } from '../../src/config';

describe('Spinner Level Policy Consistency', () => {
  let originalEnv: Record<string, string | undefined>;
  let mockConsoleLog: ReturnType<typeof vi.fn>;
  let mockConsoleError: ReturnType<typeof vi.fn>;
  let mockConsoleWarn: ReturnType<typeof vi.fn>;
  let mockStdoutWrite: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Mock all console methods and stdout
    mockConsoleLog = vi.fn();
    mockConsoleError = vi.fn();
    mockConsoleWarn = vi.fn();
    mockStdoutWrite = vi.fn();

    vi.spyOn(console, 'log').mockImplementation(mockConsoleLog);
    vi.spyOn(console, 'error').mockImplementation(mockConsoleError);
    vi.spyOn(console, 'warn').mockImplementation(mockConsoleWarn);
    vi.spyOn(process.stdout, 'write').mockImplementation(mockStdoutWrite);

    // Force non-TTY to avoid spinner animations in tests
    Object.defineProperty(process.stdout, 'isTTY', {
      value: false,
      configurable: true,
    });

    // Clear configuration cache
    LogConfiguration.clearCache?.();
  });

  afterEach(() => {
    // Restore environment
    process.env = originalEnv;
    vi.restoreAllMocks();
    LogConfiguration.clearCache?.();
  });

  // Helper to get all console output
  const getAllConsoleOutput = () => {
    const allOutput = [
      ...mockConsoleLog.mock.calls.map(call => call[0]),
      ...mockConsoleError.mock.calls.map(call => call[0]),
      ...mockConsoleWarn.mock.calls.map(call => call[0]),
    ];
    return allOutput;
  };

  describe('Default Configuration (levels hidden)', () => {
    beforeEach(() => {
      // Ensure clean environment (default behavior)
      delete process.env.DEVLOGR_SHOW_PREFIX;
      LogConfiguration.clearCache?.();
    });

    it('should hide levels in both regular logs and spinner completions', () => {
      const logger = new Logger('test-default');

      // Test regular log messages
      logger.info('Regular info message');
      logger.success('Regular success message');
      logger.error('Regular error message');

      // Test spinner completion messages (in non-TTY these fallback to regular logging)
      logger.succeedSpinner('Spinner success message');
      logger.failSpinner('Spinner error message');
      logger.warnSpinner('Spinner warning message');

      // Analyze all console output from all methods
      const allLogs = getAllConsoleOutput();

      // Verify NO level labels appear in any output
      const hasLevelLabels = allLogs.some(
        log =>
          typeof log === 'string' &&
          (log.includes('INFO') ||
            log.includes('SUCCESS') ||
            log.includes('ERROR') ||
            log.includes('WARN') ||
            log.includes('TASK'))
      );

      expect(hasLevelLabels).toBe(false);

      // Verify messages still contain the actual content
      const allLogsString = allLogs.join(' ');
      expect(allLogsString).toContain('Regular info message');
      expect(allLogsString).toContain('Spinner success message');
      expect(allLogsString).toContain('Spinner error message');
    });

    it('should show only symbols without level text in completions', () => {
      const logger = new Logger('test-symbols');

      logger.succeedSpinner('Success message');
      logger.failSpinner('Error message');
      logger.warnSpinner('Warning message');
      logger.infoSpinner('Info message');

      const allLogs = getAllConsoleOutput();
      const allLogsString = allLogs.join(' ');

      // Should contain symbols but not level text
      expect(allLogsString).toMatch(/✓|✗|!|i/); // Contains symbols
      expect(allLogsString).not.toMatch(/SUCCESS|ERROR|WARN|INFO/); // No level text
    });
  });

  describe('With DEVLOGR_SHOW_PREFIX=true (levels shown)', () => {
    beforeEach(() => {
      process.env.DEVLOGR_SHOW_PREFIX = 'true';
      LogConfiguration.clearCache?.();
    });

    it('should show levels in both regular logs and spinner completions', () => {
      const logger = new Logger('test-with-levels');

      // Test regular log messages
      logger.info('Regular info message');
      logger.success('Regular success message');
      logger.error('Regular error message');

      // Test spinner completion messages (fallback to regular logging in non-TTY)
      logger.succeedSpinner('Spinner success message');
      logger.failSpinner('Spinner error message');

      // Analyze all console output
      const allLogs = getAllConsoleOutput();
      const allLogsString = allLogs.join(' ');

      // Verify level labels appear in output
      expect(allLogsString).toContain('INFO');
      expect(allLogsString).toContain('SUCCESS');
      expect(allLogsString).toContain('ERROR');

      // Verify content is still present
      expect(allLogsString).toContain('Regular info message');
      expect(allLogsString).toContain('Spinner success message');
      expect(allLogsString).toContain('Spinner error message');
    });

    it('should show consistent level formatting between regular logs and spinners', () => {
      const logger = new Logger('test-consistency');

      // Regular log
      logger.success('Regular success');

      // Spinner completion (fallback to regular logging in non-TTY)
      logger.succeedSpinner('Spinner success');

      const allLogs = getAllConsoleOutput();

      // Both should have SUCCESS level label
      const successLogs = allLogs.filter(log => typeof log === 'string' && log.includes('SUCCESS'));

      expect(successLogs).toHaveLength(2); // One regular, one spinner

      // Both should have similar formatting structure
      successLogs.forEach(log => {
        expect(log).toMatch(/SUCCESS.*✓/); // Level followed by symbol
      });
    });
  });

  describe('Level Policy Edge Cases', () => {
    it('should handle environment variable changes dynamically', () => {
      // Start without prefix
      delete process.env.DEVLOGR_SHOW_PREFIX;
      LogConfiguration.clearCache?.();

      const logger1 = new Logger('test-dynamic-1');
      logger1.succeedSpinner('First success');

      // Enable prefix
      process.env.DEVLOGR_SHOW_PREFIX = 'true';
      LogConfiguration.clearCache?.();

      const logger2 = new Logger('test-dynamic-2');
      logger2.succeedSpinner('Second success');

      const allLogs = getAllConsoleOutput();

      // First should not have level, second should
      const firstLog = allLogs.find(
        log => typeof log === 'string' && log.includes('First success')
      );
      const secondLog = allLogs.find(
        log => typeof log === 'string' && log.includes('Second success')
      );

      expect(firstLog).not.toContain('SUCCESS');
      expect(secondLog).toContain('SUCCESS');
    });

    it('should handle all spinner completion types consistently', () => {
      process.env.DEVLOGR_SHOW_PREFIX = 'true';
      LogConfiguration.clearCache?.();

      const logger = new Logger('test-all-types');

      // Test all completion methods (skip startSpinner since it doesn't output in non-TTY)
      logger.succeedSpinner('Success message');
      logger.failSpinner('Error message');
      logger.warnSpinner('Warning message');
      logger.infoSpinner('Info message');

      const allLogs = getAllConsoleOutput();
      const allLogsString = allLogs.join(' ');

      // All should show appropriate level labels
      expect(allLogsString).toContain('SUCCESS');
      expect(allLogsString).toContain('ERROR');
      expect(allLogsString).toContain('WARN');
      expect(allLogsString).toContain('INFO');
    });

    it('should respect level policy in JSON mode', () => {
      process.env.DEVLOGR_OUTPUT_JSON = 'true';
      process.env.DEVLOGR_SHOW_PREFIX = 'true';
      LogConfiguration.clearCache?.();

      const logger = new Logger('test-json');

      // Spinner should fallback to regular logging in JSON mode
      logger.succeedSpinner('Done');

      const allLogs = getAllConsoleOutput();

      // Should be JSON format, not regular format with levels
      const jsonLogs = allLogs.filter(log => {
        try {
          JSON.parse(log);
          return true;
        } catch {
          return false;
        }
      });

      expect(jsonLogs.length).toBeGreaterThan(0);

      // Verify JSON structure - success logs as LogLevel.INFO = 'info'
      const parsedLogs = jsonLogs.map(log => JSON.parse(log));
      expect(parsedLogs.some(log => log.level === 'info')).toBe(true);
    });
  });

  describe('Prefix Display Consistency', () => {
    it('should show prefixes consistently when enabled', () => {
      process.env.DEVLOGR_SHOW_PREFIX = 'true';
      LogConfiguration.clearCache?.();

      const logger = new Logger('test-prefix');

      logger.info('Regular message');
      logger.succeedSpinner('Spinner message');

      const allLogs = getAllConsoleOutput();
      const allLogsString = allLogs.join(' ');

      // Both should show the prefix [test-prefix]
      const prefixMatches = allLogsString.match(/\[test-prefix\]/g);
      expect(prefixMatches).toHaveLength(2);
    });

    it('should hide prefixes consistently when disabled', () => {
      delete process.env.DEVLOGR_SHOW_PREFIX;
      LogConfiguration.clearCache?.();

      const logger = new Logger('test-no-prefix');

      logger.info('Regular message');
      logger.succeedSpinner('Spinner message');

      const allLogs = getAllConsoleOutput();
      const allLogsString = allLogs.join(' ');

      // Neither should show the prefix
      expect(allLogsString).not.toContain('[test-no-prefix]');
    });
  });
});
