import type { ListResponse } from './base';

/**
 * Base interface for all Fathom API objects
 */
export interface FathomObject {
  id: string;
  object: string;
}

/**
 * Account entity
 */
export interface Account extends FathomObject {
  object: 'account';
  name: string;
  email: string;
}

/**
 * Site entity
 */
export interface Site extends FathomObject {
  object: 'site';
  name: string;
  sharing: 'none' | 'private' | 'public';
  created_at: string;
}

/**
 * Site with deletion status
 */
export interface DeletedSite extends Site {
  deleted: boolean;
}

/**
 * Site with data wiping status
 */
export interface WipedSite extends Site {
  wiped: boolean;
}

/**
 * Event entity
 */
export interface Event extends FathomObject {
  object: 'event';
  name: string;
  site_id: string;
  created_at: string;
}

/**
 * Event with deletion status
 */
export interface DeletedEvent extends Event {
  deleted: boolean;
}

/**
 * Event with data wiping status
 */
export interface WipedEvent extends Event {
  wiped: boolean;
}

/**
 * Content entry for current visitors breakdown
 */
export interface ContentEntry {
  pathname: string;
  hostname: string;
  total: number;
}

/**
 * Referrer entry for current visitors breakdown
 */
export interface ReferrerEntry {
  referrer_hostname: string;
  referrer_pathname: string;
  total: number;
}

/**
 * Current visitors response
 */
export interface CurrentVisitorsResponse {
  total: number;
  content?: ContentEntry[];
  referrers?: ReferrerEntry[];
}