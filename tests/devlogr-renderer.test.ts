import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Listr, ListrTask, ListrTaskObject, ListrEventType, ListrTaskState } from 'listr2';
import { DevLogrRenderer, DevLogrRendererOptions } from '../src/devlogr-renderer';
import { EventEmitter } from 'events';

// Mock log-update to capture output
const MOCK_UPDATER_CALLS: string[] = [];
const MOCK_UPDATER = {
  clear: vi.fn(),
  done: vi.fn(),
  log: (str: string) => MOCK_UPDATER_CALLS.push(str),
};
vi.mock('log-update', () => ({
  createLogUpdate: vi.fn(() => MOCK_UPDATER.log),
}));

vi.mock('listr2', async (importOriginal) => {
    const original = await importOriginal<typeof import('listr2')>();
    const spinner = {
        start: vi.fn((cb) => {
            if (cb) setInterval(cb, 100);
        }),
        stop: vi.fn(),
        fetch: vi.fn(() => '⠋'), 
    };
    class MockSpinner extends original.Spinner {
        constructor() {
            super();
            Object.assign(this, spinner);
        }
    }
    return {
        ...original,
        Spinner: MockSpinner,
    };
});

describe('DevLogrRenderer', () => {
  let tasks: any[];
  let options: DevLogrRendererOptions;

  beforeEach(() => {
    vi.useFakeTimers();
    options = {
        useColors: false,
        showTimestamp: false,
        supportsUnicode: true,
        lazy: false
    };
    MOCK_UPDATER_CALLS.length = 0;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const runTasks = async (tasksToRun: any[]) => {
    const listr = new Listr(tasksToRun, { renderer: DevLogrRenderer, rendererOptions: options });
    try {
      await listr.run();
    } catch (e) {
      // ignore errors in tests
    }
  };
  
  it('should render a simple task that completes successfully', async () => {
    tasks = [
      {
        title: 'My Task',
        task: async (ctx, task) => {
          await new Promise(resolve => setTimeout(resolve, 200));
          task.title = 'My Task (completed)';
        },
      },
    ] as any;
    
    const runPromise = runTasks(tasks);

    await vi.advanceTimersByTimeAsync(100);
    expect(MOCK_UPDATER_CALLS.at(-1)).toContain('⠋ My Task');

    await vi.advanceTimersByTimeAsync(200);
    await runPromise;

    expect(MOCK_UPDATER_CALLS.at(-1)).toContain('✔ My Task (completed)');
  });

  it('should correctly indent subtasks', async () => {
    tasks = [
        {
            title: 'Parent Task',
            task: () => new Listr([
                {
                    title: 'Subtask 1',
                    task: async () => await new Promise(resolve => setTimeout(resolve, 200))
                }
            ], { renderer: DevLogrRenderer, rendererOptions: options })
        }
    ] as any;
    const runPromise = runTasks(tasks);
    
    await vi.advanceTimersByTimeAsync(100);
    expect(MOCK_UPDATER_CALLS.at(-1)).toContain('  ⠋ Subtask 1');

    await vi.advanceTimersByTimeAsync(200);
    await runPromise;

    expect(MOCK_UPDATER_CALLS.at(-1)).toContain('  ✔ Subtask 1');
  });

  it('should render task output correctly', async () => {
      tasks = [
          {
              title: 'Task with Output',
              task: async (ctx, task) => {
                  task.output('Here is some output');
                  await new Promise(resolve => setTimeout(resolve, 100));
                  task.output('And some more output');
              }
          }
      ] as any;
      
      const runPromise = runTasks(tasks);
      await vi.advanceTimersByTimeAsync(50);
      
      expect(MOCK_UPDATER_CALLS.at(-1)).toContain('› Here is some output');

      await vi.advanceTimersByTimeAsync(100);
      await runPromise;
      
      expect(MOCK_UPDATER_CALLS.at(-1)).toContain('› And some more output');
  });

  it('should render a skipped task with a reason', async () => {
    tasks = [
      {
        title: 'Skippable Task',
        task: (ctx, task) => task.skip('Skipped for a good reason'),
      },
    ] as any;

    await runTasks(tasks);
    
    expect(MOCK_UPDATER_CALLS.at(-1)).toContain('◯ Skippable Task -> Skipped for a good reason');
  });

  it('should render a failed task', async () => {
    tasks = [
      {
        title: 'Failing Task',
        task: () => { throw new Error('This task failed'); },
      },
    ] as any;
    
    await runTasks(tasks);

    expect(MOCK_UPDATER_CALLS.at(-1)).toContain('✖ Failing Task');
  });
}); 