import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DevLogrRenderer, DevLogrRendererOptions } from '../../src/devlogr-renderer';
import { EventEmitter } from 'events';

// Create mock task objects that implement the ListrTaskObject interface
const createMockTask = (title: string, options: any = {}) => {
  const task = {
    title,
    output: options.output || '',
    message: { skip: options.skipReason },
    subtasks: options.subtasks || [],
    isEnabled: () => options.enabled !== false,
    isStarted: () => options.started || false,
    isCompleted: () => options.completed || false,
    hasFailed: () => options.failed || false,
    isSkipped: () => options.skipped || false,
    hasSubtasks: () => (options.subtasks && options.subtasks.length > 0) || false,
    on: vi.fn(),
  };
  return task;
};

describe('DevLogrRenderer', () => {
  let renderer: DevLogrRenderer;
  let options: DevLogrRendererOptions;

  beforeEach(() => {
    vi.useFakeTimers();
    options = {
      useColors: false,
      showTimestamp: false,
      supportsUnicode: true,
      prefix: 'test',
      lazy: false,
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render a simple task that completes successfully', () => {
    // Enable prefix for this test
    process.env.DEVLOGR_SHOW_PREFIX = 'true';

    const mockTasks = [
      {
        title: 'My Task',
        isEnabled: () => true,
        isStarted: () => true,
        isCompleted: () => false,
        hasFailed: () => false,
        isSkipped: () => false,
        hasSubtasks: () => false,
        output: null,
        message: {},
        on: vi.fn(), // Mock event listener
      },
    ];

    const renderer = new DevLogrRenderer(mockTasks as any, {
      useColors: false,
      showTimestamp: false,
      supportsUnicode: true,
      prefix: 'test',
    });

    // Mock spinner
    (renderer as any).spinner = { fetch: () => '⠋' };

    // Should render task in running state
    const runningOutput = (renderer as any).createOutput();
    expect(runningOutput).toContain('⠋ My Task');
    expect(runningOutput).toContain('[test]');

    // Change to completed state
    mockTasks[0].isStarted = () => false;
    mockTasks[0].isCompleted = () => true;

    const completedOutput = (renderer as any).createOutput();
    expect(completedOutput).toContain('✔ My Task');
    expect(completedOutput).toContain('[test]');
  });

  it('should correctly indent subtasks', () => {
    const subtask = createMockTask('Subtask 1', { started: true });
    const parentTask = createMockTask('Parent Task', {
      started: true,
      subtasks: [subtask],
    });

    renderer = new DevLogrRenderer([parentTask as any], options);
    const output = (renderer as any).createOutput();

    expect(output).toContain('⠋ Parent Task');
    expect(output).toContain('  ⠋ Subtask 1');
  });

  it('should render task output correctly', () => {
    const task = createMockTask('Task with Output', {
      started: true,
      output: 'Here is some output\nAnd some more output',
    });

    renderer = new DevLogrRenderer([task as any], options);
    const output = (renderer as any).createOutput();

    expect(output).toContain('› Here is some output');
    expect(output).toContain('› And some more output');
  });

  it('should render a skipped task with a reason', () => {
    const task = createMockTask('Skippable Task', {
      skipped: true,
      skipReason: 'Skipped for a good reason',
    });

    renderer = new DevLogrRenderer([task as any], options);
    const output = (renderer as any).createOutput();

    expect(output).toContain('◯ Skippable Task -> Skipped for a good reason');
  });

  it('should render a failed task', () => {
    const task = createMockTask('Failing Task', {
      started: true,
      failed: true,
    });

    renderer = new DevLogrRenderer([task as any], options);
    const output = (renderer as any).createOutput();

    expect(output).toContain('✖ Failing Task');
  });
});
