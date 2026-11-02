import { describe, expect, it } from "vitest";
import FathomDefault, * as sdk from "../../src";
import { FathomApi, FathomApiError } from "../../src";

/**
 * Runtime surface published from the package entry.
 * Adding or removing a value export is a compatibility change and should update this list.
 */
const runtimeExports = [
	"FathomApi",
	"FathomApiError",
	"FathomApiV1",
	"HttpClient",
	"aggregationParamsSchema",
	"aggregationSchema",
	"clientOptionsSchema",
	"createEventSchema",
	"createSiteSchema",
	"currentVisitorsParamsSchema",
	"currentVisitorsSchema",
	"default",
	"paginationSchema",
	"updateEventSchema",
	"updateSiteSchema",
	"validate",
];

const schemaExports = [
	"aggregationParamsSchema",
	"aggregationSchema",
	"clientOptionsSchema",
	"createEventSchema",
	"createSiteSchema",
	"currentVisitorsParamsSchema",
	"currentVisitorsSchema",
	"paginationSchema",
	"updateEventSchema",
	"updateSiteSchema",
] as const;

function prototypeMembers(value: object): string[] {
	return Object.getOwnPropertyNames(Object.getPrototypeOf(value))
		.filter((name) => name !== "constructor")
		.sort();
}

describe("public SDK surface", () => {
	it("publishes a stable set of runtime exports", () => {
		expect(Object.keys(sdk).sort()).toEqual(runtimeExports);
	});

	it("keeps the default export aligned with FathomApi", () => {
		expect(FathomDefault).toBe(sdk.FathomApi);
		expect(sdk.default).toBe(sdk.FathomApi);
	});

	it("keeps schema aliases bound to the same object", () => {
		expect(sdk.aggregationSchema).toBe(sdk.aggregationParamsSchema);
		expect(sdk.currentVisitorsSchema).toBe(sdk.currentVisitorsParamsSchema);
	});

	it("keeps zod schemas callable after a dependency upgrade", () => {
		for (const name of schemaExports) {
			expect(typeof sdk[name].parse).toBe("function");
		}

		expect(sdk.validate(sdk.clientOptionsSchema, { token: "abc" })).toEqual({ token: "abc" });
		expect(() => sdk.validate(sdk.clientOptionsSchema, { token: "" })).toThrow(FathomApiError);
		expect(() => sdk.validate(sdk.clientOptionsSchema, { token: "" })).toThrow(/Validation error/);
	});

	it("keeps the documented methods on each resource", () => {
		const fathom = new FathomApi({ token: "test-token" });

		expect(prototypeMembers(fathom)).toEqual(["api", "version"]);
		expect(prototypeMembers(fathom.api)).toEqual([
			"events",
			"getAccount",
			"getAllEvents",
			"getAllSites",
			"getCurrentVisitors",
			"getEvent",
			"getSite",
		]);
		expect(prototypeMembers(fathom.api.account)).toEqual(["get"]);
		expect(prototypeMembers(fathom.api.sites)).toEqual([
			"create",
			"delete",
			"get",
			"list",
			"update",
			"wipe",
		]);
		expect(prototypeMembers(fathom.api.events("ABCDEF"))).toEqual([
			"create",
			"delete",
			"get",
			"list",
			"update",
			"wipe",
		]);
		expect(prototypeMembers(fathom.api.reports)).toEqual([
			"aggregation",
			"currentVisitors",
			"getEventConversions",
			"getPageviewStats",
			"getReferrerSources",
			"getTopPages",
		]);
		expect(typeof fathom.api.account.get).toBe("function");
		expect(fathom.api).toBe(fathom.version("v1"));
	});
});
