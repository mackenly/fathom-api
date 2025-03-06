import { describe, it, expect, beforeEach } from 'vitest';
import { HttpClient } from '../src/utils/http';
import { SitesResource } from '../src/api/v1/sites';
import { server, createMockHandler } from './test-setup';
import { rest } from 'msw';

describe('SitesResource', () => {
  const client = new HttpClient({
    token: 'test-token',
    baseUrl: 'https://api.usefathom.com'
  });
  
  const sites = new SitesResource(client);

  const mockSite = {
    id: 'ABCDEF',
    object: 'site',
    name: 'Test Site',
    sharing: 'none',
    created_at: '2022-01-01 12:00:00'
  };

  beforeEach(() => {
    server.resetHandlers();
  });

  describe('list', () => {
    it('should list sites successfully', async () => {
      server.use(
        createMockHandler('get', '/v1/sites', {
          object: 'list',
          url: '/v1/sites',
          has_more: false,
          data: [mockSite]
        })
      );

      const response = await sites.list();
      
      expect(response.object).toBe('list');
      expect(response.has_more).toBe(false);
      expect(response.data).toHaveLength(1);
      expect(response.data[0]).toEqual(mockSite);
    });

    it('should support pagination parameters', async () => {
      server.use(
        rest.get('https://api.usefathom.com/v1/sites', (req, res, ctx) => {
          const limit = req.url.searchParams.get('limit');
          const startingAfter = req.url.searchParams.get('starting_after');
          
          return res(
            ctx.status(200),
            ctx.json({
              object: 'list',
              url: '/v1/sites',
              has_more: false,
              data: [mockSite],
            })
          );
        })
      );

      const response = await sites.list({ limit: 20, starting_after: 'XYZ123' });
      
      expect(response.object).toBe('list');
      expect(response.has_more).toBe(false);
      expect(response.data).toHaveLength(1);
      expect(response.data[0]).toEqual(mockSite);
    });
  });

  describe('get', () => {
    it('should get a site by id', async () => {
      server.use(
        createMockHandler('get', '/v1/sites/ABCDEF', mockSite)
      );

      const site = await sites.get('ABCDEF');
      expect(site).toEqual(mockSite);
    });

    it('should throw error when siteId is missing', async () => {
      await expect(sites.get('')).rejects.toThrow('Site ID is required');
      await expect(sites.get(undefined as any)).rejects.toThrow('Site ID is required');
    });
  });

  describe('create', () => {
    it('should create a site successfully', async () => {
      server.use(
        rest.post('https://api.usefathom.com/v1/sites', async (req, res, ctx) => {
          const body = await req.json();
          return res(
            ctx.status(200),
            ctx.json({
              id: 'NEWSITE',
              object: 'site',
              name: body.name,
              sharing: body.sharing || 'none',
              created_at: '2022-01-01 12:00:00'
            })
          );
        })
      );

      const site = await sites.create({ name: 'New Test Site' });
      
      expect(site.id).toBe('NEWSITE');
      expect(site.name).toBe('New Test Site');
    });

    it('should handle validation errors', async () => {
      await expect(sites.create({ name: '' })).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a site successfully', async () => {
      server.use(
        rest.post('https://api.usefathom.com/v1/sites/ABCDEF', async (req, res, ctx) => {
          const body = await req.json();
          return res(
            ctx.status(200),
            ctx.json({
              ...mockSite,
              name: body.name
            })
          );
        })
      );

      const site = await sites.update('ABCDEF', { name: 'Updated Site Name' });
      
      expect(site.id).toBe('ABCDEF');
      expect(site.name).toBe('Updated Site Name');
    });
  });

  describe('wipe', () => {
    it('should wipe site data successfully', async () => {
      server.use(
        createMockHandler('delete', '/v1/sites/ABCDEF/data', {
          id: 'ABCDEF',
          object: 'site',
          wiped: true
        })
      );

      const result = await sites.wipe('ABCDEF');
      
      expect(result.id).toBe('ABCDEF');
      expect(result.wiped).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete a site successfully', async () => {
      server.use(
        createMockHandler('delete', '/v1/sites/ABCDEF', {
          id: 'ABCDEF',
          object: 'site',
          deleted: true
        })
      );

      const result = await sites.delete('ABCDEF');
      
      expect(result.id).toBe('ABCDEF');
      expect(result.deleted).toBe(true);
    });
  });
});