'use strict';
// ============================================================================
// PREFIX TRACKING
// ============================================================================
Object.defineProperty(exports, '__esModule', { value: true });
exports.PrefixTracker = void 0;
class PrefixTracker {
  /**
   * Registers a new prefix and updates max length
   */
  static register(prefix) {
    this.maxLength = Math.max(this.maxLength, prefix.length);
  }
  /**
   * Gets the maximum prefix length registered
   */
  static getMaxLength() {
    return this.maxLength;
  }
  /**
   * Resets the tracker (useful for testing)
   */
  static reset() {
    this.maxLength = 0;
  }
}
exports.PrefixTracker = PrefixTracker;
PrefixTracker.maxLength = 0;
