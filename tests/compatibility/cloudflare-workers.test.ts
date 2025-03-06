import { describe, test, expect } from 'vitest';
import { FathomApi } from '../../src';

describe('Cloudflare Workers Compatibility', () => {
  test('should work in Cloudflare Workers environment', async () => {
    // Mock Headers, Request, and Response to simulate Workers environment
    const client = new FathomApi({ token: 'dummy-token' });
    
    // Test that the client works with Request/Response objects
    const request = new Request('https://api.usefathom.com/v1/account');
    expect(request instanceof Request).toBe(true);
    
    // Verify response handling
    const response = new Response(JSON.stringify({ id: 1 }), {
      headers: { 'Content-Type': 'application/json' }
    });
    expect(response instanceof Response).toBe(true);
  });

  test('should handle streams correctly', async () => {
    // Test ReadableStream support (important for Workers)
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('test'));
        controller.close();
      }
    });
    expect(stream instanceof ReadableStream).toBe(true);
  });
});