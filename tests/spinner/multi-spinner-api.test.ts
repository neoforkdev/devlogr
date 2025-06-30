import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Logger } from '../../src/logger';
import { SpinnerUtils } from '../../src/utils/spinner';
import { TerminalUtils } from '../../src/utils';

describe('Multi-Spinner API', () => {
  let logger: Logger;

  beforeEach(() => {
    vi.clearAllMocks();
    SpinnerUtils.stopAllSpinners();

    // Mock TTY environment to support spinners
    Object.defineProperty(process.stdout, 'isTTY', {
      value: true,
      configurable: true,
    });
    vi.spyOn(TerminalUtils, 'isCI').mockReturnValue(false);
    vi.spyOn(SpinnerUtils, 'supportsSpinners').mockReturnValue(true);

    logger = new Logger('test');
  });

  afterEach(() => {
    SpinnerUtils.stopAllSpinners();
    vi.restoreAllMocks();
  });

  describe('Single-Spinner API (Default Key)', () => {
    it('should start and complete single spinner', () => {
      expect(() => {
        logger.startSpinner('Processing...');
        expect(logger.isSpinnerActive()).toBe(true);
        logger.succeedSpinner('Completed');
        expect(logger.isSpinnerActive()).toBe(false);
      }).not.toThrow();
    });

    it('should throw error when starting spinner while one is active', () => {
      logger.startSpinner('First spinner');
      expect(logger.isSpinnerActive()).toBe(true);

      expect(() => {
        logger.startSpinner('Second spinner');
      }).toThrow('A single spinner is already active. Ora only supports one spinner at a time.');
    });

    it('should allow starting new spinner after completing previous one', () => {
      logger.startSpinner('First spinner');
      logger.succeedSpinner('First completed');

      expect(() => {
        logger.startSpinner('Second spinner');
        logger.succeedSpinner('Second completed');
      }).not.toThrow();
    });

    it('should update spinner text correctly', () => {
      logger.startSpinner('Initial text');
      expect(() => {
        logger.updateSpinnerText('Updated text');
      }).not.toThrow();
      logger.succeedSpinner('Done');
    });

    it('should handle different completion types', () => {
      // Success
      logger.startSpinner('Task 1');
      logger.succeedSpinner('Task 1 completed');

      // Error
      logger.startSpinner('Task 2');
      logger.failSpinner('Task 2 failed');

      // Warning
      logger.startSpinner('Task 3');
      logger.warnSpinner('Task 3 warning');

      // Info
      logger.startSpinner('Task 4');
      logger.infoSpinner('Task 4 info');
    });
  });

  describe('Multi-Spinner API (Named Keys)', () => {
    it('should start and complete multiple named spinners', () => {
      expect(() => {
        logger.startNamedSpinner('build', 'Building...');
        logger.startNamedSpinner('test', 'Testing...');
        logger.startNamedSpinner('deploy', 'Deploying...');

        expect(logger.isNamedSpinnerActive('build')).toBe(true);
        expect(logger.isNamedSpinnerActive('test')).toBe(true);
        expect(logger.isNamedSpinnerActive('deploy')).toBe(true);

        logger.succeedNamedSpinner('build', 'Build completed');
        logger.succeedNamedSpinner('test', 'Tests passed');
        logger.succeedNamedSpinner('deploy', 'Deployed successfully');

        expect(logger.isNamedSpinnerActive('build')).toBe(false);
        expect(logger.isNamedSpinnerActive('test')).toBe(false);
        expect(logger.isNamedSpinnerActive('deploy')).toBe(false);
      }).not.toThrow();
    });

    it('should throw error when using duplicate keys', () => {
      logger.startNamedSpinner('task', 'First task');

      expect(() => {
        logger.startNamedSpinner('task', 'Second task with same key');
      }).toThrow("Spinner with key 'task' is already active");
    });

    it('should allow reusing keys after completion', () => {
      logger.startNamedSpinner('reusable', 'First use');
      logger.succeedNamedSpinner('reusable', 'First completed');

      expect(() => {
        logger.startNamedSpinner('reusable', 'Second use');
        logger.succeedNamedSpinner('reusable', 'Second completed');
      }).not.toThrow();
    });

    it('should update named spinner text correctly', () => {
      logger.startNamedSpinner('task', 'Initial text');
      expect(() => {
        logger.updateNamedSpinnerText('task', 'Updated text');
      }).not.toThrow();
      logger.succeedNamedSpinner('task', 'Done');
    });

    it('should handle different completion types for named spinners', () => {
      logger.startNamedSpinner('success-task', 'Working...');
      logger.succeedNamedSpinner('success-task', 'Success!');

      logger.startNamedSpinner('error-task', 'Working...');
      logger.failNamedSpinner('error-task', 'Failed!');

      logger.startNamedSpinner('warn-task', 'Working...');
      logger.warnNamedSpinner('warn-task', 'Warning!');

      logger.startNamedSpinner('info-task', 'Working...');
      logger.infoNamedSpinner('info-task', 'Info!');
    });

    it('should stop individual named spinners', () => {
      logger.startNamedSpinner('task1', 'Task 1');
      logger.startNamedSpinner('task2', 'Task 2');

      expect(logger.isNamedSpinnerActive('task1')).toBe(true);
      expect(logger.isNamedSpinnerActive('task2')).toBe(true);

      logger.stopNamedSpinner('task1');
      expect(logger.isNamedSpinnerActive('task1')).toBe(false);
      expect(logger.isNamedSpinnerActive('task2')).toBe(true);

      logger.stopNamedSpinner('task2');
      expect(logger.isNamedSpinnerActive('task2')).toBe(false);
    });
  });

  describe('Mixed API Usage', () => {
    it('should allow mixing single and named spinner APIs', () => {
      expect(() => {
        // Start default spinner
        logger.startSpinner('Default task');

        // Start named spinners
        logger.startNamedSpinner('background', 'Background task');
        logger.startNamedSpinner('parallel', 'Parallel task');

        // Complete in any order
        logger.succeedNamedSpinner('parallel', 'Parallel done');
        logger.succeedSpinner('Default done');
        logger.succeedNamedSpinner('background', 'Background done');
      }).not.toThrow();
    });

    it('should prevent conflicts between default and named keys', () => {
      logger.startSpinner('Default spinner');

      // Should not conflict with named spinner using different key
      expect(() => {
        logger.startNamedSpinner('custom', 'Named spinner');
      }).not.toThrow();

      logger.succeedSpinner('Default completed');
      logger.succeedNamedSpinner('custom', 'Named completed');
    });
  });

  describe('Logger Prefix Isolation', () => {
    it('should isolate spinners between different logger instances', () => {
      const logger1 = new Logger('app1');
      const logger2 = new Logger('app2');

      expect(() => {
        // Both can use same key names without conflict
        logger1.startNamedSpinner('task', 'App1 task');
        logger2.startNamedSpinner('task', 'App2 task');

        // Both can use default spinner without conflict
        logger1.startSpinner('App1 default');
        logger2.startSpinner('App2 default');

        // Complete all
        logger1.succeedNamedSpinner('task', 'App1 task done');
        logger2.succeedNamedSpinner('task', 'App2 task done');
        logger1.succeedSpinner('App1 default done');
        logger2.succeedSpinner('App2 default done');
      }).not.toThrow();
    });

    it('should generate unique keys with logger prefix', () => {
      const logger1 = new Logger('prefix1');
      const logger2 = new Logger('prefix2');

      // Start spinners with same user key but different loggers
      logger1.startNamedSpinner('task', 'Task 1');
      logger2.startNamedSpinner('task', 'Task 2');

      // Both should be active independently
      expect(logger1.isNamedSpinnerActive('task')).toBe(true);
      expect(logger2.isNamedSpinnerActive('task')).toBe(true);

      // Complete them independently
      logger1.succeedNamedSpinner('task', 'Task 1 done');
      expect(logger1.isNamedSpinnerActive('task')).toBe(false);
      expect(logger2.isNamedSpinnerActive('task')).toBe(true);

      logger2.succeedNamedSpinner('task', 'Task 2 done');
      expect(logger2.isNamedSpinnerActive('task')).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should provide clear error messages for duplicate default spinner', () => {
      logger.startSpinner('First spinner');

      expect(() => {
        logger.startSpinner('Second spinner');
      }).toThrow(
        'A single spinner is already active. Ora only supports one spinner at a time. Complete it first with succeedSpinner(), failSpinner(), etc.'
      );
    });

    it('should provide clear error messages for duplicate named spinner', () => {
      logger.startNamedSpinner('task', 'First task');

      expect(() => {
        logger.startNamedSpinner('task', 'Second task');
      }).toThrow(
        "Spinner with key 'task' is already active. Complete it first with succeedSpinner/failSpinner/etc."
      );
    });

    it('should handle operations on non-existent named spinners gracefully', () => {
      // These should not throw errors
      expect(() => {
        logger.updateNamedSpinnerText('nonexistent', 'Updated text');
        logger.stopNamedSpinner('nonexistent');
        logger.succeedNamedSpinner('nonexistent', 'Done');
      }).not.toThrow();

      expect(logger.isNamedSpinnerActive('nonexistent')).toBe(false);
    });
  });

  describe('Fallback Behavior (Non-Spinner Environments)', () => {
    beforeEach(() => {
      // Mock non-spinner environment
      vi.spyOn(SpinnerUtils, 'supportsSpinners').mockReturnValue(false);
    });

    it('should fallback to regular logging for single spinner API', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.startSpinner('Loading...');
      logger.succeedSpinner('Completed');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should fallback to regular logging for named spinner API', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.startNamedSpinner('task', 'Loading...');
      logger.succeedNamedSpinner('task', 'Completed');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
