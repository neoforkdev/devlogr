import { TerminalUtils } from '../utils/terminal';
import { MessageFormatter } from '../formatters';

/**
 * SpinnerRenderer handles the visual rendering of spinners.
 * Follows Single Responsibility Principle - only concerned with display logic.
 * Environment detection and formatting delegated to existing systems.
 */
export class SpinnerRenderer {
  private animationFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private frameIndex = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private isAnimating = false;
  private currentMessage = '';
  private currentLevel = '';
  private currentPrefix?: string;

  /**
   * Render a static spinner message (for CI environments or completion messages).
   * Uses MessageFormatter for consistent output.
   */
  renderStatic(fullText: string): void {
    console.log(fullText);
  }

  /**
   * Start animated spinner rendering (for TTY environments).
   * Uses MessageFormatter to generate properly colored and spaced output for each frame.
   */
  startAnimation(message: string, level: string, prefix?: string): void {
    this.stopAnimation(); // Ensure clean state

    this.currentMessage = message;
    this.currentLevel = level;
    this.currentPrefix = prefix;
    this.frameIndex = 0;
    this.isAnimating = true;

    // Initial render
    this.renderFrame();

    // Start animation timer
    this.timer = setInterval(() => {
      this.frameIndex = (this.frameIndex + 1) % this.animationFrames.length;
      this.renderFrame();
    }, 80); // 80ms for smooth animation
  }

  /**
   * Stop animation and clear the spinner line.
   */
  stopAnimation(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    if (this.isAnimating && process.stdout.isTTY) {
      // Clear the current line
      process.stdout.write('\r\x1b[K');
    }

    this.isAnimating = false;
  }

  /**
   * Update the message text of a running animation.
   */
  updateMessage(newMessage: string): void {
    if (this.isAnimating) {
      this.currentMessage = newMessage;
      this.renderFrame();
    }
  }

  /**
   * Check if currently animating.
   */
  isCurrentlyAnimating(): boolean {
    return this.isAnimating;
  }

  /**
   * Render a single animation frame.
   * Uses MessageFormatter to maintain consistent formatting and coloring.
   */
  private renderFrame(): void {
    if (!this.isAnimating || !process.stdout.isTTY) {
      return;
    }

    // Get current animation frame
    const currentIcon = this.animationFrames[this.frameIndex];

    // Use MessageFormatter to generate properly formatted output with current animation frame
    const animatedLine = MessageFormatter.formatSpinnerOutputWithCustomIcon(
      this.currentMessage,
      this.currentLevel,
      this.currentPrefix,
      currentIcon
    );

    // Clear line and write new content - \r moves to start, \x1b[K clears to end
    process.stdout.write(`\r\x1b[K${animatedLine}`);
  }

  /**
   * Determine if we should use animation or static rendering.
   * Delegates to existing utilities (Dependency Inversion Principle).
   */
  static shouldAnimate(): boolean {
    return TerminalUtils.supportsColor() && !!process.stdout.isTTY;
  }
}
