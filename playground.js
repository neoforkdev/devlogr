#!/usr/bin/env node

// Import the devlogr library
const { createLogger, Logger, LogLevel, SpinnerUtils } = require('./dist/index.js');


// ============================================================================
// BEAUTIFUL CLI SIMULATION - DevLogr Showcase
// ============================================================================

console.clear();

const appLogger = createLogger('devpack');
const buildLogger = createLogger('builder');
const deployLogger = createLogger('deploy');
const testLogger = createLogger('test');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function simulateDevToolCLI() {
  // Header
  appLogger.title('🚀 DevPack - Modern Development Toolkit');
  appLogger.separator('Initialization');
  
  await sleep(500);
  
  // Configuration phase
  appLogger.info('Loading configuration from devpack.config.js');
  appLogger.debug('Found 3 build targets: web, mobile, desktop');
  appLogger.debug('Environment: development');
  
  await sleep(800);
  
  // Dependencies check
  appLogger.startSpinner('Checking dependencies...');
  await sleep(2000);
  appLogger.updateSpinner('Resolving package versions...');
  await sleep(1500);
  appLogger.succeedSpinner('Dependencies resolved ✨');
  
  appLogger.spacer();
  appLogger.separator('🔨 Build Process');
  
  // Parallel build simulation
  buildLogger.startSpinner('Compiling TypeScript...');
  testLogger.startSpinner('Running tests in parallel...');
  
  await sleep(2500);
  
  // Build results
  buildLogger.succeedSpinner('TypeScript compilation complete (847ms)');
  await sleep(300);
  testLogger.succeedSpinner('All tests passed (1.2s) - 47 tests, 0 failures');
  
  await sleep(500);
  
  // Bundle optimization
  buildLogger.startSpinner('Optimizing bundles...');
  await sleep(2000);
  buildLogger.updateSpinner('Tree-shaking unused code...');
  await sleep(1200);
  buildLogger.updateSpinner('Minifying JavaScript...');
  await sleep(1000);
  buildLogger.succeedSpinner('Bundle optimization complete');
  
  // Build stats
  buildLogger.success('📦 Build artifacts generated:');
  buildLogger.plain('   • main.js (342 KB → 89 KB gzipped)');
  buildLogger.plain('   • styles.css (156 KB → 23 KB gzipped)');
  buildLogger.plain('   • assets/ (47 files, 2.1 MB total)');
  
  await sleep(800);
  
  // Warning example
  buildLogger.warning('Large bundle detected in vendor.js (245 KB)');
  buildLogger.plain('   Consider code splitting for better performance');
  
  appLogger.spacer();
  appLogger.separator('🧪 Quality Checks');
  
  // Multiple quality checks
  const checks = [
    { name: 'lint', logger: createLogger('eslint'), task: 'Linting code...', result: 'success', time: 1200 },
    { name: 'security', logger: createLogger('audit'), task: 'Security audit...', result: 'warning', time: 1800 },
    { name: 'perf', logger: createLogger('lighthouse'), task: 'Performance analysis...', result: 'success', time: 2200 }
  ];
  
  // Start all checks
  checks.forEach(check => {
    check.logger.startSpinner(check.task);
  });
  
  await sleep(800);
  
  // Complete checks sequentially
  for (const check of checks) {
    await sleep(check.time);
    
    if (check.result === 'success') {
      check.logger.succeedSpinner(`${check.name.toUpperCase()} passed`);
    } else if (check.result === 'warning') {
      check.logger.warnSpinner(`${check.name.toUpperCase()} completed with warnings`);
      if (check.name === 'security') {
        check.logger.plain('   • 2 moderate vulnerabilities found');
        check.logger.plain('   • Run "npm audit fix" to resolve');
      }
    }
    await sleep(200);
  }
  
  appLogger.spacer();
  appLogger.separator('🚀 Deployment');
  
  // Deployment simulation
  deployLogger.info('Target: production (us-east-1)');
  deployLogger.debug('Using deployment key: ****-****-**42');
  
  await sleep(500);
  
  deployLogger.startSpinner('Uploading assets to CDN...');
  await sleep(2500);
  deployLogger.updateSpinner('Invalidating cache...');
  await sleep(1200);
  deployLogger.succeedSpinner('Assets deployed successfully');
  
  await sleep(300);
  
  deployLogger.startSpinner('Updating application servers...');
  await sleep(2000);
  deployLogger.updateSpinner('Rolling deployment: 2/4 servers updated...');
  await sleep(1500);
  deployLogger.updateSpinner('Health checks passing...');
  await sleep(1000);
  deployLogger.succeedSpinner('Deployment complete! 🎉');
  
  // Final results
  appLogger.spacer();
  appLogger.separator('📊 Summary');
  
  appLogger.success('✅ Build completed successfully');
  appLogger.info('🌐 Application URL: https://myapp.example.com');
  appLogger.info('📈 Performance Score: 94/100');
  appLogger.info('⏱️  Total time: 12.7 seconds');
  
  const stats = {
    files_processed: 247,
    dependencies: 156,
    bundle_size: '89 KB',
    test_coverage: '94.2%'
  };
  
  appLogger.debug('Build statistics:', stats);
  
  await sleep(1000);
  
  // Error simulation (demonstrate error handling)
  if (Math.random() > 0.7) {
    appLogger.spacer();
    appLogger.separator('💥 Error Example');
    appLogger.error('Connection timeout during deployment verification');
    appLogger.plain('   Deployment completed but health check failed');
    appLogger.task('Manual verification recommended');
  }
  
  appLogger.spacer();
  appLogger.task('🎯 Ready for development!');
  appLogger.plain('Run "devpack dev" to start development server');
  appLogger.plain('Run "devpack build --prod" for production build');
  
  // Show JSON output example
  if (!process.env.DEVLOGR_OUTPUT_JSON) {
    appLogger.spacer();
    appLogger.separator('💡 Pro Tips');
    appLogger.info('Set DEVLOGR_OUTPUT_JSON=true for structured logging');
    appLogger.info('Set DEVLOGR_LOG_LEVEL=debug for verbose output');
    appLogger.info('Use NO_COLOR=1 in CI environments');
  }
}

async function showFeatureDemo() {
  if (process.env.DEMO_FEATURES === 'true') {
    const demoLogger = createLogger('demo');
    
    demoLogger.spacer();
    demoLogger.separator('✨ DevLogr Features');
    
    // Log levels
    demoLogger.trace('Trace level - very detailed debugging');
    demoLogger.debug('Debug level - development info');
    demoLogger.info('Info level - general information');
    demoLogger.warning('Warning level - something to watch');
    demoLogger.error('Error level - something went wrong');
    demoLogger.success('Success level - operation completed');
    
    await sleep(1000);
    
    // Special formatting
    demoLogger.title('🎨 Title level - section headers');
    demoLogger.task('📋 Task level - action items');
    demoLogger.plain('Plain level - unformatted text');
    
    await sleep(1000);
    
    // Separators and spacing
    demoLogger.separator();
    demoLogger.separator('Custom Section');
    demoLogger.spacer();
    
    // Object logging
    const complexObject = {
      name: 'DevLogr',
      version: '1.0.0',
      features: ['spinners', 'colors', 'json', 'emoji'],
      config: {
        colors: true,
        emoji: true,
        level: 'info'
      }
    };
    
    demoLogger.info('Complex object logging:', complexObject);
    
    await sleep(1000);
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  try {
    
    // Show environment info
    const info = createLogger('info');
    info.debug(`Node.js: ${process.version}`);
    info.debug(`Platform: ${process.platform}`);
    info.debug(`TTY: ${process.stdout.isTTY ? 'Yes' : 'No'}`);
    info.debug(`Colors: ${process.env.NO_COLOR ? 'Disabled' : 'Enabled'}`);
    info.debug(`JSON Mode: ${process.env.DEVLOGR_OUTPUT_JSON ? 'Enabled' : 'Disabled'}`);
    
    await sleep(1000);
    
    await simulateDevToolCLI();
    await showFeatureDemo();
    
  } catch (error) {
    console.error('Demo failed:', error.message);
  } finally {
    // Clean up any remaining spinners
    SpinnerUtils.stopAllSpinners();
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Demo interrupted');
  SpinnerUtils.stopAllSpinners();
  process.exit(0);
});

// Run the simulation
main(); 