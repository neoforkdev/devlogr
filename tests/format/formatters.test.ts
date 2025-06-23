import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MessageFormatter } from '../../src/formatters';
import { SafeStringUtils } from '../../src/utils/safe-string';
import { StringUtils } from '../../src/utils';

// Mock the time to make tests deterministic
vi.mock('../src/utils', async () => {
  const actual = (await vi.importActual('../src/utils')) as any;
  return {
    ...actual,
    StringUtils: {
      ...actual.StringUtils,
      formatTime: vi.fn(() => '14:30:45'),
      repeat: actual.StringUtils.repeat,
      formatArgs: actual.StringUtils.formatArgs,
    },
  };
});

describe('MessageFormatter', () => {
  const originalDate = Date;

  beforeEach(() => {
    // Mock Date to have consistent timestamps in tests
    const mockDate = vi.fn(() => ({
      toTimeString: () => '14:30:45 GMT+0000 (UTC)',
    }));
    vi.stubGlobal('Date', mockDate);

    // Reset caches to ensure clean test state
    SafeStringUtils.resetCache();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('formatBasicPrefix', () => {
    it('should return empty string when timestamp is disabled', () => {
      const result = MessageFormatter.formatBasicPrefix('test', 10, false, true);
      expect(result).toBe('');
    });

    it('should format prefix with timestamp when enabled', () => {
      const result = MessageFormatter.formatBasicPrefix('test', 10, true, false);
      expect(result).toMatch(/^\[14:30:45\]/);
      expect(result).toContain('[test]');
      expect(result).toContain('        '); // 8 spaces after timestamp
    });

    it('should align short prefixes correctly', () => {
      const result = MessageFormatter.formatBasicPrefix('app', 15, true, false);
      expect(result).toMatch(/^\[14:30:45\]/);
      expect(result).toContain('[app]');
      // Should have spacing for alignment
      expect(result.length).toBeGreaterThan(20);
    });

    it('should align long prefixes correctly', () => {
      const result = MessageFormatter.formatBasicPrefix('very-long-prefix-name', 25, true, false);
      expect(result).toMatch(/^\[14:30:45\]/);
      expect(result).toContain('[very-long-prefix-name]');
    });

    it('should handle colors when enabled', () => {
      const resultWithColors = MessageFormatter.formatBasicPrefix('test', 10, true, true);
      const resultWithoutColors = MessageFormatter.formatBasicPrefix('test', 10, true, false);

      // In CI environments, colors might be disabled, so check conditionally
      const hasColors = process.stdout.isTTY && !process.env.NO_COLOR && !process.env.DEVLOGR_NO_COLOR;
      if (hasColors) {
        expect(resultWithColors).toContain('\u001b[');
      }
      expect(resultWithoutColors).not.toContain('\u001b[');
    });

    it('should handle edge case with very short max prefix length', () => {
      const result = MessageFormatter.formatBasicPrefix('test', 2, true, false);
      expect(result).toMatch(/^\[14:30:45\]/);
      expect(result).toContain('[test]');
    });

    it('should handle edge case with exact prefix length match', () => {
      const result = MessageFormatter.formatBasicPrefix('test', 4, true, false);
      expect(result).toMatch(/^\[14:30:45\]/);
      expect(result).toContain('[test]');
    });

    it('should be consistent across multiple calls', () => {
      const result1 = MessageFormatter.formatBasicPrefix('logger', 10, true, false);
      const result2 = MessageFormatter.formatBasicPrefix('logger', 10, true, false);

      expect(result1).toBe(result2);
    });

    it('should handle empty prefix gracefully', () => {
      const result = MessageFormatter.formatBasicPrefix('', 10, true, false);
      expect(result).toMatch(/^\[14:30:45\]/);
      expect(result).toContain('[]');
    });

    it('should handle unicode characters in prefix', () => {
      const result = MessageFormatter.formatBasicPrefix('🚀app', 10, true, false);
      expect(result).toMatch(/^\[14:30:45\]/);
      expect(result).toContain('[🚀app]');
    });
  });

  describe('formatSimpleMessage', () => {
    it('should format simple messages correctly', () => {
      const theme = {
        symbol: 'ℹ',
        label: 'INFO',
        color: (text: string) => text,
      };

      const result = MessageFormatter.formatSimpleMessage('info', theme, 'Test message', [], false);
      expect(result).toContain('ℹ');
      expect(result).toContain('Test message');
    });
  });

  describe('formatCompleteLogMessage', () => {
    it('should format complete messages with all components', () => {
      const theme = {
        symbol: '?',
        label: 'DEBUG',
        color: (text: string) => text,
      };

      const result = MessageFormatter.formatCompleteLogMessage(
        'debug',
        theme,
        'Debug message',
        [],
        'test-app',
        15,
        false,
        undefined,
        false
      );

      expect(result).toContain('[14:30:45]');
      expect(result).toContain('?');
      expect(result).toContain('DEBUG');
      expect(result).toContain('[test-app]');
      expect(result).toContain('Debug message');
    });
  });

  describe('formatSpinnerPrefixWithLevel', () => {
    it('should format spinner prefix with level when timestamp enabled', () => {
      const theme = {
        symbol: '⠋',
        label: 'TASK',
        color: (text: string) => text,
      };

      const result = MessageFormatter.formatSpinnerPrefixWithLevel(
        'task',
        theme,
        'spinner-test',
        20,
        true,
        false
      );

      expect(result).toContain('[14:30:45]');
      expect(result).toContain('⠋');
      expect(result).toContain('TASK');
      expect(result).toContain('[spinner-test]');
    });

    it('should return empty string when timestamp disabled', () => {
      const theme = {
        symbol: '⠋',
        label: 'TASK',
        color: (text: string) => text,
      };

      const result = MessageFormatter.formatSpinnerPrefixWithLevel(
        'task',
        theme,
        'spinner-test',
        20,
        false,
        false
      );

      expect(result).toBe('');
    });

    it('should handle colors correctly', () => {
      const theme = {
        symbol: '⠋',
        label: 'TASK',
        color: (text: string) => `\u001b[36m${text}\u001b[39m`,
      };

      const result = MessageFormatter.formatSpinnerPrefixWithLevel(
        'task',
        theme,
        'test',
        10,
        true,
        true
      );

      expect(result).toContain('\u001b[');
    });

    it('should align prefixes properly', () => {
      const theme = {
        symbol: '⠋',
        label: 'TASK',
        color: (text: string) => text,
      };

      const shortResult = MessageFormatter.formatSpinnerPrefixWithLevel(
        'task',
        theme,
        'a',
        20,
        true,
        false
      );

      const longResult = MessageFormatter.formatSpinnerPrefixWithLevel(
        'task',
        theme,
        'very-long-prefix-name',
        20,
        true,
        false
      );

      expect(shortResult.length).toBeGreaterThan(longResult.length - 10);
    });

    it('should handle different log levels', () => {
      const infoTheme = {
        symbol: 'ℹ',
        label: 'INFO',
        color: (text: string) => text,
      };

      const result = MessageFormatter.formatSpinnerPrefixWithLevel(
        'info',
        infoTheme,
        'test',
        10,
        true,
        false
      );

      expect(result).toContain('ℹ');
      expect(result).toContain('INFO');
    });

    it('should handle empty symbols gracefully', () => {
      const theme = {
        symbol: '',
        label: 'PLAIN',
        color: (text: string) => text,
      };

      const result = MessageFormatter.formatSpinnerPrefixWithLevel(
        'plain',
        theme,
        'test',
        10,
        true,
        false
      );

      expect(result).toContain('PLAIN');
      expect(result).toContain('[test]');
    });

    it('should maintain consistent spacing', () => {
      const theme = {
        symbol: '→',
        label: 'TASK',
        color: (text: string) => text,
      };

      const result1 = MessageFormatter.formatSpinnerPrefixWithLevel(
        'task',
        theme,
        'prefix1',
        15,
        true,
        false
      );

      const result2 = MessageFormatter.formatSpinnerPrefixWithLevel(
        'task',
        theme,
        'prefix2',
        15,
        true,
        false
      );

      // Both should have same structure/spacing
      const parts1 = result1.split(' ');
      const parts2 = result2.split(' ');
      expect(parts1.length).toBe(parts2.length);
    });

    it('should handle unicode symbols correctly', () => {
      const theme = {
        symbol: '🚀',
        label: 'ROCKET',
        color: (text: string) => text,
      };

      const result = MessageFormatter.formatSpinnerPrefixWithLevel(
        'rocket',
        theme,
        'test',
        10,
        true,
        false
      );

      expect(result).toContain('🚀');
      expect(result).toContain('ROCKET');
    });

    it('should not have trailing space', () => {
      const theme = {
        symbol: '●',
        label: 'TEST',
        color: (text: string) => text,
      };

      const result = MessageFormatter.formatSpinnerPrefixWithLevel(
        'test',
        theme,
        'test-prefix',
        20,
        true,
        false
      );

      // Should NOT end with a trailing space (ora handles spinner text spacing internally)
      expect(result).not.toMatch(/ $/);
      expect(result).toContain('●');
      expect(result).toContain('TEST');
      expect(result).toContain('[test-prefix]');
    });

    it('should have correct spacing between components without extra trailing space', () => {
      const theme = {
        symbol: '⠋',
        label: 'TASK',
        color: (text: string) => text,
      };

      const result = MessageFormatter.formatSpinnerPrefixWithLevel(
        'task',
        theme,
        'app',
        15,
        true,
        false
      );

      // Verify the result structure: [timestamp] symbol LABEL [prefix]
      // Should have proper spacing pattern but no trailing space
      expect(result).toMatch(/^\[[\d:]+\] ⠋ TASK\s+\[app\]$/);

      // Should not end with trailing space (this was the bug we fixed)
      expect(result).not.toMatch(/ $/);

      // Should not start with space
      expect(result).not.toMatch(/^ /);

      // Should contain all expected components
      expect(result).toContain('[');
      expect(result).toContain(']');
      expect(result).toContain('⠋');
      expect(result).toContain('TASK');
      expect(result).toContain('[app]');
    });

    it('should maintain consistent spacing across different prefix lengths', () => {
      const theme = {
        symbol: '→',
        label: 'DEPLOY',
        color: (text: string) => text,
      };

      const shortResult = MessageFormatter.formatSpinnerPrefixWithLevel(
        'deploy',
        theme,
        'ui',
        20,
        true,
        false
      );

      const longResult = MessageFormatter.formatSpinnerPrefixWithLevel(
        'deploy',
        theme,
        'backend-service',
        20,
        true,
        false
      );

      // Both should follow the same spacing pattern
      expect(shortResult).toMatch(/^\[[\d:]+\] → DEPLOY\s+\[ui\]$/);
      expect(longResult).toMatch(/^\[[\d:]+\] → DEPLOY\s+\[backend-service\]$/);

      // Neither should have trailing spaces (this was the main bug we fixed)
      expect(shortResult).not.toMatch(/ $/);
      expect(longResult).not.toMatch(/ $/);

      // Both should contain expected components
      expect(shortResult).toContain('→');
      expect(shortResult).toContain('DEPLOY');
      expect(shortResult).toContain('[ui]');

      expect(longResult).toContain('→');
      expect(longResult).toContain('DEPLOY');
      expect(longResult).toContain('[backend-service]');
    });
  });
});
