import type { Account } from '../../types/entities.ts';
import { HttpClient } from '../../utils/http';

/**
 * Account API resource
 */
export class AccountResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get account information
   * 
   * @returns Promise with account information
   */
  async get(): Promise<Account> {
    return this.http.get<Account>('/v1/account');
  }
}