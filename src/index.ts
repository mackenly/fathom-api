import { ApiVersion, FathomClientOptions } from './types/base';
import { HttpClient } from './utils/http';
import { FathomApiV1 } from './api/v1/index';
import { clientOptionsSchema, validate } from './utils/validation';

/**
 * Fathom Analytics API SDK
 * A fully typed client for interacting with the Fathom Analytics API
 * @link https://github.com/mackenly/fathom-api
 * @link https://usefathom.com/docs/api
 */
export class FathomApi {
  private http: HttpClient;
  private v1: FathomApiV1;

  /**
   * Create a new Fathom API client
   * 
   * @param options - Client configuration options
   */
  constructor(options: FathomClientOptions) {
    // Validate options
    const validatedOptions = validate(clientOptionsSchema, options);
    
    this.http = new HttpClient(validatedOptions);
    this.v1 = new FathomApiV1(this.http);
  }

  /**
   * Access the v1 API
   * 
   * @returns Fathom Analytics API v1 client
   */
  public get api(): FathomApiV1 {
    return this.v1;
  }

  /**
   * Access a specific version of the API
   * 
   * @param version - API version to use
   * @returns API client for the specified version
   */
  public version(version: ApiVersion): FathomApiV1 {
    if (version === 'v1') {
      return this.v1;
    }

    throw new Error(`API version '${version}' is not supported`);
  }
}

// Export all types for user convenience
export * from './types/base';
export * from './types/entities';
export * from './types/params';
export * from './utils/http';
export * from './utils/validation';

// Export API resources for advanced usage
export * from './api/v1/index';

// Default export
export default FathomApi;