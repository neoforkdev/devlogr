import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Logger } from '../src/logger';
import { LogLevel } from '../src/types';

// A more robust mock that captures all states of the output
const MOCK_UPDATER_CALLS: { all: string[], last: string } = { all: [], last: '' };
const MOCK_UPDATER = {
  clear: vi.fn(),
  done: vi.fn(),
  log: (str: string) => {
    MOCK_UPDATER_CALLS.all.push(str);
    MOCK_UPDATER_CALLS.last = str;
  },
};
vi.mock('log-update', () => ({
  createLogUpdate: vi.fn(() => MOCK_UPDATER.log),
}));


describe('Prefix and Artifacts Tests', () => {

  beforeEach(() => {
    MOCK_UPDATER_CALLS.all = [];
    MOCK_UPDATER_CALLS.last = '';
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  describe('Single Spinner', () => {
    it('should always show the prefix and leave no artifacts when timestamp is OFF', async () => {
      // Arrange
      vi.stubEnv('DEVLOGR_SHOW_TIMESTAMP', 'false');
      const logger = new Logger('WebApp');
      
      // Act
      logger.startSpinner('Loading assets...');
      await vi.advanceTimersByTimeAsync(500); // Let spinner run
      logger.completeSpinnerWithSuccess('Assets loaded');
      await vi.advanceTimersByTimeAsync(100); // Let completion render

      // Assert
      const runningSpinnerLine = MOCK_UPDATER_CALLS.all.find(line => line.includes('Loading assets'));
      const finalLine = MOCK_UPDATER_CALLS.last;

      // 1. Prefix is shown during spinner execution
      expect(runningSpinnerLine).toContain('[WebApp]');
      
      // 2. Final line is clean and has the prefix
      expect(finalLine).toContain('[WebApp]');
      expect(finalLine).toContain('✔');
      expect(finalLine).toContain('Assets loaded');

      // 3. No artifacts - should be exactly one line for the spinner from start to finish
      const spinnerLines = MOCK_UPDATER_CALLS.all.filter(line => line.includes('[WebApp]'));
      expect(spinnerLines).toHaveLength(1);
    });

    it('should always show the prefix with a timestamp and leave no artifacts when timestamp is ON', async () => {
      // Arrange
      vi.stubEnv('DEVLOGR_SHOW_TIMESTAMP', 'true');
      const logger = new Logger('Database');

      // Act
      logger.startSpinner('Running migration...');
      await vi.advanceTimersByTimeAsync(500);
      logger.completeSpinnerWithError('Migration failed');
      await vi.advanceTimersByTimeAsync(100);

      // Assert
      const runningSpinnerLine = MOCK_UPDATER_CALLS.all.find(line => line.includes('Running migration'));
      const finalLine = MOCK_UPDATER_CALLS.last;
      const timestampRegex = /\[\d{2}:\d{2}:\d{2}\]/;

      // 1. Prefix and timestamp are shown during execution
      expect(runningSpinnerLine).toMatch(timestampRegex);
      expect(runningSpinnerLine).toContain('[Database]');

      // 2. Final line is clean and has prefix/timestamp
      expect(finalLine).toMatch(timestampRegex);
      expect(finalLine).toContain('[Database]');
      expect(finalLine).toContain('✖');
      expect(finalLine).toContain('Migration failed');

      // 3. No artifacts
      const spinnerLines = MOCK_UPDATER_CALLS.all.filter(line => line.includes('[Database]'));
      expect(spinnerLines).toHaveLength(1);
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
          task: () => logger.createTaskList([
            { title: 'Sub-task 1', task: async () => await vi.advanceTimersByTimeAsync(200) },
            { title: 'Sub-task 2', task: async () => await vi.advanceTimersByTimeAsync(200) },
          ]),
        },
        { title: 'Another Task', task: async () => await vi.advanceTimersByTimeAsync(200) },
      ];

      // Act
      await logger.runSequentialTasks('Deployment', tasks);

      // Assert
      // Every single line of output related to the tasks should have the prefix
      const taskLines = MOCK_UPDATER_CALLS.all.filter(line => line.includes('TASK'));
      taskLines.forEach(line => {
        expect(line).toContain('[API]');
      });

      // Check final output for key elements
      const finalOutput = MOCK_UPDATER_CALLS.all.join('\n');
      expect(finalOutput).toContain('Main Task');
      expect(finalOutput).toContain('Sub-task 1');
      expect(finalOutput).toContain('Another Task');
    });

    it('should show the prefix and timestamps on all tasks', async () => {
      // Arrange
      vi.stubEnv('DEVLOGR_SHOW_TIMESTAMP', 'true');
      const logger = new Logger('ETL');
      const tasks = [
        { title: 'Extract', task: async () => await vi.advanceTimersByTimeAsync(200) },
        { title: 'Transform', task: async () => await vi.advanceTimersByTimeAsync(200) },
        { title: 'Load', task: async () => await vi.advanceTimersByTimeAsync(200) },
      ];
      const timestampRegex = /\[\d{2}:\d{2}:\d{2}\]/;

      // Act
      await logger.runConcurrentTasks('Data Pipeline', tasks);

      // Assert
      const taskLines = MOCK_UPDATER_CALLS.all.filter(line => line.includes('TASK'));

      // Every task line must have a timestamp and the prefix
      taskLines.forEach(line => {
        expect(line).toMatch(timestampRegex);
        expect(line).toContain('[ETL]');
      });

      // Check the final summary message
      const summaryLine = MOCK_UPDATER_CALLS.all.find(line => line.includes('completed successfully'));
      expect(summaryLine).toMatch(timestampRegex);
      expect(summaryLine).toContain('[ETL]');
    });
  });
}); 