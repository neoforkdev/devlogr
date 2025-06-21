// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export enum LogLevel {
  ERROR = 'error',
  WARNING = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace',
}

export enum TimestampFormat {
  TIME = 'time', // HH:MM:SS (default)
  ISO = 'iso', // ISO 8601 format
}

export interface LogTheme {
  readonly symbol: string;
  readonly color: (text: string) => string;
  readonly label: string;
}

export interface LogConfig {
  readonly level: LogLevel;
  readonly useJson: boolean;
  readonly useColors: boolean;
  readonly supportsUnicode: boolean;
  readonly showTimestamp: boolean;
  readonly timestampFormat: TimestampFormat;
}
