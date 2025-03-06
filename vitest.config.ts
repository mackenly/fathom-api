import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node', // Default to Node.js environment
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});