import { rest } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import { FathomApiError, HttpClient } from "../src/utils/http";
import { expectSingleRequest } from "./expect-request";
import { createMockHandler, recordRequests, server } from "./test-setup";

async function expectFailure(request: Promise<unknown>) {
	const error = await request.then(
		() => null,
		(caught: unknown) => caught,
	);

	expect(error).toBeInstanceOf(FathomApiError);
	expect(error).toMatchObject({ status: 500 });
	expect((error as FathomApiError).message).toMatch(/Request failed/);
}

describe("HttpClient", () => {
	const client = new HttpClient({
		token: "test-token",
		baseUrl: "https://api.usefathom.com",
	});

	beforeEach(() => {
		server.resetHandlers();
	});

	describe("get", () => {
		it("should make a successful GET request", async () => {
			server.use(createMockHandler("get", "/v1/test", { success: true }));

			const response = await client.get("/v1/test");
			expect(response).toEqual({ success: true });
		});

		it("should handle query parameters correctly", async () => {
			server.use(
				rest.get("https://api.usefathom.com/v1/test", (req, res, ctx) => {
					const param1 = req.url.searchParams.get("param1");
					const param2 = req.url.searchParams.get("param2");

					return res(ctx.status(200), ctx.json({ param1, param2 }));
				}),
			);

			const response = await client.get("/v1/test", {
				param1: "value1",
				param2: "value2",
			});

			expect(response).toEqual({
				param1: "value1",
				param2: "value2",
			});
		});

		it("should handle API errors correctly", async () => {
			server.use(createMockHandler("get", "/v1/error", { error: "Test error message" }, 400));

			await expect(client.get("/v1/error")).rejects.toThrow(FathomApiError);
			await expect(client.get("/v1/error")).rejects.toMatchObject({
				error: "Test error message",
				status: 400,
			});
		});
	});

	describe("post", () => {
		it("should make a successful POST request with body", async () => {
			server.use(
				rest.post("https://api.usefathom.com/v1/test", async (req, res, ctx) => {
					const body = await req.json();
					return res(ctx.status(200), ctx.json({ received: body }));
				}),
			);

			const requestBody = { name: "Test Name" };
			const response = await client.post("/v1/test", requestBody);

			expect(response).toEqual({
				received: requestBody,
			});
		});
	});

	describe("delete", () => {
		it("should make a successful DELETE request", async () => {
			server.use(createMockHandler("delete", "/v1/test/123", { deleted: true }));

			const response = await client.delete("/v1/test/123");
			expect(response).toEqual({ deleted: true });
		});
	});

	describe("request contract", () => {
		it("sends the bearer token and JSON headers", async () => {
			const requests = recordRequests({ ok: true });

			await client.get("/v1/account");

			expectSingleRequest(requests, {
				method: "GET",
				pathname: "/v1/account",
			});
			expect(requests[0].href).toBe("https://api.usefathom.com/v1/account");
		});

		it("uses the Fathom host when baseUrl is omitted", async () => {
			const requests = recordRequests({ ok: true });
			const defaultClient = new HttpClient({ token: "test-token" });

			await defaultClient.get("/v1/account");

			expect(requests[0].origin).toBe("https://api.usefathom.com");
		});

		it("serializes filters as one JSON query parameter and repeats plain arrays", async () => {
			const filters = [{ property: "pathname", operator: "is not", value: "/blog" }];
			const requests = recordRequests({ ok: true });

			await client.get("/v1/aggregations", {
				entity: "pageview",
				tag: ["a", "b"],
				detailed: false,
				skip: undefined,
				filters,
			});

			expectSingleRequest(requests, {
				method: "GET",
				pathname: "/v1/aggregations",
				search: {
					entity: "pageview",
					tag: ["a", "b"],
					detailed: "false",
					filters: JSON.stringify(filters),
				},
			});
		});

		it("puts POST query parameters on the URL and the payload in the body", async () => {
			const requests = recordRequests({ ok: true });

			await client.post("/v1/sites", { name: "Example" }, { limit: 1 });

			expectSingleRequest(requests, {
				method: "POST",
				pathname: "/v1/sites",
				search: { limit: "1" },
				body: { name: "Example" },
			});
		});
	});

	describe("error responses", () => {
		it("replaces a 401 body with an authentication error", async () => {
			server.use(createMockHandler("get", "/v1/account", { error: "bad token" }, 401));

			await expect(client.get("/v1/account")).rejects.toMatchObject({
				status: 401,
				error: "Authentication error: please check your API token",
			});
		});

		it("uses the message field when a 400 body has no error field", async () => {
			server.use(createMockHandler("get", "/v1/sites", { message: "limit is invalid" }, 400));

			await expect(client.get("/v1/sites")).rejects.toMatchObject({
				status: 400,
				error: "limit is invalid",
			});
		});

		it("uses a fallback message when the error body is empty", async () => {
			server.use(createMockHandler("get", "/v1/sites", {}, 500));

			await expect(client.get("/v1/sites")).rejects.toMatchObject({
				status: 500,
				error: "Unknown error occurred",
			});
		});

		it("uses the message field for non-400 failures", async () => {
			server.use(createMockHandler("get", "/v1/sites", { message: "unavailable" }, 503));

			await expect(client.get("/v1/sites")).rejects.toMatchObject({
				status: 503,
				error: "unavailable",
			});
		});

		it("uses a validation fallback when a 400 body has neither field", async () => {
			server.use(createMockHandler("get", "/v1/sites", {}, 400));

			await expect(client.get("/v1/sites")).rejects.toMatchObject({
				status: 400,
				error: "Validation error",
			});
		});

		it("wraps a non-JSON body as a request failure", async () => {
			server.use(
				rest.get("https://api.usefathom.com/v1/account", (_req, res, ctx) => {
					return res(ctx.status(200), ctx.body("not-json"));
				}),
			);

			await expectFailure(client.get("/v1/account"));
		});

		it("wraps network failures as a request failure", async () => {
			server.use(
				rest.get("https://api.usefathom.com/v1/account", (_req, res) => {
					return res.networkError("connection reset");
				}),
			);

			await expectFailure(client.get("/v1/account"));
		});
	});
});
