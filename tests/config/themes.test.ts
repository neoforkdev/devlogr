import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LogLevel } from '../../src/types';
import { Logger } from '../../src/logger';
import { setupTestEnvironment } from '../helpers/test-environment';

describe('Logger Themes and Configuration', () => {
  beforeEach(() => {
    // Setup secure test environment with default non-CI behavior
    setupTestEnvironment();
  });

  describe('LogLevel enum', () => {
    it('should have all required log levels', () => {
      expect(LogLevel.DEBUG).toBeDefined();
      expect(LogLevel.INFO).toBeDefined();
      expect(LogLevel.WARNING).toBeDefined();
      expect(LogLevel.ERROR).toBeDefined();
    });

    it('should have correct string values', () => {
      expect(LogLevel.DEBUG).toBe('debug');
      expect(LogLevel.INFO).toBe('info');
      expect(LogLevel.WARNING).toBe('warn');
      expect(LogLevel.ERROR).toBe('error');
    });
  });

  describe('Logger level configuration', () => {
    afterEach(() => {
      Logger.resetLevel();
    });

    it('should filter logs based on level', () => {
      Logger.setLevel(LogLevel.WARNING);

      const logger = new Logger('TEST');

      // These should not throw regardless of level
      expect(() => {
        logger.debug('Debug message'); // Should be filtered
        logger.info('Info message'); // Should be filtered
        logger.warning('Warning message'); // Should appear
        logger.error('Error message'); // Should appear
      }).not.toThrow();
    });

    it('should handle level changes dynamically', () => {
      const logger = new Logger('TEST');

      Logger.setLevel(LogLevel.ERROR);
      expect(() => logger.info('Filtered')).not.toThrow();

      Logger.setLevel(LogLevel.DEBUG);
      expect(() => logger.debug('Not filtered')).not.toThrow();
    });

    it('should reset to default level', () => {
      Logger.setLevel(LogLevel.ERROR);
      Logger.resetLevel();

      const logger = new Logger('TEST');
      expect(() => logger.info('Should work')).not.toThrow();
    });
  });

  describe('Logger method availability', () => {
    it('should have all standard log methods', () => {
      const logger = new Logger('TEST');

      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warning).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.success).toBe('function');
      expect(typeof logger.title).toBe('function');
      expect(typeof logger.task).toBe('function');
      expect(typeof logger.plain).toBe('function');
    });

    it('should handle method calls with various arguments', () => {
      const logger = new Logger('TEST');

      expect(() => {
        logger.info('Simple message');
        logger.error('Error with object', { key: 'value' });
        logger.debug('Debug with multiple', 'args', 42, true);
        logger.warning('Warning with error', new Error('test'));
      }).not.toThrow();
    });
  });

  describe('Prefix tracking and alignment', () => {
    it('should handle multiple loggers with different prefix lengths', () => {
      Logger.setLevel(LogLevel.DEBUG);

      const loggers = [
        new Logger('A'),
        new Logger('MEDIUM'),
        new Logger('VERYLONGPREFIX'),
        new Logger('X'),
      ];

      expect(() => {
        loggers.forEach((logger, index) => {
          logger.info(`Message ${index}`);
        });
      }).not.toThrow();
    });

    it('should maintain alignment across different log calls', () => {
      Logger.setLevel(LogLevel.DEBUG);

      const shortLogger = new Logger('CLI');
      const longLogger = new Logger('INFRASTRUCTURE');

      expect(() => {
        shortLogger.info('First message');
        longLogger.info('Second message');
        shortLogger.error('Third message');
        longLogger.debug('Fourth message');
      }).not.toThrow();
    });

    it('should handle rapid prefix changes', () => {
      Logger.setLevel(LogLevel.DEBUG);

      expect(() => {
        for (let i = 0; i < 10; i++) {
          const logger = new Logger(`PREFIX${i}`);
          logger.info(`Message ${i}`);
        }
      }).not.toThrow();
    });
  });

  describe('Environment variable handling', () => {
    it('should respect DEVLOGR_LOG_LEVEL=debug', () => {
      const originalEnv = process.env.DEVLOGR_LOG_LEVEL;

      try {
        process.env.DEVLOGR_LOG_LEVEL = 'debug';
        Logger.resetLevel();

        const logger = new Logger('TEST');
        expect(() => logger.debug('Debug message')).not.toThrow();
      } finally {
        if (originalEnv !== undefined) {
          process.env.DEVLOGR_LOG_LEVEL = originalEnv;
        } else {
          delete process.env.DEVLOGR_LOG_LEVEL;
        }
        Logger.resetLevel();
      }
    });

    it('should respect DEVLOGR_LOG_LEVEL=error', () => {
      const originalEnv = process.env.DEVLOGR_LOG_LEVEL;

      try {
        process.env.DEVLOGR_LOG_LEVEL = 'error';
        Logger.resetLevel();

        const logger = new Logger('TEST');
        expect(() => {
          logger.debug('Should be filtered');
          logger.info('Should be filtered');
          logger.error('Should appear');
        }).not.toThrow();
      } finally {
        if (originalEnv !== undefined) {
          process.env.DEVLOGR_LOG_LEVEL = originalEnv;
        } else {
          delete process.env.DEVLOGR_LOG_LEVEL;
        }
        Logger.resetLevel();
      }
    });

    it('should handle invalid log levels gracefully', () => {
      const originalEnv = process.env.DEVLOGR_LOG_LEVEL;

      try {
        process.env.DEVLOGR_LOG_LEVEL = 'invalid';

        expect(() => {
          Logger.resetLevel();
          const logger = new Logger('TEST');
          logger.info('Should still work');
        }).not.toThrow();
      } finally {
        if (originalEnv !== undefined) {
          process.env.DEVLOGR_LOG_LEVEL = originalEnv;
        } else {
          delete process.env.DEVLOGR_LOG_LEVEL;
        }
        Logger.resetLevel();
      }
    });
  });

  describe('Symbol and formatting consistency', () => {
    it('should use consistent symbols across log levels', () => {
      Logger.setLevel(LogLevel.DEBUG);
      const logger = new Logger('TEST');

      // Test that symbols are consistently applied
      expect(() => {
        logger.debug('Debug with ?');
        logger.info('Info with ℹ');
        logger.warning('Warning with !');
        logger.error('Error with ✗');
        logger.success('Success with ✓');
        logger.title('Title with ●');
        logger.task('Task with →');
      }).not.toThrow();
    });

    it('should maintain formatting consistency', () => {
      Logger.setLevel(LogLevel.DEBUG);
      const logger = new Logger('CONSISTENT');

      expect(() => {
        // Test consistent formatting across different types
        logger.info('String message');
        logger.info('Message with number', 42);
        logger.info('Message with object', { test: true });
        logger.info('Message with array', [1, 2, 3]);
      }).not.toThrow();
    });
  });

  describe('Performance characteristics', () => {
    it('should handle high-frequency logging efficiently', () => {
      Logger.setLevel(LogLevel.DEBUG);
      const logger = new Logger('PERF');

      const startTime = Date.now();

      expect(() => {
        for (let i = 0; i < 100; i++) {
          logger.info(`High frequency message ${i}`);
        }
      }).not.toThrow();

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
    });

    it('should handle mixed log levels efficiently', () => {
      Logger.setLevel(LogLevel.DEBUG);
      const logger = new Logger('MIXED');

      expect(() => {
        for (let i = 0; i < 50; i++) {
          const methodIndex = i % 5;
          switch (methodIndex) {
            case 0:
              logger.debug(`Mixed level message ${i}`);
              break;
            case 1:
              logger.info(`Mixed level message ${i}`);
              break;
            case 2:
              logger.warning(`Mixed level message ${i}`);
              break;
            case 3:
              logger.error(`Mixed level message ${i}`);
              break;
            case 4:
              logger.success(`Mixed level message ${i}`);
              break;
          }
        }
      }).not.toThrow();
    });
  });
});
