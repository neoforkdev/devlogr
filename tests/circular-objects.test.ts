import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StringUtils } from '../src/utils/string';
import { createLogger } from '../src/logger';

describe('Circular Object Handling', () => {
  // Store original environment variables
  const originalEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    // Save current environment variables
    ['DEVLOGR_OUTPUT_JSON', 'DEVLOGR_LOG_LEVEL'].forEach(key => {
      originalEnv[key] = process.env[key];
      delete process.env[key];
    });
  });

  afterEach(() => {
    // Restore original environment variables
    Object.keys(originalEnv).forEach(key => {
      if (originalEnv[key] !== undefined) {
        process.env[key] = originalEnv[key];
      } else {
        delete process.env[key];
      }
    });
  });

  describe('StringUtils.safeJsonStringify', () => {
    it('should handle simple circular references', () => {
      const obj: any = { name: 'test', id: 123 };
      obj.self = obj;

      const result = StringUtils.safeJsonStringify(obj);
      const parsed = JSON.parse(result);

      expect(parsed.name).toBe('test');
      expect(parsed.id).toBe(123);
      expect(parsed.self).toBe('[Circular Reference]');
    });

    it('should handle nested circular references', () => {
      const obj: any = { name: 'parent' };
      obj.child = { name: 'child', parent: obj };
      obj.nested = { deep: { reference: obj } };

      const result = StringUtils.safeJsonStringify(obj);
      const parsed = JSON.parse(result);

      expect(parsed.name).toBe('parent');
      expect(parsed.child.name).toBe('child');
      expect(parsed.child.parent).toBe('[Circular Reference]');
      expect(parsed.nested.deep.reference).toBe('[Circular Reference]');
    });

    it('should handle multiple circular references in arrays', () => {
      const obj: any = { name: 'test' };
      obj.items = [obj, { ref: obj }, obj];

      const result = StringUtils.safeJsonStringify(obj);
      const parsed = JSON.parse(result);

      expect(parsed.name).toBe('test');
      expect(parsed.items[0]).toBe('[Circular Reference]');
      expect(parsed.items[1].ref).toBe('[Circular Reference]');
      expect(parsed.items[2]).toBe('[Circular Reference]');
    });

    it('should handle Error objects in circular structures', () => {
      const error = new Error('Test error');
      const obj: any = { name: 'test', error };
      obj.self = obj;

      const result = StringUtils.safeJsonStringify(obj);
      const parsed = JSON.parse(result);

      expect(parsed.name).toBe('test');
      expect(parsed.error.name).toBe('Error');
      expect(parsed.error.message).toBe('Test error');
      expect(parsed.error.stack).toContain('Test error');
      expect(parsed.self).toBe('[Circular Reference]');
    });

    it('should handle Date objects in circular structures', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      const obj: any = { name: 'test', created: date };
      obj.self = obj;

      const result = StringUtils.safeJsonStringify(obj);
      const parsed = JSON.parse(result);

      expect(parsed.name).toBe('test');
      expect(parsed.created).toBe('2024-01-01T00:00:00.000Z');
      expect(parsed.self).toBe('[Circular Reference]');
    });

    it('should handle complex nested circular structures', () => {
      const root: any = { name: 'root' };
      const branch1: any = { name: 'branch1', parent: root };
      const branch2: any = { name: 'branch2', parent: root };
      const leaf: any = { name: 'leaf', parents: [branch1, branch2] };

      root.children = [branch1, branch2];
      branch1.sibling = branch2;
      branch2.sibling = branch1;
      branch1.child = leaf;
      branch2.child = leaf;
      leaf.root = root;

      const result = StringUtils.safeJsonStringify(root);
      const parsed = JSON.parse(result);

      expect(parsed.name).toBe('root');
      expect(parsed.children).toHaveLength(2);
      expect(parsed.children[0].name).toBe('branch1');
      expect(parsed.children[0].parent).toBe('[Circular Reference]');
      expect(parsed.children[0].sibling.name).toBe('branch2');
      // The leaf object appears in branch1.sibling.child first, so branch1.child becomes circular
      expect(parsed.children[0].sibling.child.name).toBe('leaf');
      expect(parsed.children[0].child).toBe('[Circular Reference]');
      expect(parsed.children[1]).toBe('[Circular Reference]'); // branch2 is circular
    });

    it('should handle null and primitive values correctly', () => {
      const obj: any = {
        str: 'hello',
        num: 42,
        bool: true,
        null: null,
        undefined: undefined,
      };
      obj.self = obj;

      const result = StringUtils.safeJsonStringify(obj);
      const parsed = JSON.parse(result);

      expect(parsed.str).toBe('hello');
      expect(parsed.num).toBe(42);
      expect(parsed.bool).toBe(true);
      expect(parsed.null).toBe(null);
      expect(parsed.undefined).toBeUndefined();
      expect(parsed.self).toBe('[Circular Reference]');
    });

    it('should use custom indentation', () => {
      const obj: any = { name: 'test' };
      obj.self = obj;

      const result = StringUtils.safeJsonStringify(obj, 4);

      expect(result).toContain('    "name": "test"');
      expect(result).toContain('    "self": "[Circular Reference]"');
    });
  });

  describe('StringUtils.formatArgs with circular objects', () => {
    it('should format circular objects in arguments', () => {
      const obj: any = { name: 'test', id: 123 };
      obj.self = obj;

      const result = StringUtils.formatArgs([obj]);

      expect(result).toContain('"name": "test"');
      expect(result).toContain('"id": 123');
      expect(result).toContain('"self": "[Circular Reference]"');
    });

    it('should handle mixed arguments with circular objects', () => {
      const obj: any = { name: 'test' };
      obj.self = obj;

      const result = StringUtils.formatArgs(['prefix', obj, 42, true]);

      expect(result).toContain(' prefix');
      expect(result).toContain('"name": "test"');
      expect(result).toContain('"self": "[Circular Reference]"');
      expect(result).toContain(' 42');
      expect(result).toContain(' true');
    });
  });

  describe('Logger integration with circular objects', () => {
    it('should log circular objects in regular mode without crashing', () => {
      const logger = createLogger('test');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const obj: any = { name: 'test', id: 123 };
      obj.self = obj;

      expect(() => {
        logger.info('Circular object:', obj);
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalled();
      const loggedContent = consoleSpy.mock.calls[0][0];
      expect(loggedContent).toContain('Circular object:');
      expect(loggedContent).toContain('"name": "test"');
      expect(loggedContent).toContain('[Circular Reference]');

      consoleSpy.mockRestore();
    });

    it('should log circular objects in JSON mode without crashing', () => {
      process.env.DEVLOGR_OUTPUT_JSON = 'true';

      const logger = createLogger('test');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const obj: any = { name: 'test', id: 123 };
      obj.self = obj;
      obj.nested = { parent: obj };

      expect(() => {
        logger.info('Circular object:', obj);
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalled();
      const loggedContent = consoleSpy.mock.calls[0][0];

      // Should be valid JSON
      expect(() => JSON.parse(loggedContent)).not.toThrow();

      const parsed = JSON.parse(loggedContent);
      expect(parsed.level).toBe('info');
      expect(parsed.message).toBe('Circular object:');
      expect(parsed.arg0.name).toBe('test');
      expect(parsed.arg0.self).toBe('[Circular Reference]');
      expect(parsed.arg0.nested.parent).toBe('[Circular Reference]');

      consoleSpy.mockRestore();
    });

    it('should handle complex circular objects with various types', () => {
      process.env.DEVLOGR_OUTPUT_JSON = 'true';

      const logger = createLogger('test');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const complex: any = {
        name: 'complex',
        items: [1, 2, 3],
        date: new Date('2024-01-01'),
        error: new Error('Test error'),
        metadata: {
          version: '1.0.0',
          tags: ['test', 'circular'],
        },
      };
      complex.self = complex;
      complex.metadata.parent = complex;

      expect(() => {
        logger.info('Complex circular:', complex);
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalled();
      const loggedContent = consoleSpy.mock.calls[0][0];

      // Should be valid JSON
      const parsed = JSON.parse(loggedContent);
      expect(parsed.arg0.name).toBe('complex');
      expect(parsed.arg0.items).toEqual([1, 2, 3]);
      expect(parsed.arg0.date).toBe('2024-01-01T00:00:00.000Z');
      expect(parsed.arg0.error.name).toBe('Error');
      expect(parsed.arg0.error.message).toBe('Test error');
      expect(parsed.arg0.self).toBe('[Circular Reference]');
      expect(parsed.arg0.metadata.parent).toBe('[Circular Reference]');

      consoleSpy.mockRestore();
    });

    it('should handle circular objects mixed with other arguments', () => {
      const logger = createLogger('test');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const obj: any = { name: 'test' };
      obj.self = obj;

      expect(() => {
        logger.info('Mixed args:', 'string', 42, obj, true, null);
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalled();
      const loggedContent = consoleSpy.mock.calls[0][0];
      expect(loggedContent).toContain('Mixed args:');
      expect(loggedContent).toContain('string');
      expect(loggedContent).toContain('42');
      expect(loggedContent).toContain('[Circular Reference]');
      expect(loggedContent).toContain('true');

      consoleSpy.mockRestore();
    });

    it('should handle objects that cannot be merged in JSON mode', () => {
      process.env.DEVLOGR_OUTPUT_JSON = 'true';

      const logger = createLogger('test');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Create an object that would cause issues when merged
      const problematic: any = { name: 'test' };
      problematic.self = problematic;

      expect(() => {
        logger.info('Problematic object:', problematic);
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalled();
      const loggedContent = consoleSpy.mock.calls[0][0];

      const parsed = JSON.parse(loggedContent);
      // Should store the object as arg0 instead of merging
      expect(parsed.arg0.name).toBe('test');
      expect(parsed.arg0.self).toBe('[Circular Reference]');

      consoleSpy.mockRestore();
    });
  });
});
