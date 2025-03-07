# Fathom Analytics API SDK

A fully-typed unofficial TypeScript SDK for interacting with the [Fathom Analytics API](https://usefathom.com/api). Works in any JavaScript runtime environment that supports the Fetch API, including browsers, Node.js (v18+), Bun, Deno, Cloudflare Workers, and more.

## Features

- 🔒 Full TypeScript support with accurate type definitions
- 🚀 Support for all Fathom Analytics API endpoints (as of writing)
- 📊 Detailed response types for all API resources
- 🔄 Promise-based API with async/await support
- 📈 Smart pagination for listing resources
- 🔍 Comprehensive methods for sites, events, reports, and more
- ⚡ Works in any JavaScript runtime with Fetch API support
- 🔮 Full support for current API capabilities and versioning for future proofing

## Installation
Use your favorite package manager and registry ([npm](https://www.npmjs.com/package/@mackenly/fathom-api), [jsr](https://jsr.io/@mackenly/fathom-api), and [GitHub Packages](https://github.com/users/mackenly/packages/npm/package/fathom-api)) to install the package:
```bash
npm install @mackenly/fathom-api
```
```bash
yarn add @mackenly/fathom-api
```
```bash
pnpm add @mackenly/fathom-api
```
```bash
deno add jsr:@mackenly/fathom-api
```
```typescript
import * as fathom_api from "jsr:@mackenly/fathom-api";
```
```bash
bun add @mackenly/fathom-api
```


## Quick Start
[Get an API token from your Fathom Analytics account settings](https://app.usefathom.com/api) and use it to create a new client.

> [!WARNING]  
> Use permissions to restrict the API token to only the necessary operations (ex: `Admin`, `All sites (read only)`, `Site specific`)

```typescript
import FathomApi from '@mackenly/fathom-api';

// Create a new client with your API token
const fathom = new FathomApi({
  token: 'your-api-token',
  // Optional parameters
  // version: 'v1',
  // baseUrl: 'https://api.usefathom.com'
});

// Example: Get account information
async function getAccountInfo() {
  try {
    const account = await fathom.api.account.get();
    console.log('Account:', account);
  } catch (error) {
    if (error instanceof FathomApiError) {
      console.error('API Error:', error.message);
    } else {
      console.error('Error:', error);
    }
  }
}

getAccountInfo();
```

## Usage Examples

### Managing Sites

```typescript
// List all sites
const sites = await fathom.api.getAllSites();

// Get a specific site
const site = await fathom.api.sites.get('SITEID');

// Create a new site
const newSite = await fathom.api.sites.create({
  name: 'My New Website'
});

// Update a site
const updatedSite = await fathom.api.sites.update('SITEID', {
  name: 'Updated Website Name',
  sharing: 'private',
  share_password: 'password123'
});

// Wipe site data
const wipedSite = await fathom.api.sites.wipe('SITEID');

// Delete a site
const deletedSite = await fathom.api.sites.delete('SITEID');
```

### Working with Events

```typescript
// List all events for a site
const events = await fathom.api.getAllEvents('SITEID');

// Get a specific event
const event = await fathom.api.events('SITEID').get('EVENT_ID');

// Create a new event
const newEvent = await fathom.api.events('SITEID').create({
  name: 'Newsletter Signup'
});

// Update an event
const updatedEvent = await fathom.api.events('SITEID').update('EVENT_ID', {
  name: 'Updated Event Name'
});

// Wipe event data
const wipedEvent = await fathom.api.events('SITEID').wipe('EVENT_ID');

// Delete an event
const deletedEvent = await fathom.api.events('SITEID').delete('EVENT_ID');
```

### Generating Reports

```typescript
// Get aggregation report for pageviews
const pageviewReport = await fathom.api.reports.aggregation({
  entity: 'pageview',
  entity_id: 'SITEID',
  aggregates: 'visits,uniques,pageviews',
  date_grouping: 'day',
  field_grouping: 'pathname',
  date_from: '2022-01-01',
  date_to: '2022-01-31',
  filters: [
    {
      property: 'pathname',
      operator: 'is',
      value: '/blog'
    }
  ]
});

// Get aggregation report for events
const eventReport = await fathom.api.reports.aggregation({
  entity: 'event',
  entity_id: 'EVENT_ID',
  aggregates: 'conversions,unique_conversions',
  date_grouping: 'month'
});

// Get current visitors
const currentVisitors = await fathom.api.reports.currentVisitors({
  site_id: 'SITEID',
  detailed: true
});
```

### Using Different API Versions

This SDK is designed to support potential future API versions. The default version and, as of writing, the only version is v1, but you can specify a different version when creating the client or accessing the API:

```typescript
// Specify version at initialization
const fathom = new FathomApi({
  token: 'your-api-token',
  version: 'v1'
});

// Or access a specific version after initialization
const v1 = fathom.version('v1');
```

## API Reference

### Client Initialization

```typescript
new FathomApi(options: {
  token: string;          // Your Fathom API token
  version?: 'v1';         // API version to use (default: 'v1')
  baseUrl?: string;       // API base URL (default: 'https://api.usefathom.com')
})
```

### Resources

- `.api.account` - Account operations
- `.api.sites` - Site operations
- `.api.events(siteId)` - Event operations for a specific site
- `.api.reports` - Report generation
- `.api.*` - Variety of convenience methods for common operations

## Error Handling

The SDK throws `FathomApiError` instances for API errors. These include an `error` property with the error message from the API and a `status` property with the HTTP status code:

```typescript
import { FathomApi, FathomApiError } from '@mackenly/fathom-api';

try {
  const result = await fathom.api.sites.get('non-existent-site');
} catch (error) {
  if (error instanceof FathomApiError) {
    console.error(`API Error (${error.status}):`, error.error);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Pagination

List operations support pagination parameters:

```typescript
const firstTwentySites = await fathom.api.sites.list({ limit: 20 });
```
Or to get all sites with automatic pagination:

```typescript
const allSites = await fathom.api.getAllSites();
```

## Proxy Example
If you're using this browser in frontend code or other applications where you might want to not include your API key, you can create a server-side request proxy to forward requests to the Fathom API, validate incoming API keys, and add your Fathom API key for the actual request to Fathom. Here's an example:

In your client side code:
```typescript
const fathom = new FathomApi({
  token: 'temp_token',
  baseUrl: 'https://your-proxy-server.com'
});
```

A Cloudflare Worker:
```typescript
export default {
  async fetch(request) {
    // Only allow GET requests for this example
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 });
    }

    const url = new URL(request.url);
    const targetUrl = new URL(url.pathname + url.search, 'https://api.usefathom.com');
    const newHeaders = new Headers(request.headers);
    let authHeader = newHeaders.get('Authorization');

    // Modify this to validate incoming API keys (perhaps from a database)
    if (authHeader && authHeader.includes('temp_token')) {
      authHeader = authHeader.replace('temp_token', 'real_token');
      newHeaders.set('Authorization', authHeader);
    }

    return await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: newHeaders,
    });
  }
}
```

## Compatibility

This library is tested for compatibility with:
- Node.js 18+
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Cloudflare Workers
- Bun
- Deno

> [!WARNING]  
> If running in a browser environment or anywhere that users could access the API token, it is recommended to use a server-side proxy to keep the token secure rather than exposing it directly in client-side code.

The library uses standard Web APIs and modern JavaScript features that are widely supported across JavaScript environments.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](./LICENSE)

This project is not affiliated with, part of, or endorsed by Fathom Analytics or Conva Ventures Inc. For Fathom issues or support requests not related to this package, please contact the Fathom team directly. For enterprise support for this package, please contact [Tricities Media Group](https://tricitiesmediagroup.com).