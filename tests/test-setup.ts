import { afterAll, afterEach, beforeAll } from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

// This creates a MSW server instance for mocking API responses
export const server = setupServer();

// Set up request handlers before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up server after all tests
afterAll(() => server.close());

// Helper for creating mock API responses
export function createMockHandler(
  method: 'get' | 'post' | 'delete',
  path: string,
  response: any,
  status = 200
) {
  return rest[method](`https://api.usefathom.com${path}`, (req, res, ctx) => {
    return res(
      ctx.status(status),
      ctx.json(response)
    );
  });
}