/**
 * @fileoverview Core type definitions for DevLogr
 * 
 * This module defines the fundamental types, enumerations, and interfaces
 * used throughout the DevLogr logging system.
 */

// ============================================================================
// LOG LEVELS - Message Priority and Visibility
// ============================================================================

/**
 * Log level enumeration defining message priority and visibility.
 * Messages at or above the configured level will be shown.
 */
export enum LogLevel {
  /** Critical errors that require immediate attention */
  ERROR = 'error',
  
  /** Warning messages about potential issues */
  WARNING = 'warn',
  
  /** General informational messages (default level) */
  INFO = 'info',
  
  /** Detailed diagnostic information for debugging */
  DEBUG = 'debug',
  
  /** Highly detailed trace information for deep debugging */
  TRACE = 'trace',
}

// ============================================================================
// TIMESTAMP FORMATTING - Time Display Options
// ============================================================================

/**
 * Timestamp format options for log messages.
 */
export enum TimestampFormat {
  /** Simple time format: HH:MM:SS (default) */
  TIME = 'time',
  
  /** ISO 8601 format: YYYY-MM-DDTHH:MM:SS.sssZ */
  ISO = 'iso',
}

// ============================================================================
// THEME CONFIGURATION - Visual Styling
// ============================================================================

/**
 * Theme configuration for log message appearance.
 */
export interface LogTheme {
  /** Unicode symbol or ASCII character displayed before the message */
  readonly symbol: string;
  
  /** Color function to apply styling to the message text */
  readonly color: (text: string) => string;
  
  /** Text label identifying the log level or message type */
  readonly label: string;
}

// ============================================================================
// LOGGER CONFIGURATION - Runtime Settings
// ============================================================================

/**
 * Complete configuration object for logger behavior.
 * Typically derived from environment variables and terminal detection.
 */
export interface LogConfig {
  /** Minimum log level to display messages */
  readonly level: LogLevel;
  
  /** Whether to output structured JSON instead of formatted text */
  readonly useJson: boolean;
  
  /** Whether to use ANSI color codes in output */
  readonly useColors: boolean;
  
  /** Whether the terminal supports Unicode characters and emojis */
  readonly supportsUnicode: boolean;
  
  /** Whether to include timestamps in log messages */
  readonly showTimestamp: boolean;
  
  /** Format to use for timestamp display when enabled */
  readonly timestampFormat: TimestampFormat;
}
