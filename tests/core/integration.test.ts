import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Logger } from '../../src/logger';
import { LogLevel } from '../../src/types';

describe('Logger Integration', () => {
  beforeEach(() => {
    Logger.resetLevel();
  });

  describe('Console output verification', () => {
    it('should call appropriate console methods for different log levels', () => {
      const logger = new Logger('TEST');

      // Mock console methods
      const consoleSpy = {
        log: vi.spyOn(console, 'log').mockImplementation(() => {}),
        error: vi.spyOn(console, 'error').mockImplementation(() => {}),
        warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
        debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      };

      Logger.setLevel(LogLevel.TRACE);

      logger.info('Info message');
      logger.error('Error message');
      logger.warning('Warning message');
      logger.debug('Debug message');
      logger.trace('Trace message');

      expect(consoleSpy.log).toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalled();
      expect(consoleSpy.warn).toHaveBeenCalled();
      expect(consoleSpy.debug).toHaveBeenCalled();

      // Restore original console methods
      Object.values(consoleSpy).forEach(spy => spy.mockRestore());
    });

    it('should respect log level filtering with console output', () => {
      const logger = new Logger('TEST');

      const consoleSpy = {
        log: vi.spyOn(console, 'log').mockImplementation(() => {}),
        error: vi.spyOn(console, 'error').mockImplementation(() => {}),
        warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
        debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      };

      Logger.setLevel(LogLevel.ERROR);

      logger.trace('Should not appear');
      logger.debug('Should not appear');
      logger.info('Should not appear');
      logger.warning('Should not appear');
      logger.error('Should appear');

      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalled();

      // Restore original console methods
      Object.values(consoleSpy).forEach(spy => spy.mockRestore());
    });

    it('should test trace level filtering specifically', () => {
      const logger = new Logger('TEST');

      const consoleSpy = {
        log: vi.spyOn(console, 'log').mockImplementation(() => {}),
        error: vi.spyOn(console, 'error').mockImplementation(() => {}),
        warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
        debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      };

      // Test DEBUG level - should not show trace, only debug
      Logger.setLevel(LogLevel.DEBUG);
      logger.trace('Should not appear');
      logger.debug('Should appear');

      expect(consoleSpy.debug).toHaveBeenCalledTimes(1);

      // Reset spies
      consoleSpy.debug.mockClear();

      // Test TRACE level - should show both (both use console.debug)
      Logger.setLevel(LogLevel.TRACE);
      logger.trace('Should appear');
      logger.debug('Should appear');

      expect(consoleSpy.debug).toHaveBeenCalledTimes(2);

      // Restore original console methods
      Object.values(consoleSpy).forEach(spy => spy.mockRestore());
    });
  });

  describe('Basic functionality', () => {
    it('should create logger with all methods', () => {
      const logger = new Logger('TEST');

      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warning).toBe('function');
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.trace).toBe('function');
    });

    it('should respect log level filtering', () => {
      const logger = new Logger('TEST');

      expect(() => {
        Logger.setLevel(LogLevel.ERROR);
        logger.trace('Should be filtered');
        logger.debug('Should be filtered');
        logger.info('Should be filtered');
        logger.error('Should appear');
      }).not.toThrow();
    });
  });

  describe('Multiple loggers', () => {
    it('should handle multiple loggers with different prefixes', () => {
      const shortLogger = new Logger('A');
      const longLogger = new Logger('VERYLONGPREFIX');

      expect(() => {
        Logger.setLevel(LogLevel.DEBUG);
        shortLogger.info('Short message');
        longLogger.info('Long message');
      }).not.toThrow();
    });
  });

  describe('Argument handling', () => {
    it('should handle various argument types', () => {
      const logger = new Logger('TEST');
      Logger.setLevel(LogLevel.TRACE);

      expect(() => {
        logger.info('Message with object', { key: 'value' });
        logger.error('Error with cause', new Error('Test error'));
        logger.debug('Mixed args', 42, true, null);
        logger.trace('Trace message', 'with', 'args');
      }).not.toThrow();
    });
  });

  describe('Environment configuration', () => {
    it('should handle DEVLOGR_LOG_LEVEL environment variable', () => {
      const originalEnv = process.env.DEVLOGR_LOG_LEVEL;

      try {
        process.env.DEVLOGR_LOG_LEVEL = 'debug';
        Logger.resetLevel();

        const logger = new Logger('TEST');
        expect(() => {
          logger.debug('Debug message');
        }).not.toThrow();
      } finally {
        if (originalEnv !== undefined) {
          process.env.DEVLOGR_LOG_LEVEL = originalEnv;
        } else {
          delete process.env.DEVLOGR_LOG_LEVEL;
        }
      }
    });
  });

  describe('Performance', () => {
    it('should handle rapid logging', () => {
      const logger = new Logger('PERF');
      Logger.setLevel(LogLevel.DEBUG);

      const startTime = Date.now();

      expect(() => {
        for (let i = 0; i < 50; i++) {
          logger.info(`Message ${i}`);
        }
      }).not.toThrow();

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle edge cases gracefully', () => {
      const logger = new Logger('TEST');
      Logger.setLevel(LogLevel.DEBUG);

      expect(() => {
        logger.info(''); // empty message
        logger.info('Very long message: ' + 'A'.repeat(1000));
        logger.info('Special chars: émojis 🚀 unicode ℹ✓');

        // Circular reference
        const circular: any = { name: 'test' };
        circular.self = circular;
        logger.info('Circular object', circular);
      }).not.toThrow();
    });
  });
});
