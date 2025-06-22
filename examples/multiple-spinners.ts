import { Logger } from '../src/logger';
import { ListrTask } from 'listr2';

const logger = new Logger('MultiSpinner');

async function multipleSpinnersDemo() {
  console.log('=== DevLogr Multiple Spinners Demo ===\n');

  // Sequential tasks
  const sequentialTasks: ListrTask[] = [
    {
      title: 'Installing dependencies',
      task: async (ctx, task) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        task.output = 'Downloading packages...';
        await new Promise(resolve => setTimeout(resolve, 1000));
        task.output = 'Resolving dependencies...';
        await new Promise(resolve => setTimeout(resolve, 1000));
      },
    },
    {
      title: 'Building project',
      task: async (ctx, task) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        task.output = 'Compiling TypeScript...';
        await new Promise(resolve => setTimeout(resolve, 800));
        task.output = 'Bundling assets...';
        await new Promise(resolve => setTimeout(resolve, 800));
      },
    },
    {
      title: 'Running tests',
      task: async () => {
        await new Promise(resolve => setTimeout(resolve, 1500));
      },
    },
  ];

  await logger.runTasks('Sequential Build Process', sequentialTasks);

  logger.spacer();

  // Concurrent tasks
  const concurrentTasks: ListrTask[] = [
    {
      title: 'Linting code',
      task: async (ctx, task) => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        task.output = 'ESLint completed with 0 errors';
      },
    },
    {
      title: 'Type checking',
      task: async (ctx, task) => {
        await new Promise(resolve => setTimeout(resolve, 1800));
        task.output = 'TypeScript compilation successful';
      },
    },
    {
      title: 'Running unit tests',
      task: async (ctx, task) => {
        await new Promise(resolve => setTimeout(resolve, 2200));
        task.output = 'All 42 tests passed';
      },
    },
    {
      title: 'Generating docs',
      task: async () => {
        await new Promise(resolve => setTimeout(resolve, 1600));
      },
    },
  ];

  await logger.runTasks('Concurrent Quality Checks', concurrentTasks);

  logger.spacer();

  // Nested tasks with sub-spinners
  const nestedTasks: ListrTask[] = [
    {
      title: 'Database operations',
      task: () =>
        logger.createTaskList([
          {
            title: 'Creating tables',
            task: async () => await new Promise(resolve => setTimeout(resolve, 1000)),
          },
          {
            title: 'Seeding data',
            task: async (ctx, task) => {
              task.output = 'Inserting user records...';
              await new Promise(resolve => setTimeout(resolve, 800));
              task.output = 'Inserting product records...';
              await new Promise(resolve => setTimeout(resolve, 800));
            },
          },
          {
            title: 'Creating indexes',
            task: async () => await new Promise(resolve => setTimeout(resolve, 600)),
          },
        ]),
    },
    {
      title: 'Cache operations',
      task: () =>
        logger.createTaskList([
          {
            title: 'Warming Redis cache',
            task: async () => await new Promise(resolve => setTimeout(resolve, 1200)),
          },
          {
            title: 'Precomputing queries',
            task: async () => await new Promise(resolve => setTimeout(resolve, 900)),
          },
        ]),
    },
  ];

  await logger.runTasks('System Initialization', nestedTasks);

  logger.spacer();

  // Tasks with different outcomes
  const mixedOutcomeTasks: ListrTask[] = [
    {
      title: 'Task that succeeds',
      task: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
      },
    },
    {
      title: 'Task that gets skipped',
      task: (ctx, task) => task.skip('Feature disabled in development mode'),
    },
    {
      title: 'Task that fails',
      task: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        throw new Error('Simulated failure for demo purposes');
      },
    },
    {
      title: 'Task after failure',
      task: async () => {
        await new Promise(resolve => setTimeout(resolve, 800));
      },
    },
  ];

  try {
    await logger.runTasks('Mixed Outcome Tasks', mixedOutcomeTasks);
  } catch (error) {
    // Expected to fail, but we continue
  }

  logger.success('Multiple spinners demo complete!');
}

multipleSpinnersDemo().catch(console.error);
