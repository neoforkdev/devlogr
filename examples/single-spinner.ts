import { Logger } from '../src/logger';

const logger = new Logger('Spinner');

async function singleSpinnerDemo() {
  console.log('=== DevLogr Single Spinner Demo ===\n');

  // Basic spinner usage
  logger.info('Starting basic spinner demo...');
  logger.startSpinner('Processing data...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  logger.completeSpinnerWithSuccess('Data processed successfully!');

  await new Promise(resolve => setTimeout(resolve, 500));

  // Spinner with text updates
  logger.info('Starting spinner with text updates...');
  logger.startSpinner('Initializing...');
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  logger.updateSpinnerText('Loading configuration...');
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  logger.updateSpinnerText('Connecting to database...');
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  logger.updateSpinnerText('Finalizing setup...');
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  logger.completeSpinnerWithSuccess('Setup completed!');

  await new Promise(resolve => setTimeout(resolve, 500));

  // Spinner ending with warning
  logger.info('Starting spinner that ends with warning...');
  logger.startSpinner('Checking system compatibility...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  logger.completeSpinnerWithWarning('Some compatibility issues found, but continuing...');

  await new Promise(resolve => setTimeout(resolve, 500));

  // Spinner ending with error
  logger.info('Starting spinner that ends with error...');
  logger.startSpinner('Attempting risky operation...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  logger.completeSpinnerWithError('Operation failed due to insufficient permissions');

  await new Promise(resolve => setTimeout(resolve, 500));

  // Spinner ending with info
  logger.info('Starting spinner that ends with info...');
  logger.startSpinner('Gathering system information...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  logger.completeSpinnerWithInfo('Information gathered, no action required');

  await new Promise(resolve => setTimeout(resolve, 500));

  // Manual spinner control
  logger.info('Manual spinner control demo...');
  logger.startSpinner('Manual process...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  logger.stopSpinner(); // Stop without completion message
  logger.info('Spinner stopped manually');

  logger.success('Single spinner demo complete!');
}

singleSpinnerDemo().catch(console.error); 