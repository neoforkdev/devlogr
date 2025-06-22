import { Logger } from '../src/logger';
import { LogLevel } from '../src/types';

const logger = new Logger('Levels');

console.log('=== DevLogr Logging Levels Demo ===\n');

// Show all available logging methods
logger.trace('This is a TRACE message (lowest level)');
logger.debug('This is a DEBUG message');
logger.info('This is an INFO message');
logger.warn('This is a WARN message');
logger.error('This is an ERROR message');
logger.success('This is a SUCCESS message');

logger.separator('Special Formatting');

logger.title('This is a TITLE message');
logger.task('This is a TASK message');
logger.plain('This is a PLAIN message (no formatting)');

logger.separator('Object Logging');

logger.info('Logging a simple object:', { name: 'DevLogr', version: '1.0.0' });
logger.info('Logging a complex object:', {
  user: { id: 123, name: 'John Doe' },
  settings: { theme: 'dark', notifications: true },
  metadata: { lastLogin: new Date(), roles: ['admin', 'user'] }
});

logger.separator('Message Formatting');

logger.info('Using placeholders: %s is %d years old', 'Alice', 25);
logger.info('JSON placeholder: %j', { status: 'active', count: 42 });

logger.separator('Level Control');

console.log('\n--- Setting global level to ERROR ---');
Logger.setLevel(LogLevel.ERROR);

logger.trace('This TRACE will not show');
logger.debug('This DEBUG will not show');
logger.info('This INFO will not show');
logger.warn('This WARN will not show');
logger.error('This ERROR will show');
logger.success('This SUCCESS will show');

console.log('\n--- Resetting to default level ---');
Logger.resetLevel();

logger.info('Back to default logging level');
logger.success('Demo complete!'); 