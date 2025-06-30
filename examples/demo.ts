import { Logger } from '../src/logger';
import { ListrTask } from 'listr2';

const logger = new Logger('Deploy');

async function quickDemo() {
  console.clear();
  logger.separator('Demo');
  logger.spacer();
  await sleep(2000);

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
  await logger.succeedSpinner('Pre-deployment checks passed');

  await sleep(400);

  logger.spacer();
  logger.separator('Build');
  logger.spacer();

  // Build process
  logger.startSpinner('Building application...');
  await sleep(1000);
  logger.updateSpinnerText('Installing dependencies...');
  await sleep(1200);
  logger.updateSpinnerText('Compiling TypeScript...');
  await sleep(900);
  logger.updateSpinnerText('Processing assets...');
  await sleep(700);
  await logger.succeedSpinner('Build completed (3.2s)');

  await sleep(300);

  logger.spacer();
  logger.separator('Deployment');
  logger.spacer();

  // Multi-spinner demonstration - concurrent operations using proper API
  logger.info('Starting concurrent deployment tasks...');

  const concurrentDeploymentTasks: ListrTask[] = [
    {
      title: 'Running database migrations',
      task: async (ctx, task) => {
        await sleep(1000);
        task.output = 'Migrating user schema...';
        await sleep(800);
        task.output = 'Updating indexes...';
        await sleep(1200);
        task.output = 'Database migrations applied';
      },
    },
    {
      title: 'Deploying API services',
      task: async (ctx, task) => {
        await sleep(800);
        task.output = 'Rolling out to instances...';
        await sleep(1200);
        task.output = 'Running health checks...';
        await sleep(400);
        task.output = 'API deployment complete';
      },
    },
    {
      title: 'Updating CDN cache',
      task: async (ctx, task) => {
        await sleep(200);
        task.output = 'Invalidating old cache...';
        await sleep(600);
        task.output = 'CDN updated successfully';
      },
    },
  ];

  await logger.runConcurrentTasks('Concurrent Deployment Tasks', concurrentDeploymentTasks);

  await sleep(500);

  logger.spacer();
  logger.separator('Final Status');
  logger.spacer();

  // Final deployment status
  logger.success('Application is now live');
  logger.info('URL: https://myapp.com');
  logger.info('Health: All systems operational');
  logger.info('Instances: 3/3 healthy');

  await sleep(500);

  logger.spacer();
  logger.separator('Cleanup');
  logger.spacer();

  // Cleanup with a minor warning
  logger.startSpinner('Running cleanup tasks...');
  await sleep(1000);
  await logger.warnSpinner('Cleanup completed with minor warnings');

  await sleep(300);

  logger.spacer();
  logger.title('✅ Deployment Complete!');
  logger.success('MyApp v2.1.0 deployed successfully in 12.3s');
  logger.info('Ready to serve your users!');
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function duplicateTest() {
  console.log('\n\n' + '='.repeat(60));
  console.log('SPINNER TEST - Testing the new dual system:');
  console.log('='.repeat(60));

  const testLogger = new Logger('test');

  // Test scenario that might produce duplicates
  console.log('\n--- Test 1: Simple spinner success ---');
  testLogger.startSpinner('Processing...');
  await sleep(500);
  await testLogger.succeedSpinner('Operation completed successfully');

  await sleep(200);

  console.log('\n--- Test 2: Rapid fire spinners (should work fine) ---');
  for (let i = 1; i <= 3; i++) {
    testLogger.startSpinner(`Step ${i}...`);
    await sleep(100);
    testLogger.succeedSpinner(`Step ${i} completed`);
    await sleep(50); // Small delay to ensure completion
  }

  console.log('\n--- Test 2b: Error case - starting spinner while active ---');
  const errorTestLogger = new Logger('error-test');
  try {
    errorTestLogger.startSpinner('First spinner...');
    errorTestLogger.startSpinner('Second spinner...');
    console.log('❌ ERROR: Second spinner should not have started!');
  } catch (error) {
    console.log('✅ Expected error caught:', (error as Error).message);
  }
  if (errorTestLogger.isSpinnerActive()) {
    await errorTestLogger.failSpinner('First spinner failed due to error test');
  }
  await sleep(300);

  console.log('\n--- Test 3: Mixed completion types ---');
  testLogger.startSpinner('Building...');
  await sleep(200);
  await testLogger.succeedSpinner('Build completed');

  testLogger.startSpinner('Testing...');
  await sleep(200);
  await testLogger.failSpinner('Tests failed');

  testLogger.startSpinner('Deploying...');
  await sleep(200);
  await testLogger.warnSpinner('Deployment warning');

  console.log('\n' + '='.repeat(60));
  console.log('END SPINNER TEST - Single spinners use ora, multi-spinners use Listr2');
  console.log('='.repeat(60) + '\n');
}

async function main() {
  await quickDemo();
  await duplicateTest();
}

// Run the demo
main().catch(console.error);
