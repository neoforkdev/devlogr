#!/usr/bin/env tsx

import { Logger } from '../src/logger';
import { Listr } from 'listr2';
import { DevLogrRenderer } from '../src/devlogr-renderer';

console.log('🎨 DevLogr Colored Spinners Demo\n');

async function demonstrateColoredSpinners() {
  const logger = new Logger('Demo');

  console.log('📋 Running tasks with colored spinners...\n');

  // Create a listr with various task states to show colors
  const tasks = new Listr(
    [
      {
        title: 'Loading data from API',
        task: async () => {
          await new Promise(resolve => setTimeout(resolve, 2000));
        },
      },
      {
        title: 'Processing user information',
        task: async () => {
          await new Promise(resolve => setTimeout(resolve, 1500));
        },
      },
      {
        title: 'Validating credentials',
        task: async () => {
          await new Promise(resolve => setTimeout(resolve, 1000));
        },
      },
      {
        title: 'Optional backup task',
        task: (ctx: any, task: any) => task.skip('Backup not needed'),
      },
      {
        title: 'Sending notifications',
        task: async (ctx: any, task: any) => {
          if (task.output) {
            task.output('Sending email notifications...');
          }
          await new Promise(resolve => setTimeout(resolve, 800));
          if (task.output) {
            task.output('Sending SMS notifications...');
          }
          await new Promise(resolve => setTimeout(resolve, 500));
        },
      },
      {
        title: 'Failing task example',
        task: () => {
          throw new Error('Simulated failure for demo');
        },
      },
      {
        title: 'Final cleanup',
        task: async () => {
          await new Promise(resolve => setTimeout(resolve, 500));
        },
      },
    ],
    {
      renderer: DevLogrRenderer,
      rendererOptions: {
        useColors: true,
        showTimestamp: false,
        supportsUnicode: true,
        prefix: 'ColorDemo',
      },
      exitOnError: false, // Continue even if some tasks fail
    }
  );

  try {
    await tasks.run();
  } catch (error) {
    // Some tasks may fail, which is expected for the demo
  }

  console.log('\n✨ Demo completed! You should have seen:');
  console.log('  🔵 Blue spinning animation for loading tasks');
  console.log('  🟢 Green checkmarks for successful tasks');
  console.log('  🔴 Red X marks for failed tasks');
  console.log('  🟡 Yellow circles for skipped tasks');
  console.log('  🔷 Cyan arrows for task output');
}

async function demonstrateLoggerSpinners() {
  console.log('\n📝 Logger spinner methods with colors:\n');

  const logger = new Logger('WebApp');

  // Start a spinner
  logger.startSpinner('Initializing application...');
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Update spinner text
  logger.updateSpinnerText('Loading configuration...');
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Complete with success (green)
  logger.succeedSpinner('Application initialized successfully!');

  // Start another spinner
  const dbLogger = new Logger('Database');
  dbLogger.startSpinner('Connecting to database...');
  await new Promise(resolve => setTimeout(resolve, 800));

  // Complete with error (red)
  dbLogger.failSpinner('Failed to connect to database');

  // Start a third spinner
  const cacheLogger = new Logger('Cache');
  cacheLogger.startSpinner('Warming up cache...');
  await new Promise(resolve => setTimeout(resolve, 600));

  // Complete with warning (treated as success but different message)
  cacheLogger.warnSpinner('Cache warmed up with some warnings');

  console.log('\n🎯 Logger spinner demo completed!');
}

async function main() {
  try {
    await demonstrateColoredSpinners();
    await demonstrateLoggerSpinners();

    console.log('\n🎨 Color Legend:');
    console.log('  🔵 Blue: Loading/In Progress');
    console.log('  🟢 Green: Success/Completed');
    console.log('  🔴 Red: Error/Failed');
    console.log('  🟡 Yellow: Skipped/Warning');
    console.log('  🔷 Cyan: Task Output');
    console.log('  ⚪ Gray: Interrupted');
  } catch (error) {
    console.error('Demo failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
