import { ISpinner } from '../types/spinner';
import { MessageFormatter } from '../formatters';
import { SpinnerRenderer } from './spinner-renderer';

/**
 * Spinner implementation that coordinates formatting and display.
 */
export class OraSpinner implements ISpinner {
  private renderer: SpinnerRenderer;
  private isStarted = false;
  private prefix?: string;
  private currentMessage = '';

  constructor() {
    this.renderer = new SpinnerRenderer();
  }

  setPrefix(prefix: string): void {
    this.prefix = prefix;
  }

  start(text: string): void {
    this.stop();
    this.currentMessage = text;

    if (SpinnerRenderer.shouldAnimate()) {
      this.renderer.startAnimation(text, 'task', this.prefix);
    } else {
      const formatted = MessageFormatter.formatSpinnerOutput(text, 'task', this.prefix, 'running');
      this.renderer.renderStatic(formatted.fullText);
    }

    this.isStarted = true;
  }

  stop(): void {
    if (this.renderer.isCurrentlyAnimating()) {
      this.renderer.stopAnimation();
    }
    this.isStarted = false;
  }

  succeed(text?: string): void {
    this.stop();
    if (text) {
      const formatted = MessageFormatter.formatSpinnerOutput(
        text,
        'success',
        this.prefix,
        'success'
      );
      this.renderer.renderStatic(formatted.fullText);
    }
    this.isStarted = false;
  }

  fail(text?: string): void {
    this.stop();
    if (text) {
      const formatted = MessageFormatter.formatSpinnerOutput(text, 'error', this.prefix, 'error');
      this.renderer.renderStatic(formatted.fullText);
    }
    this.isStarted = false;
  }

  warn(text?: string): void {
    this.stop();
    if (text) {
      const formatted = MessageFormatter.formatSpinnerOutput(text, 'warn', this.prefix, 'warning');
      this.renderer.renderStatic(formatted.fullText);
    }
    this.isStarted = false;
  }

  info(text?: string): void {
    this.stop();
    if (text) {
      const formatted = MessageFormatter.formatSpinnerOutput(text, 'info', this.prefix, 'info');
      this.renderer.renderStatic(formatted.fullText);
    }
    this.isStarted = false;
  }

  updateText(text: string): void {
    this.currentMessage = text;
    if (this.renderer.isCurrentlyAnimating()) {
      this.renderer.updateMessage(text);
    }
  }

  isActive(): boolean {
    return this.isStarted;
  }
}
