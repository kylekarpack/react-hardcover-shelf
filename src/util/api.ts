import { Book, BookGroup, Props, ShelfQueryData, SortKey, UserBook } from "../types";
import { runQuery } from "./graphql";

/** Map of shelf names to the reading status IDs used by Hardcover */
export const STATUS_IDS: { [shelf: string]: number } = {
  "to-read": 1,
  "want-to-read": 1,
  "currently-reading": 2,
  read: 3,
};

/** The fields to select from each user_books row */
const USER_BOOK_FIELDS = `
  rating
  date_added
  last_read_date
  user_book_reads(order_by: { id: desc }, limit: 1) {
    started_at
    finished_at
  }
  book {
    id
    slug
    title
    subtitle
    description
    pages
    rating
    release_year
    image {
      url
    }
    contributions {
      author {
        name
      }
    }
  }
`;

export const ALL_GROUP_TITLE = "All";

export const fetchAllBooks = async (props: Props): Promise<BookGroup[]> => {
  let books = (await fetchUserBooks(props)).map(rowToBook);

  // Optionally filter the books by search text
  if (props.search) {
    books = books.filter((book) => matchesSearch(book, props.search || ""));
  }

  // Optionally filter the books
  if (props.filter) {
    books = books.filter(props.filter);
  }

  books = sortBooks(books, props.sort || "date_read", props.order);

  if (props.limit) {
    books = books.slice(0, props.limit);
  }

  if (props.groupBy) {
    const grouped = books.reduce((prev: { [key: string]: Book[] }, cur: Book) => {
      const key = String((cur.dateRead || cur.dateAdded)?.getFullYear());
      prev[key] = prev[key] || [];
      prev[key].push(cur);
      return prev;
    }, {});

    const groups: BookGroup[] = [];
    for (const key in grouped) {
      groups.push({
        title: key,
        books: grouped[key],
      });
    }
    groups.sort((a, b) => {
      return Number(b.title) - Number(a.title);
    });
    return groups;
  } else {
    return [
      {
        title: ALL_GROUP_TITLE,
        books,
      },
    ];
  }
};

/** Fetch the books matching the shelf settings from the Hardcover API */
const fetchUserBooks = async (props: Props): Promise<UserBook[]> => {
  if (!props.apiKey && !props.apiUrl) {
    throw new Error('An "apiKey" or "apiUrl" prop is required to fetch from the Hardcover API');
  }

  const statusId = STATUS_IDS[props.shelf || "read"];
  if (statusId === undefined) {
    throw new Error(
      `Unsupported shelf "${props.shelf}". Try "read", "currently-reading", or "to-read"`,
    );
  }

  const limit = props.limit ?? 10;

  // The userId may be a numeric ID or a username; usernames are filtered directly
  // through the user relation so only one request is needed
  let userClause = "";
  if (props.userId) {
    if (Number.isNaN(parseInt(props.userId, 10))) {
      userClause = `user: { username: { _eq: "${escapeGraphQLString(props.userId)}" } }, `;
    } else {
      userClause = `user_id: { _eq: ${parseInt(props.userId, 10)} }, `;
    }
  }

  const where = `{ ${userClause}status_id: { _eq: ${statusId} } }`;
  const userBooks = `user_books(where: ${where}, limit: ${limit}, order_by: { date_added: desc })`;

  // When no user ID is supplied, query the books of the owner of the API key
  const query = props.userId
    ? `{ ${userBooks} { ${USER_BOOK_FIELDS} } }`
    : `{ me { ${userBooks} { ${USER_BOOK_FIELDS} } } }`;

  const data = await runQuery<ShelfQueryData>({
    apiKey: props.apiKey,
    apiUrl: props.apiUrl,
    query,
  });

  return data?.user_books ?? data?.me?.user_books ?? [];
};

/** Escape a string for safe inlining into a GraphQL query */
const escapeGraphQLString = (value: string): string => {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
};

/** Convert a user_books row to a Book for display */
const rowToBook = (row: UserBook): Book => {
  const authors = (row.book.contributions || [])
    .map((contribution) => contribution?.author?.name || "")
    .filter(Boolean);
  const read = row.user_book_reads?.[0];

  return {
    id: String(row.book.id),
    title: row.book.title || "",
    subtitle: row.book.subtitle || "",
    description: row.book.description || "",
    author: authors[0],
    authors: authors.map((name) => ({ name })),
    imageUrl: row.book.image?.url,
    link: `https://hardcover.app/books/${row.book.slug ?? row.book.id}`,
    rating: row.rating,
    avgRating: row.book.rating,
    pages: row.book.pages,
    releaseYear: row.book.release_year,
    dateRead: read?.finished_at
      ? new Date(read.finished_at)
      : row.last_read_date
        ? new Date(row.last_read_date)
        : undefined,
    dateAdded: row.date_added ? new Date(row.date_added) : undefined,
  };
};

const matchesSearch = (book: Book, search: string): boolean => {
  const term = search.toLowerCase();
  const fields = [
    book.title,
    book.subtitle,
    book.author,
    ...(book.authors || []).map((author) => author.name),
  ];
  return fields.some((field) => field?.toLowerCase().includes(term));
};

const SORT_FIELDS: { [key in SortKey]: (book: Book) => number | string | undefined } = {
  title: (book) => book.title?.toLowerCase(),
  author: (book) => book.author?.toLowerCase(),
  rating: (book) => book.rating,
  avg_rating: (book) => book.avgRating,
  date_read: (book) => book.dateRead?.getTime(),
  date_added: (book) => book.dateAdded?.getTime(),
  pages: (book) => book.pages,
};

/** Sort the books client-side, since some sort fields are not directly on user_books */
const sortBooks = (books: Book[], sort: SortKey, order?: "a" | "d"): Book[] => {
  const direction = order === "a" ? 1 : -1;
  const getter = SORT_FIELDS[sort] || SORT_FIELDS.date_read;

  return [...books].sort((a, b) => {
    const first = getter(a);
    const second = getter(b);

    if (typeof first === "string" || typeof second === "string") {
      return String(first || "").localeCompare(String(second || "")) * direction;
    }

    return ((first || 0) - (second || 0)) * direction;
  });
};
