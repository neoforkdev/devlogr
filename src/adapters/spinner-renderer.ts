import { TerminalUtils } from '../utils/terminal';
import { MessageFormatter } from '../formatters';

/**
 * Handles visual rendering of animated spinners.
 */
export class SpinnerRenderer {
  private animationFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private frameIndex = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private isAnimating = false;
  private currentMessage = '';
  private currentLevel = '';
  private currentPrefix?: string;

  renderStatic(fullText: string): void {
    console.log(fullText);
  }

  startAnimation(message: string, level: string, prefix?: string): void {
    this.stopAnimation();

    this.currentMessage = message;
    this.currentLevel = level;
    this.currentPrefix = prefix;
    this.frameIndex = 0;
    this.isAnimating = true;

    this.renderFrame();

    this.timer = setInterval(() => {
      this.frameIndex = (this.frameIndex + 1) % this.animationFrames.length;
      this.renderFrame();
    }, 80); // 80ms for smooth animation
  }

  stopAnimation(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    if (this.isAnimating && process.stdout.isTTY) {
      process.stdout.write('\r\x1b[K');
    }

    this.isAnimating = false;
  }

  updateMessage(newMessage: string): void {
    if (this.isAnimating) {
      this.currentMessage = newMessage;
      this.renderFrame();
    }
  }

  isCurrentlyAnimating(): boolean {
    return this.isAnimating;
  }

  private renderFrame(): void {
    if (!this.isAnimating || !process.stdout.isTTY) {
      return;
    }

    const currentIcon = this.animationFrames[this.frameIndex];

    const animatedLine = MessageFormatter.formatSpinnerOutputWithCustomIcon(
      this.currentMessage,
      this.currentLevel,
      this.currentPrefix,
      currentIcon
    );

    process.stdout.write(`\r\x1b[K${animatedLine}`);
  }

  static shouldAnimate(): boolean {
    return TerminalUtils.supportsColor() && !!process.stdout.isTTY;
  }
}
