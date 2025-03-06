import { describe, it, expect } from 'vitest';
import { FathomApiError } from '../src/utils/http';
import { 
  validate, 
  createSiteSchema, 
  updateSiteSchema, 
  paginationSchema, 
  aggregationParamsSchema 
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
  });
});