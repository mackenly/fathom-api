import { HttpClient } from '../../utils/http';
import { AccountResource } from './account';
import { SitesResource } from './sites';
import { EventsResource } from './events';
import { ReportsResource } from './reports';
import type { PaginationParams } from '../../types/base';
import type { CurrentVisitorsResponse, Account, Site, Event } from '../../types/entities';

/**
 * Fathom Analytics API v1 Client
 */
export class FathomApiV1 {
  /**
   * Account resource
   */
  readonly account: AccountResource;
  
  /**
   * Sites resource
   */
  readonly sites: SitesResource;
  
  /**
   * Reports resource
   */
  readonly reports: ReportsResource;

  constructor(private readonly http: HttpClient) {
    this.account = new AccountResource(http);
    this.sites = new SitesResource(http);
    this.reports = new ReportsResource(http);
  }

  /**
   * Get events resource for a specific site
   * 
   * @param siteId - The ID of the site
   * @returns Events resource
   */
  events(siteId: string): EventsResource {
    return new EventsResource(this.http, siteId);
  }

  /**
   * Convenience method to get account information
   * 
   * @returns Promise with account information
   */
  async getAccount(): Promise<Account> {
    return this.account.get();
  }

  /**
   * Convenience method to get current visitors for a site
   * 
   * @param siteId - The ID of the site
   * @param detailed - Whether to include detailed information
   * @returns Promise with current visitors information
   */
  async getCurrentVisitors(siteId: string, detailed = false): Promise<CurrentVisitorsResponse> {
    return this.reports.currentVisitors({ site_id: siteId, detailed });
  }

  /**
   * Convenience method to get a site by ID
   * 
   * @param siteId - The ID of the site
   * @returns Promise with site information
   */
  async getSite(siteId: string): Promise<Site> {
    return this.sites.get(siteId);
  }

  /**
   * Convenience method to get all sites
   * This method handles pagination automatically until all sites are retrieved
   * 
   * @returns Promise with an array of all sites
   */
  async getAllSites(): Promise<Site[]> {
    const allSites: Site[] = [];
    let lastId: string | undefined = undefined;
    let hasMore = true;

    while (hasMore) {
      const params: PaginationParams = { limit: 20 };
      if (lastId) {
        params.starting_after = lastId;
      }
      
      const response = await this.sites.list(params);
      allSites.push(...response.data);
      
      hasMore = response.has_more;
      if (hasMore && response.data.length > 0) {
        lastId = response.data[response.data.length - 1].id;
      }
    }

    return allSites;
  }

  /**
   * Convenience method to get an event by ID
   * 
   * @param siteId - The ID of the site
   * @param eventId - The ID of the event
   * @returns Promise with event information
   */
  async getEvent(siteId: string, eventId: string): Promise<Event> {
    return this.events(siteId).get(eventId);
  }
}