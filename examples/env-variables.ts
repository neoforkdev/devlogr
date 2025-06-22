import { Logger } from '../src/logger';
import { LogLevel } from '../src/types';

const logger = new Logger('EnvDemo');

function envVariablesDemo() {
  console.log('=== DevLogr Environment Variables Demo ===\n');

  logger.info('This demo shows how environment variables control DevLogr behavior');
  logger.separator('Current Configuration');

  // Show current environment variables
  const envVars = {
    LOG_LEVEL: process.env.LOG_LEVEL || 'not set',
    LOG_JSON: process.env.LOG_JSON || 'not set',
    LOG_COLORS: process.env.LOG_COLORS || 'not set',
    LOG_TIMESTAMP: process.env.LOG_TIMESTAMP || 'not set',
    LOG_UNICODE: process.env.LOG_UNICODE || 'not set',
    LOG_TIMESTAMP_FORMAT: process.env.LOG_TIMESTAMP_FORMAT || 'not set',
  };

  logger.info('Environment variables:', envVars);

  logger.separator('Testing All Log Levels');

  // Test all log levels to show which ones are visible
  logger.trace('TRACE: This is the most verbose level');
  logger.debug('DEBUG: Detailed information for debugging');
  logger.info('INFO: General information messages');
  logger.warn('WARN: Warning messages');
  logger.error('ERROR: Error messages');
  logger.success('SUCCESS: Success messages');

  logger.separator('Configuration Examples');

  logger.info('To control DevLogr behavior, set these environment variables:');
  logger.plain('');
  logger.plain('LOG_LEVEL=debug     # Set minimum log level (trace, debug, info, warn, error)');
  logger.plain('LOG_JSON=true       # Output structured JSON instead of formatted logs');
  logger.plain('LOG_COLORS=false    # Disable colored output');
  logger.plain('LOG_TIMESTAMP=true  # Show timestamps in log messages');
  logger.plain('LOG_UNICODE=false   # Disable Unicode symbols (for compatibility)');
  logger.plain('LOG_TIMESTAMP_FORMAT=iso  # Use ISO format for timestamps (time, iso)');
  logger.plain('');

  logger.separator('Testing Different Scenarios');

  if (process.env.LOG_JSON === 'true') {
    logger.info('JSON mode is enabled - output will be structured JSON');
    logger.info('Complex object logging:', {
      user: { id: 123, name: 'Alice' },
      action: 'login',
      timestamp: new Date(),
      metadata: { ip: '192.168.1.1', userAgent: 'DevLogr/1.0' },
    });
  } else {
    logger.info('Standard formatting mode is active');
    logger.info('Object logging example:', {
      environment: 'development',
      features: ['logging', 'spinners', 'tasks'],
      config: { debug: true, verbose: false },
    });
  }

  if (process.env.LOG_COLORS === 'false') {
    logger.warn('Colors are disabled - output will be monochrome');
  } else {
    logger.success('Colors are enabled - you should see colorful output! 🌈');
  }

  if (process.env.LOG_TIMESTAMP === 'true') {
    logger.info('Timestamps are enabled - each message shows when it was logged');
  } else {
    logger.info('Timestamps are disabled - no time information in logs');
  }

  logger.separator('Runtime Level Changes');

  logger.info('You can also change log levels at runtime:');

  const originalLevel = process.env.LOG_LEVEL;
  logger.info(`Original level: ${originalLevel || 'default (info)'}`);

  // Demonstrate runtime level changes
  Logger.setLevel(LogLevel.ERROR);
  logger.info('This INFO message should not appear (level set to ERROR)');
  logger.error('This ERROR message should appear');

  Logger.setLevel(LogLevel.DEBUG);
  logger.debug('This DEBUG message should appear (level set to DEBUG)');
  logger.info('This INFO message should also appear');

  Logger.resetLevel();
  logger.info('Log level reset to environment/default setting');

  logger.separator('Try These Commands');

  logger.plain('Run this example with different environment variables:');
  logger.plain('');
  logger.plain('# JSON output mode');
  logger.plain('LOG_JSON=true npm run example:env-variables');
  logger.plain('');
  logger.plain('# Debug level with timestamps');
  logger.plain('LOG_LEVEL=debug LOG_TIMESTAMP=true npm run example:env-variables');
  logger.plain('');
  logger.plain('# No colors, error level only');
  logger.plain('LOG_COLORS=false LOG_LEVEL=error npm run example:env-variables');
  logger.plain('');
  logger.plain('# ISO timestamps with Unicode disabled');
  logger.plain(
    'LOG_TIMESTAMP=true LOG_TIMESTAMP_FORMAT=iso LOG_UNICODE=false npm run example:env-variables'
  );

  logger.success('Environment variables demo complete!');
}

envVariablesDemo();
