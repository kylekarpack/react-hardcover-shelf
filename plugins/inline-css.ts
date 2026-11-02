/**
 * Rolls every emitted CSS asset into the JS bundles as a runtime `<style>`
 * injection, so the widget ships as a single self-contained file. Idempotent:
 * re-injecting (e.g. two shelf instances) reuses the same element.
 */
export const inlineCssPlugin = (): {
  name: string;
  generateBundle: { order: "post"; handler: RollupGenerateBundle };
} => ({
  name: "rhs-inline-css-injection",
  generateBundle: {
    order: "post",
    handler(_options, bundle) {
      const cssAssets = Object.values(bundle).filter(
        (file): file is { type: "asset"; fileName: string; source: string | Uint8Array } =>
          file.type === "asset" && file.fileName.endsWith(".css"),
      );
      const css = cssAssets.map((file) => String(file.source)).join("\n");
      if (!css) return;

      const inject =
        `;(function(){if(typeof document!=="undefined"&&!document.querySelector('style[data-react-hardcover-shelf]'))` +
        `{var s=document.createElement('style');s.setAttribute('data-react-hardcover-shelf','');` +
        `s.textContent=${JSON.stringify(css)};document.head.appendChild(s)}})();\n`;

      for (const file of Object.values(bundle)) {
        // Only inject into entry chunks; the CSS asset list is emptied below
        if (file.type === "chunk" && file.isEntry) {
          file.code = inject + file.code;
        }
      }

      for (const file of cssAssets) {
        delete bundle[file.fileName];
      }
    },
  },
});

type RollupGenerateBundle = (
  options: unknown,
  bundle: Record<
    string,
    | { type: "chunk"; isEntry: boolean; code: string }
    | { type: "asset"; fileName: string; source: string | Uint8Array }
  >,
) => void | Promise<void>;
