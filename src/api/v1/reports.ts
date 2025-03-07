import { HttpClient } from '../../utils/http';
import type { CurrentVisitorsResponse } from '../../types/entities';
import type { AggregationParams, CurrentVisitorsParams } from '../../types/params';
import { validate, aggregationSchema, currentVisitorsSchema } from '../../utils/validation';

/**
 * Reports API resource
 */
export class ReportsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Generate an aggregation report
   * 
   * This endpoints's response does not match the API documentation. 
   * As such, we're using the type for what actually gets returned. 
   * This may break in the future if the API changes.
   * 
   * @link https://usefathom.com/api#aggregation
   * @param params - Aggregation parameters
   * @returns Promise with aggregation data
   */
  async aggregation<T = Record<string, any>>(params: AggregationParams): Promise<Array<T>> {
    const validatedParams = validate(aggregationSchema, params);
    return this.http.get<Array<T>>('/v1/aggregations', validatedParams);
  }

  /**
   * Get current visitors for a site
   * 
   * @param params - Current visitors parameters
   * @returns Promise with current visitors information
   */
  async currentVisitors(params: CurrentVisitorsParams): Promise<CurrentVisitorsResponse> {
    const validatedParams = validate(currentVisitorsSchema, params);
    return this.http.get<CurrentVisitorsResponse>('/v1/current_visitors', validatedParams);
  }

  /**
   * Convenience method to get pageview stats for a site
   * 
   * @param siteId - The ID of the site to get pageviews for
   * @param options - Additional options for the aggregation
   * @returns Promise with pageview stats
   */
  async getPageviewStats(
    siteId: string, 
    options: {
      dateFrom?: string;
      dateTo?: string;
      timezone?: string;
      groupBy?: 'day' | 'month' | 'year' | 'hour';
      limit?: number;
    } = {}
  ): Promise<Array<{
    date: string;
    visits: number;
    uniques: number;
    pageviews: number;
    bounce_rate: number;
    avg_duration: number;
  }>> {
    return this.aggregation({
      entity: 'pageview',
      entity_id: siteId,
      aggregates: 'visits,uniques,pageviews,bounce_rate,avg_duration',
      date_grouping: options.groupBy,
      timezone: options.timezone || 'UTC',
      date_from: options.dateFrom,
      date_to: options.dateTo,
      limit: options.limit
    });
  }

  /**
   * Convenience method to get top pages for a site
   * 
   * @param siteId - The ID of the site
   * @param options - Additional options for the aggregation
   * @returns Promise with top pages data
   */
  async getTopPages(
    siteId: string,
    options: {
      dateFrom?: string;
      dateTo?: string;
      timezone?: string;
      limit?: number;
    } = {}
  ): Promise< Array<{
    pathname: string;
    visits: number;
    uniques: number;
    pageviews: number;
    bounce_rate: number;
    avg_duration: number;
  }>> {
    return this.aggregation({
      entity: 'pageview',
      entity_id: siteId,
      aggregates: 'visits,uniques,pageviews,bounce_rate,avg_duration',
      field_grouping: 'pathname',
      sort_by: 'pageviews:desc',
      timezone: options.timezone || 'UTC',
      date_from: options.dateFrom,
      date_to: options.dateTo,
      limit: options.limit || 20
    });
  }

  /**
   * Convenience method to get referrer sources for a site
   * 
   * @param siteId - The ID of the site
   * @param options - Additional options for the aggregation
   * @returns Promise with referrer data
   */
  async getReferrerSources(
    siteId: string,
    options: {
      dateFrom?: string;
      dateTo?: string;
      timezone?: string;
      limit?: number;
    } = {}
  ): Promise<Array<{
    referrer_hostname: string;
    visits: number;
    uniques: number;
  }>> {
    return this.aggregation({
      entity: 'pageview',
      entity_id: siteId,
      aggregates: 'visits,uniques',
      field_grouping: 'referrer_hostname',
      sort_by: 'visits:desc',
      timezone: options.timezone || 'UTC',
      date_from: options.dateFrom,
      date_to: options.dateTo,
      limit: options.limit || 20
    });
  }

  /**
   * Convenience method to get event conversions
   * 
   * @param siteId - The ID of the site
   * @param eventId - The ID of the event
   * @param options - Additional options for the aggregation
   * @returns Promise with event conversion data
   */
  async getEventConversions(
    siteId: string,
    eventId: string,
    options: {
      dateFrom?: string;
      dateTo?: string;
      timezone?: string;
      groupBy?: 'day' | 'month' | 'year' | 'hour';
    } = {}
  ): Promise<Array<{
    date: string;
    conversions: number;
    unique_conversions: number;
  }>> {
    return this.aggregation({
      entity: 'event',
      entity_id: eventId,
      aggregates: 'conversions,unique_conversions',
      date_grouping: options.groupBy,
      timezone: options.timezone || 'UTC',
      date_from: options.dateFrom,
      date_to: options.dateTo
    });
  }
}