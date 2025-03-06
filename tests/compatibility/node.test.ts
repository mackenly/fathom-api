import { describe, test, expect } from 'vitest';
import { FathomApi } from '../../src';

describe('Node.js Compatibility', () => {
  test('should work with Node.js specific features', async () => {
    const client = new FathomApi({ token: 'dummy-token' });
    
    // Test Buffer support (Node.js specific)
    const buffer = Buffer.from('test');
    expect(buffer).toBeInstanceOf(Buffer);
    
    // Test Node.js URL API
    const url = new URL('https://api.usefathom.com/v1');
    expect(url.origin).toBe('https://api.usefathom.com');
  });

  test('should support Node.js environment detection', () => {
    expect(typeof process).toBe('object');
    expect(process.versions.node).toBeDefined();
  });
});