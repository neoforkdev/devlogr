import { Logger } from '../src/logger';
import { TerminalUtils } from '../src/utils/terminal';
import { LogConfiguration } from '../src/config';

const logger = new Logger('CI-Demo');

async function demonstrateCIDetection() {
  logger.title('🤖 CI Detection Demo');
  logger.spacer();

  // Show current environment detection
  const isCI = TerminalUtils.isCI();
  const config = LogConfiguration.getConfig();
  const ciConfig = TerminalUtils.getCIConfig();

  logger.info(`Running in CI environment: ${isCI ? '✅ Yes' : '❌ No'}`);
  logger.spacer();

  logger.separator('Environment Detection');
  logger.spacer();

  // Show detected CI systems
  const ciSystems = [
    { name: 'GitHub Actions', env: 'GITHUB_ACTIONS' },
    { name: 'GitLab CI', env: 'GITLAB_CI' },
    { name: 'CircleCI', env: 'CIRCLECI' },
    { name: 'Travis CI', env: 'TRAVIS' },
    { name: 'Jenkins', env: 'JENKINS_URL' },
    { name: 'Azure DevOps', env: 'TF_BUILD' },
    { name: 'TeamCity', env: 'TEAMCITY_VERSION' },
    { name: 'AppVeyor', env: 'APPVEYOR' },
    { name: 'AWS CodeBuild', env: 'CODEBUILD_BUILD_ID' },
    { name: 'Netlify', env: 'NETLIFY' },
    { name: 'Vercel', env: 'VERCEL' },
    { name: 'Generic CI', env: 'CI' },
  ];

  ciSystems.forEach(system => {
    const detected = !!process.env[system.env];
    logger.info(`${system.name}: ${detected ? '✅ Detected' : '❌ Not detected'}`);
  });

  logger.spacer();
  logger.separator('CI Configuration');
  logger.spacer();

  // Show CI-optimized settings
  logger.info('CI-optimized settings:');
  logger.info(`  • Show Prefix: ${ciConfig.showPrefix ? '✅ Enabled' : '❌ Disabled'}`);
  logger.info(`  • Show Timestamp: ${ciConfig.showTimestamp ? '✅ Enabled' : '❌ Disabled'}`);
  logger.info(`  • Show Icons: ${ciConfig.showIcons ? '✅ Enabled' : '❌ Disabled'}`);
  logger.info(`  • Use Colors: ${ciConfig.useColors ? '✅ Enabled' : '❌ Disabled'}`);
  logger.info(`  • Supports Emoji: ${ciConfig.supportsEmoji ? '✅ Enabled' : '❌ Disabled'}`);

  logger.spacer();
  logger.separator('Active Configuration');
  logger.spacer();

  // Show final applied configuration
  logger.info('Final applied configuration:');
  logger.info(`  • Log Level: ${config.level}`);
  logger.info(`  • JSON Output: ${config.useJson ? '✅ Enabled' : '❌ Disabled'}`);
  logger.info(`  • Colors: ${config.useColors ? '✅ Enabled' : '❌ Disabled'}`);
  logger.info(`  • Unicode: ${config.supportsUnicode ? '✅ Enabled' : '❌ Disabled'}`);
  logger.info(`  • Emoji: ${config.supportsEmoji ? '✅ Enabled' : '❌ Disabled'}`);
  logger.info(`  • Timestamps: ${config.showTimestamp ? '✅ Enabled' : '❌ Disabled'}`);
  logger.info(`  • Prefixes: ${config.showPrefix ? '✅ Enabled' : '❌ Disabled'}`);
  logger.info(`  • Icons: ${config.showIcons ? '✅ Enabled' : '❌ Disabled'}`);

  logger.spacer();
  logger.separator('Benefits in CI');
  logger.spacer();

  if (isCI) {
    logger.success('CI environment detected! DevLogR automatically configured for:');
    logger.info('  📝 Better log identification with prefixes');
    logger.info('  ⏰ Timestamps for debugging and correlation');
    logger.info('  🎯 No icons for maximum compatibility');
    logger.info('  🌈 Dynamic color support based on CI capabilities');
    logger.info('  😊 Smart emoji detection');
  } else {
    logger.info('Not running in CI - using terminal-optimized settings');
    logger.info('To test CI mode, set CI=true environment variable');
  }

  logger.spacer();
  logger.separator('Override Examples');
  logger.spacer();

  logger.info('You can override CI defaults with environment variables:');
  logger.plain('  DEVLOGR_SHOW_PREFIX=false     # Disable prefixes even in CI');
  logger.plain('  DEVLOGR_SHOW_TIMESTAMP=false  # Disable timestamps even in CI');
  logger.plain('  DEVLOGR_NO_ICONS=false        # Enable icons even in CI');
  logger.plain('  NO_COLOR=1                    # Disable colors everywhere');
  logger.plain('  DEVLOGR_NO_EMOJI=true         # Disable emoji specifically');

  logger.spacer();
  logger.title('✅ CI Detection Demo Complete');
}

// Run the demo
demonstrateCIDetection().catch(console.error);
