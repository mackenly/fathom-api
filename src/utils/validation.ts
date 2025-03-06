import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { FathomApiError } from './http';

// Common validation schemas
export const paginationSchema: z.ZodObject<{
  limit: z.ZodOptional<z.ZodNumber>;
  starting_after: z.ZodOptional<z.ZodString>;
  ending_before: z.ZodOptional<z.ZodString>;
}> = z.object({
  limit: z.number().min(1).max(100).optional(),
  starting_after: z.string().optional(),
  ending_before: z.string().optional(),
}).strict();

// Site validation schemas
export const createSiteSchema: z.ZodEffects<z.ZodObject<{
  name: z.ZodString;
  sharing: z.ZodOptional<z.ZodEnum<["none", "private", "public"]>>;
  share_password: z.ZodOptional<z.ZodString>;
}>> = z.object({
  name: z.string().min(1).max(255),
  sharing: z.enum(['none', 'private', 'public']).optional(),
  share_password: z.string().min(1).optional(),
}).strict().refine(data => {
  if (data.sharing === 'private' && !data.share_password) {
    return false;
  }
  return true;
}, {
  message: "share_password is required when sharing is set to 'private'",
  path: ['share_password'],
});

export const updateSiteSchema: z.ZodEffects<z.ZodObject<{
  name: z.ZodOptional<z.ZodString>;
  sharing: z.ZodOptional<z.ZodEnum<["none", "private", "public"]>>;
  share_password: z.ZodOptional<z.ZodString>;
}>> = z.object({
  name: z.string().min(1).max(255).optional(),
  sharing: z.enum(['none', 'private', 'public']).optional(),
  share_password: z.string().min(1).optional(),
}).strict().refine(data => {
  if (data.sharing === 'private' && !data.share_password) {
    return false;
  }
  return true;
}, {
  message: "share_password is required when sharing is set to 'private'",
  path: ['share_password'],
});

// Event validation schemas
export const createEventSchema: z.ZodObject<{
  name: z.ZodString;
}> = z.object({
  name: z.string().min(1).max(255),
}).strict();

export const updateEventSchema: z.ZodObject<{
  name: z.ZodString;
}> = z.object({
  name: z.string().min(1).max(255),
}).strict();

// Aggregation report validation schemas
const filterOperatorSchema: z.ZodEnum<["is", "is not", "is like", "is not like"]> = z.enum(['is', 'is not', 'is like', 'is not like']);

const aggregationFilterSchema: z.ZodObject<{
  property: z.ZodString;
  operator: z.ZodEnum<["is", "is not", "is like", "is not like"]>;
  value: z.ZodString;
}> = z.object({
  property: z.string(),
  operator: filterOperatorSchema,
  value: z.string(),
}).strict();

export const aggregationParamsSchema: z.ZodObject<{
  entity: z.ZodEnum<["pageview", "event"]>;
  entity_id: z.ZodString;
  aggregates: z.ZodString;
  date_grouping: z.ZodOptional<z.ZodEnum<["hour", "day", "month", "year", "none"]>>;
  field_grouping: z.ZodOptional<z.ZodString>;
  sort_by: z.ZodOptional<z.ZodString>;
  timezone: z.ZodOptional<z.ZodString>;
  date_from: z.ZodOptional<z.ZodString>;
  date_to: z.ZodOptional<z.ZodString>;
  limit: z.ZodOptional<z.ZodNumber>;
  filters: z.ZodOptional<z.ZodArray<z.ZodObject<{
    property: z.ZodString;
    operator: z.ZodEnum<["is", "is not", "is like", "is not like"]>;
    value: z.ZodString;
  }>>>;
}> = z.object({
  entity: z.enum(['pageview', 'event']),
  entity_id: z.string().min(1),
  aggregates: z.string().min(1),
  date_grouping: z.enum(['hour', 'day', 'month', 'year', 'none']).optional(),
  field_grouping: z.string().optional(),
  sort_by: z.string().optional(),
  timezone: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  limit: z.number().positive().optional(),
  filters: z.array(aggregationFilterSchema).optional(),
}).strict();

// Current visitors validation schema
export const currentVisitorsParamsSchema: z.ZodObject<{
  site_id: z.ZodString;
  detailed: z.ZodOptional<z.ZodBoolean>;
}> = z.object({
  site_id: z.string().min(1),
  detailed: z.boolean().optional(),
}).strict();

// Client options validation
export const clientOptionsSchema: z.ZodObject<{
  token: z.ZodString;
  version: z.ZodOptional<z.ZodEnum<["v1"]>>;
  baseUrl: z.ZodOptional<z.ZodString>;
}> = z.object({
  token: z.string().min(1),
  version: z.enum(['v1']).optional(),
  baseUrl: z.string().url().optional(),
}).strict();

/**
 * Validate data against a schema
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data
 * @throws FathomApiError if validation fails
 */
export function validate<T>(
  schema: z.ZodType<T>,
  data: unknown
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      throw new FathomApiError(validationError.message, 400);
    }
    throw error;
  }
}

// Rename exports inline to match the names expected by other files
export const aggregationSchema = aggregationParamsSchema;
export const currentVisitorsSchema = currentVisitorsParamsSchema;