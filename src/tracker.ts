// ============================================================================
// PREFIX TRACKING
// ============================================================================

export class PrefixTracker {
  private static maxLength = 0;

  /**
   * Registers a new prefix and updates max length
   */
  static register(prefix: string): void {
    this.maxLength = Math.max(this.maxLength, prefix.length);
  }

  /**
   * Gets the maximum prefix length registered
   */
  static getMaxLength(): number {
    return this.maxLength;
  }

  /**
   * Resets the tracker (useful for testing)
   */
  static reset(): void {
    this.maxLength = 0;
  }
}
