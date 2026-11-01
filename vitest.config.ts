// TEMPORARY config just for running tests on modern Node where
// vite-plugin-dts fails to load; delete after the test run.
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    coverage: {
      reporter: ["lcov", "text", "html"],
      exclude: ["vitest.setup.ts", "**/*.test.{ts,tsx}"],
      provider: "c8",
    },
  },
  plugins: [react()],
});
