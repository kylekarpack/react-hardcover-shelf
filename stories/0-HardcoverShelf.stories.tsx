import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import HardcoverShelf from "../src";
import { Props } from "../src/types";

const sorts = ["title", "author", "rating", "avg_rating", "date_read", "date_added", "pages"];

const shelves = ["read", "currently-reading", "to-read"];

export default {
  title: "React Hardcover Shelf",
  component: HardcoverShelf,
  argTypes: {
    apiKey: {
      name: "API Key",
      control: {
        type: "text",
      },
    },
    apiUrl: {
      name: "API URL",
      control: {
        type: "text",
      },
    },
    userId: {
      name: "User ID",
      control: {
        type: "text",
      },
    },
    width: {
      name: "Book Width",
      control: {
        type: "number",
        min: 25,
        max: 250,
      },
    },
    hideDetails: {
      name: "Hide Details",
      control: "check",
      options: ["title", "subtitle", "author", "rating"],
    },
    hideBackgroundImages: {
      name: "Hide background images",
      control: "boolean",
    },
    limit: {
      name: "Number of Books",
      control: {
        type: "number",
        min: 1,
        max: 250,
      },
    },
    shelf: {
      name: "Shelf Name",
      control: "select",
      options: shelves,
    },
    sort: {
      name: "Sort Field",
      control: "select",
      options: sorts,
    },
    order: {
      name: "Order",
      control: "inline-radio",
      options: ["a", "d"],
    },
    search: {
      name: "Search Text",
      control: "text",
    },
    displayOptions: {
      table: {
        disable: true,
      },
    },
    filter: {
      table: {
        disable: true,
      },
    },
    groupBy: {
      table: {
        disable: true,
      },
    },
  },
} as Meta<typeof HardcoverShelf>;

/**
 * Storybook component types
 */
type StorybookProps = Props & {
  hideDetails: string[];
  hideBackgroundImages: boolean;
};

// Map from a Storybook control value to component props
const mapHide = (toHide: string[]): Record<string, boolean> => {
  const output = {};
  for (let key of toHide || []) {
    output[key] = true;
  }

  return output;
};

// Get the display options from Storybook control values
const getDisplayOptions = (args: StorybookProps) => {
  return {
    hideDetails: mapHide(args.hideDetails),
    hideBackgroundImages: args.hideBackgroundImages,
  };
};

const Template: StoryFn<StorybookProps> = (args) => {
  const displayOptions = getDisplayOptions(args);
  return <HardcoverShelf {...args} displayOptions={displayOptions} />;
};

const Primary: StoryFn<StorybookProps> = Template.bind({});
Primary.args = {
  apiKey: "YOUR_API_KEY",
  userId: "10714",
  width: 100,
  limit: 12,
  shelf: "read",
  sort: "date_read",
  order: "d",
  search: "",
};

export const MinimalShelf: StoryFn<StorybookProps> = Template.bind({});
MinimalShelf.args = {
  ...Primary.args,
  hideDetails: ["title", "subtitle", "author", "rating"],
  limit: 20,
};

export const StandardShelf: StoryFn<StorybookProps> = Template.bind({});
StandardShelf.args = {
  ...Primary.args,
  hideDetails: ["rating"],
  width: 130,
};

export const GroupedShelf: StoryFn<StorybookProps> = Template.bind({});
GroupedShelf.args = {
  ...Primary.args,
  width: 130,
  groupBy: "year",
  limit: 100,
};
