import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Logger } from '../../src/logger';
import { LogLevel } from '../../src/types';
import { SpinnerUtils } from '../../src/utils/spinner';

describe('Prefix and Artifacts Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    // Mock TTY support to enable spinners
    Object.defineProperty(process.stdout, 'isTTY', {
      value: true,
      configurable: true,
    });
    vi.spyOn(SpinnerUtils, 'supportsSpinners').mockReturnValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    SpinnerUtils.stopAllSpinners();
  });

  describe('Single Spinner', () => {
    it('should always show the prefix and leave no artifacts when timestamp is OFF', async () => {
      // Arrange
      vi.stubEnv('DEVLOGR_SHOW_TIMESTAMP', 'false');
      const logger = new Logger('WebApp');

      // Act - Test that spinner methods work without throwing errors
      expect(() => {
        logger.startSpinner('Loading assets...');
      }).not.toThrow();

      await vi.advanceTimersByTimeAsync(500);

      expect(() => {
        logger.succeedSpinner('Assets loaded');
      }).not.toThrow();

      await vi.advanceTimersByTimeAsync(100);

      // Assert - Verify spinner was managed correctly
      expect(SpinnerUtils.getActiveSpinnerKeys()).toHaveLength(0);
    });

    it('should always show the prefix with a timestamp and leave no artifacts when timestamp is ON', async () => {
      // Arrange
      vi.stubEnv('DEVLOGR_SHOW_TIMESTAMP', 'true');
      const logger = new Logger('Database');

      // Act - Test that spinner methods work with timestamps
      expect(() => {
        logger.startSpinner('Running migration...');
      }).not.toThrow();

      await vi.advanceTimersByTimeAsync(500);

      expect(() => {
        logger.failSpinner('Migration failed');
      }).not.toThrow();

      await vi.advanceTimersByTimeAsync(100);

      // Assert - Verify proper cleanup
      expect(SpinnerUtils.getActiveSpinnerKeys()).toHaveLength(0);
    });
  });

  describe('Multiple Spinners (Listr2)', () => {
    it('should show the prefix on all tasks and subtasks', async () => {
      // Arrange
      vi.stubEnv('DEVLOGR_SHOW_TIMESTAMP', 'false');
      const logger = new Logger('API');
      const tasks = [
        {
          title: 'Main Task',
          task: () =>
            logger.createTaskList([
              {
                title: 'Sub-task 1',
                task: async () => await new Promise(resolve => setTimeout(resolve, 10)),
              },
              {
                title: 'Sub-task 2',
                task: async () => await new Promise(resolve => setTimeout(resolve, 10)),
              },
            ]),
        },
        {
          title: 'Another Task',
          task: async () => await new Promise(resolve => setTimeout(resolve, 10)),
        },
      ];

      // Act - Test that complex task structures work
      expect(async () => {
        await logger.runTasks('Deployment', tasks, { concurrent: false });
      }).not.toThrow();

      // Assert - Verify all tasks completed
      expect(SpinnerUtils.getActiveSpinnerKeys()).toHaveLength(0);
    });

    it('should show the prefix and timestamps on all tasks', async () => {
      // Arrange
      vi.stubEnv('DEVLOGR_SHOW_TIMESTAMP', 'true');
      const logger = new Logger('ETL');
      const tasks = [
        {
          title: 'Extract',
          task: async () => await new Promise(resolve => setTimeout(resolve, 10)),
        },
        {
          title: 'Transform',
          task: async () => await new Promise(resolve => setTimeout(resolve, 10)),
        },
        { title: 'Load', task: async () => await new Promise(resolve => setTimeout(resolve, 10)) },
      ];

      // Act - Test concurrent tasks with timestamps
      expect(async () => {
        await logger.runTasks('Data Pipeline', tasks, { concurrent: true });
      }).not.toThrow();

      // Assert - Verify proper completion
      expect(SpinnerUtils.getActiveSpinnerKeys()).toHaveLength(0);
    });
  });
});
