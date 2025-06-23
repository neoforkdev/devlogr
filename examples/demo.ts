import { Logger } from '../src/logger';

const logger = new Logger('Demo');

async function quickDemo() {
  // Title and basic info
  logger.title('🚀 DevLogr Quick Demo');
  logger.info('Showcasing all the essential features...');
  
  logger.separator('Log Levels');
  
  // Demonstrate different log levels
  logger.success('✅ Everything is working perfectly');
  logger.info('ℹ️  Here\'s some helpful information');
  logger.warn('⚠️  This might need your attention');
  logger.error('❌ Something went wrong here');
  logger.task('📝 Working on important task');
  logger.debug('🐛 Debug info (only shows in debug mode)');
  
  logger.separator('Spinners in Action');
  
  // Basic spinner
  logger.startSpinner('⏳ Processing data...');
  await sleep(2000);
  logger.succeedSpinner('Data processed successfully!');
  
  await sleep(500);
  
  // Spinner with updates
  logger.startSpinner('🔄 Multi-step operation...');
  await sleep(1000);
  
  logger.updateSpinnerText('📡 Connecting to API...');
  await sleep(1000);
  
  logger.updateSpinnerText('📊 Analyzing results...');
  await sleep(1000);
  
  logger.updateSpinnerText('💾 Saving changes...');
  await sleep(1000);
  
  logger.completeSpinnerWithSuccess('All steps completed!');
  
  await sleep(500);
  
  // Error scenario
  logger.startSpinner('🧪 Testing error handling...');
  await sleep(1500);
  logger.failSpinner('Operation failed as expected');
  
  await sleep(500);
  
  logger.separator('Object & Data Logging');
  
  // Object logging
  const userInfo = { 
    name: 'DevLogr User', 
    version: '1.0.0', 
    features: ['spinners', 'colors', 'emojis'] 
  };
  
  logger.info('📋 User configuration:', userInfo);
  logger.success('🎯 Complex object:', {
    deployment: {
      environment: 'production',
      timestamp: new Date(),
      config: { timeout: 30000, retries: 3 }
    }
  });
  
  logger.separator('Formatting Examples');
  
  // Plain text without styling
  logger.plain('This is plain text without any formatting');
  
  // Rich formatting with placeholders
  logger.info('Using placeholders: MyApp deployed in 1250ms');
  
  logger.spacer();
  logger.title('🎉 Demo Complete!');
  logger.success('DevLogr makes CLI logging beautiful and functional');
  logger.info('💡 Try different environment variables like DEVLOGR_OUTPUT_JSON=true');
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the demo
quickDemo().catch(console.error); 