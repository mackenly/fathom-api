import { describe, expect, it } from 'vitest';
import { FathomApi, FathomApiError } from '../src';

function events() {
  return new FathomApi({ token: 'test-token' }).api.events('ABCDEF');
}

describe('EventsResource', () => {
  it('requires a site id before any request', () => {
    expect(() => new FathomApi({ token: 'test-token' }).api.events('')).toThrow('Site ID is required');
  });

  it('requires an event id before any request', async () => {
    await expect(events().get('')).rejects.toThrow('Event ID is required');
    await expect(events().update('', { name: 'Signup' })).rejects.toThrow('Event ID is required');
    await expect(events().wipe('')).rejects.toThrow('Event ID is required');
    await expect(events().delete('')).rejects.toThrow('Event ID is required');
  });

  it('rejects invalid event names before any request', async () => {
    await expect(events().create({ name: '' })).rejects.toThrow(FathomApiError);
    await expect(events().create({ name: 'x'.repeat(256) })).rejects.toThrow(FathomApiError);
    await expect(events().update('EV123', { name: '' })).rejects.toThrow(FathomApiError);
    await expect(
      events().create({ name: 'Signup', extra: true } as { name: string })
    ).rejects.toThrow(/extra/);
  });

  it('rejects pagination outside 1-100 before any request', async () => {
    await expect(events().list({ limit: 0 })).rejects.toThrow(FathomApiError);
    await expect(events().list({ limit: 101 })).rejects.toThrow(FathomApiError);
  });
});
