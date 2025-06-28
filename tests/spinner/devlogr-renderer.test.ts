import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DevLogrRenderer, DevLogrRendererOptions } from '../../src/devlogr-renderer';
import { setupTestEnvironment } from '../helpers/test-environment';
import { stripAnsiColors } from '../helpers/ansi-utils';

// Create mock task objects that implement the ListrTaskObject interface
const createMockTask = (title: string, options: Record<string, unknown> = {}) => {
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
    setupTestEnvironment(); // Secure test environment setup
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
    // Enable prefix for this test to show the new centralized format
    setupTestEnvironment(false, true); // showTimestamp=false, showPrefix=true

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

    // Should render task in running state - new format: TASK [test] ⠋ My Task
    const runningOutput = stripAnsiColors((renderer as any).createOutput());
    expect(runningOutput).toContain('TASK');
    expect(runningOutput).toContain('[test]');
    expect(runningOutput).toContain('⠋');
    expect(runningOutput).toContain('My Task');

    // Change to completed state
    mockTasks[0].isStarted = () => false;
    mockTasks[0].isCompleted = () => true;

    const completedOutput = stripAnsiColors((renderer as any).createOutput());
    expect(completedOutput).toContain('TASK');
    expect(completedOutput).toContain('[test]');
    expect(completedOutput).toContain('✔');
    expect(completedOutput).toContain('My Task');
  });

  it('should correctly indent subtasks', () => {
    const subtask = createMockTask('Subtask 1', { started: true });
    const parentTask = createMockTask('Parent Task', {
      started: true,
      subtasks: [subtask],
    });

    renderer = new DevLogrRenderer([parentTask as any], options);
    const output = stripAnsiColors((renderer as any).createOutput());

    // In default mode (no prefix), format is: ⠋ Parent Task
    expect(output).toContain('⠋ Parent Task');
    expect(output).toContain('  ⠋ Subtask 1'); // Indented subtask
  });

  it('should render task output correctly', () => {
    const task = createMockTask('Task with Output', {
      started: true,
      output: 'Here is some output\nAnd some more output',
    });

    renderer = new DevLogrRenderer([task as any], options);
    const output = stripAnsiColors((renderer as any).createOutput());

    // Output lines are still prefixed with ›
    expect(output).toContain('› Here is some output');
    expect(output).toContain('› And some more output');
  });

  it('should render a skipped task with a reason', () => {
    const task = createMockTask('Skippable Task', {
      skipped: true,
      skipReason: 'Skipped for a good reason',
    });

    renderer = new DevLogrRenderer([task as any], options);
    const output = stripAnsiColors((renderer as any).createOutput());

    // In default mode, format is: ◯ Skippable Task -> Skipped for a good reason
    expect(output).toContain('◯ Skippable Task -> Skipped for a good reason');
  });

  it('should render a failed task', () => {
    const task = createMockTask('Failing Task', {
      started: true,
      failed: true,
    });

    renderer = new DevLogrRenderer([task as any], options);
    const output = stripAnsiColors((renderer as any).createOutput());

    // In default mode, format is: ✖ Failing Task
    expect(output).toContain('✖ Failing Task');
  });
});
