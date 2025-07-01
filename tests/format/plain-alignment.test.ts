import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createLogger } from '../../src/logger';
import { setupTestEnvironment } from '../helpers/test-environment';

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

    // Setup secure test environment with default non-CI behavior
    setupTestEnvironment();

    // Mock console methods to capture output
    console.log = (message: string) => output.push(message);
    console.error = (message: string) => errorOutput.push(message);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should align PLAIN level with other levels when icons are enabled', () => {
    setupTestEnvironment(false, true); // showTimestamp=false, showPrefix=true
    const logger = createLogger('TEST');

    logger.task('This is a TASK message');
    logger.plain('This is a PLAIN message');

    // Strip ANSI codes for testing
    const taskLine = stripAnsi(output[0]);
    const plainLine = stripAnsi(output[1]);

    // New centralized format: LEVEL [prefix] symbol message
    // TASK: "TASK     [TEST] → This is a TASK message"
    // PLAIN: "PLAIN    [TEST]   This is a PLAIN message" (no symbol for plain)
    expect(taskLine).toMatch(/^TASK\s+\[TEST\] →/);
    expect(plainLine).toMatch(/^PLAIN\s+\[TEST\]\s+This is a PLAIN message/); // No symbol for plain level
  });

  it('should align PLAIN level with other levels when icons are disabled', () => {
    setupTestEnvironment(false, true, true); // showTimestamp=false, showPrefix=true, hideIcons=true
    const logger = createLogger('TEST');

    logger.task('This is a TASK message');
    logger.plain('This is a PLAIN message');

    // Strip ANSI codes for testing
    const taskLine = stripAnsi(output[0]);
    const plainLine = stripAnsi(output[1]);

    // When icons disabled, no symbols should appear
    // TASK: "TASK     [TEST] This is a TASK message" (no → symbol)
    // PLAIN: "PLAIN    [TEST] This is a PLAIN message"
    expect(taskLine).toMatch(/^TASK\s+\[TEST\]\s+This is a TASK message/);
    expect(plainLine).toMatch(/^PLAIN\s+\[TEST\]\s+This is a PLAIN message/);

    // Neither should start with spaces when icons are disabled
    expect(taskLine).not.toMatch(/^\s/);
    expect(plainLine).not.toMatch(/^\s/);
  });

  it('should maintain alignment in fallback mode (no Unicode)', () => {
    setupTestEnvironment(false, true); // showTimestamp=false, showPrefix=true
    process.env.DEVLOGR_NO_UNICODE = 'true';
    const logger = createLogger('TEST');

    logger.task('This is a TASK message');
    logger.plain('This is a PLAIN message');

    // Strip ANSI codes for testing
    const taskLine = stripAnsi(output[0]);
    const plainLine = stripAnsi(output[1]);

    // With fallback symbols (new format):
    // TASK: "TASK     [TEST] > This is a TASK message"
    // PLAIN: "PLAIN    [TEST]   This is a PLAIN message" (no symbol)
    expect(taskLine).toMatch(/^TASK\s+\[TEST\] >/);
    expect(plainLine).toMatch(/^PLAIN\s+\[TEST\]\s+This is a PLAIN message/); // No symbol for plain
  });

  it('should maintain alignment with timestamps', () => {
    setupTestEnvironment(true, true); // showTimestamp=true, showPrefix=true
    const logger = createLogger('TEST');

    logger.task('This is a TASK message');
    logger.plain('This is a PLAIN message');

    // Strip ANSI codes and timestamps for testing alignment
    const taskLine = stripAnsi(output[0]).replace(/^\[[^\]]+\] /, '');
    const plainLine = stripAnsi(output[1]).replace(/^\[[^\]]+\] /, '');

    // After removing timestamp, should have same alignment pattern (new format)
    expect(taskLine).toMatch(/^TASK\s+\[TEST\] →/);
    expect(plainLine).toMatch(/^PLAIN\s+\[TEST\]\s+This is a PLAIN message/); // No symbol for plain
  });
});
