import type { PaginationParams } from './base';

/**
 * Parameters for creating a site
 */
export interface CreateSiteParams {
  /**
   * The name of the website
   */
  name: string;
  
  /**
   * The sharing configuration
   * @default 'none'
   */
  sharing?: 'none' | 'private' | 'public';
  
  /**
   * When sharing is set to private, you must also send a password
   */
  share_password?: string;
}

/**
 * Parameters for updating a site
 */
export interface UpdateSiteParams {
  /**
   * The name of the website
   */
  name?: string;
  
  /**
   * The sharing configuration
   */
  sharing?: 'none' | 'private' | 'public';
  
  /**
   * When sharing is set to private, you must also send a password
   */
  share_password?: string;
}

/**
 * Parameters for creating an event
 */
export interface CreateEventParams {
  /**
   * The name of the event
   */
  name: string;
}

/**
 * Parameters for updating an event
 */
export interface UpdateEventParams {
  /**
   * The name of the event
   */
  name: string;
}

/**
 * Filter operator for aggregation queries
 */
export type FilterOperator = 'is' | 'is not' | 'is like' | 'is not like';

/**
 * Filter for aggregation queries
 */
export interface AggregationFilter {
  property: string;
  operator: FilterOperator;
  value: string;
}

/**
 * Parameters for aggregation queries
 */
export interface AggregationParams {
  /**
   * The entity you want to report on
   */
  entity: 'pageview' | 'event';
  
  /**
   * The ID of the entity that you want to report on
   */
  entity_id: string;
  
  /**
   * The SUM aggregates you wish to include, separated by a comma
   */
  aggregates: string;
  
  /**
   * By default, we don't do any kind of date grouping
   * @default 'none'
   */
  date_grouping?: 'hour' | 'day' | 'month' | 'year' | 'none';
  
  /**
   * The fields you want to group by
   */
  field_grouping?: string;
  
  /**
   * The field you want to sort by
   */
  sort_by?: string;
  
  /**
   * The timezone you want us to use in our queries
   * @default 'UTC'
   */
  timezone?: string;
  
  /**
   * Start date timestamp
   */
  date_from?: string;
  
  /**
   * End date timestamp
   */
  date_to?: string;
  
  /**
   * A limit on the number of entries to return
   */
  limit?: number;
  
  /**
   * Array of filter objects
   */
  filters?: AggregationFilter[];
}

/**
 * Parameters for current visitors query
 */
export interface CurrentVisitorsParams {
  /**
   * The ID of the site
   */
  site_id: string;
  
  /**
   * Set to true if you want a detailed breakdown
   * @default false
   */
  detailed?: boolean;
}