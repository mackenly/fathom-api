import { expect } from "vitest";
import type { CapturedRequest } from "./test-setup";

export function expectSearch(
	search: Array<[string, string]>,
	expected: Record<string, string | string[]> = {},
) {
	const actual = new Map<string, string[]>();
	for (const [key, value] of search) {
		const values = actual.get(key) ?? [];
		values.push(value);
		actual.set(key, values);
	}

	expect([...actual.keys()].sort()).toEqual(Object.keys(expected).sort());
	for (const [key, value] of Object.entries(expected)) {
		expect(actual.get(key)).toEqual(Array.isArray(value) ? value : [value]);
	}
}

export function expectSingleRequest(
	requests: CapturedRequest[],
	expected: {
		method: string;
		pathname: string;
		origin?: string;
		search?: Record<string, string | string[]>;
		body?: unknown;
		token?: string;
	},
) {
	expect(requests).toHaveLength(1);
	const request = requests[0];
	expect(request.method).toBe(expected.method);
	expect(request.pathname).toBe(expected.pathname);
	expect(request.origin).toBe(expected.origin ?? "https://api.usefathom.com");
	expect(request.authorization).toBe(`Bearer ${expected.token ?? "test-token"}`);
	expect(request.accept).toBe("application/json");
	expect(request.contentType).toBe("application/json");
	expectSearch(request.search, expected.search);
	expect(request.body).toEqual(expected.body);
}
