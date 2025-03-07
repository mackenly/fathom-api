import type { ErrorResponse, FathomClientOptions, HttpMethod } from '../types/base';

/**
 * Error class for Fathom API errors
 */
export class FathomApiError extends Error {
  status: number;
  error: string;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'FathomApiError';
    this.status = status;
    this.error = message;
  }
}

/**
 * Core HTTP client for making API requests
 */
export class HttpClient {
  private baseUrl: string;
  private token: string;
  private headers: HeadersInit;

  constructor(options: FathomClientOptions) {
    this.baseUrl = options.baseUrl || 'https://api.usefathom.com';
    this.token = options.token;
    this.headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Make an HTTP request to the Fathom API
   * 
   * @param method - HTTP method
   * @param path - API endpoint path
   * @param params - Query parameters
   * @param data - Request body for POST/PUT requests
   * @returns Promise with the response data
   * @throws FathomApiError if the API returns an error
   */
  async request<T>(
    method: HttpMethod,
    path: string,
    params?: Record<string, any>,
    data?: Record<string, any>
  ): Promise<T> {
    // Prepare URL with query parameters
    const url = new URL(path, this.baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          // Handle array parameters
          if (Array.isArray(value)) {
            // If it's filters which is a complex object array
            if (key === 'filters' && value.length > 0) {
              url.searchParams.append(key, JSON.stringify(value));
            } else {
              // For simple string arrays
              value.forEach(item => {
                url.searchParams.append(key, String(item));
              });
            }
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      });
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: this.headers,
      // Credentials needed for auth to work properly across different environments
      credentials: 'same-origin'
    };

    // Add request body for non-GET requests
    if (method !== 'GET' && data) {
      requestOptions.body = JSON.stringify(data);
    }

    try {
      // Make the request
      const response = await fetch(url.toString(), requestOptions);
      const responseData = await response.json();

      // Handle API errors
      if (!response.ok) {
        const errorResponse = responseData as ErrorResponse;

        // if a 401 error is returned, it's likely an authentication issue
        if (response.status === 401) {
          throw new FathomApiError(
            'Authentication error: please check your API token',
            response.status
          );
        }
        
        throw new FathomApiError(
          errorResponse.error || 'Unknown error occurred',
          response.status
        );
      }

      return responseData as T;
    } catch (error) {
      // If it's already a FathomApiError, just rethrow it
      if (error instanceof FathomApiError) {
        throw error;
      }
      
      // Otherwise wrap it in a FathomApiError with a generic message
      throw new FathomApiError(
        `Request failed: ${error instanceof Error ? error.message : String(error)}`,
        500
      );
    }
  }

  /**
   * Make a GET request to the Fathom API
   */
  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>('GET', path, params);
  }

  /**
   * Make a POST request to the Fathom API
   */
  async post<T>(path: string, data?: Record<string, any>, params?: Record<string, any>): Promise<T> {
    return this.request<T>('POST', path, params, data);
  }

  /**
   * Make a DELETE request to the Fathom API
   */
  async delete<T>(path: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>('DELETE', path, params);
  }
}