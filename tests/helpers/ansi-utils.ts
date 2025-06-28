/**
 * ANSI escape sequence utilities for tests
 */

// ANSI escape sequence regex for removing color codes in tests
export const ANSI_ESCAPE_REGEX = new RegExp('\u001b' + '\\[[0-9;]*m', 'g');

// ANSI color detection regex for testing color presence
export const ANSI_COLOR_REGEX = new RegExp('\u001b' + '\\[');

/**
 * Remove ANSI escape sequences from text
 */
export function stripAnsiColors(text: string): string {
  return text.replace(ANSI_ESCAPE_REGEX, '');
}

/**
 * Check if text contains ANSI color codes
 */
export function hasAnsiColors(text: string): boolean {
  return ANSI_COLOR_REGEX.test(text);
}
