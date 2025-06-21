import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MessageFormatter } from '../src/formatters';
import { SafeStringUtils } from '../src/utils/safe-string';

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
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('formatPrefix', () => {
    it('should return empty string when timestamp is disabled', () => {
      const result = MessageFormatter.formatPrefix('test', 10, false, true);
      expect(result).toBe('');
    });

    it('should format prefix with timestamp when enabled', () => {
      const result = MessageFormatter.formatPrefix('test', 10, true, false);
      expect(result).toMatch(/^\[14:30:45\]/);
      expect(result).toContain('[test]');
    });

    it('should align short prefixes correctly', () => {
      const result = MessageFormatter.formatPrefix('app', 15, true, false);
      expect(result).toMatch(/^\[14:30:45\]/);
      expect(result).toContain('[app]');
      // Should have spacing for shorter prefix
      expect(result).toContain('        '); // Should have the fixed spacing after timestamp
      expect(result.indexOf('[app]')).toBeGreaterThan(15); // Should be positioned after spacing
    });

    it('should align long prefixes correctly', () => {
      const result = MessageFormatter.formatPrefix('very-long-prefix-name', 25, true, false);
      expect(result).toMatch(/^\[14:30:45\]/);
      expect(result).toContain('[very-long-prefix-name]');
      // Should have spacing for longer prefix
      expect(result).toContain('        '); // Should have the fixed spacing after timestamp
      expect(result.indexOf('[very-long-prefix-name]')).toBeGreaterThan(15); // Should be positioned after spacing
    });

    it('should handle colors when enabled', () => {
      const resultWithColors = MessageFormatter.formatPrefix('test', 10, true, true);
      const resultWithoutColors = MessageFormatter.formatPrefix('test', 10, true, false);

      expect(resultWithColors).not.toBe(resultWithoutColors);
      expect(resultWithColors).toContain('[test]');
      expect(resultWithoutColors).toContain('[test]');
    });

    it('should handle edge case with very short max prefix length', () => {
      const result = MessageFormatter.formatPrefix('test', 2, true, false);
      expect(result).toMatch(/^\[14:30:45\]/);
      expect(result).toContain('[test]');
      // Should still have at least one space
      expect(result).toContain(' [test] ');
    });

    it('should handle edge case with exact prefix length match', () => {
      const result = MessageFormatter.formatPrefix('test', 4, true, false);
      expect(result).toMatch(/^\[14:30:45\]/);
      expect(result).toContain('[test]');
    });

    it('should be consistent across multiple calls', () => {
      const result1 = MessageFormatter.formatPrefix('logger', 10, true, false);
      const result2 = MessageFormatter.formatPrefix('logger', 10, true, false);

      expect(result1).toBe(result2);
    });

    it('should handle empty prefix gracefully', () => {
      const result = MessageFormatter.formatPrefix('', 10, true, false);
      expect(result).toMatch(/^\[14:30:45\]/);
      expect(result).toContain('[]');
    });

    it('should handle unicode characters in prefix', () => {
      const result = MessageFormatter.formatPrefix('🚀app', 10, true, false);
      expect(result).toMatch(/^\[14:30:45\]/);
      expect(result).toContain('[🚀app]');
    });
  });

  describe('formatSimple', () => {
    it('should format simple messages correctly', () => {
      const theme = {
        symbol: 'ℹ',
        color: (text: string) => text,
        label: 'INFO',
      };

      const result = MessageFormatter.formatSimple('info', theme, 'Test message', [], true);
      expect(result).toContain('ℹ');
      expect(result).toContain('Test message');
    });
  });

  describe('formatDebug', () => {
    it('should format debug messages with all components', () => {
      const theme = {
        symbol: '?',
        color: (text: string) => text,
        label: 'DEBUG',
      };

      const result = MessageFormatter.formatDebug(
        'debug',
        theme,
        'Debug message',
        [],
        'test',
        10,
        false
      );
      expect(result).toContain('[14:30:45]'); // Check for timestamp without color codes
      expect(result).toContain('?');
      expect(result).toContain('DEBUG');
      expect(result).toContain('[test]');
      expect(result).toContain('Debug message');
    });
  });

  describe('formatSpinnerPrefixWithLevel', () => {
    const mockTheme = {
      symbol: '→',
      label: 'TASK',
      color: (text: string) => text,
    };

    it('should return empty string when timestamp is disabled', () => {
      const result = MessageFormatter.formatSpinnerPrefixWithLevel(
        'task',
        mockTheme,
        'test',
        10,
        false,
        true
      );
      expect(result).toBe('');
    });

    it('should format spinner prefix with timestamp and log level', () => {
      const result = MessageFormatter.formatSpinnerPrefixWithLevel(
        'task',
        mockTheme,
        'test',
        10,
        true,
        false
      );
      expect(result).toMatch(/^\[14:30:45\]/);
      expect(result).toContain('TASK');
      expect(result).toContain('[test]');
      expect(result).toContain('→');
    });

    it('should align prefixes consistently', () => {
      const shortResult = MessageFormatter.formatSpinnerPrefixWithLevel(
        'task',
        mockTheme,
        'app',
        15,
        true,
        false
      );
      const longResult = MessageFormatter.formatSpinnerPrefixWithLevel(
        'task',
        mockTheme,
        'very-long-prefix',
        15,
        true,
        false
      );

      expect(shortResult).toContain('[app]');
      expect(longResult).toContain('[very-long-prefix]');
      expect(shortResult).toContain('TASK');
      expect(longResult).toContain('TASK');
    });

    it('should handle colors when enabled', () => {
      const colorTheme = {
        symbol: '→',
        label: 'TASK',
        color: (text: string) => `colored-${text}`,
      };

      const resultWithColors = MessageFormatter.formatSpinnerPrefixWithLevel(
        'task',
        colorTheme,
        'test',
        10,
        true,
        true
      );
      const resultWithoutColors = MessageFormatter.formatSpinnerPrefixWithLevel(
        'task',
        mockTheme,
        'test',
        10,
        true,
        false
      );

      expect(resultWithColors).not.toBe(resultWithoutColors);
      expect(resultWithColors).toContain('TASK');
      expect(resultWithoutColors).toContain('TASK');
    });

    it('should handle themes without symbols', () => {
      const noSymbolTheme = {
        symbol: '',
        label: 'INFO',
        color: (text: string) => text,
      };

      const result = MessageFormatter.formatSpinnerPrefixWithLevel(
        'info',
        noSymbolTheme,
        'test',
        10,
        true,
        false
      );
      expect(result).toMatch(/^\[14:30:45\]/);
      expect(result).toContain('INFO');
      expect(result).toContain('[test]');
      expect(result).toContain('  '); // Two spaces for missing symbol
    });

    it('should handle different label lengths', () => {
      const shortLabelTheme = { symbol: '✓', label: 'OK', color: (text: string) => text };
      const longLabelTheme = { symbol: '✗', label: 'ERROR', color: (text: string) => text };

      const shortResult = MessageFormatter.formatSpinnerPrefixWithLevel(
        'ok',
        shortLabelTheme,
        'test',
        10,
        true,
        false
      );
      const longResult = MessageFormatter.formatSpinnerPrefixWithLevel(
        'error',
        longLabelTheme,
        'test',
        10,
        true,
        false
      );

      expect(shortResult).toContain('OK');
      expect(longResult).toContain('ERROR');
    });

    it('should handle empty prefix', () => {
      const result = MessageFormatter.formatSpinnerPrefixWithLevel(
        'task',
        mockTheme,
        '',
        10,
        true,
        false
      );
      expect(result).toMatch(/^\[14:30:45\]/);
      expect(result).toContain('TASK');
      expect(result).toContain('[]');
    });

    it('should handle emoji in prefix', () => {
      const result = MessageFormatter.formatSpinnerPrefixWithLevel(
        'task',
        mockTheme,
        '🚀app',
        10,
        true,
        false
      );
      expect(result).toMatch(/^\[14:30:45\]/);
      expect(result).toContain('TASK');
      expect(result).toContain('[🚀app]');
    });

    it('should maintain consistency with formatCompleteLogMessage', () => {
      const spinnerResult = MessageFormatter.formatSpinnerPrefixWithLevel(
        'task',
        mockTheme,
        'test',
        10,
        true,
        false
      );
      const logResult = MessageFormatter.formatCompleteLogMessage(
        'task',
        mockTheme,
        'message',
        [],
        'test',
        10,
        false,
        false
      );

      // Both should contain the same prefix structure
      expect(spinnerResult).toContain('[test]');
      expect(logResult).toContain('[test]');
      expect(spinnerResult).toContain('TASK');
      expect(logResult).toContain('TASK');
    });
  });
});
