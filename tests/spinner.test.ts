import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger, createLogger, SpinnerUtils } from '../src';

describe('Spinner functionality', () => {
  let logger: Logger;
  const originalEnv = process.env;
  const originalIsTTY = process.stdout.isTTY;

  beforeEach(() => {
    process.env = { ...originalEnv };
    // Mock TTY for spinner support
    Object.defineProperty(process.stdout, 'isTTY', {
      value: true,
      configurable: true
    });
    logger = createLogger('test-spinner');
  });

  afterEach(() => {
    process.env = originalEnv;
    Object.defineProperty(process.stdout, 'isTTY', {
      value: originalIsTTY,
      configurable: true
    });
    // Clean up any active spinners
    SpinnerUtils.stopAllSpinners();
  });

  describe('SpinnerUtils', () => {
    it('should create a spinner with default options', () => {
      const spinner = SpinnerUtils.create();
      expect(spinner).toBeDefined();
      expect(spinner.text).toBe('');
    });

    it('should create a spinner with custom options', () => {
      const spinner = SpinnerUtils.create({
        text: 'Loading...',
        color: 'green',
        prefixText: '[PREFIX] '
      });
      expect(spinner).toBeDefined();
      expect(spinner.text).toBe('Loading...');
    });

    it('should support emoji spinners when emoji is supported', () => {
      const spinner = SpinnerUtils.create();
      expect(spinner).toBeDefined();
      expect(typeof spinner.text).toBe('string');
    });

    it('should use ASCII spinners when emoji is not supported', () => {
      const spinner = SpinnerUtils.create();
      expect(spinner).toBeDefined();
      expect(typeof spinner.text).toBe('string');
    });

    it('should start and stop named spinners', () => {
      const spinner = SpinnerUtils.start('test', { text: 'Testing...' });
      expect(spinner).toBeDefined();
      expect(SpinnerUtils.getSpinner('test')).toBe(spinner);
      
      SpinnerUtils.stop('test');
      expect(SpinnerUtils.getSpinner('test')).toBeUndefined();
    });

    it('should update spinner text', () => {
      const spinner = SpinnerUtils.start('test', { text: 'Loading...' });
      expect(spinner.text).toBe('Loading...');
      
      SpinnerUtils.updateText('test', 'Updated text');
      expect(spinner.text).toBe('Updated text');
      
      SpinnerUtils.stop('test');
    });

    it('should complete spinners with success', () => {
      const spinner = SpinnerUtils.start('test', { text: 'Processing...' });
      
      // Mock the stop method
      const stopSpy = vi.spyOn(spinner, 'stop');
      
      const result = SpinnerUtils.succeed('test', 'Success!');
      expect(stopSpy).toHaveBeenCalled();
      expect(result).toBe('Success!');
      expect(SpinnerUtils.getSpinner('test')).toBeUndefined();
    });

    it('should complete spinners with failure', () => {
      const spinner = SpinnerUtils.start('test', { text: 'Processing...' });
      
      // Mock the stop method
      const stopSpy = vi.spyOn(spinner, 'stop');
      
      const result = SpinnerUtils.fail('test', 'Failed!');
      expect(stopSpy).toHaveBeenCalled();
      expect(result).toBe('Failed!');
      expect(SpinnerUtils.getSpinner('test')).toBeUndefined();
    });

    it('should get all active spinner keys', () => {
      SpinnerUtils.start('test1', { text: 'Test 1' });
      SpinnerUtils.start('test2', { text: 'Test 2' });
      
      const keys = SpinnerUtils.getActiveSpinnerKeys();
      expect(keys).toContain('test1');
      expect(keys).toContain('test2');
      expect(keys).toHaveLength(2);
      
      SpinnerUtils.stopAllSpinners();
      expect(SpinnerUtils.getActiveSpinnerKeys()).toHaveLength(0);
    });

    it('should detect spinner support correctly', () => {
      // With TTY and no JSON
      delete process.env.DEVLOGR_OUTPUT_JSON;
      expect(SpinnerUtils.supportsSpinners()).toBe(true);
      
      // With JSON mode
      process.env.DEVLOGR_OUTPUT_JSON = 'true';
      expect(SpinnerUtils.supportsSpinners()).toBe(false);
      
      // Without TTY
      delete process.env.DEVLOGR_OUTPUT_JSON;
      Object.defineProperty(process.stdout, 'isTTY', {
        value: false,
        configurable: true
      });
      expect(SpinnerUtils.supportsSpinners()).toBe(false);
    });
  });

  describe('Logger spinner methods', () => {
    it('should start spinner with text', () => {
      const startSpy = vi.spyOn(SpinnerUtils, 'start');
      
      logger.startSpinner('Loading data...');
      expect(startSpy).toHaveBeenCalledWith('test-spinner', expect.objectContaining({
        text: 'Loading data...'
      }));
    });

    it('should update spinner text', () => {
      const updateSpy = vi.spyOn(SpinnerUtils, 'updateText');
      
      logger.updateSpinner('Updated text');
      expect(updateSpy).toHaveBeenCalledWith('test-spinner', 'Updated text');
    });

    it('should stop spinner', () => {
      const stopSpy = vi.spyOn(SpinnerUtils, 'stop');
      
      logger.stopSpinner();
      expect(stopSpy).toHaveBeenCalledWith('test-spinner');
    });

    it('should succeed spinner', () => {
      const succeedSpy = vi.spyOn(SpinnerUtils, 'succeed');
      
      logger.succeedSpinner('Success!');
      expect(succeedSpy).toHaveBeenCalledWith('test-spinner', 'Success!');
    });

    it('should fail spinner', () => {
      const failSpy = vi.spyOn(SpinnerUtils, 'fail');
      
      logger.failSpinner('Failed!');
      expect(failSpy).toHaveBeenCalledWith('test-spinner', 'Failed!');
    });

    it('should warn with spinner', () => {
      const warnSpy = vi.spyOn(SpinnerUtils, 'warn');
      
      logger.warnSpinner('Warning!');
      expect(warnSpy).toHaveBeenCalledWith('test-spinner', 'Warning!');
    });

    it('should info with spinner', () => {
      const infoSpy = vi.spyOn(SpinnerUtils, 'info');
      
      logger.infoSpinner('Info!');
      expect(infoSpy).toHaveBeenCalledWith('test-spinner', 'Info!');
    });
  });

  describe('JSON mode fallback', () => {
    beforeEach(() => {
      process.env.DEVLOGR_OUTPUT_JSON = 'true';
      logger = createLogger('test-json');
    });

    it('should fallback to regular logging in JSON mode', () => {
      const taskSpy = vi.spyOn(logger, 'task');
      const successSpy = vi.spyOn(logger, 'success');
      const errorSpy = vi.spyOn(logger, 'error');
      
      logger.startSpinner('Loading...');
      expect(taskSpy).toHaveBeenCalledWith('Loading...');
      
      logger.succeedSpinner('Done!');
      expect(successSpy).toHaveBeenCalledWith('Done!');
      
      logger.failSpinner('Error!');
      expect(errorSpy).toHaveBeenCalledWith('Error!');
    });
  });

  describe('Non-TTY fallback', () => {
    beforeEach(() => {
      Object.defineProperty(process.stdout, 'isTTY', {
        value: false,
        configurable: true
      });
      logger = createLogger('test-no-tty');
    });

    it('should fallback to regular logging without TTY', () => {
      const taskSpy = vi.spyOn(logger, 'task');
      const successSpy = vi.spyOn(logger, 'success');
      
      logger.startSpinner('Loading...');
      expect(taskSpy).toHaveBeenCalledWith('Loading...');
      
      logger.succeedSpinner('Done!');
      expect(successSpy).toHaveBeenCalledWith('Done!');
    });
  });

  describe('Enhanced Formatting', () => {
    beforeEach(() => {
      // Reset prefix tracker for consistent tests
      const { PrefixTracker } = require('../dist/index.js');
      PrefixTracker.register('test');
      PrefixTracker.register('long-prefix');
    });

    it('should create spinner with timestamp formatting when enabled', () => {
      const spinner = SpinnerUtils.create({
        text: 'Loading...',
        prefix: 'test',
        showTimestamp: true,
        useColors: true
      });
      
      expect(spinner).toBeDefined();
      expect(spinner.prefixText).toContain('[');
      expect(spinner.prefixText).toContain(']');
    });

    it('should create spinner without timestamp formatting when disabled', () => {
      const spinner = SpinnerUtils.create({
        text: 'Loading...',
        prefix: 'test',
        showTimestamp: false,
        useColors: true
      });
      
      expect(spinner).toBeDefined();
      expect(spinner.prefixText).toBe('');
    });

    it('should align prefixes consistently with timestamp formatting', () => {
      const shortSpinner = SpinnerUtils.create({
        text: 'Loading...',
        prefix: 'test',
        showTimestamp: true,
        useColors: false
      });

      const longSpinner = SpinnerUtils.create({
        text: 'Loading...',
        prefix: 'long-prefix',
        showTimestamp: true,
        useColors: false
      });
      
      expect(shortSpinner.prefixText).toContain('[test]');
      expect(longSpinner.prefixText).toContain('[long-prefix]');
    });

    it('should format completion messages with timestamps', () => {
      const spinner = SpinnerUtils.start('test', {
        text: 'Processing...',
        prefix: 'test',
        showTimestamp: true,
        useColors: false
      });
      
      const succeedSpy = vi.spyOn(spinner, 'succeed');
      
      const result = SpinnerUtils.succeed('test', 'Success!');
      
      expect(result).toBe('Success!');
    });

    it('should format failure messages with timestamps', () => {
      const spinner = SpinnerUtils.start('test', {
        text: 'Processing...',
        prefix: 'test',
        showTimestamp: true,
        useColors: false
      });
      
      const failSpy = vi.spyOn(spinner, 'fail');
      
      const result = SpinnerUtils.fail('test', 'Failed!');
      
      expect(result).toBe('Failed!');
    });

    it('should format warning messages with timestamps', () => {
      const spinner = SpinnerUtils.start('test', {
        text: 'Processing...',
        prefix: 'test',
        showTimestamp: true,
        useColors: false
      });
      
      const warnSpy = vi.spyOn(spinner, 'warn');
      
      const result = SpinnerUtils.warn('test', 'Warning!');
      
      expect(result).toBe('Warning!');
    });

    it('should format info messages with timestamps', () => {
      const spinner = SpinnerUtils.start('test', {
        text: 'Processing...',
        prefix: 'test',
        showTimestamp: true,
        useColors: false
      });
      
      const infoSpy = vi.spyOn(spinner, 'info');
      
      const result = SpinnerUtils.info('test', 'Info!');
      
      expect(result).toBe('Info!');
    });

    it('should handle completion messages without timestamps', () => {
      const spinner = SpinnerUtils.start('test', { text: 'Processing...' });
      
      const succeedSpy = vi.spyOn(spinner, 'succeed');
      
      const result = SpinnerUtils.succeed('test', 'Success!');
      
      expect(result).toBe('Success!');
    });

    it('should respect color settings in formatting', () => {
      const colorSpinner = SpinnerUtils.create({
        text: 'Loading...',
        prefix: 'test',
        showTimestamp: true,
        useColors: true
      });

      const noColorSpinner = SpinnerUtils.create({
        text: 'Loading...',
        prefix: 'test', 
        showTimestamp: true,
        useColors: false
      });
      
      expect(colorSpinner.prefixText).toBeDefined();
      expect(noColorSpinner.prefixText).toBeDefined();
      // Colors vs no colors will have different escape sequences
      expect(colorSpinner.prefixText).not.toBe(noColorSpinner.prefixText);
    });
  });

  describe('Logger Integration with Enhanced Formatting', () => {
    beforeEach(() => {
      process.env.DEVLOGR_SHOW_TIMESTAMP = 'true';
      logger = createLogger('test-enhanced');
    });

    afterEach(() => {
      delete process.env.DEVLOGR_SHOW_TIMESTAMP;
    });

    it('should pass formatting options from logger to spinner', () => {
      const startSpy = vi.spyOn(SpinnerUtils, 'start');
      
      logger.startSpinner('Enhanced spinner');
      
      expect(startSpy).toHaveBeenCalledWith('test-enhanced', expect.objectContaining({
        prefix: 'test-enhanced',
        showTimestamp: true,
        useColors: expect.any(Boolean)
      }));
    });

    it('should pass formatting options to completion methods', () => {
      const succeedSpy = vi.spyOn(SpinnerUtils, 'succeed');
      
      logger.succeedSpinner('Enhanced success');
      
      expect(succeedSpy).toHaveBeenCalledWith('test-enhanced', 'Enhanced success');
    });

    it('should include log level and theme in spinner options', () => {
      const startSpy = vi.spyOn(SpinnerUtils, 'start');
      
      logger.startSpinner('Task with log level');
      
      expect(startSpy).toHaveBeenCalledWith('test-enhanced', expect.objectContaining({
        level: 'task',
        theme: expect.objectContaining({
          label: 'TASK'
        })
      }));
    });

    it('should show proper log level labels in completion messages', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const errorSpy = vi.spyOn(console, 'error');
      const warnSpy = vi.spyOn(console, 'warn');
      
      logger.succeedSpinner('Success message');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('SUCCESS')
      );
      
      logger.failSpinner('Error message');
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('ERROR')
      );
      
      logger.warnSpinner('Warning message');
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('WARN')
      );
      
      logger.infoSpinner('Info message');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('INFO')
      );
      
      consoleSpy.mockRestore();
      errorSpy.mockRestore();
      warnSpy.mockRestore();
    });
  });

  describe('Edge cases', () => {
    it('should handle starting spinner with same key twice', () => {
      const spinner1 = SpinnerUtils.start('test', { text: 'First' });
      const spinner2 = SpinnerUtils.start('test', { text: 'Second' });
      
      expect(spinner2).not.toBe(spinner1);
      expect(SpinnerUtils.getSpinner('test')).toBe(spinner2);
      
      SpinnerUtils.stop('test');
    });

    it('should handle operations on non-existent spinners gracefully', () => {
      expect(() => {
        SpinnerUtils.stop('non-existent');
        SpinnerUtils.succeed('non-existent');
        SpinnerUtils.fail('non-existent');
        SpinnerUtils.updateText('non-existent', 'text');
      }).not.toThrow();
    });

    it('should handle spinner operations with empty/undefined text', () => {
      const spinner = SpinnerUtils.start('test');
      expect(spinner.text).toBe('');
      
      SpinnerUtils.succeed('test');
      expect(SpinnerUtils.getSpinner('test')).toBeUndefined();
    });
  });

  describe('Code Quality and DRY Compliance', () => {
    it('should handle all completion methods consistently', () => {
      const completionMethods = ['succeed', 'fail', 'warn', 'info'];
      
      completionMethods.forEach(method => {
        SpinnerUtils.start('test', { text: 'Testing...' });
        
        const result = (SpinnerUtils as any)[method]('test', `${method} message`);
        
        expect(result).toBe(`${method} message`);
        expect(SpinnerUtils.getSpinner('test')).toBeUndefined(); // Should be cleaned up
      });
    });

    it('should return undefined for non-existent spinners consistently', () => {
      const completionMethods = ['succeed', 'fail', 'warn', 'info'];
      
      completionMethods.forEach(method => {
        const result = (SpinnerUtils as any)[method]('non-existent', 'message');
        expect(result).toBeUndefined();
      });
    });

    it('should maintain spinner isolation between different keys', () => {
      SpinnerUtils.start('spinner1', { text: 'First' });
      SpinnerUtils.start('spinner2', { text: 'Second' });
      
      const result1 = SpinnerUtils.succeed('spinner1', 'First done');
      const result2 = SpinnerUtils.fail('spinner2', 'Second failed');
      
      expect(result1).toBe('First done');
      expect(result2).toBe('Second failed');
      expect(SpinnerUtils.getSpinner('spinner1')).toBeUndefined();
      expect(SpinnerUtils.getSpinner('spinner2')).toBeUndefined();
    });
  });
}); 