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
  logger.succeedSpinner('Pre-deployment checks passed');

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
  logger.succeedSpinner('Build completed (3.2s)');

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
