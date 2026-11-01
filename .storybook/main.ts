import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.tsx"],
  addons: ["@storybook/addon-docs", "storybook-dark-mode"],
  framework: {
    name: "@storybook/react-vite",
    options: {}
  }
};

export default config;
