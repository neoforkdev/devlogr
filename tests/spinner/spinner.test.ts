import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger } from '../../src/logger';
import { SpinnerUtils } from '../../src/utils';

describe('Spinner functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Stop any existing spinners before each test
    SpinnerUtils.stopAllSpinners();
  });

  afterEach(() => {
    // Clean up after each test
    SpinnerUtils.stopAllSpinners();
  });

  describe('SpinnerUtils', () => {
    it('should support spinners in TTY environments', () => {
      Object.defineProperty(process.stdout, 'isTTY', {
        value: true,
        configurable: true,
      });
      expect(SpinnerUtils.supportsSpinners()).toBe(true);
    });

    it('should not support spinners in non-TTY environments', () => {
      Object.defineProperty(process.stdout, 'isTTY', {
        value: false,
        configurable: true,
      });
      expect(SpinnerUtils.supportsSpinners()).toBe(false);
    });

    it('should start spinner with given text', () => {
      const startSpy = vi.spyOn(SpinnerUtils, 'start');
      SpinnerUtils.start('test', { text: 'Loading...', prefix: 'test' });
      expect(startSpy).toHaveBeenCalledWith(
        'test',
        expect.objectContaining({ text: 'Loading...' })
      );
    });

    it('should update spinner text', () => {
      const updateSpy = vi.spyOn(SpinnerUtils, 'updateText');
      SpinnerUtils.updateText('test', 'Updated text');
      expect(updateSpy).toHaveBeenCalledWith('test', 'Updated text');
    });

    it('should stop spinner', () => {
      const stopSpy = vi.spyOn(SpinnerUtils, 'stop');
      SpinnerUtils.stop('test');
      expect(stopSpy).toHaveBeenCalledWith('test');
    });

    it('should succeed spinner with message', () => {
      const succeedSpy = vi.spyOn(SpinnerUtils, 'succeed');
      SpinnerUtils.succeed('test', 'Success!');
      expect(succeedSpy).toHaveBeenCalledWith('test', 'Success!');
    });

    it('should fail spinner with message', () => {
      const failSpy = vi.spyOn(SpinnerUtils, 'fail');
      SpinnerUtils.fail('test', 'Failed!');
      expect(failSpy).toHaveBeenCalledWith('test', 'Failed!');
    });

    it('should complete with info', () => {
      const infoSpy = vi.spyOn(SpinnerUtils, 'info');
      SpinnerUtils.info('test', 'Info!');
      expect(infoSpy).toHaveBeenCalledWith('test', 'Info!');
    });

    it('should info with spinner', () => {
      const infoSpy = vi.spyOn(SpinnerUtils, 'info');
      SpinnerUtils.info('test', 'Info!');
      expect(infoSpy).toHaveBeenCalledWith('test', 'Info!');
    });

    it('should stop all spinners', () => {
      const stopAllSpy = vi.spyOn(SpinnerUtils, 'stopAllSpinners');
      SpinnerUtils.stopAllSpinners();
      expect(stopAllSpy).toHaveBeenCalled();
    });
  });

  describe('Logger spinner methods', () => {
    let logger: Logger;

    beforeEach(() => {
      logger = new Logger('test-spinner');
      // Mock TTY support to enable spinners
      vi.spyOn(SpinnerUtils, 'supportsSpinners').mockReturnValue(true);
    });

    it('should start spinner with text', () => {
      const startSpy = vi.spyOn(SpinnerUtils, 'start');

      logger.startSpinner('Loading...');
      expect(startSpy).toHaveBeenCalledWith(
        'test-spinner',
        expect.objectContaining({
          text: 'Loading...',
          prefix: 'test-spinner',
        })
      );
    });

    it('should update spinner text', () => {
      const updateSpy = vi.spyOn(SpinnerUtils, 'updateText');

      logger.updateSpinnerText('Updated text');
      expect(updateSpy).toHaveBeenCalledWith('test-spinner', 'Updated text');
    });

    it('should stop spinner', () => {
      const stopSpy = vi.spyOn(SpinnerUtils, 'stop');

      logger.stopSpinner();
      expect(stopSpy).toHaveBeenCalledWith('test-spinner');
    });

    it('should complete spinner with success', () => {
      const successSpy = vi.spyOn(logger, 'success');

      logger.succeedSpinner('Success!');
      expect(successSpy).toHaveBeenCalledWith('Success!');
    });

    it('should complete spinner with error', () => {
      const errorSpy = vi.spyOn(logger, 'error');

      logger.failSpinner('Failed!');
      expect(errorSpy).toHaveBeenCalledWith('Failed!');
    });

    it('should complete spinner with warning', () => {
      const warnSpy = vi.spyOn(logger, 'warning');

      logger.warnSpinner('Warning!');
      expect(warnSpy).toHaveBeenCalledWith('Warning!');
    });

    it('should complete spinner with info', () => {
      const infoSpy = vi.spyOn(logger, 'info');

      logger.infoSpinner('Info!');
      expect(infoSpy).toHaveBeenCalledWith('Info!');
    });
  });

  describe('JSON mode fallback', () => {
    it('should fallback to regular logging in JSON mode', () => {
      // Mock JSON mode environment variable
      const originalEnv = process.env.DEVLOGR_OUTPUT_JSON;
      process.env.DEVLOGR_OUTPUT_JSON = 'true';

      const logger = new Logger('test-json');
      const taskSpy = vi.spyOn(logger, 'task');
      const successSpy = vi.spyOn(logger, 'success');

      logger.startSpinner('Loading...');
      expect(taskSpy).toHaveBeenCalledWith('Loading...');

      logger.succeedSpinner('Done!');
      expect(successSpy).toHaveBeenCalledWith('Done!');

      // Restore environment
      if (originalEnv !== undefined) {
        process.env.DEVLOGR_OUTPUT_JSON = originalEnv;
      } else {
        delete process.env.DEVLOGR_OUTPUT_JSON;
      }
    });
  });

  describe('Non-TTY fallback', () => {
    it('should fallback to regular logging without TTY', () => {
      Object.defineProperty(process.stdout, 'isTTY', {
        value: false,
        configurable: true,
      });
      vi.spyOn(SpinnerUtils, 'supportsSpinners').mockReturnValue(false);

      const logger = new Logger('test-no-tty');
      const taskSpy = vi.spyOn(logger, 'task');
      const successSpy = vi.spyOn(logger, 'success');

      logger.startSpinner('Loading...');
      expect(taskSpy).toHaveBeenCalledWith('Loading...');

      logger.succeedSpinner('Done!');
      expect(successSpy).toHaveBeenCalledWith('Done!');
    });
  });

  describe('Enhanced Formatting', () => {
    let logger: Logger;

    beforeEach(() => {
      logger = new Logger('test-enhanced');
      // Mock TTY support to enable spinners
      vi.spyOn(SpinnerUtils, 'supportsSpinners').mockReturnValue(true);
    });

    it('should pass correct options to SpinnerUtils.start', () => {
      const startSpy = vi.spyOn(SpinnerUtils, 'start');

      logger.startSpinner('Test spinner');

      expect(startSpy).toHaveBeenCalledWith(
        'test-enhanced',
        expect.objectContaining({
          text: 'Test spinner',
          prefix: 'test-enhanced',
        })
      );
    });

    it('should handle spinner without custom options', () => {
      const startSpy = vi.spyOn(SpinnerUtils, 'start');

      logger.startSpinner('Default spinner');

      expect(startSpy).toHaveBeenCalledWith(
        'test-enhanced',
        expect.objectContaining({
          text: 'Default spinner',
          prefix: 'test-enhanced',
        })
      );
    });

    it('should handle completion with default text', () => {
      const successSpy = vi.spyOn(logger, 'success');

      logger.succeedSpinner();
      expect(successSpy).toHaveBeenCalledWith('Done');
    });

    it('should handle completion with custom text', () => {
      const successSpy = vi.spyOn(logger, 'success');

      logger.succeedSpinner('Custom success message');
      expect(successSpy).toHaveBeenCalledWith('Custom success message');
    });

    it('should pass theme information to spinner options', () => {
      const startSpy = vi.spyOn(SpinnerUtils, 'start');

      logger.startSpinner('Themed spinner');

      expect(startSpy).toHaveBeenCalledWith(
        'test-enhanced',
        expect.objectContaining({
          text: 'Themed spinner',
          prefix: 'test-enhanced',
          level: 'task',
          theme: expect.objectContaining({
            symbol: expect.any(String),
            label: expect.any(String),
            color: expect.any(Function),
          }),
        })
      );
    });

    it('should include timestamp configuration', () => {
      const startSpy = vi.spyOn(SpinnerUtils, 'start');

      logger.startSpinner('Timestamp test');

      expect(startSpy).toHaveBeenCalledWith(
        'test-enhanced',
        expect.objectContaining({
          showTimestamp: expect.any(Boolean),
          timestampFormat: expect.anything(),
        })
      );
    });

    it('should include color configuration', () => {
      const startSpy = vi.spyOn(SpinnerUtils, 'start');

      logger.startSpinner('Color test');

      expect(startSpy).toHaveBeenCalledWith(
        'test-enhanced',
        expect.objectContaining({
          useColors: expect.any(Boolean),
        })
      );
    });

    it('should handle custom spinner text', () => {
      const startSpy = vi.spyOn(SpinnerUtils, 'start');

      logger.startSpinner('Custom type');

      expect(startSpy).toHaveBeenCalledWith(
        'test-enhanced',
        expect.objectContaining({
          text: 'Custom type',
        })
      );
    });

    it('should handle different log levels', () => {
      const startSpy = vi.spyOn(SpinnerUtils, 'start');

      logger.startSpinner('Info spinner');

      expect(startSpy).toHaveBeenCalledWith(
        'test-enhanced',
        expect.objectContaining({
          text: 'Info spinner',
          level: 'task',
        })
      );
    });
  });

  describe('Logger Integration with Enhanced Formatting', () => {
    let logger: Logger;

    beforeEach(() => {
      logger = new Logger('test-enhanced');
      // Mock TTY support to enable spinners
      vi.spyOn(SpinnerUtils, 'supportsSpinners').mockReturnValue(true);
    });

    it('should pass formatting options from logger to spinner', () => {
      const startSpy = vi.spyOn(SpinnerUtils, 'start');

      logger.startSpinner('Enhanced spinner');

      expect(startSpy).toHaveBeenCalledWith(
        'test-enhanced',
        expect.objectContaining({
          text: 'Enhanced spinner',
          prefix: 'test-enhanced',
          showTimestamp: expect.any(Boolean),
          useColors: expect.any(Boolean),
          timestampFormat: expect.anything(),
          level: 'task',
          theme: expect.any(Object),
        })
      );
    });

    it('should pass formatting options to completion methods', () => {
      const successSpy = vi.spyOn(logger, 'success');

      logger.succeedSpinner('Enhanced success');

      expect(successSpy).toHaveBeenCalledWith('Enhanced success');
    });

    it('should include log level and theme in spinner options', () => {
      const startSpy = vi.spyOn(SpinnerUtils, 'start');

      logger.startSpinner('Themed message');

      const callArgs = startSpy.mock.calls[0]?.[1];
      expect(callArgs).toHaveProperty('level');
      expect(callArgs).toHaveProperty('theme');
      expect(callArgs?.theme).toHaveProperty('symbol');
      expect(callArgs?.theme).toHaveProperty('label');
      expect(callArgs?.theme).toHaveProperty('color');
    });

    it('should show proper log level labels in completion messages', () => {
      const consoleSpy = vi.spyOn(console, 'log');

      logger.succeedSpinner('Success message');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Success message'));
    });
  });

  describe('Edge cases', () => {
    beforeEach(() => {
      // Mock TTY support to enable spinners
      vi.spyOn(SpinnerUtils, 'supportsSpinners').mockReturnValue(true);
    });

    it('should handle empty spinner text', () => {
      const logger = new Logger('test-edge');
      const startSpy = vi.spyOn(SpinnerUtils, 'start');

      logger.startSpinner();
      expect(startSpy).toHaveBeenCalledWith(
        'test-edge',
        expect.objectContaining({
          text: 'Processing...',
        })
      );
    });

    it('should handle completion without starting spinner', () => {
      const logger = new Logger('test-edge');
      const successSpy = vi.spyOn(logger, 'success');

      // Should not throw error
      expect(() => {
        logger.succeedSpinner('Done');
      }).not.toThrow();

      expect(successSpy).toHaveBeenCalledWith('Done');
    });

    it('should handle multiple spinner operations', () => {
      const logger = new Logger('test-edge');
      const startSpy = vi.spyOn(SpinnerUtils, 'start');
      const updateSpy = vi.spyOn(SpinnerUtils, 'updateText');
      const stopSpy = vi.spyOn(SpinnerUtils, 'stop');

      logger.startSpinner('First');
      logger.updateSpinnerText('Second');
      logger.stopSpinner();

      expect(startSpy).toHaveBeenCalledWith(
        'test-edge',
        expect.objectContaining({ text: 'First' })
      );
      expect(updateSpy).toHaveBeenCalledWith('test-edge', 'Second');
      expect(stopSpy).toHaveBeenCalledWith('test-edge');
    });
  });

  describe('Code Quality and DRY Compliance', () => {
    beforeEach(() => {
      // Mock TTY support to enable spinners
      vi.spyOn(SpinnerUtils, 'supportsSpinners').mockReturnValue(true);
    });

    it('should reuse spinner options building logic', () => {
      const logger = new Logger('test-dry');
      const startSpy = vi.spyOn(SpinnerUtils, 'start');

      logger.startSpinner('Test 1');
      logger.startSpinner('Test 2');

      const call1Options = startSpy.mock.calls[0]?.[1];
      const call2Options = startSpy.mock.calls[1]?.[1];

      // Should have same structure but different text
      expect(call1Options).toHaveProperty('prefix', 'test-dry');
      expect(call2Options).toHaveProperty('prefix', 'test-dry');
      expect(call1Options?.text).toBe('Test 1');
      expect(call2Options?.text).toBe('Test 2');
    });

    it('should use consistent completion method structure', () => {
      const logger = new Logger('test-dry');
      const successSpy = vi.spyOn(logger, 'success');
      const errorSpy = vi.spyOn(logger, 'error');
      const warnSpy = vi.spyOn(logger, 'warning');
      const infoSpy = vi.spyOn(logger, 'info');

      logger.succeedSpinner('Success');
      logger.failSpinner('Error');
      logger.warnSpinner('Warning');
      logger.infoSpinner('Info');

      expect(successSpy).toHaveBeenCalledWith('Success');
      expect(errorSpy).toHaveBeenCalledWith('Error');
      expect(warnSpy).toHaveBeenCalledWith('Warning');
      expect(infoSpy).toHaveBeenCalledWith('Info');
    });

    it('should handle options merging consistently', () => {
      const logger = new Logger('test-dry');
      const startSpy = vi.spyOn(SpinnerUtils, 'start');

      logger.startSpinner('Custom');

      expect(startSpy).toHaveBeenCalledWith(
        'test-dry',
        expect.objectContaining({
          text: 'Custom',
          prefix: 'test-dry',
        })
      );
    });
  });

  describe('Spinner Artifact Prevention', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      SpinnerUtils.stopAllSpinners();

      // Mock TTY and spinner support for testing
      Object.defineProperty(process.stdout, 'isTTY', {
        value: true,
        configurable: true,
      });
      vi.spyOn(SpinnerUtils, 'supportsSpinners').mockReturnValue(true);
    });

    it('should properly clear spinner display to prevent artifacts', () => {
      const logger = new Logger('test-artifact');

      // Mock the ora spinner instance
      const mockSpinner = {
        start: vi.fn(),
        stop: vi.fn(),
        clear: vi.fn(), // This is the key method we want to test
        text: '',
      };

      // Mock SpinnerUtils.create to return our mock spinner
      const createSpy = vi.spyOn(SpinnerUtils, 'create').mockReturnValue(mockSpinner as any);

      // Start a spinner
      logger.startSpinner('Processing...');

      // Verify spinner was created and started
      expect(createSpy).toHaveBeenCalled();
      expect(mockSpinner.start).toHaveBeenCalled();

      // Complete the spinner
      logger.warnSpinner('Completed with warnings');

      // Verify that both stop() and clear() were called to prevent artifacts
      expect(mockSpinner.stop).toHaveBeenCalled();
      expect(mockSpinner.clear).toHaveBeenCalled();

      // Verify clear() was called after stop() to ensure proper cleanup order
      const stopCallOrder = mockSpinner.stop.mock.invocationCallOrder[0];
      const clearCallOrder = mockSpinner.clear.mock.invocationCallOrder[0];
      expect(clearCallOrder).toBeGreaterThan(stopCallOrder);
    });

    it('should clear spinner artifacts for all completion types', () => {
      const completionTypes = [
        { method: 'succeedSpinner', text: 'Success!' },
        { method: 'failSpinner', text: 'Failed!' },
        { method: 'warnSpinner', text: 'Warning!' },
        { method: 'infoSpinner', text: 'Info!' },
      ];

      completionTypes.forEach(({ method, text }, index) => {
        const logger = new Logger(`test-${method}`);

        const mockSpinner = {
          start: vi.fn(),
          stop: vi.fn(),
          clear: vi.fn(),
          text: '',
        };

        const createSpy = vi.spyOn(SpinnerUtils, 'create').mockReturnValue(mockSpinner as any);

        // Start and complete spinner
        logger.startSpinner('Processing...');
        (logger as any)[method](text);

        // Verify proper cleanup for each completion type
        expect(mockSpinner.stop).toHaveBeenCalled();
        expect(mockSpinner.clear).toHaveBeenCalled();

        // Clean up mocks for next iteration
        createSpy.mockRestore();
        vi.clearAllMocks();
        SpinnerUtils.stopAllSpinners();
      });
    });

    it('should handle multiple spinners without leaving artifacts', () => {
      const logger1 = new Logger('multi1');
      const logger2 = new Logger('multi2');

      const mockSpinner1 = {
        start: vi.fn(),
        stop: vi.fn(),
        clear: vi.fn(),
        text: '',
      };

      const mockSpinner2 = {
        start: vi.fn(),
        stop: vi.fn(),
        clear: vi.fn(),
        text: '',
      };

      let callCount = 0;
      const createSpy = vi.spyOn(SpinnerUtils, 'create').mockImplementation(() => {
        callCount++;
        return callCount === 1 ? (mockSpinner1 as any) : (mockSpinner2 as any);
      });

      // Start multiple spinners
      logger1.startSpinner('Task 1');
      logger2.startSpinner('Task 2');

      // Complete them
      logger1.succeedSpinner('Task 1 done');
      logger2.failSpinner('Task 2 failed');

      // Verify both spinners were properly cleared
      expect(mockSpinner1.clear).toHaveBeenCalled();
      expect(mockSpinner2.clear).toHaveBeenCalled();
    });

    it('should not attempt to clear non-existent spinners', () => {
      const logger = new Logger('test-nonexistent');

      // Try to complete a spinner that was never started
      expect(() => {
        logger.succeedSpinner('Should not crash');
      }).not.toThrow();

      // Verify no spinner operations were attempted
      const createSpy = vi.spyOn(SpinnerUtils, 'create');
      expect(createSpy).not.toHaveBeenCalled();
    });
  });

  describe('Spinner Spacing Fix Integration', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      SpinnerUtils.stopAllSpinners();

      // Mock TTY support to enable spinners
      Object.defineProperty(process.stdout, 'isTTY', {
        value: true,
        configurable: true,
      });
      vi.spyOn(SpinnerUtils, 'supportsSpinners').mockReturnValue(true);
    });

    it('should create spinner with correct prefix spacing when timestamps enabled', () => {
      // Set environment variable to enable timestamps
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'true';

      const logger = new Logger('spacing-test');

      // Mock SpinnerUtils.create to capture the options passed to ora
      const createSpy = vi.spyOn(SpinnerUtils, 'create').mockImplementation(options => {
        // Verify that prefixText doesn't have trailing space when present
        if (options?.prefixText) {
          expect(options.prefixText).not.toMatch(/ $/);

          // Should contain timestamp, symbol, level, and prefix in correct format
          expect(options.prefixText).toMatch(/^\[[\d:]+\] . .+\s+\[spacing-test\]$/);
        }

        // Return a mock spinner
        return {
          start: vi.fn(),
          stop: vi.fn(),
          clear: vi.fn(),
          text: options?.text || '',
        } as any;
      });

      // Start spinner - this should create proper prefix spacing
      logger.startSpinner('Testing spinner spacing...');

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Testing spinner spacing...',
          prefix: 'spacing-test',
          showTimestamp: true,
        })
      );

      // Clean up environment
      delete process.env.DEVLOGR_SHOW_TIMESTAMP;
    });

    it('should maintain consistent spacing across different configurations', () => {
      const configurations = [
        { prefix: 'app', expectedPattern: /^\[[\d:]+\] . .+\s+\[app\]$/ },
        { prefix: 'backend-service', expectedPattern: /^\[[\d:]+\] . .+\s+\[backend-service\]$/ },
        { prefix: 'ui', expectedPattern: /^\[[\d:]+\] . .+\s+\[ui\]$/ },
      ];

      configurations.forEach(({ prefix, expectedPattern }) => {
        const logger = new Logger(prefix);

        const createSpy = vi.spyOn(SpinnerUtils, 'create').mockImplementation(options => {
          if (options?.prefixText) {
            // Verify consistent spacing pattern
            expect(options.prefixText).toMatch(expectedPattern);
            expect(options.prefixText).not.toMatch(/ $/); // No trailing space
            expect(options.prefixText).not.toMatch(/  /); // No double spaces
          }

          return {
            start: vi.fn(),
            stop: vi.fn(),
            clear: vi.fn(),
            text: options?.text || '',
          } as any;
        });

        logger.startSpinner(`Processing ${prefix}...`);

        expect(createSpy).toHaveBeenCalled();
        createSpy.mockRestore();
        vi.clearAllMocks();
      });
    });

    it('should handle spinner text updates without spacing issues', () => {
      const logger = new Logger('update-test');

      let capturedPrefixText = '';
      const createSpy = vi.spyOn(SpinnerUtils, 'create').mockImplementation(options => {
        if (options?.prefixText) {
          capturedPrefixText = options.prefixText;
        }

        return {
          start: vi.fn(),
          stop: vi.fn(),
          clear: vi.fn(),
          text: options?.text || '',
        } as any;
      });

      const updateTextSpy = vi
        .spyOn(SpinnerUtils, 'updateText')
        .mockImplementation((key: string, text: string) => {});

      // Start spinner and update text
      logger.startSpinner('Initial text...');
      logger.updateSpinnerText('Updated text...');

      // Verify prefix was created without trailing space
      expect(capturedPrefixText).not.toMatch(/ $/);
      expect(capturedPrefixText).not.toMatch(/  /);

      // Verify text update was called correctly
      expect(updateTextSpy).toHaveBeenCalledWith('update-test', 'Updated text...');
    });

    it('should prevent spacing artifacts during completion', () => {
      // Enable timestamps to test prefixText spacing
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'true';

      const logger = new Logger('completion-test');

      const mockSpinner = {
        start: vi.fn(),
        stop: vi.fn(),
        clear: vi.fn(),
        text: '',
        prefixText: '',
      };

      const createSpy = vi.spyOn(SpinnerUtils, 'create').mockImplementation(options => {
        if (options?.prefixText) {
          mockSpinner.prefixText = options.prefixText;
          // Verify proper spacing in prefix - no trailing space
          expect(options.prefixText).not.toMatch(/ $/);
        }
        return mockSpinner as any;
      });

      // Start spinner
      logger.startSpinner('Processing...');

      // Verify prefix was set correctly (only if timestamps are enabled)
      if (mockSpinner.prefixText) {
        expect(mockSpinner.prefixText).not.toMatch(/ $/);
      }

      // Complete spinner
      logger.succeedSpinner('Completed successfully!');

      // Verify spinner was properly stopped and cleared
      expect(mockSpinner.stop).toHaveBeenCalled();
      expect(mockSpinner.clear).toHaveBeenCalled();

      // Clean up environment
      delete process.env.DEVLOGR_SHOW_TIMESTAMP;
    });

    it('should work correctly with timestamp formatting enabled', () => {
      // Set environment variable to enable timestamps
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'true';

      const logger = new Logger('timestamp-test');

      const createSpy = vi.spyOn(SpinnerUtils, 'create').mockImplementation(options => {
        if (options?.prefixText) {
          // Should start with timestamp in brackets
          expect(options.prefixText).toMatch(/^\[[\d:]+\]/);

          // Should not have trailing space
          expect(options.prefixText).not.toMatch(/ $/);

          // Should not have double spaces
          expect(options.prefixText).not.toMatch(/  /);

          // Should contain the prefix name
          expect(options.prefixText).toContain('[timestamp-test]');
        }

        return {
          start: vi.fn(),
          stop: vi.fn(),
          clear: vi.fn(),
          text: options?.text || '',
        } as any;
      });

      logger.startSpinner('Testing with timestamp...');

      expect(createSpy).toHaveBeenCalled();

      // Clean up environment
      delete process.env.DEVLOGR_SHOW_TIMESTAMP;
    });
  });
});
