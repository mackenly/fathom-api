import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node', // Default to Node.js environment
    globals: true,
    environmentOptions: {
      jsdom: {
        // JSDOM options for browser environment
      }
    },
    environmentMatchGlobs: [
      // Run browser-specific tests in JSDOM environment
      ['**/compatibility/browser.test.ts', 'jsdom'],
      // Run Node.js specific tests in Node environment
      ['**/compatibility/node.test.ts', 'node'],
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});