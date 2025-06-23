import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DevLogrRenderer } from '../../src/devlogr-renderer';
import chalk from 'chalk';

describe('Spinner Colors Integration', () => {
  let renderer: DevLogrRenderer;
  let mockTasks: any[];

  beforeEach(() => {
    // Create mock tasks with different states
    mockTasks = [
      {
        title: 'Loading Task',
        isEnabled: () => true,
        isStarted: () => true,
        isCompleted: () => false,
        hasFailed: () => false,
        isSkipped: () => false,
        hasSubtasks: () => false,
        output: null,
        message: {},
      },
      {
        title: 'Completed Task',
        isEnabled: () => true,
        isStarted: () => true,
        isCompleted: () => true,
        hasFailed: () => false,
        isSkipped: () => false,
        hasSubtasks: () => false,
        output: null,
        message: {},
      },
      {
        title: 'Failed Task',
        isEnabled: () => true,
        isStarted: () => true,
        isCompleted: () => false,
        hasFailed: () => true,
        isSkipped: () => false,
        hasSubtasks: () => false,
        output: null,
        message: {},
      },
      {
        title: 'Skipped Task',
        isEnabled: () => true,
        isStarted: () => false,
        isCompleted: () => false,
        hasFailed: () => false,
        isSkipped: () => true,
        hasSubtasks: () => false,
        output: null,
        message: { skip: 'Skipped for testing' },
      },
    ] as any;
  });

  it('should apply colors when useColors is enabled', () => {
    renderer = new DevLogrRenderer(mockTasks, {
      useColors: true,
      showTimestamp: false,
      supportsUnicode: true,
      prefix: 'test',
    });

    // Mock the spinner to return a symbol
    (renderer as any).spinner = { fetch: () => '⠋' };

    // Get the output by calling the private method
    const output = (renderer as any).createOutput();

    // In CI environments, colors might be disabled, so check conditionally
    const hasColors =
      process.stdout.isTTY && !process.env.NO_COLOR && !process.env.DEVLOGR_NO_COLOR;
    if (hasColors) {
      expect(output).toContain('\u001b['); // Contains ANSI escape sequences
    }
    expect(output).toContain('Loading Task');
    expect(output).toContain('Completed Task');
    expect(output).toContain('Failed Task');
    expect(output).toContain('Skipped Task');
  });

  it('should not apply colors when useColors is disabled', () => {
    renderer = new DevLogrRenderer(mockTasks, {
      useColors: false,
      showTimestamp: false,
      supportsUnicode: true,
      prefix: 'test',
    });

    // Mock the spinner to return a symbol
    (renderer as any).spinner = { fetch: () => '⠋' };

    // Get the output by calling the private method
    const output = (renderer as any).createOutput();

    // Verify that no ANSI color codes are present
    expect(output).not.toContain('\u001b['); // No ANSI escape sequences
    expect(output).toContain('⠋'); // Spinner symbol should still be there
    expect(output).toContain('✔'); // Success symbol should still be there
    expect(output).toContain('✖'); // Error symbol should still be there
    expect(output).toContain('◯'); // Skip symbol should still be there
  });

  it('should use correct color codes for each state', () => {
    renderer = new DevLogrRenderer(mockTasks, {
      useColors: true,
      showTimestamp: false,
      supportsUnicode: true,
      prefix: 'test',
    });

    // Mock the spinner to return a symbol
    (renderer as any).spinner = { fetch: () => '⠋' };

    // Get the output by calling the private method
    const output = (renderer as any).createOutput();

    // In CI environments, colors might be disabled, so check conditionally
    const hasColors =
      process.stdout.isTTY && !process.env.NO_COLOR && !process.env.DEVLOGR_NO_COLOR;
    if (hasColors) {
      // Check for specific color codes
      expect(output).toContain('\u001b[34m'); // Blue for loading (spinner)
      expect(output).toContain('\u001b[32m'); // Green for success
      expect(output).toContain('\u001b[31m'); // Red for error
      expect(output).toContain('\u001b[33m'); // Yellow for skipped
    } else {
      // In environments without color support, just verify the content is there
      expect(output).toContain('⠋'); // Spinner symbol
      expect(output).toContain('✔'); // Success symbol
      expect(output).toContain('✖'); // Error symbol
      expect(output).toContain('◯'); // Skip symbol
    }
  });

  it('should maintain correct symbols with colors', () => {
    const blueSpinner = chalk.blue('⠋');
    const greenCheck = chalk.green('✔');
    const redX = chalk.red('✖');
    const yellowCircle = chalk.yellow('◯');

    // In CI environments, colors might be disabled, so check conditionally
    const hasColors =
      process.stdout.isTTY && !process.env.NO_COLOR && !process.env.DEVLOGR_NO_COLOR;
    if (hasColors) {
      // Verify that our color application produces the expected strings
      expect(blueSpinner).toContain('\u001b[34m');
      expect(redX).toContain('\u001b[31m');
      expect(yellowCircle).toContain('\u001b[33m');
    }

    // These should always contain the symbols regardless of color support
    expect(blueSpinner).toContain('⠋');
    expect(greenCheck).toContain('✔');
    expect(redX).toContain('✖');
    expect(yellowCircle).toContain('◯');
  });

  it('should handle task output with cyan color', () => {
    const taskWithOutput = {
      title: 'Task with Output',
      isEnabled: () => true,
      isStarted: () => true,
      isCompleted: () => false,
      hasFailed: () => false,
      isSkipped: () => false,
      hasSubtasks: () => false,
      output: 'Some output message',
      message: {},
    } as any;

    renderer = new DevLogrRenderer([taskWithOutput], {
      useColors: true,
      showTimestamp: false,
      supportsUnicode: true,
      prefix: 'test',
    });

    // Mock the spinner
    (renderer as any).spinner = { fetch: () => '⠋' };

    const output = (renderer as any).createOutput();

    // In CI environments, colors might be disabled, so check conditionally
    const hasColors =
      process.stdout.isTTY && !process.env.NO_COLOR && !process.env.DEVLOGR_NO_COLOR;
    if (hasColors) {
      expect(output).toContain('\u001b[36m'); // Cyan color code
    }
    expect(output).toContain('›'); // Output symbol
    expect(output).toContain('Some output message');
  });
});
