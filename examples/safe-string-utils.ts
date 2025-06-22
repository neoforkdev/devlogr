#!/usr/bin/env tsx

import { SafeStringUtils, TerminalUtils, EmojiUtils } from '../src/index';
import chalk from 'chalk';

console.log(chalk.bold.blue('🛡️  SafeStringUtils Example\n'));

// Show current terminal capabilities
console.log(chalk.dim('Terminal Capabilities:'));
console.log(chalk.dim(`  - Colors: ${TerminalUtils.supportsColor()}`));
console.log(chalk.dim(`  - Unicode: ${TerminalUtils.supportsUnicode()}`));
console.log(chalk.dim(`  - Emojis: ${EmojiUtils.supportsEmoji()}`));
console.log('');

// ============================================================================
// 1. Basic Safe Text Formatting
// ============================================================================

console.log(chalk.bold('1. Basic Safe Text Formatting'));
console.log('');

// Safe color formatting - automatically handles terminals without color support
const coloredText = SafeStringUtils.color('This text is colored', chalk.green.bold);
console.log(`Color formatting: ${coloredText}`);

// Safe emoji handling - strips emojis in non-supporting environments
const emojiText = SafeStringUtils.emoji('Processing files 🚀 with emojis 📁');
console.log(`Emoji handling: ${emojiText}`);

// Combined safe formatting
const safeText = SafeStringUtils.safe('Success! ✅ Task completed 🎉', chalk.green);
console.log(`Combined safe: ${safeText}`);

console.log('');

// ============================================================================
// 2. Safe Symbols and Fallbacks
// ============================================================================

console.log(chalk.bold('2. Safe Symbols and Fallbacks'));
console.log('');

// Unicode symbols with ASCII fallbacks
const checkSymbol = SafeStringUtils.symbol('✓', '+');
const crossSymbol = SafeStringUtils.symbol('✗', 'X');
const infoSymbol = SafeStringUtils.symbol('ℹ', 'i');
const warningSymbol = SafeStringUtils.symbol('!', '!');

console.log(`Check mark: ${checkSymbol}`);
console.log(`Cross mark: ${crossSymbol}`);
console.log(`Info symbol: ${infoSymbol}`);
console.log(`Warning symbol: ${warningSymbol}`);

// Colored symbols with fallbacks
const coloredCheck = SafeStringUtils.coloredSymbol('✓', '+', chalk.green.bold);
const coloredCross = SafeStringUtils.coloredSymbol('✗', 'X', chalk.red.bold);
const coloredInfo = SafeStringUtils.coloredSymbol('ℹ', 'i', chalk.blue.bold);

console.log(`Colored check: ${coloredCheck}`);
console.log(`Colored cross: ${coloredCross}`);
console.log(`Colored info: ${coloredInfo}`);

console.log('');

// ============================================================================
// 3. Log Level Symbols
// ============================================================================

console.log(chalk.bold('3. Log Level Symbols'));
console.log('');

const logSymbols = SafeStringUtils.getLogSymbols();

Object.entries(logSymbols).forEach(([level, config]) => {
  const symbol = SafeStringUtils.coloredSymbol(config.unicode, config.fallback, config.color);
  console.log(`${level.padEnd(7)}: ${symbol}`);
});

console.log('');

// ============================================================================
// 4. Pre-built Formatters
// ============================================================================

console.log(chalk.bold('4. Pre-built Formatters'));
console.log('');

// Error formatting with optional suggestion
const errorMessage = SafeStringUtils.formatError(
  'FileNotFound',
  'The configuration file "config.json" was not found.',
  'Create a config.json file or use --config flag to specify a different path.'
);
console.log(errorMessage);
console.log('');

// Warning formatting
const warningMessage = SafeStringUtils.formatWarning(
  'API rate limit approaching (80/100 requests used)'
);
console.log(warningMessage);
console.log('');

// Info formatting
const infoMessage = SafeStringUtils.formatInfo('Connected to database successfully');
console.log(infoMessage);
console.log('');

// Debug formatting
const debugMessage = SafeStringUtils.formatDebug('Cache hit for key: user_preferences_12345');
console.log(debugMessage);
console.log('');

// ============================================================================
// 5. Custom Message Formatting
// ============================================================================

console.log(chalk.bold('5. Custom Message Formatting'));
console.log('');

// Custom formatted message with all parameters
const customMessage = SafeStringUtils.formatMessage(
  '🚀', // Unicode symbol
  '>', // Fallback symbol
  chalk.blue.bold, // Symbol color
  'DEPLOY', // Prefix
  chalk.blue.bold, // Prefix color
  'Application deployed to production environment', // Content
  chalk.white // Content color (optional)
);
console.log(customMessage);

// Another custom example
const buildMessage = SafeStringUtils.formatMessage(
  '🔨',
  '#',
  chalk.yellow.bold,
  'BUILD',
  chalk.yellow.bold,
  'Compiling TypeScript files...'
);
console.log(buildMessage);

console.log('');

// ============================================================================
// 6. Environment Testing
// ============================================================================

console.log(chalk.bold('6. Environment Testing'));
console.log('');

// Test different scenarios
const scenarios = [
  { name: 'Plain text', text: 'Simple message' },
  { name: 'With emojis', text: 'Processing 📁 files 🚀 quickly ⚡' },
  { name: 'With unicode', text: 'Status: ✓ Success ✗ Failed ℹ Info' },
  { name: 'Mixed content', text: 'Build ✅ complete! 🎉 Ready for deployment 🚀' },
];

scenarios.forEach(scenario => {
  console.log(
    `${chalk.dim(scenario.name + ':').padEnd(20)} ${SafeStringUtils.safe(scenario.text, chalk.green)}`
  );
});

console.log('');

// ============================================================================
// 7. Real-world Usage Examples
// ============================================================================

console.log(chalk.bold('7. Real-world Usage Examples'));
console.log('');

// Simulating different log messages as they would appear in a real application
const realWorldExamples = [
  () => SafeStringUtils.formatInfo('Starting application server on port 3000'),
  () => SafeStringUtils.formatWarning('Deprecated API endpoint used - migrate to v2'),
  () =>
    SafeStringUtils.formatError(
      'Database',
      'Connection failed after 3 retries',
      'Check your database credentials and network connectivity'
    ),
  () => SafeStringUtils.safe('✅ All tests passed (47/47)', chalk.green.bold),
  () =>
    SafeStringUtils.formatMessage(
      '📊',
      '*',
      chalk.magenta.bold,
      'STATS',
      chalk.magenta.bold,
      '1,245 files processed in 2.3 seconds'
    ),
];

realWorldExamples.forEach((example, index) => {
  console.log(`${index + 1}. ${example()}`);
});

console.log('');

// ============================================================================
// Summary
// ============================================================================

console.log(chalk.bold('✨ Summary'));
console.log('');
console.log('SafeStringUtils provides:');
console.log('  • Automatic color detection and fallbacks');
console.log('  • Unicode symbol handling with ASCII alternatives');
console.log('  • Emoji stripping in non-supporting environments');
console.log('  • Pre-built formatters for common log types');
console.log('  • Consistent styling across different terminals');
console.log('');
console.log(chalk.dim('Perfect for building CLI tools that work everywhere! 🌍'));
