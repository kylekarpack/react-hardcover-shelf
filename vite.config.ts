// vp migrate: merged .oxlintrc.json (70071b33518c2408813894b9bc30b90f).
import react from "@vitejs/plugin-react";
import { defineConfig, lazyPlugins } from "vite-plus";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

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
  plugins: lazyPlugins(() => [react(), cssInjectedByJsPlugin()]),
  build: {
    outDir: "./dist",
    lib: {
      entry: "./src/index.ts",
      formats: ["cjs", "es", "umd"],
      fileName: (format) => `index.${format}.js`,
      name: "index",
    },
    minify: "esbuild",
    rolldownOptions: {
      external: ["react", "react-dom"],
      output: {
        // Provide global variables to use in the UMD build for externalized deps
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
        exports: "named",
      },
    },
  },
});
