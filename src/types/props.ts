import { CSSProperties } from "react";
import { Book } from "./book";

/** The fields available for sorting on Hardcover */
export type SortKey = "title" | "author" | "rating" | "avg_rating" | "date_read" | "date_added" | "pages";

type GroupBy = "year";
type Shelf = "read" | "currently-reading" | "to-read" | string;

type HideDetails = { [Property in keyof Book]?: boolean };

type DisplayOptions = {
  hideDetails?: boolean | HideDetails;
  hideBackgroundImages?: boolean;
  gridStyle?: Pick<CSSProperties, "columnGap" | "rowGap">;
};

export type Props = {
  /**
   * An API key generated from a Hardcover account's settings page.
   * A "Bearer" prefix is optional. Either apiKey or apiUrl is required.
   */
  apiKey?: string;
  /**
   * An alternative endpoint for the Hardcover API; useful when running a
   * proxy that keeps the API key server-side.
   */
  apiUrl?: string;
  /** The user ID for whom to fetch books; defaults to the owner of the API key */
  userId?: string;
  /** The shelf from which to fetch books */
  shelf?: Shelf;
  /** Minimum width allowed for each book */
  width?: string | number;
  /** The field by which to sort the results returned */
  sort?: SortKey;
  /** The direction in which to sort the results */
  order?: "a" | "d";
  /** The maximum number of books to be returned */
  limit?: number;
  /** Optional search text; filters fetched books by title and author */
  search?: string;
  /** Shelf display options */
  displayOptions?: DisplayOptions;
  /** Filter book option */
  filter?: (book: Book) => boolean;
  /** Group by option */
  groupBy?: GroupBy;
};
