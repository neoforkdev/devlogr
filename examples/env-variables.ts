import { createLogger } from '../src/logger';

const log = createLogger('DEMO');

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function demo() {
  console.log('🚀 DevLogr Environment Variables Live Demo\n');

  // Default behavior
  console.log('📋 DEFAULT BEHAVIOR:');
  log.info('This is an info message');
  log.success('This is a success message');
  log.warning('This is a warning message');
  log.error('This is an error message');

  await sleep(1500);
  console.log('\n' + '='.repeat(50) + '\n');

  // 1. DEVLOGR_NO_ICONS
  console.log('🎯 DEVLOGR_NO_ICONS=true (Hide all icons):');
  process.env.DEVLOGR_NO_ICONS = 'true';
  const logNoIcons = createLogger('DEMO');
  logNoIcons.info('Info without icon');
  logNoIcons.success('Success without icon');
  logNoIcons.warning('Warning without icon');
  logNoIcons.error('Error without icon');

  await sleep(1500);
  console.log('\n' + '='.repeat(50) + '\n');

  // 2. DEVLOGR_SHOW_TIMESTAMP
  console.log('⏰ DEVLOGR_SHOW_TIMESTAMP=true (Add timestamps):');
  delete process.env.DEVLOGR_NO_ICONS;
  process.env.DEVLOGR_SHOW_TIMESTAMP = 'true';
  const logTimestamp = createLogger('DEMO');
  logTimestamp.info('Message with timestamp');
  logTimestamp.success('Another message with timestamp');

  await sleep(1500);
  console.log('\n' + '='.repeat(50) + '\n');

  // 3. DEVLOGR_SHOW_PREFIX
  console.log('🏷️  DEVLOGR_SHOW_PREFIX=true (Show prefixes and levels):');
  process.env.DEVLOGR_SHOW_PREFIX = 'true';
  const logPrefix = createLogger('DEMO');
  logPrefix.info('Message with prefix and level');
  logPrefix.success('Success with prefix and level');

  await sleep(1500);
  console.log('\n' + '='.repeat(50) + '\n');

  // 4. NO_COLOR
  console.log('🎨 NO_COLOR=1 (Disable colors):');
  process.env.NO_COLOR = '1';
  const logNoColor = createLogger('DEMO');
  logNoColor.info('Colorless info message');
  logNoColor.success('Colorless success message');
  logNoColor.warning('Colorless warning message');
  logNoColor.error('Colorless error message');

  await sleep(1500);
  console.log('\n' + '='.repeat(50) + '\n');

  // 5. DEVLOGR_LOG_LEVEL
  console.log('📊 DEVLOGR_LOG_LEVEL=error (Only show errors):');
  delete process.env.NO_COLOR;
  delete process.env.DEVLOGR_SHOW_TIMESTAMP;
  delete process.env.DEVLOGR_SHOW_PREFIX;
  process.env.DEVLOGR_LOG_LEVEL = 'error';
  const logError = createLogger('DEMO');
  logError.info('This info will be hidden');
  logError.success('This success will be hidden');
  logError.warning('This warning will be hidden');
  logError.error('Only this error will show');

  await sleep(1500);
  console.log('\n' + '='.repeat(50) + '\n');

  // 6. DEVLOGR_OUTPUT_JSON
  console.log('📄 DEVLOGR_OUTPUT_JSON=true (JSON format):');
  delete process.env.DEVLOGR_LOG_LEVEL;
  process.env.DEVLOGR_OUTPUT_JSON = 'true';
  const logJson = createLogger('DEMO');
  logJson.info('JSON formatted message');
  logJson.success('Another JSON message');

  await sleep(1500);
  console.log('\n' + '='.repeat(50) + '\n');

  // 7. Combined example
  console.log('🔧 COMBINED: NO_COLOR + DEVLOGR_NO_ICONS + DEVLOGR_SHOW_PREFIX:');
  delete process.env.DEVLOGR_OUTPUT_JSON;
  process.env.NO_COLOR = '1';
  process.env.DEVLOGR_NO_ICONS = 'true';
  process.env.DEVLOGR_SHOW_PREFIX = 'true';
  const logCombined = createLogger('DEMO');
  logCombined.info('Clean, accessible message');
  logCombined.success('Perfect for CI/CD logs');

  await sleep(1500);
  console.log('\n' + '='.repeat(50) + '\n');

  // Reset and summary
  delete process.env.NO_COLOR;
  delete process.env.DEVLOGR_NO_ICONS;
  delete process.env.DEVLOGR_SHOW_PREFIX;

  console.log('✅ Demo complete! Try these commands:');
  console.log('');
  console.log('DEVLOGR_NO_ICONS=true npm run example:env-variables');
  console.log('DEVLOGR_SHOW_TIMESTAMP=true npm run example:env-variables');
  console.log('DEVLOGR_SHOW_PREFIX=true npm run example:env-variables');
  console.log('NO_COLOR=1 npm run example:env-variables');
  console.log('DEVLOGR_LOG_LEVEL=error npm run example:env-variables');
  console.log('DEVLOGR_OUTPUT_JSON=true npm run example:env-variables');
}

demo().catch(console.error);
