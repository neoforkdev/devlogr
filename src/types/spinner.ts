/**
 * Interface for spinner implementations.
 */
export interface ISpinner {
  start(text: string): void;

  stop(): void;

  succeed(text?: string): void;

  fail(text?: string): void;

  warn(text?: string): void;

  info(text?: string): void;

  updateText(text: string): void;

  isActive(): boolean;

  setPrefix?(prefix: string): void;
}
