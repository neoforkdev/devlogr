'use strict';
/**
 * @fileoverview Core type definitions for DevLogr
 *
 * This module defines the fundamental types, enumerations, and interfaces
 * used throughout the DevLogr logging system.
 */
Object.defineProperty(exports, '__esModule', { value: true });
exports.TimestampFormat = exports.LogLevel = void 0;
// ============================================================================
// LOG LEVELS - Message Priority and Visibility
// ============================================================================
/**
 * Log level enumeration defining message priority and visibility.
 * Messages at or above the configured level will be shown.
 */
var LogLevel;
(function (LogLevel) {
  /** Critical errors that require immediate attention */
  LogLevel['ERROR'] = 'error';
  /** Warning messages about potential issues */
  LogLevel['WARNING'] = 'warn';
  /** General informational messages (default level) */
  LogLevel['INFO'] = 'info';
  /** Detailed diagnostic information for debugging */
  LogLevel['DEBUG'] = 'debug';
  /** Highly detailed trace information for deep debugging */
  LogLevel['TRACE'] = 'trace';
})(LogLevel || (exports.LogLevel = LogLevel = {}));
// ============================================================================
// TIMESTAMP FORMATTING - Time Display Options
// ============================================================================
/**
 * Timestamp format options for log messages.
 */
var TimestampFormat;
(function (TimestampFormat) {
  /** Simple time format: HH:MM:SS (default) */
  TimestampFormat['TIME'] = 'time';
  /** ISO 8601 format: YYYY-MM-DDTHH:MM:SS.sssZ */
  TimestampFormat['ISO'] = 'iso';
})(TimestampFormat || (exports.TimestampFormat = TimestampFormat = {}));
