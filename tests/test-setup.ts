import { type DefaultBodyType, HttpResponse, http } from "msw";
import { setupServer } from "msw/node";

// This creates a MSW server instance for mocking API responses.
// tests/setup.ts starts and stops it for Vitest.
export const server = setupServer();

export interface CapturedRequest {
	method: string;
	href: string;
	origin: string;
	pathname: string;
	search: Array<[string, string]>;
	authorization: string | null;
	accept: string | null;
	contentType: string | null;
	body: unknown;
}

async function capture(request: Request): Promise<CapturedRequest> {
	const text = await request.text();
	let body: unknown;
	if (text) {
		try {
			body = JSON.parse(text);
		} catch {
			body = text;
		}
	}

	const url = new URL(request.url);

	return {
		method: request.method,
		href: url.href,
		origin: url.origin,
		pathname: url.pathname,
		search: [...url.searchParams.entries()],
		authorization: request.headers.get("authorization"),
		accept: request.headers.get("accept"),
		contentType: request.headers.get("content-type"),
		body,
	};
}

function installRecorder(
	requests: CapturedRequest[],
	respond: (index: number) => { status: number; body: DefaultBodyType },
) {
	server.use(
		http.all("*", async ({ request }) => {
			requests.push(await capture(request.clone()));
			const { status, body } = respond(requests.length - 1);
			return HttpResponse.json(body, { status });
		}),
	);
}

/**
 * Respond to every request with one JSON payload and record what was sent.
 */
export function recordRequests(response: DefaultBodyType, status = 200): CapturedRequest[] {
	const requests: CapturedRequest[] = [];
	installRecorder(requests, () => ({ status, body: response }));
	return requests;
}

/**
 * Respond with each payload in order. Further requests repeat the last payload.
 */
export function recordSequence(responses: DefaultBodyType[], status = 200): CapturedRequest[] {
	const requests: CapturedRequest[] = [];
	installRecorder(requests, (index) => ({
		status,
		body: responses[Math.min(index, responses.length - 1)],
	}));
	return requests;
}

// Helper for creating mock API responses
export function createMockHandler(
	method: "get" | "post" | "delete",
	path: string,
	response: DefaultBodyType,
	status = 200,
) {
	return http[method](`https://api.usefathom.com${path}`, () => {
		return HttpResponse.json(response, { status });
	});
}
