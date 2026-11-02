import type { DefaultBodyType } from "msw";
import { describe, expect, it } from "vitest";
import { FathomApi, type FathomApiV1 } from "../../src";
import { expectSingleRequest } from "../expect-request";
import { accountFixture, currentVisitorsFixture, eventFixture, siteFixture } from "../fixtures";
import { recordRequests } from "../test-setup";

/**
 * Wire contract for every documented Fathom endpoint this SDK calls.
 * A passing run means each public resource method still sends the method,
 * path, query, body, and bearer token the Fathom API expects, and returns
 * the response body unchanged.
 */
interface ContractCase {
	name: string;
	response: DefaultBodyType;
	call: (api: FathomApiV1) => Promise<unknown>;
	method: "GET" | "POST" | "DELETE";
	pathname: string;
	search?: Record<string, string | string[]>;
	body?: unknown;
}

const aggregationFilters = [
	{ property: "pathname", operator: "is not" as const, value: "/blog" },
	{ property: "hostname", operator: "is like" as const, value: "%example%" },
];

const cases: ContractCase[] = [
	{
		name: "GET /v1/account",
		response: accountFixture,
		call: (api) => api.account.get(),
		method: "GET",
		pathname: "/v1/account",
	},
	{
		name: "GET /v1/sites",
		response: {
			object: "list",
			url: "/v1/sites",
			has_more: false,
			data: [siteFixture],
		},
		call: (api) => api.sites.list(),
		method: "GET",
		pathname: "/v1/sites",
	},
	{
		name: "GET /v1/sites with pagination cursors",
		response: {
			object: "list",
			url: "/v1/sites",
			has_more: true,
			data: [siteFixture],
		},
		call: (api) => api.sites.list({ limit: 20, starting_after: "XYZ", ending_before: "ABC" }),
		method: "GET",
		pathname: "/v1/sites",
		search: { limit: "20", starting_after: "XYZ", ending_before: "ABC" },
	},
	{
		name: "GET /v1/sites/:id",
		response: siteFixture,
		call: (api) => api.sites.get("ABCDEF"),
		method: "GET",
		pathname: "/v1/sites/ABCDEF",
	},
	{
		name: "POST /v1/sites",
		response: siteFixture,
		call: (api) => api.sites.create({ name: "Test Site" }),
		method: "POST",
		pathname: "/v1/sites",
		body: { name: "Test Site" },
	},
	{
		name: "POST /v1/sites with private sharing",
		response: { ...siteFixture, sharing: "private" },
		call: (api) =>
			api.sites.create({
				name: "Test Site",
				sharing: "private",
				share_password: "secret",
			}),
		method: "POST",
		pathname: "/v1/sites",
		body: { name: "Test Site", sharing: "private", share_password: "secret" },
	},
	{
		name: "POST /v1/sites/:id",
		response: { ...siteFixture, name: "Renamed" },
		call: (api) => api.sites.update("ABCDEF", { name: "Renamed" }),
		method: "POST",
		pathname: "/v1/sites/ABCDEF",
		body: { name: "Renamed" },
	},
	{
		name: "DELETE /v1/sites/:id/data",
		response: { ...siteFixture, wiped: true },
		call: (api) => api.sites.wipe("ABCDEF"),
		method: "DELETE",
		pathname: "/v1/sites/ABCDEF/data",
	},
	{
		name: "DELETE /v1/sites/:id",
		response: { ...siteFixture, deleted: true },
		call: (api) => api.sites.delete("ABCDEF"),
		method: "DELETE",
		pathname: "/v1/sites/ABCDEF",
	},
	{
		name: "GET /v1/sites/:id/events",
		response: {
			object: "list",
			url: "/v1/sites/ABCDEF/events",
			has_more: false,
			data: [eventFixture],
		},
		call: (api) => api.events("ABCDEF").list({ limit: 10, starting_after: "EV1" }),
		method: "GET",
		pathname: "/v1/sites/ABCDEF/events",
		search: { limit: "10", starting_after: "EV1" },
	},
	{
		name: "GET /v1/sites/:id/events/:event_id",
		response: eventFixture,
		call: (api) => api.events("ABCDEF").get("EV123"),
		method: "GET",
		pathname: "/v1/sites/ABCDEF/events/EV123",
	},
	{
		name: "POST /v1/sites/:id/events",
		response: eventFixture,
		call: (api) => api.events("ABCDEF").create({ name: "Newsletter Signup" }),
		method: "POST",
		pathname: "/v1/sites/ABCDEF/events",
		body: { name: "Newsletter Signup" },
	},
	{
		name: "POST /v1/sites/:id/events/:event_id",
		response: { ...eventFixture, name: "Renamed event" },
		call: (api) => api.events("ABCDEF").update("EV123", { name: "Renamed event" }),
		method: "POST",
		pathname: "/v1/sites/ABCDEF/events/EV123",
		body: { name: "Renamed event" },
	},
	{
		name: "DELETE /v1/sites/:id/events/:event_id/data",
		response: { ...eventFixture, wiped: true },
		call: (api) => api.events("ABCDEF").wipe("EV123"),
		method: "DELETE",
		pathname: "/v1/sites/ABCDEF/events/EV123/data",
	},
	{
		name: "DELETE /v1/sites/:id/events/:event_id",
		response: { ...eventFixture, deleted: true },
		call: (api) => api.events("ABCDEF").delete("EV123"),
		method: "DELETE",
		pathname: "/v1/sites/ABCDEF/events/EV123",
	},
	{
		name: "GET /v1/aggregations",
		response: [{ visits: 10, pageviews: 12 }],
		call: (api) =>
			api.reports.aggregation({
				entity: "pageview",
				entity_id: "ABCDEF",
				aggregates: "visits,pageviews",
			}),
		method: "GET",
		pathname: "/v1/aggregations",
		search: {
			entity: "pageview",
			entity_id: "ABCDEF",
			aggregates: "visits,pageviews",
		},
	},
	{
		name: "GET /v1/aggregations with filters encoded as one JSON parameter",
		response: [{ pathname: "/blog", visits: 4 }],
		call: (api) =>
			api.reports.aggregation({
				entity: "event",
				entity_id: "EV123",
				aggregates: "conversions,unique_conversions",
				date_grouping: "day",
				field_grouping: "pathname",
				sort_by: "conversions:desc",
				timezone: "UTC",
				date_from: "2022-01-01",
				date_to: "2022-01-31",
				limit: 25,
				filters: aggregationFilters,
			}),
		method: "GET",
		pathname: "/v1/aggregations",
		search: {
			entity: "event",
			entity_id: "EV123",
			aggregates: "conversions,unique_conversions",
			date_grouping: "day",
			field_grouping: "pathname",
			sort_by: "conversions:desc",
			timezone: "UTC",
			date_from: "2022-01-01",
			date_to: "2022-01-31",
			limit: "25",
			filters: JSON.stringify(aggregationFilters),
		},
	},
	{
		name: "GET /v1/current_visitors",
		response: { total: 3 },
		call: (api) => api.reports.currentVisitors({ site_id: "ABCDEF" }),
		method: "GET",
		pathname: "/v1/current_visitors",
		search: { site_id: "ABCDEF" },
	},
	{
		name: "GET /v1/current_visitors?detailed=true",
		response: currentVisitorsFixture,
		call: (api) => api.reports.currentVisitors({ site_id: "ABCDEF", detailed: true }),
		method: "GET",
		pathname: "/v1/current_visitors",
		search: { site_id: "ABCDEF", detailed: "true" },
	},
];

describe("Fathom HTTP contract", () => {
	it.each(cases)("$name", async (testCase) => {
		const requests = recordRequests(testCase.response);
		const api = new FathomApi({ token: "test-token" }).api;

		await expect(testCase.call(api)).resolves.toEqual(testCase.response);
		expectSingleRequest(requests, {
			method: testCase.method,
			pathname: testCase.pathname,
			search: testCase.search,
			body: testCase.body,
		});
	});
});
