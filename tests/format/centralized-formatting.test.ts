import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MessageFormatter } from '../../src/formatters';
import { StringUtils } from '../../src/utils';
import { TimestampFormat } from '../../src/types';

import { setupTestEnvironment } from '../helpers/test-environment';

describe('Centralized Formatting', () => {
  beforeEach(() => {
    setupTestEnvironment();
  });
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('StringUtils.formatTime', () => {
    beforeEach(() => {
      // Mock Date to have consistent timestamps in tests
      const mockDate = new Date('2023-01-15T14:30:45.123Z');
      vi.spyOn(global, 'Date').mockImplementation(() => mockDate as Date);
      // Mock the time methods
      vi.spyOn(mockDate, 'toTimeString').mockReturnValue('14:30:45 GMT+0000 (UTC)');
      vi.spyOn(mockDate, 'toISOString').mockReturnValue('2023-01-15T14:30:45.123Z');
    });

    it('should format time in HH:MM:SS format by default', () => {
      const result = StringUtils.formatTime();
      expect(result).toBe('14:30:45');
    });

    it('should format time in HH:MM:SS format when TimestampFormat.TIME is specified', () => {
      const result = StringUtils.formatTime(TimestampFormat.TIME);
      expect(result).toBe('14:30:45');
    });

    it('should format time in ISO format when TimestampFormat.ISO is specified', () => {
      const result = StringUtils.formatTime(TimestampFormat.ISO);
      expect(result).toBe('2023-01-15T14:30:45.123Z');
    });

    it('should handle time extraction correctly for TIME format', () => {
      const result = StringUtils.formatTime(TimestampFormat.TIME);
      // Should extract only the time portion (HH:MM:SS)
      expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
      expect(result).toBe('14:30:45');
    });

    it('should provide full ISO string for ISO format', () => {
      const result = StringUtils.formatTime(TimestampFormat.ISO);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(result).toBe('2023-01-15T14:30:45.123Z');
    });

    it('should work with real Date object', () => {
      vi.restoreAllMocks(); // Remove mocks to test with real Date

      const result = StringUtils.formatTime(TimestampFormat.TIME);
      expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);

      const isoResult = StringUtils.formatTime(TimestampFormat.ISO);
      expect(isoResult).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('MessageFormatter.format - Universal Formatter', () => {
    const mockTheme = {
      symbol: '✓',
      label: 'SUCCESS',
      color: (text: string) => `colored(${text})`,
    };

    it('should format basic message with minimal options', () => {
      const result = MessageFormatter.format({
        message: 'Test message',
      });

      expect(result).toBe('Test message');
    });

    it('should format message with symbol only', () => {
      const result = MessageFormatter.format({
        theme: mockTheme,
        message: 'Success message',
        includeLevel: false,
        includePrefix: false,
      });

      expect(result).toBe('✓ Success message');
    });

    it('should format message with colors when enabled', () => {
      const result = MessageFormatter.format({
        theme: mockTheme,
        message: 'Colored message',
        useColors: true,
        includeLevel: false,
        includePrefix: false,
      });

      expect(result).toBe('colored(✓) Colored message');
    });

    it('should format complete message with all components', () => {
      // Mock formatTime to have predictable output
      vi.spyOn(StringUtils, 'formatTime').mockReturnValue('12:34:56');

      const result = MessageFormatter.format({
        level: 'success',
        theme: mockTheme,
        message: 'Complete message',
        prefix: 'app',
        maxPrefixLength: 10,
        showTimestamp: true,
        useColors: false,
        includeLevel: true,
        includePrefix: true,
      });

      expect(result).toContain('[12:34:56]');
      expect(result).toContain('✓');
      expect(result).toContain('SUCCESS');
      expect(result).toContain('[app]');
      expect(result).toContain('Complete message');
    });

    it('should handle arguments formatting', () => {
      const result = MessageFormatter.format({
        theme: mockTheme,
        message: 'Message with args',
        args: ['arg1', { key: 'value' }],
        includeLevel: false,
        includePrefix: false,
      });

      expect(result).toContain('Message with args');
      expect(result).toContain('arg1');
      expect(result).toContain('key');
      expect(result).toContain('value');
    });

    it('should strip emojis when requested', () => {
      const result = MessageFormatter.format({
        theme: { symbol: '🚀', label: 'ROCKET', color: (text: string) => text },
        message: 'Message with 🎉 emojis',
        args: ['More 🌟 emojis'],
        stripEmojis: true,
        includeLevel: false,
        includePrefix: false,
      });

      // Symbol emoji stripping is not implemented in the minimal format path
      // This is expected behavior - symbols are themed elements that remain consistent
      expect(result).toContain('🚀'); // Symbol remains
      expect(result).not.toContain('🎉'); // Message emojis stripped
      expect(result).not.toContain('🌟'); // Arg emojis stripped
      expect(result).toContain('Message with emojis'); // Spaces normalized
      expect(result).toContain('More emojis'); // Spaces normalized
    });

    it('should handle timestamp formats correctly', () => {
      vi.spyOn(StringUtils, 'formatTime').mockImplementation(format => {
        return format === TimestampFormat.ISO ? '2023-01-15T12:34:56.789Z' : '12:34:56';
      });

      const timeResult = MessageFormatter.format({
        message: 'Time format',
        showTimestamp: true,
        timestampFormat: TimestampFormat.TIME,
      });

      const isoResult = MessageFormatter.format({
        message: 'ISO format',
        showTimestamp: true,
        timestampFormat: TimestampFormat.ISO,
      });

      expect(timeResult).toContain('[12:34:56]');
      expect(isoResult).toContain('[2023-01-15T12:34:56.789Z]');
    });

    it('should handle prefix alignment correctly', () => {
      // Test prefix alignment with timestamp to trigger the spacing logic
      vi.spyOn(StringUtils, 'formatTime').mockReturnValue('12:34:56');

      const shortPrefix = MessageFormatter.format({
        prefix: 'app',
        maxPrefixLength: 15,
        message: 'Short prefix',
        showTimestamp: true,
        includeLevel: false,
        includePrefix: true,
      });

      const longPrefix = MessageFormatter.format({
        prefix: 'very-long-service-name',
        maxPrefixLength: 15,
        message: 'Long prefix',
        showTimestamp: true,
        includeLevel: false,
        includePrefix: true,
      });

      expect(shortPrefix).toContain('[app]');
      expect(longPrefix).toContain('[very-long-service-name]');

      // Both should have timestamp and proper prefix alignment
      expect(shortPrefix).toContain('[12:34:56]');
      expect(longPrefix).toContain('[12:34:56]');

      // The short prefix should have more leading spaces for alignment
      // Pattern: [timestamp] {spaces}[prefix] message
      const shortMatch = shortPrefix.match(/\[12:34:56\](\s+)\[app\]/);
      const longMatch = longPrefix.match(/\[12:34:56\](\s+)\[very-long-service-name\]/);

      expect(shortMatch).toBeTruthy();
      expect(longMatch).toBeTruthy();

      if (shortMatch && longMatch) {
        const shortSpaces = shortMatch[1].length;
        const longSpaces = longMatch[1].length;
        expect(shortSpaces).toBeGreaterThan(longSpaces);
      }
    });

    it('should handle minimal format for spinners and simple messages', () => {
      const result = MessageFormatter.format({
        theme: { symbol: '⠋', label: 'SPINNER', color: (text: string) => text },
        message: 'Loading...',
        includeLevel: false,
        includePrefix: false,
        showTimestamp: false,
      });

      expect(result).toBe('⠋ Loading...');
      expect(result).not.toContain('SPINNER');
      expect(result).not.toContain('[');
    });

    it('should handle empty messages gracefully', () => {
      const result = MessageFormatter.format({
        theme: mockTheme,
        message: '',
        includeLevel: false,
        includePrefix: false,
      });

      expect(result).toBe('✓'); // trim() removes trailing space from empty message
    });

    it('should handle missing theme gracefully', () => {
      const result = MessageFormatter.format({
        message: 'No theme message',
        includeLevel: false,
        includePrefix: false,
      });

      expect(result).toBe('No theme message');
    });

    it('should handle complex combinations correctly', () => {
      vi.spyOn(StringUtils, 'formatTime').mockReturnValue('09:15:30');

      const result = MessageFormatter.format({
        level: 'error',
        theme: { symbol: '✖', label: 'ERROR', color: (text: string) => `red(${text})` },
        message: 'Critical error occurred',
        args: [{ code: 500, details: 'Server error' }],
        prefix: 'api-server',
        maxPrefixLength: 20,
        showTimestamp: true,
        useColors: true,
        timestampFormat: TimestampFormat.TIME,
        stripEmojis: false,
        includeLevel: true,
        includePrefix: true,
      });

      expect(result).toContain('[09:15:30]');
      expect(result).toContain('red(✖)');
      expect(result).toContain('ERROR');
      expect(result).toContain('[api-server]');
      expect(result).toContain('Critical error occurred');
      expect(result).toContain('code');
      expect(result).toContain('500');
    });

    it('should prioritize environment timestamp over CI when explicitly set', () => {
      vi.spyOn(StringUtils, 'formatTime').mockReturnValue('15:45:30');

      // Test that explicit showTimestamp takes precedence
      const withTimestamp = MessageFormatter.format({
        message: 'Explicit timestamp',
        showTimestamp: true,
      });

      const withoutTimestamp = MessageFormatter.format({
        message: 'No timestamp',
        showTimestamp: false,
      });

      expect(withTimestamp).toContain('[15:45:30]');
      expect(withoutTimestamp).not.toContain('[15:45:30]');
    });
  });

  describe('Format Consistency', () => {
    it('should produce consistent output across multiple calls', () => {
      vi.spyOn(StringUtils, 'formatTime').mockReturnValue('10:20:30');

      const options = {
        level: 'info',
        theme: { symbol: 'ℹ', label: 'INFO', color: (text: string) => text },
        message: 'Consistent message',
        prefix: 'test',
        maxPrefixLength: 10,
        showTimestamp: true,
        useColors: false,
        includeLevel: true,
        includePrefix: true,
      };

      const result1 = MessageFormatter.format(options);
      const result2 = MessageFormatter.format(options);
      const result3 = MessageFormatter.format(options);

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });

    it('should maintain correct component order', () => {
      vi.spyOn(StringUtils, 'formatTime').mockReturnValue('11:22:33');
      setupTestEnvironment(true, true);

      const result = MessageFormatter.format({
        level: 'warn',
        theme: { symbol: '⚠', label: 'WARN', color: (text: string) => text },
        message: 'Order test',
        prefix: 'order',
        maxPrefixLength: 10,
        showTimestamp: true,
        useColors: false,
        includeLevel: true,
        includePrefix: true,
      });

      // Should follow order: [timestamp] LEVEL [prefix] symbol message
      expect(result).toMatch(/\[11:22:33\] WARN\s+\[order\] ⚠ Order test/);
      expect(result).toContain('[11:22:33]');
      expect(result).toContain('WARN   '); // Level is padded to 7 chars
      expect(result).toContain('[order]');
      expect(result).toContain('⚠');
      expect(result).toContain('Order test');
    });
  });
});
