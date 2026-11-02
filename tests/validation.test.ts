import { describe, it, expect } from 'vitest';
import { FathomApiError } from '../src/utils/http';
import { 
  validate, 
  createSiteSchema, 
  updateSiteSchema, 
  createEventSchema,
  updateEventSchema,
  paginationSchema, 
  aggregationParamsSchema,
  currentVisitorsParamsSchema,
  clientOptionsSchema,
} from '../src/utils/validation';

describe('Validation Utilities', () => {
  describe('validate function', () => {
    it('should return validated data when valid', () => {
      const data = { limit: 50 };
      const result = validate(paginationSchema, data);
      expect(result).toEqual(data);
    });

    it('should throw FathomApiError when data is invalid', () => {
      const data = { limit: 101 }; // Max limit is 100
      expect(() => validate(paginationSchema, data)).toThrow(FathomApiError);
    });
  });

  describe('paginationSchema', () => {
    it('should validate valid pagination parameters', () => {
      const data = { limit: 50, starting_after: 'abc123' };
      const result = validate(paginationSchema, data);
      expect(result).toEqual(data);
    });

    it('should reject limits outside the allowed range', () => {
      expect(() => validate(paginationSchema, { limit: 0 })).toThrow();
      expect(() => validate(paginationSchema, { limit: 101 })).toThrow();
    });

    it('should reject unknown properties', () => {
      expect(() => validate(paginationSchema, { limit: 10, unknown: 'value' })).toThrow();
    });
  });

  describe('createSiteSchema', () => {
    it('should validate valid site creation parameters', () => {
      const data = { name: 'Test Site' };
      const result = validate(createSiteSchema, data);
      expect(result).toEqual(data);
    });

    it('should validate site with sharing options', () => {
      const data = { name: 'Test Site', sharing: 'public' };
      const result = validate(createSiteSchema, data);
      expect(result).toEqual(data);
    });

    it('should require password when sharing is private', () => {
      const data = { name: 'Test Site', sharing: 'private', share_password: 'secret' };
      const result = validate(createSiteSchema, data);
      expect(result).toEqual(data);

      expect(() => {
        validate(createSiteSchema, { name: 'Test Site', sharing: 'private' });
      }).toThrow();
    });

    it('should reject invalid sharing values', () => {
      expect(() => {
        validate(createSiteSchema, { name: 'Test Site', sharing: 'invalid' });
      }).toThrow();
    });
  });

  describe('updateSiteSchema', () => {
    it('should allow partial updates', () => {
      const data = { name: 'Updated Site' };
      const result = validate(updateSiteSchema, data);
      expect(result).toEqual(data);

      const sharingOnly = { sharing: 'public' };
      const sharingResult = validate(updateSiteSchema, sharingOnly);
      expect(sharingResult).toEqual(sharingOnly);
    });

    it('should require password when updating to private sharing', () => {
      const data = { sharing: 'private', share_password: 'secret' };
      const result = validate(updateSiteSchema, data);
      expect(result).toEqual(data);

      expect(() => {
        validate(updateSiteSchema, { sharing: 'private' });
      }).toThrow();
    });
  });

  describe('aggregationParamsSchema', () => {
    it('should validate valid aggregation parameters', () => {
      const data = {
        entity: 'pageview',
        entity_id: 'ABCDEF',
        aggregates: 'visits,pageviews'
      };
      const result = validate(aggregationParamsSchema, data);
      expect(result).toEqual(data);
    });

    it('should validate aggregation with filters', () => {
      const data = {
        entity: 'pageview',
        entity_id: 'ABCDEF',
        aggregates: 'visits,pageviews',
        filters: [
          { property: 'pathname', operator: 'is', value: '/home' }
        ]
      };
      const result = validate(aggregationParamsSchema, data);
      expect(result).toEqual(data);
    });

    it('should reject invalid entity values', () => {
      expect(() => {
        validate(aggregationParamsSchema, {
          entity: 'invalid',
          entity_id: 'ABCDEF',
          aggregates: 'visits'
        });
      }).toThrow();
    });

    it('should reject invalid filter operators', () => {
      expect(() => {
        validate(aggregationParamsSchema, {
          entity: 'pageview',
          entity_id: 'ABCDEF',
          aggregates: 'visits',
          filters: [
            { property: 'pathname', operator: 'invalid', value: '/home' }
          ]
        });
      }).toThrow();
    });

    it('accepts the documented date groupings and a positive limit', () => {
      const data = {
        entity: 'event' as const,
        entity_id: 'EV123',
        aggregates: 'conversions',
        date_grouping: 'hour' as const,
        limit: 1,
        filters: [],
      };
      expect(validate(aggregationParamsSchema, data)).toEqual(data);
    });

    it('rejects empty identifiers, empty aggregates, and a non-positive limit', () => {
      expect(() => validate(aggregationParamsSchema, {
        entity: 'pageview',
        entity_id: '',
        aggregates: 'visits',
      })).toThrow(/entity_id/);
      expect(() => validate(aggregationParamsSchema, {
        entity: 'pageview',
        entity_id: 'ABCDEF',
        aggregates: '',
      })).toThrow(/aggregates/);
      expect(() => validate(aggregationParamsSchema, {
        entity: 'pageview',
        entity_id: 'ABCDEF',
        aggregates: 'visits',
        date_grouping: 'week',
      })).toThrow(/date_grouping/);
      expect(() => validate(aggregationParamsSchema, {
        entity: 'pageview',
        entity_id: 'ABCDEF',
        aggregates: 'visits',
        limit: 0,
      })).toThrow(/limit/);
    });
  });

  describe('paginationSchema boundaries', () => {
    it('accepts the inclusive limit bounds', () => {
      expect(validate(paginationSchema, { limit: 1 })).toEqual({ limit: 1 });
      expect(validate(paginationSchema, { limit: 100, ending_before: 'abc' })).toEqual({
        limit: 100,
        ending_before: 'abc',
      });
    });
  });

  describe('event schemas', () => {
    it('requires a name between 1 and 255 characters', () => {
      expect(validate(createEventSchema, { name: 'Signup' })).toEqual({ name: 'Signup' });
      expect(validate(updateEventSchema, { name: 'Signup' })).toEqual({ name: 'Signup' });
      expect(validate(createEventSchema, { name: 'x'.repeat(255) }).name).toHaveLength(255);
      expect(() => validate(createEventSchema, { name: '' })).toThrow(/name/);
      expect(() => validate(updateEventSchema, { name: 'x'.repeat(256) })).toThrow(/name/);
      expect(() => validate(createEventSchema, {})).toThrow(/name/);
      expect(() => validate(updateEventSchema, { name: 'Signup', extra: true })).toThrow(/extra/);
    });
  });

  describe('currentVisitorsParamsSchema', () => {
    it('requires a site id and an optional boolean breakdown flag', () => {
      expect(validate(currentVisitorsParamsSchema, { site_id: 'ABCDEF' })).toEqual({
        site_id: 'ABCDEF',
      });
      expect(validate(currentVisitorsParamsSchema, { site_id: 'ABCDEF', detailed: false })).toEqual({
        site_id: 'ABCDEF',
        detailed: false,
      });
      expect(() => validate(currentVisitorsParamsSchema, { site_id: '' })).toThrow(/site_id/);
      expect(() => validate(currentVisitorsParamsSchema, { site_id: 'ABCDEF', detailed: 'yes' })).toThrow(/detailed/);
      expect(() => validate(currentVisitorsParamsSchema, { site_id: 'ABCDEF', extra: true })).toThrow(/extra/);
    });
  });

  describe('clientOptionsSchema', () => {
    it('requires a token and accepts the documented optional fields', () => {
      expect(validate(clientOptionsSchema, { token: 'abc' })).toEqual({ token: 'abc' });
      expect(validate(clientOptionsSchema, {
        token: 'abc',
        version: 'v1',
        baseUrl: 'https://proxy.example.com',
      })).toEqual({
        token: 'abc',
        version: 'v1',
        baseUrl: 'https://proxy.example.com',
      });
    });

    it('wraps zod failures as FathomApiError 400 through zod-validation-error', () => {
      expect(() => validate(clientOptionsSchema, {})).toThrow(FathomApiError);
      expect(() => validate(clientOptionsSchema, {})).toThrow(/Validation error:.*at "token"/);
      expect(() => validate(clientOptionsSchema, { token: 'abc', baseUrl: 'not-a-url' })).toThrow(/at "baseUrl"/);
      expect(() => validate(clientOptionsSchema, { token: 'abc', version: 'v2' })).toThrow(/version/);
      expect(() => validate(clientOptionsSchema, { token: 'abc', extra: true })).toThrow(/extra/);
    });
  });

  describe('createSiteSchema bounds', () => {
    it('accepts a 255 character name and rejects a longer one', () => {
      const name = 'x'.repeat(255);
      expect(validate(createSiteSchema, { name }).name).toBe(name);
      expect(() => validate(createSiteSchema, { name: 'x'.repeat(256) })).toThrow(/name/);
      expect(() => validate(updateSiteSchema, { name: '' })).toThrow(/name/);
    });
  });
});