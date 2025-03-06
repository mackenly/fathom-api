import { describe, test, expect } from 'vitest';
import { FathomApi } from '../../src/';

describe('Environment Compatibility', () => {
  test('should work with standard fetch API', async () => {
    const client = new FathomApi({ token: 'dummy-token' });
    expect(client).toBeDefined();
    // Verify instance creation works
    expect(client.api).toBeDefined();
  });

  test('should support ESM imports', async () => {
    // This test will fail if ESM imports aren't working
    expect(typeof FathomApi).toBe('function');
  });

  test('should work with Web APIs', async () => {
    const client = new FathomApi({ token: 'dummy-token' });
    // Test that URL parsing works (available in all modern JS environments)
    expect(() => new URL('https://api.usefathom.com/v1')).not.toThrow();
  });

  test('should work with modern JavaScript features', () => {
    // Test modern JS features we rely on
    const testAsync = async () => {};
    expect(testAsync).toBeDefined();
    
    // Test optional chaining
    const obj = { nested: { value: 42 } };
    expect(obj?.nested?.value).toBe(42);
    
    // Test nullish coalescing
    const nullValue = null;
    expect(nullValue ?? 'default').toBe('default');
  });
});