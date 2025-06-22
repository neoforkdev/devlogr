import { Logger } from '../src/logger';
import { LogLevel } from '../src/types';

// Force JSON mode for this demo
process.env.LOG_JSON = 'true';

const logger = new Logger('JsonDemo');

function jsonOutputDemo() {
  console.log('=== DevLogr JSON Output Demo ===\n');

  // Basic logging in JSON mode
  logger.info('This is a simple info message');
  logger.warn('This is a warning message');
  logger.error('This is an error message');
  logger.success('This is a success message');

  // Object logging - objects get merged into the JSON structure
  logger.info('User logged in', {
    userId: 12345,
    username: 'alice.smith',
    email: 'alice@example.com',
    loginTime: new Date(),
    ipAddress: '192.168.1.100'
  });

  // Multiple arguments get added as arg0, arg1, etc.
  logger.info('Processing order', 'ORDER-123', { total: 99.99, items: 3 }, true);

  // Error logging with error objects
  const error = new Error('Database connection failed');
  error.stack = 'Error: Database connection failed\n    at connect (db.js:42:15)';
  logger.error('Failed to connect to database', error, {
    host: 'localhost',
    port: 5432,
    database: 'myapp'
  });

  // Complex nested objects
  logger.info('System status', {
    server: {
      name: 'web-01',
      region: 'us-west-2',
      status: 'healthy',
      uptime: 86400,
      resources: {
        cpu: { usage: 45.2, cores: 4 },
        memory: { used: '2.1GB', total: '8GB', percentage: 26.25 },
        disk: { used: '120GB', total: '500GB', percentage: 24 }
      }
    },
    database: {
      status: 'connected',
      connections: { active: 12, max: 100 },
      queries: { slow: 2, total: 1847 }
    },
    cache: {
      status: 'operational',
      hitRate: 94.7,
      size: '156MB'
    }
  });

  // Level filtering still works in JSON mode
  logger.debug('This debug message should appear');
  
  Logger.setLevel(LogLevel.ERROR);
  logger.info('This info message should not appear');
  logger.error('This error message should appear');
  
  Logger.resetLevel();
  logger.info('Log level reset - this should appear again');

  // Demonstrate different log levels with structured data
  const requestData = {
    method: 'POST',
    url: '/api/users',
    headers: { 'content-type': 'application/json' },
    body: { name: 'John Doe', role: 'admin' }
  };

  logger.trace('HTTP request trace', requestData, { traceId: 'abc-123' });
  logger.debug('Processing request', requestData);
  logger.info('Request completed successfully', { ...requestData, responseTime: '142ms' });
  logger.warn('Request took longer than expected', { ...requestData, responseTime: '2.1s' });

  // Array data
  logger.info('Active users', {
    users: [
      { id: 1, name: 'Alice', status: 'online' },
      { id: 2, name: 'Bob', status: 'away' },
      { id: 3, name: 'Charlie', status: 'offline' }
    ],
    totalCount: 3,
    onlineCount: 1
  });

  logger.success('JSON output demo complete!');
}

jsonOutputDemo(); 