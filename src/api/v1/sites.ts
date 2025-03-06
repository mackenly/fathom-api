import type { ListResponse, PaginationParams } from '../../types/base';
import type { DeletedSite, Site, WipedSite } from '../../types/entities';
import type { CreateSiteParams, UpdateSiteParams } from '../../types/params';
import { HttpClient } from '../../utils/http';
import { createSiteSchema, paginationSchema, updateSiteSchema, validate } from '../../utils/validation';

/**
 * Sites API resource
 */
export class SitesResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * List all sites
   * 
   * @param params - Pagination parameters
   * @returns Promise with a list of sites
   */
  async list(params?: PaginationParams): Promise<ListResponse<Site>> {
    const validatedParams = params ? validate(paginationSchema, params) : undefined;
    return this.http.get<ListResponse<Site>>('/v1/sites', validatedParams as Record<string, any> | undefined);
  }

  /**
   * Get a single site
   * 
   * @param siteId - The ID of the site
   * @returns Promise with site information
   */
  async get(siteId: string): Promise<Site> {
    if (!siteId) throw new Error('Site ID is required');
    return this.http.get<Site>(`/v1/sites/${siteId}`);
  }

  /**
   * Create a new site
   * 
   * @param params - Site creation parameters
   * @returns Promise with the created site
   */
  async create(params: CreateSiteParams): Promise<Site> {
    const validatedParams = validate(createSiteSchema, params);
      return this.http.post<Site>('/v1/sites', validatedParams as Record<string, any> | undefined);
  }

  /**
   * Update a site
   * 
   * @param siteId - The ID of the site
   * @param params - Site update parameters
   * @returns Promise with the updated site
   */
  async update(siteId: string, params: UpdateSiteParams): Promise<Site> {
    if (!siteId) throw new Error('Site ID is required');
    const validatedParams = validate(updateSiteSchema, params);
      return this.http.post<Site>(`/v1/sites/${siteId}`, validatedParams);
  }

  /**
   * Wipe all data from a site
   * 
   * @param siteId - The ID of the site
   * @returns Promise with the wiped site
   */
  async wipe(siteId: string): Promise<WipedSite> {
    if (!siteId) throw new Error('Site ID is required');
    return this.http.delete<WipedSite>(`/v1/sites/${siteId}/data`);
  }

  /**
   * Delete a site
   * 
   * @param siteId - The ID of the site
   * @returns Promise with the deleted site
   */
  async delete(siteId: string): Promise<DeletedSite> {
    if (!siteId) throw new Error('Site ID is required');
    return this.http.delete<DeletedSite>(`/v1/sites/${siteId}`);
  }
}