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

      const spinner = SpinnerUtils.create(spinnerOptions);
      expect(spinner).toBeDefined();
      expect(spinner.text).toBe('Loading...');
    });

    it('should update spinner text', () => {
      const spinnerOptions = {
        text: 'Loading...',
        prefix: 'test',
      };

      SpinnerUtils.start('test', spinnerOptions);

      // The updateText method should not throw
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
      // Mock TTY support to enable spinners
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

    it('should handle empty spinner text', () => {
      // Should not throw and should use default text
      expect(() => logger.startSpinner()).not.toThrow();

      // Should set up internal state
      expect((logger as any).singleSpinnerListr).toBeTruthy();
    });

    it('should handle completion without starting spinner', () => {
      const successSpy = vi.spyOn(logger, 'success');

      // Should not throw when completing without starting
      expect(() => {
        logger.succeedSpinner('Done');
      }).not.toThrow();

      // Should fallback to regular logging
      expect(successSpy).toHaveBeenCalledWith('Done');
    });

    it('should handle multiple spinner operations', () => {
      // Should not throw
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
      // This should not throw
      expect(() => {
        logger.stopSpinner();
      }).not.toThrow();
    });

    it('should use multi-spinner infrastructure to prevent artifacts', () => {
      // The main goal is that single spinners now use multi-spinner infrastructure
      // This should work without throwing and prevent artifacts
      expect(() => {
        logger.startSpinner('Processing...');
        logger.succeedSpinner('Done!');
      }).not.toThrow();
    });
  });
});
