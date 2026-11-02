// vp migrate: merged .oxlintrc.json (70071b33518c2408813894b9bc30b90f).
import react from "@vitejs/plugin-react";
import { defineConfig, lazyPlugins } from "vite-plus";
import { inlineCssPlugin } from "./plugins/inline-css";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {
    ignorePatterns: [],
  },
  lint: {
    plugins: ["typescript", "unicorn", "oxc"],
    categories: {
      correctness: "error",
    },
    rules: {
      "vite-plus/prefer-vite-plus-imports": "error",
    },
    env: {
      builtin: true,
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [
      {
        name: "vite-plus",
        specifier: "vite-plus/oxlint-plugin",
      },
    ],
  },
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: "./vitest.setup.ts",
    coverage: {
      reporter: ["lcov", "text", "html"],
      exclude: ["vitest.setup.ts", "**/*.test.{ts,tsx}"],
      provider: "v8",
    },
  },
  plugins: lazyPlugins(() => [react()]),
  pack: {
    entry: "./src/index.ts",
    format: ["esm", "cjs"],
    dts: true,
    minify: true,
    platform: "browser",
    target: "es2020",
    plugins: [inlineCssPlugin()],
    outputOptions: {
      // Keep named + default exports addressable in the CJS build
      exports: "named",
    },
  },
});
