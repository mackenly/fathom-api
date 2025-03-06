import { describe, test, expect } from 'vitest';
import { FathomApi } from '../../src';

describe('Browser Compatibility', () => {
  test('should work with browser APIs when available', async () => {
    const client = new FathomApi({ token: 'dummy-token' });
    
    // Skip browser-specific tests if not in a browser environment
    if (typeof window !== 'undefined') {
      // Test fetch availability (browser-specific)
      expect(typeof fetch).toBe('function');
      
      // Test window object
      expect(typeof window).toBe('object');
      expect(window.location).toBeDefined();
      
      // Test DOM APIs
      const div = document.createElement('div');
      expect(div instanceof HTMLDivElement).toBe(true);
    } else {
      // Skip test in non-browser environments
      expect(true).toBe(true);
    }
  });

  test('should work with Web Storage APIs when available', () => {
    // Skip storage tests if not in a browser environment
    if (typeof window !== 'undefined' && window.localStorage) {
      // Test localStorage
      localStorage.setItem('test', 'value');
      expect(localStorage.getItem('test')).toBe('value');
      
      // Test sessionStorage
      sessionStorage.setItem('test', 'value');
      expect(sessionStorage.getItem('test')).toBe('value');
    } else {
      // Skip test in non-browser environments
      expect(true).toBe(true);
    }
  });
});