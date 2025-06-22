import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger } from '../../src/logger';
import { SpinnerUtils } from '../../src/utils/spinner';

// Mock TTY for consistent testing
Object.defineProperty(process.stdout, 'isTTY', {
  value: true,
  configurable: true,
});

describe('Multiple Spinners Management', () => {
  beforeEach(() => {
    // Enable spinners for testing
    vi.spyOn(SpinnerUtils, 'supportsSpinners').mockReturnValue(true);
    // Clear all spinners before each test
    SpinnerUtils.stopAllSpinners();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    SpinnerUtils.stopAllSpinners();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Global Spinner Management', () => {
    it('should only show one spinner at a time when multiple are started', () => {
      const logger1 = new Logger('app1');
      const logger2 = new Logger('app2');
      const logger3 = new Logger('app3');

      logger1.startSpinner('Task 1');
      logger2.startSpinner('Task 2');
      logger3.startSpinner('Task 3');

      const stats = SpinnerUtils.getSpinnerStats();

      // Should track all 3 spinners
      expect(stats.totalSpinners).toBe(3);

      // But only one should be visually active
      expect(stats.activeSpinner).toBeTruthy();
      expect(stats.activeSpinner).toMatch(/^(app1|app2|app3)$/);

      // Should have all keys registered
      const activeKeys = SpinnerUtils.getActiveSpinnerKeys();
      expect(activeKeys).toHaveLength(3);
      expect(activeKeys).toContain('app1');
      expect(activeKeys).toContain('app2');
      expect(activeKeys).toContain('app3');
    });

    it('should start rotation cycle when multiple spinners are active', () => {
      const logger1 = new Logger('app1');
      const logger2 = new Logger('app2');

      logger1.startSpinner('Task 1');

      let stats = SpinnerUtils.getSpinnerStats();
      expect(stats.hasRotationCycle).toBe(false); // No rotation with single spinner

      logger2.startSpinner('Task 2');

      stats = SpinnerUtils.getSpinnerStats();
      expect(stats.hasRotationCycle).toBe(true); // Should start rotation with multiple spinners
    });

    it('should rotate between spinners automatically', async () => {
      const logger1 = new Logger('app1');
      const logger2 = new Logger('app2');

      logger1.startSpinner('Task 1');
      logger2.startSpinner('Task 2');

      const initialActive = SpinnerUtils.getCurrentActiveSpinner();
      expect(initialActive).toBeTruthy();

      // Fast-forward rotation interval (2 seconds)
      vi.advanceTimersByTime(2000);

      const newActive = SpinnerUtils.getCurrentActiveSpinner();
      expect(newActive).toBeTruthy();

      // The rotation might stay on the same spinner if it was recently updated
      // So we test that rotation is working by advancing more time
      vi.advanceTimersByTime(2000);

      const finalActive = SpinnerUtils.getCurrentActiveSpinner();
      expect(finalActive).toBeTruthy();

      // At least one of the rotations should have switched
      const hasRotated = newActive !== initialActive || finalActive !== newActive;
      expect(hasRotated).toBe(true);
    });

    it('should stop rotation when only one spinner remains', () => {
      const logger1 = new Logger('app1');
      const logger2 = new Logger('app2');

      logger1.startSpinner('Task 1');
      logger2.startSpinner('Task 2');

      let stats = SpinnerUtils.getSpinnerStats();
      expect(stats.hasRotationCycle).toBe(true);

      // Stop one spinner
      logger1.stopSpinner();

      stats = SpinnerUtils.getSpinnerStats();
      expect(stats.hasRotationCycle).toBe(false); // Should stop rotation
      expect(stats.totalSpinners).toBe(1);
    });

    it('should activate next available spinner when current one stops', () => {
      const logger1 = new Logger('app1');
      const logger2 = new Logger('app2');
      const logger3 = new Logger('app3');

      logger1.startSpinner('Task 1');
      logger2.startSpinner('Task 2');
      logger3.startSpinner('Task 3');

      const initialActive = SpinnerUtils.getCurrentActiveSpinner();
      expect(initialActive).toBeTruthy();

      // Stop the currently active spinner
      if (initialActive) {
        SpinnerUtils.stop(initialActive);
      }

      const newActive = SpinnerUtils.getCurrentActiveSpinner();
      expect(newActive).toBeTruthy();
      expect(newActive).not.toBe(initialActive);
      expect(SpinnerUtils.getSpinnerStats().totalSpinners).toBe(2);
    });
  });

  describe('Text Updates with Multiple Spinners', () => {
    it('should update text for active spinner immediately', () => {
      const logger1 = new Logger('app1');
      const logger2 = new Logger('app2');

      logger1.startSpinner('Task 1');
      logger2.startSpinner('Task 2');

      const activeSpinner = SpinnerUtils.getCurrentActiveSpinner();

      if (activeSpinner === 'app1') {
        logger1.updateSpinnerText('Updated Task 1');
        // Text should be updated immediately for active spinner
        expect(SpinnerUtils.getSpinner('app1')?.text).toBe('Updated Task 1');
      } else {
        logger2.updateSpinnerText('Updated Task 2');
        expect(SpinnerUtils.getSpinner('app2')?.text).toBe('Updated Task 2');
      }
    });

    it('should store text updates for inactive spinners', () => {
      const logger1 = new Logger('app1');
      const logger2 = new Logger('app2');

      logger1.startSpinner('Task 1');
      logger2.startSpinner('Task 2');

      // Update both spinners
      logger1.updateSpinnerText('Updated Task 1');
      logger2.updateSpinnerText('Updated Task 2');

      // Both should have their text stored (even if not currently displayed)
      const spinner1 = SpinnerUtils.getSpinner('app1');
      const spinner2 = SpinnerUtils.getSpinner('app2');

      expect(spinner1).toBeTruthy();
      expect(spinner2).toBeTruthy();
    });

    it('should show updated text when spinner becomes active', () => {
      const logger1 = new Logger('app1');
      const logger2 = new Logger('app2');

      logger1.startSpinner('Task 1');
      logger2.startSpinner('Task 2');

      // Update text for potentially inactive spinner
      logger1.updateSpinnerText('Updated Task 1');
      logger2.updateSpinnerText('Updated Task 2');

      // Advance time to trigger rotation
      vi.advanceTimersByTime(1500);

      // Both spinners should maintain their updated text
      const activeSpinner = SpinnerUtils.getCurrentActiveSpinner();
      if (activeSpinner) {
        const spinner = SpinnerUtils.getSpinner(activeSpinner);
        expect(spinner?.text).toContain('Updated');
      }
    });
  });

  describe('Spinner Completion with Multiple Spinners', () => {
    it('should complete specific spinner and continue with others', () => {
      const logger1 = new Logger('app1');
      const logger2 = new Logger('app2');
      const logger3 = new Logger('app3');

      logger1.startSpinner('Task 1');
      logger2.startSpinner('Task 2');
      logger3.startSpinner('Task 3');

      expect(SpinnerUtils.getSpinnerStats().totalSpinners).toBe(3);

      // Complete one spinner
      logger1.succeedSpinner('Task 1 done');

      const stats = SpinnerUtils.getSpinnerStats();
      expect(stats.totalSpinners).toBe(2);
      expect(SpinnerUtils.getActiveSpinnerKeys()).not.toContain('app1');
      expect(stats.activeSpinner).toBeTruthy(); // Should still have an active spinner
    });

    it('should stop rotation when completing down to one spinner', () => {
      const logger1 = new Logger('app1');
      const logger2 = new Logger('app2');

      logger1.startSpinner('Task 1');
      logger2.startSpinner('Task 2');

      expect(SpinnerUtils.getSpinnerStats().hasRotationCycle).toBe(true);

      // Complete one spinner
      logger1.succeedSpinner('Task 1 done');

      const stats = SpinnerUtils.getSpinnerStats();
      expect(stats.hasRotationCycle).toBe(false); // Should stop rotation
      expect(stats.totalSpinners).toBe(1);
    });

    it('should clear all state when all spinners complete', () => {
      const logger1 = new Logger('app1');
      const logger2 = new Logger('app2');

      logger1.startSpinner('Task 1');
      logger2.startSpinner('Task 2');

      logger1.succeedSpinner('Task 1 done');
      logger2.succeedSpinner('Task 2 done');

      const stats = SpinnerUtils.getSpinnerStats();
      expect(stats.totalSpinners).toBe(0);
      expect(stats.activeSpinner).toBeNull();
      expect(stats.hasRotationCycle).toBe(false);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle stopping non-existent spinner gracefully', () => {
      expect(() => {
        SpinnerUtils.stop('non-existent');
      }).not.toThrow();

      const stats = SpinnerUtils.getSpinnerStats();
      expect(stats.totalSpinners).toBe(0);
    });

    it('should handle updating text of non-existent spinner gracefully', () => {
      expect(() => {
        SpinnerUtils.updateText('non-existent', 'new text');
      }).not.toThrow();
    });

    it('should handle restarting same spinner key', () => {
      const logger = new Logger('app1');

      logger.startSpinner('Task 1');
      expect(SpinnerUtils.getSpinnerStats().totalSpinners).toBe(1);

      // Restart same spinner
      logger.startSpinner('Task 1 Restarted');
      expect(SpinnerUtils.getSpinnerStats().totalSpinners).toBe(1); // Should replace, not add
      expect(SpinnerUtils.getCurrentActiveSpinner()).toBe('app1');
    });

    it('should clean up properly with stopAllSpinners', () => {
      const logger1 = new Logger('app1');
      const logger2 = new Logger('app2');
      const logger3 = new Logger('app3');

      logger1.startSpinner('Task 1');
      logger2.startSpinner('Task 2');
      logger3.startSpinner('Task 3');

      expect(SpinnerUtils.getSpinnerStats().totalSpinners).toBe(3);

      SpinnerUtils.stopAllSpinners();

      const stats = SpinnerUtils.getSpinnerStats();
      expect(stats.totalSpinners).toBe(0);
      expect(stats.activeSpinner).toBeNull();
      expect(stats.hasRotationCycle).toBe(false);
    });

    it('should handle rapid start/stop operations', () => {
      const logger1 = new Logger('app1');
      const logger2 = new Logger('app2');

      // Rapid operations
      logger1.startSpinner('Task 1');
      logger2.startSpinner('Task 2');
      logger1.stopSpinner();
      logger1.startSpinner('Task 1 Again');
      logger2.stopSpinner();

      const stats = SpinnerUtils.getSpinnerStats();
      expect(stats.totalSpinners).toBe(1);
      expect(stats.activeSpinner).toBe('app1');
      expect(stats.hasRotationCycle).toBe(false);
    });
  });

  describe('Integration with Logger Methods', () => {
    it('should work correctly with logger spinner methods', () => {
      const logger1 = new Logger('logger1');
      const logger2 = new Logger('logger2');

      // Test all spinner methods
      logger1.startSpinner('Processing...');
      logger2.startSpinner('Loading...');

      expect(SpinnerUtils.getSpinnerStats().totalSpinners).toBe(2);

      logger1.updateSpinnerText('Still processing...');
      logger2.updateSpinnerText('Still loading...');

      logger1.succeedSpinner('Done processing');
      expect(SpinnerUtils.getSpinnerStats().totalSpinners).toBe(1);

      logger2.failSpinner('Failed to load');
      expect(SpinnerUtils.getSpinnerStats().totalSpinners).toBe(0);
    });

    it('should maintain proper isolation between different logger instances', () => {
      const logger1 = new Logger('service1');
      const logger2 = new Logger('service2');

      logger1.startSpinner('Service 1 task');
      logger2.startSpinner('Service 2 task');

      // Each logger should control its own spinner
      logger1.updateSpinnerText('Service 1 updated');
      logger2.updateSpinnerText('Service 2 updated');

      // Completing one should not affect the other
      logger1.succeedSpinner('Service 1 complete');

      const stats = SpinnerUtils.getSpinnerStats();
      expect(stats.totalSpinners).toBe(1);
      expect(stats.activeSpinner).toBe('service2');
    });
  });

  describe('Spinner Artifact Prevention', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      SpinnerUtils.stopAllSpinners();

      // Mock TTY and spinner support for testing
      Object.defineProperty(process.stdout, 'isTTY', {
        value: true,
        configurable: true,
      });
      vi.spyOn(SpinnerUtils, 'supportsSpinners').mockReturnValue(true);
    });

    it('should prevent artifacts when multiple spinners complete in sequence', () => {
      const logger1 = new Logger('artifact1');
      const logger2 = new Logger('artifact2');
      const logger3 = new Logger('artifact3');

      // Mock spinner instances with clear tracking
      const mockSpinners = [
        { start: vi.fn(), stop: vi.fn(), clear: vi.fn(), text: '' },
        { start: vi.fn(), stop: vi.fn(), clear: vi.fn(), text: '' },
        { start: vi.fn(), stop: vi.fn(), clear: vi.fn(), text: '' },
      ];

      let spinnerIndex = 0;
      vi.spyOn(SpinnerUtils, 'create').mockImplementation(() => {
        return mockSpinners[spinnerIndex++] as any;
      });

      // Start multiple spinners
      logger1.startSpinner('Security audit...');
      logger2.startSpinner('Performance check...');
      logger3.startSpinner('Build process...');

      // Complete them in different ways
      logger1.warnSpinner('SECURITY completed with warnings');
      logger2.succeedSpinner('PERF passed');
      logger3.failSpinner('BUILD failed');

      // Verify all spinners were properly cleared to prevent artifacts
      mockSpinners.forEach((spinner, index) => {
        expect(spinner.clear).toHaveBeenCalled();
        expect(spinner.stop).toHaveBeenCalled();

        // Verify clear was called after stop for proper cleanup order
        if (
          spinner.stop.mock.invocationCallOrder.length > 0 &&
          spinner.clear.mock.invocationCallOrder.length > 0
        ) {
          const stopOrder = spinner.stop.mock.invocationCallOrder[0];
          const clearOrder = spinner.clear.mock.invocationCallOrder[0];
          expect(clearOrder).toBeGreaterThanOrEqual(stopOrder);
        }
      });
    });

    it('should clear artifacts during spinner rotation', () => {
      const logger1 = new Logger('rotate1');
      const logger2 = new Logger('rotate2');

      const mockSpinner1 = { start: vi.fn(), stop: vi.fn(), clear: vi.fn(), text: '' };
      const mockSpinner2 = { start: vi.fn(), stop: vi.fn(), clear: vi.fn(), text: '' };

      let callCount = 0;
      vi.spyOn(SpinnerUtils, 'create').mockImplementation(() => {
        callCount++;
        return callCount === 1 ? (mockSpinner1 as any) : (mockSpinner2 as any);
      });

      // Start multiple spinners (triggers rotation)
      logger1.startSpinner('Task 1');
      logger2.startSpinner('Task 2');

      // Simulate rotation by advancing time
      vi.advanceTimersByTime(2000);

      // Complete one spinner (should clear properly)
      logger1.succeedSpinner('Task 1 complete');

      // Verify the completed spinner was cleared
      expect(mockSpinner1.clear).toHaveBeenCalled();
    });

    it('should handle rapid completion without artifacts', () => {
      const loggers = Array.from({ length: 5 }, (_, i) => new Logger(`rapid${i}`));
      const mockSpinners = Array.from({ length: 5 }, () => ({
        start: vi.fn(),
        stop: vi.fn(),
        clear: vi.fn(),
        text: '',
      }));

      let spinnerIndex = 0;
      vi.spyOn(SpinnerUtils, 'create').mockImplementation(() => {
        return mockSpinners[spinnerIndex++] as any;
      });

      // Start all spinners rapidly
      loggers.forEach((logger, i) => {
        logger.startSpinner(`Rapid task ${i}`);
      });

      // Complete all spinners rapidly
      loggers.forEach((logger, i) => {
        logger.succeedSpinner(`Rapid task ${i} done`);
      });

      // Verify all spinners were properly cleared
      mockSpinners.forEach(spinner => {
        expect(spinner.clear).toHaveBeenCalled();
      });

      // Verify no spinners are left in the system
      expect(SpinnerUtils.getActiveSpinnerKeys()).toHaveLength(0);
    });
  });
});
