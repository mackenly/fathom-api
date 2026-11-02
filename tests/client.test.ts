import { describe, expect, it } from 'vitest';
import { FathomApi, FathomApiError, type ApiVersion } from '../src';
import { expectSearch, expectSingleRequest } from './expect-request';
import {
  accountFixture,
  eventFixture,
  eventWith,
  listResponse,
  siteFixture,
  siteWith,
} from './fixtures';
import { createMockHandler, recordRequests, recordSequence, server } from './test-setup';

function api() {
  return new FathomApi({ token: 'test-token' }).api;
}

describe('FathomApi', () => {
  describe('construction', () => {
    it('accepts the documented options and uses them on the request', async () => {
      const requests = recordRequests(accountFixture);
      const fathom = new FathomApi({
        token: 'proxy-token',
        version: 'v1',
        baseUrl: 'https://proxy.example.com',
      });

      await expect(fathom.api.account.get()).resolves.toEqual(accountFixture);
      expectSingleRequest(requests, {
        method: 'GET',
        pathname: '/v1/account',
        origin: 'https://proxy.example.com',
        token: 'proxy-token',
      });
    });

    it('defaults the host to the Fathom API', async () => {
      const requests = recordRequests(accountFixture);
      await new FathomApi({ token: 'test-token' }).api.account.get();

      expect(requests[0].href).toBe('https://api.usefathom.com/v1/account');
    });

    it('rejects client options that would not authenticate', () => {
      expect(() => new FathomApi({ token: '' })).toThrow(FathomApiError);
      expect(() => new FathomApi({ token: '' })).toThrow(/Validation error:.*at "token"/);
      expect(() => new FathomApi({ token: 't', baseUrl: 'not-a-url' })).toThrow(/at "baseUrl"/);
      expect(() => new FathomApi({ token: 't', version: 'v2' as ApiVersion })).toThrow(FathomApiError);
      expect(() => new FathomApi({ token: 't', extra: true } as { token: string })).toThrow(/extra/);
    });

    it('returns the same v1 client from api and version()', () => {
      const fathom = new FathomApi({ token: 'test-token' });

      expect(fathom.api).toBe(fathom.version('v1'));
      expect(() => fathom.version('v2' as ApiVersion)).toThrow("API version 'v2' is not supported");
    });
  });

  describe('convenience methods', () => {
    it('loads the account, a site, and an event through the documented paths', async () => {
      const accountRequests = recordRequests(accountFixture);
      await expect(api().getAccount()).resolves.toEqual(accountFixture);
      expectSingleRequest(accountRequests, { method: 'GET', pathname: '/v1/account' });

      const siteRequests = recordRequests(siteFixture);
      await expect(api().getSite('ABCDEF')).resolves.toEqual(siteFixture);
      expectSingleRequest(siteRequests, { method: 'GET', pathname: '/v1/sites/ABCDEF' });

      const eventRequests = recordRequests(eventFixture);
      await expect(api().getEvent('ABCDEF', 'EV123')).resolves.toEqual(eventFixture);
      expectSingleRequest(eventRequests, {
        method: 'GET',
        pathname: '/v1/sites/ABCDEF/events/EV123',
      });
    });

    it('asks for a detailed current-visitor breakdown only when requested', async () => {
      const summary = recordRequests({ total: 1 });
      await expect(api().getCurrentVisitors('ABCDEF')).resolves.toEqual({ total: 1 });
      expectSingleRequest(summary, {
        method: 'GET',
        pathname: '/v1/current_visitors',
        search: { site_id: 'ABCDEF', detailed: 'false' },
      });

      const detailed = recordRequests({ total: 2, content: [] });
      await expect(api().getCurrentVisitors('ABCDEF', true)).resolves.toEqual({
        total: 2,
        content: [],
      });
      expectSingleRequest(detailed, {
        method: 'GET',
        pathname: '/v1/current_visitors',
        search: { site_id: 'ABCDEF', detailed: 'true' },
      });
    });

    it('surfaces API errors from resource calls', async () => {
      server.use(createMockHandler('get', '/v1/sites/MISSING', { error: 'Site not found' }, 404));

      await expect(api().sites.get('MISSING')).rejects.toMatchObject({
        name: 'FathomApiError',
        status: 404,
        error: 'Site not found',
      });
    });
  });

  describe('getAllSites', () => {
    it('follows has_more and sends the last id as starting_after', async () => {
      const requests = recordSequence([
        listResponse('/v1/sites', [siteWith('A'), siteWith('B')], true),
        listResponse('/v1/sites', [siteWith('C')], false),
      ]);

      await expect(api().getAllSites()).resolves.toEqual([
        siteWith('A'),
        siteWith('B'),
        siteWith('C'),
      ]);
      expect(requests).toHaveLength(2);
      expectSearch(requests[0].search, { limit: '20' });
      expectSearch(requests[1].search, { limit: '20', starting_after: 'B' });
      expect(requests[0].pathname).toBe('/v1/sites');
      expect(requests[1].pathname).toBe('/v1/sites');
    });

    it('stops inside the first page when the limit is already met', async () => {
      const requests = recordSequence([
        listResponse('/v1/sites', [siteWith('A'), siteWith('B'), siteWith('C')], true),
      ]);

      const sites = await api().getAllSites(2);

      expect(sites.map((site) => site.id)).toEqual(['A', 'B']);
      expect(requests).toHaveLength(1);
    });

    it('slices a limit that spans pages', async () => {
      const requests = recordSequence([
        listResponse('/v1/sites', [siteWith('A'), siteWith('B')], true),
        listResponse('/v1/sites', [siteWith('C'), siteWith('D')], true),
      ]);

      const sites = await api().getAllSites(3);

      expect(sites.map((site) => site.id)).toEqual(['A', 'B', 'C']);
      expect(requests).toHaveLength(2);
    });

    it('stops when a page is empty', async () => {
      const requests = recordSequence([
        listResponse('/v1/sites', [], true),
      ]);

      await expect(api().getAllSites()).resolves.toEqual([]);
      expect(requests).toHaveLength(1);
    });
  });

  describe('getAllEvents', () => {
    it('requires a site id', async () => {
      await expect(api().getAllEvents('')).rejects.toThrow('Site ID is required');
    });

    it('follows has_more for one site', async () => {
      const requests = recordSequence([
        listResponse('/v1/sites/ABCDEF/events', [eventWith('E1'), eventWith('E2')], true),
        listResponse('/v1/sites/ABCDEF/events', [eventWith('E3')], false),
      ]);

      const events = await api().getAllEvents('ABCDEF');

      expect(events.map((event) => event.id)).toEqual(['E1', 'E2', 'E3']);
      expect(requests).toHaveLength(2);
      expect(requests[0].pathname).toBe('/v1/sites/ABCDEF/events');
      expectSearch(requests[0].search, { limit: '20' });
      expectSearch(requests[1].search, { limit: '20', starting_after: 'E2' });
    });

    it('applies a limit and stops on an empty page', async () => {
      const limited = recordSequence([
        listResponse('/v1/sites/ABCDEF/events', [eventWith('E1'), eventWith('E2')], true),
      ]);
      const first = await api().getAllEvents('ABCDEF', 1);
      expect(first.map((event) => event.id)).toEqual(['E1']);
      expect(limited).toHaveLength(1);

      const empty = recordSequence([
        listResponse('/v1/sites/ABCDEF/events', [], true),
      ]);
      await expect(api().getAllEvents('ABCDEF')).resolves.toEqual([]);
      expect(empty).toHaveLength(1);
    });
  });
});
