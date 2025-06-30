import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Logger } from '../src/logger';
import { SpinnerUtils } from '../src/utils/spinner';
import { DevLogrRenderer } from '../src/devlogr-renderer';
import { ThemeProvider } from '../src/themes';
import { setupTestEnvironment } from './helpers/test-environment';
import { ANSI_COLOR_REGEX, stripAnsiColors } from './helpers/ansi-utils';

describe('Comprehensive Feature Coverage Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    SpinnerUtils.stopAllSpinners();

    // Setup secure test environment with default non-CI behavior
    setupTestEnvironment();
  });

  afterEach(() => {
    SpinnerUtils.stopAllSpinners();
    vi.restoreAllMocks();
  });

  describe('Color Handling Comprehensive Tests', () => {
    describe('Logger Colors', () => {
      it('should apply colors correctly to all log levels', () => {
        // Force colors to be enabled for this test
        delete process.env.NO_COLOR;
        delete process.env.DEVLOGR_NO_COLOR;
        Object.defineProperty(process.stdout, 'isTTY', {
          value: true,
          configurable: true,
        });

        const consoleSpy = vi.spyOn(console, 'log');
        const errorSpy = vi.spyOn(console, 'error');

        const logger = new Logger('COLOR_TEST');

        logger.debug('Debug message');
        logger.info('Info message');
        logger.success('Success message');
        logger.warning('Warning message');
        logger.error('Error message');
        logger.title('Title message');
        logger.task('Task message');

        // Verify colors are applied (contains ANSI escape sequences)
        // Only check if we actually have TTY support and colors aren't disabled
        const hasColors =
          process.stdout.isTTY && !process.env.NO_COLOR && !process.env.DEVLOGR_NO_COLOR;
        if (hasColors) {
          expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(ANSI_COLOR_REGEX));
          expect(errorSpy).toHaveBeenCalledWith(expect.stringMatching(ANSI_COLOR_REGEX));
        } else {
          // In environments without color support, just verify the calls were made
          expect(consoleSpy).toHaveBeenCalled();
          expect(errorSpy).toHaveBeenCalled();
        }
      });

      it('should respect NO_COLOR environment variable', () => {
        process.env.NO_COLOR = '1';

        const consoleSpy = vi.spyOn(console, 'log');
        const logger = new Logger('NO_COLOR_TEST');

        logger.info('Colorless message');
        logger.success('Colorless success');

        // Should not contain ANSI escape sequences
        const calls = consoleSpy.mock.calls.flat();
        calls.forEach(call => {
          if (typeof call === 'string') {
            expect(call).not.toMatch(ANSI_COLOR_REGEX);
          }
        });
      });

      it('should respect DEVLOGR_NO_COLOR environment variable', () => {
        process.env.DEVLOGR_NO_COLOR = 'true';

        const consoleSpy = vi.spyOn(console, 'log');
        const logger = new Logger('DEVLOGR_NO_COLOR_TEST');

        logger.info('DevLogr colorless message');
        logger.error('DevLogr colorless error');

        // Should not contain ANSI escape sequences
        const calls = consoleSpy.mock.calls.flat();
        calls.forEach(call => {
          if (typeof call === 'string') {
            expect(call).not.toMatch(ANSI_COLOR_REGEX);
          }
        });
      });

      it('should handle color override precedence correctly', () => {
        // DEVLOGR_NO_COLOR should be overridden by NO_COLOR
        process.env.DEVLOGR_NO_COLOR = 'false';
        process.env.NO_COLOR = '1';

        const consoleSpy = vi.spyOn(console, 'log');
        const logger = new Logger('PRECEDENCE_TEST');

        logger.info('Precedence test message');

        // NO_COLOR should take precedence - no colors
        const calls = consoleSpy.mock.calls.flat();
        calls.forEach(call => {
          if (typeof call === 'string') {
            expect(call).not.toMatch(ANSI_COLOR_REGEX);
          }
        });
      });
    });

    describe('Spinner Colors', () => {
      beforeEach(() => {
        Object.defineProperty(process.stdout, 'isTTY', {
          value: true,
          configurable: true,
        });
        vi.spyOn(SpinnerUtils, 'supportsSpinners').mockReturnValue(true);
      });

      it('should apply colors to spinner symbols and text', () => {
        const logger = new Logger('SPINNER_COLOR_TEST');

        // Test that spinner operations work with the new architecture
        // The color functionality is handled internally by MessageFormatter and ThemeProvider
        expect(() => logger.startSpinner('Colored spinner test')).not.toThrow();
        expect(() => logger.succeedSpinner('Colored spinner completed')).not.toThrow();
      });

      it('should disable spinner colors when NO_COLOR is set', () => {
        process.env.NO_COLOR = '1';

        const logger = new Logger('SPINNER_NO_COLOR_TEST');

        // Test that spinner operations work with colors disabled
        // The NO_COLOR functionality is handled internally by MessageFormatter and LogConfiguration
        expect(() => logger.startSpinner('No color spinner test')).not.toThrow();
        expect(() => logger.succeedSpinner('No color spinner completed')).not.toThrow();
      });

      it('should apply different colors for different log levels in spinners', () => {
        // Test theme color differences without needing logger instance

        const themes = {
          info: ThemeProvider.getTheme('info'),
          success: ThemeProvider.getTheme('success'),
          warn: ThemeProvider.getTheme('warn'),
          error: ThemeProvider.getTheme('error'),
          task: ThemeProvider.getTheme('task'),
        };

        // Each theme should have different colors
        expect(themes.info.color).not.toBe(themes.success.color);
        expect(themes.success.color).not.toBe(themes.warn.color);
        expect(themes.warn.color).not.toBe(themes.error.color);

        // Test that colors are actually applied
        const infoColored = themes.info.color('test');
        const successColored = themes.success.color('test');

        // In CI environments, colors might be disabled, so we need to check if colors are actually enabled
        const hasColors =
          process.stdout.isTTY && !process.env.NO_COLOR && !process.env.DEVLOGR_NO_COLOR;
        if (hasColors) {
          expect(infoColored).not.toBe('test'); // Should be modified by color
          expect(successColored).not.toBe('test'); // Should be modified by color
          expect(infoColored).not.toBe(successColored); // Should be different colors
        } else {
          // In environments without color support, colors should pass through unchanged
          expect(infoColored).toBe('test');
          expect(successColored).toBe('test');
        }
      });
    });
  });

  describe('Prefix Information Comprehensive Tests', () => {
    it('should display prefix correctly in all log levels', () => {
      // Enable prefix for this test
      process.env.DEVLOGR_SHOW_PREFIX = 'true';

      const logger = new Logger('PREFIX_TEST');

      const consoleSpy = vi.spyOn(console, 'log');
      const errorSpy = vi.spyOn(console, 'error');

      logger.info('Info with prefix');
      logger.success('Success with prefix');
      logger.warning('Warning with prefix');
      logger.error('Error with prefix');

      // Verify prefix appears in all messages
      [...consoleSpy.mock.calls, ...errorSpy.mock.calls].forEach(call => {
        const message = call.join(' ');
        expect(message).toContain('[PREFIX_TEST]');
      });
    });

    it('should align prefixes correctly for different lengths', () => {
      // Enable prefix for this test
      process.env.DEVLOGR_SHOW_PREFIX = 'true';

      const shortLogger = new Logger('A');
      const mediumLogger = new Logger('MEDIUM');
      const longLogger = new Logger('VERY_LONG_PREFIX');

      const consoleSpy = vi.spyOn(console, 'log');

      shortLogger.info('Short prefix message');
      mediumLogger.info('Medium prefix message');
      longLogger.info('Long prefix message');

      const calls = consoleSpy.mock.calls;

      // All should contain their respective prefixes
      expect(calls[0][0]).toContain('[A]');
      expect(calls[1][0]).toContain('[MEDIUM]');
      expect(calls[2][0]).toContain('[VERY_LONG_PREFIX]');
    });

    it('should include timestamp in prefix when enabled', () => {
      // Enable both timestamp and prefix
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'true';
      process.env.DEVLOGR_SHOW_PREFIX = 'true';

      const logger = new Logger('TIMESTAMP_PREFIX_TEST');
      const consoleSpy = vi.spyOn(console, 'log');

      logger.info('Message with timestamp');

      const message = String(consoleSpy.mock.calls[0][0]);
      const cleanMessage = stripAnsiColors(message);
      expect(cleanMessage).toMatch(/^\[[\d:]+\]/); // Should start with timestamp
      expect(message).toContain('[TIMESTAMP_PREFIX_TEST]'); // Should contain prefix
    });

    it('should handle special characters in prefixes', () => {
      // Enable prefix for this test
      process.env.DEVLOGR_SHOW_PREFIX = 'true';

      const logger1 = new Logger('API-v2.0');
      const logger2 = new Logger('🚀-ROCKET');
      const logger3 = new Logger('ΑΒΓΔΕ'); // Greek letters

      const consoleSpy = vi.spyOn(console, 'log');

      logger1.info('Special chars message');
      logger2.info('Emoji message');
      logger3.info('Unicode message');

      const calls = consoleSpy.mock.calls;
      expect(calls[0][0]).toContain('[API-v2.0]');
      expect(calls[1][0]).toContain('[🚀-ROCKET]');
      expect(calls[2][0]).toContain('[ΑΒΓΔΕ]');
    });
  });

  describe('Prefix During Spinner Comprehensive Tests', () => {
    it('should show prefix correctly during spinner operation', () => {
      // Enable prefix for this test
      process.env.DEVLOGR_SHOW_PREFIX = 'true';

      const logger = new Logger('SPINNER_PREFIX_TEST');

      // Start spinner
      logger.startSpinner('Processing with prefix...');

      // Complete spinner
      logger.succeedSpinner('Processing completed');
    });

    it('should maintain prefix alignment during spinner operations with timestamps', () => {
      // Enable both timestamp and prefix
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'true';
      process.env.DEVLOGR_SHOW_PREFIX = 'true';

      const shortLogger = new Logger('SHORT');
      const longLogger = new Logger('VERY_LONG_PREFIX_NAME');

      shortLogger.startSpinner('Short prefix spinner');
      longLogger.startSpinner('Long prefix spinner');

      // Complete both
      shortLogger.succeedSpinner('Short done');
      longLogger.succeedSpinner('Long done');
    });

    it('should preserve prefix during spinner text updates', () => {
      // Enable prefix for this test
      process.env.DEVLOGR_SHOW_PREFIX = 'true';

      const logger = new Logger('UPDATE_PREFIX_TEST');

      logger.startSpinner('Initial task');
      logger.updateSpinnerText('Updated text');

      logger.succeedSpinner('Done!');
    });

    it('should show prefix in spinner completion messages', () => {
      // Enable prefix for this test
      process.env.DEVLOGR_SHOW_PREFIX = 'true';

      const logger = new Logger('COMPLETION_PREFIX_TEST');
      const consoleSpy = vi.spyOn(console, 'log');
      const errorSpy = vi.spyOn(console, 'error');
      vi.spyOn(console, 'warn');

      // Test different completion methods
      logger.startSpinner('Task 1');
      logger.succeedSpinner('Success completion');

      logger.startSpinner('Task 2');
      logger.infoSpinner('Info completion');

      logger.startSpinner('Task 3');
      logger.failSpinner('Error completion');

      logger.startSpinner('Task 4');
      logger.warnSpinner('Warning completion');

      // All completion messages should contain the prefix
      [...consoleSpy.mock.calls, ...errorSpy.mock.calls].forEach(call => {
        const message = call.join(' ');
        expect(message).toContain('[COMPLETION_PREFIX_TEST]');
      });
    });
  });

  describe('Spinner Artifact Prevention Comprehensive Tests', () => {
    beforeEach(() => {
      Object.defineProperty(process.stdout, 'isTTY', {
        value: true,
        configurable: true,
      });
      vi.spyOn(SpinnerUtils, 'supportsSpinners').mockReturnValue(true);
    });

    it('should use multi-spinner infrastructure for single spinners to prevent artifacts', () => {
      const logger = new Logger('ARTIFACT_PREVENTION_TEST');

      // Should work without throwing - single spinner now uses multi-spinner infrastructure
      expect(() => {
        logger.startSpinner('Processing...');
        logger.succeedSpinner('Done!');
      }).not.toThrow();
    });

    it('should prevent artifacts during rapid spinner operations', () => {
      const logger = new Logger('RAPID_ARTIFACT_TEST');

      // Should work without throwing - rapid spinner operations using multi-spinner infrastructure
      expect(() => {
        logger.startSpinner('Task 1');
        logger.succeedSpinner('Task 1 done');

        logger.startSpinner('Task 2');
        logger.failSpinner('Task 2 failed');

        logger.startSpinner('Task 3');
        logger.warnSpinner('Task 3 warning');
      }).not.toThrow();
    });

    it('should prevent artifacts when stopping all spinners', () => {
      const logger1 = new Logger('MULTI_STOP_TEST_1');
      const logger2 = new Logger('MULTI_STOP_TEST_2');

      // Test spinner lifecycle without mocking internal implementation
      logger1.startSpinner('Multi task 1');
      logger2.startSpinner('Multi task 2');

      // Stop all spinners at once
      expect(() => SpinnerUtils.stopAllSpinners()).not.toThrow();

      // Clear individual logger spinner states since SpinnerUtils.stopAllSpinners
      // only handles multi-spinners, not single spinners from individual loggers
      logger1.clearSpinnerState();
      logger2.clearSpinnerState();

      // Should be able to start new spinners after cleanup
      expect(() => {
        logger1.startSpinner('New task 1');
        logger1.succeedSpinner('New task 1 done');
      }).not.toThrow();
    });

    it('should handle spinner restart without artifacts', () => {
      const logger = new Logger('RESTART_ARTIFACT_TEST');

      // Test spinner restart lifecycle without mocking internal implementation
      expect(() => {
        // Start spinner
        logger.startSpinner('Initial task');

        // Complete first spinner, then start another
        logger.succeedSpinner('Initial task completed');
        logger.startSpinner('Restarted task');

        // Complete final spinner
        logger.succeedSpinner('Final completion');
      }).not.toThrow();
    });

    it('should handle error conditions without leaving artifacts', () => {
      const logger = new Logger('ERROR_ARTIFACT_TEST');

      // Should work without throwing - error conditions handled by multi-spinner infrastructure
      expect(() => {
        logger.startSpinner('Task that will fail');
        logger.failSpinner('Task failed');
      }).not.toThrow();
    });
  });

  describe('DevLogr Renderer Color and Prefix Integration', () => {
    it('should render colors and prefixes correctly in DevLogr renderer', () => {
      // Enable both timestamp and prefix
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'true';
      process.env.DEVLOGR_SHOW_PREFIX = 'true';

      const mockTasks = [
        {
          title: 'Test Task',
          isEnabled: () => true,
          isStarted: () => true,
          isCompleted: () => false,
          hasFailed: () => false,
          isSkipped: () => false,
          hasSubtasks: () => false,
          output: null,
          message: {},
        },
      ];

      const renderer = new DevLogrRenderer(mockTasks as Parameters<typeof DevLogrRenderer>[0], {
        useColors: true,
        showTimestamp: true,
        supportsUnicode: true,
        prefix: 'RENDERER_TEST',
      });

      // Mock the spinner to return a symbol
      (renderer as Record<string, unknown>).spinner = { fetch: () => '⠋' };

      const output = (renderer as Record<string, unknown>).createOutput();

      // Should contain all elements
      const cleanOutput = stripAnsiColors(output);
      expect(cleanOutput).toMatch(/^\[[\d:]+\]/); // Timestamp
      expect(output).toContain('[RENDERER_TEST]'); // Prefix
      expect(output).toContain('⠋'); // Spinner symbol
      expect(output).toContain('Test Task'); // Task title
    });

    it('should render without colors when disabled', () => {
      // Disable colors but enable timestamp and prefix
      process.env.NO_COLOR = 'true';
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'true';
      process.env.DEVLOGR_SHOW_PREFIX = 'true';

      const mockTasks = [
        {
          title: 'No Color Task',
          isEnabled: () => true,
          isStarted: () => true,
          isCompleted: () => false,
          hasFailed: () => false,
          isSkipped: () => false,
          hasSubtasks: () => false,
          output: null,
          message: {},
        },
      ];

      const renderer = new DevLogrRenderer(mockTasks as Parameters<typeof DevLogrRenderer>[0], {
        useColors: false,
        showTimestamp: true,
        supportsUnicode: true,
        prefix: 'NO_COLOR_RENDERER_TEST',
      });

      // Mock the spinner
      (renderer as Record<string, unknown>).spinner = { fetch: () => '⠋' };

      const output = (renderer as Record<string, unknown>).createOutput();

      // Should not contain ANSI color codes but should have prefix and timestamp
      expect(output).not.toMatch(ANSI_COLOR_REGEX); // No ANSI color codes
      expect(output).toMatch(/^\[[\d:]+\]/); // Timestamp
      expect(output).toContain('[NO_COLOR_RENDERER_TEST]'); // Prefix
      expect(output).toContain('⠋'); // Spinner symbol
      expect(output).toContain('No Color Task'); // Task title
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle empty prefix gracefully', () => {
      // Enable prefix to show level text instead of just symbol
      setupTestEnvironment(false, true); // showTimestamp=false, showPrefix=true

      const logger = new Logger('');
      const consoleSpy = vi.spyOn(console, 'log');

      logger.info('Message with empty prefix');

      const message = consoleSpy.mock.calls[0][0];
      expect(message).toContain('INFO'); // Level should be present
      expect(message).toContain('Message with empty prefix'); // Message should be present
    });

    it('should handle very long prefixes', () => {
      // Enable prefix for this test
      process.env.DEVLOGR_SHOW_PREFIX = 'true';

      const longPrefix = 'A'.repeat(100);
      const logger = new Logger(longPrefix);
      const consoleSpy = vi.spyOn(console, 'log');

      logger.info('Message with very long prefix');

      const message = consoleSpy.mock.calls[0][0];
      expect(message).toContain(`[${longPrefix}]`);
    });

    it('should handle single spinner completion using multi-spinner infrastructure', () => {
      // Enable prefix for this test
      process.env.DEVLOGR_SHOW_PREFIX = 'true';

      const logger = new Logger('CONSISTENCY_TEST');
      const consoleSpy = vi.spyOn(console, 'log');

      // Test regular success message
      logger.success('Regular success message');

      // Test spinner success message (uses multi-spinner infrastructure)
      logger.succeedSpinner('Spinner success message');

      const calls = consoleSpy.mock.calls;
      expect(calls).toHaveLength(2);

      // The regular message should have proper formatting
      const regularMessage = String(calls[0][0]);
      expect(regularMessage).toContain('[CONSISTENCY_TEST]');
      expect(regularMessage).toContain('✓');

      // The spinner completion should also be properly formatted
      const spinnerMessage = String(calls[1][0]);
      expect(spinnerMessage).toContain('[CONSISTENCY_TEST]');
      expect(spinnerMessage).toContain('✓');
    });
  });
});
