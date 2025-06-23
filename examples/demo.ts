import { Logger } from '../src/logger';

const logger = new Logger('Deploy');

async function quickDemo() {
  // Realistic deployment scenario
  logger.title('🚀 Deploying MyApp v2.1.0');
  logger.info('Starting deployment to production...');

  await sleep(800);

  // Pre-deployment checks
  logger.startSpinner('Running pre-deployment checks...');
  await sleep(1200);
  logger.updateSpinnerText('Validating configuration...');
  await sleep(1000);
  logger.updateSpinnerText('Checking permissions...');
  await sleep(800);
  logger.succeedSpinner('Pre-deployment checks passed');

  await sleep(400);

  // Build process
  logger.startSpinner('Building application...');
  await sleep(1000);
  logger.updateSpinnerText('Installing dependencies...');
  await sleep(1200);
  logger.updateSpinnerText('Compiling TypeScript...');
  await sleep(900);
  logger.updateSpinnerText('Processing assets...');
  await sleep(700);
  logger.succeedSpinner('Build completed (3.2s)');

  await sleep(300);

  // Multi-spinner demonstration - concurrent operations
  logger.info('Starting concurrent deployment tasks...');

  const dbLogger = new Logger('Database');
  const apiLogger = new Logger('API');
  const cdnLogger = new Logger('CDN');

  // Start multiple spinners concurrently
  dbLogger.startSpinner('Running database migrations...');
  await sleep(200);
  apiLogger.startSpinner('Deploying API services...');
  await sleep(200);
  cdnLogger.startSpinner('Updating CDN cache...');

  // Update them independently
  await sleep(1000);
  dbLogger.updateSpinnerText('Migrating user schema...');

  await sleep(800);
  apiLogger.updateSpinnerText('Rolling out to instances...');
  cdnLogger.updateSpinnerText('Invalidating old cache...');

  await sleep(1200);
  dbLogger.updateSpinnerText('Updating indexes...');
  apiLogger.updateSpinnerText('Running health checks...');

  // Complete them at different times
  await sleep(600);
  cdnLogger.succeedSpinner('CDN updated successfully');

  await sleep(800);
  dbLogger.succeedSpinner('Database migrations applied');

  await sleep(400);
  apiLogger.succeedSpinner('API deployment complete');

  await sleep(500);

  // Final deployment status
  logger.success('Application is now live');
  logger.info('→ URL: https://myapp.com');
  logger.info('→ Health: All systems operational');
  logger.info('→ Instances: 3/3 healthy');

  await sleep(500);

  // Cleanup with a minor warning
  logger.startSpinner('Running cleanup tasks...');
  await sleep(1000);
  logger.warnSpinner('Cleanup completed with minor warnings');

  await sleep(300);

  logger.spacer();
  logger.title('✅ Deployment Complete!');
  logger.success('MyApp v2.1.0 deployed successfully in 12.3s');
  logger.info('Ready to serve your users!');
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the demo
quickDemo().catch(console.error);
