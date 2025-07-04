import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Logger } from '../../src/logger';
import { SpinnerUtils } from '../../src/utils/spinner';

describe('Spinner functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
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
      const spinnerOptions = {
        text: 'Loading...',
        prefix: 'test',
      };

      const spinner = SpinnerUtils.start('test', spinnerOptions);
      expect(spinner).toBeDefined();

      SpinnerUtils.stop('test');
    });

    it('should update spinner text', () => {
      const spinnerOptions = {
        text: 'Loading...',
        prefix: 'test',
      };

      SpinnerUtils.start('test', spinnerOptions);

      expect(() => SpinnerUtils.updateText('test', 'Updated text')).not.toThrow();
    });

    it('should stop spinner', () => {
      const spinnerOptions = {
        text: 'Loading...',
        prefix: 'test',
      };

      SpinnerUtils.start('test', spinnerOptions);
      expect(() => SpinnerUtils.stop('test')).not.toThrow();
    });

    it('should succeed spinner with message', () => {
      const spinnerOptions = {
        text: 'Loading...',
        prefix: 'test',
      };

      SpinnerUtils.start('test', spinnerOptions);
      expect(() => SpinnerUtils.succeed('test', 'Success!')).not.toThrow();
    });

    it('should fail spinner with message', () => {
      const spinnerOptions = {
        text: 'Loading...',
        prefix: 'test',
      };

      SpinnerUtils.start('test', spinnerOptions);
      expect(() => SpinnerUtils.fail('test', 'Failed!')).not.toThrow();
    });

    it('should complete with info', () => {
      const spinnerOptions = {
        text: 'Loading...',
        prefix: 'test',
      };

      SpinnerUtils.start('test', spinnerOptions);
      expect(() => SpinnerUtils.info('test', 'Info!')).not.toThrow();
    });

    it('should info with spinner', () => {
      const spinnerOptions = {
        text: 'Loading...',
        prefix: 'test',
      };

      SpinnerUtils.start('test', spinnerOptions);
      expect(() => SpinnerUtils.info('test', 'Info message')).not.toThrow();
    });

    it('should stop all spinners', () => {
      expect(() => SpinnerUtils.stopAllSpinners()).not.toThrow();
    });
  });

  describe('Logger single spinner methods (using multi-spinner infrastructure)', () => {
    let logger: Logger;

    beforeEach(() => {
      logger = new Logger('test-spinner');
      vi.spyOn(SpinnerUtils, 'supportsSpinners').mockReturnValue(true);
    });

    it('should start spinner without throwing', () => {
      expect(() => logger.startSpinner('Loading...')).not.toThrow();
    });

    it('should update spinner text without throwing', () => {
      logger.startSpinner('Initial text');
      expect(() => logger.updateSpinnerText('Updated text')).not.toThrow();
    });

    it('should stop spinner without throwing', () => {
      logger.startSpinner('Loading...');
      expect(() => logger.stopSpinner()).not.toThrow();
    });

    it('should complete spinner with success without throwing', () => {
      logger.startSpinner('Processing...');
      expect(() => logger.succeedSpinner('Success!')).not.toThrow();
    });

    it('should complete spinner with error without throwing', () => {
      logger.startSpinner('Processing...');
      expect(() => logger.failSpinner('Failed!')).not.toThrow();
    });

    it('should complete spinner with warning without throwing', () => {
      logger.startSpinner('Processing...');
      expect(() => logger.warnSpinner('Warning!')).not.toThrow();
    });

    it('should complete spinner with info without throwing', () => {
      logger.startSpinner('Processing...');
      expect(() => logger.infoSpinner('Info!')).not.toThrow();
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

  describe('Edge cases', () => {
    let logger: Logger;

    beforeEach(() => {
      logger = new Logger('test-edge');
      vi.spyOn(SpinnerUtils, 'supportsSpinners').mockReturnValue(true);
    });

    it('should throw error when starting spinner while another is active', () => {
      logger.startSpinner('First spinner');

      expect(() => {
        logger.startSpinner('Second spinner');
      }).toThrow('A single spinner is already active. Ora only supports one spinner at a time.');

      logger.stopSpinner();
    });

    it('should provide helpful error message about using Listr2 API', () => {
      logger.startSpinner('First spinner');

      expect(() => {
        logger.startSpinner('Second spinner');
      }).toThrow('A single spinner is already active. Ora only supports one spinner at a time.');

      logger.stopSpinner();
    });

    it('should allow starting new spinner after completion', () => {
      logger.startSpinner('First spinner');
      logger.succeedSpinner('First completed');

      expect(() => {
        logger.startSpinner('Second spinner');
      }).not.toThrow();

      logger.stopSpinner();
    });

    it('should allow starting new spinner after stopping', () => {
      logger.startSpinner('First spinner');
      logger.stopSpinner();

      expect(() => {
        logger.startSpinner('Second spinner');
      }).not.toThrow();

      logger.stopSpinner();
    });

    it('should provide isSpinnerActive method', () => {
      expect(logger.isSpinnerActive()).toBe(false);

      logger.startSpinner('Test spinner');
      expect(logger.isSpinnerActive()).toBe(true);

      logger.succeedSpinner('Completed');
      expect(logger.isSpinnerActive()).toBe(false);
    });

    it('should handle empty spinner text', () => {
      expect(() => logger.startSpinner()).not.toThrow();

      expect(logger.isSpinnerActive()).toBe(true);

      logger.stopSpinner();
    });

    it('should handle completion without starting spinner', () => {
      const successSpy = vi.spyOn(logger, 'success');

      expect(() => {
        logger.succeedSpinner('Done');
      }).not.toThrow();

      expect(successSpy).toHaveBeenCalledWith('Done');
    });

    it('should handle multiple spinner operations', () => {
      expect(() => {
        logger.startSpinner('First');
        logger.stopSpinner();

        logger.startSpinner('Second');
        logger.succeedSpinner('Success');
      }).not.toThrow();
    });
  });

  describe('Artifact prevention', () => {
    let logger: Logger;

    beforeEach(() => {
      logger = new Logger('test-artifact');
      vi.spyOn(SpinnerUtils, 'supportsSpinners').mockReturnValue(true);
    });

    it('should not attempt to clear non-existent spinners', () => {
      expect(() => {
        logger.stopSpinner();
      }).not.toThrow();
    });

    it('should use multi-spinner infrastructure to prevent artifacts', () => {
      // The main goal is that single spinners now use multi-spinner infrastructure
      expect(() => {
        logger.startSpinner('Processing...');
        logger.succeedSpinner('Done!');
      }).not.toThrow();
    });
  });

  describe('Line clearing behavior', () => {
    let logger: Logger;
    let mockStdoutWrite: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      logger = new Logger('test-line-clear');
      mockStdoutWrite = vi.fn();
      vi.spyOn(process.stdout, 'write').mockImplementation(mockStdoutWrite);
      Object.defineProperty(process.stdout, 'isTTY', {
        value: true,
        configurable: true,
      });
    });

    it('should properly clear line when spinner text gets shorter', async () => {
      // Start spinner with long text
      logger.startSpinner('This is a very long spinner message that takes up significant space');

      // Let animation run briefly
      await new Promise(resolve => setTimeout(resolve, 100));

      // Update to shorter text
      logger.updateSpinnerText('Short');

      // Let animation run briefly
      await new Promise(resolve => setTimeout(resolve, 100));

      // Stop spinner
      logger.stopSpinner();

      // Verify that line clearing sequences were used
      const writeCalls = mockStdoutWrite.mock.calls.map(call => call[0]);

      // Should contain ANSI escape sequences for clearing
      const containsClearSequence = writeCalls.some(
        call => typeof call === 'string' && call.includes('\r\x1b[K')
      );

      expect(containsClearSequence).toBe(true);
    });

    it('should clear line when updating from long to short text', async () => {
      // Start spinner
      logger.startSpinner('Initial very long text that should be cleared properly when updated');

      // Update to much shorter text
      logger.updateSpinnerText('Short text');

      // Stop spinner
      logger.stopSpinner();

      // Check that proper clearing sequences were used
      const writeCalls = mockStdoutWrite.mock.calls.map(call => call[0]);

      // Should use \r\x1b[K for line clearing
      const hasProperClearing = writeCalls.some(
        call => typeof call === 'string' && call.includes('\r\x1b[K')
      );

      expect(hasProperClearing).toBe(true);
    });
  });
});
