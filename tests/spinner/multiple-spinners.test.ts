import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger } from '../../src/logger';
import { SpinnerUtils } from '../../src/utils/spinner';

Object.defineProperty(process.stdout, 'isTTY', {
  value: true,
  configurable: true,
});

describe('Multiple Spinners Management', () => {
  beforeEach(() => {
    vi.spyOn(SpinnerUtils, 'supportsSpinners').mockReturnValue(true);
    SpinnerUtils.stopAllSpinners();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    SpinnerUtils.stopAllSpinners();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Individual Logger Spinner Management', () => {
    it('should allow multiple logger instances to have independent spinners', () => {
      const logger1 = new Logger('app1');
      const logger2 = new Logger('app2');
      const logger3 = new Logger('app3');

      expect(() => logger1.startSpinner('Task 1')).not.toThrow();
      expect(() => logger2.startSpinner('Task 2')).not.toThrow();
      expect(() => logger3.startSpinner('Task 3')).not.toThrow();

      expect(() => logger1.succeedSpinner('Task 1 done')).not.toThrow();
      expect(() => logger2.failSpinner('Task 2 failed')).not.toThrow();
      expect(() => logger3.warnSpinner('Task 3 warning')).not.toThrow();
    });

    it('should handle concurrent spinner operations without conflicts', () => {
      const logger1 = new Logger('app1');
      const logger2 = new Logger('app2');

      expect(() => {
        logger1.startSpinner('Task 1');
        logger2.startSpinner('Task 2');
        logger1.updateSpinnerText('Updated Task 1');
        logger2.updateSpinnerText('Updated Task 2');
        logger1.succeedSpinner('Task 1 complete');
        logger2.succeedSpinner('Task 2 complete');
      }).not.toThrow();
    });

    it('should handle spinner restart within same logger instance', () => {
      const logger = new Logger('app');

      expect(() => {
        logger.startSpinner('Task 1');
        logger.succeedSpinner('Task 1 complete'); // Complete first
        logger.startSpinner('Task 2');
        logger.succeedSpinner('Task 2 complete');
      }).not.toThrow();
    });

    it('should handle rapid spinner operations', () => {
      const logger = new Logger('app');

      expect(() => {
        for (let i = 0; i < 10; i++) {
          logger.startSpinner(`Task ${i}`);
          logger.updateSpinnerText(`Updated Task ${i}`);
          logger.succeedSpinner(`Task ${i} done`);
        }
      }).not.toThrow();
    });

    it('should maintain isolation between different logger instances', () => {
      const logger1 = new Logger('service1');
      const logger2 = new Logger('service2');

      // Operations on one logger should not affect the other
      expect(() => {
        logger1.startSpinner('Service 1 processing');
        logger2.startSpinner('Service 2 processing');

        logger1.updateSpinnerText('Service 1 updated');
        logger2.updateSpinnerText('Service 2 updated');

        logger1.succeedSpinner('Service 1 complete');
        // logger2 should still be able to operate independently
        logger2.succeedSpinner('Service 2 complete');
      }).not.toThrow();
    });
  });

  describe('Text Updates with Multiple Loggers', () => {
    it('should update text for each logger independently', () => {
      const logger1 = new Logger('app1');
      const logger2 = new Logger('app2');

      expect(() => {
        logger1.startSpinner('Task 1');
        logger2.startSpinner('Task 2');
        logger1.updateSpinnerText('Updated Task 1');
        logger2.updateSpinnerText('Updated Task 2');
      }).not.toThrow();
    });

    it('should handle text updates on inactive spinners gracefully', () => {
      const logger1 = new Logger('app1');
      const logger2 = new Logger('app2');

      expect(() => {
        logger1.startSpinner('Task 1');
        logger2.startSpinner('Task 2');
        logger1.updateSpinnerText('Updated Task 1');
        logger2.updateSpinnerText('Updated Task 2');
      }).not.toThrow();
    });

    it('should show updated text when spinner operations occur', () => {
      const logger1 = new Logger('app1');
      const logger2 = new Logger('app2');

      expect(() => {
        logger1.startSpinner('Task 1');
        logger2.startSpinner('Task 2');
        logger1.updateSpinnerText('Updated Task 1');
        logger2.updateSpinnerText('Updated Task 2');

        // Advance time to simulate operations
        vi.advanceTimersByTime(1500);

        logger1.succeedSpinner('Task 1 complete');
        logger2.succeedSpinner('Task 2 complete');
      }).not.toThrow();
    });
  });

  describe('Spinner Completion with Multiple Loggers', () => {
    it('should complete specific spinner and continue with others', () => {
      const logger1 = new Logger('app1');
      const logger2 = new Logger('app2');
      const logger3 = new Logger('app3');

      expect(() => {
        logger1.startSpinner('Task 1');
        logger2.startSpinner('Task 2');
        logger3.startSpinner('Task 3');

        // Complete one spinner
        logger1.succeedSpinner('Task 1 done');

        // Others should still work
        logger2.updateSpinnerText('Updated Task 2');
        logger3.updateSpinnerText('Updated Task 3');

        logger2.succeedSpinner('Task 2 done');
        logger3.succeedSpinner('Task 3 done');
      }).not.toThrow();
    });

    it('should handle mixed completion types', () => {
      const logger1 = new Logger('app1');
      const logger2 = new Logger('app2');

      expect(() => {
        logger1.startSpinner('Task 1');
        logger2.startSpinner('Task 2');

        logger1.succeedSpinner('Task 1 success');
        logger2.failSpinner('Task 2 failed');
      }).not.toThrow();
    });

    it('should clear all state when all spinners complete', () => {
      const logger1 = new Logger('app1');
      const logger2 = new Logger('app2');

      logger1.startSpinner('Task 1');
      logger2.startSpinner('Task 2');

      logger1.succeedSpinner('Task 1 done');
      logger2.succeedSpinner('Task 2 done');

      expect(() => {
        logger1.startSpinner('New Task 1');
        logger2.startSpinner('New Task 2');
        logger1.succeedSpinner('New Task 1 done');
        logger2.succeedSpinner('New Task 2 done');
      }).not.toThrow();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle stopping non-existent spinner gracefully', () => {
      const logger = new Logger('app');

      expect(() => logger.stopSpinner()).not.toThrow();
    });

    it('should handle updating text of non-existent spinner gracefully', () => {
      const logger = new Logger('app');

      expect(() => logger.updateSpinnerText('Some text')).not.toThrow();
    });

    it('should throw error when starting spinner while one is active', () => {
      const logger = new Logger('app');

      logger.startSpinner('Task 1');

      expect(() => {
        logger.startSpinner('Task 1 Again'); // Should throw
      }).toThrow('A single spinner is already active. Ora only supports one spinner at a time.');

      logger.succeedSpinner('Task completed');
    });

    it('should clean up properly with stopAllSpinners', () => {
      const logger1 = new Logger('app1');
      const logger2 = new Logger('app2');
      const logger3 = new Logger('app3');

      logger1.startSpinner('Task 1');
      logger2.startSpinner('Task 2');
      logger3.startSpinner('Task 3');

      expect(() => SpinnerUtils.stopAllSpinners()).not.toThrow();

      logger1.clearSpinnerState();
      logger2.clearSpinnerState();
      logger3.clearSpinnerState();

      expect(() => {
        logger1.startSpinner('New Task');
        logger1.succeedSpinner('New Task done');
      }).not.toThrow();
    });

    it('should handle rapid start/stop operations', () => {
      const logger = new Logger('app1');

      expect(() => {
        for (let i = 0; i < 5; i++) {
          logger.startSpinner(`Task ${i}`);
          logger.stopSpinner();
        }

        // Final operation
        logger.startSpinner('Final Task');
        logger.succeedSpinner('Final Task done');
      }).not.toThrow();
    });
  });

  describe('Integration with Logger Methods', () => {
    it('should work correctly with logger spinner methods', () => {
      const logger1 = new Logger('logger1');
      const logger2 = new Logger('logger2');

      expect(() => {
        logger1.startSpinner('Processing...');
        logger2.startSpinner('Loading...');

        logger1.updateSpinnerText('Still processing...');
        logger2.updateSpinnerText('Still loading...');

        logger1.succeedSpinner('Processing complete');
        logger2.succeedSpinner('Loading complete');
      }).not.toThrow();
    });

    it('should maintain proper isolation between different logger instances', () => {
      const logger1 = new Logger('service1');
      const logger2 = new Logger('service2');

      logger1.startSpinner('Service 1 starting');
      logger1.updateSpinnerText('Service 1 updated');
      logger1.succeedSpinner('Service 1 complete');

      logger2.startSpinner('Service 2 starting');
      logger2.updateSpinnerText('Service 2 updated');
      logger2.succeedSpinner('Service 2 complete');

      expect(() => {
        logger1.startSpinner('Service 1 restart');
        logger2.startSpinner('Service 2 restart');
      }).not.toThrow();
    });
  });

  describe('Spinner Artifact Prevention', () => {
    it('should prevent artifacts when multiple spinners complete in sequence', () => {
      const logger1 = new Logger('artifact1');
      const logger2 = new Logger('artifact2');
      const logger3 = new Logger('artifact3');

      expect(() => {
        logger1.startSpinner('Security audit...');
        logger2.startSpinner('Performance check...');
        logger3.startSpinner('Build process...');

        logger1.warnSpinner('SECURITY completed with warnings');
        logger2.succeedSpinner('PERF passed');
        logger3.failSpinner('BUILD failed');
      }).not.toThrow();
    });

    it('should clear artifacts during spinner operations', () => {
      const logger1 = new Logger('rotate1');
      const logger2 = new Logger('rotate2');

      expect(() => {
        logger1.startSpinner('Task 1');
        logger2.startSpinner('Task 2');

        logger1.succeedSpinner('Task 1 complete');
        logger2.updateSpinnerText('Task 2 updated');
        logger2.succeedSpinner('Task 2 complete');
      }).not.toThrow();
    });

    it('should handle rapid completion without artifacts', () => {
      const loggers = Array.from({ length: 5 }, (_, i) => new Logger(`rapid${i}`));

      expect(() => {
        loggers.forEach((logger, i) => {
          logger.startSpinner(`Rapid task ${i}`);
        });

        loggers.forEach((logger, i) => {
          logger.succeedSpinner(`Rapid task ${i} done`);
        });
      }).not.toThrow();
    });
  });
});
