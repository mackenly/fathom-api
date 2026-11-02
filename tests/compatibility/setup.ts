import { server } from "../test-setup";

// Preloaded by `bun test` (see bunfig.toml). Vitest starts this server from tests/setup.ts.
server.listen({ onUnhandledRequest: "error" });
