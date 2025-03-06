import { describe, it, expect, beforeEach } from 'vitest';
import { HttpClient, FathomApiError } from '../src/utils/http';
import { server, createMockHandler } from '../src/utils/test-setup';
import { rest } from 'msw';

describe('HttpClient', () => {
  const client = new HttpClient({
    token: 'test-token',
    baseUrl: 'https://api.usefathom.com'
  });

  beforeEach(() => {
    server.resetHandlers();
  });

  describe('get', () => {
    it('should make a successful GET request', async () => {
      server.use(
        createMockHandler('get', '/v1/test', { success: true })
      );

      const response = await client.get('/v1/test');
      expect(response).toEqual({ success: true });
    });

    it('should handle query parameters correctly', async () => {
      server.use(
        rest.get('https://api.usefathom.com/v1/test', (req, res, ctx) => {
          const param1 = req.url.searchParams.get('param1');
          const param2 = req.url.searchParams.get('param2');
          
          return res(
            ctx.status(200),
            ctx.json({ param1, param2 })
          );
        })
      );

      const response = await client.get('/v1/test', {
        param1: 'value1',
        param2: 'value2'
      });

      expect(response).toEqual({
        param1: 'value1',
        param2: 'value2'
      });
    });

    it('should handle API errors correctly', async () => {
      server.use(
        createMockHandler('get', '/v1/error', { error: 'Test error message' }, 400)
      );

      await expect(client.get('/v1/error')).rejects.toThrow(FathomApiError);
      await expect(client.get('/v1/error')).rejects.toMatchObject({
        error: 'Test error message',
        status: 400
      });
    });
  });

  describe('post', () => {
    it('should make a successful POST request with body', async () => {
      server.use(
        rest.post('https://api.usefathom.com/v1/test', async (req, res, ctx) => {
          const body = await req.json();
          return res(
            ctx.status(200),
            ctx.json({ received: body })
          );
        })
      );

      const requestBody = { name: 'Test Name' };
      const response = await client.post('/v1/test', requestBody);

      expect(response).toEqual({
        received: requestBody
      });
    });
  });

  describe('delete', () => {
    it('should make a successful DELETE request', async () => {
      server.use(
        createMockHandler('delete', '/v1/test/123', { deleted: true })
      );

      const response = await client.delete('/v1/test/123');
      expect(response).toEqual({ deleted: true });
    });
  });
});