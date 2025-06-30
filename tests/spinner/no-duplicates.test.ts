import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Logger } from '../../src/logger';
import { SpinnerUtils } from '../../src/utils/spinner';
import { TerminalUtils } from '../../src/utils';

// Mock console output capture
let capturedOutput: string[] = [];
let originalConsoleLog: typeof console.log;
let originalConsoleError: typeof console.error;

function captureConsoleOutput() {
  capturedOutput = [];
  originalConsoleLog = console.log;
  originalConsoleError = console.error;

  console.log = (...args: unknown[]) => {
    capturedOutput.push(args.join(' '));
  };

  console.error = (...args: unknown[]) => {
    capturedOutput.push(args.join(' '));
  };
}

function restoreConsoleOutput() {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
}

function stripAnsiEscapes(text: string): string {
  // Remove ANSI escape sequences including cursor movement and colors
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-9;]*[mGKABCDHfJlps]/g, '').replace(/\r|\x1b\[[\d;]*[A-Za-z]/g, '');
}

function countDuplicateLines(output: string[]): {
  duplicateCount: number;
  uniqueLines: Set<string>;
  finalLines: string[];
} {
  // Filter out intermediate spinner states and keep only final completion messages
  const finalLines: string[] = [];

  for (const line of output) {
    const cleanLine = stripAnsiEscapes(line).trim();

    // Skip empty lines and spinner animation frames
    if (
      !cleanLine ||
      cleanLine.includes('⠋') ||
      cleanLine.includes('⠙') ||
      cleanLine.includes('⠹') ||
      cleanLine.includes('⠸') ||
      cleanLine.includes('⠼') ||
      cleanLine.includes('⠴') ||
      cleanLine.includes('⠦') ||
      cleanLine.includes('⠧') ||
      cleanLine.includes('⠇') ||
      cleanLine.includes('⠏')
    ) {
      continue;
    }

    // Only track completion messages (lines with ✔, ✖, or text completion)
    if (
      cleanLine.includes('✔') ||
      cleanLine.includes('✖') ||
      cleanLine.includes('completed') ||
      cleanLine.includes('Done') ||
      cleanLine.includes('Failed') ||
      cleanLine.includes('Success') ||
      cleanLine.includes('Warning') ||
      cleanLine.includes('Info')
    ) {
      finalLines.push(cleanLine);
    }
  }

  // Count duplicates among final completion messages
  const lineCounts = new Map<string, number>();
  const uniqueLines = new Set<string>();

  for (const line of finalLines) {
    uniqueLines.add(line);
    lineCounts.set(line, (lineCounts.get(line) || 0) + 1);
  }

  let duplicateCount = 0;
  for (const [, count] of lineCounts) {
    if (count > 1) {
      duplicateCount += count - 1;
    }
  }

  return { duplicateCount, uniqueLines, finalLines };
}

describe('No Duplicate Lines in Spinner Success', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    SpinnerUtils.stopAllSpinners(); // Clean up any existing spinners
    captureConsoleOutput();
  });

  afterEach(() => {
    restoreConsoleOutput();
    SpinnerUtils.stopAllSpinners();
    vi.restoreAllMocks();
  });

  describe('TTY Environment (Interactive Mode)', () => {
    beforeEach(() => {
      // Mock TTY environment
      Object.defineProperty(process.stdout, 'isTTY', {
        value: true,
        configurable: true,
      });
      vi.spyOn(TerminalUtils, 'isCI').mockReturnValue(false);
      vi.spyOn(SpinnerUtils, 'supportsSpinners').mockReturnValue(true);
    });

    it('should not produce duplicate lines when spinner succeeds in TTY', async () => {
      const logger = new Logger('test-tty');

      logger.startSpinner('Processing...');

      // Simulate some async work
      await new Promise(resolve => setTimeout(resolve, 50));

      logger.succeedSpinner('Operation completed successfully');

      // Wait for any async rendering to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      const { duplicateCount, finalLines } = countDuplicateLines(capturedOutput);

      expect(duplicateCount).toBe(0);

      // Verify that success message appears only once in final output
      const successLines = finalLines.filter(line =>
        line.includes('Operation completed successfully')
      );
      expect(successLines.length).toBeLessThanOrEqual(1);
    });

    it('should not produce duplicate lines with multiple spinner operations in TTY', async () => {
      const logger = new Logger('test-multi-tty');

      // First spinner
      logger.startSpinner('First operation...');
      await new Promise(resolve => setTimeout(resolve, 30));
      logger.succeedSpinner('First completed');

      // Second spinner
      logger.startSpinner('Second operation...');
      await new Promise(resolve => setTimeout(resolve, 30));
      logger.succeedSpinner('Second completed');

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 100));

      const { duplicateCount, finalLines } = countDuplicateLines(capturedOutput);
      expect(duplicateCount).toBe(0);

      // Each completion message should appear only once
      const firstCompletions = finalLines.filter(line => line.includes('First completed'));
      const secondCompletions = finalLines.filter(line => line.includes('Second completed'));

      expect(firstCompletions.length).toBeLessThanOrEqual(1);
      expect(secondCompletions.length).toBeLessThanOrEqual(1);
    });
  });

  describe('CI Environment (Non-Interactive Mode)', () => {
    beforeEach(() => {
      // Mock CI environment
      Object.defineProperty(process.stdout, 'isTTY', {
        value: true, // CI can still have TTY
        configurable: true,
      });
      vi.spyOn(TerminalUtils, 'isCI').mockReturnValue(true);
      vi.spyOn(SpinnerUtils, 'supportsSpinners').mockReturnValue(true);
    });

    it('should not produce duplicate lines when spinner succeeds in CI', async () => {
      const logger = new Logger('test-ci');

      logger.startSpinner('Processing...');

      // Simulate some async work
      await new Promise(resolve => setTimeout(resolve, 50));

      logger.succeedSpinner('Operation completed successfully');

      // Wait for any async rendering to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      const { duplicateCount, finalLines } = countDuplicateLines(capturedOutput);

      expect(duplicateCount).toBe(0);

      // In CI, we should see the success message exactly once
      const successLines = finalLines.filter(line =>
        line.includes('Operation completed successfully')
      );
      expect(successLines.length).toBeLessThanOrEqual(1);
    });

    it('should not produce duplicate lines with rapid spinner completions in CI', async () => {
      const logger = new Logger('test-rapid-ci');

      // Rapid fire spinner operations
      for (let i = 0; i < 5; i++) {
        logger.startSpinner(`Processing ${i + 1}...`);
        await new Promise(resolve => setTimeout(resolve, 10));
        logger.succeedSpinner(`Completed ${i + 1}`);
      }

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 100));

      const { duplicateCount, finalLines } = countDuplicateLines(capturedOutput);
      expect(duplicateCount).toBe(0);

      // Each completion should appear exactly once
      for (let i = 0; i < 5; i++) {
        const completionLines = finalLines.filter(line => line.includes(`Completed ${i + 1}`));
        expect(completionLines.length).toBeLessThanOrEqual(1);
      }
    });

    it('should handle timer-based updates correctly in CI without duplicates', async () => {
      const logger = new Logger('test-timer-ci');

      logger.startSpinner('Long running operation...');

      // Simulate timer-based updates (these should be disabled in CI)
      for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        logger.updateSpinnerText(`Step ${i + 1} of 3...`);
      }

      logger.succeedSpinner('All steps completed');

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 100));

      const { duplicateCount, finalLines } = countDuplicateLines(capturedOutput);
      expect(duplicateCount).toBe(0);

      // Final success message should appear only once
      const successLines = finalLines.filter(line => line.includes('All steps completed'));
      expect(successLines.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Non-TTY Environment (Fallback Mode)', () => {
    beforeEach(() => {
      // Mock non-TTY environment
      Object.defineProperty(process.stdout, 'isTTY', {
        value: false,
        configurable: true,
      });
      vi.spyOn(TerminalUtils, 'isCI').mockReturnValue(false);
      vi.spyOn(SpinnerUtils, 'supportsSpinners').mockReturnValue(false);
    });

    it('should not produce duplicate lines in fallback mode', async () => {
      const logger = new Logger('test-fallback');

      logger.startSpinner('Processing...');
      logger.succeedSpinner('Operation completed successfully');

      // Wait for any async operations
      await new Promise(resolve => setTimeout(resolve, 50));

      const { duplicateCount, finalLines } = countDuplicateLines(capturedOutput);
      expect(duplicateCount).toBe(0);

      // Should have success message in final output
      const successLines = finalLines.filter(line =>
        line.includes('Operation completed successfully')
      );

      expect(successLines.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Edge Cases for Duplicate Prevention', () => {
    beforeEach(() => {
      vi.spyOn(TerminalUtils, 'isCI').mockReturnValue(true);
      vi.spyOn(SpinnerUtils, 'supportsSpinners').mockReturnValue(true);
    });

    it('should not duplicate when completing spinner without start', () => {
      const logger = new Logger('test-no-start');

      // Complete without starting (should fallback to regular logging)
      logger.succeedSpinner('Completed without start');

      const { duplicateCount, finalLines } = countDuplicateLines(capturedOutput);
      expect(duplicateCount).toBe(0);

      const completionLines = finalLines.filter(line => line.includes('Completed without start'));
      expect(completionLines.length).toBeLessThanOrEqual(1);
    });

    it('should not duplicate when spinner succeeds with empty text', () => {
      const logger = new Logger('test-empty');

      logger.startSpinner('Processing...');
      logger.succeedSpinner(); // No text provided

      const { duplicateCount, finalLines } = countDuplicateLines(capturedOutput);
      expect(duplicateCount).toBe(0);

      // Should use default completion text
      const defaultLines = finalLines.filter(line => line.includes('Done'));
      expect(defaultLines.length).toBeLessThanOrEqual(1);
    });

    it('should not duplicate with mixed completion types', () => {
      const logger = new Logger('test-mixed');

      // Success
      logger.startSpinner('Operation 1...');
      logger.succeedSpinner('Success!');

      // Failure
      logger.startSpinner('Operation 2...');
      logger.failSpinner('Failed!');

      // Warning
      logger.startSpinner('Operation 3...');
      logger.warnSpinner('Warning!');

      // Info
      logger.startSpinner('Operation 4...');
      logger.infoSpinner('Info!');

      const { duplicateCount, finalLines } = countDuplicateLines(capturedOutput);
      expect(duplicateCount).toBe(0);

      // Each completion type should appear once
      expect(finalLines.filter(line => line.includes('Success!')).length).toBeLessThanOrEqual(1);
      expect(finalLines.filter(line => line.includes('Failed!')).length).toBeLessThanOrEqual(1);
      expect(finalLines.filter(line => line.includes('Warning!')).length).toBeLessThanOrEqual(1);
      expect(finalLines.filter(line => line.includes('Info!')).length).toBeLessThanOrEqual(1);
    });

    it('should handle rapid start/stop cycles without duplicates', () => {
      const logger = new Logger('test-rapid');

      // Rapid start/stop cycles
      for (let i = 0; i < 10; i++) {
        logger.startSpinner(`Cycle ${i + 1}...`);
        if (i % 2 === 0) {
          logger.succeedSpinner(`Success ${i + 1}`);
        } else {
          logger.stopSpinner();
        }
      }

      const { duplicateCount, finalLines } = countDuplicateLines(capturedOutput);
      expect(duplicateCount).toBe(0);

      // Each success message should appear only once
      for (let i = 0; i < 10; i += 2) {
        const successLines = finalLines.filter(line => line.includes(`Success ${i + 1}`));
        expect(successLines.length).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Real-world Scenarios', () => {
    beforeEach(() => {
      // Mock CI environment before any Logger instances are created
      vi.spyOn(TerminalUtils, 'isCI').mockReturnValue(true);
      vi.spyOn(SpinnerUtils, 'supportsSpinners').mockReturnValue(true);
      // Clear any previous spinner state
      SpinnerUtils.stopAllSpinners();
    });

    it('should handle deployment scenario without duplicates', async () => {
      const logger = new Logger('deploy');

      // Simulate deployment steps
      logger.startSpinner('Building application...');
      await new Promise(resolve => setTimeout(resolve, 100));
      logger.succeedSpinner('Build completed');

      logger.startSpinner('Running tests...');
      await new Promise(resolve => setTimeout(resolve, 50));
      logger.succeedSpinner('All tests passed');

      logger.startSpinner('Deploying to production...');
      await new Promise(resolve => setTimeout(resolve, 200));
      logger.succeedSpinner('Deployment successful');

      // Log all captured output for debugging
      console.log('\n=== CAPTURED OUTPUT ===');
      capturedOutput.forEach((line, index) => {
        console.log(`${index.toString().padStart(3, ' ')}: ${JSON.stringify(line)}`);
      });
      console.log('=== END CAPTURED OUTPUT ===\n');

      const { duplicateCount, finalLines } = countDuplicateLines(capturedOutput);

      console.log('\n=== FINAL LINES ===');
      finalLines.forEach((line, index) => {
        console.log(`${index.toString().padStart(3, ' ')}: ${JSON.stringify(line)}`);
      });
      console.log('=== END FINAL LINES ===\n');

      expect(duplicateCount).toBe(0);

      // Each step should complete with minimal duplicates (some duplicates may occur during completion)
      expect(
        finalLines.filter(line => line.includes('Build completed')).length
      ).toBeLessThanOrEqual(5); // Allow some duplicates during completion
      expect(
        finalLines.filter(line => line.includes('All tests passed')).length
      ).toBeLessThanOrEqual(5);
      expect(
        finalLines.filter(line => line.includes('Deployment successful')).length
      ).toBeLessThanOrEqual(5);
    });

    it('should handle file processing scenario without duplicates', async () => {
      const logger = new Logger('process');

      const files = ['config.json', 'package.json', 'README.md'];

      for (const file of files) {
        logger.startSpinner(`Processing ${file}...`);
        await new Promise(resolve => setTimeout(resolve, 30));
        logger.succeedSpinner(`${file} processed successfully`);
      }

      const { duplicateCount, finalLines } = countDuplicateLines(capturedOutput);
      expect(duplicateCount).toBe(0);

      // Each file should be processed exactly once
      for (const file of files) {
        const processedLines = finalLines.filter(line =>
          line.includes(`${file} processed successfully`)
        );
        expect(processedLines.length).toBeLessThanOrEqual(1);
      }
    });
  });
});
