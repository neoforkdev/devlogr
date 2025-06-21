import ora, { Ora } from 'ora';
import { EmojiUtils } from './emoji';
import { TerminalUtils } from './terminal';
import { MessageFormatter } from '../formatters';
import { PrefixTracker } from '../tracker';
import { LogTheme, TimestampFormat } from '../types';

// ============================================================================
// SPINNER UTILITY
// ============================================================================

export interface SpinnerOptions {
  text?: string;
  symbol?: string;
  color?: string;
  prefixText?: string;
  indent?: number;
  discardStdin?: boolean;
  hideCursor?: boolean;
  // New options for enhanced formatting
  prefix?: string;
  showTimestamp?: boolean;
  useColors?: boolean;
  level?: string;
  theme?: LogTheme;
  timestampFormat?: TimestampFormat;
}

/**
 * Spinner utility that integrates with devlogr's emoji and terminal detection
 */
export class SpinnerUtils {
  private static activeSpinners = new Map<string, Ora>();

  /**
   * Create a new spinner with devlogr's terminal detection
   */
  static create(options: SpinnerOptions = {}): Ora {
    // Create formatted prefix if needed
    let prefixText = options.prefixText || '';
    if (options.prefix && options.showTimestamp && options.level && options.theme) {
      const maxPrefixLength = PrefixTracker.getMaxLength();
      prefixText = MessageFormatter.formatSpinnerPrefixWithLevel(
        options.level,
        options.theme,
        options.prefix, 
        maxPrefixLength, 
        options.showTimestamp || false, 
        options.useColors ?? true,
        options.timestampFormat || TimestampFormat.TIME
      );
    } else if (options.prefix && options.showTimestamp) {
      const maxPrefixLength = PrefixTracker.getMaxLength();
      prefixText = MessageFormatter.formatBasicPrefix(
        options.prefix, 
        maxPrefixLength, 
        options.showTimestamp || false, 
        options.useColors ?? true,
        options.timestampFormat || TimestampFormat.TIME
      );
    }

    const spinnerOptions: any = {
      text: options.text || '',
      color: options.color || 'cyan',
      prefixText: prefixText,
      indent: options.indent || 0,
      discardStdin: options.discardStdin ?? true,
      hideCursor: options.hideCursor ?? true,
    };

    // Use emoji-aware spinner if supported
    if (options.symbol) {
      spinnerOptions.spinner = options.symbol;
    } else if (EmojiUtils.supportsEmoji()) {
      // Use Unicode spinner for emoji-capable terminals
      spinnerOptions.spinner = {
        interval: 80,
        frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
      };
    } else {
      // Fallback to ASCII spinner
      spinnerOptions.spinner = {
        interval: 80,
        frames: ['|', '/', '-', '\\']
      };
    }

    return ora(spinnerOptions);
  }

  /**
   * Start a named spinner (for tracking multiple spinners)
   */
  static start(key: string, options: SpinnerOptions = {}): Ora {
    // Stop any existing spinner with this key
    SpinnerUtils.stop(key);
    
    const spinner = SpinnerUtils.create(options);
    spinner.start();
    
    SpinnerUtils.activeSpinners.set(key, spinner);
    return spinner;
  }

  /**
   * Stop a named spinner
   */
  static stop(key: string): void {
    const spinner = SpinnerUtils.activeSpinners.get(key);
    if (spinner) {
      spinner.stop();
      SpinnerUtils.activeSpinners.delete(key);
    }
  }

  /**
   * Update text of a named spinner
   */
  static updateText(key: string, text: string): void {
    const spinner = SpinnerUtils.activeSpinners.get(key);
    if (spinner) {
      spinner.text = text;
    }
  }

  /**
   * Private helper to handle spinner completion - DRY principle
   */
  private static completeSpinner(key: string, text?: string): string | undefined {
    const spinner = SpinnerUtils.activeSpinners.get(key);
    if (spinner) {
      spinner.stop();
      SpinnerUtils.activeSpinners.delete(key);
      return text;
    }
    return undefined;
  }

  /**
   * Success a named spinner - stops spinner and returns success message for logger
   */
  static succeed(key: string, text?: string): string | undefined {
    return SpinnerUtils.completeSpinner(key, text);
  }

  /**
   * Fail a named spinner - stops spinner and returns failure message for logger
   */
  static fail(key: string, text?: string): string | undefined {
    return SpinnerUtils.completeSpinner(key, text);
  }

  /**
   * Warn a named spinner - stops spinner and returns warning message for logger
   */
  static warn(key: string, text?: string): string | undefined {
    return SpinnerUtils.completeSpinner(key, text);
  }

  /**
   * Info a named spinner - stops spinner and returns info message for logger
   */
  static info(key: string, text?: string): string | undefined {
    return SpinnerUtils.completeSpinner(key, text);
  }

  /**
   * Get a named spinner by key
   */
  static getSpinner(key: string): Ora | undefined {
    return SpinnerUtils.activeSpinners.get(key);
  }

  /**
   * Stop all active spinners
   */
  static stopAllSpinners(): void {
    for (const [key] of SpinnerUtils.activeSpinners) {
      SpinnerUtils.stop(key);
    }
  }

  /**
   * Get all active spinner keys
   */
  static getActiveSpinnerKeys(): string[] {
    return Array.from(SpinnerUtils.activeSpinners.keys());
  }

  /**
   * Check if spinners are supported in current environment
   */
  static supportsSpinners(): boolean {
    return TerminalUtils.supportsColor() && process.stdout.isTTY && !process.env.DEVLOGR_OUTPUT_JSON;
  }
} 