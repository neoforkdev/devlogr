'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const logger_1 = require('../src/logger');
const log = (0, logger_1.createLogger)('DEMO');
function demo() {
  console.log('🔧 DevLogr Environment Variables - Live Demo\n');
  // Show baseline output
  console.log('📋 DEFAULT OUTPUT:');
  log.info('This is an info message');
  log.success('This is a success message');
  log.warning('This is a warning message');
  log.error('This is an error message');
  console.log('\n' + '─'.repeat(50) + '\n');
  // 1. DEVLOGR_NO_ICONS - Hide icons
  console.log('🚫 DEVLOGR_NO_ICONS=true (hiding icons):');
  process.env.DEVLOGR_NO_ICONS = 'true';
  log.info('Info without icon');
  log.success('Success without icon');
  // Reset
  delete process.env.DEVLOGR_NO_ICONS;
  console.log('\n' + '─'.repeat(50) + '\n');
  // 2. NO_COLOR - Disable colors
  console.log('🎨 NO_COLOR=1 (no colors):');
  process.env.NO_COLOR = '1';
  log.info('Colorless info message');
  log.error('Colorless error message');
  // Reset
  delete process.env.NO_COLOR;
  console.log('\n' + '─'.repeat(50) + '\n');
  // 3. DEVLOGR_SHOW_TIMESTAMP - Show timestamps
  console.log('⏰ DEVLOGR_SHOW_TIMESTAMP=true (with timestamps):');
  process.env.DEVLOGR_SHOW_TIMESTAMP = 'true';
  log.info('Message with timestamp');
  log.success('Another timestamped message');
  // Reset
  delete process.env.DEVLOGR_SHOW_TIMESTAMP;
  console.log('\n' + '─'.repeat(50) + '\n');
  // 4. DEVLOGR_SHOW_PREFIX - Show prefixes
  console.log('🏷️  DEVLOGR_SHOW_PREFIX=true (with prefixes):');
  process.env.DEVLOGR_SHOW_PREFIX = 'true';
  log.info('Message with prefix');
  log.warning('Warning with prefix');
  // Reset
  delete process.env.DEVLOGR_SHOW_PREFIX;
  console.log('\n' + '─'.repeat(50) + '\n');
  // 5. DEVLOGR_OUTPUT_JSON - JSON output
  console.log('📄 DEVLOGR_OUTPUT_JSON=true (JSON format):');
  process.env.DEVLOGR_OUTPUT_JSON = 'true';
  log.info('JSON formatted message');
  log.error('JSON error message');
  // Reset
  delete process.env.DEVLOGR_OUTPUT_JSON;
  console.log('\n' + '─'.repeat(50) + '\n');
  // 6. DEVLOGR_LOG_LEVEL - Filter by level
  console.log('🔍 DEVLOGR_LOG_LEVEL=error (errors only):');
  process.env.DEVLOGR_LOG_LEVEL = 'error';
  log.info('This info should NOT appear');
  log.warning('This warning should NOT appear');
  log.error('This error SHOULD appear');
  // Reset
  delete process.env.DEVLOGR_LOG_LEVEL;
  console.log('\n' + '─'.repeat(50) + '\n');
  // 7. Combined example
  console.log('🔥 COMBINED (timestamps + prefixes + no icons):');
  process.env.DEVLOGR_SHOW_TIMESTAMP = 'true';
  process.env.DEVLOGR_SHOW_PREFIX = 'true';
  process.env.DEVLOGR_NO_ICONS = 'true';
  log.info('Combined settings message');
  log.success('All features together');
  // Final reset
  delete process.env.DEVLOGR_SHOW_TIMESTAMP;
  delete process.env.DEVLOGR_SHOW_PREFIX;
  delete process.env.DEVLOGR_NO_ICONS;
  console.log('\n✅ Demo complete! Try setting these yourself:\n');
  console.log('DEVLOGR_NO_ICONS=true node examples/env-variables.js');
  console.log('NO_COLOR=1 node examples/env-variables.js');
  console.log('DEVLOGR_SHOW_TIMESTAMP=true node examples/env-variables.js');
  console.log('DEVLOGR_SHOW_PREFIX=true node examples/env-variables.js');
  console.log('DEVLOGR_OUTPUT_JSON=true node examples/env-variables.js');
  console.log('DEVLOGR_LOG_LEVEL=error node examples/env-variables.js');
}
demo();
