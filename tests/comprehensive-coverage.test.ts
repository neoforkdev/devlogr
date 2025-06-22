import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Logger } from '../src/logger';
import { SpinnerUtils } from '../src/utils/spinner';
import { DevLogrRenderer } from '../src/devlogr-renderer';
import { MessageFormatter } from '../src/formatters';
import { ThemeProvider } from '../src/themes';
import chalk from 'chalk';

describe('Comprehensive Feature Coverage Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    SpinnerUtils.stopAllSpinners();

    // Clean up environment variables
    ['NO_COLOR', 'DEVLOGR_NO_COLOR', 'DEVLOGR_SHOW_TIMESTAMP', 'DEVLOGR_LOG_LEVEL'].forEach(
      key => delete process.env[key]
    );
  });

  afterEach(() => {
    SpinnerUtils.stopAllSpinners();
    vi.restoreAllMocks();
  });

  describe('Color Handling Comprehensive Tests', () => {
    describe('Logger Colors', () => {
      it('should apply colors correctly to all log levels', () => {
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
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/\u001b\[/));
        expect(errorSpy).toHaveBeenCalledWith(expect.stringMatching(/\u001b\[/));
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
            expect(call).not.toMatch(/\u001b\[/);
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
            expect(call).not.toMatch(/\u001b\[/);
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
            expect(call).not.toMatch(/\u001b\[/);
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

        const createSpy = vi.spyOn(SpinnerUtils, 'create').mockImplementation(options => {
          if (options?.useColors) {
            // When colors are enabled, theme colors should be applied
            expect(options.theme?.color).toBeDefined();
            expect(typeof options.theme?.color).toBe('function');

            // Test that the color function works
            const coloredText = options.theme?.color('test');
            expect(coloredText).toBeDefined();
          }

          return {
            start: vi.fn(),
            stop: vi.fn(),
            clear: vi.fn(),
            text: options?.text || '',
          } as any;
        });

        logger.startSpinner('Colored spinner test');

        expect(createSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            useColors: true,
            theme: expect.objectContaining({
              color: expect.any(Function),
              symbol: expect.any(String),
              label: expect.any(String),
            }),
          })
        );
      });

      it('should disable spinner colors when NO_COLOR is set', () => {
        process.env.NO_COLOR = '1';

        const logger = new Logger('SPINNER_NO_COLOR_TEST');

        const createSpy = vi.spyOn(SpinnerUtils, 'create').mockImplementation(options => {
          expect(options?.useColors).toBe(false);

          return {
            start: vi.fn(),
            stop: vi.fn(),
            clear: vi.fn(),
            text: options?.text || '',
          } as any;
        });

        logger.startSpinner('No color spinner test');

        expect(createSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            useColors: false,
          })
        );
      });

      it('should apply different colors for different log levels in spinners', () => {
        const logger = new Logger('SPINNER_LEVEL_COLOR_TEST');

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

        expect(infoColored).not.toBe('test'); // Should be modified by color
        expect(successColored).not.toBe('test'); // Should be modified by color
        expect(infoColored).not.toBe(successColored); // Should be different colors
      });
    });
  });

  describe('Prefix Information Comprehensive Tests', () => {
    it('should display prefix correctly in all log levels', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const errorSpy = vi.spyOn(console, 'error');

      const logger = new Logger('PREFIX_TEST');

      logger.debug('Debug with prefix');
      logger.info('Info with prefix');
      logger.success('Success with prefix');
      logger.warning('Warning with prefix');
      logger.error('Error with prefix');

      // All calls should contain the prefix
      [...consoleSpy.mock.calls, ...errorSpy.mock.calls].forEach(call => {
        const message = call.join(' ');
        expect(message).toContain('[PREFIX_TEST]');
      });
    });

    it('should align prefixes correctly for different lengths', () => {
      const consoleSpy = vi.spyOn(console, 'log');

      const shortLogger = new Logger('A');
      const mediumLogger = new Logger('MEDIUM');
      const longLogger = new Logger('VERY_LONG_PREFIX');

      shortLogger.info('Short prefix message');
      mediumLogger.info('Medium prefix message');
      longLogger.info('Long prefix message');

      const calls = consoleSpy.mock.calls;
      expect(calls).toHaveLength(3);

      // All should contain their respective prefixes
      expect(calls[0][0]).toContain('[A]');
      expect(calls[1][0]).toContain('[MEDIUM]');
      expect(calls[2][0]).toContain('[VERY_LONG_PREFIX]');

      // Prefixes should be aligned (all messages should have similar structure length before content)
      const shortPrefixPart = String(calls[0][0]).split('Short prefix message')[0];
      const mediumPrefixPart = String(calls[1][0]).split('Medium prefix message')[0];
      const longPrefixPart = String(calls[2][0]).split('Long prefix message')[0];

      // The longest prefix should be the reference point
      expect(longPrefixPart.length).toBeGreaterThanOrEqual(mediumPrefixPart.length);
      expect(mediumPrefixPart.length).toBeGreaterThanOrEqual(shortPrefixPart.length);
    });

    it('should include timestamp in prefix when enabled', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'true';

      const consoleSpy = vi.spyOn(console, 'log');
      const logger = new Logger('TIMESTAMP_PREFIX_TEST');

      logger.info('Message with timestamp');

      const message = consoleSpy.mock.calls[0][0];
      // Strip ANSI codes for timestamp check
      const cleanMessage = message.replace(/\u001b\[[0-9;]*m/g, '');
      expect(cleanMessage).toMatch(/^\[[\d:]+\]/); // Should start with timestamp
      expect(message).toContain('[TIMESTAMP_PREFIX_TEST]'); // Should contain prefix
    });

    it('should handle special characters in prefixes', () => {
      const consoleSpy = vi.spyOn(console, 'log');

      const specialLogger = new Logger('API-v2.0');
      const emojiLogger = new Logger('🚀-ROCKET');
      const unicodeLogger = new Logger('ΑΒΓΔΕ');

      specialLogger.info('Special chars message');
      emojiLogger.info('Emoji message');
      unicodeLogger.info('Unicode message');

      const calls = consoleSpy.mock.calls;
      expect(calls[0][0]).toContain('[API-v2.0]');
      expect(calls[1][0]).toContain('[🚀-ROCKET]');
      expect(calls[2][0]).toContain('[ΑΒΓΔΕ]');
    });
  });

  describe('Prefix During Spinner Comprehensive Tests', () => {
    beforeEach(() => {
      Object.defineProperty(process.stdout, 'isTTY', {
        value: true,
        configurable: true,
      });
      vi.spyOn(SpinnerUtils, 'supportsSpinners').mockReturnValue(true);
    });

    it('should show prefix correctly during spinner operation', () => {
      const logger = new Logger('SPINNER_PREFIX_TEST');

      const createSpy = vi.spyOn(SpinnerUtils, 'create').mockImplementation(options => {
        expect(options?.prefix).toBe('SPINNER_PREFIX_TEST');

        // If timestamps are enabled, should have prefixText
        if (options?.showTimestamp) {
          expect(options.prefixText).toBeDefined();
          expect(options.prefixText).toContain('[SPINNER_PREFIX_TEST]');
        }

        return {
          start: vi.fn(),
          stop: vi.fn(),
          clear: vi.fn(),
          text: options?.text || '',
        } as any;
      });

      logger.startSpinner('Processing with prefix...');

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          prefix: 'SPINNER_PREFIX_TEST',
          text: 'Processing with prefix...',
        })
      );
    });

    it('should maintain prefix alignment during spinner operations with timestamps', () => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'true';

      const shortLogger = new Logger('API');
      const longLogger = new Logger('BACKEND_SERVICE');

      const createSpy = vi.spyOn(SpinnerUtils, 'create').mockImplementation(options => {
        if (options?.prefixText) {
          // Should contain timestamp, symbol, level, and aligned prefix
          expect(options.prefixText).toMatch(/^\[[\d:]+\] . .+\s+\[.+\]$/);
          expect(options.prefixText).not.toMatch(/ $/); // No trailing space

          if (options.prefix === 'API') {
            expect(options.prefixText).toContain('[API]');
          } else if (options.prefix === 'BACKEND_SERVICE') {
            expect(options.prefixText).toContain('[BACKEND_SERVICE]');
          }
        }

        return {
          start: vi.fn(),
          stop: vi.fn(),
          clear: vi.fn(),
          text: options?.text || '',
        } as any;
      });

      shortLogger.startSpinner('Short prefix spinner');
      longLogger.startSpinner('Long prefix spinner');

      expect(createSpy).toHaveBeenCalledTimes(2);
    });

    it('should preserve prefix during spinner text updates', () => {
      const logger = new Logger('UPDATE_PREFIX_TEST');

      const updateSpy = vi.spyOn(SpinnerUtils, 'updateText').mockImplementation((key, text) => {
        expect(key).toBe('UPDATE_PREFIX_TEST'); // Key should be the prefix
      });

      logger.startSpinner('Initial text');
      logger.updateSpinnerText('Updated text');

      expect(updateSpy).toHaveBeenCalledWith('UPDATE_PREFIX_TEST', 'Updated text');
    });

    it('should show prefix in spinner completion messages', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const errorSpy = vi.spyOn(console, 'error');

      const logger = new Logger('COMPLETION_PREFIX_TEST');

      logger.succeedSpinner('Success completion');
      logger.failSpinner('Error completion');
      logger.warnSpinner('Warning completion');
      logger.infoSpinner('Info completion');

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

    it('should call clear() and stop() on spinner completion to prevent artifacts', () => {
      const logger = new Logger('ARTIFACT_PREVENTION_TEST');

      const mockSpinner = {
        start: vi.fn(),
        stop: vi.fn(),
        clear: vi.fn(),
        text: '',
      };

      vi.spyOn(SpinnerUtils, 'create').mockReturnValue(mockSpinner as any);

      logger.startSpinner('Processing...');
      logger.succeedSpinner('Done!');

      // Both stop and clear should be called for artifact prevention
      expect(mockSpinner.stop).toHaveBeenCalled();
      expect(mockSpinner.clear).toHaveBeenCalled();

      // Clear should be called after stop for proper cleanup order
      const stopOrder = mockSpinner.stop.mock.invocationCallOrder[0];
      const clearOrder = mockSpinner.clear.mock.invocationCallOrder[0];
      expect(clearOrder).toBeGreaterThanOrEqual(stopOrder);
    });

    it('should prevent artifacts during rapid spinner operations', () => {
      const logger = new Logger('RAPID_ARTIFACT_TEST');

      const mockSpinners: any[] = [];

      vi.spyOn(SpinnerUtils, 'create').mockImplementation(() => {
        const spinner = {
          start: vi.fn(),
          stop: vi.fn(),
          clear: vi.fn(),
          text: '',
        };
        mockSpinners.push(spinner);
        return spinner as any;
      });

      // Rapid spinner operations
      logger.startSpinner('Task 1');
      logger.succeedSpinner('Task 1 done');

      logger.startSpinner('Task 2');
      logger.failSpinner('Task 2 failed');

      logger.startSpinner('Task 3');
      logger.warnSpinner('Task 3 warning');

      // All spinners should have been properly cleaned up
      mockSpinners.forEach(spinner => {
        expect(spinner.stop).toHaveBeenCalled();
        expect(spinner.clear).toHaveBeenCalled();
      });
    });

    it('should prevent artifacts when stopping all spinners', () => {
      const logger1 = new Logger('MULTI_STOP_TEST_1');
      const logger2 = new Logger('MULTI_STOP_TEST_2');

      const mockSpinners: any[] = [];

      vi.spyOn(SpinnerUtils, 'create').mockImplementation(() => {
        const spinner = {
          start: vi.fn(),
          stop: vi.fn(),
          clear: vi.fn(),
          text: '',
        };
        mockSpinners.push(spinner);
        return spinner as any;
      });

      logger1.startSpinner('Multi task 1');
      logger2.startSpinner('Multi task 2');

      // Stop all spinners at once
      SpinnerUtils.stopAllSpinners();

      // All spinners should be cleaned up
      mockSpinners.forEach(spinner => {
        expect(spinner.stop).toHaveBeenCalled();
        expect(spinner.clear).toHaveBeenCalled();
      });
    });

    it('should handle spinner restart without artifacts', () => {
      const logger = new Logger('RESTART_ARTIFACT_TEST');

      const mockSpinners: any[] = [];

      vi.spyOn(SpinnerUtils, 'create').mockImplementation(() => {
        const spinner = {
          start: vi.fn(),
          stop: vi.fn(),
          clear: vi.fn(),
          text: '',
        };
        mockSpinners.push(spinner);
        return spinner as any;
      });

      // Start spinner
      logger.startSpinner('Initial task');

      // Start another spinner with same key (should stop previous one)
      logger.startSpinner('Restarted task');

      // Complete final spinner
      logger.succeedSpinner('Final completion');

      // All spinner instances should be properly cleaned up
      mockSpinners.forEach(spinner => {
        expect(spinner.stop).toHaveBeenCalled();
        expect(spinner.clear).toHaveBeenCalled();
      });
    });

    it('should handle error conditions without leaving artifacts', () => {
      const logger = new Logger('ERROR_ARTIFACT_TEST');

      const mockSpinner = {
        start: vi.fn(),
        stop: vi.fn(),
        clear: vi.fn(),
        text: '',
      };

      vi.spyOn(SpinnerUtils, 'create').mockReturnValue(mockSpinner as any);

      logger.startSpinner('Task that will fail');

      // Simulate error condition by directly calling fail
      SpinnerUtils.fail('ERROR_ARTIFACT_TEST', 'Task failed');

      // Should still clean up properly
      expect(mockSpinner.stop).toHaveBeenCalled();
      expect(mockSpinner.clear).toHaveBeenCalled();
    });
  });

  describe('DevLogr Renderer Color and Prefix Integration', () => {
    it('should render colors and prefixes correctly in DevLogr renderer', () => {
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

      const renderer = new DevLogrRenderer(mockTasks as any, {
        useColors: true,
        showTimestamp: true,
        supportsUnicode: true,
        prefix: 'RENDERER_TEST',
      });

      // Mock the spinner to return a symbol
      (renderer as any).spinner = { fetch: () => '⠋' };

      const output = (renderer as any).createOutput();

      // Should contain colors, timestamp, and prefix
      expect(output).toContain('\u001b['); // ANSI color codes
      // Strip ANSI codes for timestamp check
      const cleanOutput = output.replace(/\u001b\[[0-9;]*m/g, '');
      expect(cleanOutput).toMatch(/^\[[\d:]+\]/); // Timestamp
      expect(output).toContain('[RENDERER_TEST]'); // Prefix
      expect(output).toContain('⠋'); // Spinner symbol
      expect(output).toContain('Test Task'); // Task title
    });

    it('should render without colors when disabled', () => {
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

      const renderer = new DevLogrRenderer(mockTasks as any, {
        useColors: false,
        showTimestamp: true,
        supportsUnicode: true,
        prefix: 'NO_COLOR_RENDERER_TEST',
      });

      // Mock the spinner
      (renderer as any).spinner = { fetch: () => '⠋' };

      const output = (renderer as any).createOutput();

      // Should not contain ANSI color codes but should have other elements
      expect(output).not.toContain('\u001b['); // No ANSI color codes
      expect(output).toMatch(/^\[[\d:]+\]/); // Timestamp
      expect(output).toContain('[NO_COLOR_RENDERER_TEST]'); // Prefix
      expect(output).toContain('⠋'); // Spinner symbol
      expect(output).toContain('No Color Task'); // Task title
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle empty prefix gracefully', () => {
      const logger = new Logger('');
      const consoleSpy = vi.spyOn(console, 'log');

      logger.info('Message with empty prefix');

      // Should still work, might show empty brackets or handle gracefully
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle very long prefixes', () => {
      const longPrefix = 'A'.repeat(100);
      const logger = new Logger(longPrefix);
      const consoleSpy = vi.spyOn(console, 'log');

      logger.info('Message with very long prefix');

      const message = consoleSpy.mock.calls[0][0];
      expect(message).toContain(`[${longPrefix}]`);
    });

    it('should maintain consistency between regular logging and spinner completion', () => {
      Object.defineProperty(process.stdout, 'isTTY', {
        value: true,
        configurable: true,
      });
      vi.spyOn(SpinnerUtils, 'supportsSpinners').mockReturnValue(true);

      const logger = new Logger('CONSISTENCY_TEST');
      const consoleSpy = vi.spyOn(console, 'log');

      // Regular logging
      logger.success('Regular success message');

      // Spinner completion
      logger.succeedSpinner('Spinner success message');

      const calls = consoleSpy.mock.calls;
      expect(calls).toHaveLength(2);

      // Both should have similar formatting (prefix, colors, etc.)
      const regularMessage = String(calls[0][0]);
      const spinnerMessage = String(calls[1][0]);

      // Both should contain the prefix
      expect(regularMessage).toContain('[CONSISTENCY_TEST]');
      expect(spinnerMessage).toContain('[CONSISTENCY_TEST]');

      // Both should have success indicators
      expect(regularMessage).toContain('✓');
      expect(spinnerMessage).toContain('✓');
    });
  });
});
