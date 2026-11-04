import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node", // Default to Node.js environment
		globals: true,
		setupFiles: ["./tests/setup.ts"],
		exclude: [...configDefaults.exclude, "**/dist/**"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
		},
	},
});
