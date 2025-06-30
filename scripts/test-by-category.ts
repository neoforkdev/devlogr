#!/usr/bin/env node

import { execSync } from 'child_process';

interface TestCategory {
  path: string;
  description: string;
}

const categories: Record<string, TestCategory> = {
  core: {
    path: 'tests/core/',
    description: 'Core functionality tests (environment, integration, standards)',
  },
  format: {
    path: 'tests/format/',
    description: 'Formatting and display tests (formatters, timestamps)',
  },
  spinner: {
    path: 'tests/spinner/',
    description: 'Spinner and task management tests (single, multiple, artifacts)',
  },
  utils: {
    path: 'tests/utils/',
    description: 'Utility function tests (strings, emoji, circular objects)',
  },
  config: {
    path: 'tests/config/',
    description: 'Configuration and theme tests',
  },
};

function showUsage(): void {
  console.log('\n🧪 DevLogr Test Runner\n');
  console.log('Usage: npx tsx scripts/test-by-category.ts [category]\n');
  console.log('Available categories:\n');

  Object.entries(categories).forEach(([key, { description }]) => {
    console.log(`  ${key.padEnd(10)} - ${description}`);
  });

  console.log('\nExamples:');
  console.log('  npx tsx scripts/test-by-category.ts core');
  console.log('  npx tsx scripts/test-by-category.ts spinner');
  console.log('  npx tsx scripts/test-by-category.ts --all\n');
}

function runTests(category: string): void {
  const config = categories[category];
  if (!config) {
    console.error(`❌ Unknown category: ${category}`);
    showUsage();
    process.exit(1);
  }

  console.log(`\n🔍 Running ${category} tests...`);
  console.log(`📁 ${config.description}\n`);

  try {
    execSync(`npx vitest --run ${config.path}`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    console.log(`\n✅ ${category} tests completed successfully!\n`);
  } catch (error: any) {
    console.log(`\n❌ ${category} tests failed with exit code ${error.status}\n`);
    process.exit(error.status);
  }
}

function runAllTests(): void {
  console.log('\n🚀 Running all test categories...\n');

  const results: Record<string, string> = {};

  Object.keys(categories).forEach(category => {
    try {
      console.log(`\n📋 Testing ${category}...`);
      execSync(`npx vitest --run ${categories[category].path}`, {
        stdio: 'inherit',
        cwd: process.cwd(),
      });
      results[category] = '✅ PASSED';
    } catch (error: any) {
      results[category] = `❌ FAILED (${error.status})`;
    }
  });

  console.log('\n📊 Test Summary:\n');
  Object.entries(results).forEach(([category, result]) => {
    console.log(`  ${category.padEnd(10)} ${result}`);
  });
  console.log('');
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  showUsage();
  process.exit(0);
}

const command = args[0];

if (command === '--help' || command === '-h') {
  showUsage();
} else if (command === '--all' || command === '-a') {
  runAllTests();
} else if (categories[command]) {
  runTests(command);
} else {
  console.error(`❌ Unknown command or category: ${command}`);
  showUsage();
  process.exit(1);
}
