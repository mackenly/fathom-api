import type { ListResponse, PaginationParams } from '../../types/base';
import type { DeletedEvent, Event, WipedEvent } from '../../types/entities';
import type { CreateEventParams, UpdateEventParams } from '../../types/params';
import { HttpClient } from '../../utils/http';
import { createEventSchema, paginationSchema, updateEventSchema, validate } from '../../utils/validation';

/**
 * Events API resource
 */
export class EventsResource {
  constructor(
    private readonly http: HttpClient,
    private readonly siteId: string
  ) {
    if (!siteId) throw new Error('Site ID is required');
  }

  /**
   * List all events for a site
   * 
   * @param params - Pagination parameters
   * @returns Promise with a list of events
   */
  async list(params?: PaginationParams): Promise<ListResponse<Event>> {
    const validatedParams = params ? validate(paginationSchema, params) : undefined;
    return this.http.get<ListResponse<Event>>(`/v1/sites/${this.siteId}/events`, validatedParams);
  }

  /**
   * Get a single event
   * 
   * @param eventId - The ID of the event
   * @returns Promise with event information
   */
  async get(eventId: string): Promise<Event> {
    if (!eventId) throw new Error('Event ID is required');
    return this.http.get<Event>(`/v1/sites/${this.siteId}/events/${eventId}`);
  }

  /**
   * Create a new event
   * 
   * @param params - Event creation parameters
   * @returns Promise with the created event
   */
  async create(params: CreateEventParams): Promise<Event> {
    const validatedParams = validate(createEventSchema, params);
    return this.http.post<Event>(`/v1/sites/${this.siteId}/events`, validatedParams);
  }

  /**
   * Update an event
   * 
   * @param eventId - The ID of the event
   * @param params - Event update parameters
   * @returns Promise with the updated event
   */
  async update(eventId: string, params: UpdateEventParams): Promise<Event> {
    if (!eventId) throw new Error('Event ID is required');
    const validatedParams = validate(updateEventSchema, params);
    return this.http.post<Event>(`/v1/sites/${this.siteId}/events/${eventId}`, validatedParams);
  }

  /**
   * Wipe all data from an event
   * 
   * @param eventId - The ID of the event
   * @returns Promise with the wiped event
   */
  async wipe(eventId: string): Promise<WipedEvent> {
    if (!eventId) throw new Error('Event ID is required');
    return this.http.delete<WipedEvent>(`/v1/sites/${this.siteId}/events/${eventId}/data`);
  }

  /**
   * Delete an event
   * 
   * @param eventId - The ID of the event
   * @returns Promise with the deleted event
   */
  async delete(eventId: string): Promise<DeletedEvent> {
    if (!eventId) throw new Error('Event ID is required');
    return this.http.delete<DeletedEvent>(`/v1/sites/${this.siteId}/events/${eventId}`);
  }
}