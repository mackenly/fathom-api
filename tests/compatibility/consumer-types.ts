/**
 * Compile-time contract for the public SDK.
 * `npm run lint` typechecks this file. Vitest does not execute it.
 * Call sites below use only the documented options, so a breaking signature
 * or response field fails the build.
 */
import FathomApi, {
  FathomApiError,
  FathomApiV1,
  HttpClient,
  type Account,
  type AggregationParams,
  type ApiVersion,
  type CurrentVisitorsResponse,
  type DeletedEvent,
  type DeletedSite,
  type Event,
  type FathomClientOptions,
  type ListResponse,
  type Site,
  type WipedEvent,
  type WipedSite,
} from '../../src';

export async function consumerContract(token: string): Promise<void> {
  const options: FathomClientOptions = {
    token,
    version: 'v1',
    baseUrl: 'https://api.usefathom.com',
  };
  const version: ApiVersion = 'v1';
  const fathom = new FathomApi({ ...options, version });
  const http = new HttpClient({ token });
  const v1: FathomApiV1 = new FathomApiV1(http);
  const api = fathom.version('v1');

  const account: Account = await api.account.get();
  const accountName: string = account.name;
  const accountEmail: string = account.email;
  const accountObject: 'account' = account.object;

  const sameAccount: Account = await fathom.api.getAccount();
  const listedSites: ListResponse<Site> = await api.sites.list({
    limit: 20,
    starting_after: 'ABCDEF',
    ending_before: 'ZZZZZZ',
  });
  const listObject: 'list' = listedSites.object;
  const hasMore: boolean = listedSites.has_more;
  const listUrl: string = listedSites.url;
  const firstSite: Site | undefined = listedSites.data[0];

  const created: Site = await api.sites.create({ name: 'My New Website' });
  const privateSite: Site = await api.sites.create({
    name: 'Private Website',
    sharing: 'private',
    share_password: 'password123',
  });
  const sharing: 'none' | 'private' | 'public' = privateSite.sharing;
  const updated: Site = await api.sites.update(created.id, { name: 'Updated Website Name' });
  const madePublic: Site = await api.sites.update(created.id, { sharing: 'public' });
  const wipedSite: WipedSite = await api.sites.wipe(created.id);
  const deletedSite: DeletedSite = await api.sites.delete(created.id);
  const siteWasWiped: boolean = wipedSite.wiped;
  const siteWasDeleted: boolean = deletedSite.deleted;

  const events = api.events(created.id);
  const listedEvents: ListResponse<Event> = await events.list({ limit: 20 });
  const createdEvent: Event = await events.create({ name: 'Newsletter Signup' });
  const eventSiteId: string = createdEvent.site_id;
  const updatedEvent: Event = await events.update(createdEvent.id, { name: 'Updated Event Name' });
  const wipedEvent: WipedEvent = await events.wipe(createdEvent.id);
  const deletedEvent: DeletedEvent = await events.delete(createdEvent.id);
  const eventWasWiped: boolean = wipedEvent.wiped;
  const eventWasDeleted: boolean = deletedEvent.deleted;

  const groupBy: 'hour' | 'day' | 'month' | 'year' = 'day';
  const report = await api.reports.aggregation({
    entity: 'pageview',
    entity_id: created.id,
    aggregates: 'visits,uniques,pageviews',
    date_grouping: 'day',
    field_grouping: 'pathname',
    sort_by: 'pageviews:desc',
    timezone: 'UTC',
    date_from: '2022-01-01',
    date_to: '2022-01-31',
    limit: 20,
    filters: [{ property: 'pathname', operator: 'is', value: '/blog' }],
  });
  const reportRow: Record<string, unknown> | undefined = report[0];
  const aggregation: AggregationParams = {
    entity: 'event',
    entity_id: createdEvent.id,
    aggregates: 'conversions,unique_conversions',
    date_grouping: 'month',
  };
  await api.reports.aggregation(aggregation);

  const visitors: CurrentVisitorsResponse = await api.reports.currentVisitors({
    site_id: created.id,
    detailed: true,
  });
  const visitorTotal: number = visitors.total;
  const visitorPath: string | undefined = visitors.content?.[0]?.pathname;
  const visitorReferrer: string | undefined = visitors.referrers?.[0]?.referrer_hostname;

  const stats = await api.reports.getPageviewStats(created.id, {
    dateFrom: '2022-01-01',
    dateTo: '2022-01-31',
    timezone: 'UTC',
    groupBy,
    limit: 10,
  });
  const statVisits: number | undefined = stats[0]?.visits;
  const statUniques: number | undefined = stats[0]?.uniques;
  const statPageviews: number | undefined = stats[0]?.pageviews;
  const statBounce: number | undefined = stats[0]?.bounce_rate;
  const statDuration: number | undefined = stats[0]?.avg_duration;
  const statDate: string | undefined = stats[0]?.date;

  const pages = await api.reports.getTopPages(created.id, { limit: 5 });
  const topPath: string | undefined = pages[0]?.pathname;
  const referrers = await api.reports.getReferrerSources(created.id);
  const referrerHost: string | undefined = referrers[0]?.referrer_hostname;
  const conversions = await api.reports.getEventConversions(created.id, createdEvent.id, {
    groupBy,
  });
  const conversionCount: number | undefined = conversions[0]?.conversions;
  const uniqueConversions: number | undefined = conversions[0]?.unique_conversions;

  const allSites: Site[] = await api.getAllSites(10);
  const allEvents: Event[] = await api.getAllEvents(created.id, 10);
  const oneSite: Site = await api.getSite(created.id);
  const oneEvent: Event = await api.getEvent(created.id, createdEvent.id);
  const current: CurrentVisitorsResponse = await api.getCurrentVisitors(created.id, true);
  const directAccount: Account = await v1.getAccount();

  try {
    await api.sites.get('missing');
  } catch (error: unknown) {
    if (error instanceof FathomApiError) {
      const status: number = error.status;
      const details: string = error.error;
      const message: string = error.message;
      void { status, details, message };
    }
  }

  // Read every field above so a removed or retyped response property fails compilation.
  void {
    accountName,
    accountEmail,
    accountObject,
    sameAccount,
    listObject,
    hasMore,
    listUrl,
    firstSite,
    updated,
    madePublic,
    sharing,
    siteWasWiped,
    siteWasDeleted,
    listedEvents,
    eventSiteId,
    updatedEvent,
    eventWasWiped,
    eventWasDeleted,
    reportRow,
    visitorTotal,
    visitorPath,
    visitorReferrer,
    statVisits,
    statUniques,
    statPageviews,
    statBounce,
    statDuration,
    statDate,
    topPath,
    referrerHost,
    conversionCount,
    uniqueConversions,
    allSites,
    allEvents,
    oneSite,
    oneEvent,
    current,
    directAccount,
  };
}
