/**
 * Interface for spinner implementations following Interface Segregation Principle.
 * Defines the contract for both single and multi-spinner implementations.
 */
export interface ISpinner {
  /**
   * Start a spinner with the given text.
   * @param text - The text to display with the spinner
   */
  start(text: string): void;

  /**
   * Stop the spinner without any completion message.
   */
  stop(): void;

  /**
   * Complete the spinner with a success status.
   * @param text - Optional completion text
   */
  succeed(text?: string): void;

  /**
   * Complete the spinner with a failure status.
   * @param text - Optional failure text
   */
  fail(text?: string): void;

  /**
   * Complete the spinner with a warning status.
   * @param text - Optional warning text
   */
  warn(text?: string): void;

  /**
   * Complete the spinner with an info status.
   * @param text - Optional info text
   */
  info(text?: string): void;

  /**
   * Update the spinner text while it's running.
   * @param text - New text to display
   */
  updateText(text: string): void;

  /**
   * Check if the spinner is currently active.
   * @returns True if spinner is running, false otherwise
   */
  isActive(): boolean;

  /**
   * Set the logger prefix for consistent formatting (optional method).
   * Not all spinner implementations may need this.
   * @param prefix - The logger prefix to use
   */
  setPrefix?(prefix: string): void;
}
