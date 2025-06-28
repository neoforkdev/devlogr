/**
 * Test Environment Helper
 *
 * Provides a centralized way to set up consistent test environments
 * across all DevLogr test files. Ensures proper environment variable
 * isolation and prevents test pollution.
 */

/**
 * Sets up a clean, isolated test environment for DevLogr tests.
 *
 * This function:
 * 1. Clears all DevLogr environment variables
 * 2. Sets DEVLOGR_DISABLE_CI_DETECTION=true for consistent behavior
 * 3. Applies the specified test configuration
 */
export function setupTestEnvironment(
  showTimestamp = false,
  showPrefix = false,
  noIcons = false,
  useColors = true,
  logLevel?: string,
  outputJson = false
): void {
  // Clear all DevLogr environment variables
  delete process.env.DEVLOGR_SHOW_TIMESTAMP;
  delete process.env.DEVLOGR_SHOW_PREFIX;
  delete process.env.DEVLOGR_NO_ICONS;
  delete process.env.DEVLOGR_NO_COLOR;
  delete process.env.NO_COLOR;
  delete process.env.DEVLOGR_LOG_LEVEL;
  delete process.env.DEVLOGR_OUTPUT_JSON;
  delete process.env.DEVLOGR_DISABLE_CI_DETECTION;

  // Set default non-CI behavior for consistent test results
  process.env.DEVLOGR_DISABLE_CI_DETECTION = 'true';

  // Apply test-specific environment configuration
  if (showTimestamp) process.env.DEVLOGR_SHOW_TIMESTAMP = 'true';
  if (showPrefix) process.env.DEVLOGR_SHOW_PREFIX = 'true';
  if (noIcons) process.env.DEVLOGR_NO_ICONS = 'true';
  if (useColors === false) process.env.NO_COLOR = '1';
  if (logLevel) process.env.DEVLOGR_LOG_LEVEL = logLevel;
  if (outputJson) process.env.DEVLOGR_OUTPUT_JSON = 'true';
}
