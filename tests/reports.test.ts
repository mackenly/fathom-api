import { describe, expect, it } from "vitest";
import { FathomApi, FathomApiError } from "../src";
import { expectSingleRequest } from "./expect-request";
import { recordRequests } from "./test-setup";

function reports() {
	return new FathomApi({ token: "test-token" }).api.reports;
}

const pageviewAggregates = "visits,uniques,pageviews,bounce_rate,avg_duration";

describe("ReportsResource", () => {
	describe("convenience reports", () => {
		it("requests daily-ready pageview stats in UTC when no options are passed", async () => {
			const requests = recordRequests([]);

			await expect(reports().getPageviewStats("ABCDEF")).resolves.toEqual([]);
			expectSingleRequest(requests, {
				method: "GET",
				pathname: "/v1/aggregations",
				search: {
					entity: "pageview",
					entity_id: "ABCDEF",
					aggregates: pageviewAggregates,
					timezone: "UTC",
				},
			});
		});

		it("forwards pageview stat options onto the aggregation query", async () => {
			const requests = recordRequests([
				{
					date: "2022-01-01",
					visits: 1,
					uniques: 1,
					pageviews: 1,
					bounce_rate: 0,
					avg_duration: 0,
				},
			]);

			const stats = await reports().getPageviewStats("ABCDEF", {
				dateFrom: "2022-01-01",
				dateTo: "2022-01-31",
				timezone: "America/Chicago",
				groupBy: "month",
				limit: 5,
			});

			expect(stats[0].visits).toBe(1);
			expectSingleRequest(requests, {
				method: "GET",
				pathname: "/v1/aggregations",
				search: {
					entity: "pageview",
					entity_id: "ABCDEF",
					aggregates: pageviewAggregates,
					timezone: "America/Chicago",
					date_grouping: "month",
					date_from: "2022-01-01",
					date_to: "2022-01-31",
					limit: "5",
				},
			});
		});

		it("requests top pages sorted by pageviews", async () => {
			const requests = recordRequests([]);

			await reports().getTopPages("ABCDEF", { limit: 5, timezone: "UTC", dateFrom: "2022-01-01" });
			expectSingleRequest(requests, {
				method: "GET",
				pathname: "/v1/aggregations",
				search: {
					entity: "pageview",
					entity_id: "ABCDEF",
					aggregates: pageviewAggregates,
					field_grouping: "pathname",
					sort_by: "pageviews:desc",
					timezone: "UTC",
					date_from: "2022-01-01",
					limit: "5",
				},
			});
		});

		it("defaults the top-page limit to 20", async () => {
			const requests = recordRequests([]);

			await reports().getTopPages("ABCDEF");
			expectSingleRequest(requests, {
				method: "GET",
				pathname: "/v1/aggregations",
				search: {
					entity: "pageview",
					entity_id: "ABCDEF",
					aggregates: pageviewAggregates,
					field_grouping: "pathname",
					sort_by: "pageviews:desc",
					timezone: "UTC",
					limit: "20",
				},
			});
		});

		it("requests referrers sorted by visits", async () => {
			const requests = recordRequests([]);

			await reports().getReferrerSources("ABCDEF", { dateTo: "2022-01-31" });
			expectSingleRequest(requests, {
				method: "GET",
				pathname: "/v1/aggregations",
				search: {
					entity: "pageview",
					entity_id: "ABCDEF",
					aggregates: "visits,uniques",
					field_grouping: "referrer_hostname",
					sort_by: "visits:desc",
					timezone: "UTC",
					date_to: "2022-01-31",
					limit: "20",
				},
			});
		});

		it("requests event conversions for the event id", async () => {
			const requests = recordRequests([
				{ date: "2022-01-01", conversions: 2, unique_conversions: 1 },
			]);

			const rows = await reports().getEventConversions("ABCDEF", "EV123", { groupBy: "day" });

			expect(rows).toEqual([{ date: "2022-01-01", conversions: 2, unique_conversions: 1 }]);
			expectSingleRequest(requests, {
				method: "GET",
				pathname: "/v1/aggregations",
				search: {
					entity: "event",
					entity_id: "EV123",
					aggregates: "conversions,unique_conversions",
					date_grouping: "day",
					timezone: "UTC",
				},
			});
		});
	});

	describe("validation", () => {
		it("rejects incomplete aggregation and visitor queries before any request", async () => {
			await expect(
				reports().aggregation({
					entity: "pageview",
					entity_id: "",
					aggregates: "visits",
				}),
			).rejects.toThrow(FathomApiError);

			await expect(
				reports().aggregation({
					entity: "pageview",
					entity_id: "ABCDEF",
					aggregates: "visits",
					filters: [{ property: "pathname", operator: "contains", value: "/" } as never],
				}),
			).rejects.toThrow(/operator/);

			await expect(reports().currentVisitors({ site_id: "" })).rejects.toThrow(FathomApiError);
			await expect(reports().getPageviewStats("")).rejects.toThrow(FathomApiError);
			await expect(reports().getTopPages("")).rejects.toThrow(FathomApiError);
			await expect(reports().getReferrerSources("")).rejects.toThrow(FathomApiError);
			await expect(reports().getEventConversions("ABCDEF", "")).rejects.toThrow(FathomApiError);
		});
	});
});
