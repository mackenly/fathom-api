import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './test-setup';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
