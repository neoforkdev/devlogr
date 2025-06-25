import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createLogger } from '../../src/logger';

// Helper function to strip ANSI codes
const stripAnsi = (text: string): string => {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-9;]*m/g, '');
};

describe('PLAIN Level Alignment', () => {
  let originalEnv: typeof process.env;
  let output: string[];
  let errorOutput: string[];

  beforeEach(() => {
    originalEnv = { ...process.env };
    output = [];
    errorOutput = [];

    // Mock console methods to capture output
    console.log = (message: string) => output.push(message);
    console.error = (message: string) => errorOutput.push(message);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should align PLAIN level with other levels when icons are enabled', () => {
    process.env.DEVLOGR_SHOW_PREFIX = 'true';
    const logger = createLogger('TEST');

    logger.task('This is a TASK message');
    logger.plain('This is a PLAIN message');

    // Strip ANSI codes for testing
    const taskLine = stripAnsi(output[0]);
    const plainLine = stripAnsi(output[1]);

    // Both should have the same structure: symbol/space + space + LEVEL + space + [prefix] + message
    // TASK: "→ TASK     [TEST] This is a TASK message"
    // PLAIN: "  PLAIN    [TEST] This is a PLAIN message"
    expect(taskLine).toMatch(/^→ TASK\s+\[TEST\]/);
    expect(plainLine).toMatch(/^ {2}PLAIN\s+\[TEST\]/); // Two spaces for alignment
  });

  it('should align PLAIN level with other levels when icons are disabled', () => {
    process.env.DEVLOGR_NO_ICONS = 'true';
    process.env.DEVLOGR_SHOW_PREFIX = 'true';
    const logger = createLogger('TEST');

    logger.task('This is a TASK message');
    logger.plain('This is a PLAIN message');

    // Strip ANSI codes for testing
    const taskLine = stripAnsi(output[0]);
    const plainLine = stripAnsi(output[1]);

    // Both should have no icon space when icons are disabled
    // TASK: "TASK     [TEST] This is a TASK message"
    // PLAIN: "PLAIN    [TEST] This is a PLAIN message"
    expect(taskLine).toMatch(/^TASK\s+\[TEST\]/);
    expect(plainLine).toMatch(/^PLAIN\s+\[TEST\]/);

    // Neither should start with spaces when icons are disabled
    expect(taskLine).not.toMatch(/^\s/);
    expect(plainLine).not.toMatch(/^\s/);
  });

  it('should maintain alignment in fallback mode (no Unicode)', () => {
    process.env.DEVLOGR_NO_UNICODE = 'true';
    process.env.DEVLOGR_SHOW_PREFIX = 'true';
    const logger = createLogger('TEST');

    logger.task('This is a TASK message');
    logger.plain('This is a PLAIN message');

    // Strip ANSI codes for testing
    const taskLine = stripAnsi(output[0]);
    const plainLine = stripAnsi(output[1]);

    // With fallback symbols:
    // TASK: "> TASK     [TEST] This is a TASK message"
    // PLAIN: "  PLAIN    [TEST] This is a PLAIN message"
    expect(taskLine).toMatch(/^> TASK\s+\[TEST\]/);
    expect(plainLine).toMatch(/^ {2}PLAIN\s+\[TEST\]/); // Two spaces for alignment
  });

  it('should maintain alignment with timestamps', () => {
    process.env.DEVLOGR_SHOW_PREFIX = 'true';
    process.env.DEVLOGR_SHOW_TIMESTAMP = 'true';
    const logger = createLogger('TEST');

    logger.task('This is a TASK message');
    logger.plain('This is a PLAIN message');

    // Strip ANSI codes and timestamps for testing alignment
    const taskLine = stripAnsi(output[0]).replace(/^\[[^\]]+\] /, '');
    const plainLine = stripAnsi(output[1]).replace(/^\[[^\]]+\] /, '');

    // After removing timestamp, should have same alignment pattern
    expect(taskLine).toMatch(/^→ TASK\s+\[TEST\]/);
    expect(plainLine).toMatch(/^ {2}PLAIN\s+\[TEST\]/);
  });
});
