#!/usr/bin/env node

/**
 * Manual test script for global environment variable standards
 * Run this script to verify that NO_COLOR, NO_EMOJI, and NO_UNICODE work correctly
 */

import { Logger } from '../src/logger';
import { TerminalUtils } from '../src/utils';
import { EmojiUtils } from '../src/utils/emoji';

interface TestCase {
  name: string;
  setup: () => void;
  expected: string;
}

// Helper to clear environment
function clearEnv(): void {
  delete process.env.NO_COLOR;
  delete process.env.NO_EMOJI;
  delete process.env.NO_UNICODE;
  delete process.env.FORCE_COLOR;
  delete process.env.DEVLOGR_NO_COLOR;
  delete process.env.DEVLOGR_NO_EMOJI;
  delete process.env.DEVLOGR_NO_UNICODE;
  delete process.env.DEVLOGR_FORCE_COLOR;
  delete process.env.DEVLOGR_UNICODE;
}

// Test cases
const tests: TestCase[] = [
  {
    name: 'Default behavior (no env vars)',
    setup: () => clearEnv(),
    expected: 'Colors, emojis, and Unicode should be enabled',
  },
  {
    name: 'NO_COLOR=1',
    setup: () => {
      clearEnv();
      process.env.NO_COLOR = '1';
    },
    expected: 'Colors and emojis should be disabled',
  },
  {
    name: 'NO_EMOJI=1',
    setup: () => {
      clearEnv();
      process.env.NO_EMOJI = '1';
    },
    expected: 'Only emojis should be disabled',
  },
  {
    name: 'NO_UNICODE=1',
    setup: () => {
      clearEnv();
      process.env.NO_UNICODE = '1';
    },
    expected: 'Only Unicode should be disabled',
  },
  {
    name: 'NO_COLOR="" (empty string)',
    setup: () => {
      clearEnv();
      process.env.NO_COLOR = '';
    },
    expected: 'Colors and emojis should be disabled (empty string counts)',
  },
  {
    name: 'Precedence test: NO_COLOR=1 + DEVLOGR_FORCE_COLOR=true',
    setup: () => {
      clearEnv();
      process.env.NO_COLOR = '1';
      process.env.DEVLOGR_FORCE_COLOR = 'true';
    },
    expected: 'Global NO_COLOR should override devlogr setting',
  },
  {
    name: 'All global standards disabled',
    setup: () => {
      clearEnv();
      process.env.NO_COLOR = '1';
      process.env.NO_EMOJI = '1';
      process.env.NO_UNICODE = '1';
    },
    expected: 'Everything should be disabled',
  },
];

console.log('🧪 Testing Global Environment Variable Standards\n');

tests.forEach((test, index) => {
  console.log(`\n${index + 1}. ${test.name}`);
  console.log(`   Expected: ${test.expected}`);

  test.setup();

  const supportsColor = TerminalUtils.supportsColor();
  const supportsEmoji = EmojiUtils.supportsEmoji();
  const supportsUnicode = TerminalUtils.supportsUnicode();

  console.log(
    `   Results: Color=${supportsColor}, Emoji=${supportsEmoji}, Unicode=${supportsUnicode}`
  );

  // Create a logger and test actual output
  const logger = new Logger('TEST');
  console.log(`   Sample output:`);
  logger.info('Hello 🚀 World ℹ✓');
});

// Clean up
clearEnv();

console.log('\n✅ Test completed! Check the output above to verify behavior.');
console.log('\n📝 Notes:');
console.log('   - NO_COLOR and NO_EMOJI are official global standards');
console.log('   - NO_UNICODE is a convenience feature (not an official standard)');
console.log('   - Global standards always take precedence over devlogr-specific settings');
console.log('   - Empty string values should disable features (per NO_COLOR standard)');
