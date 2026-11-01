import { Book } from "./book";

export type BookGroup = {
  title: string;
  books: Book[];
};

/** A book from the Hardcover API */
export type HardcoverBook = {
  id: number;
  slug?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  pages?: number;
  /** The average community rating from 0-5 */
  rating?: number;
  release_year?: number;
  image?: { url?: string };
  contributions?: Array<{ author?: { name: string } } | null>;
};

/** A user_books row from the Hardcover API */
export type UserBook = {
  /** The user's own rating from 0-5 */
  rating?: number;
  date_added?: string;
  /** The most recent completion date */
  last_read_date?: string;
  user_book_reads?: Array<{ started_at?: string; finished_at?: string }>;
  book: HardcoverBook;
};

/** The data shape returned by the shelf query */
export type ShelfQueryData = {
  user_books?: UserBook[] | null;
  me?: { user_books?: UserBook[] | null } | null;
};
