import { setupServer } from 'msw/node';
import { rest, type RestRequest } from 'msw';

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

async function capture(req: RestRequest): Promise<CapturedRequest> {
  const text = await req.text();
  let body: unknown;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  return {
    method: req.method,
    href: req.url.href,
    origin: req.url.origin,
    pathname: req.url.pathname,
    search: [...req.url.searchParams.entries()],
    authorization: req.headers.get('authorization'),
    accept: req.headers.get('accept'),
    contentType: req.headers.get('content-type'),
    body,
  };
}

function installRecorder(
  requests: CapturedRequest[],
  respond: (index: number) => { status: number; body: any }
) {
  server.use(
    rest.all('*', async (req, res, ctx) => {
      requests.push(await capture(req));
      const { status, body } = respond(requests.length - 1);
      return res(ctx.status(status), ctx.json(body));
    })
  );
}

/**
 * Respond to every request with one JSON payload and record what was sent.
 */
export function recordRequests(response: unknown, status = 200): CapturedRequest[] {
  const requests: CapturedRequest[] = [];
  installRecorder(requests, () => ({ status, body: response }));
  return requests;
}

/**
 * Respond with each payload in order. Further requests repeat the last payload.
 */
export function recordSequence(responses: unknown[], status = 200): CapturedRequest[] {
  const requests: CapturedRequest[] = [];
  installRecorder(requests, (index) => ({
    status,
    body: responses[Math.min(index, responses.length - 1)],
  }));
  return requests;
}

// Helper for creating mock API responses
export function createMockHandler(
  method: 'get' | 'post' | 'delete',
  path: string,
  response: any,
  status = 200
) {
  return rest[method](`https://api.usefathom.com${path}`, (req, res, ctx) => {
    return res(
      ctx.status(status),
      ctx.json(response)
    );
  });
}