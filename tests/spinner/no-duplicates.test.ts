import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Logger } from '../../src/logger';
import { SpinnerUtils } from '../../src/utils/spinner';
import { TerminalUtils } from '../../src/utils';

describe('No Duplicate Lines in Spinner Success', () => {
  let mockConsoleLog: ReturnType<typeof vi.fn>;
  let mockConsoleError: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    SpinnerUtils.stopAllSpinners();

    mockConsoleLog = vi.fn();
    mockConsoleError = vi.fn();

    vi.spyOn(console, 'log').mockImplementation(mockConsoleLog);
    vi.spyOn(console, 'error').mockImplementation(mockConsoleError);
  });

  afterEach(() => {
    SpinnerUtils.stopAllSpinners();
    vi.restoreAllMocks();
  });

  describe('TTY Environment', () => {
    beforeEach(() => {
      Object.defineProperty(process.stdout, 'isTTY', {
        value: true,
        configurable: true,
      });
      vi.spyOn(TerminalUtils, 'isCI').mockReturnValue(false);
      vi.spyOn(SpinnerUtils, 'supportsSpinners').mockReturnValue(true);
    });

    it('should not produce duplicate success messages', async () => {
      const logger = new Logger('test-tty');

      logger.startSpinner('Processing...');
      await new Promise(resolve => setTimeout(resolve, 50));
      logger.succeedSpinner('Operation completed successfully');
      await new Promise(resolve => setTimeout(resolve, 100));

      const allCalls = [...mockConsoleLog.mock.calls.flat(), ...mockConsoleError.mock.calls.flat()];

      const successMessages = allCalls.filter(call =>
        String(call).includes('Operation completed successfully')
      );

      expect(successMessages.length).toBeLessThanOrEqual(1);
    });

    it('should handle multiple operations without duplicates', async () => {
      const logger = new Logger('test-multi');

      // First operation
      logger.startSpinner('First operation...');
      await new Promise(resolve => setTimeout(resolve, 30));
      logger.succeedSpinner('First completed');

      // Second operation
      logger.startSpinner('Second operation...');
      await new Promise(resolve => setTimeout(resolve, 30));
      logger.succeedSpinner('Second completed');

      const allCalls = [...mockConsoleLog.mock.calls.flat(), ...mockConsoleError.mock.calls.flat()];

      const firstCompletions = allCalls.filter(call => String(call).includes('First completed'));
      const secondCompletions = allCalls.filter(call => String(call).includes('Second completed'));

      expect(firstCompletions.length).toBeLessThanOrEqual(1);
      expect(secondCompletions.length).toBeLessThanOrEqual(1);
    });
  });

  describe('CI Environment', () => {
    beforeEach(() => {
      Object.defineProperty(process.stdout, 'isTTY', {
        value: true,
        configurable: true,
      });
      vi.spyOn(TerminalUtils, 'isCI').mockReturnValue(true);
      vi.spyOn(SpinnerUtils, 'supportsSpinners').mockReturnValue(true);
    });

    it('should not produce duplicates in CI', async () => {
      const logger = new Logger('test-ci');

      logger.startSpinner('Processing...');
      await new Promise(resolve => setTimeout(resolve, 50));
      logger.succeedSpinner('Operation completed successfully');
      await new Promise(resolve => setTimeout(resolve, 100));

      const allCalls = [...mockConsoleLog.mock.calls.flat(), ...mockConsoleError.mock.calls.flat()];

      const successMessages = allCalls.filter(call =>
        String(call).includes('Operation completed successfully')
      );

      expect(successMessages.length).toBeLessThanOrEqual(1);
    });

    it('should handle rapid operations in CI', async () => {
      const logger = new Logger('test-rapid-ci');

      for (let i = 0; i < 3; i++) {
        logger.startSpinner(`Processing ${i + 1}...`);
        await new Promise(resolve => setTimeout(resolve, 10));
        logger.succeedSpinner(`Completed ${i + 1}`);
      }

      const allCalls = [...mockConsoleLog.mock.calls.flat(), ...mockConsoleError.mock.calls.flat()];

      for (let i = 0; i < 3; i++) {
        const completionMessages = allCalls.filter(call =>
          String(call).includes(`Completed ${i + 1}`)
        );
        expect(completionMessages.length).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Non-TTY Environment', () => {
    beforeEach(() => {
      Object.defineProperty(process.stdout, 'isTTY', {
        value: false,
        configurable: true,
      });
      vi.spyOn(TerminalUtils, 'isCI').mockReturnValue(false);
      vi.spyOn(SpinnerUtils, 'supportsSpinners').mockReturnValue(false);
    });

    it('should not produce duplicates in fallback mode', async () => {
      const logger = new Logger('test-fallback');

      logger.startSpinner('Processing...');
      logger.succeedSpinner('Operation completed successfully');

      await new Promise(resolve => setTimeout(resolve, 50));

      const allCalls = [...mockConsoleLog.mock.calls.flat(), ...mockConsoleError.mock.calls.flat()];

      const successMessages = allCalls.filter(call =>
        String(call).includes('Operation completed successfully')
      );

      expect(successMessages.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      vi.spyOn(TerminalUtils, 'isCI').mockReturnValue(true);
      vi.spyOn(SpinnerUtils, 'supportsSpinners').mockReturnValue(true);
    });

    it('should handle completion without start', () => {
      const logger = new Logger('test-no-start');

      logger.succeedSpinner('Completed without start');

      const allCalls = [...mockConsoleLog.mock.calls.flat(), ...mockConsoleError.mock.calls.flat()];

      const completionMessages = allCalls.filter(call =>
        String(call).includes('Completed without start')
      );

      expect(completionMessages.length).toBeLessThanOrEqual(1);
    });

    it('should handle mixed completion types', () => {
      const logger = new Logger('test-mixed');

      logger.startSpinner('Operation 1...');
      logger.succeedSpinner('Success!');

      logger.startSpinner('Operation 2...');
      logger.failSpinner('Failed!');

      logger.startSpinner('Operation 3...');
      logger.warnSpinner('Warning!');

      const allCalls = [...mockConsoleLog.mock.calls.flat(), ...mockConsoleError.mock.calls.flat()];

      expect(allCalls.filter(call => String(call).includes('Success!')).length).toBeLessThanOrEqual(
        1
      );
      expect(allCalls.filter(call => String(call).includes('Failed!')).length).toBeLessThanOrEqual(
        1
      );
      expect(allCalls.filter(call => String(call).includes('Warning!')).length).toBeLessThanOrEqual(
        1
      );
    });
  });
});
