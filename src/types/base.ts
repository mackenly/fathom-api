/**
 * Fathom Analytics API version
 */
export type ApiVersion = 'v1';

/**
 * Configuration options for the Fathom Analytics client
 */
export interface FathomClientOptions {
  /**
   * API token for authentication
   */
  token: string;
  
  /**
   * API version to use
   * @default 'v1'
   */
  version?: ApiVersion;
  
  /**
   * Base URL for the API
   * @default 'https://api.usefathom.com'
   */
  baseUrl?: string;
}

/**
 * Pagination parameters for list endpoints
 */
export interface PaginationParams {
  /**
   * A limit on the number of objects to be returned, between 1 and 100
   * @default 10
   */
  limit?: number;
  
  /**
   * A cursor for pagination/navigation.
   * An object ID that specifies the starting point for pagination
   */
  starting_after?: string;
  
  /**
   * A cursor for pagination/navigation.
   * An object ID that specifies the ending point for pagination
   */
  ending_before?: string;
}

/**
 * Common response structure for list endpoints
 */
export interface ListResponse<T> {
  object: 'list';
  url: string;
  has_more: boolean;
  data: T[];
}

/**
 * Error response from the API
 */
export interface ErrorResponse {
  error: string;
  message?: string;
}

/**
 * HTTP methods supported by the API
 */
export type HttpMethod = 'GET' | 'POST' | 'DELETE';