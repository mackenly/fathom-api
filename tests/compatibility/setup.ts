// Setup global fetch for environments that might not have it
if (typeof globalThis.fetch !== 'function') {
  globalThis.fetch = fetch;
}

// Ensure ReadableStream is available
if (typeof globalThis.ReadableStream !== 'function') {
  globalThis.ReadableStream = ReadableStream;
}

// Setup proper Headers, Request, Response globals
if (typeof globalThis.Headers !== 'function') {
  globalThis.Headers = Headers;
}
if (typeof globalThis.Request !== 'function') {
  globalThis.Request = Request;
}
if (typeof globalThis.Response !== 'function') {
  globalThis.Response = Response;
}